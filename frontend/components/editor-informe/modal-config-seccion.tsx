"use client"

import { useState } from "react"
import { X, Save } from "lucide-react"

interface ModalConfigSeccionProps {
  seccion: any
  onClose: () => void
  onSave: (seccionActualizada: any) => void
}

export function ModalConfigSeccion({ seccion, onClose, onSave }: ModalConfigSeccionProps) {
  const [form, setForm] = useState({
    titulo: seccion.titulo || '',
    visible: seccion.visible !== false,
    ...(seccion.tipo === 'info-contrato' && { columnas: seccion.columnas || 2 }),
    ...(seccion.tipo === 'personalizado' && { contenido: seccion.contenido || '' })
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ ...seccion, ...form })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold">Configurar {seccion.titulo}</h3>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Título de la sección
            </label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              className="w-full p-2 border border-input rounded-lg text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="visible"
              checked={form.visible}
              onChange={(e) => setForm({ ...form, visible: e.target.checked })}
              className="rounded border-input"
            />
            <label htmlFor="visible" className="text-sm">
              Mostrar sección en el informe
            </label>
          </div>

          {seccion.tipo === 'info-contrato' && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Número de columnas
              </label>
              <select
                value={form.columnas}
                onChange={(e) => setForm({ ...form, columnas: Number(e.target.value) })}
                className="w-full p-2 border border-input rounded-lg text-sm"
              >
                <option value={1}>1 columna</option>
                <option value={2}>2 columnas</option>
                <option value={3}>3 columnas</option>
              </select>
            </div>
          )}

          {seccion.tipo === 'personalizado' && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Contenido
              </label>
              <textarea
                value={form.contenido}
                onChange={(e) => setForm({ ...form, contenido: e.target.value })}
                rows={4}
                className="w-full p-2 border border-input rounded-lg text-sm resize-none"
                placeholder="Escribe el texto personalizado..."
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-accent"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 flex items-center gap-1"
            >
              <Save className="h-3 w-3" />
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}