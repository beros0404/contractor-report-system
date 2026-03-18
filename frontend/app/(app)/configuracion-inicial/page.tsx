"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useContrato } from "@/contexts/contrato-context"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import { Plus, Trash2, Save, HelpCircle, Calendar, CheckCircle, X, Loader2 } from "lucide-react"

export default function ConfiguracionInicialPage() {
  const { user } = useAuth()
  const { refreshContratos } = useContrato()
  const router = useRouter()
  
  // Estados para contratos
  const [contratos, setContratos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [cargandoContratos, setCargandoContratos] = useState(true)
  const [pasoActual, setPasoActual] = useState(0)
  
  // Estados para calendario
  const [calendarioConectado, setCalendarioConectado] = useState(false)
  const [conectandoCalendario, setConectandoCalendario] = useState(false)
  const [mostrarOpcionCalendario, setMostrarOpcionCalendario] = useState(false)

  useEffect(() => {
    verificarContratosExistentes()
    verificarCalendario()
  }, [user])

  const verificarContratosExistentes = async () => {
    if (!user?.id) return

    try {
      const existentes = await apiClient.getContratosPorUsuario(user.id)
      if (existentes.length > 0) {
        // Ya tiene contratos, redirigir al dashboard
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Error verificando contratos:", error)
    } finally {
      setCargandoContratos(false)
    }
  }

  const verificarCalendario = async () => {
    if (!user?.id) return

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/status?usuarioId=${user.id}`)
      const data = await res.json()
      setCalendarioConectado(data.conectado || false)
    } catch (error) {
      console.error("Error verificando calendario:", error)
    }
  }

  const conectarCalendario = () => {
    setConectandoCalendario(true)
    // Redirigir a autenticación de Google
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google/auth?usuarioId=${user?.id}&redirect=/configuracion-inicial`
  }

  const saltarCalendario = () => {
    setMostrarOpcionCalendario(false)
    // Continuar con la creación de contratos
  }

  const agregarContrato = () => {
    setContratos([
      ...contratos,
      {
        id: `temp-${Date.now()}`,
        numero: "",
        entidad: "",
        objeto: "",
        fechaInicio: "",
        fechaFin: "",
        valor: 0,
        contratistaNombre: user?.email?.split("@")[0] || "",
        contratistaCedula: "",
        contratistaProfesion: "",
        supervisorNombre: "",
        supervisorCargo: ""
      }
    ])
    setPasoActual(contratos.length)
  }

  const eliminarContrato = (index: number) => {
    setContratos(contratos.filter((_, i) => i !== index))
    if (pasoActual >= index && pasoActual > 0) {
      setPasoActual(pasoActual - 1)
    }
  }

  const actualizarContrato = (index: number, field: string, value: any) => {
    const nuevos = [...contratos]
    nuevos[index] = { ...nuevos[index], [field]: value }
    setContratos(nuevos)
  }

  const guardarContratos = async () => {
    if (contratos.length === 0) {
      toast.error("Agrega al menos un contrato")
      return
    }

    // Validar campos requeridos
    for (let i = 0; i < contratos.length; i++) {
      const c = contratos[i]
      if (!c.numero || !c.entidad || !c.objeto || !c.fechaInicio || !c.fechaFin || !c.valor) {
        toast.error(`El contrato ${i + 1} tiene campos obligatorios sin completar`)
        setPasoActual(i)
        return
      }
    }

    setLoading(true)
    try {
      // Crear todos los contratos
      for (const contrato of contratos) {
        await apiClient.createContrato({
          ...contrato,
          usuarioId: user?.id,
          estado: "activo"
        })
      }
      
      toast.success("Contratos creados exitosamente")
      
      // Refrescar la lista de contratos en el contexto
      await refreshContratos()
      
      // Redirigir al dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Error guardando contratos:", error)
      toast.error("Error al guardar los contratos")
    } finally {
      setLoading(false)
    }
  }

  // Verificar si venimos de una conexión exitosa de calendario
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('calendar') === 'connected') {
      setCalendarioConectado(true)
      toast.success("Calendario conectado exitosamente")
    } else if (params.get('calendar') === 'error') {
      toast.error("Error al conectar calendario")
    }
  }, [])

  if (cargandoContratos) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-8">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="bg-card rounded-xl border border-border shadow-lg p-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              ¡Bienvenido a ContraSeguimiento!
            </h1>
            <p className="text-muted-foreground">
              Configura tu cuenta para comenzar a usar el sistema
            </p>
          </div>

          {/* Paso 1: Conectar Calendario (opcional) */}
          {!calendarioConectado && (
            <div className="mb-8 p-6 bg-primary/5 rounded-xl border border-primary/20">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-foreground mb-2">
                    Conecta tu Google Calendar (opcional)
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Conectar tu calendario te permitirá ver tus reuniones en el dashboard 
                    y registrar aportes directamente desde cada evento.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={conectarCalendario}
                      disabled={conectandoCalendario}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {conectandoCalendario ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Conectando...
                        </>
                      ) : (
                        <>
                          <Calendar className="h-4 w-4" />
                          Conectar Google Calendar
                        </>
                      )}
                    </button>
                    <button
                      onClick={saltarCalendario}
                      className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
                    >
                      Saltar este paso
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mensaje de calendario conectado */}
          {calendarioConectado && (
            <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="text-sm text-foreground">
                ¡Calendario conectado! Ahora verás tus reuniones en el dashboard.
              </span>
            </div>
          )}

          {/* Paso 2: Crear Contratos */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              {calendarioConectado ? 'Ahora, ' : ''}Configura tus contratos
            </h2>

            {contratos.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-border rounded-xl mb-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No hay contratos configurados
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Para comenzar, necesitas crear al menos un contrato. Puedes crear varios y luego seleccionar el activo desde el menú.
                </p>
                <button
                  onClick={agregarContrato}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-base font-medium"
                >
                  <Plus className="h-5 w-5" />
                  Crear primer contrato
                </button>
              </div>
            ) : (
              <>
                {/* Selector de pasos / contratos */}
                {contratos.length > 1 && (
                  <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                    {contratos.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setPasoActual(index)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                          pasoActual === index
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        Contrato {index + 1}
                      </button>
                    ))}
                    <button
                      onClick={agregarContrato}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-colors whitespace-nowrap flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Nuevo
                    </button>
                  </div>
                )}

                {/* Formulario del contrato actual */}
                <div className="space-y-6 mb-6">
                  {contratos.map((contrato, index) => (
                    <div
                      key={contrato.id}
                      className={`${pasoActual === index ? "block" : "hidden"}`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-foreground">
                          Contrato {index + 1}
                        </h2>
                        {contratos.length > 1 && (
                          <button
                            onClick={() => eliminarContrato(index)}
                            className="text-destructive hover:text-destructive/80 p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                            title="Eliminar contrato"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Campos del formulario (mantener igual que antes) */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-foreground">
                            Número de contrato <span className="text-destructive">*</span>
                          </label>
                          <input
                            placeholder="Ej: PROS-2024-001"
                            value={contrato.numero}
                            onChange={(e) => actualizarContrato(index, "numero", e.target.value)}
                            className="w-full px-4 py-2.5 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-foreground">
                            Entidad contratante <span className="text-destructive">*</span>
                          </label>
                          <input
                            placeholder="Ej: Prosecto S.A. E.S.P."
                            value={contrato.entidad}
                            onChange={(e) => actualizarContrato(index, "entidad", e.target.value)}
                            className="w-full px-4 py-2.5 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <label className="block text-sm font-medium text-foreground">
                            Objeto del contrato <span className="text-destructive">*</span>
                          </label>
                          <textarea
                            placeholder="Describe el propósito y alcance del contrato"
                            value={contrato.objeto}
                            onChange={(e) => actualizarContrato(index, "objeto", e.target.value)}
                            className="w-full px-4 py-2.5 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                            rows={3}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-foreground">
                            Fecha de inicio <span className="text-destructive">*</span>
                          </label>
                          <input
                            type="date"
                            value={contrato.fechaInicio}
                            onChange={(e) => actualizarContrato(index, "fechaInicio", e.target.value)}
                            className="w-full px-4 py-2.5 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-foreground">
                            Fecha de fin <span className="text-destructive">*</span>
                          </label>
                          <input
                            type="date"
                            value={contrato.fechaFin}
                            onChange={(e) => actualizarContrato(index, "fechaFin", e.target.value)}
                            className="w-full px-4 py-2.5 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-foreground">
                            Valor del contrato <span className="text-destructive">*</span>
                          </label>
                          <input
                            type="number"
                            placeholder="0"
                            value={contrato.valor || ""}
                            onChange={(e) => actualizarContrato(index, "valor", Number(e.target.value))}
                            className="w-full px-4 py-2.5 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>

                        {/* Sección: Datos del contratista */}
                        <div className="md:col-span-2 mt-4 pt-4 border-t border-border">
                          <h3 className="text-lg font-semibold text-foreground mb-4">
                            Datos del Contratista
                          </h3>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-foreground">
                            Nombre completo <span className="text-destructive">*</span>
                          </label>
                          <input
                            placeholder="Ej: Juan Pérez"
                            value={contrato.contratistaNombre}
                            onChange={(e) => actualizarContrato(index, "contratistaNombre", e.target.value)}
                            className="w-full px-4 py-2.5 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-foreground">
                            Cédula <span className="text-destructive">*</span>
                          </label>
                          <input
                            placeholder="Ej: 123456789"
                            value={contrato.contratistaCedula}
                            onChange={(e) => actualizarContrato(index, "contratistaCedula", e.target.value)}
                            className="w-full px-4 py-2.5 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-foreground">
                            Profesión
                          </label>
                          <input
                            placeholder="Ej: Ingeniero de Sistemas"
                            value={contrato.contratistaProfesion}
                            onChange={(e) => actualizarContrato(index, "contratistaProfesion", e.target.value)}
                            className="w-full px-4 py-2.5 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>

                        {/* Sección: Datos del supervisor */}
                        <div className="md:col-span-2 mt-4 pt-4 border-t border-border">
                          <h3 className="text-lg font-semibold text-foreground mb-4">
                            Datos del Supervisor
                          </h3>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-foreground">
                            Nombre del supervisor <span className="text-destructive">*</span>
                          </label>
                          <input
                            placeholder="Ej: Carlos Rodríguez"
                            value={contrato.supervisorNombre}
                            onChange={(e) => actualizarContrato(index, "supervisorNombre", e.target.value)}
                            className="w-full px-4 py-2.5 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-foreground">
                            Cargo del supervisor
                          </label>
                          <input
                            placeholder="Ej: Supervisor de Contratos"
                            value={contrato.supervisorCargo}
                            onChange={(e) => actualizarContrato(index, "supervisorCargo", e.target.value)}
                            className="w-full px-4 py-2.5 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border">
                  {contratos.length > 1 && pasoActual < contratos.length - 1 && (
                    <button
                      onClick={() => setPasoActual(pasoActual + 1)}
                      className="px-6 py-3 border border-border bg-background rounded-lg hover:bg-accent transition-colors text-foreground font-medium"
                    >
                      Siguiente contrato
                    </button>
                  )}
                  
                  {pasoActual === contratos.length - 1 && (
                    <button
                      onClick={agregarContrato}
                      className="flex items-center justify-center gap-2 px-6 py-3 border border-border bg-background rounded-lg hover:bg-accent transition-colors text-foreground font-medium"
                    >
                      <Plus className="h-5 w-5" />
                      Agregar otro contrato
                    </button>
                  )}

                  <button
                    onClick={guardarContratos}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 font-medium text-base"
                  >
                    <Save className="h-5 w-5" />
                    {loading ? "Guardando..." : "Guardar y continuar"}
                  </button>
                </div>

                <div className="mt-6 text-center text-sm text-muted-foreground">
                  Contrato {pasoActual + 1} de {contratos.length}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}