import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { mockErpInventory, mockPurchaseOrderLines, mockPurchaseOrders, mockCustomers, mockItems } from "@/lib/mock-data";

const isDemoMode = process.env.DEMO_MODE === "true";

export const erpRouter = router({
  // Get ERP inventory for an item across all branches
  getItemInventory: publicProcedure
    .input(z.object({ itemId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (isDemoMode) {
        const inv = mockErpInventory.filter(i => i.itemId === input.itemId);
        return inv.map(i => ({ ...i, item: mockItems.find(it => it.id === i.itemId)! }));
      }
      return ctx.prisma.erpInventory.findMany({
        where: { itemId: input.itemId },
        include: { item: true },
        orderBy: { branchName: "asc" },
      });
    }),

  // Get all inventory for a branch
  getBranchInventory: publicProcedure
    .input(z.object({ branchId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (isDemoMode) {
        const inv = mockErpInventory.filter(i => i.branchId === input.branchId);
        return inv.map(i => ({ ...i, item: mockItems.find(it => it.id === i.itemId)! }));
      }
      return ctx.prisma.erpInventory.findMany({
        where: { branchId: input.branchId },
        include: { item: true },
        orderBy: { item: { partNumber: "asc" } },
      });
    }),

  // Get purchase orders for an item
  getItemPurchaseOrders: publicProcedure
    .input(z.object({ itemId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (isDemoMode) {
        return mockPurchaseOrderLines.filter(pol => pol.itemId === input.itemId);
      }
      return ctx.prisma.purchaseOrderLine.findMany({
        where: {
          itemId: input.itemId,
          purchaseOrder: {
            status: { in: ["OPEN", "PARTIAL"] },
          },
        },
        include: {
          purchaseOrder: true,
          item: true,
        },
        orderBy: { purchaseOrder: { expectedDeliveryDate: "asc" } },
      });
    }),

  // Get all open purchase orders
  getOpenPurchaseOrders: publicProcedure.query(async ({ ctx }) => {
    if (isDemoMode) {
      return mockPurchaseOrders.map(po => ({
        ...po,
        lines: mockPurchaseOrderLines.filter(l => l.purchaseOrderId === po.id),
      }));
    }
    return ctx.prisma.purchaseOrder.findMany({
      where: { status: { in: ["OPEN", "PARTIAL"] } },
      include: {
        lines: {
          include: { item: true },
        },
      },
      orderBy: { expectedDeliveryDate: "asc" },
    });
  }),

  // Get supplier information
  getSuppliers: publicProcedure.query(async ({ ctx }) => {
    if (isDemoMode) {
      return [
        { id: "sup-1", code: "SUP001", name: "Industrial Supply Co", leadTimeDays: 7, createdAt: new Date(), updatedAt: new Date() },
        { id: "sup-2", code: "SUP002", name: "Tool Warehouse", leadTimeDays: 14, createdAt: new Date(), updatedAt: new Date() },
        { id: "sup-3", code: "SUP003", name: "Safety Products Inc", leadTimeDays: 5, createdAt: new Date(), updatedAt: new Date() },
      ];
    }
    return ctx.prisma.supplier.findMany({
      orderBy: { name: "asc" },
    });
  }),

  // Get inventory summary for items in a customer's vending stations
  getCustomerItemsInventory: publicProcedure
    .input(z.object({ customerId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (isDemoMode) {
        const customer = mockCustomers.find(c => c.id === input.customerId);
        if (!customer) return { erpInventory: [], purchaseOrders: [] };

        const itemIds = new Set<string>();
        customer.vendingStations.forEach(s => {
          s.stationItems.forEach(si => itemIds.add(si.itemId));
        });

        const erpInventory = mockErpInventory
          .filter(i => itemIds.has(i.itemId))
          .map(i => ({ ...i, item: mockItems.find(it => it.id === i.itemId)! }));

        const purchaseOrders = mockPurchaseOrderLines.filter(pol => itemIds.has(pol.itemId));

        return { erpInventory, purchaseOrders };
      }

      // Get all items in customer's vending stations
      const stations = await ctx.prisma.vendingStation.findMany({
        where: { customerId: input.customerId },
        include: {
          stationItems: {
            include: { item: true },
          },
        },
      });

      const itemIds = [
        ...new Set(
          stations.flatMap((s) => s.stationItems.map((si) => si.itemId))
        ),
      ];

      // Get ERP inventory and POs for these items
      const [erpInventory, purchaseOrders] = await Promise.all([
        ctx.prisma.erpInventory.findMany({
          where: { itemId: { in: itemIds } },
          include: { item: true },
        }),
        ctx.prisma.purchaseOrderLine.findMany({
          where: {
            itemId: { in: itemIds },
            purchaseOrder: { status: { in: ["OPEN", "PARTIAL"] } },
          },
          include: {
            purchaseOrder: true,
            item: true,
          },
        }),
      ]);

      return {
        erpInventory,
        purchaseOrders,
      };
    }),
});
