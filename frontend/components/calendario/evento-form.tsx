"use client"

import { useState } from "react"
import { X, Calendar, Clock, MapPin, Link2, Users } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface EventoFormProps {
  evento?: any
  onClose: () => void
  onSave: (evento: any) => void
  onDelete?: (id: string) => void
}

export function EventoForm({ evento, onClose, onSave, onDelete }: EventoFormProps) {
  const [form, setForm] = useState({
    summary: evento?.summary || "",
    description: evento?.description || "",
    start: evento?.start ? new Date(evento.start) : new Date(),
    end: evento?.end ? new Date(evento.end) : new Date(Date.now() + 3600000), 
    location: evento?.location || "",
    attendees: evento?.attendees?.map((a: any) => a.email).join(", ") || "",
    hangoutLink: evento?.hangoutLink || ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.summary.trim()) {
      alert("El título es requerido")
      return
    }

    const attendeesList = form.attendees
      .split(",")
      .map(email => email.trim())
      .filter(email => email && email.includes('@'))

    onSave({
      ...form,
      attendees: attendeesList
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            {evento ? "Editar Evento" : "Nuevo Evento"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Título <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ej: Reunión de seguimiento"
              required
            />
          </div>

          {/* Fecha y hora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                <Clock className="h-4 w-4 inline mr-1" />
                Inicio
              </label>
              <input
                type="datetime-local"
                value={format(form.start, "yyyy-MM-dd'T'HH:mm")}
                onChange={(e) => setForm({ ...form, start: new Date(e.target.value) })}
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                <Clock className="h-4 w-4 inline mr-1" />
                Fin
              </label>
              <input
                type="datetime-local"
                value={format(form.end, "yyyy-MM-dd'T'HH:mm")}
                onChange={(e) => setForm({ ...form, end: new Date(e.target.value) })}
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              <MapPin className="h-4 w-4 inline mr-1" />
              Ubicación
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Ej: Oficina, Sala de reuniones, etc."
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Enlace Meet */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              <Link2 className="h-4 w-4 inline mr-1" />
              Enlace Meet
            </label>
            <input
              type="url"
              value={form.hangoutLink}
              onChange={(e) => setForm({ ...form, hangoutLink: e.target.value })}
              placeholder="https://meet.google.com/..."
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Asistentes */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              <Users className="h-4 w-4 inline mr-1" />
              Asistentes (emails separados por coma)
            </label>
            <input
              type="text"
              value={form.attendees}
              onChange={(e) => setForm({ ...form, attendees: e.target.value })}
              placeholder="ejemplo@email.com, otro@email.com"
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Ingresa los correos electrónicos separados por coma
            </p>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Descripción
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Detalles adicionales del evento..."
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            {evento && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(evento.id)}
                className="px-4 py-2 border border-destructive/30 text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
              >
                Eliminar
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              {evento ? "Actualizar" : "Crear"} Evento
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}