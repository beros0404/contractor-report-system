"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import { RotateCcw, Calendar, HardDrive, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useContrato } from "@/contexts/contrato-context"
import { useAuth } from "@/contexts/auth-context"

interface GeneralTabProps {
  onSave: () => void
}

interface UsuarioConfig {
  nombre: string
  email: string
  notificaciones: boolean
}

export function GeneralTab({ onSave }: GeneralTabProps) {
  const { contratoActivo, usuarioId } = useContrato()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [showReset, setShowReset] = useState(false)
  
  // Estados para conexiones
  const [calendarStatus, setCalendarStatus] = useState<{
    conectado: boolean;
    loading: boolean;
    email?: string;
    error?: string;
  }>({ conectado: false, loading: true })
  
  const [driveStatus, setDriveStatus] = useState<{
    conectado: boolean;
    loading: boolean;
    email?: string;
    error?: string;
  }>({ conectado: false, loading: true })

  const [form, setForm] = useState<UsuarioConfig>({
    nombre: "",
    email: "",
    notificaciones: true,
  })

  console.log('🔍 GeneralTab - usuarioId:', usuarioId)
  console.log('🔍 GeneralTab - user:', user)

  useEffect(() => {
    if (user) {
      console.log('✅ Usuario cargado:', user)
      setForm({
        nombre: user.user_metadata?.full_name || user.email?.split('@')[0] || "",
        email: user.email || "",
        notificaciones: true,
      })
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (usuarioId) {
      console.log('📡 Verificando conexiones para usuario:', usuarioId)
      verificarConexiones()
    }
  }, [usuarioId])

  const verificarConexiones = async () => {
    try {
      // Verificar Calendar
      try {
        console.log('📡 Verificando Calendar...')
        const calendarRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google/status?usuarioId=${usuarioId}`)
        console.log('📡 Calendar response status:', calendarRes.status)
        
        if (calendarRes.ok) {
          const calendarData = await calendarRes.json()
          console.log('✅ Calendar data:', calendarData)
          setCalendarStatus({
            conectado: calendarData.conectado,
            loading: false,
            email: calendarData.email
          })
        } else {
          const errorText = await calendarRes.text()
          console.error('❌ Calendar error:', errorText)
          setCalendarStatus({ 
            conectado: false, 
            loading: false,
            error: `Error ${calendarRes.status}` 
          })
        }
      } catch (error) {
        console.error("❌ Error verificando calendar:", error)
        setCalendarStatus({ 
          conectado: false, 
          loading: false,
          error: error instanceof Error ? error.message : 'Error desconocido'
        })
      }

      // Verificar Drive
      try {
        console.log('📡 Verificando Drive...')
        const driveRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google/drive/status?usuarioId=${usuarioId}`)
        console.log('📡 Drive response status:', driveRes.status)
        
        if (driveRes.ok) {
          const driveData = await driveRes.json()
          console.log('✅ Drive data:', driveData)
          setDriveStatus({
            conectado: driveData.conectado,
            loading: false,
            email: driveData.email
          })
        } else {
          const errorText = await driveRes.text()
          console.error('❌ Drive error:', errorText)
          setDriveStatus({ 
            conectado: false, 
            loading: false,
            error: `Error ${driveRes.status}` 
          })
        }
      } catch (error) {
        console.error("❌ Error verificando drive:", error)
        setDriveStatus({ 
          conectado: false, 
          loading: false,
          error: error instanceof Error ? error.message : 'Error desconocido'
        })
      }

    } catch (error) {
      console.error("❌ Error general verificando conexiones:", error)
    }
  }

  const conectarCalendar = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google/auth?usuarioId=${usuarioId}&redirect=/configuracion`
  }

  const conectarDrive = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google/drive/auth?usuarioId=${usuarioId}&redirect=/configuracion`
  }

  const desconectarCalendar = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google/disconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId })
      })
      if (res.ok) {
        setCalendarStatus({ conectado: false, loading: false })
        toast.success("Calendario desconectado")
      } else {
        toast.error("Error al desconectar calendario")
      }
    } catch (error) {
      console.error("Error desconectando calendar:", error)
      toast.error("Error al desconectar calendario")
    }
  }

  const desconectarDrive = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google/drive/disconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId })
      })
      if (res.ok) {
        setDriveStatus({ conectado: false, loading: false })
        toast.success("Google Drive desconectado")
      } else {
        toast.error("Error al desconectar Google Drive")
      }
    } catch (error) {
      console.error("Error desconectando drive:", error)
      toast.error("Error al desconectar Google Drive")
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!contratoActivo || !usuarioId) {
      toast.error("No hay un contrato seleccionado")
      return
    }

    try {
      setSaving(true)
      await apiClient.updateConfiguracion(contratoActivo, usuarioId, { usuario: form })
      toast.success("Preferencias de usuario actualizadas")
      onSave()
    } catch (error) {
      console.error("Error actualizando configuración:", error)
      toast.error("Error al actualizar las preferencias")
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    if (!contratoActivo || !usuarioId) {
      toast.error("No hay un contrato seleccionado")
      return
    }

    try {
      setResetting(true)
      await apiClient.resetConfiguracion(contratoActivo, usuarioId)
      toast.success("Sistema reiniciado con valores por defecto")
      setShowReset(false)
      onSave()
    } catch (error) {
      console.error("Error reseteando configuración:", error)
      toast.error("Error al reiniciar el sistema")
    } finally {
      setResetting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6">
      {/* Información del Usuario */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold text-card-foreground">
          Información del Usuario
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Nombre completo
            </label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, nombre: e.target.value }))
              }
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Correo electrónico
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, email: e.target.value }))
              }
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      {/* Conexiones con Google */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold text-card-foreground">
          Conexiones con Google
        </h3>
        
        <div className="space-y-4">
          {/* Google Calendar */}
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Google Calendar</p>
                <p className="text-xs text-muted-foreground">
                  {calendarStatus.loading 
                    ? "Verificando conexión..." 
                    : calendarStatus.conectado 
                      ? `Conectado como ${calendarStatus.email || 'usuario'}` 
                      : "No conectado"}
                </p>
                {calendarStatus.error && (
                  <p className="text-xs text-destructive mt-1">{calendarStatus.error}</p>
                )}
              </div>
            </div>
            
            {calendarStatus.loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : calendarStatus.conectado ? (
              <button
                type="button"
                onClick={desconectarCalendar}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-destructive border border-destructive/30 rounded-lg hover:bg-destructive/10 transition-colors"
              >
                <XCircle className="h-3 w-3" />
                Desconectar
              </button>
            ) : (
              <button
                type="button"
                onClick={conectarCalendar}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
              >
                <CheckCircle className="h-3 w-3" />
                Conectar
              </button>
            )}
          </div>

          {/* Google Drive */}
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <HardDrive className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Google Drive</p>
                <p className="text-xs text-muted-foreground">
                  {driveStatus.loading 
                    ? "Verificando conexión..." 
                    : driveStatus.conectado 
                      ? `Conectado como ${driveStatus.email || 'usuario'}` 
                      : "No conectado"}
                </p>
                {driveStatus.error && (
                  <p className="text-xs text-destructive mt-1">{driveStatus.error}</p>
                )}
              </div>
            </div>
            
            {driveStatus.loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : driveStatus.conectado ? (
              <button
                type="button"
                onClick={desconectarDrive}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-destructive border border-destructive/30 rounded-lg hover:bg-destructive/10 transition-colors"
              >
                <XCircle className="h-3 w-3" />
                Desconectar
              </button>
            ) : (
              <button
                type="button"
                onClick={conectarDrive}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
              >
                <CheckCircle className="h-3 w-3" />
                Conectar
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-3">
          Conecta tu Google Calendar para ver reuniones en el dashboard y Google Drive para guardar evidencias automáticamente.
        </p>
      </div>

      {/* Notificaciones */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold text-card-foreground">
          Notificaciones
        </h3>
        <label className="flex cursor-pointer items-center gap-3">
          <div className="relative">
            <input
              type="checkbox"
              checked={form.notificaciones}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  notificaciones: e.target.checked,
                }))
              }
              className="sr-only"
            />
            <div
              className={`h-5 w-9 rounded-full transition-colors ${
                form.notificaciones ? "bg-primary" : "bg-muted"
              }`}
            >
              <div
                className={`h-4 w-4 rounded-full bg-card shadow transition-transform ${
                  form.notificaciones
                    ? "translate-x-4.5 mt-0.5"
                    : "translate-x-0.5 mt-0.5"
                }`}
              />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-card-foreground">
              Recordatorios de informe
            </p>
            <p className="text-xs text-muted-foreground">
              Recibir notificaciones cuando se acerque la fecha de generación del informe
            </p>
          </div>
        </label>
      </div>

      {/* Botones de acción */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowReset(true)}
          disabled={resetting}
          className="flex items-center gap-2 rounded-md border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
        >
          <RotateCcw className="h-4 w-4" />
          {resetting ? "Reiniciando..." : "Reiniciar Sistema"}
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>

      {/* Modal de confirmación para reset */}
      {showReset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              ¿Reiniciar sistema?
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Esto eliminará todos los datos y restaurará los valores por defecto.
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowReset(false)}
                className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleReset}
                disabled={resetting}
                className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors disabled:opacity-50"
              >
                {resetting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Reiniciando...
                  </>
                ) : (
                  "Confirmar Reinicio"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}