"use client"

import { useState, useRef, useCallback, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Calendar,
  Upload,
  X,
  ImageIcon,
  FileText,
  File,
  Save,
  Send,
  Sparkles,
  Camera,
  Mic,
  Square,
  Loader2,
  Link2,
  FolderOpen,
  Check,
  AlertCircle
} from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useContrato } from "@/contexts/contrato-context"
import { EvidenciaUpload } from "@/components/evidence-upload"
import { getCurrentColombiaDate, toColombiaDate } from "@/lib/utils"
import type { TipoEvidencia } from "@/lib/types"
import { toast } from "sonner"

// Declarar tipos para la API de reconocimiento de voz
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const MAX_DESC = 500

export default function NuevoAportePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-16 text-sm text-muted-foreground">Cargando...</div>}>
      <NuevoAporteContent />
    </Suspense>
  )
}

function NuevoAporteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { contratoActivo, usuarioId } = useContrato()
  const preselectedId = searchParams.get("actividad") ?? ""
  const descripcionPrefill = searchParams.get("descripcion") ?? ""

  const [actividades, setActividades] = useState<any[]>([])
  const [contrato, setContrato] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [evidenciasGuardadas, setEvidenciasGuardadas] = useState<any[]>([])
  
  // Cambiar de actividadId única a actividadesSeleccionadas (array)
  const [actividadesSeleccionadas, setActividadesSeleccionadas] = useState<string[]>([])
  const [fecha, setFecha] = useState(getCurrentColombiaDate())
  const [descripcion, setDescripcion] = useState(descripcionPrefill)
  const [errorFecha, setErrorFecha] = useState<string | null>(null)

  // Estados para audio
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)
  const [tiempoRestante, setTiempoRestante] = useState<number>(60)

  const recognitionRef = useRef<any>(null)
  const timeoutRef = useRef<any>(null)
  const timerRef = useRef<any>(null)
  const finalTranscriptRef = useRef<string>("")

  // Función para validar fecha contra la fecha de fin del contrato
  const validarFechaContrato = (fechaSeleccionada: string, fechaFinContrato: string) => {
    if (!fechaFinContrato) return true
    
    const fecha = new Date(fechaSeleccionada)
    const fechaFin = new Date(fechaFinContrato)
    
    // Comparar solo fechas, sin horas
    fecha.setHours(0, 0, 0, 0)
    fechaFin.setHours(0, 0, 0, 0)
    
    return fecha <= fechaFin
  }

  // Actualizar descripción cuando cambia el prefilled
  useEffect(() => {
    if (descripcionPrefill) {
      setDescripcion(descripcionPrefill)
    }
  }, [descripcionPrefill])

  // Verificar que hay contrato activo
  useEffect(() => {
    if (!contratoActivo || !usuarioId) {
      toast.error("No hay un contrato seleccionado")
      router.push("/configuracion-inicial")
    }
  }, [contratoActivo, usuarioId, router])

  // Cargar datos del backend al montar el componente
  useEffect(() => {
    const cargarDatos = async () => {
      if (!contratoActivo || !usuarioId) return

      try {
        setLoading(true)
        
        // Cargar el contrato completo para obtener fechaFin y número
        const contratoCompleto = await apiClient.getContrato(contratoActivo)
        const acts = await apiClient.getActividades(contratoActivo, usuarioId)

        setActividades(Array.isArray(acts) ? acts : [])
        setContrato(contratoCompleto || { numeroContrato: contratoActivo })
        
        // Si hay una actividad preseleccionada y existe en la lista
        if (preselectedId && acts.some((a: any) => a.id === preselectedId)) {
          setActividadesSeleccionadas([preselectedId])
        }
      } catch (error) {
        console.error("Error cargando datos:", error)
        toast.error("Error al cargar los datos")
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [contratoActivo, usuarioId, preselectedId])

  // Validar fecha cuando cambia
  useEffect(() => {
    if (contrato?.fechaFin && fecha) {
      const esValida = validarFechaContrato(fecha, contrato.fechaFin)
      if (!esValida) {
        const mensaje = `La fecha no puede ser posterior a la finalización del contrato (${new Date(contrato.fechaFin).toLocaleDateString('es-CO')})`
        setErrorFecha(mensaje)
        toast.error(mensaje)
      } else {
        setErrorFecha(null)
      }
    }
  }, [fecha, contrato?.fechaFin])

  // Función para manejar selección/deselección de actividades
  const toggleActividad = (actividadId: string) => {
    setActividadesSeleccionadas(prev => {
      if (prev.includes(actividadId)) {
        return prev.filter(id => id !== actividadId)
      } else {
        return [...prev, actividadId]
      }
    })
  }

  // Función para seleccionar/deseleccionar todas
  const toggleTodas = () => {
    if (actividadesSeleccionadas.length === actividades.length) {
      setActividadesSeleccionadas([])
    } else {
      setActividadesSeleccionadas(actividades.map(a => a.id))
    }
  }

  // Función para iniciar grabación de audio
  const startRecording = () => {
    try {
      setAudioError(null)
      finalTranscriptRef.current = ""
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      
      if (!SpeechRecognition) {
        setAudioError("Tu navegador no soporta reconocimiento de voz")
        toast.error("Tu navegador no soporta reconocimiento de voz")
        return
      }

      if (!navigator.onLine) {
        setAudioError("Se necesita internet para la transcripción")
        toast.error("Conéctate a internet para usar el reconocimiento de voz")
        return
      }

      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          stream.getTracks().forEach(track => track.stop())
          
          const recognition = new SpeechRecognition()
          
          recognition.lang = 'es-ES'
          recognition.continuous = true
          recognition.interimResults = true
          recognition.maxAlternatives = 1

          setTiempoRestante(60)
          timerRef.current = setInterval(() => {
            setTiempoRestante((prev) => {
              if (prev <= 1) {
                stopRecording()
                return 0
              }
              return prev - 1
            })
          }, 1000)

          recognition.onresult = (event: any) => {
            let interimTranscript = ''
            let finalTranscript = ''

            for (let i = event.resultIndex; i < event.results.length; i++) {
              const transcript = event.results[i][0].transcript
              if (event.results[i].isFinal) {
                finalTranscript += transcript + ' '
              } else {
                interimTranscript += transcript
              }
            }

            if (finalTranscript) {
              finalTranscriptRef.current += finalTranscript
            }
          }

          recognition.onerror = (event: any) => {
            if (timerRef.current) clearInterval(timerRef.current)
            console.error('❌ Error de reconocimiento:', event.error)
            
            let mensajeError = "Error al grabar audio"
            if (event.error === 'not-allowed') mensajeError = "Permiso de micrófono denegado"
            else if (event.error === 'no-speech') mensajeError = "No se detectó voz"
            else if (event.error === 'network') mensajeError = "Error de conexión"
            
            setAudioError(mensajeError)
            toast.error(mensajeError)
            setIsRecording(false)
            setIsProcessing(false)
          }

          recognition.onend = () => {
            if (timerRef.current) clearInterval(timerRef.current)
            console.log("⏹️ Grabación finalizada")
            
            if (finalTranscriptRef.current.trim()) {
              setIsProcessing(true)
              setTimeout(() => {
                setDescripcion(prev => prev ? `${prev} ${finalTranscriptRef.current.trim()}` : finalTranscriptRef.current.trim())
                setIsProcessing(false)
                toast.success("Audio transcrito correctamente")
              }, 500)
            }

            setIsRecording(false)
          }

          recognition.start()
          recognitionRef.current = recognition
          setIsRecording(true)
          toast.info("Grabando... máximo 60 segundos", { duration: 2000 })
        })
        .catch((err) => {
          console.error('❌ Error de permisos:', err)
          setAudioError("No se pudo acceder al micrófono")
          toast.error("Permiso de micrófono requerido")
        })

    } catch (error) {
      console.error('❌ Error iniciando reconocimiento:', error)
      setAudioError("Error al iniciar grabación")
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      if (timerRef.current) clearInterval(timerRef.current)
      recognitionRef.current.stop()
      setIsRecording(false)
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleEvidenciaGuardada = (evidencia: any) => {
    setEvidenciasGuardadas(prev => [...prev, evidencia])
    toast.success("Evidencia guardada")
  }

  async function handleSubmit(asBorrador: boolean) {
    if (!contratoActivo || !usuarioId) {
      toast.error("No hay un contrato seleccionado")
      return
    }

    // Validar selección de actividades
    if (actividadesSeleccionadas.length === 0) {
      toast.error("Selecciona al menos una actividad contractual")
      return
    }
    
    if (!descripcion.trim() && !asBorrador) {
      toast.error("La descripción es requerida")
      return
    }

    // Validar fecha contra el contrato
    if (contrato?.fechaFin && !validarFechaContrato(fecha, contrato.fechaFin)) {
      toast.error(`No se puede registrar el aporte. La fecha ${new Date(fecha).toLocaleDateString('es-CO')} es posterior a la finalización del contrato (${new Date(contrato.fechaFin).toLocaleDateString('es-CO')})`)
      return
    }

    setSubmitting(true)

    try {
      const evidenciaIds = evidenciasGuardadas.map(ev => ev.id || ev._id)
      
      // Convertir fecha a zona horaria de Colombia (UTC-5)
      const fechaColombia = toColombiaDate(fecha)
      
      console.log("📝 Fecha original:", fecha)
      console.log("📝 Fecha para guardar:", fechaColombia)
      
      // Crear el aporte para cada actividad seleccionada
      const aportesPromises = actividadesSeleccionadas.map(actividadId => {
        const nuevoAporte = {
          actividadId,
          fecha: fechaColombia,
          descripcion: descripcion.trim() || "(Borrador sin descripción)",
          evidenciaIds,
          estado: asBorrador ? "borrador" : "completado",
          monto: 1
        }
        
        return apiClient.createAporte(nuevoAporte, usuarioId, contratoActivo)
      })
      
      await Promise.all(aportesPromises)

      const mensajeActividades = actividadesSeleccionadas.length === 1 
        ? "la actividad seleccionada" 
        : `las ${actividadesSeleccionadas.length} actividades seleccionadas`

      if (asBorrador) {
        toast.success(`Borrador guardado exitosamente para ${mensajeActividades}`)
      } else {
        toast.success(`Aporte enviado exitosamente para ${mensajeActividades}`)
      }
      
      router.push("/actividades")
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al registrar el aporte")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!contratoActivo || !usuarioId) {
    return null
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/actividades"
        className="hidden items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground md:flex"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a actividades
      </Link>

      <div className="flex items-center gap-3 md:hidden">
        <Link
          href="/actividades"
          className="flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-accent"
          aria-label="Volver"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-bold text-foreground">Nuevo Aporte</h1>
      </div>

      <div className="hidden flex-col gap-1 md:flex">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Registrar Aporte
        </h1>
        <p className="text-sm text-muted-foreground">
          Documenta la acción concreta realizada hoy
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-6 p-5 md:p-8">
          <div className="hidden gap-6 md:grid md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Fecha de Reporte
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  max={contrato?.fechaFin ? new Date(contrato.fechaFin).toISOString().split('T')[0] : undefined}
                  className={`h-11 w-full rounded-lg border ${errorFecha ? 'border-destructive' : 'border-input'} bg-background pl-10 pr-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring`}
                />
              </div>
              {errorFecha && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errorFecha}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Número de Contrato
              </label>
              <input
                type="text"
                value={contrato?.numero || contrato?.numeroContrato || contratoActivo}
                readOnly
                className="h-11 w-full rounded-lg border border-input bg-muted px-3 text-sm text-foreground"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 md:hidden">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                Fecha
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  max={contrato?.fechaFin ? new Date(contrato.fechaFin).toISOString().split('T')[0] : undefined}
                  className={`h-11 w-full rounded-lg border ${errorFecha ? 'border-destructive' : 'border-input'} bg-background pl-10 pr-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring`}
                />
              </div>
              {errorFecha && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errorFecha}
                </p>
              )}
            </div>
          </div>

          {/* Sección de selección múltiple de actividades */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Actividades Contractuales{" "}
                <span className="text-destructive">*</span>
              </label>
              {actividades.length > 1 && (
                <button
                  type="button"
                  onClick={toggleTodas}
                  className="text-xs text-primary hover:underline"
                >
                  {actividadesSeleccionadas.length === actividades.length ? "Deseleccionar todas" : "Seleccionar todas"}
                </button>
              )}
            </div>
            
            <div className="mt-2 space-y-2 max-h-80 overflow-y-auto border border-border rounded-lg p-3">
              {actividades.map((actividad) => (
                <label
                  key={actividad.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={actividadesSeleccionadas.includes(actividad.id)}
                    onChange={() => toggleActividad(actividad.id)}
                    className="mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-primary"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {actividad.numero}. {actividad.titulo}
                    </p>
                    {actividad.descripcion && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {actividad.descripcion}
                      </p>
                    )}
                  </div>
                  {actividadesSeleccionadas.includes(actividad.id) && (
                    <Check className="h-4 w-4 text-primary shrink-0" />
                  )}
                </label>
              ))}
              {actividades.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay actividades registradas para este contrato
                </p>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground">
              {actividadesSeleccionadas.length} actividad(es) seleccionada(s)
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground md:block hidden">
              Descripción del Aporte{" "}
              <span className="text-destructive">*</span>
            </label>
            <label className="text-sm font-medium text-foreground md:hidden">
              Descripción
            </label>
            <div className="relative">
              <textarea
                rows={5}
                maxLength={MAX_DESC}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe brevemente la acción..."
                className="w-full resize-none rounded-lg border border-input bg-background px-4 py-3 pr-12 text-sm text-foreground leading-relaxed placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="hidden text-xs text-muted-foreground md:block">
                Puedes digitar texto o usar el micrófono para grabar audio
              </p>
              <span className="text-xs text-muted-foreground">
                {descripcion.length} / {MAX_DESC}
              </span>
            </div>
          </div>

          {/* Sección de grabación de audio */}
          <div className="flex flex-col gap-3 rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 p-6">
            <h3 className="text-sm font-medium text-foreground">Grabar audio</h3>
            
            <div className="flex items-center gap-2">
              {!isRecording && !isProcessing && (
                <button
                  type="button"
                  onClick={startRecording}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Mic className="h-4 w-4" />
                  Grabar audio (60s)
                </button>
              )}

              {isRecording && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
                  >
                    <Square className="h-4 w-4" />
                    Detener
                  </button>
                  <div className="flex items-center gap-1 px-3 py-2 bg-muted text-muted-foreground rounded-lg">
                    <span className="text-sm font-medium">{tiempoRestante}s</span>
                    <Loader2 className="h-3 w-3 animate-spin" />
                  </div>
                </div>
              )}

              {isProcessing && !isRecording && (
                <div className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Transcribiendo...
                </div>
              )}
            </div>

            {audioError && (
              <p className="text-xs text-destructive">{audioError}</p>
            )}
            
            <p className="text-xs text-muted-foreground">
              Habla claramente. La transcripción se agregará al campo de descripción
            </p>
          </div>

          {/* Sección de evidencias */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Evidencias
            </label>
            
            <EvidenciaUpload 
              actividadId={actividadesSeleccionadas[0] || ""}
              onSuccess={handleEvidenciaGuardada}
            />

            {/* Lista de evidencias guardadas */}
            {evidenciasGuardadas.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Evidencias guardadas:</p>
                {evidenciasGuardadas.map((ev, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    {ev.tipo === 'archivo' && <Upload className="h-4 w-4 text-primary" />}
                    {ev.tipo === 'enlace' && <Link2 className="h-4 w-4 text-primary" />}
                    {ev.tipo === 'nota' && <FileText className="h-4 w-4 text-primary" />}
                    <span className="flex-1 truncate">{ev.nombre || ev.archivo?.nombre}</span>
                    {ev.ubicacionDrive?.url && (
                      <a
                        href={ev.ubicacionDrive.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        <FolderOpen className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="hidden items-center justify-between border-t border-border px-8 py-5 md:flex">
          <Link
            href="/actividades"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Cancelar
          </Link>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={submitting || actividadesSeleccionadas.length === 0}
              className="flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              Guardar borrador
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={submitting || actividadesSeleccionadas.length === 0 || !!errorFecha}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Enviar Aporte
                </>
              )}
            </button>
          </div>
        </div>

        <div className="border-t border-border p-5 md:hidden">
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={submitting || actividadesSeleccionadas.length === 0 || !!errorFecha}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Enviando...
              </>
            ) : (
              <>
                Enviar Aporte
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </>
            )}
          </button>
        </div>
      </div>

      <div className="hidden items-start gap-3 rounded-xl bg-sidebar px-6 py-4 text-sidebar-foreground md:flex">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary/20">
          <Sparkles className="h-4 w-4 text-sidebar-primary" />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold">Procesamiento IA</span>
          <span className="text-xs text-sidebar-foreground/70 leading-relaxed">
            Al enviar, la IA consolidará este aporte con los anteriores de la
            misma actividad para generar un resumen ejecutivo automático al final
            del período.
          </span>
        </div>
      </div>
    </div>
  )
}