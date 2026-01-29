"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ForgeLayout, StatCard, SectionHeader, EmptyState } from "@/components/forge-layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import {
  ChevronRight,
  Warehouse,
  Box,
  AlertTriangle,
  MapPin,
  Play,
  Loader2,
  TrendingUp,
  TrendingDown,
  Package,
  Truck,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckCircle2,
  Clock,
  ChevronDown,
  Filter,
  X,
  ShoppingCart,
  Check,
  Square,
  CheckSquare,
} from "lucide-react";

export default function CustomerDetailPage() {
  const params = useParams();
  const customerId = params.id as string;
  const [selectedStationId, setSelectedStationId] = useState<string>("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Reorder tab state
  const [reorderFilter, setReorderFilter] = useState<"atMin" | "belowMax">("atMin");
  const [reorderQtys, setReorderQtys] = useState<Record<string, number>>({});
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [qtyErrors, setQtyErrors] = useState<Record<string, string>>({});

  const { data: customer, isLoading } = trpc.customers.getById.useQuery({ id: customerId });
  const { data: erpData } = trpc.erp.getCustomerItemsInventory.useQuery({ customerId });
  const { data: recommendations, refetch: refetchRecommendations } =
    trpc.recommendations.getByCustomer.useQuery({ customerId, status: "PENDING" });

  const generateMutation = trpc.recommendations.generate.useMutation({
    onSuccess: () => {
      refetchRecommendations();
    },
  });

  const handleGenerateRecommendations = () => {
    generateMutation.mutate({ customerId, usageDays: 90, supplierLeadTimeDays: 14 });
  };

  if (isLoading) {
    return (
      <ForgeLayout>
        <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-[var(--copper)] animate-spin" />
          </div>
        </div>
      </ForgeLayout>
    );
  }

  if (!customer) {
    return (
      <ForgeLayout>
        <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-8">
          <EmptyState
            icon={<AlertTriangle className="w-6 h-6 text-[var(--status-warn)]" />}
            title="Customer not found"
            description="The requested customer account could not be located."
            action={
              <Link href="/customers">
                <Button className="bg-[var(--copper)] hover:bg-[var(--copper-light)] text-[var(--background)]">
                  Back to Customers
                </Button>
              </Link>
            }
          />
        </div>
      </ForgeLayout>
    );
  }

  // Build ERP inventory lookup by item ID
  type ErpInventoryItem = NonNullable<typeof erpData>["erpInventory"][number];
  type PurchaseOrderItem = NonNullable<typeof erpData>["purchaseOrders"][number];

  const erpInventoryByItem = new Map<string, ErpInventoryItem[]>();
  erpData?.erpInventory.forEach((inv) => {
    const existing = erpInventoryByItem.get(inv.itemId) || [];
    existing.push(inv);
    erpInventoryByItem.set(inv.itemId, existing);
  });

  const posByItem = new Map<string, PurchaseOrderItem[]>();
  erpData?.purchaseOrders.forEach((po) => {
    const existing = posByItem.get(po.itemId) || [];
    existing.push(po);
    posByItem.set(po.itemId, existing);
  });

  const totalItems = customer.vendingStations.reduce((a, s) => a + s.stationItems.length, 0);
  const lowStockItems = customer.vendingStations.reduce(
    (acc, station) =>
      acc + station.stationItems.filter((si) => si.quantityOnHand <= si.currentMin).length,
    0
  );

  // Get items needing reorder based on filter (computed, not a hook)
  const getReorderItems = (() => {
    const items: Array<{
      stationItem: typeof customer.vendingStations[0]['stationItems'][0];
      station: typeof customer.vendingStations[0];
      suggestedQty: number;
    }> = [];

    customer.vendingStations
      .filter(station => selectedStationId === "all" || station.id === selectedStationId)
      .forEach(station => {
        station.stationItems.forEach(si => {
          const needsReorder = reorderFilter === "atMin"
            ? si.quantityOnHand <= si.currentMin
            : si.quantityOnHand < si.currentMax;

          if (needsReorder) {
            // Calculate raw suggested qty
            const rawSuggested = Math.max(0, si.currentMax - si.quantityOnHand - si.quantityOnOrder);

            // Round to package quantity multiple
            let suggestedQty = rawSuggested;
            if (si.packageQty > 1 && rawSuggested > 0) {
              const roundedUp = Math.ceil(rawSuggested / si.packageQty) * si.packageQty;
              const roundedDown = Math.floor(rawSuggested / si.packageQty) * si.packageQty;

              // Round down if rounding up would exceed max
              if (si.quantityOnHand + si.quantityOnOrder + roundedUp > si.currentMax) {
                suggestedQty = roundedDown;
              } else {
                suggestedQty = roundedUp;
              }
            }

            items.push({
              stationItem: si,
              station,
              suggestedQty,
            });
          }
        });
      });

    return items;
  })();

  // Group reorder items by station (computed, not a hook)
  const reorderItemsByStation = (() => {
    const grouped = new Map<string, typeof getReorderItems>();
    getReorderItems.forEach(item => {
      const existing = grouped.get(item.station.id) || [];
      existing.push(item);
      grouped.set(item.station.id, existing);
    });
    return grouped;
  })();

  // Get reorder quantity (user-edited or suggested)
  const getReorderQty = (stationItemId: string, suggestedQty: number) => {
    return reorderQtys[stationItemId] ?? suggestedQty;
  };

  // Handle reorder quantity change with validation
  // maxOrderQty is the suggested qty (max - QOH - onOrder) - user cannot order more than this
  const handleReorderQtyChange = (stationItemId: string, value: string, maxOrderQty: number, packageQty: number) => {
    const numValue = parseInt(value) || 0;

    // Check for errors
    let error = "";

    if (numValue > maxOrderQty) {
      error = `Cannot exceed ${maxOrderQty}`;
    } else if (packageQty > 1 && numValue > 0 && numValue % packageQty !== 0) {
      error = `Must be multiple of ${packageQty}`;
    }

    if (error) {
      setQtyErrors(prev => ({ ...prev, [stationItemId]: error }));
    } else {
      setQtyErrors(prev => {
        const next = { ...prev };
        delete next[stationItemId];
        return next;
      });
    }

    // Always set the value so user sees what they typed
    setReorderQtys(prev => ({ ...prev, [stationItemId]: numValue }));
  };

  // Toggle item selection
  const toggleItemSelection = (stationItemId: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(stationItemId)) {
        next.delete(stationItemId);
      } else {
        next.add(stationItemId);
      }
      return next;
    });
  };

  // Toggle all items in a station
  const toggleStationSelection = (stationId: string) => {
    const stationItems = reorderItemsByStation.get(stationId) || [];
    const stationItemIds = stationItems.map(item => item.stationItem.id);
    const allSelected = stationItemIds.every(id => selectedItems.has(id));

    setSelectedItems(prev => {
      const next = new Set(prev);
      if (allSelected) {
        stationItemIds.forEach(id => next.delete(id));
      } else {
        stationItemIds.forEach(id => next.add(id));
      }
      return next;
    });
  };

  // Check if all items in a station are selected
  const isStationAllSelected = (stationId: string) => {
    const stationItems = reorderItemsByStation.get(stationId) || [];
    if (stationItems.length === 0) return false;
    return stationItems.every(item => selectedItems.has(item.stationItem.id));
  };

  // Check if some items in a station are selected
  const isStationPartialSelected = (stationId: string) => {
    const stationItems = reorderItemsByStation.get(stationId) || [];
    const selectedCount = stationItems.filter(item => selectedItems.has(item.stationItem.id)).length;
    return selectedCount > 0 && selectedCount < stationItems.length;
  };

  return (
    <ForgeLayout>
      <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-4 opacity-0 animate-fade-in-up">
          <span className="font-[family-name:var(--font-jetbrains)]">SYS://</span>
          <Link href="/" className="hover:text-[var(--foreground)] transition-colors">Dashboard</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/customers" className="hover:text-[var(--foreground)] transition-colors">Customers</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[var(--foreground)]">{customer.code}</span>
        </div>

        {/* Customer header */}
        <div className="flex items-start justify-between mb-8 opacity-0 animate-fade-in-up stagger-1">
          <div>
            <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight mb-2">
              {customer.name}
            </h1>
            <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
              <span className="font-[family-name:var(--font-jetbrains)] text-[var(--copper)]">
                {customer.code}
              </span>
              {(customer.city || customer.state) && (
                <>
                  <span className="text-[var(--border)]">|</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {customer.address && `${customer.address}, `}
                    {customer.city && `${customer.city}, `}
                    {customer.state} {customer.zip}
                  </span>
                </>
              )}
            </div>
          </div>

          <Button
            onClick={handleGenerateRecommendations}
            disabled={generateMutation.isPending}
            className="bg-[var(--copper)] hover:bg-[var(--copper-light)] text-[var(--background)] font-medium gap-2"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Analysis
              </>
            )}
          </Button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="opacity-0 animate-fade-in-up stagger-2">
            <StatCard
              label="Vending Stations"
              value={customer.vendingStations.length}
              sublabel="Connected cribs"
              icon={<Warehouse className="w-4 h-4" />}
            />
          </div>
          <div className="opacity-0 animate-fade-in-up stagger-3">
            <StatCard
              label="Total Items"
              value={totalItems}
              sublabel="Across all stations"
              icon={<Box className="w-4 h-4" />}
            />
          </div>
          <div className="opacity-0 animate-fade-in-up stagger-4">
            <StatCard
              label="Low Stock"
              value={lowStockItems}
              sublabel="Items at or below min"
              variant={lowStockItems > 0 ? "warning" : "default"}
              icon={<AlertTriangle className="w-4 h-4" />}
            />
          </div>
          <div className="opacity-0 animate-fade-in-up stagger-5">
            <StatCard
              label="Pending Actions"
              value={recommendations?.length ?? 0}
              sublabel="Recommendations to review"
              variant={(recommendations?.length ?? 0) > 0 ? "highlight" : "default"}
              icon={<Clock className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="opacity-0 animate-fade-in-up stagger-6">
          <Tabs defaultValue="reorder" className="space-y-6">
            <TabsList className="bg-[var(--card)] border border-[var(--border)] p-1">
              <TabsTrigger
                value="reorder"
                className="data-[state=active]:bg-[var(--copper)] data-[state=active]:text-[var(--background)] text-[var(--muted-foreground)]"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Reorder
                {getReorderItems.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs rounded bg-[var(--status-warn)] text-[var(--background)]">
                    {getReorderItems.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="stations"
                className="data-[state=active]:bg-[var(--copper)] data-[state=active]:text-[var(--background)] text-[var(--muted-foreground)]"
              >
                <Warehouse className="w-4 h-4 mr-2" />
                Vending Stations
              </TabsTrigger>
              <TabsTrigger
                value="recommendations"
                className="data-[state=active]:bg-[var(--copper)] data-[state=active]:text-[var(--background)] text-[var(--muted-foreground)] gap-2"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Min/Max Recommendations
                {recommendations && recommendations.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs rounded bg-[var(--status-warn)] text-[var(--background)]">
                    {recommendations.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Reorder Tab */}
            <TabsContent value="reorder" className="space-y-6">
              {/* Filter Toggle and Station Filter */}
              <div className="forge-card rounded-lg p-4 relative z-20" style={{ overflow: 'visible' }}>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    {/* Filter Toggle */}
                    <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                      <Filter className="w-4 h-4" />
                      <span>Show items</span>
                    </div>
                    <div className="flex rounded-lg border border-[var(--border)] overflow-hidden">
                      <button
                        onClick={() => setReorderFilter("atMin")}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                          reorderFilter === "atMin"
                            ? "bg-[var(--copper)] text-[var(--background)]"
                            : "bg-[var(--background)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                        }`}
                      >
                        At or Below Min
                      </button>
                      <button
                        onClick={() => setReorderFilter("belowMax")}
                        className={`px-4 py-2 text-sm font-medium transition-colors border-l border-[var(--border)] ${
                          reorderFilter === "belowMax"
                            ? "bg-[var(--copper)] text-[var(--background)]"
                            : "bg-[var(--background)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                        }`}
                      >
                        Below Max
                      </button>
                    </div>

                    {/* Station Filter Dropdown */}
                    {customer.vendingStations.length > 1 && (
                      <>
                        <div className="h-6 w-px bg-[var(--border)]" />
                        <div className="relative">
                          <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-2 px-4 py-2 rounded bg-[var(--background)] border border-[var(--border)] hover:border-[var(--copper)]/50 transition-colors min-w-[240px] text-left"
                          >
                            <Warehouse className="w-4 h-4 text-[var(--muted-foreground)]" />
                            <span className="flex-1 text-sm text-[var(--foreground)] truncate">
                              {selectedStationId === "all"
                                ? `All Stations (${customer.vendingStations.length})`
                                : customer.vendingStations.find(s => s.id === selectedStationId)?.name || "Select Station"}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-[var(--muted-foreground)] transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                          </button>

                          {isDropdownOpen && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                              <div className="absolute top-full left-0 mt-1 w-full min-w-[280px] max-h-[400px] overflow-y-auto bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-xl z-50">
                                <button
                                  onClick={() => { setSelectedStationId("all"); setIsDropdownOpen(false); }}
                                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--accent)] transition-colors ${
                                    selectedStationId === "all" ? "bg-[var(--copper)]/10 border-l-2 border-[var(--copper)]" : ""
                                  }`}
                                >
                                  <div className="w-8 h-8 rounded bg-[var(--accent)] flex items-center justify-center">
                                    <Warehouse className="w-4 h-4 text-[var(--copper)]" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[var(--foreground)]">All Stations</p>
                                    <p className="text-xs text-[var(--muted-foreground)]">{customer.vendingStations.length} stations</p>
                                  </div>
                                  {selectedStationId === "all" && <div className="w-2 h-2 rounded-full bg-[var(--copper)]" />}
                                </button>
                                <div className="border-t border-[var(--border)] my-1" />
                                {customer.vendingStations.map((station) => (
                                  <button
                                    key={station.id}
                                    onClick={() => { setSelectedStationId(station.id); setIsDropdownOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--accent)] transition-colors ${
                                      selectedStationId === station.id ? "bg-[var(--copper)]/10 border-l-2 border-[var(--copper)]" : ""
                                    }`}
                                  >
                                    <div className="w-8 h-8 rounded bg-[var(--accent)] flex items-center justify-center text-xs font-medium text-[var(--muted-foreground)]">
                                      {station.vendingType === "AUTOCRIB" ? "AC" : "CM"}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-[var(--foreground)] truncate">{station.name}</p>
                                      <p className="text-xs text-[var(--muted-foreground)]">{station.stationItems.length} items</p>
                                    </div>
                                    {selectedStationId === station.id && <div className="w-2 h-2 rounded-full bg-[var(--copper)]" />}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Selected count */}
                  {selectedItems.size > 0 && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-[var(--muted-foreground)]">
                        <span className="font-[family-name:var(--font-jetbrains)] text-[var(--foreground)]">{selectedItems.size}</span> items selected
                      </span>
                      <Button
                        className="bg-[var(--copper)] hover:bg-[var(--copper-light)] text-[var(--background)] font-medium gap-2"
                        disabled={Object.keys(qtyErrors).length > 0}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Create Order
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Reorder Items by Station */}
              {getReorderItems.length > 0 ? (
                Array.from(reorderItemsByStation.entries()).map(([stationId, items]) => {
                  const station = items[0].station;
                  const allSelected = isStationAllSelected(stationId);
                  const partialSelected = isStationPartialSelected(stationId);

                  return (
                    <div key={stationId} className="forge-card rounded-lg overflow-hidden">
                      {/* Station header */}
                      <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {/* Select all checkbox */}
                          <button
                            onClick={() => toggleStationSelection(stationId)}
                            className="flex items-center justify-center w-5 h-5 rounded border border-[var(--border)] hover:border-[var(--copper)] transition-colors"
                            style={{
                              backgroundColor: allSelected ? 'var(--copper)' : partialSelected ? 'var(--copper)' : 'transparent',
                              borderColor: allSelected || partialSelected ? 'var(--copper)' : undefined,
                            }}
                          >
                            {allSelected && <Check className="w-3 h-3 text-[var(--background)]" />}
                            {partialSelected && !allSelected && <Minus className="w-3 h-3 text-[var(--background)]" />}
                          </button>
                          <div className="w-10 h-10 rounded bg-[var(--copper)]/10 flex items-center justify-center">
                            <Warehouse className="w-5 h-5 text-[var(--copper)]" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-[var(--foreground)]">{station.name}</h3>
                            <p className="text-sm text-[var(--muted-foreground)]">
                              {station.location} • <span className="uppercase text-xs tracking-wider">{station.vendingType}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[var(--status-warn)]/10 border border-[var(--status-warn)]/20">
                          <AlertTriangle className="w-3.5 h-3.5 text-[var(--status-warn)]" />
                          <span className="text-sm font-medium text-[var(--status-warn)]">
                            {items.length} items need reorder
                          </span>
                        </div>
                      </div>

                      {/* Items table */}
                      <div className="overflow-auto max-h-[500px]">
                        <table className="w-full">
                          <thead className="sticky top-0 z-10">
                            <tr className="border-b border-[var(--border)] bg-[var(--card)]">
                              <th className="text-left px-6 py-3 text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-medium bg-[var(--card)] w-12"></th>
                              <th className="text-left px-6 py-3 text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-medium bg-[var(--card)]">Part Number</th>
                              <th className="text-left px-6 py-3 text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-medium bg-[var(--card)]">Description</th>
                              <th className="text-right px-6 py-3 text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-medium bg-[var(--card)]">QOH</th>
                              <th className="text-right px-6 py-3 text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-medium bg-[var(--card)]">Min</th>
                              <th className="text-right px-6 py-3 text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-medium bg-[var(--card)]">Max</th>
                              <th className="text-right px-6 py-3 text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-medium bg-[var(--card)]">Pkg</th>
                              <th className="text-right px-6 py-3 text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-medium bg-[var(--card)]">On Order</th>
                              <th className="text-right px-6 py-3 text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-medium bg-[var(--card)]">ERP QOH</th>
                              <th className="text-left px-6 py-3 text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-medium bg-[var(--card)]">Inbound POs</th>
                              <th className="text-right px-6 py-3 text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-medium bg-[var(--card)]">Order Qty</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map(({ stationItem: si, suggestedQty }) => {
                              const isSelected = selectedItems.has(si.id);
                              const currentQty = getReorderQty(si.id, suggestedQty);
                              const hasError = qtyErrors[si.id];
                              const isLow = si.quantityOnHand <= si.currentMin;
                              const isCritical = si.quantityOnHand === 0;
                              const erpInv = erpInventoryByItem.get(si.itemId) || [];
                              const pos = posByItem.get(si.itemId) || [];
                              const totalErpQoh = erpInv.reduce((sum, inv) => sum + inv.quantityOnHand, 0);

                              return (
                                <tr
                                  key={si.id}
                                  className={`border-b border-[var(--border)] transition-colors hover:bg-[var(--copper)]/5 ${
                                    isSelected ? "bg-[var(--copper)]/10" : isCritical ? "bg-[var(--status-critical)]/5" : isLow ? "bg-[var(--status-warn)]/5" : ""
                                  }`}
                                >
                                  <td className="px-6 py-3">
                                    <button
                                      onClick={() => toggleItemSelection(si.id)}
                                      className="flex items-center justify-center w-5 h-5 rounded border transition-colors"
                                      style={{
                                        backgroundColor: isSelected ? 'var(--copper)' : 'transparent',
                                        borderColor: isSelected ? 'var(--copper)' : 'var(--border)',
                                      }}
                                    >
                                      {isSelected && <Check className="w-3 h-3 text-[var(--background)]" />}
                                    </button>
                                  </td>
                                  <td className="px-6 py-3">
                                    <span className="font-[family-name:var(--font-jetbrains)] text-sm text-[var(--foreground)]">
                                      {si.item.partNumber}
                                    </span>
                                  </td>
                                  <td className="px-6 py-3">
                                    <span className="text-sm text-[var(--muted-foreground)]">
                                      {si.item.description}
                                    </span>
                                  </td>
                                  <td className="px-6 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      {isCritical && <span className="status-dot status-dot-critical" />}
                                      {isLow && !isCritical && <span className="status-dot status-dot-warn" />}
                                      <span className={`font-[family-name:var(--font-jetbrains)] text-sm font-medium ${
                                        isCritical ? "text-[var(--status-critical)]" : isLow ? "text-[var(--status-warn)]" : "text-[var(--foreground)]"
                                      }`}>
                                        {si.quantityOnHand}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-3 text-right">
                                    <span className="font-[family-name:var(--font-jetbrains)] text-sm text-[var(--muted-foreground)]">
                                      {si.currentMin}
                                    </span>
                                  </td>
                                  <td className="px-6 py-3 text-right">
                                    <span className="font-[family-name:var(--font-jetbrains)] text-sm text-[var(--muted-foreground)]">
                                      {si.currentMax}
                                    </span>
                                  </td>
                                  <td className="px-6 py-3 text-right">
                                    <span className="font-[family-name:var(--font-jetbrains)] text-sm text-[var(--muted-foreground)]">
                                      {si.packageQty}
                                    </span>
                                  </td>
                                  <td className="px-6 py-3 text-right">
                                    {si.quantityOnOrder > 0 ? (
                                      <span className="font-[family-name:var(--font-jetbrains)] text-sm text-[var(--status-info)]">
                                        {si.quantityOnOrder}
                                      </span>
                                    ) : (
                                      <span className="text-[var(--muted-foreground)]">—</span>
                                    )}
                                  </td>
                                  <td className="px-6 py-3 text-right">
                                    <div className="flex flex-col items-end">
                                      <span className="font-[family-name:var(--font-jetbrains)] text-sm text-[var(--foreground)]">
                                        {totalErpQoh}
                                      </span>
                                      {erpInv.length > 1 && (
                                        <span className="text-xs text-[var(--muted-foreground)]">
                                          {erpInv.length} branches
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-3">
                                    {pos.length > 0 ? (
                                      <div className="space-y-1">
                                        {pos.map((po) => (
                                          <div key={po.id} className="flex items-center gap-2 text-xs">
                                            <Truck className="w-3 h-3 text-[var(--status-ok)]" />
                                            <span className="font-[family-name:var(--font-jetbrains)] text-[var(--status-ok)]">
                                              {po.quantityOrdered - po.quantityReceived}
                                            </span>
                                            <span className="text-[var(--muted-foreground)]">
                                              due{" "}
                                              {po.purchaseOrder.expectedDeliveryDate
                                                ? new Date(po.purchaseOrder.expectedDeliveryDate).toLocaleDateString()
                                                : "TBD"}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-[var(--muted-foreground)]">—</span>
                                    )}
                                  </td>
                                  <td className="px-6 py-3 text-right">
                                    <div className="flex flex-col items-end gap-1">
                                      <input
                                        type="number"
                                        min="0"
                                        max={suggestedQty}
                                        value={currentQty}
                                        onChange={(e) => handleReorderQtyChange(si.id, e.target.value, suggestedQty, si.packageQty)}
                                        className={`w-20 px-2 py-1 rounded text-right font-[family-name:var(--font-jetbrains)] text-sm bg-[var(--background)] border transition-colors focus:outline-none focus:ring-1 ${
                                          hasError
                                            ? "border-[var(--status-critical)] focus:border-[var(--status-critical)] focus:ring-[var(--status-critical)]/20"
                                            : "border-[var(--border)] focus:border-[var(--copper)] focus:ring-[var(--copper)]/20"
                                        }`}
                                      />
                                      {hasError && (
                                        <span className="text-xs text-[var(--status-critical)]">{hasError}</span>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="forge-card rounded-lg p-12 text-center">
                  <CheckCircle2 className="w-12 h-12 text-[var(--status-ok)] mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">
                    No items need reorder
                  </h3>
                  <p className="text-sm text-[var(--muted-foreground)] max-w-sm mx-auto">
                    {reorderFilter === "atMin"
                      ? "All items are above their minimum stock levels."
                      : "All items are at their maximum stock levels."}
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Stations Tab */}
            <TabsContent value="stations" className="space-y-6">
              {/* Station Filter */}
              {customer.vendingStations.length > 1 && (
                <div className="forge-card rounded-lg p-4" style={{ overflow: 'visible' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                        <Filter className="w-4 h-4" />
                        <span>Filter by Station</span>
                      </div>

                      {/* Custom Dropdown */}
                      <div className="relative">
                        <button
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className="flex items-center gap-2 px-4 py-2 rounded bg-[var(--background)] border border-[var(--border)] hover:border-[var(--copper)]/50 transition-colors min-w-[280px] text-left"
                        >
                          <Warehouse className="w-4 h-4 text-[var(--muted-foreground)]" />
                          <span className="flex-1 text-sm text-[var(--foreground)] truncate">
                            {selectedStationId === "all"
                              ? `All Stations (${customer.vendingStations.length})`
                              : customer.vendingStations.find(s => s.id === selectedStationId)?.name || "Select Station"}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-[var(--muted-foreground)] transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                        </button>

                        {isDropdownOpen && (
                          <>
                            {/* Backdrop */}
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setIsDropdownOpen(false)}
                            />

                            {/* Dropdown Menu */}
                            <div className="absolute top-full left-0 mt-1 w-full min-w-[320px] max-h-[400px] overflow-y-auto bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-xl z-50">
                              {/* All Stations Option */}
                              <button
                                onClick={() => {
                                  setSelectedStationId("all");
                                  setIsDropdownOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--accent)] transition-colors ${
                                  selectedStationId === "all" ? "bg-[var(--copper)]/10 border-l-2 border-[var(--copper)]" : ""
                                }`}
                              >
                                <div className="w-8 h-8 rounded bg-[var(--accent)] flex items-center justify-center">
                                  <Warehouse className="w-4 h-4 text-[var(--copper)]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-[var(--foreground)]">All Stations</p>
                                  <p className="text-xs text-[var(--muted-foreground)]">
                                    {customer.vendingStations.length} stations • {customer.vendingStations.reduce((a, s) => a + s.stationItems.length, 0)} items
                                  </p>
                                </div>
                                {selectedStationId === "all" && (
                                  <div className="w-2 h-2 rounded-full bg-[var(--copper)]" />
                                )}
                              </button>

                              <div className="border-t border-[var(--border)] my-1" />

                              {/* Individual Stations */}
                              {customer.vendingStations.map((station) => {
                                const lowStock = station.stationItems.filter(si => si.quantityOnHand <= si.currentMin).length;
                                return (
                                  <button
                                    key={station.id}
                                    onClick={() => {
                                      setSelectedStationId(station.id);
                                      setIsDropdownOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--accent)] transition-colors ${
                                      selectedStationId === station.id ? "bg-[var(--copper)]/10 border-l-2 border-[var(--copper)]" : ""
                                    }`}
                                  >
                                    <div className="w-8 h-8 rounded bg-[var(--accent)] flex items-center justify-center text-xs font-medium text-[var(--muted-foreground)]">
                                      {station.vendingType === "AUTOCRIB" ? "AC" : "CM"}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-[var(--foreground)] truncate">{station.name}</p>
                                      <p className="text-xs text-[var(--muted-foreground)]">
                                        {station.stationItems.length} items
                                        {lowStock > 0 && (
                                          <span className="text-[var(--status-warn)] ml-2">• {lowStock} low</span>
                                        )}
                                      </p>
                                    </div>
                                    {selectedStationId === station.id && (
                                      <div className="w-2 h-2 rounded-full bg-[var(--copper)]" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Clear Filter Button */}
                      {selectedStationId !== "all" && (
                        <button
                          onClick={() => setSelectedStationId("all")}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                        >
                          <X className="w-3 h-3" />
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Current Filter Info */}
                    {selectedStationId !== "all" && (
                      <div className="text-sm text-[var(--muted-foreground)]">
                        Showing{" "}
                        <span className="font-[family-name:var(--font-jetbrains)] text-[var(--foreground)]">
                          {customer.vendingStations.find(s => s.id === selectedStationId)?.stationItems.length || 0}
                        </span>{" "}
                        items
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Filtered Stations */}
              {customer.vendingStations
                .filter(station => selectedStationId === "all" || station.id === selectedStationId)
                .map((station, stationIndex) => (
                <div
                  key={station.id}
                  className="forge-card rounded-lg overflow-hidden"
                  style={{ animationDelay: `${0.4 + stationIndex * 0.1}s` }}
                >
                  {/* Station header */}
                  <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded bg-[var(--copper)]/10 flex items-center justify-center">
                        <Warehouse className="w-5 h-5 text-[var(--copper)]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[var(--foreground)]">{station.name}</h3>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          {station.location} • <span className="uppercase text-xs tracking-wider">{station.vendingType}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[var(--accent)] border border-[var(--border)]">
                      <Package className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                      <span className="text-sm font-medium text-[var(--foreground)]">
                        {station.stationItems.length} items
                      </span>
                    </div>
                  </div>

                  {/* Items table */}
                  <div className="overflow-auto max-h-[600px]">
                    <table className="w-full">
                      <thead className="sticky top-0 z-10">
                        <tr className="border-b border-[var(--border)] bg-[var(--card)]">
                          <th className="text-left px-6 py-3 text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-medium bg-[var(--card)]">Part Number</th>
                          <th className="text-left px-6 py-3 text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-medium bg-[var(--card)]">Description</th>
                          <th className="text-right px-6 py-3 text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-medium bg-[var(--card)]">QOH</th>
                          <th className="text-right px-6 py-3 text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-medium bg-[var(--card)]">Min</th>
                          <th className="text-right px-6 py-3 text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-medium bg-[var(--card)]">Max</th>
                          <th className="text-right px-6 py-3 text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-medium bg-[var(--card)]">Pkg</th>
                          <th className="text-right px-6 py-3 text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-medium bg-[var(--card)]">On Order</th>
                          <th className="text-right px-6 py-3 text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-medium bg-[var(--card)]">ERP QOH</th>
                          <th className="text-left px-6 py-3 text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-medium bg-[var(--card)]">Inbound POs</th>
                        </tr>
                      </thead>
                      <tbody>
                        {station.stationItems.map((si, itemIndex) => {
                          const erpInv = erpInventoryByItem.get(si.itemId) || [];
                          const pos = posByItem.get(si.itemId) || [];
                          const totalErpQoh = erpInv.reduce((sum, inv) => sum + inv.quantityOnHand, 0);
                          const isLow = si.quantityOnHand <= si.currentMin;
                          const isCritical = si.quantityOnHand === 0;

                          return (
                            <tr
                              key={si.id}
                              className={`border-b border-[var(--border)] transition-colors hover:bg-[var(--copper)]/5 ${
                                isCritical ? "bg-[var(--status-critical)]/5" : isLow ? "bg-[var(--status-warn)]/5" : ""
                              }`}
                            >
                              <td className="px-6 py-3">
                                <span className="font-[family-name:var(--font-jetbrains)] text-sm text-[var(--foreground)]">
                                  {si.item.partNumber}
                                </span>
                              </td>
                              <td className="px-6 py-3">
                                <span className="text-sm text-[var(--muted-foreground)]">
                                  {si.item.description}
                                </span>
                              </td>
                              <td className="px-6 py-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {isCritical && (
                                    <span className="status-dot status-dot-critical" />
                                  )}
                                  {isLow && !isCritical && (
                                    <span className="status-dot status-dot-warn" />
                                  )}
                                  <span
                                    className={`font-[family-name:var(--font-jetbrains)] text-sm font-medium ${
                                      isCritical
                                        ? "text-[var(--status-critical)]"
                                        : isLow
                                        ? "text-[var(--status-warn)]"
                                        : "text-[var(--foreground)]"
                                    }`}
                                  >
                                    {si.quantityOnHand}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-3 text-right">
                                <span className="font-[family-name:var(--font-jetbrains)] text-sm text-[var(--muted-foreground)]">
                                  {si.currentMin}
                                </span>
                              </td>
                              <td className="px-6 py-3 text-right">
                                <span className="font-[family-name:var(--font-jetbrains)] text-sm text-[var(--muted-foreground)]">
                                  {si.currentMax}
                                </span>
                              </td>
                              <td className="px-6 py-3 text-right">
                                <span className="font-[family-name:var(--font-jetbrains)] text-sm text-[var(--muted-foreground)]">
                                  {si.packageQty}
                                </span>
                              </td>
                              <td className="px-6 py-3 text-right">
                                {si.quantityOnOrder > 0 ? (
                                  <span className="font-[family-name:var(--font-jetbrains)] text-sm text-[var(--status-info)]">
                                    {si.quantityOnOrder}
                                  </span>
                                ) : (
                                  <span className="text-[var(--muted-foreground)]">—</span>
                                )}
                              </td>
                              <td className="px-6 py-3 text-right">
                                <div className="flex flex-col items-end">
                                  <span className="font-[family-name:var(--font-jetbrains)] text-sm text-[var(--foreground)]">
                                    {totalErpQoh}
                                  </span>
                                  {erpInv.length > 1 && (
                                    <span className="text-xs text-[var(--muted-foreground)]">
                                      {erpInv.length} branches
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-3">
                                {pos.length > 0 ? (
                                  <div className="space-y-1">
                                    {pos.map((po) => (
                                      <div key={po.id} className="flex items-center gap-2 text-xs">
                                        <Truck className="w-3 h-3 text-[var(--status-ok)]" />
                                        <span className="font-[family-name:var(--font-jetbrains)] text-[var(--status-ok)]">
                                          {po.quantityOrdered - po.quantityReceived}
                                        </span>
                                        <span className="text-[var(--muted-foreground)]">
                                          due{" "}
                                          {po.purchaseOrder.expectedDeliveryDate
                                            ? new Date(po.purchaseOrder.expectedDeliveryDate).toLocaleDateString()
                                            : "TBD"}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-[var(--muted-foreground)]">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              {customer.vendingStations.length === 0 && (
                <EmptyState
                  icon={<Warehouse className="w-6 h-6 text-[var(--muted-foreground)]" />}
                  title="No vending stations"
                  description="No vending stations are configured for this customer."
                />
              )}
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="space-y-6">
              {/* Station Filter for Recommendations */}
              {customer.vendingStations.length > 1 && recommendations && recommendations.length > 0 && (
                <div className="forge-card rounded-lg p-4" style={{ overflow: 'visible' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                        <Filter className="w-4 h-4" />
                        <span>Filter by Station</span>
                      </div>

                      {/* Custom Dropdown */}
                      <div className="relative">
                        <button
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className="flex items-center gap-2 px-4 py-2 rounded bg-[var(--background)] border border-[var(--border)] hover:border-[var(--copper)]/50 transition-colors min-w-[280px] text-left"
                        >
                          <Warehouse className="w-4 h-4 text-[var(--muted-foreground)]" />
                          <span className="flex-1 text-sm text-[var(--foreground)] truncate">
                            {selectedStationId === "all"
                              ? `All Stations (${customer.vendingStations.length})`
                              : customer.vendingStations.find(s => s.id === selectedStationId)?.name || "Select Station"}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-[var(--muted-foreground)] transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                        </button>

                        {isDropdownOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setIsDropdownOpen(false)}
                            />
                            <div className="absolute top-full left-0 mt-1 w-full min-w-[320px] max-h-[400px] overflow-y-auto bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-xl z-50">
                              <button
                                onClick={() => {
                                  setSelectedStationId("all");
                                  setIsDropdownOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--accent)] transition-colors ${
                                  selectedStationId === "all" ? "bg-[var(--copper)]/10 border-l-2 border-[var(--copper)]" : ""
                                }`}
                              >
                                <div className="w-8 h-8 rounded bg-[var(--accent)] flex items-center justify-center">
                                  <Warehouse className="w-4 h-4 text-[var(--copper)]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-[var(--foreground)]">All Stations</p>
                                  <p className="text-xs text-[var(--muted-foreground)]">
                                    {recommendations.length} recommendations
                                  </p>
                                </div>
                                {selectedStationId === "all" && (
                                  <div className="w-2 h-2 rounded-full bg-[var(--copper)]" />
                                )}
                              </button>

                              <div className="border-t border-[var(--border)] my-1" />

                              {customer.vendingStations.map((station) => {
                                const stationRecs = recommendations.filter(r => r.stationId === station.id).length;
                                if (stationRecs === 0) return null;
                                return (
                                  <button
                                    key={station.id}
                                    onClick={() => {
                                      setSelectedStationId(station.id);
                                      setIsDropdownOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--accent)] transition-colors ${
                                      selectedStationId === station.id ? "bg-[var(--copper)]/10 border-l-2 border-[var(--copper)]" : ""
                                    }`}
                                  >
                                    <div className="w-8 h-8 rounded bg-[var(--accent)] flex items-center justify-center text-xs font-medium text-[var(--muted-foreground)]">
                                      {station.vendingType === "AUTOCRIB" ? "AC" : "CM"}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-[var(--foreground)] truncate">{station.name}</p>
                                      <p className="text-xs text-[var(--muted-foreground)]">
                                        {stationRecs} recommendation{stationRecs !== 1 ? "s" : ""}
                                      </p>
                                    </div>
                                    {selectedStationId === station.id && (
                                      <div className="w-2 h-2 rounded-full bg-[var(--copper)]" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>

                      {selectedStationId !== "all" && (
                        <button
                          onClick={() => setSelectedStationId("all")}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                        >
                          <X className="w-3 h-3" />
                          Clear
                        </button>
                      )}
                    </div>

                    {selectedStationId !== "all" && (
                      <div className="text-sm text-[var(--muted-foreground)]">
                        Showing{" "}
                        <span className="font-[family-name:var(--font-jetbrains)] text-[var(--foreground)]">
                          {recommendations.filter(r => r.stationId === selectedStationId).length}
                        </span>{" "}
                        of {recommendations.length} recommendations
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="forge-card rounded-lg overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-[var(--foreground)]">Min/Max Recommendations</h3>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Based on 90-day usage analysis • Safety stock: 11 days • Min: 18 days • Max: 36 days
                    </p>
                  </div>
                  {recommendations && recommendations.length > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[var(--status-warn)]/10 border border-[var(--status-warn)]/20">
                      <AlertTriangle className="w-4 h-4 text-[var(--status-warn)]" />
                      <span className="text-sm font-medium text-[var(--status-warn)]">
                        {selectedStationId === "all"
                          ? recommendations.length
                          : recommendations.filter(r => r.stationId === selectedStationId).length} pending
                      </span>
                    </div>
                  )}
                </div>

                {recommendations && recommendations.length > 0 ? (
                  <div className="overflow-auto max-h-[600px]">
                    <table className="w-full">
                      <thead className="sticky top-0 z-10">
                        <tr className="border-b border-[var(--border)] bg-[var(--card)]">
                          <th className="text-left px-6 py-3 text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-medium bg-[var(--card)]">Part Number</th>
                          <th className="text-left px-6 py-3 text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-medium bg-[var(--card)]">Description</th>
                          {selectedStationId === "all" && (
                            <th className="text-left px-6 py-3 text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-medium bg-[var(--card)]">Station</th>
                          )}
                          <th className="text-right px-6 py-3 text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-medium bg-[var(--card)]">Avg Daily</th>
                          <th className="text-right px-6 py-3 text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-medium bg-[var(--card)]">Cur Min</th>
                          <th className="text-right px-6 py-3 text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-medium bg-[var(--card)]">Rec Min</th>
                          <th className="text-right px-6 py-3 text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-medium bg-[var(--card)]">Cur Max</th>
                          <th className="text-right px-6 py-3 text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-medium bg-[var(--card)]">Rec Max</th>
                          <th className="text-right px-6 py-3 text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-medium bg-[var(--card)]">Pkg</th>
                          <th className="text-right px-6 py-3 text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-medium bg-[var(--card)]">WH Backup</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recommendations
                          .filter(rec => selectedStationId === "all" || rec.stationId === selectedStationId)
                          .map((rec) => {
                          const station = customer.vendingStations.find(s => s.id === rec.stationId);
                          const minDiff = rec.recommendedMin - (rec.currentMin ?? 0);
                          const maxDiff = rec.recommendedMax - (rec.currentMax ?? 0);
                          const minChanged = rec.currentMin !== rec.recommendedMin;
                          const maxChanged = rec.currentMax !== rec.recommendedMax;

                          return (
                            <tr
                              key={rec.id}
                              className="border-b border-[var(--border)] transition-colors hover:bg-[var(--copper)]/5"
                            >
                              <td className="px-6 py-3">
                                <span className="font-[family-name:var(--font-jetbrains)] text-sm text-[var(--foreground)]">
                                  {rec.item.partNumber}
                                </span>
                              </td>
                              <td className="px-6 py-3">
                                <span className="text-sm text-[var(--muted-foreground)]">
                                  {rec.item.description}
                                </span>
                              </td>
                              {selectedStationId === "all" && (
                                <td className="px-6 py-3">
                                  <span className="text-sm text-[var(--muted-foreground)]">
                                    {station?.name || "—"}
                                  </span>
                                </td>
                              )}
                              <td className="px-6 py-3 text-right">
                                <span className="font-[family-name:var(--font-jetbrains)] text-sm text-[var(--foreground)]">
                                  {Number(rec.avgDailyUsage).toFixed(2)}
                                </span>
                              </td>
                              <td className="px-6 py-3 text-right">
                                <span className="font-[family-name:var(--font-jetbrains)] text-sm text-[var(--muted-foreground)]">
                                  {rec.currentMin ?? "—"}
                                </span>
                              </td>
                              <td className="px-6 py-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <span
                                    className={`font-[family-name:var(--font-jetbrains)] text-sm font-medium ${
                                      minChanged ? "text-[var(--copper)]" : "text-[var(--foreground)]"
                                    }`}
                                  >
                                    {rec.recommendedMin}
                                  </span>
                                  {minChanged && (
                                    <span className={`flex items-center text-xs ${minDiff > 0 ? "text-[var(--status-ok)]" : "text-[var(--status-warn)]"}`}>
                                      {minDiff > 0 ? (
                                        <ArrowUpRight className="w-3 h-3" />
                                      ) : (
                                        <ArrowDownRight className="w-3 h-3" />
                                      )}
                                      {Math.abs(minDiff)}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-3 text-right">
                                <span className="font-[family-name:var(--font-jetbrains)] text-sm text-[var(--muted-foreground)]">
                                  {rec.currentMax ?? "—"}
                                </span>
                              </td>
                              <td className="px-6 py-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <span
                                    className={`font-[family-name:var(--font-jetbrains)] text-sm font-medium ${
                                      maxChanged ? "text-[var(--copper)]" : "text-[var(--foreground)]"
                                    }`}
                                  >
                                    {rec.recommendedMax}
                                  </span>
                                  {maxChanged && (
                                    <span className={`flex items-center text-xs ${maxDiff > 0 ? "text-[var(--status-ok)]" : "text-[var(--status-warn)]"}`}>
                                      {maxDiff > 0 ? (
                                        <ArrowUpRight className="w-3 h-3" />
                                      ) : (
                                        <ArrowDownRight className="w-3 h-3" />
                                      )}
                                      {Math.abs(maxDiff)}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-3 text-right">
                                <span className="font-[family-name:var(--font-jetbrains)] text-sm text-[var(--muted-foreground)]">
                                  {rec.packageQty}
                                </span>
                              </td>
                              <td className="px-6 py-3 text-right">
                                <span className="font-[family-name:var(--font-jetbrains)] text-sm font-medium text-[var(--status-info)]">
                                  {rec.warehouseBackupQty}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="px-6 py-12 text-center">
                    <CheckCircle2 className="w-12 h-12 text-[var(--status-ok)] mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">
                      All caught up
                    </h3>
                    <p className="text-sm text-[var(--muted-foreground)] mb-6 max-w-sm mx-auto">
                      No pending recommendations. Run analysis to generate new optimization suggestions.
                    </p>
                    <Button
                      onClick={handleGenerateRecommendations}
                      disabled={generateMutation.isPending}
                      className="bg-[var(--copper)] hover:bg-[var(--copper-light)] text-[var(--background)] font-medium gap-2"
                    >
                      {generateMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Generate Recommendations
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ForgeLayout>
  );
}
