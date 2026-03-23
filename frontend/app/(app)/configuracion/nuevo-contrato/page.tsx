"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"
import { useContrato } from "@/contexts/contrato-context"
import { toast } from "sonner"

export default function NuevoContratoPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { refreshContratos } = useContrato()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    numero: "",
    entidad: "",
    objeto: "",
    fechaInicio: "",
    fechaFin: "",
    valor: 0,
    supervisorNombre: "",
    supervisorCargo: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.numero || !form.entidad || !form.objeto || !form.fechaInicio || !form.fechaFin || !form.valor) {
      toast.error("Por favor completa todos los campos del contrato")
      return
    }

    if (!form.supervisorNombre) {
      toast.error("El nombre del supervisor es requerido")
      return
    }

    setLoading(true)

    try {
      const nuevoContrato = {
        ...form,
        contratistaNombre: user?.email?.split("@")[0] || "Por definir",
        contratistaCedula: "Por definir",
        contratistaProfesion: "Por definir",
        usuarioId: user?.id,
        estado: "activo"
      }

      await apiClient.createContrato(nuevoContrato)
      
      toast.success("Contrato creado exitosamente")
      await refreshContratos()
      router.push("/configuracion")
      
    } catch (error) {
      console.error("Error creando contrato:", error)
      toast.error("Error al crear el contrato")
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field: string, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/configuracion"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a configuración
      </Link>

      <div className="bg-card rounded-xl border border-border shadow-lg p-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Crear Nuevo Contrato
        </h1>
        <p className="text-muted-foreground mb-6">
          Completa la información básica del contrato. Los datos del contratista podrás editarlos después.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground border-b pb-2">
              Datos del Contrato
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldInput
                label="Número de contrato *"
                value={form.numero}
                onChange={(v) => updateField("numero", v)}
                placeholder="Ej: PROS-2025-001"
                required
              />
              
              <FieldInput
                label="Entidad contratante *"
                value={form.entidad}
                onChange={(v) => updateField("entidad", v)}
                placeholder="Ej: Prosecto S.A. E.S.P."
                required
              />
              
              <div className="md:col-span-2">
                <FieldTextarea
                  label="Objeto del contrato *"
                  value={form.objeto}
                  onChange={(v) => updateField("objeto", v)}
                  placeholder="Describe el propósito y alcance del contrato"
                  required
                />
              </div>
              
              <FieldInput
                label="Fecha de inicio *"
                type="date"
                value={form.fechaInicio}
                onChange={(v) => updateField("fechaInicio", v)}
                required
              />
              
              <FieldInput
                label="Fecha de fin *"
                type="date"
                value={form.fechaFin}
                onChange={(v) => updateField("fechaFin", v)}
                required
              />
              
              <FieldInput
                label="Valor del contrato *"
                type="number"
                value={form.valor.toString()}
                onChange={(v) => updateField("valor", Number(v))}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground border-b pb-2">
              Datos del Supervisor
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldInput
                label="Nombre del supervisor *"
                value={form.supervisorNombre}
                onChange={(v) => updateField("supervisorNombre", v)}
                placeholder="Ej: Carlos Rodríguez"
                required
              />
              
              <FieldInput
                label="Cargo del supervisor"
                value={form.supervisorCargo}
                onChange={(v) => updateField("supervisorCargo", v)}
                placeholder="Ej: Supervisor de Contratos"
              />
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Nota:</span> Los datos del contratista 
              (nombre, cédula, profesión) podrás completarlos después desde la pestaña "Contrato" 
              en configuración.
            </p>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <Link
              href="/configuracion"
              className="px-6 py-2 border border-border rounded-lg text-foreground hover:bg-accent transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {loading ? "Creando..." : "Crear Contrato"}
            </button>
          </div>
        </form>
      </div>
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
      <label className="text-sm font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
      />
    </div>
  )
}

function FieldTextarea({
  label,
  value,
  onChange,
  placeholder = "",
  required = false
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
      />
    </div>
  )
}