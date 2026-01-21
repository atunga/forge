import { z } from "zod";
import { router, publicProcedure } from "../trpc";

export const vendingRouter = router({
  // Get station items with all required vending data
  getStationItems: publicProcedure
    .input(z.object({ stationId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.stationItem.findMany({
        where: { stationId: input.stationId },
        include: {
          item: true,
          station: {
            include: { customer: true },
          },
        },
        orderBy: { item: { partNumber: "asc" } },
      });
    }),

  // Get all stations for a customer
  getCustomerStations: publicProcedure
    .input(z.object({ customerId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.vendingStation.findMany({
        where: { customerId: input.customerId },
        include: {
          stationItems: {
            include: { item: true },
          },
          _count: {
            select: { stationItems: true },
          },
        },
        orderBy: { name: "asc" },
      });
    }),

  // Get usage history for a station item
  getUsageHistory: publicProcedure
    .input(
      z.object({
        stationItemId: z.string(),
        days: z.number().default(90),
      })
    )
    .query(async ({ ctx, input }) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      return ctx.prisma.usageTransaction.findMany({
        where: {
          stationItemId: input.stationItemId,
          transactionAt: { gte: startDate },
        },
        orderBy: { transactionAt: "desc" },
      });
    }),

  // Get aggregated usage for a customer's items
  getCustomerUsageSummary: publicProcedure
    .input(
      z.object({
        customerId: z.string(),
        days: z.number().default(90),
      })
    )
    .query(async ({ ctx, input }) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

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

      // Calculate usage summary per station item
      return stations.map((station) => ({
        station,
        items: station.stationItems.map((si) => {
          const totalUsage = si.usage.reduce((sum, u) => sum + u.quantity, 0);
          const avgDailyUsage = totalUsage / input.days;
          return {
            stationItem: si,
            totalUsage,
            avgDailyUsage,
            usageDays: input.days,
          };
        }),
      }));
    }),
});
