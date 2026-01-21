import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { calculateMinMax, calculateWarehouseBackup } from "@/server/services/calculation";
import { mockCustomers, mockItems, getMockRecommendations, setMockRecommendations, clearMockRecommendations } from "@/lib/mock-data";

const isDemoMode = process.env.DEMO_MODE === "true";

// Mock average daily usage rates for demo mode
const mockUsageRates: Record<string, number> = {
  "item-1": 12,   // GLV-NIT-LG - High usage
  "item-2": 0.8,  // SAF-GLAS-CLR - Moderate
  "item-3": 1.5,  // CUT-BLD-5PK - Regular
  "item-4": 2,    // DRL-BIT-1/4 - Moderate
  "item-5": 1.2,  // TAPE-ELEC-BLK - Regular
  "item-6": 0.5,  // LUBE-WD40-12 - Low
};

export const recommendationsRouter = router({
  // Generate recommendations for a customer
  generate: publicProcedure
    .input(
      z.object({
        customerId: z.string(),
        usageDays: z.number().default(90),
        supplierLeadTimeDays: z.number().default(14),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (isDemoMode) {
        const customer = mockCustomers.find(c => c.id === input.customerId);
        if (!customer) return [];

        // Clear existing recommendations for this customer
        clearMockRecommendations(input.customerId);

        const newRecs: ReturnType<typeof getMockRecommendations> = [];

        for (const station of customer.vendingStations) {
          for (const si of station.stationItems) {
            const avgDailyUsage = mockUsageRates[si.itemId] || 1;

            // Calculate recommended min/max
            const { recommendedMin, recommendedMax } = calculateMinMax(
              avgDailyUsage,
              si.packageQty
            );

            // Calculate warehouse backup
            const warehouseBackupQty = calculateWarehouseBackup(
              avgDailyUsage,
              input.supplierLeadTimeDays,
              si.packageQty
            );

            const item = mockItems.find(i => i.id === si.itemId)!;

            newRecs.push({
              id: `rec-${station.id}-${si.itemId}-${Date.now()}`,
              customerId: input.customerId,
              itemId: si.itemId,
              stationId: station.id,
              avgDailyUsage,
              usageDays: input.usageDays,
              currentMin: si.currentMin,
              currentMax: si.currentMax,
              currentQtyOnHand: si.quantityOnHand,
              packageQty: si.packageQty,
              recommendedMin,
              recommendedMax,
              warehouseBackupQty,
              supplierLeadTimeDays: input.supplierLeadTimeDays,
              status: "PENDING" as const,
              appliedAt: null,
              createdAt: new Date(),
              updatedAt: new Date(),
              item,
            });
          }
        }

        setMockRecommendations([...getMockRecommendations(), ...newRecs]);
        return newRecs;
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.usageDays);

      // Get all station items for this customer with usage data
      const stations = await ctx.prisma.vendingStation.findMany({
        where: { customerId: input.customerId },
        include: {
          stationItems: {
            include: {
              item: true,
              usage: {
                where: { transactionAt: { gte: startDate } },
              },
            },
          },
        },
      });

      const recommendations = [];

      for (const station of stations) {
        for (const stationItem of station.stationItems) {
          // Calculate total usage and average daily usage
          const totalUsage = stationItem.usage.reduce(
            (sum, u) => sum + u.quantity,
            0
          );
          const avgDailyUsage = totalUsage / input.usageDays;

          // Skip items with no usage
          if (avgDailyUsage === 0) continue;

          // Calculate recommended min/max
          const { recommendedMin, recommendedMax } = calculateMinMax(
            avgDailyUsage,
            stationItem.packageQty
          );

          // Calculate warehouse backup
          const warehouseBackupQty = calculateWarehouseBackup(
            avgDailyUsage,
            input.supplierLeadTimeDays,
            stationItem.packageQty
          );

          recommendations.push({
            customerId: input.customerId,
            itemId: stationItem.itemId,
            stationId: station.id,
            avgDailyUsage,
            usageDays: input.usageDays,
            currentMin: stationItem.currentMin,
            currentMax: stationItem.currentMax,
            currentQtyOnHand: stationItem.quantityOnHand,
            packageQty: stationItem.packageQty,
            recommendedMin,
            recommendedMax,
            warehouseBackupQty,
            supplierLeadTimeDays: input.supplierLeadTimeDays,
          });
        }
      }

      // Delete existing pending recommendations for this customer
      await ctx.prisma.recommendation.deleteMany({
        where: { customerId: input.customerId, status: "PENDING" },
      });

      // Create new recommendations
      if (recommendations.length > 0) {
        await ctx.prisma.recommendation.createMany({
          data: recommendations,
        });
      }

      return ctx.prisma.recommendation.findMany({
        where: { customerId: input.customerId, status: "PENDING" },
        include: { item: true },
        orderBy: { item: { partNumber: "asc" } },
      });
    }),

  // Get recommendations for a customer
  getByCustomer: publicProcedure
    .input(
      z.object({
        customerId: z.string(),
        status: z.enum(["PENDING", "APPROVED", "APPLIED", "REJECTED"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (isDemoMode) {
        let recs = getMockRecommendations().filter(r => r.customerId === input.customerId);
        if (input.status) {
          recs = recs.filter(r => r.status === input.status);
        }
        return recs;
      }
      return ctx.prisma.recommendation.findMany({
        where: {
          customerId: input.customerId,
          ...(input.status && { status: input.status }),
        },
        include: { item: true },
        orderBy: { createdAt: "desc" },
      });
    }),

  // Update recommendation status
  updateStatus: publicProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["APPROVED", "APPLIED", "REJECTED"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (isDemoMode) {
        const recs = getMockRecommendations();
        const rec = recs.find(r => r.id === input.id);
        if (rec) {
          rec.status = input.status;
          if (input.status === "APPLIED") rec.appliedAt = new Date();
        }
        return rec;
      }
      return ctx.prisma.recommendation.update({
        where: { id: input.id },
        data: {
          status: input.status,
          ...(input.status === "APPLIED" && { appliedAt: new Date() }),
        },
      });
    }),

  // Bulk update recommendation status
  bulkUpdateStatus: publicProcedure
    .input(
      z.object({
        ids: z.array(z.string()),
        status: z.enum(["APPROVED", "APPLIED", "REJECTED"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (isDemoMode) {
        const recs = getMockRecommendations();
        recs.forEach(r => {
          if (input.ids.includes(r.id)) {
            r.status = input.status;
            if (input.status === "APPLIED") r.appliedAt = new Date();
          }
        });
        return { count: input.ids.length };
      }
      return ctx.prisma.recommendation.updateMany({
        where: { id: { in: input.ids } },
        data: {
          status: input.status,
          ...(input.status === "APPLIED" && { appliedAt: new Date() }),
        },
      });
    }),
});
