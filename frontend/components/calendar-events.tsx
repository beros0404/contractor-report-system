"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, MapPin, Users, Link as LinkIcon, PlusCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useContrato } from "@/contexts/contrato-context"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { CalendarConnect } from "./calendar-connect"

interface Evento {
  id: string
  summary: string
  description: string
  start: string
  end: string
  location: string
  attendees: string[]
  hangoutLink: string | null
}

export function CalendarEvents() {
  const { user } = useAuth()
  const { contratoActivo } = useContrato()
  const router = useRouter()
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [needsAuth, setNeedsAuth] = useState(false)

  const cargarEventos = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google/events?usuarioId=${user.id}`)
      
      if (res.status === 401) {
        const data = await res.json()
        if (data.needsAuth) {
          setNeedsAuth(true)
        }
        return
      }
      
      const data = await res.json()
      setEventos(data.eventos || [])
      setNeedsAuth(false)
      
    } catch (error) {
      console.error("Error cargando eventos:", error)
      toast.error("Error al cargar eventos del calendario")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarEventos()
  }, [user?.id])

  const handleRegistrarAporte = (evento: Evento) => {
    if (!contratoActivo) {
      toast.error("Selecciona un contrato activo primero")
      return
    }

    // Crear descripción prellenada con datos del evento
    const descripcionPrefill = [
      `Reunión: ${evento.summary}`,
      evento.description ? `\n${evento.description}` : '',
      `\nFecha: ${format(new Date(evento.start), "d 'de' MMMM 'de' yyyy", { locale: es })}`,
      `Hora: ${format(new Date(evento.start), "HH:mm")} - ${format(new Date(evento.end), "HH:mm")}`,
      evento.location ? `\nLugar: ${evento.location}` : '',
      evento.hangoutLink ? `\nEnlace: ${evento.hangoutLink}` : ''
    ].join('')

    // Redirigir a nuevo aporte con datos prellenados
    router.push(
      `/actividades/nuevo-aporte?contrato=${contratoActivo}&descripcion=${encodeURIComponent(descripcionPrefill)}`
    )
  }

  if (needsAuth) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Conecta tu calendario
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Conecta tu Google Calendar para ver tus reuniones y registrar aportes fácilmente
          </p>
          <CalendarConnect onConnected={cargarEventos} />
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (eventos.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <p className="text-sm text-muted-foreground text-center">
          No hay reuniones programadas para hoy
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-foreground">
          Reuniones de hoy ({eventos.length})
        </h3>
        <CalendarConnect onConnected={cargarEventos} />
      </div>

      {eventos.map((evento) => (
        <div
          key={evento.id}
          className="bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-foreground mb-1">
                {evento.summary}
              </h4>
              
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    {format(new Date(evento.start), "HH:mm")} - {format(new Date(evento.end), "HH:mm")}
                  </span>
                </div>
                
                {evento.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{evento.location}</span>
                  </div>
                )}
                
                {evento.attendees.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span className="truncate">
                      {evento.attendees.slice(0, 3).join(', ')}
                      {evento.attendees.length > 3 && ` +${evento.attendees.length - 3}`}
                    </span>
                  </div>
                )}
                
                {evento.hangoutLink && (
                  <div className="flex items-center gap-1">
                    <LinkIcon className="h-3 w-3" />
                    <a
                      href={evento.hangoutLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline truncate"
                    >
                      Enlace Meet
                    </a>
                  </div>
                )}
              </div>

              {evento.description && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                  {evento.description}
                </p>
              )}
            </div>

            <button
              onClick={() => handleRegistrarAporte(evento)}
              className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-xs font-medium"
            >
              <PlusCircle className="h-3 w-3" />
              Registrar
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}