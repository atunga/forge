/**
 * Mock adapters for development and testing
 * These provide realistic sample data without requiring external connections
 */

import type {
  VendingAdapter,
  ErpAdapter,
  VendingStationData,
  VendingItemData,
  VendingUsageData,
  ErpInventoryData,
  ErpPurchaseOrderData,
  ErpSupplierData,
} from "../types";

// Sample data generators
function generateUsageHistory(
  stationExternalId: string,
  partNumber: string,
  avgDailyUsage: number,
  startDate: Date,
  endDate: Date
): VendingUsageData[] {
  const usage: VendingUsageData[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    // Simulate daily usage with some randomness
    const dailyUsage = Math.max(
      0,
      Math.round(avgDailyUsage * (0.5 + Math.random()))
    );

    if (dailyUsage > 0) {
      // Spread usage throughout the day
      const transactions = Math.floor(Math.random() * 3) + 1;
      const qtyPerTransaction = Math.ceil(dailyUsage / transactions);

      for (let i = 0; i < transactions; i++) {
        const txDate = new Date(currentDate);
        txDate.setHours(8 + Math.floor(Math.random() * 8));
        txDate.setMinutes(Math.floor(Math.random() * 60));

        usage.push({
          stationExternalId,
          partNumber,
          quantity: qtyPerTransaction,
          transactionAt: txDate,
          userId: `USER${Math.floor(Math.random() * 10) + 1}`,
          jobNumber: `JOB-${Math.floor(Math.random() * 1000)}`,
        });
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return usage;
}

export class MockVendingAdapter implements VendingAdapter {
  readonly name = "Mock Vending System";
  readonly type = "OTHER" as const;
  private connected = false;

  async connect(): Promise<void> {
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  async getStations(customerId: string): Promise<VendingStationData[]> {
    // Return mock stations based on customer ID pattern
    return [
      {
        externalId: `${customerId}-STN-001`,
        name: "Main Production Floor",
        location: "Building A, Bay 1",
      },
      {
        externalId: `${customerId}-STN-002`,
        name: "Tool Room",
        location: "Building A, Room 102",
      },
      {
        externalId: `${customerId}-STN-003`,
        name: "Maintenance Crib",
        location: "Building B, Bay 3",
      },
    ];
  }

  async getStationItems(stationExternalId: string): Promise<VendingItemData[]> {
    // Return mock items - varied data for testing calculations
    return [
      {
        stationExternalId,
        partNumber: "GLV-NIT-LG",
        description: "Nitrile Gloves Large",
        quantityOnHand: 150,
        currentMin: 50,
        currentMax: 200,
        packageQty: 100, // Box of 100
        quantityOnOrder: 0,
        numberOfBins: 2,
        binLocations: "A1, A2",
      },
      {
        stationExternalId,
        partNumber: "SAF-GLAS-CLR",
        description: "Safety Glasses Clear",
        quantityOnHand: 12,
        currentMin: 5,
        currentMax: 20,
        packageQty: 1,
        quantityOnOrder: 10,
        numberOfBins: 1,
        binLocations: "B1",
      },
      {
        stationExternalId,
        partNumber: "CUT-BLD-5PK",
        description: "Utility Knife Blades 5-Pack",
        quantityOnHand: 8,
        currentMin: 10,
        currentMax: 30,
        packageQty: 5,
        quantityOnOrder: 0,
        numberOfBins: 1,
        binLocations: "C1",
      },
      {
        stationExternalId,
        partNumber: "DRL-BIT-1/4",
        description: '1/4" Drill Bit HSS',
        quantityOnHand: 25,
        currentMin: 10,
        currentMax: 50,
        packageQty: 1,
        quantityOnOrder: 0,
        numberOfBins: 1,
        binLocations: "D1",
      },
      {
        stationExternalId,
        partNumber: "TAPE-ELEC-BLK",
        description: "Electrical Tape Black",
        quantityOnHand: 6,
        currentMin: 12,
        currentMax: 36,
        packageQty: 1,
        quantityOnOrder: 24,
        numberOfBins: 1,
        binLocations: "E1",
      },
      {
        stationExternalId,
        partNumber: "LUBE-WD40-12",
        description: "WD-40 12oz Can",
        quantityOnHand: 4,
        currentMin: 6,
        currentMax: 18,
        packageQty: 6, // Case of 6
        quantityOnOrder: 0,
        numberOfBins: 1,
        binLocations: "F1",
      },
    ];
  }

  async getUsageHistory(
    stationExternalId: string,
    startDate: Date,
    endDate: Date
  ): Promise<VendingUsageData[]> {
    // Generate realistic usage data for each item
    const items = await this.getStationItems(stationExternalId);
    const allUsage: VendingUsageData[] = [];

    // Average daily usage rates for each item type
    const usageRates: Record<string, number> = {
      "GLV-NIT-LG": 12, // High usage consumable
      "SAF-GLAS-CLR": 0.8, // Moderate usage
      "CUT-BLD-5PK": 1.5, // Regular usage
      "DRL-BIT-1/4": 2, // Moderate usage
      "TAPE-ELEC-BLK": 1.2, // Regular usage
      "LUBE-WD40-12": 0.5, // Low usage
    };

    for (const item of items) {
      const avgUsage = usageRates[item.partNumber] || 1;
      const usage = generateUsageHistory(
        stationExternalId,
        item.partNumber,
        avgUsage,
        startDate,
        endDate
      );
      allUsage.push(...usage);
    }

    return allUsage;
  }

  async updateMinMax(
    stationExternalId: string,
    partNumber: string,
    min: number,
    max: number
  ): Promise<void> {
    console.log(
      `Mock: Would update ${partNumber} at ${stationExternalId} to min=${min}, max=${max}`
    );
  }
}

export class MockErpAdapter implements ErpAdapter {
  readonly name = "Mock ERP System";
  private connected = false;

  async connect(): Promise<void> {
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  async getInventory(partNumber: string): Promise<ErpInventoryData[]> {
    // Return inventory across multiple branches
    const baseQty = Math.floor(Math.random() * 100) + 20;
    return [
      {
        partNumber,
        branchId: "MAIN",
        branchName: "Main Warehouse",
        quantityOnHand: baseQty,
        quantityOnOrder: Math.floor(Math.random() * 50),
        reorderPoint: 25,
      },
      {
        partNumber,
        branchId: "WEST",
        branchName: "West Branch",
        quantityOnHand: Math.floor(baseQty * 0.5),
        quantityOnOrder: 0,
        reorderPoint: 15,
      },
      {
        partNumber,
        branchId: "EAST",
        branchName: "East Branch",
        quantityOnHand: Math.floor(baseQty * 0.3),
        quantityOnOrder: 20,
        reorderPoint: 10,
      },
    ];
  }

  async getBranchInventory(branchId: string): Promise<ErpInventoryData[]> {
    const partNumbers = [
      "GLV-NIT-LG",
      "SAF-GLAS-CLR",
      "CUT-BLD-5PK",
      "DRL-BIT-1/4",
      "TAPE-ELEC-BLK",
      "LUBE-WD40-12",
    ];

    return partNumbers.map((pn) => ({
      partNumber: pn,
      branchId,
      branchName: branchId === "MAIN" ? "Main Warehouse" : `${branchId} Branch`,
      quantityOnHand: Math.floor(Math.random() * 100) + 10,
      quantityOnOrder: Math.floor(Math.random() * 30),
      reorderPoint: Math.floor(Math.random() * 20) + 5,
    }));
  }

  async getOpenPurchaseOrders(): Promise<ErpPurchaseOrderData[]> {
    const today = new Date();
    return [
      {
        poNumber: "PO-2024-001",
        supplierId: "SUP001",
        supplierName: "Industrial Supply Co",
        orderDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        expectedDeliveryDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        status: "OPEN",
        lines: [
          {
            partNumber: "GLV-NIT-LG",
            quantityOrdered: 500,
            quantityReceived: 0,
            unitCost: 0.15,
          },
          {
            partNumber: "SAF-GLAS-CLR",
            quantityOrdered: 24,
            quantityReceived: 0,
            unitCost: 8.5,
          },
        ],
      },
      {
        poNumber: "PO-2024-002",
        supplierId: "SUP002",
        supplierName: "Tool Warehouse",
        orderDate: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
        expectedDeliveryDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000),
        status: "OPEN",
        lines: [
          {
            partNumber: "DRL-BIT-1/4",
            quantityOrdered: 50,
            quantityReceived: 0,
            unitCost: 4.25,
          },
          {
            partNumber: "CUT-BLD-5PK",
            quantityOrdered: 20,
            quantityReceived: 0,
            unitCost: 6.99,
          },
        ],
      },
    ];
  }

  async getPurchaseOrdersForItem(
    partNumber: string
  ): Promise<ErpPurchaseOrderData[]> {
    const allPOs = await this.getOpenPurchaseOrders();
    return allPOs.filter((po) =>
      po.lines.some((line) => line.partNumber === partNumber)
    );
  }

  async getSuppliers(): Promise<ErpSupplierData[]> {
    return [
      { code: "SUP001", name: "Industrial Supply Co", leadTimeDays: 7 },
      { code: "SUP002", name: "Tool Warehouse", leadTimeDays: 14 },
      { code: "SUP003", name: "Safety Products Inc", leadTimeDays: 5 },
      { code: "SUP004", name: "Fastener World", leadTimeDays: 10 },
    ];
  }

  async getSupplierLeadTime(supplierId: string): Promise<number> {
    const suppliers = await this.getSuppliers();
    const supplier = suppliers.find((s) => s.code === supplierId);
    return supplier?.leadTimeDays ?? 14;
  }
}

// Export factory functions
export const createMockVendingAdapter = (): VendingAdapter =>
  new MockVendingAdapter();
export const createMockErpAdapter = (): ErpAdapter => new MockErpAdapter();
