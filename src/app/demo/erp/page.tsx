"use client";

import { Fragment, useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Tab = "purchase-orders" | "sales-orders" | "inventory";

interface POLine {
  itemId: string;
  partNumber: string;
  description: string;
  quantityOrdered: number;
  unitCost: number;
}

interface ReceiveLine {
  lineId: string;
  partNumber: string;
  description: string;
  quantityOrdered: number;
  alreadyReceived: number;
  quantityReceived: number;
}

export default function ERPSimulatorPage() {
  const [activeTab, setActiveTab] = useState<Tab>("purchase-orders");

  const tabs: { key: Tab; label: string }[] = [
    { key: "purchase-orders", label: "Purchase Orders" },
    { key: "sales-orders", label: "Sales Orders" },
    { key: "inventory", label: "Inventory" },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8f9fa", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <header style={{ backgroundColor: "#1a365d" }} className="px-6 py-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Prophet 21</h1>
              <p className="text-xs text-blue-200">Enterprise Resource Planning</p>
            </div>
            <div className="h-8 w-px bg-blue-400/30" />
            <span className="text-sm text-blue-100 font-medium">Demo Distribution Co.</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-blue-200">
            <span>User: admin</span>
            <span>|</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      {/* Tab Bar */}
      <nav style={{ backgroundColor: "#2b6cb0" }} className="px-6 flex gap-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-white text-[#1a365d]"
                : "text-blue-100 hover:bg-blue-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="p-6">
        {activeTab === "purchase-orders" && <PurchaseOrdersTab />}
        {activeTab === "sales-orders" && <SalesOrdersTab />}
        {activeTab === "inventory" && <InventoryTab />}
      </main>
    </div>
  );
}

/* ============================================================
   PURCHASE ORDERS TAB
   ============================================================ */
function PurchaseOrdersTab() {
  const utils = trpc.useUtils();
  const [createOpen, setCreateOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [expandedPO, setExpandedPO] = useState<string | null>(null);
  const [receivePOId, setReceivePOId] = useState<string>("");
  const [receiveLines, setReceiveLines] = useState<ReceiveLine[]>([]);

  const { data: purchaseOrders, isLoading: posLoading } = trpc.erp.getOpenPurchaseOrders.useQuery();

  const receiveMutation = trpc.demo.receivePurchaseOrder.useMutation({
    onSuccess: () => {
      utils.erp.getOpenPurchaseOrders.invalidate();
      setReceiveOpen(false);
      setReceiveLines([]);
    },
  });

  function openReceiveDialog(po: any) {
    setReceivePOId(po.id);
    setReceiveLines(
      (po.lines || []).map((line: any) => {
        const alreadyReceived = line.quantityReceived ?? 0;
        const remaining = line.quantityOrdered - alreadyReceived;
        return {
          lineId: line.id,
          partNumber: line.partNumber || line.item?.partNumber || "—",
          description: line.description || line.item?.description || "—",
          quantityOrdered: line.quantityOrdered,
          alreadyReceived,
          quantityReceived: remaining,
        };
      })
    );
    setReceiveOpen(true);
  }

  function handleReceive() {
    receiveMutation.mutate({
      purchaseOrderId: receivePOId,
      lines: receiveLines.map((l) => ({
        lineId: l.lineId,
        quantityReceived: l.quantityReceived,
      })),
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold" style={{ color: "#1a202c" }}>
          Purchase Orders
        </h2>
        <Button
          className="bg-[#2b6cb0] hover:bg-[#2c5282] text-white text-sm font-medium rounded px-4 py-2"
          onClick={() => setCreateOpen(true)}
        >
          + Create PO
        </Button>
      </div>

      {/* PO Table */}
      <div className="border rounded bg-white" style={{ borderColor: "#e2e8f0" }}>
        <table className="w-full text-sm" style={{ color: "#1a202c" }}>
          <thead>
            <tr style={{ backgroundColor: "#edf2f7" }}>
              <th className="text-left px-3 py-2 font-semibold border-b" style={{ borderColor: "#e2e8f0" }}>PO Number</th>
              <th className="text-left px-3 py-2 font-semibold border-b" style={{ borderColor: "#e2e8f0" }}>Supplier</th>
              <th className="text-left px-3 py-2 font-semibold border-b" style={{ borderColor: "#e2e8f0" }}>Order Date</th>
              <th className="text-left px-3 py-2 font-semibold border-b" style={{ borderColor: "#e2e8f0" }}>Expected Date</th>
              <th className="text-left px-3 py-2 font-semibold border-b" style={{ borderColor: "#e2e8f0" }}>Status</th>
              <th className="text-center px-3 py-2 font-semibold border-b" style={{ borderColor: "#e2e8f0" }}># Lines</th>
              <th className="text-right px-3 py-2 font-semibold border-b" style={{ borderColor: "#e2e8f0" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posLoading ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-gray-400">Loading...</td>
              </tr>
            ) : !purchaseOrders?.length ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-gray-400">No purchase orders found.</td>
              </tr>
            ) : (
              purchaseOrders.map((po: any) => (
                <Fragment key={po.id}>
                  <tr
                    className="hover:bg-blue-50/50 cursor-pointer"
                    style={{ borderBottom: expandedPO === po.id ? "none" : undefined }}
                    onClick={() => setExpandedPO(expandedPO === po.id ? null : po.id)}
                  >
                    <td className="px-3 py-2 border-b font-mono text-xs" style={{ borderColor: "#e2e8f0" }}>
                      {po.poNumber}
                    </td>
                    <td className="px-3 py-2 border-b" style={{ borderColor: "#e2e8f0" }}>
                      {po.supplierName || po.supplier?.name || "—"}
                    </td>
                    <td className="px-3 py-2 border-b font-mono text-xs" style={{ borderColor: "#e2e8f0" }}>
                      {po.orderDate ? new Date(po.orderDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-3 py-2 border-b font-mono text-xs" style={{ borderColor: "#e2e8f0" }}>
                      {po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toLocaleDateString() : po.expectedDate ? new Date(po.expectedDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-3 py-2 border-b" style={{ borderColor: "#e2e8f0" }}>
                      <StatusBadge status={po.status} />
                    </td>
                    <td className="px-3 py-2 border-b text-center font-mono text-xs" style={{ borderColor: "#e2e8f0" }}>
                      {po.lines?.length ?? 0}
                    </td>
                    <td className="px-3 py-2 border-b text-right" style={{ borderColor: "#e2e8f0" }}>
                      {(po.status === "OPEN" || po.status === "PARTIAL" || po.status === "ORDERED") && (
                        <Button
                          className="bg-green-600 hover:bg-green-700 text-white text-xs rounded px-3 py-1 h-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            openReceiveDialog(po);
                          }}
                        >
                          Receive
                        </Button>
                      )}
                    </td>
                  </tr>
                  {expandedPO === po.id && (
                    <tr key={`${po.id}-detail`}>
                      <td colSpan={7} className="px-3 pb-3 border-b" style={{ borderColor: "#e2e8f0", backgroundColor: "#f7fafc" }}>
                        <table className="w-full text-xs mt-1">
                          <thead>
                            <tr className="text-gray-500">
                              <th className="text-left px-2 py-1 font-medium">Part Number</th>
                              <th className="text-left px-2 py-1 font-medium">Description</th>
                              <th className="text-right px-2 py-1 font-medium">Qty Ordered</th>
                              <th className="text-right px-2 py-1 font-medium">Qty Received</th>
                              <th className="text-right px-2 py-1 font-medium">Unit Cost</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(po.lines || []).map((line: any, idx: number) => (
                              <tr key={line.id || idx} className="border-t" style={{ borderColor: "#e2e8f0" }}>
                                <td className="px-2 py-1 font-mono">{line.partNumber || line.item?.partNumber || "—"}</td>
                                <td className="px-2 py-1">{line.description || line.item?.description || "—"}</td>
                                <td className="px-2 py-1 text-right font-mono">{line.quantityOrdered}</td>
                                <td className="px-2 py-1 text-right font-mono">{line.quantityReceived ?? 0}</td>
                                <td className="px-2 py-1 text-right font-mono">
                                  {line.unitCost != null ? `$${Number(line.unitCost).toFixed(2)}` : "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create PO Dialog */}
      <CreatePODialog open={createOpen} onOpenChange={setCreateOpen} />

      {/* Receive PO Dialog */}
      <Dialog open={receiveOpen} onOpenChange={setReceiveOpen}>
        <DialogContent className="bg-white sm:max-w-2xl" style={{ color: "#1a202c" }}>
          <DialogHeader>
            <DialogTitle className="text-[#1a365d]">Receive Purchase Order</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-gray-500 -mt-2">
            Enter the quantity received for each line item. You can receive partial quantities.
          </p>
          <div className="max-h-96 overflow-y-auto border rounded" style={{ borderColor: "#e2e8f0" }}>
            <table className="w-full text-xs">
              <thead>
                <tr style={{ backgroundColor: "#edf2f7" }} className="sticky top-0">
                  <th className="text-left px-3 py-2 font-semibold">Part Number</th>
                  <th className="text-left px-3 py-2 font-semibold">Description</th>
                  <th className="text-right px-3 py-2 font-semibold">Ordered</th>
                  <th className="text-right px-3 py-2 font-semibold">Prev Recv</th>
                  <th className="text-right px-3 py-2 font-semibold">Remaining</th>
                  <th className="text-right px-3 py-2 font-semibold">Recv Qty</th>
                </tr>
              </thead>
              <tbody>
                {receiveLines.map((line, idx) => {
                  const remaining = line.quantityOrdered - line.alreadyReceived;
                  const isFullyReceived = remaining === 0;
                  return (
                    <tr
                      key={line.lineId}
                      className={`border-t ${isFullyReceived ? "bg-gray-50 text-gray-400" : ""}`}
                      style={{ borderColor: "#e2e8f0" }}
                    >
                      <td className="px-3 py-2 font-mono">{line.partNumber}</td>
                      <td className="px-3 py-2 text-gray-600 truncate max-w-[180px]">{line.description}</td>
                      <td className="px-3 py-2 text-right font-mono">{line.quantityOrdered}</td>
                      <td className="px-3 py-2 text-right font-mono">{line.alreadyReceived}</td>
                      <td className="px-3 py-2 text-right font-mono font-semibold">{remaining}</td>
                      <td className="px-3 py-2 text-right">
                        {isFullyReceived ? (
                          <span className="text-green-600 font-medium">Complete</span>
                        ) : (
                          <input
                            type="number"
                            min={0}
                            max={remaining}
                            value={line.quantityReceived}
                            onChange={(e) => {
                              const val = Math.min(Math.max(0, parseInt(e.target.value) || 0), remaining);
                              const updated = [...receiveLines];
                              updated[idx] = { ...updated[idx], quantityReceived: val };
                              setReceiveLines(updated);
                            }}
                            className="w-20 border rounded px-2 py-1 text-right font-mono"
                            style={{ borderColor: "#e2e8f0" }}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <DialogFooter>
            <Button
              className="bg-gray-200 hover:bg-gray-300 text-[#1a202c] text-sm rounded px-4 py-2"
              onClick={() => setReceiveOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white text-sm rounded px-4 py-2"
              onClick={handleReceive}
              disabled={receiveMutation.isPending || receiveLines.every(l => l.quantityReceived === 0 || l.quantityOrdered - l.alreadyReceived === 0)}
            >
              {receiveMutation.isPending ? "Receiving..." : "Confirm Receipt"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ============================================================
   CREATE PO DIALOG
   ============================================================ */
function CreatePODialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const utils = trpc.useUtils();
  const { data: suppliers } = trpc.demo.getSuppliers.useQuery();
  const { data: items } = trpc.demo.getItemsForPO.useQuery();
  const { data: unpurchasedItems } = trpc.demo.getUnpurchasedSOItems.useQuery(undefined, { enabled: open });

  const [supplierId, setSupplierId] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [lines, setLines] = useState<POLine[]>([]);
  const [itemSearch, setItemSearch] = useState("");

  const createMutation = trpc.demo.createPurchaseOrder.useMutation({
    onSuccess: () => {
      utils.erp.getOpenPurchaseOrders.invalidate();
      utils.demo.getUnpurchasedSOItems.invalidate();
      onOpenChange(false);
      resetForm();
    },
  });

  function resetForm() {
    setSupplierId("");
    setSupplierName("");
    setExpectedDate("");
    setLines([]);
    setItemSearch("");
  }

  const filteredItems = (items || []).filter(
    (item: any) =>
      !lines.some((l) => l.itemId === item.id) &&
      (item.partNumber?.toLowerCase().includes(itemSearch.toLowerCase()) ||
        item.description?.toLowerCase().includes(itemSearch.toLowerCase()))
  );

  function addLine(item: any) {
    setLines([
      ...lines,
      {
        itemId: item.id,
        partNumber: item.partNumber,
        description: item.description,
        quantityOrdered: item.standardPackQty || 1,
        unitCost: 0,
      },
    ]);
    setItemSearch("");
  }

  function removeLine(idx: number) {
    setLines(lines.filter((_, i) => i !== idx));
  }

  function updateLine(idx: number, field: keyof POLine, value: any) {
    const updated = [...lines];
    updated[idx] = { ...updated[idx], [field]: value };
    setLines(updated);
  }

  function handleSubmit() {
    if (!supplierId || lines.length === 0) return;
    createMutation.mutate({
      supplierId,
      supplierName,
      lines: lines.map((l) => ({
        itemId: l.itemId,
        quantityOrdered: l.quantityOrdered,
        unitCost: l.unitCost || undefined,
      })),
      expectedDeliveryDate: expectedDate || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white sm:max-w-2xl" style={{ color: "#1a202c" }}>
        <DialogHeader>
          <DialogTitle className="text-[#1a365d]">Create Purchase Order</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Supplier */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Supplier *</label>
              <select
                value={supplierId}
                onChange={(e) => {
                  setSupplierId(e.target.value);
                  const s = suppliers?.find((s: any) => s.id === e.target.value);
                  setSupplierName(s?.name || "");
                }}
                className="w-full border rounded px-2 py-1.5 text-sm bg-white"
                style={{ borderColor: "#e2e8f0" }}
              >
                <option value="">Select supplier...</option>
                {(suppliers || []).map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.code} — {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Expected Delivery Date</label>
              <input
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                className="w-full border rounded px-2 py-1.5 text-sm"
                style={{ borderColor: "#e2e8f0" }}
              />
            </div>
          </div>

          {/* Unpurchased SO Items */}
          {unpurchasedItems && unpurchasedItems.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Open Sales Order Items — Not Yet Purchased
              </label>
              <div className="border rounded max-h-40 overflow-y-auto" style={{ borderColor: "#fbd38d", backgroundColor: "#fffff0" }}>
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ backgroundColor: "#fefcbf" }} className="sticky top-0">
                      <th className="text-left px-2 py-1.5 font-semibold">Part Number</th>
                      <th className="text-left px-2 py-1.5 font-semibold">Description</th>
                      <th className="text-right px-2 py-1.5 font-semibold">SO Qty</th>
                      <th className="text-right px-2 py-1.5 font-semibold">On PO</th>
                      <th className="text-right px-2 py-1.5 font-semibold">Need</th>
                      <th className="w-16"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {unpurchasedItems
                      .filter((u: any) => !lines.some((l) => l.itemId === u.itemId))
                      .map((u: any) => (
                        <tr key={u.itemId} className="border-t" style={{ borderColor: "#fbd38d" }}>
                          <td className="px-2 py-1 font-mono">{u.partNumber}</td>
                          <td className="px-2 py-1 text-gray-600 truncate max-w-[160px]">{u.description}</td>
                          <td className="px-2 py-1 text-right font-mono">{u.soQty}</td>
                          <td className="px-2 py-1 text-right font-mono">{u.poQty}</td>
                          <td className="px-2 py-1 text-right font-mono font-semibold text-amber-700">{u.needQty}</td>
                          <td className="px-2 py-1 text-center">
                            <button
                              onClick={() => {
                                setLines((prev) => [
                                  ...prev,
                                  {
                                    itemId: u.itemId,
                                    partNumber: u.partNumber,
                                    description: u.description,
                                    quantityOrdered: u.needQty,
                                    unitCost: 0,
                                  },
                                ]);
                              }}
                              className="px-2 py-0.5 rounded text-xs font-medium bg-amber-500 text-white hover:bg-amber-600"
                            >
                              Add
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Item Picker */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Add Line Items</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search items by part number or description..."
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
                className="w-full border rounded px-2 py-1.5 text-sm"
                style={{ borderColor: "#e2e8f0" }}
              />
              {itemSearch.length > 0 && filteredItems.length > 0 && (
                <div
                  className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-40 overflow-y-auto"
                  style={{ borderColor: "#e2e8f0" }}
                >
                  {filteredItems.slice(0, 10).map((item: any) => (
                    <button
                      key={item.id}
                      onClick={() => addLine(item)}
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 flex justify-between"
                    >
                      <span>
                        <span className="font-mono font-medium">{item.partNumber}</span>
                        <span className="text-gray-500 ml-2">{item.description}</span>
                      </span>
                      <span className="text-gray-400">Pkg: {item.standardPackQty}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          {lines.length > 0 && (
            <div className="border rounded" style={{ borderColor: "#e2e8f0" }}>
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ backgroundColor: "#edf2f7" }}>
                    <th className="text-left px-2 py-1.5 font-semibold">Part Number</th>
                    <th className="text-left px-2 py-1.5 font-semibold">Description</th>
                    <th className="text-right px-2 py-1.5 font-semibold w-24">Quantity</th>
                    <th className="text-right px-2 py-1.5 font-semibold w-24">Unit Cost</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, idx) => (
                    <tr key={line.itemId} className="border-t" style={{ borderColor: "#e2e8f0" }}>
                      <td className="px-2 py-1 font-mono">{line.partNumber}</td>
                      <td className="px-2 py-1 text-gray-600 truncate max-w-[200px]">{line.description}</td>
                      <td className="px-2 py-1 text-right">
                        <input
                          type="number"
                          min={1}
                          value={line.quantityOrdered}
                          onChange={(e) => updateLine(idx, "quantityOrdered", parseInt(e.target.value) || 1)}
                          className="w-20 border rounded px-1 py-0.5 text-right font-mono"
                          style={{ borderColor: "#e2e8f0" }}
                        />
                      </td>
                      <td className="px-2 py-1 text-right">
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          value={line.unitCost}
                          onChange={(e) => updateLine(idx, "unitCost", parseFloat(e.target.value) || 0)}
                          className="w-20 border rounded px-1 py-0.5 text-right font-mono"
                          style={{ borderColor: "#e2e8f0" }}
                        />
                      </td>
                      <td className="px-2 py-1 text-center">
                        <button
                          onClick={() => removeLine(idx)}
                          className="text-red-400 hover:text-red-600 font-bold"
                        >
                          x
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            className="bg-gray-200 hover:bg-gray-300 text-[#1a202c] text-sm rounded px-4 py-2"
            onClick={() => {
              onOpenChange(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button
            className="bg-[#2b6cb0] hover:bg-[#2c5282] text-white text-sm rounded px-4 py-2"
            onClick={handleSubmit}
            disabled={!supplierId || lines.length === 0 || createMutation.isPending}
          >
            {createMutation.isPending ? "Submitting..." : "Submit PO"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============================================================
   SALES ORDERS TAB
   ============================================================ */
function SalesOrdersTab() {
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [expandedSO, setExpandedSO] = useState<string | null>(null);

  const { data: customers } = trpc.customers.list.useQuery();
  const { data: orders, isLoading: ordersLoading } = trpc.demo.getOrders.useQuery(
    { customerId: selectedCustomer },
    { enabled: !!selectedCustomer }
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold" style={{ color: "#1a202c" }}>
          Sales Orders
        </h2>
      </div>

      {/* Customer Filter */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-600 mb-1">Filter by Customer</label>
        <select
          value={selectedCustomer}
          onChange={(e) => {
            setSelectedCustomer(e.target.value);
            setExpandedSO(null);
          }}
          className="border rounded px-2 py-1.5 text-sm bg-white w-72"
          style={{ borderColor: "#e2e8f0" }}
        >
          <option value="">Select customer...</option>
          {(customers || []).map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.code ? `${c.code} — ` : ""}{c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="border rounded bg-white" style={{ borderColor: "#e2e8f0" }}>
        <table className="w-full text-sm" style={{ color: "#1a202c" }}>
          <thead>
            <tr style={{ backgroundColor: "#edf2f7" }}>
              <th className="text-left px-3 py-2 font-semibold border-b" style={{ borderColor: "#e2e8f0" }}>SO Number</th>
              <th className="text-left px-3 py-2 font-semibold border-b" style={{ borderColor: "#e2e8f0" }}>Customer</th>
              <th className="text-left px-3 py-2 font-semibold border-b" style={{ borderColor: "#e2e8f0" }}>Date</th>
              <th className="text-center px-3 py-2 font-semibold border-b" style={{ borderColor: "#e2e8f0" }}># Items</th>
              <th className="text-left px-3 py-2 font-semibold border-b" style={{ borderColor: "#e2e8f0" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {!selectedCustomer ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-gray-400">
                  Select a customer to view sales orders.
                </td>
              </tr>
            ) : ordersLoading ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-gray-400">Loading...</td>
              </tr>
            ) : !orders?.length ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-gray-400">No sales orders found.</td>
              </tr>
            ) : (
              orders.map((order: any) => (
                <Fragment key={order.id}>
                  <tr
                    className="hover:bg-blue-50/50 cursor-pointer"
                    onClick={() => setExpandedSO(expandedSO === order.id ? null : order.id)}
                  >
                    <td className="px-3 py-2 border-b font-mono text-xs" style={{ borderColor: "#e2e8f0" }}>
                      {order.soNumber || order.orderNumber || order.id?.slice(0, 8)}
                    </td>
                    <td className="px-3 py-2 border-b" style={{ borderColor: "#e2e8f0" }}>
                      {order.customerName || order.customer?.name || "—"}
                    </td>
                    <td className="px-3 py-2 border-b font-mono text-xs" style={{ borderColor: "#e2e8f0" }}>
                      {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-3 py-2 border-b text-center font-mono text-xs" style={{ borderColor: "#e2e8f0" }}>
                      {order.lines?.length ?? order.lineCount ?? 0}
                    </td>
                    <td className="px-3 py-2 border-b" style={{ borderColor: "#e2e8f0" }}>
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                  {expandedSO === order.id && order.lines && (
                    <tr key={`${order.id}-detail`}>
                      <td colSpan={5} className="px-3 pb-3 border-b" style={{ borderColor: "#e2e8f0", backgroundColor: "#f7fafc" }}>
                        <table className="w-full text-xs mt-1">
                          <thead>
                            <tr className="text-gray-500">
                              <th className="text-left px-2 py-1 font-medium">Part Number</th>
                              <th className="text-left px-2 py-1 font-medium">Description</th>
                              <th className="text-right px-2 py-1 font-medium">Quantity</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.lines.map((line: any, idx: number) => (
                              <tr key={line.id || idx} className="border-t" style={{ borderColor: "#e2e8f0" }}>
                                <td className="px-2 py-1 font-mono">{line.partNumber || line.item?.partNumber || "—"}</td>
                                <td className="px-2 py-1">{line.description || line.item?.description || "—"}</td>
                                <td className="px-2 py-1 text-right font-mono">{line.quantity || line.quantityOrdered || 0}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================
   INVENTORY TAB
   ============================================================ */
const BRANCHES = [
  { id: "MAIN", name: "Main Warehouse" },
  { id: "WEST", name: "West Distribution" },
  { id: "EAST", name: "East Distribution" },
];

function InventoryTab() {
  const utils = trpc.useUtils();
  const [selectedBranch, setSelectedBranch] = useState("MAIN");
  const { data: inventory, isLoading } = trpc.erp.getBranchInventory.useQuery({ branchId: selectedBranch });
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQoh, setEditQoh] = useState(0);
  const [editReorderPoint, setEditReorderPoint] = useState(0);

  const filteredInventory = (inventory ?? []).filter((inv: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (inv.item?.partNumber ?? "").toLowerCase().includes(q) ||
      (inv.item?.description ?? "").toLowerCase().includes(q)
    );
  });

  const updateMutation = trpc.demo.updateErpInventory.useMutation({
    onSuccess: () => {
      utils.erp.getBranchInventory.invalidate({ branchId: selectedBranch });
      setEditingId(null);
    },
  });

  function startEdit(inv: any) {
    setEditingId(inv.id);
    setEditQoh(inv.quantityOnHand ?? 0);
    setEditReorderPoint(inv.reorderPoint ?? 0);
  }

  function saveEdit() {
    if (!editingId) return;
    updateMutation.mutate({
      inventoryId: editingId,
      quantityOnHand: editQoh,
      reorderPoint: editReorderPoint,
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold" style={{ color: "#1a202c" }}>
            Inventory
          </h2>
          <select
            value={selectedBranch}
            onChange={(e) => {
              setSelectedBranch(e.target.value);
              setEditingId(null);
            }}
            className="border rounded px-2 py-1.5 text-sm bg-white font-medium"
            style={{ borderColor: "#e2e8f0" }}
          >
            {BRANCHES.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-gray-400">Click a row to edit QOH and Reorder Point</p>
      </div>

      <div className="mb-3">
        <input
          type="text"
          placeholder="Search by part number or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm w-80"
          style={{ borderColor: "#e2e8f0" }}
        />
      </div>

      <div className="border rounded bg-white" style={{ borderColor: "#e2e8f0" }}>
        <table className="w-full text-sm" style={{ color: "#1a202c" }}>
          <thead>
            <tr style={{ backgroundColor: "#edf2f7" }}>
              <th className="text-left px-3 py-2 font-semibold border-b" style={{ borderColor: "#e2e8f0" }}>Part Number</th>
              <th className="text-left px-3 py-2 font-semibold border-b" style={{ borderColor: "#e2e8f0" }}>Description</th>
              <th className="text-right px-3 py-2 font-semibold border-b" style={{ borderColor: "#e2e8f0" }}>QOH</th>
              <th className="text-right px-3 py-2 font-semibold border-b" style={{ borderColor: "#e2e8f0" }}>On Order</th>
              <th className="text-right px-3 py-2 font-semibold border-b" style={{ borderColor: "#e2e8f0" }}>Reorder Point</th>
              <th className="text-right px-3 py-2 font-semibold border-b w-24" style={{ borderColor: "#e2e8f0" }}></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-gray-400">Loading...</td>
              </tr>
            ) : !filteredInventory.length ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-gray-400">
                  {searchQuery ? "No items match your search." : "No inventory data."}
                </td>
              </tr>
            ) : (
              filteredInventory.map((inv: any) => {
                const isEditing = editingId === inv.id;
                const qoh = isEditing ? editQoh : (inv.quantityOnHand ?? 0);
                const reorderPoint = isEditing ? editReorderPoint : (inv.reorderPoint ?? 0);
                const isOut = qoh === 0;
                const isLow = qoh > 0 && qoh < reorderPoint;

                return (
                  <tr
                    key={inv.id}
                    className={`${
                      isEditing
                        ? "bg-blue-50 ring-1 ring-blue-300"
                        : isOut
                        ? "bg-red-50"
                        : isLow
                        ? "bg-yellow-50"
                        : "hover:bg-blue-50/30"
                    } ${!isEditing ? "cursor-pointer" : ""}`}
                    onClick={() => { if (!isEditing) startEdit(inv); }}
                  >
                    <td className="px-3 py-2 border-b font-mono text-xs" style={{ borderColor: "#e2e8f0" }}>
                      {inv.item?.partNumber ?? "—"}
                    </td>
                    <td className="px-3 py-2 border-b" style={{ borderColor: "#e2e8f0" }}>
                      {inv.item?.description ?? "—"}
                    </td>
                    <td className="px-3 py-2 border-b text-right" style={{ borderColor: "#e2e8f0" }}>
                      {isEditing ? (
                        <input
                          type="number"
                          min={0}
                          value={editQoh}
                          onChange={(e) => setEditQoh(Math.max(0, parseInt(e.target.value) || 0))}
                          onClick={(e) => e.stopPropagation()}
                          className="w-20 border rounded px-2 py-0.5 text-right font-mono text-xs"
                          style={{ borderColor: "#cbd5e0" }}
                          autoFocus
                        />
                      ) : (
                        <span className={`font-mono text-xs font-semibold ${isOut ? "text-red-600" : isLow ? "text-yellow-600" : ""}`}>
                          {qoh}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 border-b text-right font-mono text-xs" style={{ borderColor: "#e2e8f0" }}>
                      {inv.quantityOnOrder ?? 0}
                    </td>
                    <td className="px-3 py-2 border-b text-right" style={{ borderColor: "#e2e8f0" }}>
                      {isEditing ? (
                        <input
                          type="number"
                          min={0}
                          value={editReorderPoint}
                          onChange={(e) => setEditReorderPoint(Math.max(0, parseInt(e.target.value) || 0))}
                          onClick={(e) => e.stopPropagation()}
                          className="w-20 border rounded px-2 py-0.5 text-right font-mono text-xs"
                          style={{ borderColor: "#cbd5e0" }}
                        />
                      ) : (
                        <span className="font-mono text-xs">{reorderPoint}</span>
                      )}
                    </td>
                    <td className="px-3 py-1.5 border-b text-right" style={{ borderColor: "#e2e8f0" }}>
                      {isEditing && (
                        <div className="flex gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={saveEdit}
                            disabled={updateMutation.isPending}
                            className="px-2 py-0.5 text-xs font-medium rounded bg-[#2b6cb0] text-white hover:bg-[#2c5282] disabled:opacity-50"
                          >
                            {updateMutation.isPending ? "..." : "Save"}
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2 py-0.5 text-xs font-medium rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-red-100 border border-red-300 inline-block" /> Out of Stock (QOH = 0)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-yellow-100 border border-yellow-300 inline-block" /> Below Reorder Point
        </span>
      </div>
    </div>
  );
}

/* ============================================================
   SHARED COMPONENTS
   ============================================================ */
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    OPEN: { bg: "#bee3f8", text: "#2a4365" },
    ORDERED: { bg: "#bee3f8", text: "#2a4365" },
    PARTIAL: { bg: "#fefcbf", text: "#744210" },
    RECEIVED: { bg: "#c6f6d5", text: "#22543d" },
    CLOSED: { bg: "#e2e8f0", text: "#4a5568" },
    COMPLETED: { bg: "#c6f6d5", text: "#22543d" },
    PENDING: { bg: "#fefcbf", text: "#744210" },
    SHIPPED: { bg: "#bee3f8", text: "#2a4365" },
    DELIVERED: { bg: "#c6f6d5", text: "#22543d" },
    CANCELLED: { bg: "#fed7d7", text: "#9b2c2c" },
  };

  const c = colors[status?.toUpperCase()] || { bg: "#e2e8f0", text: "#4a5568" };

  return (
    <span
      className="inline-block px-2 py-0.5 rounded text-xs font-medium"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {status || "—"}
    </span>
  );
}
