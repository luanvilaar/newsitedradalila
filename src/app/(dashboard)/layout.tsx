"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/ui/Sidebar";
import { NAV_PATIENT, NAV_ADMIN } from "@/lib/constants";
import { LogOut, Menu, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { ChatWidget } from "@/components/shared/ChatWidget";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isAdmin = pathname.startsWith("/admin");
  const navItems = isAdmin ? NAV_ADMIN : NAV_PATIENT;

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "md:block",
          sidebarOpen ? "block" : "hidden"
        )}
      >
        <Sidebar
          items={navItems}
          title="DALILA LUCENA"
          className="z-40"
          onNavClick={() => setSidebarOpen(false)}
        />

        {/* Logout button inside sidebar */}
        <div className="fixed left-0 bottom-0 w-64 p-4 border-t border-border-light bg-white z-40">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-sm text-text-secondary hover:text-error w-full rounded-[var(--radius-md)] hover:bg-surface transition-colors cursor-pointer"
          >
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="md:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-border-light px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 text-text-secondary hover:text-text-primary cursor-pointer"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-muted">
              {isAdmin ? "Painel Administrativo" : "Área do Paciente"}
            </span>
          </div>
          <div />
        </header>

        {/* Page content */}
        <main className="p-6 md:p-8">{children}</main>
      </div>

      <ChatWidget />
    </div>
  );
}
