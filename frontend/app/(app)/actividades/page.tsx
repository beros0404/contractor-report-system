"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, Plus, ChevronDown, Upload } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { ActivitiesTable } from "@/components/activities-table"
import { UploadActividades } from "@/components/upload-actividades"
import { apiClient } from "@/lib/api-client"
import { differenceInDays, parseISO, format } from "date-fns"
import { es } from "date-fns/locale"
import { useContrato } from "@/contexts/contrato-context"
import { toast } from "sonner"

type FilterType = "todas" | "activa" | "baja" | "sin_inicio"

const PAGE_SIZE = 25

// Función para formatear títulos de actividades
const formatearTituloActividad = (titulo: string) => {
  if (!titulo) return ''
  
  // Limpiar códigos como "Rea · " del inicio
  let tituloLimpio = titulo.replace(/^[A-Z][a-z]{2,3}\s*·\s*/, '')
  
  // Si el título es corto, mostrarlo completo
  if (tituloLimpio.length <= 70) return tituloLimpio
  
  // Buscar el último punto o coma antes del límite
  const limite = 70
  const ultimoPunto = tituloLimpio.lastIndexOf('.', limite)
  const ultimaComa = tituloLimpio.lastIndexOf(',', limite)
  
  // Usar el último signo de puntuación encontrado
  const corte = Math.max(ultimoPunto, ultimaComa)
  
  if (corte > 30) {
    // Cortar en el signo de puntuación
    return tituloLimpio.substring(0, corte + 1)
  } else {
    // Si no hay signo, cortar en el límite y agregar "..."
    return tituloLimpio.substring(0, limite) + '...'
  }
}

export default function ActividadesPage() {
  const router = useRouter()
  const { contratoActivo, usuarioId, tieneContratos, loading: contratoLoading } = useContrato()
  const [busqueda, setBusqueda] = useState("")
  const [filtro, setFiltro] = useState<FilterType>("todas")
  const [page, setPage] = useState(1)
  const [filterOpen, setFilterOpen] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)

  const [actividades, setActividades] = useState<any[]>([])
  const [aportes, setAportes] = useState<any[]>([])
  const [evidencias, setEvidencias] = useState<any[]>([])
  const [contrato, setContrato] = useState<any>({})
  const [config, setConfig] = useState<any>({})
  const [loading, setLoading] = useState(true)

  // Redireccionar si no hay contratos
  useEffect(() => {
    if (!contratoLoading && !tieneContratos) {
      router.push("/configuracion-inicial")
    }
  }, [contratoLoading, tieneContratos, router])

  const cargarDatos = async () => {
    if (!contratoActivo || !usuarioId) return

    try {
      console.log("📡 Cargando datos para contrato:", contratoActivo)
      
      const [acts, aps, evids, conf] = await Promise.all([
        apiClient.getActividades(contratoActivo, usuarioId),
        apiClient.getAportes(contratoActivo, usuarioId),
        apiClient.getEvidencias(contratoActivo, usuarioId),
        apiClient.getConfiguracion(contratoActivo, usuarioId).catch(() => null)
      ])

      setActividades(Array.isArray(acts) ? acts : [])
      setAportes(Array.isArray(aps) ? aps : [])
      setEvidencias(Array.isArray(evids) ? evids : [])
      
      setConfig(conf || {})
      setContrato(conf?.contrato || {})
      
      console.log("✅ Actividades cargadas:", acts?.length || 0)
    } catch (error) {
      console.error("❌ Error cargando datos:", error)
      setActividades([])
      setAportes([])
      setEvidencias([])
      setConfig({})
      setContrato({})
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (contratoActivo && usuarioId) {
      cargarDatos()
    }
  }, [contratoActivo, usuarioId])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false)
      }
    }
    if (filterOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [filterOpen])

  // Calcular mapas para ActivitiesTable
  const { aportesMap, evidenciasMap, coberturaMap, actividadesConTituloFormateado } = useMemo(() => {
    const aMap: Record<string, number> = {}
    const eMap: Record<string, number> = {}
    
    actividades.forEach((act) => {
      aMap[act.id] = aportes.filter((ap) => ap.actividadId === act.id).length
      eMap[act.id] = evidencias.filter((ev) => ev.actividadId === act.id).length
    })

    const maxAportes = Math.max(...Object.values(aMap), 1)
    
    const cMap: Record<string, number> = {}
    
    actividades.forEach((act) => {
      const aportesCount = aMap[act.id] || 0
      const cobertura = Math.round((aportesCount / maxAportes) * 100)
      cMap[act.id] = cobertura
    })

    // Crear array de actividades con títulos formateados
    const actividadesFormateadas = actividades.map(act => ({
      ...act,
      tituloFormateado: formatearTituloActividad(act.titulo || act.descripcion || '')
    }))

    return { 
      aportesMap: aMap, 
      evidenciasMap: eMap, 
      coberturaMap: cMap,
      actividadesConTituloFormateado: actividadesFormateadas
    }
  }, [actividades, aportes, evidencias])

  const filtradas = useMemo(() => {
    let resultado = actividadesConTituloFormateado

    if (busqueda.trim()) {
      const term = busqueda.toLowerCase()
      resultado = resultado.filter((a) =>
        a.titulo?.toLowerCase().includes(term) ||
        a.descripcion?.toLowerCase().includes(term) ||
        a.tituloFormateado?.toLowerCase().includes(term)
      )
    }

    if (filtro === "activa") {
      resultado = resultado.filter((a) => coberturaMap[a.id] >= 60)
    } else if (filtro === "baja") {
      resultado = resultado.filter((a) => {
        const c = coberturaMap[a.id]
        return c >= 25 && c < 60
      })
    } else if (filtro === "sin_inicio") {
      resultado = resultado.filter((a) => coberturaMap[a.id] < 25)
    }

    return resultado
  }, [actividadesConTituloFormateado, busqueda, filtro, coberturaMap])

  const totalFiltered = filtradas.length
  const paginated = filtradas.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const diasRestantes = useMemo(() => {
    if (contrato?.fechaFin) {
      return differenceInDays(parseISO(contrato.fechaFin), new Date())
    }
    return 0
  }, [contrato])

  const fechaInforme = useMemo(() => {
    if (config?.reportes?.diaGeneracion) {
      const hoy = new Date()
      const fechaInforme = new Date(hoy.getFullYear(), hoy.getMonth(), config.reportes.diaGeneracion)
      return format(fechaInforme, "d 'de' MMM", { locale: es })
    }
    return format(new Date(), "d 'de' MMM", { locale: es })
  }, [config])

  const filterLabels: Record<FilterType, string> = {
    todas: "Todos los estados",
    activa: "Activa",
    baja: "Baja",
    sin_inicio: "Sin inicio",
  }

  const inicialesUsuario = useMemo(() => {
    if (config?.usuario?.nombre) {
      return config.usuario.nombre
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")
    }
    return "U"
  }, [config])

  const handleActividadesExtracted = async (nuevasActividades: string[]) => {
    if (!contratoActivo || !usuarioId) return

    try {
      const actividadesLimpias = nuevasActividades.map(act => 
        act
          .replace(/^[A-Z][a-z]{2,3}\s*·\s*/, '')
          .replace(/^-\s*/, '')
          .trim()
      );

      for (let i = 0; i < actividadesLimpias.length; i++) {
        await apiClient.createActividad(
          {
            numero: actividades.length + i + 1,
            titulo: actividadesLimpias[i].substring(0, 200),
            descripcion: actividadesLimpias[i],
            tipo: "automatica",
            porcentajePeso: 0,
            estado: "activa"
          },
          usuarioId,
          contratoActivo
        )
      }

      toast.success(`${actividadesLimpias.length} actividades agregadas correctamente`)
      setShowUpload(false)
      await cargarDatos()
    } catch (error) {
      console.error("❌ Error guardando actividades:", error)
      toast.error("Error al guardar las actividades")
    }
  }

  // Mostrar loading mientras verifica contratos
  if (contratoLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">Cargando actividades...</p>
        </div>
      </div>
    )
  }

  // Si no hay contratos, no renderizar nada (la redirección ya ocurrió)
  if (!tieneContratos) {
    return null
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Versión móvil */}
      <div className="flex flex-col gap-4 rounded-xl bg-sidebar p-5 text-sidebar-foreground md:hidden">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-sidebar-foreground/70">
              Hola, {config?.usuario?.nombre?.split(" ")[0] || "Usuario"}
            </span>
            <span className="text-lg font-bold">{contrato?.numeroContrato || "Sin contrato"}</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-white">
            {inicialesUsuario}
          </div>
        </div>
        <div className="rounded-lg bg-sidebar-accent p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">Progreso del periodo</span>
            <span className="font-bold text-sidebar-primary">
              {Math.max(0, Math.round(((30 - Math.max(diasRestantes, 0)) / 30) * 100))}%
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-sidebar-border">
            <div
              className="h-full rounded-full bg-sidebar-primary transition-all"
              style={{
                width: `${Math.max(0, Math.round(((30 - Math.max(diasRestantes, 0)) / 30) * 100))}%`,
              }}
            />
          </div>
          <p className="mt-1.5 text-xs text-sidebar-foreground/60">
            {Math.max(diasRestantes, 0)} días restantes &middot; Informe: {fechaInforme}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 md:hidden">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Acceso Rápido
        </p>
        <Link
          href="/actividades/nuevo-aporte"
          className="flex items-center gap-3 rounded-lg bg-amber-500 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-600"
        >
          <Plus className="h-5 w-5" />
          Registrar Aporte
        </Link>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Hoy
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <span className="text-xs">!</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-card-foreground">
                {aportes.filter(ap => 
                  parseISO(ap.fecha).toDateString() === new Date().toDateString()
                ).length > 0 ? 'Aportes registrados hoy' : 'Sin aportes hoy'}
              </span>
              <span className="text-xs text-muted-foreground">
                {aportes.filter(ap => 
                  parseISO(ap.fecha).toDateString() === new Date().toDateString()
                ).length > 0 
                  ? 'Continúa con el registro' 
                  : 'Registra las acciones realizadas para mantener tu informe actualizado'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:flex md:items-center md:justify-between">
        <PageHeader
          titulo="Actividades Contractuales"
          descripcion={`${actividades.length} actividades definidas en el contrato`}
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="flex items-center gap-2 rounded-md border border-input bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <Upload className="h-4 w-4" />
            {showUpload ? "Ocultar cargador" : "Cargar actividades"}
          </button>
          <Link
            href="/actividades/nuevo-aporte"
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Registrar Aporte
          </Link>
        </div>
      </div>

      <div className="md:hidden">
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="w-full flex items-center justify-center gap-2 rounded-md border border-input bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent mb-3"
        >
          <Upload className="h-4 w-4" />
          {showUpload ? "Ocultar cargador" : "Cargar actividades desde documento"}
        </button>
      </div>

      {showUpload && contratoActivo && usuarioId && (
        <UploadActividades
          onActividadesExtracted={handleActividadesExtracted}
          contratoId={contratoActivo}
          usuarioId={usuarioId}
        />
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar actividad..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value)
              setPage(1)
            }}
            className="h-10 w-full rounded-md border border-input bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex h-10 items-center gap-2 rounded-md border border-input bg-card px-3 text-sm text-foreground transition-colors hover:bg-accent"
          >
            {filterLabels[filtro]}
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
          {filterOpen && (
            <div className="absolute right-0 top-11 z-10 min-w-44 rounded-md border border-border bg-card p-1 shadow-lg">
              {(Object.entries(filterLabels) as [FilterType, string][]).map(
                ([value, label]) => (
                  <button
                    key={value}
                    onClick={() => {
                      setFiltro(value)
                      setFilterOpen(false)
                      setPage(1)
                    }}
                    className={`flex w-full rounded-sm px-3 py-2 text-left text-sm transition-colors ${
                      filtro === value
                        ? "bg-accent font-medium text-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {filtradas.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16">
          <p className="text-sm font-medium text-foreground">
            No se encontraron actividades
          </p>
          <p className="text-xs text-muted-foreground">
            {actividades.length === 0 
              ? "Comienza cargando las actividades desde el contrato usando el botón 'Cargar actividades'"
              : "Intenta ajustar los filtros de búsqueda"}
          </p>
          {actividades.length === 0 && (
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors mt-2"
            >
              <Upload className="h-4 w-4" />
              Cargar actividades ahora
            </button>
          )}
        </div>
      ) : (
        <ActivitiesTable
          actividades={paginated}
          aportesMap={aportesMap}
          evidenciasMap={evidenciasMap}
          page={page}
          pageSize={PAGE_SIZE}
          total={totalFiltered}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}