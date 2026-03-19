"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Transaction {
  id: string;
  partNumber: string;
  description: string;
  quantity: number;
  timestamp: Date;
  userId?: string;
  jobNumber?: string;
}

interface SelectedItem {
  stationItemId: string;
  partNumber: string;
  description: string;
  currentQoh: number;
  packageQty: number;
}

export default function VendingSimulatorPage() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [selectedStationId, setSelectedStationId] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [issueQty, setIssueQty] = useState(1);
  const [employeeId, setEmployeeId] = useState("");
  const [jobNumber, setJobNumber] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dispensing, setDispensing] = useState(false);
  const [confirmationMsg, setConfirmationMsg] = useState("");

  const utils = trpc.useUtils();

  const customersQuery = trpc.customers.list.useQuery();
  const stationsQuery = trpc.demo.getVendingStationsForDemo.useQuery(
    { customerId: selectedCustomerId },
    { enabled: !!selectedCustomerId }
  );

  const issueMutation = trpc.demo.issueItem.useMutation({
    onSuccess: () => {
      utils.demo.getVendingStationsForDemo.invalidate();
    },
  });

  const customers = customersQuery.data ?? [];
  const stations = stationsQuery.data ?? [];
  const selectedStation = stations.find(
    (s: { id: string }) => s.id === selectedStationId
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stationItems = (selectedStation as any)?.stationItems ?? [];

  function handleRowClick(item: {
    id: string;
    item: { partNumber: string; description: string };
    quantityOnHand: number;
    packageQty: number;
  }) {
    setSelectedItem({
      stationItemId: item.id,
      partNumber: item.item.partNumber,
      description: item.item.description,
      currentQoh: item.quantityOnHand,
      packageQty: item.packageQty,
    });
    setIssueQty(item.packageQty);
    setEmployeeId("");
    setJobNumber("");
    setConfirmationMsg("");
    setDialogOpen(true);
  }

  async function handleDispense() {
    if (!selectedItem) return;
    setDispensing(true);
    setConfirmationMsg("");
    try {
      await issueMutation.mutateAsync({
        stationItemId: selectedItem.stationItemId,
        quantity: issueQty,
        userId: employeeId || undefined,
        jobNumber: jobNumber || undefined,
      });
      const txn: Transaction = {
        id: crypto.randomUUID(),
        partNumber: selectedItem.partNumber,
        description: selectedItem.description,
        quantity: issueQty,
        timestamp: new Date(),
        userId: employeeId || undefined,
        jobNumber: jobNumber || undefined,
      };
      setTransactions((prev) => [txn, ...prev].slice(0, 10));
      setConfirmationMsg(
        `DISPENSED ${issueQty}x ${selectedItem.partNumber}`
      );
    } catch {
      setConfirmationMsg("ERROR: DISPENSE FAILED");
    } finally {
      setDispensing(false);
    }
  }

  function qohColor(qoh: number, min: number): string {
    if (qoh === 0) return "text-red-500";
    if (qoh <= min) return "text-amber-400";
    return "text-emerald-400";
  }

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "#0d1117",
        color: "#c9d1d9",
        fontFamily:
          "'Courier New', Courier, 'Liberation Mono', monospace",
      }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-3"
        style={{
          backgroundColor: "#161b22",
          borderBottom: "2px solid #2196F3",
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="text-xl font-bold tracking-widest"
            style={{ color: "#2196F3" }}
          >
            VENDING SYSTEM DEMO
          </div>
          <div
            className="text-xs tracking-wide"
            style={{ color: "#8b949e" }}
          >
            AUTOCRIB / CRIBMASTER SIMULATOR
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: "#3fb950" }}
          />
          <span
            className="text-xs font-bold tracking-widest"
            style={{ color: "#3fb950" }}
          >
            ONLINE
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-7xl p-6">
        {/* Selectors */}
        <div
          className="mb-6 flex flex-wrap gap-4 rounded p-4"
          style={{
            backgroundColor: "#161b22",
            border: "1px solid #30363d",
          }}
        >
          <div className="flex flex-col gap-1">
            <label
              className="text-xs font-bold tracking-widest"
              style={{ color: "#8b949e" }}
            >
              CUSTOMER
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => {
                setSelectedCustomerId(e.target.value);
                setSelectedStationId("");
              }}
              className="h-9 rounded px-3 text-sm outline-none"
              style={{
                backgroundColor: "#0d1117",
                border: "1px solid #30363d",
                color: "#c9d1d9",
                minWidth: "260px",
              }}
            >
              <option value="">-- SELECT CUSTOMER --</option>
              {customers.map((c: { id: string; name: string }) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label
              className="text-xs font-bold tracking-widest"
              style={{ color: "#8b949e" }}
            >
              STATION
            </label>
            <select
              value={selectedStationId}
              onChange={(e) => setSelectedStationId(e.target.value)}
              disabled={!selectedCustomerId}
              className="h-9 rounded px-3 text-sm outline-none disabled:opacity-50"
              style={{
                backgroundColor: "#0d1117",
                border: "1px solid #30363d",
                color: "#c9d1d9",
                minWidth: "260px",
              }}
            >
              <option value="">-- SELECT STATION --</option>
              {stations.map((s: { id: string; name: string }) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Items Table */}
        {selectedStationId && (
          <div
            className="mb-6 overflow-hidden rounded"
            style={{
              backgroundColor: "#161b22",
              border: "1px solid #30363d",
            }}
          >
            <div
              className="px-4 py-2 text-xs font-bold tracking-widest"
              style={{
                backgroundColor: "#1c2128",
                borderBottom: "1px solid #30363d",
                color: "#8b949e",
              }}
            >
              STATION INVENTORY
            </div>
            <div className="max-h-[420px] overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className="sticky top-0 z-10 text-left text-xs font-bold tracking-wider"
                    style={{
                      backgroundColor: "#1c2128",
                      color: "#8b949e",
                    }}
                  >
                    <th
                      className="px-4 py-2"
                      style={{ borderBottom: "1px solid #30363d" }}
                    >
                      PART NUMBER
                    </th>
                    <th
                      className="px-4 py-2"
                      style={{ borderBottom: "1px solid #30363d" }}
                    >
                      DESCRIPTION
                    </th>
                    <th
                      className="px-4 py-2 text-right"
                      style={{ borderBottom: "1px solid #30363d" }}
                    >
                      QOH
                    </th>
                    <th
                      className="px-4 py-2 text-right"
                      style={{ borderBottom: "1px solid #30363d" }}
                    >
                      MIN
                    </th>
                    <th
                      className="px-4 py-2 text-right"
                      style={{ borderBottom: "1px solid #30363d" }}
                    >
                      MAX
                    </th>
                    <th
                      className="px-4 py-2 text-right"
                      style={{ borderBottom: "1px solid #30363d" }}
                    >
                      PKG QTY
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stationItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center"
                        style={{ color: "#8b949e" }}
                      >
                        NO ITEMS IN STATION
                      </td>
                    </tr>
                  ) : (
                    stationItems.map(
                      (si: {
                        id: string;
                        item: {
                          partNumber: string;
                          description: string;
                        };
                        quantityOnHand: number;
                        currentMin: number;
                        currentMax: number;
                        packageQty: number;
                      }) => (
                        <tr
                          key={si.id}
                          onClick={() => handleRowClick(si)}
                          className="cursor-pointer transition-colors"
                          style={{ borderBottom: "1px solid #21262d" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "#1c2128")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                        >
                          <td
                            className="px-4 py-2 font-bold"
                            style={{ color: "#2196F3" }}
                          >
                            {si.item.partNumber}
                          </td>
                          <td className="px-4 py-2">
                            {si.item.description}
                          </td>
                          <td
                            className={`px-4 py-2 text-right font-bold ${qohColor(si.quantityOnHand, si.currentMin)}`}
                          >
                            {si.quantityOnHand}
                          </td>
                          <td
                            className="px-4 py-2 text-right"
                            style={{ color: "#8b949e" }}
                          >
                            {si.currentMin}
                          </td>
                          <td
                            className="px-4 py-2 text-right"
                            style={{ color: "#8b949e" }}
                          >
                            {si.currentMax}
                          </td>
                          <td
                            className="px-4 py-2 text-right"
                            style={{ color: "#8b949e" }}
                          >
                            {si.packageQty}
                          </td>
                        </tr>
                      )
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <div
            className="overflow-hidden rounded"
            style={{
              backgroundColor: "#161b22",
              border: "1px solid #30363d",
            }}
          >
            <div
              className="px-4 py-2 text-xs font-bold tracking-widest"
              style={{
                backgroundColor: "#1c2128",
                borderBottom: "1px solid #30363d",
                color: "#8b949e",
              }}
            >
              RECENT TRANSACTIONS
            </div>
            <div className="max-h-[200px] overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className="sticky top-0 text-left text-xs font-bold tracking-wider"
                    style={{
                      backgroundColor: "#1c2128",
                      color: "#8b949e",
                    }}
                  >
                    <th
                      className="px-4 py-2"
                      style={{ borderBottom: "1px solid #30363d" }}
                    >
                      TIME
                    </th>
                    <th
                      className="px-4 py-2"
                      style={{ borderBottom: "1px solid #30363d" }}
                    >
                      PART NUMBER
                    </th>
                    <th
                      className="px-4 py-2"
                      style={{ borderBottom: "1px solid #30363d" }}
                    >
                      DESCRIPTION
                    </th>
                    <th
                      className="px-4 py-2 text-right"
                      style={{ borderBottom: "1px solid #30363d" }}
                    >
                      QTY
                    </th>
                    <th
                      className="px-4 py-2"
                      style={{ borderBottom: "1px solid #30363d" }}
                    >
                      EMP ID
                    </th>
                    <th
                      className="px-4 py-2"
                      style={{ borderBottom: "1px solid #30363d" }}
                    >
                      JOB #
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr
                      key={txn.id}
                      style={{ borderBottom: "1px solid #21262d" }}
                    >
                      <td
                        className="px-4 py-1.5"
                        style={{ color: "#8b949e" }}
                      >
                        {txn.timestamp.toLocaleTimeString()}
                      </td>
                      <td
                        className="px-4 py-1.5 font-bold"
                        style={{ color: "#2196F3" }}
                      >
                        {txn.partNumber}
                      </td>
                      <td className="px-4 py-1.5">{txn.description}</td>
                      <td className="px-4 py-1.5 text-right font-bold">
                        {txn.quantity}
                      </td>
                      <td
                        className="px-4 py-1.5"
                        style={{ color: "#8b949e" }}
                      >
                        {txn.userId || "-"}
                      </td>
                      <td
                        className="px-4 py-1.5"
                        style={{ color: "#8b949e" }}
                      >
                        {txn.jobNumber || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!selectedCustomerId && (
          <div
            className="mt-12 text-center text-sm tracking-wide"
            style={{ color: "#484f58" }}
          >
            SELECT A CUSTOMER AND STATION TO BEGIN
          </div>
        )}
        {selectedCustomerId && !selectedStationId && (
          <div
            className="mt-12 text-center text-sm tracking-wide"
            style={{ color: "#484f58" }}
          >
            SELECT A STATION TO VIEW INVENTORY
          </div>
        )}
      </div>

      {/* Issue Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="sm:max-w-md"
          style={{
            backgroundColor: "#161b22",
            border: "1px solid #30363d",
            color: "#c9d1d9",
            fontFamily:
              "'Courier New', Courier, 'Liberation Mono', monospace",
          }}
        >
          <DialogHeader>
            <DialogTitle
              className="text-base font-bold tracking-widest"
              style={{ color: "#2196F3" }}
            >
              ISSUE ITEM
            </DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <div className="flex flex-col gap-4">
              <div
                className="rounded p-3"
                style={{
                  backgroundColor: "#0d1117",
                  border: "1px solid #30363d",
                }}
              >
                <div
                  className="text-xs tracking-widest"
                  style={{ color: "#8b949e" }}
                >
                  PART NUMBER
                </div>
                <div
                  className="text-lg font-bold"
                  style={{ color: "#2196F3" }}
                >
                  {selectedItem.partNumber}
                </div>
                <div className="mt-1 text-sm" style={{ color: "#c9d1d9" }}>
                  {selectedItem.description}
                </div>
                <div
                  className="mt-2 text-xs"
                  style={{ color: "#8b949e" }}
                >
                  CURRENT QOH:{" "}
                  <span className="font-bold" style={{ color: "#c9d1d9" }}>
                    {selectedItem.currentQoh}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label
                    className="text-xs font-bold tracking-widest"
                    style={{ color: "#8b949e" }}
                  >
                    QUANTITY{" "}
                    <span style={{ color: "#484f58" }}>
                      (MULTIPLES OF {selectedItem.packageQty})
                    </span>
                  </label>
                  <input
                    type="number"
                    min={selectedItem.packageQty}
                    max={selectedItem.currentQoh}
                    step={selectedItem.packageQty}
                    value={issueQty}
                    onChange={(e) =>
                      setIssueQty(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="h-9 rounded px-3 text-sm outline-none"
                    style={{
                      backgroundColor: "#0d1117",
                      border: `1px solid ${issueQty % selectedItem.packageQty !== 0 ? "#f85149" : "#30363d"}`,
                      color: "#c9d1d9",
                    }}
                  />
                  {issueQty % selectedItem.packageQty !== 0 && (
                    <div
                      className="text-xs font-bold"
                      style={{ color: "#f85149" }}
                    >
                      QTY MUST BE A MULTIPLE OF {selectedItem.packageQty}
                    </div>
                  )}
                  {issueQty > selectedItem.currentQoh && (
                    <div
                      className="text-xs font-bold"
                      style={{ color: "#f85149" }}
                    >
                      EXCEEDS QUANTITY ON HAND ({selectedItem.currentQoh})
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    className="text-xs font-bold tracking-widest"
                    style={{ color: "#8b949e" }}
                  >
                    EMPLOYEE ID{" "}
                    <span style={{ color: "#484f58" }}>(OPTIONAL)</span>
                  </label>
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="E.G. EMP-1234"
                    className="h-9 rounded px-3 text-sm outline-none placeholder:opacity-30"
                    style={{
                      backgroundColor: "#0d1117",
                      border: "1px solid #30363d",
                      color: "#c9d1d9",
                    }}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    className="text-xs font-bold tracking-widest"
                    style={{ color: "#8b949e" }}
                  >
                    JOB NUMBER{" "}
                    <span style={{ color: "#484f58" }}>(OPTIONAL)</span>
                  </label>
                  <input
                    type="text"
                    value={jobNumber}
                    onChange={(e) => setJobNumber(e.target.value)}
                    placeholder="E.G. JOB-5678"
                    className="h-9 rounded px-3 text-sm outline-none placeholder:opacity-30"
                    style={{
                      backgroundColor: "#0d1117",
                      border: "1px solid #30363d",
                      color: "#c9d1d9",
                    }}
                  />
                </div>
              </div>

              {confirmationMsg && (
                <div
                  className="rounded px-3 py-2 text-center text-sm font-bold tracking-wide"
                  style={{
                    backgroundColor: confirmationMsg.startsWith("ERROR")
                      ? "#3d1117"
                      : "#0d2818",
                    border: `1px solid ${confirmationMsg.startsWith("ERROR") ? "#f85149" : "#3fb950"}`,
                    color: confirmationMsg.startsWith("ERROR")
                      ? "#f85149"
                      : "#3fb950",
                  }}
                >
                  {confirmationMsg}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="mt-2">
            <Button
              variant="ghost"
              onClick={() => setDialogOpen(false)}
              className="tracking-widest"
              style={{
                color: "#8b949e",
                border: "1px solid #30363d",
              }}
            >
              CANCEL
            </Button>
            <button
              onClick={handleDispense}
              disabled={dispensing || !selectedItem || (selectedItem != null && (issueQty % selectedItem.packageQty !== 0 || issueQty > selectedItem.currentQoh || issueQty <= 0))}
              className="h-10 rounded px-6 text-sm font-bold tracking-widest text-white transition-colors disabled:opacity-50"
              style={{
                backgroundColor: dispensing ? "#1a3a5c" : "#2196F3",
                border: "2px solid #2196F3",
              }}
              onMouseEnter={(e) => {
                if (!dispensing)
                  e.currentTarget.style.backgroundColor = "#1976D2";
              }}
              onMouseLeave={(e) => {
                if (!dispensing)
                  e.currentTarget.style.backgroundColor = "#2196F3";
              }}
            >
              {dispensing ? "DISPENSING..." : "DISPENSE"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
