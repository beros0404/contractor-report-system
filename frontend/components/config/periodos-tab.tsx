"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import { useContrato } from "@/contexts/contrato-context"

interface PeriodosTabProps {
  onSave: () => void
}

type FrecuenciaInforme = "semanal" | "quincenal" | "mensual"

interface ConfiguracionPeriodos {
  frecuenciaInforme: FrecuenciaInforme
  diaGeneracion: number
  periodoActualInicio: string
  periodoActualFin: string
  plantillaSeleccionada: string
}

const frecuencias: { value: FrecuenciaInforme; label: string }[] = [
  { value: "semanal", label: "Semanal" },
  { value: "quincenal", label: "Quincenal" },
  { value: "mensual", label: "Mensual" },
]

const plantillas = [
  { id: "clasica", nombre: "Clásica" },
  { id: "moderna", nombre: "Moderna" },
  { id: "compacta", nombre: "Compacta" },
]

export function PeriodosTab({ onSave }: PeriodosTabProps) {
  const { contratoActivo, usuarioId } = useContrato()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<ConfiguracionPeriodos>({
    frecuenciaInforme: "mensual",
    diaGeneracion: 30,
    periodoActualInicio: "",
    periodoActualFin: "",
    plantillaSeleccionada: "clasica",
  })

  useEffect(() => {
    if (contratoActivo && usuarioId) {
      cargarConfiguracion()
    }
  }, [contratoActivo, usuarioId])

  const cargarConfiguracion = async () => {
    if (!contratoActivo || !usuarioId) return

    try {
      setLoading(true)
      const data = await apiClient.getConfiguracion(contratoActivo, usuarioId)
      
      setForm({
        frecuenciaInforme: data.reportes?.frecuencia || "mensual",
        diaGeneracion: data.reportes?.diaGeneracion || 30,
        periodoActualInicio: data.reportes?.periodoActualInicio ? data.reportes.periodoActualInicio.split('T')[0] : "",
        periodoActualFin: data.reportes?.periodoActualFin ? data.reportes.periodoActualFin.split('T')[0] : "",
        plantillaSeleccionada: data.reportes?.plantillaSeleccionada || "clasica",
      })
    } catch (error) {
      console.error("Error cargando configuración:", error)
      toast.error("Error al cargar la configuración")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!contratoActivo || !usuarioId) {
      toast.error("No hay un contrato seleccionado")
      return
    }

    try {
      setSaving(true)
      await apiClient.updateConfiguracion(contratoActivo, usuarioId, { 
        reportes: form 
      })
      toast.success("Configuración de periodos actualizada")
      onSave()
    } catch (error) {
      console.error("Error actualizando configuración:", error)
      toast.error("Error al actualizar la configuración")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6">
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold text-card-foreground">
          Frecuencia de Informes
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Frecuencia
            </label>
            <div className="flex items-center gap-1 rounded-md bg-muted p-1">
              {frecuencias.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      frecuenciaInforme: f.value,
                    }))
                  }
                  className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    form.frecuenciaInforme === f.value
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Día de generación
            </label>
            <input
              type="number"
              value={form.diaGeneracion}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  diaGeneracion: Number(e.target.value),
                }))
              }
              min={1}
              max={31}
              className="h-9 w-24 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold text-card-foreground">
          Periodo Actual
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Fecha de inicio
            </label>
            <input
              type="date"
              value={form.periodoActualInicio}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  periodoActualInicio: e.target.value,
                }))
              }
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Fecha de fin
            </label>
            <input
              type="date"
              value={form.periodoActualFin}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  periodoActualFin: e.target.value,
                }))
              }
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
      </div>



      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </form>
  )
}