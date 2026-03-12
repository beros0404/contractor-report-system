"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, Square, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface AudioRecorderProps {
  onTranscriptionComplete: (text: string) => void
}

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

export function AudioRecorder({ onTranscriptionComplete }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tiempoRestante, setTiempoRestante] = useState<number>(60)
  const [isSupported, setIsSupported] = useState(true)

  const recognitionRef = useRef<any>(null)
  const timeoutRef = useRef<any>(null)
  const timerRef = useRef<any>(null)
  const finalTranscriptRef = useRef<string>("")

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    setIsSupported(!!SpeechRecognition)
    
    if (!navigator.onLine) {
      setError("Sin conexión a internet")
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const startRecording = () => {
    try {
      setError(null)
      finalTranscriptRef.current = ""
      
      if (!navigator.onLine) {
        setError("Se necesita internet para la transcripción")
        toast.error("Conéctate a internet para usar el reconocimiento de voz")
        return
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      
      if (!SpeechRecognition) {
        setError("Tu navegador no soporta reconocimiento de voz")
        return
      }

      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          stream.getTracks().forEach(track => track.stop())
          
          const recognition = new SpeechRecognition()
          
          // Configuración para grabación continua
          recognition.lang = 'es-ES'
          recognition.continuous = true // Grabar continuamente
          recognition.interimResults = true // Mostrar resultados parciales
          recognition.maxAlternatives = 1

          // Temporizador de 60 segundos
          setTiempoRestante(60)
          timerRef.current = setInterval(() => {
            setTiempoRestante((prev) => {
              if (prev <= 1) {
                // Tiempo terminado, detener grabación
                stopRecording()
                return 0
              }
              return prev - 1
            })
          }, 1000)

          recognition.onstart = () => {
            console.log('🎤 Grabación iniciada')
            setIsRecording(true)
            toast.info("Grabando... máximo 60 segundos", { duration: 2000 })
          }

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

            // Acumular transcripciones finales
            if (finalTranscript) {
              finalTranscriptRef.current += finalTranscript
            }

            // Mostrar progreso (opcional)
            if (interimTranscript) {
              console.log('🎤 Escuchando:', interimTranscript)
            }
          }

          recognition.onerror = (event: any) => {
            console.error('❌ Error:', event.error)
            
            let mensajeError = "Error al grabar audio"
            if (event.error === 'not-allowed') mensajeError = "Permiso de micrófono denegado"
            else if (event.error === 'no-speech') mensajeError = "No se detectó voz"
            else if (event.error === 'network') mensajeError = "Error de conexión"
            
            setError(mensajeError)
            toast.error(mensajeError)
            stopRecording()
          }

          recognition.onend = () => {
            console.log('⏹️ Grabación finalizada')
            
            // Limpiar temporizador
            if (timerRef.current) {
              clearInterval(timerRef.current)
              timerRef.current = null
            }

            // Si hay transcripción acumulada, enviarla
            if (finalTranscriptRef.current.trim()) {
              setIsProcessing(true)
              setTimeout(() => {
                onTranscriptionComplete(finalTranscriptRef.current.trim())
                setIsProcessing(false)
                toast.success("Audio transcrito correctamente")
              }, 500)
            } else {
              toast.info("No se detectó voz")
            }

            setIsRecording(false)
          }

          recognition.start()
          recognitionRef.current = recognition
        })
        .catch((err) => {
          console.error('❌ Error de permisos:', err)
          setError("No se pudo acceder al micrófono")
          toast.error("Permiso de micrófono requerido")
        })

    } catch (error) {
      console.error('❌ Error:', error)
      setError("Error al iniciar grabación")
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  if (!isSupported) {
    return (
      <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
        <p>Tu navegador no soporta reconocimiento de voz</p>
        <p className="text-xs mt-1">Prueba con Chrome, Edge o Safari</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
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

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
      
      <p className="text-xs text-muted-foreground">
        Habla claramente. Grabación máxima: 60 segundos
      </p>
    </div>
  )
}