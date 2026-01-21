"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Activity,
  Settings,
  Zap,
} from "lucide-react";

interface ForgeLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Customers", icon: Users },
];

export function ForgeLayout({ children }: ForgeLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--background)] forge-grid relative">
      {/* Ambient glow effect */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[var(--copper)] opacity-[0.03] blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 rounded bg-gradient-to-br from-[var(--copper)] to-[var(--copper-dark)] flex items-center justify-center">
                  <Zap className="w-5 h-5 text-[var(--background)]" strokeWidth={2.5} />
                </div>
                <div className="absolute inset-0 rounded bg-[var(--copper)] opacity-0 blur-lg group-hover:opacity-40 transition-opacity duration-300" />
              </div>
              <div className="flex flex-col">
                <span className="font-[family-name:var(--font-bebas)] text-2xl tracking-wider text-[var(--foreground)]">
                  FORGE
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted-foreground)] -mt-1">
                  Inventory Optimizer
                </span>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-[var(--copper)]/10 text-[var(--copper)] border border-[var(--copper)]/20"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Status indicator */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[var(--card)] border border-[var(--border)]">
                <Activity className="w-3.5 h-3.5 text-[var(--status-ok)]" />
                <span className="text-xs font-medium text-[var(--muted-foreground)]">
                  System Online
                </span>
                <span className="status-dot status-dot-ok" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] mt-auto">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
            <div className="flex items-center gap-4">
              <span className="font-[family-name:var(--font-jetbrains)]">v0.1.0</span>
              <span className="text-[var(--border)]">|</span>
              <span>Precision Inventory Control</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="opacity-50">Powered by</span>
              <span className="font-medium text-[var(--copper)]">FORGE</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Stat card component for dashboard
interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: React.ReactNode;
  variant?: "default" | "highlight" | "warning";
  className?: string;
}

export function StatCard({
  label,
  value,
  sublabel,
  trend,
  trendValue,
  icon,
  variant = "default",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "forge-card rounded-lg p-5 transition-all duration-300 hover:border-[var(--border-strong)]",
        variant === "highlight" && "border-[var(--copper)]/30 bg-gradient-to-br from-[var(--card)] to-[var(--copper)]/5",
        variant === "warning" && "border-[var(--status-warn)]/30",
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-medium">
          {label}
        </span>
        {icon && (
          <div className={cn(
            "p-2 rounded",
            variant === "highlight" ? "bg-[var(--copper)]/10 text-[var(--copper)]" : "bg-[var(--accent)] text-[var(--muted-foreground)]"
          )}>
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-end gap-3">
        <span className="font-[family-name:var(--font-jetbrains)] text-4xl font-semibold text-[var(--foreground)] tracking-tight">
          {value}
        </span>
        {trend && trendValue && (
          <span
            className={cn(
              "text-sm font-medium mb-1",
              trend === "up" && "text-[var(--status-ok)]",
              trend === "down" && "text-[var(--status-critical)]",
              trend === "neutral" && "text-[var(--muted-foreground)]"
            )}
          >
            {trend === "up" && "+"}{trendValue}
          </span>
        )}
      </div>

      {sublabel && (
        <p className="text-sm text-[var(--muted-foreground)] mt-2">{sublabel}</p>
      )}
    </div>
  );
}

// Section header component
interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function SectionHeader({ title, description, action }: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--foreground)] tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-[var(--muted-foreground)] mt-1">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

// Empty state component
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="forge-card rounded-lg p-12 text-center">
      {icon && (
        <div className="w-12 h-12 rounded-full bg-[var(--accent)] flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--muted-foreground)] mb-6 max-w-sm mx-auto">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
