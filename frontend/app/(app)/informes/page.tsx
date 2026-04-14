"use client"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { 
  Plus, 
  FileText, 
  Send, 
  Edit3, 
  Eye, 
  Calendar, 
  Loader2,
  Trash2,
  AlertCircle,
  ChevronDown
} from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { apiClient } from "@/lib/api-client"
import { format, startOfMonth, endOfMonth, isAfter, isBefore, subMonths } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { useContrato } from "@/contexts/contrato-context"

type EstadoInforme = 'borrador' | 'finalizado' | 'enviado'
type TipoInforme = 'mensual' | 'parcial-80' | 'parcial-90'

interface PeriodoDisponible {
  mes: number
  año: number
  fechaInicio: Date
  fechaFin: Date
  fechaLimite80?: Date
  fechaLimite90?: Date
  cantidadActividades: number
  puedeGenerar80: boolean
  puedeGenerar90: boolean
  puedeGenerarMensual: boolean
}

const estadoBadge: Record<EstadoInforme, { label: string; className: string }> = {
  borrador: {
    label: "Borrador",
    className: "bg-muted text-muted-foreground",
  },
  finalizado: {
    label: "Finalizado",
    className: "bg-chart-2/15 text-chart-2",
  },
  enviado: {
    label: "Enviado",
    className: "bg-chart-1/15 text-chart-1",
  },
}

const estadoIcon: Record<EstadoInforme, typeof FileText> = {
  borrador: Edit3,
  finalizado: FileText,
  enviado: Send,
}

export default function InformesPage() {
  const { contratoActivo, usuarioId } = useContrato()
  const [informes, setInformes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generando, setGenerando] = useState(false)
  const [eliminando, setEliminando] = useState<string | null>(null)
  const [periodosDisponibles, setPeriodosDisponibles] = useState<PeriodoDisponible[]>([])
  
  // Estados para el selector de meses
  const [mostrarSelector80, setMostrarSelector80] = useState(false)
  const [mostrarSelector90, setMostrarSelector90] = useState(false)
  const [periodoSeleccionado80, setPeriodoSeleccionado80] = useState<PeriodoDisponible | null>(null)
  const [periodoSeleccionado90, setPeriodoSeleccionado90] = useState<PeriodoDisponible | null>(null)

  // Obtener meses únicos con actividades de la base de datos
  const obtenerMesesConActividades = useCallback(async () => {
    if (!contratoActivo || !usuarioId) return []

    try {
      const actividades = await apiClient.getActividades(contratoActivo, usuarioId)
      
      if (!actividades || actividades.length === 0) {
        return []
      }

      // Extraer meses únicos de las actividades (asumiendo que tienen fechaCreacion)
      const mesesMap = new Map<string, { mes: number; año: number; actividades: any[] }>()
      
      actividades.forEach((actividad: any) => {
        // Usar fecha de creación de la actividad o fecha actual si no existe
        const fechaActividad = actividad.fechaCreacion ? new Date(actividad.fechaCreacion) : new Date()
        const mes = fechaActividad.getMonth() + 1
        const año = fechaActividad.getFullYear()
        const key = `${año}-${mes}`
        
        if (!mesesMap.has(key)) {
          mesesMap.set(key, { mes, año, actividades: [] })
        }
        mesesMap.get(key)!.actividades.push(actividad)
      })

      // Convertir a array y ordenar por fecha descendente (más reciente primero)
      const mesesArray = Array.from(mesesMap.values())
        .sort((a, b) => {
          if (a.año !== b.año) return b.año - a.año
          return b.mes - a.mes
        })
        .map(item => {
          const fechaInicio = new Date(item.año, item.mes - 1, 1)
          const fechaFin = endOfMonth(fechaInicio)
          const hoy = new Date()
          
          // Calcular fechas límite
          const diasMes = fechaFin.getDate()
          const dia80 = Math.floor(diasMes * 0.8)
          const dia90 = Math.floor(diasMes * 0.9)
          
          const fechaLimite80 = new Date(item.año, item.mes - 1, dia80)
          const fechaLimite90 = new Date(item.año, item.mes - 1, dia90)
          
          // Validar si se puede generar cada tipo de informe
          const puedeGenerar80 = isAfter(hoy, fechaLimite80) && isBefore(hoy, fechaFin)
          const puedeGenerar90 = isAfter(hoy, fechaLimite90) && isBefore(hoy, fechaFin)
          const puedeGenerarMensual = isAfter(hoy, fechaInicio) && isBefore(hoy, fechaFin)
          
          return {
            mes: item.mes,
            año: item.año,
            fechaInicio,
            fechaFin,
            fechaLimite80,
            fechaLimite90,
            cantidadActividades: item.actividades.length,
            puedeGenerar80,
            puedeGenerar90,
            puedeGenerarMensual
          }
        })

      return mesesArray
    } catch (error) {
      console.error("Error obteniendo meses con actividades:", error)
      return []
    }
  }, [contratoActivo, usuarioId])

  const cargarDatos = useCallback(async () => {
    if (!contratoActivo || !usuarioId) return

    try {
      setLoading(true)
      
      // Cargar informes y meses con actividades en paralelo
      const [inf, meses] = await Promise.all([
        apiClient.getInformes(contratoActivo, usuarioId),
        obtenerMesesConActividades()
      ])
      
      setInformes(Array.isArray(inf) ? inf : [])
      setPeriodosDisponibles(meses)
      
      // Limpiar selecciones
      setPeriodoSeleccionado80(null)
      setPeriodoSeleccionado90(null)
      
    } catch (error) {
      console.error("Error cargando datos:", error)
      toast.error("Error al cargar los datos")
    } finally {
      setLoading(false)
    }
  }, [contratoActivo, usuarioId, obtenerMesesConActividades])

  useEffect(() => {
    if (contratoActivo && usuarioId) {
      cargarDatos()
    }
  }, [contratoActivo, usuarioId, cargarDatos])

  // Verificar si ya existe un informe para el período
  const existeInformeParaPeriodo = async (tipo: TipoInforme, mes: number, año: number) => {
    const informesExistentes = await apiClient.getInformes(contratoActivo!, usuarioId!)
    return informesExistentes.some((inf: any) => 
      inf.tipo === tipo && 
      inf.periodo?.mes === mes && 
      inf.periodo?.año === año
    )
  }

  async function handleGenerate(tipo: 'mensual' | 'parcial-80' | 'parcial-90', periodo: PeriodoDisponible) {
    if (!contratoActivo || !usuarioId) {
      toast.error("No hay un contrato seleccionado")
      return
    }

    // Validaciones según el tipo de informe
    if (tipo === 'parcial-80' && !periodo.puedeGenerar80) {
      toast.error(`No puedes generar el preinforme 80% para ${format(periodo.fechaInicio, "MMMM yyyy", { locale: es })}. La fecha límite es el ${format(periodo.fechaLimite80!, "d 'de' MMMM", { locale: es })}`)
      return
    }
    
    if (tipo === 'parcial-90' && !periodo.puedeGenerar90) {
      toast.error(`No puedes generar el preinforme 90% para ${format(periodo.fechaInicio, "MMMM yyyy", { locale: es })}. La fecha límite es el ${format(periodo.fechaLimite90!, "d 'de' MMMM", { locale: es })}`)
      return
    }

    if (tipo === 'mensual' && !periodo.puedeGenerarMensual) {
      toast.error(`No puedes generar el informe mensual de ${format(periodo.fechaInicio, "MMMM yyyy", { locale: es })}. El período aún no ha finalizado.`)
      return
    }

    setGenerando(true)

    try {
      // Verificar si ya existe un informe para este período
      const yaExiste = await existeInformeParaPeriodo(tipo, periodo.mes, periodo.año)
      
      if (yaExiste) {
        toast.error(`Ya existe un informe ${tipo === 'mensual' ? 'mensual' : 'preinforme'} para ${format(periodo.fechaInicio, "MMMM yyyy", { locale: es })}`)
        setGenerando(false)
        return
      }

      // Obtener datos filtrados por período
      const [contrato, todasActividades, aportes, evidencias] = await Promise.all([
        apiClient.getContrato(contratoActivo),
        apiClient.getActividades(contratoActivo, usuarioId),
        apiClient.getAportes(contratoActivo, usuarioId),
        apiClient.getEvidencias(contratoActivo, usuarioId)
      ])
      
      if (!todasActividades || todasActividades.length === 0) {
        toast.error("No hay actividades registradas")
        setGenerando(false)
        return
      }

      // Filtrar actividades por el período del informe
      const actividadesDelPeriodo = todasActividades.filter((actividad: any) => {
        const fechaActividad = actividad.fechaCreacion ? new Date(actividad.fechaCreacion) : new Date()
        return fechaActividad >= periodo.fechaInicio && fechaActividad <= periodo.fechaFin
      })

      if (actividadesDelPeriodo.length === 0) {
        toast.error(`No hay actividades registradas para el período ${format(periodo.fechaInicio, "MMMM yyyy", { locale: es })}`)
        setGenerando(false)
        return
      }

      // Mapear actividades con sus aportes y evidencias
      const actividadesConDatos = actividadesDelPeriodo.map((act: any) => {
        const aportesActividad = aportes.filter((ap: any) => 
          ap.actividadId === act.id && 
          new Date(ap.fecha) >= periodo.fechaInicio && 
          new Date(ap.fecha) <= periodo.fechaFin
        )
        
        const evidenciasActividad = evidencias.filter((ev: any) => 
          aportesActividad.some((ap: any) => ap.evidenciaIds?.includes(ev.id))
        )

        return {
          id: act.id,
          titulo: act.titulo,
          descripcion: act.descripcion,
          aportes: aportesActividad,
          evidencias: evidenciasActividad
        }
      })

      // Crear el informe
      await apiClient.createInforme({
        usuarioId,
        contratoId: contratoActivo,
        tipo,
        año: periodo.año,
        mes: periodo.mes,
        fechaInicio: periodo.fechaInicio,
        fechaFin: periodo.fechaFin,
        fechaLimite: tipo === 'parcial-80' ? periodo.fechaLimite80 : tipo === 'parcial-90' ? periodo.fechaLimite90 : periodo.fechaFin,
        contrato,
        actividades: actividadesConDatos
      })

      toast.success(`Informe ${tipo === 'mensual' ? 'mensual' : 'preinforme'} de ${format(periodo.fechaInicio, "MMMM yyyy", { locale: es })} generado correctamente`)
      
      // Limpiar selecciones y recargar
      setMostrarSelector80(false)
      setMostrarSelector90(false)
      setPeriodoSeleccionado80(null)
      setPeriodoSeleccionado90(null)
      cargarDatos()

    } catch (error) {
      console.error("Error generando informe:", error)
      toast.error("Error al generar el informe")
    } finally {
      setGenerando(false)
    }
  }

  async function handleDelete(informeId: string) {
    if (!usuarioId) return
    
    if (!confirm("¿Estás seguro de eliminar este informe? Esta acción no se puede deshacer.")) {
      return
    }

    setEliminando(informeId)
    try {
      await apiClient.deleteInforme(informeId, usuarioId)
      toast.success("Informe eliminado correctamente")
      cargarDatos()
    } catch (error) {
      console.error("Error eliminando informe:", error)
      toast.error("Error al eliminar el informe")
    } finally {
      setEliminando(null)
    }
  }

  // Renderizar selector de meses
  const renderSelectorMeses = (
    tipo: '80' | '90',
    periodos: PeriodoDisponible[],
    seleccionado: PeriodoDisponible | null,
    setSeleccionado: (periodo: PeriodoDisponible | null) => void,
    setMostrar: (mostrar: boolean) => void,
    mostrar: boolean
  ) => {
    const periodosValidos = periodos.filter(p => tipo === '80' ? p.puedeGenerar80 : p.puedeGenerar90)
    
    if (periodosValidos.length === 0) {
      return (
        <button
          disabled
          className="flex items-center gap-2 rounded-md border border-input bg-card px-4 py-2 text-sm font-medium text-muted-foreground opacity-50 cursor-not-allowed"
          title="No hay períodos disponibles"
        >
          <Calendar className="h-4 w-4" />
          Preinforme {tipo}%
        </button>
      )
    }

    return (
      <div className="relative">
        <button
          onClick={() => setMostrar(!mostrar)}
          disabled={generando}
          className="flex items-center gap-2 rounded-md border border-input bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
        >
          <Calendar className="h-4 w-4" />
          {seleccionado ? format(seleccionado.fechaInicio, "MMMM yyyy", { locale: es }) : `Preinforme ${tipo}%`}
          <ChevronDown className={`h-4 w-4 transition-transform ${mostrar ? 'rotate-180' : ''}`} />
        </button>
        
        {mostrar && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setMostrar(false)}
            />
            <div className="absolute top-full left-0 mt-2 w-64 bg-popover rounded-md border border-border shadow-lg z-20 max-h-64 overflow-y-auto">
              {periodosValidos.map((periodo, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSeleccionado(periodo)
                    setMostrar(false)
                    handleGenerate(tipo === '80' ? 'parcial-80' : 'parcial-90', periodo)
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors flex justify-between items-center"
                >
                  <span>{format(periodo.fechaInicio, "MMMM yyyy", { locale: es })}</span>
                  <span className="text-xs text-muted-foreground">
                    {periodo.cantidadActividades} act.
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        titulo="Informes de Gestión"
        descripcion="Genera y gestiona los informes periódicos de actividades contractuales"
      >
        <div className="flex items-center gap-2">
          {renderSelectorMeses(
            '80',
            periodosDisponibles,
            periodoSeleccionado80,
            setPeriodoSeleccionado80,
            setMostrarSelector80,
            mostrarSelector80
          )}
          
          {renderSelectorMeses(
            '90',
            periodosDisponibles,
            periodoSeleccionado90,
            setPeriodoSeleccionado90,
            setMostrarSelector90,
            mostrarSelector90
          )}
        </div>
      </PageHeader>

      {/* Mostrar meses con actividades */}
      {periodosDisponibles.length > 0 && (
        <div className="bg-muted/30 rounded-lg p-4 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-medium">Meses con actividades registradas</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {periodosDisponibles.map((periodo, idx) => (
              <div key={idx} className="text-xs p-2 bg-background rounded border border-border">
                <p className="font-medium">{format(periodo.fechaInicio, "MMMM yyyy", { locale: es })}</p>
                <p className="text-muted-foreground mt-1">
                  {periodo.cantidadActividades} actividades
                </p>
                {(periodo.puedeGenerar80 || periodo.puedeGenerar90) && (
                  <div className="mt-2 flex gap-1">
                    {periodo.puedeGenerar80 && (
                      <span className="inline-block px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-[10px]">
                        80%
                      </span>
                    )}
                    {periodo.puedeGenerar90 && (
                      <span className="inline-block px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-[10px]">
                        90%
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {informes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <FileText className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">
            No hay informes generados
          </p>
          <p className="text-xs text-muted-foreground">
            Selecciona un mes con actividades para generar un informe
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {informes.map((informe) => {
            const badge = estadoBadge[informe.estado as EstadoInforme] || estadoBadge.borrador
            const StatusIcon = estadoIcon[informe.estado as EstadoInforme] || FileText
            const fecha = new Date(informe.periodo?.fechaFin || informe.fechaFin)
            const estaEliminando = eliminando === informe.id
            
            return (
              <div
                key={informe.id}
                className="group relative flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-accent/30"
              >
                <Link
                  href={`/informes/${informe.id}`}
                  className="absolute inset-0 z-10"
                  aria-label={`Ver informe ${informe.tipo === 'mensual' ? 'mensual' : 'preinforme'} de ${format(fecha, "MMMM yyyy", { locale: es })}`}
                />
                
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <StatusIcon className="h-5 w-5 text-primary" />
                </div>
                
                <div className="flex min-w-0 flex-1 flex-col gap-0.5 relative z-20">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-card-foreground">
                      {informe.tipo === 'mensual' ? 'Informe Mensual' : 'Preinforme 80%'} - {format(fecha, "MMMM yyyy", { locale: es })}
                    </h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Período: {format(new Date(informe.periodo?.fechaInicio || informe.fechaInicio), "d MMM")} - {format(fecha, "d MMM yyyy")}
                    {informe.periodo?.fechaLimite && (
                      <> | Límite: {format(new Date(informe.periodo.fechaLimite), "d MMM yyyy")}</>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Actividades: {informe.actividades?.length || 0}
                  </p>
                </div>

                <div className="flex items-center gap-2 relative z-20">
                  <Link
                    href={`/informes/${informe.id}`}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                    title="Ver informe"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  
                  <button
                    onClick={() => handleDelete(informe.id)}
                    disabled={estaEliminando}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors disabled:opacity-50"
                    title="Eliminar informe"
                  >
                    {estaEliminando ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}