"use client"

import { useState, useRef } from "react"
import { Upload, FileText, Loader2, CheckCircle, X } from "lucide-react"
import { toast } from "sonner"
import * as Tesseract from "tesseract.js"
import * as pdfjsLib from "pdfjs-dist"
import mammoth from "mammoth"

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

interface UploadActividadesProps {
  onActividadesExtracted: (actividades: string[]) => void
  contratoId: string
  usuarioId: string
}

export function UploadActividades({ onActividadesExtracted, contratoId, usuarioId }: UploadActividadesProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [fileName, setFileName] = useState("")
  const [preview, setPreview] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      console.log("📄 Iniciando extracción de PDF...")
      const arrayBuffer = await file.arrayBuffer()
      
      const loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer,
        useSystemFonts: true,
        verbosity: 0
      })
      
      const pdf = await loadingTask.promise
      console.log(`📄 PDF cargado con ${pdf.numPages} páginas`)
      
      let fullText = ""

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim()
        
        fullText += pageText + '\n'
        setProgress(Math.round((i / pdf.numPages) * 100))
      }

      console.log("✅ PDF procesado exitosamente")
      return fullText
    } catch (error) {
      console.error("❌ Error extrayendo PDF:", error)
      throw error
    }
  }

  const extractTextFromDOCX = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const result = await mammoth.extractRawText({ arrayBuffer })
      return result.value
    } catch (error) {
      console.error("❌ Error extrayendo DOCX:", error)
      throw error
    }
  }

  const extractTextFromImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      Tesseract.recognize(file, "spa", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100))
          }
        }
      })
        .then(({ data }) => {
          resolve(data.text)
        })
        .catch(reject)
    })
  }

  const parseActividades = (text: string): string[] => {
    console.log("📄 Texto completo extraído:", text.substring(0, 500) + "...")
    
    const actividades: string[] = []
    const lines = text.split('\n')
    
    let capturing = false
    let currentActivity = ""
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // Detectar inicio de la sección de actividades
      if (line.includes("Actividades del contratista:")) {
        console.log("✅ Sección de actividades encontrada en línea:", i)
        capturing = true
        continue
      }
      
      if (capturing) {
        // Si la línea está vacía y tenemos una actividad acumulada, la guardamos
        if (line === "" && currentActivity) {
          actividades.push(currentActivity)
          currentActivity = ""
          console.log("📝 Actividad guardada por línea vacía")
        }
        // Si la línea tiene contenido
        else if (line) {
          // Verificar si es la actividad final
          if (line.includes("Y las demás actividades")) {
            if (currentActivity) {
              actividades.push(currentActivity)
            }
            actividades.push(line)
            console.log("📝 Actividad final encontrada")
            capturing = false
            break
          }
          // Si ya tenemos una actividad acumulada, agregamos esta línea
          else if (currentActivity) {
            currentActivity += " " + line
            console.log("➕ Continuación:", line.substring(0, 50))
          } 
          // Si es una nueva actividad
          else {
            currentActivity = line
            console.log("🆕 Nueva actividad:", line.substring(0, 50))
          }
        }
      }
    }
    
    // Guardar la última actividad si quedó
    if (currentActivity) {
      actividades.push(currentActivity)
    }
    
    // Si no se encontraron actividades con el método anterior, usar método alternativo
    if (actividades.length === 0) {
      console.log("⚠️ Usando método alternativo de detección")
      
      let tempActividades: string[] = []
      let buffer = ""
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        
        // Detectar números al inicio de línea (1., 2., etc.)
        if (line.match(/^\d+\./)) {
          if (buffer) {
            tempActividades.push(buffer)
          }
          buffer = line.replace(/^\d+\.\s*/, '')
        } 
        // Detectar líneas que parecen actividades (comienzan con mayúscula, terminan con punto)
        else if (line.length > 20 && line[0] === line[0].toUpperCase() && line.endsWith('.')) {
          if (buffer) {
            tempActividades.push(buffer)
            buffer = ""
          }
          tempActividades.push(line)
        }
        // Acumular si estamos en medio de una actividad
        else if (line && !line.match(/^(FECHA|NÚMERO|OBJETO)/i)) {
          if (buffer) {
            buffer += " " + line
          } else {
            buffer = line
          }
        }
      }
      
      if (buffer) {
        tempActividades.push(buffer)
      }
      
      // Filtrar actividades que no sean encabezados
      actividades.push(...tempActividades.filter(act => 
        act.length > 20 && 
        !act.includes('FECHA') && 
        !act.includes('NÚMERO') &&
        !act.includes('OBJETO')
      ))
    }
    
    const actividadesLimpias = actividades
      .map(act => {
        return act
          .replace(/^[A-Z][a-z]{2,3}:\s*/, '')
          .replace(/^-\s*/, '')
          .replace(/\s+/g, ' ')
          .trim()
      })
      .filter(act => act.length > 20)
      .filter((act, index, self) => self.indexOf(act) === index) 
    console.log("🎯 Actividades extraídas:", actividadesLimpias.length)
    return actividadesLimpias
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setProgress(0)
    setFileName(file.name)
    setPreview([])

    try {
      let text = ""

      if (file.type === "application/pdf") {
        toast.info("Extrayendo texto del PDF...")
        text = await extractTextFromPDF(file)
      } 
      else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        toast.info("Extrayendo texto del documento Word...")
        text = await extractTextFromDOCX(file)
      }
      else if (file.type.startsWith("image/")) {
        toast.info("Procesando imagen con OCR...")
        text = await extractTextFromImage(file)
      }
      else {
        throw new Error("Formato no soportado")
      }

      console.log("📄 Texto extraído completo")
      
      const actividades = parseActividades(text)
      
      setPreview(actividades)
      
      if (actividades.length === 0) {
        toast.error("No se encontraron actividades en el documento")
      } else {
        toast.success(`${actividades.length} actividades encontradas`)
      }

    } catch (error) {
      console.error("Error procesando archivo:", error)
      toast.error("Error al procesar el archivo")
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleConfirm = () => {
    if (preview.length > 0) {
      onActividadesExtracted(preview)
    }
  }

  const handleCancel = () => {
    setPreview([])
    setFileName("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="border-2 border-dashed border-border rounded-lg p-6 bg-muted/30">
      <div className="flex flex-col items-center text-center">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Cargar actividades desde documento
        </h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-md">
          Sube el PDF, Word o imagen del contrato para extraer automáticamente las actividades
        </p>
        
        {!preview.length ? (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.png,.jpg,.jpeg"
              onChange={handleFileUpload}
              className="hidden"
              id="upload-actividades"
              disabled={uploading}
            />
            
            <label
              htmlFor="upload-actividades"
              className={`inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg cursor-pointer transition-colors ${
                uploading ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/90"
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Procesando... {progress > 0 && `${progress}%`}
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  Seleccionar archivo
                </>
              )}
            </label>
          </>
        ) : (
          <div className="w-full">
            <div className="flex items-center gap-2 text-sm bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-3 rounded-lg mb-4">
              <CheckCircle className="h-5 w-5 shrink-0" />
              <span className="flex-1 text-left">
                Se encontraron {preview.length} actividades
              </span>
              <button
                onClick={handleCancel}
                className="p-1 hover:bg-green-200 dark:hover:bg-green-800 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto border border-border rounded-lg mb-4">
              {preview.map((act, idx) => (
                <div
                  key={idx}
                  className="p-3 border-b border-border last:border-0 text-left hover:bg-accent/50"
                >
                  <span className="text-xs font-medium text-muted-foreground mr-2">
                    {idx + 1}.
                  </span>
                  <span className="text-sm">{act}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Confirmar y agregar
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-4">
          Formatos soportados: PDF, DOCX, JPG, PNG (máx. 10MB)
        </p>
      </div>
    </div>
  )
}