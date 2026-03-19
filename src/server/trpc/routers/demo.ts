import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import {
  mockStations,
  mockStationItems,
  mockItems,
  mockErpInventory,
  mockPurchaseOrders,
  mockPurchaseOrderLines,
} from "@/lib/mock-data";
import { TRPCError } from "@trpc/server";

// In-memory sales orders store
const mockSalesOrders: Array<{
  id: string;
  soNumber: string;
  customerId: string;
  stationId: string;
  stationName: string;
  vendingPO: string;
  status: "OPEN" | "SHIPPED" | "CLOSED";
  orderDate: Date;
  lines: Array<{
    id: string;
    itemId: string;
    partNumber: string;
    description: string;
    orderQty: number;
  }>;
}> = [];

let salesOrderCounter = 1;

export const demoRouter = router({
  // 1. Issue (dispense) an item from a vending machine
  issueItem: publicProcedure
    .input(
      z.object({
        stationItemId: z.string(),
        quantity: z.number().int().positive(),
        userId: z.string().optional(),
        jobNumber: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      const stationItem = mockStationItems.find(
        (si) => si.id === input.stationItemId
      );

      if (!stationItem) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Station item ${input.stationItemId} not found`,
        });
      }

      if (stationItem.quantityOnHand < input.quantity) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Insufficient quantity. On hand: ${stationItem.quantityOnHand}, requested: ${input.quantity}`,
        });
      }

      stationItem.quantityOnHand -= input.quantity;
      stationItem.lastUpdated = new Date();

      return stationItem;
    }),

  // 2. Create a purchase order in the demo ERP
  createPurchaseOrder: publicProcedure
    .input(
      z.object({
        supplierId: z.string(),
        supplierName: z.string(),
        lines: z.array(
          z.object({
            itemId: z.string(),
            quantityOrdered: z.number().int().positive(),
            unitCost: z.number().optional(),
          })
        ),
        expectedDeliveryDate: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      const poNumber = `PO-2026-${String(mockPurchaseOrders.length + 1).padStart(4, "0")}`;
      const now = new Date();

      const po = {
        id: `po-${mockPurchaseOrders.length + 1}`,
        poNumber,
        supplierId: input.supplierId,
        supplierName: input.supplierName,
        orderDate: now,
        expectedDeliveryDate: input.expectedDeliveryDate
          ? new Date(input.expectedDeliveryDate)
          : new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        status: "OPEN" as const,
      };

      mockPurchaseOrders.push(po);

      const createdLines = input.lines.map((line, idx) => {
        const item = mockItems.find((i) => i.id === line.itemId);

        const poLine = {
          id: `pol-${mockPurchaseOrderLines.length + idx + 1}`,
          purchaseOrderId: po.id,
          itemId: line.itemId,
          quantityOrdered: line.quantityOrdered,
          quantityReceived: 0,
          unitCost: line.unitCost ?? 0,
          purchaseOrder: po,
          item: item!,
        };

        mockPurchaseOrderLines.push(poLine);

        // Update ERP inventory quantityOnOrder for MAIN branch
        const erpRecord = mockErpInventory.find(
          (inv) => inv.itemId === line.itemId && inv.branchId === "MAIN"
        );
        if (erpRecord) {
          erpRecord.quantityOnOrder += line.quantityOrdered;
        }

        return poLine;
      });

      return { ...po, lines: createdLines };
    }),

  // 3. Create a sales order in the demo ERP
  createSalesOrder: publicProcedure
    .input(
      z.object({
        customerId: z.string(),
        stationId: z.string(),
        vendingPO: z.string(),
        items: z.array(
          z.object({
            itemId: z.string(),
            partNumber: z.string(),
            description: z.string(),
            orderQty: z.number().int().positive(),
          })
        ),
      })
    )
    .mutation(({ input }) => {
      const soNumber = `SO-2026-${String(salesOrderCounter++).padStart(7, "0")}`;
      const now = new Date();

      const station = mockStations.find(s => s.id === input.stationId);
      const salesOrder = {
        id: `so-${mockSalesOrders.length + 1}`,
        soNumber,
        customerId: input.customerId,
        stationId: input.stationId,
        stationName: station?.name ?? input.stationId,
        vendingPO: input.vendingPO,
        status: "OPEN" as const,
        orderDate: now,
        lines: input.items.map((item, idx) => ({
          id: `sol-${mockSalesOrders.length + 1}-${idx + 1}`,
          itemId: item.itemId,
          partNumber: item.partNumber,
          description: item.description,
          orderQty: item.orderQty,
        })),
      };

      // Decrement ERP inventory (MAIN branch) and increase station item quantityOnOrder
      for (const item of input.items) {
        const erpRecord = mockErpInventory.find(
          (inv) => inv.itemId === item.itemId && inv.branchId === "MAIN"
        );
        if (erpRecord) {
          erpRecord.quantityOnHand = Math.max(
            0,
            erpRecord.quantityOnHand - item.orderQty
          );
        }

        // Increase quantityOnOrder on station items for the given station
        const stationItem = mockStationItems.find(
          (si) =>
            si.stationId === input.stationId && si.itemId === item.itemId
        );
        if (stationItem) {
          stationItem.quantityOnOrder += item.orderQty;
        }
      }

      mockSalesOrders.push(salesOrder);

      return salesOrder;
    }),

  // 4. Get all orders/sales orders for a customer
  getOrders: publicProcedure
    .input(z.object({ customerId: z.string() }))
    .query(({ input }) => {
      return mockSalesOrders
        .filter((so) => so.customerId === input.customerId)
        .sort(
          (a, b) => b.orderDate.getTime() - a.orderDate.getTime()
        );
    }),

  // 5. Get stations with items for the vending simulator UI
  getVendingStationsForDemo: publicProcedure
    .input(z.object({ customerId: z.string().optional() }).optional())
    .query(({ input }) => {
      let stations = mockStations;

      if (input?.customerId) {
        stations = stations.filter(
          (s) => s.customerId === input.customerId
        );
      }

      return stations.map((s) => ({
        ...s,
        stationItems: s.stationItems,
      }));
    }),

  // 6. Get items available for creating a PO
  getItemsForPO: publicProcedure.query(() => {
    return mockItems.map((item) => ({
      id: item.id,
      partNumber: item.partNumber,
      description: item.description,
      standardPackQty: item.standardPackQty,
      category: item.category,
    }));
  }),

  // 7. Get suppliers for PO creation dropdown
  getSuppliers: publicProcedure.query(() => {
    return [
      {
        id: "SUP001",
        name: "Industrial Supply Co",
        leadTimeDays: 7,
      },
      {
        id: "SUP002",
        name: "Tool Warehouse",
        leadTimeDays: 14,
      },
      {
        id: "SUP003",
        name: "Safety Products Inc",
        leadTimeDays: 5,
      },
    ];
  }),

  // 8. Receive items against a PO in the demo ERP
  receivePurchaseOrder: publicProcedure
    .input(
      z.object({
        purchaseOrderId: z.string(),
        lines: z.array(
          z.object({
            lineId: z.string(),
            quantityReceived: z.number().int().nonnegative(),
          })
        ),
      })
    )
    .mutation(({ input }) => {
      const po = mockPurchaseOrders.find(
        (p) => p.id === input.purchaseOrderId
      );

      if (!po) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Purchase order ${input.purchaseOrderId} not found`,
        });
      }

      for (const receiveLine of input.lines) {
        if (receiveLine.quantityReceived === 0) continue;

        const poLine = mockPurchaseOrderLines.find(
          (l) =>
            l.id === receiveLine.lineId &&
            l.purchaseOrderId === input.purchaseOrderId
        );

        if (!poLine) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `PO line ${receiveLine.lineId} not found`,
          });
        }

        poLine.quantityReceived += receiveLine.quantityReceived;

        // Increase ERP inventory MAIN branch quantityOnHand
        const erpRecord = mockErpInventory.find(
          (inv) =>
            inv.itemId === poLine.itemId && inv.branchId === "MAIN"
        );
        if (erpRecord) {
          erpRecord.quantityOnHand += receiveLine.quantityReceived;
          erpRecord.quantityOnOrder = Math.max(
            0,
            erpRecord.quantityOnOrder - receiveLine.quantityReceived
          );
        }
      }

      // Determine PO status: check all lines for this PO
      const allPoLines = mockPurchaseOrderLines.filter(
        (l) => l.purchaseOrderId === po.id
      );
      const allFullyReceived = allPoLines.every(
        (l) => l.quantityReceived >= l.quantityOrdered
      );
      const anyReceived = allPoLines.some((l) => l.quantityReceived > 0);

      if (allFullyReceived) {
        (po as { status: string }).status = "CLOSED";
      } else if (anyReceived) {
        (po as { status: string }).status = "PARTIAL";
      }

      return {
        ...po,
        lines: allPoLines,
      };
    }),

  // 9. Update ERP inventory fields (QOH, reorder point)
  updateErpInventory: publicProcedure
    .input(
      z.object({
        inventoryId: z.string(),
        quantityOnHand: z.number().int().nonnegative().optional(),
        reorderPoint: z.number().int().nonnegative().optional(),
      })
    )
    .mutation(({ input }) => {
      const record = mockErpInventory.find((inv) => inv.id === input.inventoryId);

      if (!record) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Inventory record ${input.inventoryId} not found`,
        });
      }

      if (input.quantityOnHand !== undefined) {
        record.quantityOnHand = input.quantityOnHand;
      }
      if (input.reorderPoint !== undefined) {
        record.reorderPoint = input.reorderPoint;
      }

      return record;
    }),

  // 10. Get SO line items that have not been covered by a PO yet
  getUnpurchasedSOItems: publicProcedure.query(() => {
    // Aggregate total qty ordered across all open SO lines, grouped by itemId
    const soQtyByItem = new Map<string, number>();
    for (const so of mockSalesOrders) {
      if (so.status === "CLOSED") continue;
      for (const line of so.lines) {
        soQtyByItem.set(line.itemId, (soQtyByItem.get(line.itemId) ?? 0) + line.orderQty);
      }
    }

    // Aggregate total qty ordered (not yet received) across all open PO lines, grouped by itemId
    const poQtyByItem = new Map<string, number>();
    for (const pol of mockPurchaseOrderLines) {
      const po = mockPurchaseOrders.find((p) => p.id === pol.purchaseOrderId);
      if (!po || (po.status as string) === "CLOSED" || (po.status as string) === "CANCELLED") continue;
      const remaining = pol.quantityOrdered - pol.quantityReceived;
      if (remaining > 0) {
        poQtyByItem.set(pol.itemId, (poQtyByItem.get(pol.itemId) ?? 0) + remaining);
      }
    }

    // Find items where SO qty > PO qty (need to purchase more)
    const result: Array<{
      itemId: string;
      partNumber: string;
      description: string;
      soQty: number;
      poQty: number;
      needQty: number;
    }> = [];

    for (const [itemId, soQty] of soQtyByItem) {
      const poQty = poQtyByItem.get(itemId) ?? 0;
      const needQty = soQty - poQty;
      if (needQty > 0) {
        const item = mockItems.find((i) => i.id === itemId);
        if (item) {
          result.push({
            itemId,
            partNumber: item.partNumber,
            description: item.description,
            soQty,
            poQty,
            needQty,
          });
        }
      }
    }

    return result.sort((a, b) => a.partNumber.localeCompare(b.partNumber));
  }),
});
