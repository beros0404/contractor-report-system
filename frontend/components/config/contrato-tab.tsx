"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import { useContrato } from "@/contexts/contrato-context"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface ContratoTabProps {
  onSave: () => void
}

interface Contrato {
  id?: string
  numero: string
  entidad: string
  objeto: string
  fechaInicio: string
  fechaFin: string
  valor: number
  contratistaNombre: string
  contratistaCedula: string
  contratistaProfesion: string
  supervisorNombre: string
  supervisorCargo: string
  lugarFirma?: string
  fechaFirma?: string
}

export function ContratoTab({ onSave }: ContratoTabProps) {
  const router = useRouter()
  const { contratoActivo, usuarioId, refreshContratos } = useContrato()
  const [contrato, setContrato] = useState<Contrato | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [form, setForm] = useState<Contrato>({
    numero: "",
    entidad: "",
    objeto: "",
    fechaInicio: "",
    fechaFin: "",
    valor: 0,
    contratistaNombre: "",
    contratistaCedula: "",
    contratistaProfesion: "",
    supervisorNombre: "",
    supervisorCargo: "",
    lugarFirma: "Rionegro",
  })

  useEffect(() => {
    if (contratoActivo && !contratoActivo.startsWith('temp-') && usuarioId) {
      cargarContrato()
    } else {
      setLoading(false)
    }
  }, [contratoActivo, usuarioId])

  const cargarContrato = async () => {
    if (!contratoActivo || !usuarioId) return

    try {
      setLoading(true)
      const data = await apiClient.getContrato(contratoActivo)
      setContrato(data)
      setForm({
        numero: data.numero || "",
        entidad: data.entidad || "",
        objeto: data.objeto || "",
        fechaInicio: data.fechaInicio ? data.fechaInicio.split('T')[0] : "",
        fechaFin: data.fechaFin ? data.fechaFin.split('T')[0] : "",
        valor: data.valor || 0,
        contratistaNombre: data.contratistaNombre || "",
        contratistaCedula: data.contratistaCedula || "",
        contratistaProfesion: data.contratistaProfesion || "",
        supervisorNombre: data.supervisorNombre || "",
        supervisorCargo: data.supervisorCargo || "",
        lugarFirma: data.lugarFirma || "Rionegro"
      })
    } catch (error) {
      console.error("Error cargando contrato:", error)
      toast.error("Error al cargar los datos del contrato")
    } finally {
      setLoading(false)
    }
  }

  const handleCrearNuevo = () => {
    router.push("/configuracion/nuevo-contrato")
  }

  const handleDelete = async () => {
    if (!contratoActivo || !usuarioId) {
      toast.error("No hay un contrato seleccionado")
      return
    }

    setDeleting(true)
    try {
      await apiClient.deleteContrato(contratoActivo)
      toast.success("Contrato eliminado correctamente")
      await refreshContratos()
      router.push("/configuracion")
    } catch (error) {
      console.error("Error eliminando contrato:", error)
      toast.error("Error al eliminar el contrato")
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contratoActivo || contratoActivo.startsWith('temp-') || !usuarioId) {
      toast.error("No hay un contrato válido seleccionado")
      return
    }

    try {
      setSaving(true)
      await apiClient.updateContrato(contratoActivo, {
        ...form,
        usuarioId
      })
      toast.success("Datos del contrato actualizados")
      onSave()
    } catch (error) {
      console.error("Error actualizando contrato:", error)
      toast.error("Error al actualizar el contrato")
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: keyof Contrato, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <button
          onClick={handleCrearNuevo}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Crear Nuevo Contrato
        </button>

        {contratoActivo && !contratoActivo.startsWith('temp-') && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 rounded-md border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar Contrato
          </button>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              ¿Eliminar contrato?
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Esta acción eliminará permanentemente el contrato "{contrato?.numero}" y todos sus datos asociados (actividades, aportes, evidencias, informes). ¿Estás seguro?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Datos del Contrato */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-card-foreground">
            Datos del Contrato
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FieldInput
              label="Número de contrato"
              value={form.numero}
              onChange={(v) => updateField("numero", v)}
              required
            />
            <FieldInput
              label="Entidad contratante"
              value={form.entidad}
              onChange={(v) => updateField("entidad", v)}
              required
            />
            <div className="sm:col-span-2">
              <FieldTextarea
                label="Objeto del contrato"
                value={form.objeto}
                onChange={(v) => updateField("objeto", v)}
                required
              />
            </div>
            <FieldInput
              label="Fecha de inicio"
              type="date"
              value={form.fechaInicio}
              onChange={(v) => updateField("fechaInicio", v)}
              required
            />
            <FieldInput
              label="Fecha de fin"
              type="date"
              value={form.fechaFin}
              onChange={(v) => updateField("fechaFin", v)}
              required
            />
            <FieldInput
              label="Valor del contrato"
              type="number"
              value={form.valor.toString()}
              onChange={(v) => updateField("valor", Number(v))}
              required
            />
          </div>
        </div>

        {/* Datos del Contratista */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-card-foreground">
            Datos del Contratista
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FieldInput
              label="Nombre completo"
              value={form.contratistaNombre}
              onChange={(v) => updateField("contratistaNombre", v)}
              required
            />
            <FieldInput
              label="Cédula"
              value={form.contratistaCedula}
              onChange={(v) => updateField("contratistaCedula", v)}
              required
            />
            <FieldInput
              label="Profesión"
              value={form.contratistaProfesion}
              onChange={(v) => updateField("contratistaProfesion", v)}
            />
          </div>
        </div>

        {/* Datos del Supervisor */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-card-foreground">
            Datos del Supervisor
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FieldInput
              label="Nombre del supervisor"
              value={form.supervisorNombre}
              onChange={(v) => updateField("supervisorNombre", v)}
              required
            />
            <FieldInput
              label="Cargo del supervisor"
              value={form.supervisorCargo}
              onChange={(v) => updateField("supervisorCargo", v)}
            />
          </div>
        </div>

        {/* Localización de Firma */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-card-foreground">
            Localización de Firma
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
          Este dato se usará en la línea de firma del informe. La fecha se calculará automáticamente como el último día del mes del informe.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FieldInput
              label="Lugar de firma"
              value={form.lugarFirma || "Rionegro"}
              onChange={(v) => updateField("lugarFirma", v)}
              placeholder="Ej: Rionegro, Medellín, Bogotá"
            />
            <FieldInput
              label="Fecha de firma"
              type="date"
              value={form.fechaFirma || new Date().toISOString().split('T')[0]}
              onChange={(v) => updateField("fechaFirma", v)}
            />
          </div>
          <div className="mt-4 p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-foreground">
            <span className="font-medium">Vista previa:</span> Para constancia se firma en <strong>{form.lugarFirma || "Rionegro"}</strong> a los [días] días del mes de [mes] de [año].
            </p>
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
    </div>
  )
}

function FieldInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  required?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
      />
    </div>
  )
}

function FieldTextarea({
  label,
  value,
  onChange,
  required = false
}: {
  label: string
  value: string
  onChange: (v: string) => void
  required?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
      />
    </div>
  )
}