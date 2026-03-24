"use client"

import { useState, useEffect, useCallback } from "react"
import { Calendar, Calendar as BigCalendar, dateFnsLocalizer, Views } from "react-big-calendar"
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns"
import { es } from "date-fns/locale"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { PageHeader } from "@/components/page-header"
import { VistaTabla } from "@/components/calendario/vista-tabla"
import { EventoForm } from "@/components/calendario/evento-form"
import { useAuth } from "@/contexts/auth-context"
import { useContrato } from "@/contexts/contrato-context"
import { useRouter } from "next/navigation"
import { Calendar as CalendarIcon, Table, Plus, Loader2, PlusCircle } from "lucide-react"
import { toast } from "sonner"

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: es }),
  getDay,
  locales: { es }
})

// Componente personalizado para eventos con botón de crear aporte
const EventoCalendario = ({ event }: any) => {
  const router = useRouter()
  const { contratoActivo } = useContrato()

  const handleRegistrarAporte = (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!contratoActivo) {
      toast.error("Selecciona un contrato activo primero")
      return
    }

    const descripcionPrefill = [
      `Reunión: ${event.title || event.summary}`,
      event.description ? `\n${event.description}` : '',
      `\nFecha: ${format(new Date(event.start), "d 'de' MMMM 'de' yyyy", { locale: es })}`,
      `Hora: ${format(new Date(event.start), "HH:mm")} - ${format(new Date(event.end), "HH:mm")}`,
      event.location ? `\nLugar: ${event.location}` : '',
      event.hangoutLink ? `\nEnlace: ${event.hangoutLink}` : ''
    ].join('')

    router.push(
      `/actividades/nuevo-aporte?contrato=${contratoActivo}&descripcion=${encodeURIComponent(descripcionPrefill)}`
    )
  }

  return (
    <div className="group relative p-1 text-xs overflow-hidden hover:bg-primary/5 rounded transition-colors">
      <div className="flex items-center justify-between gap-1">
        <div className="flex-1 truncate">
          <strong>{event.title || event.summary}</strong>
          {event.location && <div className="text-xs opacity-75 truncate">📍 {event.location}</div>}
        </div>
        <button
          onClick={handleRegistrarAporte}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-primary/20 text-primary shrink-0"
          title="Registrar aporte"
        >
          <PlusCircle className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}

export default function CalendarioPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { contratoActivo } = useContrato()
  const [vista, setVista] = useState<'calendario' | 'tabla'>('calendario')
  const [eventos, setEventos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [eventoSeleccionado, setEventoSeleccionado] = useState<any>(null)
  const [fechaActual, setFechaActual] = useState(new Date())
  const [rangoActual, setRangoActual] = useState<{ start: Date; end: Date }>({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date())
  })

  const cargarEventos = useCallback(async (inicio?: Date, fin?: Date) => {
    if (!user?.id) {
      console.warn('⚠️ No hay usuario autenticado')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      
      const timeMin = inicio || rangoActual.start
      const timeMax = fin || rangoActual.end
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const url = new URL(`${baseUrl}/api/auth/google/events`)
      url.searchParams.append('usuarioId', user.id)
      url.searchParams.append('timeMin', timeMin.toISOString())
      url.searchParams.append('timeMax', timeMax.toISOString())
      
      console.log('📅 Cargando eventos desde:', timeMin.toISOString(), 'hasta:', timeMax.toISOString())
      
      const res = await fetch(url.toString())
      
      const responseText = await res.text()
      
      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('❌ Error parseando JSON:', parseError)
        setEventos([])
        toast.error('Error en la respuesta del servidor')
        return
      }
      
      if (res.status === 401) {
        if (data?.needsAuth) {
          toast.error("Conecta tu calendario de Google en configuración", {
            duration: 5000,
            action: {
              label: "Configurar",
              onClick: () => router.push('/configuracion?tab=integraciones')
            }
          })
        } else {
          toast.error("No autorizado para acceder al calendario")
        }
        setEventos([])
        return
      }
      
      if (!res.ok) {
        console.error('❌ Error HTTP:', res.status, data)
        toast.error(data?.error || data?.details || `Error ${res.status} al cargar eventos`)
        setEventos([])
        return
      }
      
      if (!data?.eventos || !Array.isArray(data.eventos)) {
        setEventos([])
        return
      }
      
      const eventosFormateados = data.eventos.map((evento: any, index: number) => {
        let startDate, endDate
        try {
          startDate = evento.start ? new Date(evento.start) : new Date()
          endDate = evento.end ? new Date(evento.end) : new Date(startDate.getTime() + 3600000)
          
          if (isNaN(startDate.getTime())) startDate = new Date()
          if (isNaN(endDate.getTime())) endDate = new Date(startDate.getTime() + 3600000)
        } catch (e) {
          startDate = new Date()
          endDate = new Date(Date.now() + 3600000)
        }
        
        return {
          id: evento.id || `temp-${Date.now()}-${index}`,
          title: evento.summary || 'Sin título',
          summary: evento.summary || 'Sin título',
          description: evento.description || '',
          start: startDate,
          end: endDate,
          location: evento.location || '',
          attendees: Array.isArray(evento.attendees) ? evento.attendees : [],
          hangoutLink: evento.hangoutLink || null
        }
      })
      
      console.log(`✅ ${eventosFormateados.length} eventos cargados correctamente`)
      setEventos(eventosFormateados)
      
    } catch (error) {
      console.error("❌ Error cargando eventos:", error)
      toast.error(error instanceof Error ? error.message : "Error al cargar eventos")
      setEventos([])
    } finally {
      setLoading(false)
    }
  }, [user?.id, rangoActual, router])

  // Efecto para cargar eventos cuando cambia el usuario o el rango
  useEffect(() => {
    if (user?.id) {
      cargarEventos()
    } else {
      setLoading(false)
    }
  }, [cargarEventos, user?.id])

  // Verificar conexión de Google al cargar la página
  useEffect(() => {
    const verificarConexionGoogle = async () => {
      if (!user?.id) return
      
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        const res = await fetch(`${baseUrl}/api/auth/google/status?usuarioId=${user.id}`)
        
        if (res.ok) {
          const data = await res.json()
          console.log('🔌 Estado Google Calendar:', data)
          
          if (!data.conectado) {
            toast.info('Conecta Google Calendar para sincronizar tus eventos', {
              duration: 8000,
              action: {
                label: 'Conectar',
                onClick: () => router.push('/configuracion?tab=integraciones')
              }
            })
          }
        }
      } catch (error) {
        console.error('Error verificando conexión:', error)
      }
    }
    
    verificarConexionGoogle()
  }, [user?.id, router])

  const handleNavigate = (nuevaFecha: Date) => {
    setFechaActual(nuevaFecha)
    // Actualizar el rango cuando se navega a otro mes
    const nuevoInicio = startOfMonth(nuevaFecha)
    const nuevoFin = endOfMonth(nuevaFecha)
    setRangoActual({ start: nuevoInicio, end: nuevoFin })
  }

  const handleSelectEvent = (evento: any) => {
    setEventoSeleccionado(evento)
    setShowForm(true)
  }

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setEventoSeleccionado({ start, end })
    setShowForm(true)
  }
  
  const handleSaveEvento = async (eventoData: any) => {
    try {
      if (!user?.id) {
        toast.error("Usuario no autenticado")
        return
      }
  
      const eventoToSave = {
        summary: eventoData.summary,
        description: eventoData.description,
        start: eventoData.start.toISOString(),
        end: eventoData.end.toISOString(),
        location: eventoData.location || "",
        attendees: eventoData.attendees || [],
        hangoutLink: eventoData.hangoutLink || ""
      }
  
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const url = eventoSeleccionado?.id 
        ? `${baseUrl}/api/auth/google/events/${eventoSeleccionado.id}`
        : `${baseUrl}/api/auth/google/events`
      
      const method = eventoSeleccionado?.id ? 'PUT' : 'POST'
  
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId: user.id, evento: eventoToSave })
      })
      
      const responseText = await response.text()
      
      let responseData
      try {
        responseData = JSON.parse(responseText)
      } catch (e) {
        // No es JSON
      }
      
      if (!response.ok) {
        const errorMsg = responseData?.error || responseData?.details || responseText || `Error ${response.status}`
        throw new Error(errorMsg)
      }
      
      const nuevoEventoFormateado = {
        ...responseData,
        start: new Date(responseData.start),
        end: new Date(responseData.end),
        title: responseData.summary
      }
      
      if (eventoSeleccionado?.id) {
        setEventos(eventos.map(ev => ev.id === eventoSeleccionado.id ? nuevoEventoFormateado : ev))
        toast.success("Evento actualizado")
      } else {
        setEventos([...eventos, nuevoEventoFormateado])
        toast.success("Evento creado")
      }
      
      setShowForm(false)
      setEventoSeleccionado(null)
      
    } catch (error: any) {
      console.error("❌ Error:", error)
      toast.error(error.message || "Error al guardar evento")
    }
  }
  
  const handleDeleteEvento = async (id: string) => {
    if (!user?.id) return
    
    if (confirm("¿Estás seguro de eliminar este evento?")) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        const response = await fetch(`${baseUrl}/api/auth/google/events/${id}?usuarioId=${user.id}`, {
          method: 'DELETE'
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(errorText || 'Error al eliminar evento')
        }
        
        setEventos(eventos.filter(ev => ev.id !== id))
        setShowForm(false)
        setEventoSeleccionado(null)
        toast.success("Evento eliminado")
        
      } catch (error) {
        console.error("Error eliminando evento:", error)
        toast.error(error instanceof Error ? error.message : "Error al eliminar evento")
      }
    }
  }

  const handleRegistrarAporteEvento = (evento: any) => {
    if (!contratoActivo) {
      toast.error("Selecciona un contrato activo primero")
      return
    }

    const descripcionPrefill = [
      `Reunión: ${evento.title || evento.summary}`,
      evento.description ? `\n${evento.description}` : '',
      `\nFecha: ${format(new Date(evento.start), "d 'de' MMMM 'de' yyyy", { locale: es })}`,
      `Hora: ${format(new Date(evento.start), "HH:mm")} - ${format(new Date(evento.end), "HH:mm")}`,
      evento.location ? `\nLugar: ${evento.location}` : '',
      evento.hangoutLink ? `\nEnlace: ${evento.hangoutLink}` : ''
    ].join('')

    router.push(
      `/actividades/nuevo-aporte?contrato=${contratoActivo}&descripcion=${encodeURIComponent(descripcionPrefill)}`
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <PageHeader titulo="Calendario" descripcion="Gestiona tus reuniones y eventos" />
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        titulo="Calendario"
        descripcion="Gestiona tus reuniones y eventos"
      >
        <div className="flex items-center gap-2">
          {/* Selector de vista */}
          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg mr-2">
            <button
              onClick={() => setVista('calendario')}
              className={`p-2 rounded-md transition-colors ${
                vista === 'calendario' 
                  ? 'bg-card text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <CalendarIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setVista('tabla')}
              className={`p-2 rounded-md transition-colors ${
                vista === 'tabla' 
                  ? 'bg-card text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Table className="h-4 w-4" />
            </button>
          </div>

          {/* Botón nuevo evento */}
          <button
            onClick={() => {
              setEventoSeleccionado(null)
              setShowForm(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nuevo Evento
          </button>
        </div>
      </PageHeader>

      {eventos.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">No hay eventos para mostrar</p>
          <button
            onClick={() => {
              setEventoSeleccionado(null)
              setShowForm(true)
            }}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Crear primer evento
          </button>
        </div>
      ) : (
        <>
          {vista === 'calendario' ? (
            <div className="bg-card border border-border rounded-lg p-4 h-[700px]">
              <BigCalendar
                localizer={localizer}
                events={eventos}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                defaultView={Views.MONTH}
                date={fechaActual}
                onNavigate={handleNavigate}
                messages={{
                  next: "Siguiente",
                  previous: "Anterior",
                  today: "Hoy",
                  month: "Mes",
                  week: "Semana",
                  day: "Día",
                  agenda: "Agenda",
                  date: "Fecha",
                  time: "Hora",
                  event: "Evento",
                  noEventsInRange: "No hay eventos en este rango"
                }}
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                selectable
                components={{
                  event: EventoCalendario
                }}
                className="react-big-calendar"
              />
            </div>
          ) : (
            <VistaTabla
              eventos={eventos}
              onEdit={handleSelectEvent}
              onDelete={handleDeleteEvento}
              onRegistrarAporte={handleRegistrarAporteEvento}
            />
          )}
        </>
      )}

      {/* Modal de formulario */}
      {showForm && (
        <EventoForm
          evento={eventoSeleccionado}
          onClose={() => {
            setShowForm(false)
            setEventoSeleccionado(null)
          }}
          onSave={handleSaveEvento}
          onDelete={eventoSeleccionado?.id ? handleDeleteEvento : undefined}
        />
      )}
    </div>
  )
}