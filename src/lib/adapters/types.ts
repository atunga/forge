/**
 * Adapter interfaces for vending systems and ERP integrations
 * These define the contract that all adapters must implement
 */

// Vending System Types
export interface VendingStationData {
  externalId: string;
  name: string;
  location?: string;
}

export interface VendingItemData {
  stationExternalId: string;
  partNumber: string;
  description: string;
  quantityOnHand: number;
  currentMin: number;
  currentMax: number;
  packageQty: number;
  quantityOnOrder: number;
  numberOfBins: number;
  binLocations?: string;
}

export interface VendingUsageData {
  stationExternalId: string;
  partNumber: string;
  quantity: number;
  transactionAt: Date;
  userId?: string;
  jobNumber?: string;
}

// ERP Types
export interface ErpInventoryData {
  partNumber: string;
  branchId: string;
  branchName: string;
  quantityOnHand: number;
  quantityOnOrder: number;
  reorderPoint?: number;
}

export interface ErpPurchaseOrderData {
  poNumber: string;
  supplierId: string;
  supplierName: string;
  orderDate: Date;
  expectedDeliveryDate?: Date;
  status: "OPEN" | "PARTIAL" | "CLOSED" | "CANCELLED";
  lines: {
    partNumber: string;
    quantityOrdered: number;
    quantityReceived: number;
    unitCost?: number;
  }[];
}

export interface ErpSupplierData {
  code: string;
  name: string;
  leadTimeDays: number;
}

// Adapter Interfaces
export interface VendingAdapter {
  readonly name: string;
  readonly type: "AUTOCRIB" | "CRIBMASTER" | "OTHER";

  // Connection
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;

  // Data fetching
  getStations(customerId: string): Promise<VendingStationData[]>;
  getStationItems(stationExternalId: string): Promise<VendingItemData[]>;
  getUsageHistory(
    stationExternalId: string,
    startDate: Date,
    endDate: Date
  ): Promise<VendingUsageData[]>;

  // Data updates (optional - for applying recommendations)
  updateMinMax?(
    stationExternalId: string,
    partNumber: string,
    min: number,
    max: number
  ): Promise<void>;
}

export interface ErpAdapter {
  readonly name: string;

  // Connection
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;

  // Inventory data
  getInventory(partNumber: string): Promise<ErpInventoryData[]>;
  getBranchInventory(branchId: string): Promise<ErpInventoryData[]>;

  // Purchase orders
  getOpenPurchaseOrders(): Promise<ErpPurchaseOrderData[]>;
  getPurchaseOrdersForItem(partNumber: string): Promise<ErpPurchaseOrderData[]>;

  // Supplier data
  getSuppliers(): Promise<ErpSupplierData[]>;
  getSupplierLeadTime(supplierId: string): Promise<number>;
}

// Adapter factory type
export type VendingAdapterFactory = (config: Record<string, unknown>) => VendingAdapter;
export type ErpAdapterFactory = (config: Record<string, unknown>) => ErpAdapter;
