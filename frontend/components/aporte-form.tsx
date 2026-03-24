// components/aporte-form.tsx
"use client"

import { useState, useEffect } from "react"
import { Calendar, Send, Loader2, AlertCircle, X, Upload, Link2, FileText } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useContrato } from "@/contexts/contrato-context"
import { EvidenciaUpload } from "@/components/evidencia-upload"
import { toast } from "sonner"

interface AporteFormProps {
  actividadId: string
  onSuccess: () => void
}

export function AporteForm({ actividadId, onSuccess }: AporteFormProps) {
  const { contratoActivo, usuarioId } = useContrato()
  const [fecha, setFecha] = useState(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })
  const [descripcion, setDescripcion] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [errorFecha, setErrorFecha] = useState<string | null>(null)
  const [fechaFinContrato, setFechaFinContrato] = useState<string | null>(null)
  const [evidenciasGuardadas, setEvidenciasGuardadas] = useState<any[]>([])

  // Cargar fecha de fin del contrato
  useEffect(() => {
    const cargarFechaFin = async () => {
      if (!contratoActivo || !usuarioId) return
      
      try {
        const contrato = await apiClient.getContrato(contratoActivo)
        setFechaFinContrato(contrato?.fechaFin || null)
      } catch (error) {
        console.error("Error cargando fecha fin del contrato:", error)
      }
    }
    
    cargarFechaFin()
  }, [contratoActivo, usuarioId])

  // Validar fecha cuando cambia
  useEffect(() => {
    if (fechaFinContrato && fecha) {
      const fechaSeleccionada = new Date(fecha)
      const fechaFin = new Date(fechaFinContrato)
      
      fechaSeleccionada.setHours(0, 0, 0, 0)
      fechaFin.setHours(0, 0, 0, 0)
      
      if (fechaSeleccionada > fechaFin) {
        const mensaje = `La fecha no puede ser posterior a la finalización del contrato (${new Date(fechaFinContrato).toLocaleDateString('es-CO')})`
        setErrorFecha(mensaje)
        toast.error(mensaje)
      } else {
        setErrorFecha(null)
      }
    }
  }, [fecha, fechaFinContrato])

  const handleEvidenciaGuardada = (evidencia: any) => {
    console.log("📎 Evidencia guardada:", evidencia)
    setEvidenciasGuardadas(prev => [...prev, evidencia])
    toast.success("Evidencia agregada")
  }

  const handleEliminarEvidencia = (index: number) => {
    setEvidenciasGuardadas(prev => prev.filter((_, i) => i !== index))
    toast.success("Evidencia eliminada")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!contratoActivo || !usuarioId) {
      toast.error("No hay un contrato seleccionado")
      return
    }
    
    if (!descripcion.trim()) {
      toast.error("La descripción es requerida")
      return
    }
    
    // Validar fecha contra el contrato
    if (fechaFinContrato) {
      const fechaSeleccionada = new Date(fecha)
      const fechaFin = new Date(fechaFinContrato)
      
      fechaSeleccionada.setHours(0, 0, 0, 0)
      fechaFin.setHours(0, 0, 0, 0)
      
      if (fechaSeleccionada > fechaFin) {
        toast.error(`No se puede registrar el aporte. La fecha es posterior a la finalización del contrato (${new Date(fechaFinContrato).toLocaleDateString('es-CO')})`)
        return
      }
    }
    
    setSubmitting(true)
    
    try {
      const evidenciaIds = evidenciasGuardadas.map(ev => ev.id || ev._id)
      
      console.log("📝 Creando aporte con evidencias:", evidenciaIds)
      
      await apiClient.createAporte(
        {
          actividadId,
          fecha,
          descripcion: descripcion.trim(),
          evidenciaIds,
          estado: "completado",
          monto: 1
        },
        usuarioId,
        contratoActivo
      )
      
      toast.success("Aporte registrado correctamente")
      setDescripcion("")
      setEvidenciasGuardadas([]) // Limpiar evidencias después de guardar
      onSuccess()
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al registrar el aporte")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          Fecha del aporte
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            max={fechaFinContrato ? new Date(fechaFinContrato).toISOString().split('T')[0] : undefined}
            className={`w-full pl-10 pr-3 py-2 border ${errorFecha ? 'border-destructive' : 'border-input'} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary`}
          />
        </div>
        {errorFecha && (
          <p className="text-xs text-destructive flex items-center gap-1 mt-1">
            <AlertCircle className="h-3 w-3" />
            {errorFecha}
          </p>
        )}
      </div>
      
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          Descripción del aporte
        </label>
        <textarea
          rows={3}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Describe el trabajo realizado..."
          className="w-full px-3 py-2 border border-input rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Sección de evidencias */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted-foreground">
            Evidencias
          </label>
          <span className="text-xs text-muted-foreground">
            {evidenciasGuardadas.length} evidencia(s)
          </span>
        </div>
        
        <EvidenciaUpload 
          actividadId={actividadId}
          onSuccess={handleEvidenciaGuardada}
        />

        {/* Lista de evidencias guardadas */}
        {evidenciasGuardadas.length > 0 && (
          <div className="mt-3 space-y-2">
            {evidenciasGuardadas.map((ev, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm bg-muted/30 p-2 rounded-lg">
                {ev.tipo === 'archivo' && <Upload className="h-4 w-4 text-primary" />}
                {ev.tipo === 'enlace' && <Link2 className="h-4 w-4 text-primary" />}
                {ev.tipo === 'nota' && <FileText className="h-4 w-4 text-primary" />}
                <span className="flex-1 truncate text-sm">
                  {ev.nombre || ev.archivo?.nombre || ev.url || ev.contenido || "Evidencia"}
                </span>
                <button
                  type="button"
                  onClick={() => handleEliminarEvidencia(idx)}
                  className="text-destructive hover:text-destructive/80 p-1"
                  title="Eliminar evidencia"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <button
        type="submit"
        disabled={submitting || !!errorFecha}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Registrando...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Registrar Aporte
          </>
        )}
      </button>
    </form>
  )
}

export default AporteForm