"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, Clock, MapPin, Users, Edit3, Trash2, Link as LinkIcon } from "lucide-react"

interface VistaTablaProps {
  eventos: any[]
  onEdit: (evento: any) => void
  onDelete: (id: string) => void
}

export function VistaTabla({ eventos, onEdit, onDelete }: VistaTablaProps) {
  const [filtro, setFiltro] = useState("")

  const eventosFiltrados = eventos.filter(evento =>
    evento.summary?.toLowerCase().includes(filtro.toLowerCase()) ||
    evento.description?.toLowerCase().includes(filtro.toLowerCase())
  )

  const formatearFecha = (fecha: string) => {
    return format(new Date(fecha), "d 'de' MMMM, yyyy", { locale: es })
  }

  const formatearHora = (fecha: string) => {
    return format(new Date(fecha), "HH:mm")
  }

  return (
    <div className="space-y-4">
      {/* Filtro de búsqueda */}
      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Buscar eventos..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary w-64"
        />
        <p className="text-sm text-muted-foreground">
          {eventosFiltrados.length} eventos
        </p>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Título</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Fecha</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Hora</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Ubicación</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Asistentes</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {eventosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No hay eventos para mostrar
                </td>
              </tr>
            ) : (
              eventosFiltrados.map((evento) => (
                <tr key={evento.id} className="hover:bg-accent/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium">{evento.summary}</div>
                    {evento.description && (
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {evento.description}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {formatearFecha(evento.start)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {formatearHora(evento.start)} - {formatearHora(evento.end)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {evento.location || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{evento.attendees?.length || 0}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      {evento.hangoutLink && (
                        <a
                          href={evento.hangoutLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-primary hover:bg-primary/10 rounded"
                        >
                          <LinkIcon className="h-4 w-4" />
                        </a>
                      )}
                      <button
                        onClick={() => onEdit(evento)}
                        className="p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(evento.id)}
                        className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}