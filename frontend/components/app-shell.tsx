"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { AppSidebar } from "./app-sidebar"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface AppShellProps {
  children: ReactNode
  headerExtra?: ReactNode
}

export function AppShell({ children, headerExtra }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar para escritorio */}
      <div className="hidden md:flex">
        <AppSidebar />
      </div>

      {/* Sidebar móvil */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-50 h-full w-64 animate-in slide-in-from-left">
            <AppSidebar />
          </div>
        </div>
      )}

      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Header móvil */}
        <div className="flex h-14 items-center gap-3 border-b border-border bg-card px-4 md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold text-foreground">
            ContraSeguimiento
          </span>
        </div>

        {/* Header para escritorio con el selector de contratos */}
        <div className="hidden h-14 items-center justify-end gap-3 border-b border-border bg-card px-6 md:flex">
          {headerExtra}
        </div>

        {/* Contenido principal */}
        <div className={cn("flex-1 overflow-y-auto")}>
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}