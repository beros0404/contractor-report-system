"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Edit3, X, Check } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useContrato } from "@/contexts/contrato-context"
import { toast } from "sonner"

interface ActividadesTabProps {
  onSave: () => void
}

interface Actividad {
  id: string
  numero: number
  titulo: string
  descripcion: string
  porcentajePeso: number
  estado?: string
}

export function ActividadesTab({ onSave }: ActividadesTabProps) {
  const { contratoActivo, usuarioId } = useContrato()
  const [actividades, setActividades] = useState<Actividad[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    porcentajePeso: 0,
  })

  useEffect(() => {
    if (contratoActivo && usuarioId) {
      cargarActividades()
    }
  }, [contratoActivo, usuarioId])

  const cargarActividades = async () => {
    try {
      setLoading(true)
      if (!contratoActivo || !usuarioId) return
      
      const data = await apiClient.getActividades(contratoActivo, usuarioId)
      setActividades(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error cargando actividades:", error)
      toast.error("Error al cargar las actividades")
    } finally {
      setLoading(false)
    }
  }

  const refresh = () => {
    cargarActividades()
    onSave()
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.titulo.trim()) {
      toast.error("El título es requerido")
      return
    }

    try {
      const nuevaActividad = {
        numero: actividades.length + 1,
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        porcentajePeso: form.porcentajePeso,
        estado: "activa"
      }

      await apiClient.createActividad(nuevaActividad, usuarioId!, contratoActivo!)
      setForm({ titulo: "", descripcion: "", porcentajePeso: 0 })
      setAdding(false)
      toast.success("Actividad creada")
      refresh()
    } catch (error) {
      toast.error("Error al crear la actividad")
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId || !form.titulo.trim()) return

    try {
      await apiClient.updateActividad(editingId, {
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        porcentajePeso: form.porcentajePeso,
      }, usuarioId!)
      
      setEditingId(null)
      setForm({ titulo: "", descripcion: "", porcentajePeso: 0 })
      toast.success("Actividad actualizada")
      refresh()
    } catch (error) {
      toast.error("Error al actualizar la actividad")
    }
  }

  const startEdit = (act: Actividad) => {
    setEditingId(act.id)
    setForm({
      titulo: act.titulo,
      descripcion: act.descripcion,
      porcentajePeso: act.porcentajePeso,
    })
    setAdding(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta actividad?")) return

    try {
      await apiClient.deleteActividad(id, usuarioId!)
      toast.success("Actividad eliminada")
      refresh()
    } catch (error) {
      toast.error("Error al eliminar la actividad")
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
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-card-foreground">
              Actividades Contractuales
            </h3>
            <p className="text-xs text-muted-foreground">
              Total: {actividades.length} actividades
            </p>
          </div>
          {!adding && !editingId && (
            <button
              onClick={() => {
                setAdding(true)
                setForm({ titulo: "", descripcion: "", porcentajePeso: 0 })
              }}
              className="flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus className="h-3.5 w-3.5" />
              Agregar
            </button>
          )}
        </div>

        {/* Tabla de actividades */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">#</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Actividad Contractual</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {actividades.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No hay actividades. Crea la primera.
                  </td>
                </tr>
              ) : (
                actividades.map((act) => (
                  editingId === act.id ? (
                    <tr key={act.id} className="border-b border-border">
                      <td className="px-4 py-2">{act.numero}</td>
                      <td className="px-4 py-2">
                        <form onSubmit={handleUpdate} className="flex flex-col gap-2">
                          <input
                            value={form.titulo}
                            onChange={(e) => setForm(f => ({ ...f, titulo: e.target.value }))}
                            placeholder="Título"
                            className="w-full rounded border border-input bg-background px-2 py-1 text-sm"
                            autoFocus
                          />
                          <textarea
                            value={form.descripcion}
                            onChange={(e) => setForm(f => ({ ...f, descripcion: e.target.value }))}
                            placeholder="Descripción"
                            rows={2}
                            className="w-full rounded border border-input bg-background px-2 py-1 text-sm resize-none"
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={form.porcentajePeso}
                              onChange={(e) => setForm(f => ({ ...f, porcentajePeso: Number(e.target.value) }))}
                              className="w-20 rounded border border-input bg-background px-2 py-1 text-sm"
                              min={0}
                              max={100}
                            />
                            <span className="text-xs">% peso</span>
                            <div className="flex gap-1 ml-auto">
                              <button type="submit" className="p-1 text-primary hover:bg-primary/10 rounded">
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingId(null)
                                  setForm({ titulo: "", descripcion: "", porcentajePeso: 0 })
                                }}
                                className="p-1 text-muted-foreground hover:bg-accent rounded"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </form>
                      </td>
                      <td className="px-4 py-2 text-right"></td>
                    </tr>
                  ) : (
                    <tr key={act.id} className="border-b border-border hover:bg-accent/50">
                      <td className="px-4 py-2 font-medium">{act.numero}</td>
                      <td className="px-4 py-2">
                        <div className="font-medium">{act.titulo}</div>
                        {act.descripcion && (
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{act.descripcion}</div>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => startEdit(act)}
                            className="p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(act.id)}
                            className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Formulario para agregar nueva actividad */}
        {adding && (
          <form onSubmit={handleAdd} className="mt-4 border-t border-border pt-4">
            <div className="grid gap-3">
              <input
                value={form.titulo}
                onChange={(e) => setForm(f => ({ ...f, titulo: e.target.value }))}
                placeholder="Título de la actividad"
                className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
                autoFocus
              />
              <textarea
                value={form.descripcion}
                onChange={(e) => setForm(f => ({ ...f, descripcion: e.target.value }))}
                placeholder="Descripción"
                rows={2}
                className="w-full rounded border border-input bg-background px-3 py-2 text-sm resize-none"
              />
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={form.porcentajePeso}
                  onChange={(e) => setForm(f => ({ ...f, porcentajePeso: Number(e.target.value) }))}
                  className="w-20 rounded border border-input bg-background px-3 py-2 text-sm"
                  min={0}
                  max={100}
                />
                <span className="text-sm text-muted-foreground">% peso</span>
                <div className="flex gap-2 ml-auto">
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-primary text-primary-foreground rounded text-sm font-medium hover:bg-primary/90"
                  >
                    Crear
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdding(false)}
                    className="px-3 py-1.5 border border-border rounded text-sm font-medium hover:bg-accent"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}