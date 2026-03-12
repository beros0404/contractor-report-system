"use client"

import { useState, useEffect, useCallback } from "react"
import { Calendar, Calendar as BigCalendar, dateFnsLocalizer, Views } from "react-big-calendar"
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth } from "date-fns"
import { es } from "date-fns/locale"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { PageHeader } from "@/components/page-header"
import { VistaTabla } from "@/components/calendario/vista-tabla"
import { EventoForm } from "@/components/calendario/evento-form"
import { useAuth } from "@/contexts/auth-context"
import { useContrato } from "@/contexts/contrato-context"
import { Calendar as CalendarIcon, Table, Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: es }),
  getDay,
  locales: { es }
})

// Componente personalizado para los eventos en el calendario
const EventoCalendario = ({ event }: any) => (
  <div className="p-1 text-xs overflow-hidden">
    <strong>{event.title}</strong>
    {event.location && <div className="text-xs opacity-75">📍 {event.location}</div>}
  </div>
)

export default function CalendarioPage() {
  const { user } = useAuth()
  const { contratoActivo } = useContrato()
  const [vista, setVista] = useState<'calendario' | 'tabla'>('calendario')
  const [eventos, setEventos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [eventoSeleccionado, setEventoSeleccionado] = useState<any>(null)
  const [fechaActual, setFechaActual] = useState(new Date())

  const cargarEventos = useCallback(async (inicio?: Date, fin?: Date) => {
    if (!user?.id) return

    try {
      setLoading(true)
      
      // Determinar el rango de fechas
      const timeMin = inicio || startOfMonth(fechaActual)
      const timeMax = fin || endOfMonth(fechaActual)
      
      const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/auth/google/events`)
      url.searchParams.append('usuarioId', user.id)
      url.searchParams.append('timeMin', timeMin.toISOString())
      url.searchParams.append('timeMax', timeMax.toISOString())
      
      console.log('📅 Cargando eventos desde:', timeMin.toISOString(), 'hasta:', timeMax.toISOString())
      
      const res = await fetch(url.toString())
      
      if (res.status === 401) {
        const data = await res.json()
        if (data.needsAuth) {
          toast.error("Conecta tu calendario en configuración")
        }
        return
      }
      
      const data = await res.json()
      
      // Transformar eventos al formato de react-big-calendar
      const eventosFormateados = data.eventos.map((evento: any) => ({
        id: evento.id,
        title: evento.summary,
        summary: evento.summary,
        description: evento.description,
        start: new Date(evento.start),
        end: new Date(evento.end),
        location: evento.location,
        attendees: evento.attendees,
        hangoutLink: evento.hangoutLink
      }))
      
      console.log(`✅ ${eventosFormateados.length} eventos cargados`)
      setEventos(eventosFormateados)
      
    } catch (error) {
      console.error("Error cargando eventos:", error)
      toast.error("Error al cargar eventos")
    } finally {
      setLoading(false)
    }
  }, [user?.id, fechaActual])

  useEffect(() => {
    cargarEventos()
  }, [cargarEventos, fechaActual])

  const handleNavigate = (nuevaFecha: Date) => {
    setFechaActual(nuevaFecha)
    // No necesitamos llamar a cargarEventos aquí porque el useEffect lo hará automáticamente
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
  
      console.log('📝 Datos del formulario:', eventoData)
  
      const eventoToSave = {
        summary: eventoData.summary,
        description: eventoData.description,
        start: eventoData.start.toISOString(),
        end: eventoData.end.toISOString(),
        location: eventoData.location || "",
        attendees: eventoData.attendees || [],
        hangoutLink: eventoData.hangoutLink || ""
      }
  
      console.log('📦 Enviando al backend:', JSON.stringify(eventoToSave, null, 2))
  
      const url = eventoSeleccionado?.id 
        ? `${process.env.NEXT_PUBLIC_API_URL}/auth/google/events/${eventoSeleccionado.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/auth/google/events`
      
      const method = eventoSeleccionado?.id ? 'PUT' : 'POST'
      
      console.log('📡 URL:', url)
      console.log('📡 Method:', method)
  
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          usuarioId: user.id, 
          evento: eventoToSave 
        })
      })
      
      console.log('📡 Response status:', response.status)
      console.log('📡 Response status text:', response.statusText)
      
      // Leer la respuesta como texto primero
      const responseText = await response.text()
      console.log('📦 Response text:', responseText)
      
      // Intentar parsear como JSON
      let responseData
      try {
        responseData = JSON.parse(responseText)
        console.log('📦 Response parsed:', responseData)
      } catch (e) {
        console.log('📦 No es JSON válido, es texto plano')
      }
      
      if (!response.ok) {
        // Mostrar el error detallado
        const errorMsg = responseData?.error || responseData?.details || responseText || `Error ${response.status}`
        console.error('❌ Error del servidor:', errorMsg)
        throw new Error(errorMsg)
      }
      
      // Si llegamos aquí, todo salió bien
      const nuevoEvento = responseData
      
      if (eventoSeleccionado?.id) {
        setEventos(eventos.map(ev => 
          ev.id === eventoSeleccionado.id 
            ? { ...nuevoEvento, start: new Date(nuevoEvento.start), end: new Date(nuevoEvento.end) }
            : ev
        ))
        toast.success("Evento actualizado")
      } else {
        setEventos([...eventos, {
          ...nuevoEvento,
          start: new Date(nuevoEvento.start),
          end: new Date(nuevoEvento.end)
        }])
        toast.success("Evento creado")
      }
      
      setShowForm(false)
      setEventoSeleccionado(null)
      
    } catch (error: any) {
      console.error("❌ Error completo:", error)
      toast.error(error.message || "Error al guardar evento")
    }
  }
  
  const handleDeleteEvento = async (id: string) => {
    if (!user?.id) return
    
    if (confirm("¿Estás seguro de eliminar este evento?")) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google/events/${id}?usuarioId=${user.id}`, {
          method: 'DELETE'
        })
        
        if (!response.ok) throw new Error('Error al eliminar evento')
        
        setEventos(eventos.filter(ev => ev.id !== id))
        setShowForm(false)
        setEventoSeleccionado(null)
        toast.success("Evento eliminado")
        
      } catch (error) {
        console.error("Error eliminando evento:", error)
        toast.error("Error al eliminar evento")
      }
    }
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

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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