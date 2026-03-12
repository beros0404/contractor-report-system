"use client"

import { useState, useEffect } from "react"
import { Plus, Calendar, Upload } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useContrato } from "@/contexts/contrato-context"
import { toast } from "sonner"

interface AporteFormProps {
  actividadId: string
  onSuccess?: () => void
  audioInicial?: string
}

export function AporteForm({ actividadId, onSuccess, audioInicial }: AporteFormProps) {
  const { contratoActivo, usuarioId } = useContrato()
  const [descripcion, setDescripcion] = useState("")
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0])
  const [enviando, setEnviando] = useState(false)
  const [archivos, setArchivos] = useState<File[]>([])

  useEffect(() => {
    if (audioInicial) {
      setDescripcion(prev => prev ? `${prev} ${audioInicial}` : audioInicial)
    }
  }, [audioInicial])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setArchivos(Array.from(e.target.files))
    }
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

    setEnviando(true)

    try {
      const evidenciaIds: string[] = []
      
      // Subir evidencias si hay archivos
      if (archivos.length > 0) {
        console.log("📤 Subiendo", archivos.length, "evidencias...");
        
        for (const file of archivos) {
          try {
            const nuevaEvidencia = {
              actividadId,
              nombre: file.name,
              tipo: file.type.startsWith('image/') ? 'imagen' : 'documento',
              tamaño: file.size,
              url: "",
              fecha: new Date().toISOString()
            }
            
            console.log("📝 Creando evidencia:", nuevaEvidencia);
            
            const evidencia = await apiClient.createEvidencia(nuevaEvidencia, usuarioId, contratoActivo)
            console.log("✅ Evidencia creada:", evidencia);
            
            evidenciaIds.push(evidencia.id || evidencia._id)
          } catch (error) {
            console.error(`❌ Error subiendo archivo ${file.name}:`, error)
            toast.error(`Error al subir ${file.name}`)
          }
        }
      }

      // Crear el aporte
      const nuevoAporte = {
        actividadId,
        fecha,
        descripcion: descripcion.trim(),
        estado: "completado",
        monto: 1,
        evidenciaIds
      }

      console.log("📝 Creando aporte:", nuevoAporte);
      
      await apiClient.createAporte(nuevoAporte, usuarioId, contratoActivo)
      
      toast.success("Aporte registrado correctamente")
      setDescripcion("")
      setArchivos([])
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("❌ Error creando aporte:", error)
      toast.error("Error al registrar el aporte")
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="fecha" className="text-sm font-medium text-foreground">
          Fecha
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="date"
            id="fecha"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="descripcion" className="text-sm font-medium text-foreground">
          Descripción
        </label>
        <textarea
          id="descripcion"
          rows={3}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Describe el aporte realizado..."
          className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground">
          Archivos adjuntos
        </label>
        <div className="flex items-center gap-2">
          <input
            type="file"
            id="archivos"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="archivos"
            className="flex items-center gap-2 px-4 py-2 border border-input rounded-lg cursor-pointer hover:bg-accent transition-colors"
          >
            <Upload className="h-4 w-4" />
            <span className="text-sm">Seleccionar archivos</span>
          </label>
          {archivos.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {archivos.length} archivo(s) seleccionado(s)
            </span>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={enviando}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="h-4 w-4" />
        {enviando ? "Registrando..." : "Registrar Aporte"}
      </button>
    </form>
  )
}