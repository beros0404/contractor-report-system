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
  Trash2 
} from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { apiClient } from "@/lib/api-client"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { useContrato } from "@/contexts/contrato-context"

type EstadoInforme = 'borrador' | 'finalizado' | 'enviado'

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

  const cargarDatos = useCallback(async () => {
    if (!contratoActivo || !usuarioId) return

    try {
      setLoading(true)
      const inf = await apiClient.getInformes(contratoActivo, usuarioId)
      setInformes(Array.isArray(inf) ? inf : [])
    } catch (error) {
      console.error("Error cargando informes:", error)
      toast.error("Error al cargar los informes")
    } finally {
      setLoading(false)
    }
  }, [contratoActivo, usuarioId])

  useEffect(() => {
    if (contratoActivo && usuarioId) {
      cargarDatos()
    }
  }, [contratoActivo, usuarioId, cargarDatos])

  async function handleGenerate(tipo: 'mensual' | 'parcial-80' | 'parcial-90') {
    if (!contratoActivo || !usuarioId) {
      toast.error("No hay un contrato seleccionado")
      return
    }

    setGenerando(true)

    try {
      const [contrato, actividades, aportes, evidencias] = await Promise.all([
        apiClient.getContrato(contratoActivo),
        apiClient.getActividades(contratoActivo, usuarioId),
        apiClient.getAportes(contratoActivo, usuarioId),
        apiClient.getEvidencias(contratoActivo, usuarioId)
      ])

      const fecha = new Date()
      const año = fecha.getFullYear()
      const mes = fecha.getMonth() + 1

      const actividadesConDatos = actividades.map((act: any) => {
        const aportesActividad = aportes.filter((ap: any) => ap.actividadId === act.id)
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

      await apiClient.createInforme({
        usuarioId,
        contratoId: contratoActivo,
        tipo,
        año,
        mes,
        contrato,
        actividades: actividadesConDatos
      })

      toast.success("Informe generado correctamente")
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
          <button
            onClick={() => handleGenerate('parcial-80')}
            disabled={generando}
            className="flex items-center gap-2 rounded-md border border-input bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
          >
            <Calendar className="h-4 w-4" />
            Preinforme 80%
          </button>
          <button
            onClick={() => handleGenerate('mensual')}
            disabled={generando}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {generando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {generando ? 'Generando...' : 'Generar Informe Mensual'}
          </button>
        </div>
      </PageHeader>

      {informes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <FileText className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">
            No hay informes generados
          </p>
          <p className="text-xs text-muted-foreground">
            Genera tu primer informe para el período actual
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