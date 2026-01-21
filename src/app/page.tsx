"use client";

import Link from "next/link";
import { ForgeLayout, StatCard, SectionHeader, EmptyState } from "@/components/forge-layout";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import {
  Users,
  Box,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Warehouse,
  ChevronRight,
  Database,
} from "lucide-react";

export default function DashboardPage() {
  const { data: customers, isLoading } = trpc.customers.list.useQuery();

  const totalCustomers = customers?.length ?? 0;
  const totalStations = customers?.reduce((acc, c) => acc + c.vendingStations.length, 0) ?? 0;
  const pendingRecommendations = customers?.reduce((acc, c) => acc + c._count.recommendations, 0) ?? 0;
  const totalItems = customers?.reduce(
    (acc, c) => acc + c.vendingStations.reduce((a, s) => a + s._count.stationItems, 0),
    0
  ) ?? 0;

  return (
    <ForgeLayout>
      <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="mb-8 opacity-0 animate-fade-in-up">
          <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-2">
            <span className="font-[family-name:var(--font-jetbrains)]">SYS://</span>
            <span>Overview</span>
          </div>
          <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">
            Control Dashboard
          </h1>
          <p className="text-[var(--muted-foreground)] mt-1">
            Real-time inventory optimization metrics and system status
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="opacity-0 animate-fade-in-up stagger-1">
            <StatCard
              label="Total Customers"
              value={isLoading ? "—" : totalCustomers}
              sublabel="Active accounts"
              icon={<Users className="w-4 h-4" />}
            />
          </div>
          <div className="opacity-0 animate-fade-in-up stagger-2">
            <StatCard
              label="Vending Stations"
              value={isLoading ? "—" : totalStations}
              sublabel="Connected cribs"
              icon={<Warehouse className="w-4 h-4" />}
            />
          </div>
          <div className="opacity-0 animate-fade-in-up stagger-3">
            <StatCard
              label="Items Tracked"
              value={isLoading ? "—" : totalItems.toLocaleString()}
              sublabel="Across all stations"
              icon={<Box className="w-4 h-4" />}
            />
          </div>
          <div className="opacity-0 animate-fade-in-up stagger-4">
            <StatCard
              label="Pending Actions"
              value={isLoading ? "—" : pendingRecommendations}
              sublabel="Recommendations awaiting review"
              variant={pendingRecommendations > 0 ? "warning" : "default"}
              icon={<AlertTriangle className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Quick actions bar */}
        <div className="forge-card rounded-lg p-4 mb-10 opacity-0 animate-fade-in-up stagger-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[var(--status-ok)]" />
                <span className="text-sm text-[var(--muted-foreground)]">
                  All systems operational
                </span>
              </div>
              <div className="h-4 w-px bg-[var(--border)]" />
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[var(--status-ok)]" />
                <span className="text-sm text-[var(--muted-foreground)]">
                  Last sync: <span className="font-[family-name:var(--font-jetbrains)] text-[var(--foreground)]">2 min ago</span>
                </span>
              </div>
            </div>
            <Link href="/customers">
              <Button className="bg-[var(--copper)] hover:bg-[var(--copper-light)] text-[var(--background)] font-medium gap-2">
                View All Customers
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent customers section */}
        <div className="opacity-0 animate-fade-in-up stagger-6">
          <SectionHeader
            title="Recent Customers"
            description="Quick access to recently active customer accounts"
            action={
              <Link href="/customers" className="text-sm text-[var(--copper)] hover:text-[var(--copper-light)] font-medium flex items-center gap-1">
                View all
                <ChevronRight className="w-4 h-4" />
              </Link>
            }
          />

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="forge-card rounded-lg p-5 animate-pulse">
                  <div className="h-5 bg-[var(--accent)] rounded w-2/3 mb-3" />
                  <div className="h-4 bg-[var(--accent)] rounded w-1/3 mb-4" />
                  <div className="h-8 bg-[var(--accent)] rounded w-full" />
                </div>
              ))}
            </div>
          ) : customers && customers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customers.slice(0, 6).map((customer, index) => (
                <Link key={customer.id} href={`/customers/${customer.id}`}>
                  <div
                    className="forge-card rounded-lg p-5 cursor-pointer group transition-all duration-300 hover:border-[var(--copper)]/30"
                    style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                  >
                    {/* Customer header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-[var(--foreground)] group-hover:text-[var(--copper)] transition-colors">
                          {customer.name}
                        </h3>
                        <p className="text-sm font-[family-name:var(--font-jetbrains)] text-[var(--muted-foreground)]">
                          {customer.code}
                        </p>
                      </div>
                      {customer._count.recommendations > 0 && (
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[var(--status-warn)]/10 border border-[var(--status-warn)]/20">
                          <span className="status-dot status-dot-warn" style={{ width: 6, height: 6 }} />
                          <span className="text-xs font-medium text-[var(--status-warn)]">
                            {customer._count.recommendations}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[var(--border)]">
                      <div>
                        <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-1">Stations</p>
                        <p className="font-[family-name:var(--font-jetbrains)] text-lg font-medium text-[var(--foreground)]">
                          {customer.vendingStations.length}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-1">Items</p>
                        <p className="font-[family-name:var(--font-jetbrains)] text-lg font-medium text-[var(--foreground)]">
                          {customer.vendingStations.reduce((a, s) => a + s._count.stationItems, 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-1">Type</p>
                        <p className="text-sm font-medium text-[var(--foreground)] truncate">
                          {[...new Set(customer.vendingStations.map((s) => s.vendingType))][0] || "—"}
                        </p>
                      </div>
                    </div>

                    {/* Location */}
                    {(customer.city || customer.state) && (
                      <div className="mt-4 pt-3 border-t border-[var(--border)]">
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {customer.city && customer.state
                            ? `${customer.city}, ${customer.state}`
                            : customer.city || customer.state}
                        </p>
                      </div>
                    )}

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
            <EmptyState
              icon={<Database className="w-6 h-6 text-[var(--muted-foreground)]" />}
              title="No customers found"
              description="Run the database seed script to populate sample data for testing."
              action={
                <div className="font-[family-name:var(--font-jetbrains)] text-sm bg-[var(--accent)] px-4 py-2 rounded border border-[var(--border)]">
                  npm run db:seed
                </div>
              }
            />
          )}
        </div>
      </div>
    </ForgeLayout>
  );
}
