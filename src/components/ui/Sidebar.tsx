"use client";

import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Pill,
  FileText,
  Activity,
  Utensils,
  Dumbbell,
  Users,
  FolderOpen,
  Circle,
  MessageCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

interface SidebarProps {
  items: readonly NavItem[];
  title?: string;
  className?: string;
}

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  ClipboardList,
  Pill,
  FileText,
  Activity,
  Utensils,
  Dumbbell,
  Users,
  FolderOpen,
  MessageCircle,
  Circle,
};

function getIcon(name: string): LucideIcon {
  return iconMap[name] || Circle;
}

export function Sidebar({ items, title, className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "w-64 h-screen bg-white border-r border-border-light flex flex-col",
        "fixed left-0 top-0 z-40",
        className
      )}
    >
      {/* Logo */}
      <div className="p-6 border-b border-border-light">
        <h1 className="font-heading text-2xl tracking-wide text-accent-dark">
          {title || "DALILA LUCENA"}
        </h1>
        <p className="text-xs text-text-muted mt-1">CRM 15295</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {items.map((item) => {
            const Icon = getIcon(item.icon);
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" &&
                item.href !== "/paciente" &&
                pathname.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)]",
                    "text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-accent-gold/10 text-accent-gold-dark"
                      : "text-text-secondary hover:bg-surface hover:text-text-primary"
                  )}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
