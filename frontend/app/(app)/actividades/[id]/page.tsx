"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Calendar,
  FileText,
  Image,
  Download,
  Edit3,
  Save,
  X,
  Loader2
} from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useContrato } from "@/contexts/contrato-context"
import { AporteForm } from "@/components/aporte-form"
import { EvidenciaUpload } from "@/components/evidencia-upload"
import { toast } from "sonner"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"

export default function ActividadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { contratoActivo, usuarioId } = useContrato()
  const [actividad, setActividad] = useState<any>(null)
  const [aportes, setAportes] = useState<any[]>([])
  const [evidencias, setEvidencias] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState(false)
  const [tituloEditado, setTituloEditado] = useState("")
  const [descripcionEditada, setDescripcionEditada] = useState("")

  const actividadId = params.id as string

  useEffect(() => {
    if (contratoActivo && usuarioId && actividadId) {
      cargarDatos()
    }
  }, [contratoActivo, usuarioId, actividadId])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      console.log("📡 Cargando actividad:", actividadId, "usuario:", usuarioId)

      const act = await apiClient.getActividad(actividadId, usuarioId!)
      console.log("✅ Actividad cargada:", act)
      setActividad(act)
      setTituloEditado(act.titulo || "")
      setDescripcionEditada(act.descripcion || "")

      const aps = await apiClient.getAportesByActividad(actividadId, usuarioId!)
      console.log("✅ Aportes cargados:", aps.length)
      setAportes(Array.isArray(aps) ? aps : [])

      const evids = await apiClient.getEvidenciasByActividad(actividadId, usuarioId!)
      console.log("✅ Evidencias cargadas:", evids.length)
      setEvidencias(Array.isArray(evids) ? evids : [])

    } catch (error) {
      console.error("❌ Error cargando datos:", error)
      toast.error("Error al cargar la actividad")
    } finally {
      setLoading(false)
    }
  }

  const handleGuardarEdicion = async () => {
    console.log('🎯 handleGuardarEdicion - INICIANDO');
    console.log('📌 actividad:', actividad?.id);
    console.log('📌 usuarioId:', usuarioId);
    console.log('📌 tituloEditado:', tituloEditado);
    console.log('📌 descripcionEditada:', descripcionEditada);

    if (!actividad || !usuarioId) {
      console.error('❌ Falta actividad o usuarioId');
      toast.error('Error: No se pudo identificar la actividad o usuario');
      return;
    }

    try {
      setLoading(true)

      const datosActualizados: any = {}

      if (tituloEditado !== actividad.titulo) {
        datosActualizados.titulo = tituloEditado
      }

      if (descripcionEditada !== actividad.descripcion) {
        datosActualizados.descripcion = descripcionEditada
      }

      console.log('📦 Datos a actualizar:', datosActualizados)

      if (Object.keys(datosActualizados).length === 0) {
        console.log('ℹ️ No hay cambios para guardar')
        setEditando(false)
        toast.info("No hay cambios para guardar")
        return
      }

      console.log('📡 Enviando petición a API...')
      console.log('   URL:', `${process.env.NEXT_PUBLIC_API_URL}/activities/${actividad.id}?usuarioId=${usuarioId}`)
      console.log('   Body:', datosActualizados)

      const resultado = await apiClient.updateActividad(actividad.id, datosActualizados, usuarioId)

      console.log('✅ Respuesta del servidor:', resultado)

      setActividad({ ...actividad, ...datosActualizados })
      setEditando(false)
      toast.success("Actividad actualizada")

    } catch (error: any) {
      console.error('❌ Error en handleGuardarEdicion:', error)
      console.error('   Mensaje:', error.message)
      console.error('   Stack:', error.stack)
      toast.error(error.message || "Error al actualizar la actividad")
    } finally {
      setLoading(false)
      console.log('🏁 handleGuardarEdicion - FINALIZADO')
    }
  }

  const getIconoEvidencia = (tipo: string) => {
    switch (tipo) {
      case 'imagen':
        return <Image className="h-4 w-4" />
      case 'pdf':
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!actividad) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <p className="text-sm text-muted-foreground">Actividad no encontrada</p>
        <Link href="/actividades" className="text-primary hover:underline">
          Volver a actividades
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <Link
          href="/actividades"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a actividades
        </Link>

        {!editando && (
          <button
            onClick={() => setEditando(true)}
            className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg hover:bg-accent transition-colors text-sm"
          >
            <Edit3 className="h-4 w-4" />
            Editar actividad
          </button>
        )}
      </div>

      {/* Encabezado de la actividad - editable */}
      <div className="bg-card border border-border rounded-lg p-6">
        {editando ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Título de la actividad
              </label>
              <input
                type="text"
                value={tituloEditado}
                onChange={(e) => setTituloEditado(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-lg text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Título de la actividad"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Descripción
              </label>
              <textarea
                value={descripcionEditada}
                onChange={(e) => setDescripcionEditada(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-input rounded-lg text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Descripción de la actividad"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setEditando(false)
                  setTituloEditado(actividad.titulo || "")
                  setDescripcionEditada(actividad.descripcion || "")
                }}
                className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors text-sm flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancelar
              </button>
              <button
                onClick={handleGuardarEdicion}
                disabled={loading}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Guardar cambios
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-foreground">{actividad.titulo}</h1>
            <p className="text-muted-foreground mt-2">{actividad.descripcion}</p>
          </>
        )}

        <div className="flex gap-4 mt-4 text-sm">
          <span className="px-2 py-1 bg-primary/10 text-primary rounded-full">
            Peso: {actividad.porcentajePeso || 0}%
          </span>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
            {actividad.estado}
          </span>
        </div>
      </div>

      {/* Grid de contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda: Formulario de aporte */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-lg p-4 sticky top-6">
            <h2 className="font-semibold mb-4">Registrar nuevo aporte</h2>
            <AporteForm actividadId={actividadId} onSuccess={cargarDatos} />


          </div>
        </div>

        {/* Columna derecha: Lista de aportes y evidencias */}
        <div className="lg:col-span-2 space-y-6">
          {/* Historial de aportes */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="font-semibold mb-4">Historial de aportes</h2>
            {aportes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay aportes registrados para esta actividad
              </p>
            ) : (
              <div className="space-y-4">
                {aportes.map((aporte) => (
                  <div key={aporte.id} className="border-b border-border last:border-0 pb-4 last:pb-0">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            {format(new Date(aporte.fecha), "d 'de' MMMM, yyyy", { locale: es })}
                          </p>
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                            {aporte.estado}
                          </span>
                        </div>
                        <p className="text-sm text-foreground mt-1">{aporte.descripcion}</p>

                        {/* Evidencias del aporte */}
                        {aporte.evidenciaIds && aporte.evidenciaIds.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">Evidencias:</p>
                            {evidencias
                              .filter(ev => ev.id && aporte.evidenciaIds?.includes(ev.id))
                              .map(ev => (
                                <div key={ev.id} className="flex items-center gap-2 text-xs">
                                  {getIconoEvidencia(ev.tipo)}
                                  <span className="text-muted-foreground">{ev.nombre}</span>
                                  {ev.drive?.url && (
                                    <a
                                      href={ev.drive.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline ml-auto"
                                    >
                                      <Download className="h-3 w-3" />
                                    </a>
                                  )}
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}