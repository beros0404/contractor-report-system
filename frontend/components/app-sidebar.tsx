"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  Settings,
  Building2,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  LogOut,
  Calendar,
  ChevronDown
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { useContrato } from "@/contexts/contrato-context"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

const getNavItems = (contratoId: string) => [
  {
    title: "Dashboard",
    href: `/dashboard?contrato=${contratoId}`,
    icon: LayoutDashboard,
  },
  {
    title: "Actividades",
    href: `/actividades?contrato=${contratoId}`,
    icon: ClipboardList,
  },
  {
    title: "Informes",
    href: `/informes?contrato=${contratoId}`,
    icon: FileText,
  },
  {
    title: "Calendario",
    href: `/calendario?contrato=${contratoId}`,
    icon: Calendar,
  },
  {
    title: "Configuración",
    href: `/configuracion?contrato=${contratoId}`,
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [selectorOpen, setSelectorOpen] = useState(false)
  const { contratoActivo, contratos, setContratoActivo, loading } = useContrato()
  const { signOut } = useAuth()
  const [cerrandoSesion, setCerrandoSesion] = useState(false)

  const handleLogout = async () => {
    try {
      setCerrandoSesion(true)
      await signOut()
      toast.success("Sesión cerrada correctamente")
      router.push("/login")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      toast.error("Error al cerrar sesión")
    } finally {
      setCerrandoSesion(false)
    }
  }

  const handleSelectContrato = (contratoId: string) => {
    setContratoActivo(contratoId)
    setSelectorOpen(false)
  }

  const contratoSeleccionado = contratos.find(c => c._id === contratoActivo || c.id === contratoActivo)

  if (loading) {
    return (
      <aside className={cn(
        "flex h-screen flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        collapsed ? "w-16" : "w-64"
      )}>
        <div className="flex h-16 items-center px-4">
          <div className="h-8 w-8 animate-pulse rounded-lg bg-sidebar-primary/50" />
        </div>
      </aside>
    )
  }

  const contratoId = contratoActivo || 'temp-id'
  const navItems = getNavItems(contratoId)

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header con logo y selector de contratos */}
      <div className="border-b border-sidebar-border">
        {!collapsed ? (
          // Versión expandida: logo y selector
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
                <Building2 className="h-4 w-4 text-sidebar-primary-foreground" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="truncate text-sm font-semibold tracking-tight">
                  ContraSeguimiento
                </span>
                <span className="truncate text-xs text-sidebar-foreground/60">
                  Seguimiento Contractual
                </span>
              </div>
            </div>

            {/* Selector de contratos */}
            <div className="relative">
              <button
                onClick={() => setSelectorOpen(!selectorOpen)}
                className="w-full flex items-center justify-between gap-2 rounded-lg bg-sidebar-accent/50 px-3 py-2.5 text-sm hover:bg-sidebar-accent transition-colors"
              >
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="text-xs text-sidebar-foreground/60">Contrato activo</span>
                  <span className="font-medium truncate w-full text-left">
                    {contratoSeleccionado?.numero || "Seleccionar contrato"}
                  </span>
                </div>
                <ChevronDown className={cn(
                  "h-4 w-4 text-sidebar-foreground/60 transition-transform",
                  selectorOpen && "rotate-180"
                )} />
              </button>

              {selectorOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-sidebar-border bg-sidebar shadow-lg z-50">
                  <div className="p-1">
                    <p className="px-2 py-1.5 text-xs font-medium text-sidebar-foreground/60">
                      Tus contratos
                    </p>
                    {contratos.length === 0 ? (
                      <p className="px-2 py-3 text-sm text-sidebar-foreground/60 text-center">
                        No hay contratos
                      </p>
                    ) : (
                      contratos.map((contrato) => {
                        const key = contrato._id || contrato.id
                        const contratoId = contrato._id || contrato.id
                        
                        return (
                          <button
                            key={key}
                            onClick={() => handleSelectContrato(contratoId)}
                            className="flex items-center justify-between w-full px-2 py-2 rounded hover:bg-sidebar-accent text-left"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium text-sidebar-foreground">
                                {contrato.numero || "Contrato sin número"}
                              </p>
                              <p className="text-xs text-sidebar-foreground/60 truncate">
                                {contrato.entidad || "Entidad no especificada"}
                              </p>
                            </div>
                          </button>
                        )
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Versión colapsada: solo icono
          <div className="flex h-16 items-center justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
              <Building2 className="h-4 w-4 text-sidebar-primary-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* Botón Registrar Aporte */}
      <div className="px-3 pt-4 pb-2">
        <Link
          href={`/actividades/nuevo-aporte${contratoActivo ? `?contrato=${contratoActivo}` : ''}`}
          className={cn(
            "flex items-center gap-2 rounded-lg bg-sidebar-primary px-3 py-2.5 text-sm font-semibold text-sidebar-primary-foreground transition-colors hover:bg-sidebar-primary/90",
            collapsed && "justify-center px-2"
          )}
        >
          <PlusCircle className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Registrar Aporte</span>}
        </Link>
      </div>

      {/* Navegación principal */}
      <nav className="flex-1 px-2 py-2">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href.split('?')[0] || 
              pathname.startsWith(item.href.split('?')[0] + "/")
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="h-4.5 w-4.5 shrink-0" />
                  {!collapsed && <span className="truncate">{item.title}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Botón de Cerrar Sesión */}
      <div className="px-2 pb-2">
        <button
          onClick={handleLogout}
          disabled={cerrandoSesion}
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
            "text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-4.5 w-4.5 shrink-0" />
          {!collapsed && (
            <span className="flex-1 text-left">
              {cerrandoSesion ? "Cerrando sesión..." : "Cerrar Sesión"}
            </span>
          )}
          {!collapsed && cerrandoSesion && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
          )}
        </button>
      </div>

      {/* Botón para colapsar/expandir */}
      <div className="border-t border-sidebar-border p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-md p-2 text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  )
}