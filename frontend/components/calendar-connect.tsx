"use client"

import { useState, useEffect, useRef } from "react"
import { Calendar, CalendarX, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

interface CalendarConnectProps {
  onConnected?: () => void
}

export function CalendarConnect({ onConnected }: CalendarConnectProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState(false)
  
  // Usar un ref para controlar que solo se muestre una vez
  const notificado = useRef(false)

  useEffect(() => {
    // Evitar múltiples ejecuciones
    if (notificado.current) return
    
    const params = new URLSearchParams(window.location.search)
    const calendarStatus = params.get('calendar')
    
    if (calendarStatus === 'connected' && !connected) {
      notificado.current = true
      setConnected(true)
      toast.success("Calendario conectado exitosamente", {
        duration: 3000,
        id: 'calendar-connected' // ID único para evitar duplicados
      })
      if (onConnected) onConnected()
      
      // Limpiar la URL para evitar que persista el parámetro
      const url = new URL(window.location.href)
      url.searchParams.delete('calendar')
      window.history.replaceState({}, '', url.toString())
      
    } else if (calendarStatus === 'error' && !notificado.current) {
      notificado.current = true
      toast.error("Error al conectar calendario", {
        duration: 3000,
        id: 'calendar-error'
      })
      
      // Limpiar la URL
      const url = new URL(window.location.href)
      url.searchParams.delete('calendar')
      window.history.replaceState({}, '', url.toString())
    }
  }, [connected, onConnected]) 

  const handleConnect = async () => {
    setLoading(true)
    try {
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/auth?usuarioId=${user?.id}&redirect=/configuracion-inicial`
    } catch (error) {
      console.error("Error conectando calendario:", error)
      toast.error("Error al conectar calendario")
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/disconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId: user?.id })
      })
      
      if (res.ok) {
        setConnected(false)
        toast.success("Calendario desconectado")
        if (onConnected) onConnected()
      }
    } catch (error) {
      console.error("Error desconectando:", error)
      toast.error("Error al desconectar")
    } finally {
      setLoading(false)
    }
  }

  if (connected) {
    return (
      <button
        onClick={handleDisconnect}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 border border-destructive/30 text-destructive rounded-lg hover:bg-destructive/10 transition-colors disabled:opacity-50"
      >
        <CalendarX className="h-4 w-4" />
        {loading ? "Desconectando..." : "Desconectar Calendario"}
      </button>
    )
  }

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Calendar className="h-4 w-4" />
      )}
      {loading ? "Conectando..." : "Conectar Calendario"}
    </button>
  )
}