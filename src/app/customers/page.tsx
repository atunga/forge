"use client";

import Link from "next/link";
import { useState } from "react";
import { ForgeLayout, SectionHeader, EmptyState } from "@/components/forge-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import {
  Search,
  MapPin,
  Warehouse,
  Box,
  AlertTriangle,
  ArrowRight,
  Filter,
  Grid3X3,
  List,
  Database,
  ChevronRight,
} from "lucide-react";

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { data: customers, isLoading } = trpc.customers.list.useQuery();

  const filteredCustomers = customers?.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ForgeLayout>
      <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="mb-8 opacity-0 animate-fade-in-up">
          <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-2">
            <span className="font-[family-name:var(--font-jetbrains)]">SYS://</span>
            <Link href="/" className="hover:text-[var(--foreground)] transition-colors">Dashboard</Link>
            <ChevronRight className="w-3 h-3" />
            <span>Customers</span>
          </div>
          <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">
            Customer Accounts
          </h1>
          <p className="text-[var(--muted-foreground)] mt-1">
            Manage and monitor all connected customer vending systems
          </p>
        </div>

        {/* Search and filters bar */}
        <div className="forge-card rounded-lg p-4 mb-8 opacity-0 animate-fade-in-up stagger-1">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              {/* Search input */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                <Input
                  placeholder="Search by name or account code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[var(--background)] border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--copper)] focus:ring-[var(--copper)]/20"
                />
              </div>

              {/* Filter button */}
              <Button
                variant="outline"
                className="gap-2 border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
              >
                <Filter className="w-4 h-4" />
                Filters
              </Button>
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-1 p-1 bg-[var(--background)] rounded border border-[var(--border)]">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded transition-colors ${
                  viewMode === "grid"
                    ? "bg-[var(--copper)] text-[var(--background)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded transition-colors ${
                  viewMode === "list"
                    ? "bg-[var(--copper)] text-[var(--background)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Results count */}
            <div className="text-sm text-[var(--muted-foreground)]">
              <span className="font-[family-name:var(--font-jetbrains)] text-[var(--foreground)]">
                {filteredCustomers?.length ?? 0}
              </span>{" "}
              results
            </div>
          </div>
        </div>

        {/* Customers content */}
        <div className="opacity-0 animate-fade-in-up stagger-2">
          {isLoading ? (
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="forge-card rounded-lg p-5 animate-pulse">
                  <div className="h-5 bg-[var(--accent)] rounded w-2/3 mb-3" />
                  <div className="h-4 bg-[var(--accent)] rounded w-1/3 mb-4" />
                  <div className="h-12 bg-[var(--accent)] rounded w-full" />
                </div>
              ))}
            </div>
          ) : filteredCustomers && filteredCustomers.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCustomers.map((customer, index) => (
                  <Link key={customer.id} href={`/customers/${customer.id}`}>
                    <div
                      className="forge-card rounded-lg p-5 cursor-pointer group transition-all duration-300 hover:border-[var(--copper)]/30 h-full"
                      style={{ animationDelay: `${index * 0.03}s` }}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[var(--foreground)] group-hover:text-[var(--copper)] transition-colors truncate">
                            {customer.name}
                          </h3>
                          <p className="text-sm font-[family-name:var(--font-jetbrains)] text-[var(--muted-foreground)]">
                            {customer.code}
                          </p>
                        </div>
                        {customer._count.recommendations > 0 && (
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[var(--status-warn)]/10 border border-[var(--status-warn)]/20 shrink-0">
                            <AlertTriangle className="w-3 h-3 text-[var(--status-warn)]" />
                            <span className="text-xs font-medium text-[var(--status-warn)]">
                              {customer._count.recommendations}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--border)]">
                        <div className="flex items-center gap-2">
                          <Warehouse className="w-4 h-4 text-[var(--muted-foreground)]" />
                          <div>
                            <p className="font-[family-name:var(--font-jetbrains)] text-sm font-medium text-[var(--foreground)]">
                              {customer.vendingStations.length}
                            </p>
                            <p className="text-xs text-[var(--muted-foreground)]">Stations</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Box className="w-4 h-4 text-[var(--muted-foreground)]" />
                          <div>
                            <p className="font-[family-name:var(--font-jetbrains)] text-sm font-medium text-[var(--foreground)]">
                              {customer.vendingStations.reduce((a, s) => a + s._count.stationItems, 0)}
                            </p>
                            <p className="text-xs text-[var(--muted-foreground)]">Items</p>
                          </div>
                        </div>
                      </div>

                      {/* Location */}
                      {(customer.city || customer.state) && (
                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[var(--border)]">
                          <MapPin className="w-3 h-3 text-[var(--muted-foreground)]" />
                          <p className="text-xs text-[var(--muted-foreground)]">
                            {customer.city && customer.state
                              ? `${customer.city}, ${customer.state}`
                              : customer.city || customer.state}
                          </p>
                        </div>
                      )}

                      {/* Vending types */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {[...new Set(customer.vendingStations.map((s) => s.vendingType))].map((type) => (
                          <span
                            key={type}
                            className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--accent)] text-[var(--muted-foreground)] border border-[var(--border)]"
                          >
                            {type}
                          </span>
                        ))}
                      </div>

                      {/* Hover indicator */}
                      <div className="flex items-center gap-1 mt-4 text-xs text-[var(--copper)] opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>View details</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              /* List view */
              <div className="space-y-2">
                {/* List header */}
                <div className="grid grid-cols-12 gap-4 px-5 py-3 text-xs uppercase tracking-wider text-[var(--muted-foreground)] border-b border-[var(--border)]">
                  <div className="col-span-4">Customer</div>
                  <div className="col-span-2 text-center">Stations</div>
                  <div className="col-span-2 text-center">Items</div>
                  <div className="col-span-2">Location</div>
                  <div className="col-span-2 text-right">Status</div>
                </div>

                {/* List items */}
                {filteredCustomers.map((customer, index) => (
                  <Link key={customer.id} href={`/customers/${customer.id}`}>
                    <div
                      className="grid grid-cols-12 gap-4 items-center forge-card rounded-lg px-5 py-4 cursor-pointer group transition-all duration-200 hover:border-[var(--copper)]/30"
                      style={{ animationDelay: `${index * 0.02}s` }}
                    >
                      {/* Customer info */}
                      <div className="col-span-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-[var(--accent)] flex items-center justify-center text-[var(--copper)] font-semibold">
                            {customer.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-medium text-[var(--foreground)] group-hover:text-[var(--copper)] transition-colors truncate">
                              {customer.name}
                            </h3>
                            <p className="text-sm font-[family-name:var(--font-jetbrains)] text-[var(--muted-foreground)]">
                              {customer.code}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Stations */}
                      <div className="col-span-2 text-center">
                        <span className="font-[family-name:var(--font-jetbrains)] text-[var(--foreground)]">
                          {customer.vendingStations.length}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="col-span-2 text-center">
                        <span className="font-[family-name:var(--font-jetbrains)] text-[var(--foreground)]">
                          {customer.vendingStations.reduce((a, s) => a + s._count.stationItems, 0)}
                        </span>
                      </div>

                      {/* Location */}
                      <div className="col-span-2">
                        <span className="text-sm text-[var(--muted-foreground)]">
                          {customer.city && customer.state
                            ? `${customer.city}, ${customer.state}`
                            : "—"}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="col-span-2 flex justify-end">
                        {customer._count.recommendations > 0 ? (
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[var(--status-warn)]/10 border border-[var(--status-warn)]/20">
                            <AlertTriangle className="w-3 h-3 text-[var(--status-warn)]" />
                            <span className="text-xs font-medium text-[var(--status-warn)]">
                              {customer._count.recommendations} pending
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[var(--status-ok)]/10 border border-[var(--status-ok)]/20">
                            <span className="status-dot status-dot-ok" style={{ width: 6, height: 6 }} />
                            <span className="text-xs font-medium text-[var(--status-ok)]">
                              Optimized
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )
          ) : (
            <EmptyState
              icon={<Database className="w-6 h-6 text-[var(--muted-foreground)]" />}
              title={searchQuery ? `No results for "${searchQuery}"` : "No customers found"}
              description={
                searchQuery
                  ? "Try adjusting your search terms or filters."
                  : "Run the database seed script to populate sample data for testing."
              }
              action={
                !searchQuery && (
                  <div className="font-[family-name:var(--font-jetbrains)] text-sm bg-[var(--accent)] px-4 py-2 rounded border border-[var(--border)]">
                    npm run db:seed
                  </div>
                )
              }
            />
          )}
        </div>
      </div>
    </ForgeLayout>
  );
}
