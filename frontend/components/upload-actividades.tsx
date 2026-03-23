"use client"

import { useState, useRef } from "react"
import { Upload, FileText, Loader2, CheckCircle, X, Edit2, Trash2, Plus } from "lucide-react"
import { toast } from "sonner"
import * as Tesseract from "tesseract.js"
import * as pdfjsLib from "pdfjs-dist"
import mammoth from "mammoth"

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

interface UploadActividadesProps {
  onActividadesExtracted: (actividades: string[]) => Promise<void>
  contratoId: string
  usuarioId: string
}

export function UploadActividades({ onActividadesExtracted, contratoId, usuarioId }: UploadActividadesProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [fileName, setFileName] = useState("")
  const [preview, setPreview] = useState<string[]>([])
  const [editMode, setEditMode] = useState<number | null>(null)
  const [editText, setEditText] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      console.log("📄 Iniciando extracción de PDF...")
      console.log("📄 Nombre del archivo:", file.name)
      console.log("📄 Tamaño:", (file.size / 1024).toFixed(2), "KB")
      
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
          .map((item: any) => {
            const str = item.str
            if (str.match(/^\d+\./)) {
              return '\n' + str + ' '
            }
            return str
          })
          .join('')
          .replace(/\s+/g, ' ')
          .trim()
        
        console.log(`📄 Página ${i}: ${pageText.length} caracteres extraídos`)
        console.log(`📄 Contenido página ${i}:`, pageText.substring(0, 5000))
        
        fullText += pageText + '\n'
        setProgress(Math.round((i / pdf.numPages) * 100))
      }

      console.log("✅ PDF procesado exitosamente")
      console.log("📄 Texto total extraído:", fullText.length, "caracteres")
      
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
  console.log("📄 Extrayendo actividades del texto...")
  console.log("📄 Longitud total del texto:", text.length)
  console.log("📄 Primos 500 caracteres:", text.substring(0, 500))
  
  const actividades: string[] = []
  
  // Limpiar el texto primero - eliminar caracteres especiales
  let cleanedText = text
    .replace(/\r\n/g, '\n')
    .replace(/\n+/g, '\n')
    .replace(/[•\-–—]/g, ' ')
  
  // Buscar la sección de actividades
  const seccionRegex = /ACTIVIDADES?\s*(?:ESPECÍFICAS?\s*)?DEL\s*CONTRATISTA:?\s*([\s\S]*?)(?=OBSERVACIONES|FIRMAS|---|$)/i
  const seccionMatch = cleanedText.match(seccionRegex)
  
  let contenidoActividades = seccionMatch ? seccionMatch[1] : cleanedText
  console.log("📄 Contenido de actividades:", contenidoActividades.substring(0, 500))
  
  // Método principal: Buscar patrones numerados
  const patronNumerado = /(\d+)\.\s+([^0-9]+?)(?=\d+\.|OBSERVACIONES|FIRMAS|---|$)/gi
  let match
  
  while ((match = patronNumerado.exec(contenidoActividades)) !== null) {
    let actividad = match[2] ? match[2].trim() : ""
    
    if (!actividad) continue
    
    // Limpiar la actividad
    actividad = actividad
      .replace(/\s+/g, ' ')
      .replace(/["']/g, '')
      .replace(/^[•\-–—]\s*/, '')
      .trim()
    
    // Eliminar texto después de ---, OBSERVACIONES, FIRMAS
    actividad = actividad.split('---')[0]
    actividad = actividad.split('OBSERVACIONES')[0]
    actividad = actividad.split('FIRMAS')[0]
    actividad = actividad.trim()
    
    // Validar que sea una actividad real
    const esActividadValida = 
      actividad.length > 20 && 
      actividad.length < 500 &&
      !actividad.includes('ACTIVIDADES') &&
      !actividad.includes('CONTRATISTA') &&
      !actividad.includes('OBJETO') &&
      !actividad.includes('FECHA') &&
      !actividad.includes('NÚMERO') &&
      !actividad.includes('VIGENCIA') &&
      !actividad.includes('OBSERVACIONES') &&
      !actividad.includes('FIRMAS') &&
      !actividad.match(/^[A-Z\s]{10,}$/) // No son todo mayúsculas y largas
    
    if (esActividadValida) {
      // Cortar si es muy larga (más de 300 caracteres)
      if (actividad.length > 300) {
        const puntoIndex = actividad.indexOf('.', 250)
        if (puntoIndex > 0) {
          actividad = actividad.substring(0, puntoIndex + 1)
        } else {
          actividad = actividad.substring(0, 300) + '...'
        }
      }
      
      actividades.push(actividad)
      console.log(`✅ Actividad ${match[1]} encontrada:`, actividad.substring(0, 100))
    }
  }
  
  // Si no se encontraron con el método principal, buscar números en el texto completo
  if (actividades.length === 0) {
    console.log("⚠️ Buscando números en todo el texto")
    const todosLosNumeros = /(\d+)\.\s+([^0-9]{20,}?)(?=\d+\.|$)/gi
    while ((match = todosLosNumeros.exec(cleanedText)) !== null) {
      let actividad = match[2] ? match[2].trim() : ""
      if (actividad) {
        actividad = actividad.replace(/\s+/g, ' ').trim()
        if (actividad.length > 20 && actividad.length < 500 &&
            !actividad.includes('ACTIVIDADES') && 
            !actividad.includes('CONTRATISTA')) {
          actividades.push(actividad)
          console.log(`✅ Actividad encontrada:`, actividad.substring(0, 100))
        }
      }
    }
  }
  
  // Método de respaldo: buscar líneas que comienzan con número
  if (actividades.length === 0) {
    console.log("⚠️ Buscando líneas con números")
    const lineas = cleanedText.split(/\n|\.\s+/)
    for (const linea of lineas) {
      const trimmed = linea.trim()
      if (trimmed && trimmed.match(/^\d+\./) && trimmed.length > 20) {
        let actividad = trimmed.replace(/^\d+\.\s*/, '')
        actividad = actividad.replace(/\s+/g, ' ').trim()
        if (actividad.length > 20 && !actividad.includes('ACTIVIDADES')) {
          actividades.push(actividad)
          console.log(`✅ Actividad encontrada:`, actividad.substring(0, 100))
        }
      }
    }
  }
  
  // Limpiar todas las actividades y filtrar nulos/vacíos
  const actividadesLimpias: string[] = []
  
  for (let act of actividades) {
    // Saltar si es null, undefined o vacío
    if (!act || typeof act !== 'string') continue
    
    // Eliminar títulos de sección
    if (act.includes('ACTIVIDADES ESPECÍFICAS') || 
        act.includes('ACTIVIDADES DEL CONTRATISTA')) {
      continue
    }
    
    // Eliminar texto después de marcadores
    act = act.split('---')[0]
    act = act.split('OBSERVACIONES')[0]
    act = act.split('FIRMAS')[0]
    
    // Limpiar
    act = act
      .replace(/^[A-Z][a-z]{2,3}:\s*/, '')
      .replace(/^-\s*/, '')
      .replace(/\s+/g, ' ')
      .replace(/["']/g, '')
      .trim()
    
    // Validar que la actividad sea válida
    if (act && act.length > 20) {
      actividadesLimpias.push(act)
    }
  }
  
  // Eliminar duplicados
  const actividadesUnicas = actividadesLimpias.filter((act, index, self) => 
    self.indexOf(act) === index
  )
  
  // Filtrar actividades inválidas
  const actividadesFinales: string[] = []
  
  for (const act of actividadesUnicas) {
    if (!act) continue
    
    const esInvalida = 
      act.includes('ACTIVIDADES ESPECÍFICAS') ||
      act.includes('ACTIVIDADES DEL CONTRATISTA') ||
      act.includes('OBJETO DEL CONTRATO') ||
      act.includes('FECHA DE INICIO') ||
      act.includes('NÚMERO DEL CONTRATO') ||
      act.includes('VIGENCIA') ||
      act.includes('OBSERVACIONES') ||
      act.includes('FIRMAS') ||
      act.length < 20 ||
      act.split(' ').length < 4
    
    if (!esInvalida) {
      actividadesFinales.push(act)
    }
  }
  
  // Limitar a 20 actividades
  const actividadesLimitadas = actividadesFinales.slice(0, 20)
  
  console.log("🎯 Actividades extraídas:", actividadesLimitadas.length)
  if (actividadesLimitadas.length === 0) {
    console.log("⚠️ No se encontraron actividades. Mostrando texto original para debug:")
    console.log(cleanedText.substring(0, 1000))
  } else {
    actividadesLimitadas.forEach((act, idx) => {
      console.log(`   ${idx + 1}. ${act.substring(0, 100)}${act.length > 100 ? '...' : ''}`)
    })
  }
  
  return actividadesLimitadas
}

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setProgress(0)
    setFileName(file.name)
    setPreview([])
    setEditMode(null)

    try {
      let text = ""

      if (file.type === "application/pdf" || file.name.endsWith('.pdf')) {
        toast.info("Extrayendo texto del PDF...")
        text = await extractTextFromPDF(file)
      } 
      else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.endsWith('.docx')) {
        toast.info("Extrayendo texto del documento Word...")
        text = await extractTextFromDOCX(file)
      }
      else if (file.type.startsWith("image/")) {
        toast.info("Procesando imagen con OCR...")
        text = await extractTextFromImage(file)
      }
      else {
        throw new Error("Formato no soportado. Usa PDF, DOCX o imagen")
      }

      if (!text || text.trim().length === 0) {
        throw new Error("No se pudo extraer texto del archivo")
      }

      console.log("📄 Texto extraído completo")
      
      const actividades = parseActividades(text)
      
      setPreview(actividades)
      
      if (actividades.length === 0) {
        toast.error("No se encontraron actividades en el documento. Asegúrate de que el documento contenga una lista numerada de actividades.")
      } else {
        toast.success(`${actividades.length} actividades encontradas. Puedes editarlas antes de guardar.`)
      }

    } catch (error) {
      console.error("❌ Error procesando archivo:", error)
      toast.error(error instanceof Error ? error.message : "Error al procesar el archivo")
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleConfirm = async () => {
    const actividadesValidas = preview.filter(act => act.trim().length > 0)
    
    if (actividadesValidas.length === 0) {
      toast.error("No hay actividades válidas para guardar")
      return
    }
    
    try {
      await onActividadesExtracted(actividadesValidas)
      handleCancel()
      toast.success(`${actividadesValidas.length} actividades guardadas correctamente`)
    } catch (error) {
      console.error("❌ Error guardando actividades:", error)
      toast.error("Error al guardar las actividades")
    }
  }

  const handleCancel = () => {
    setPreview([])
    setFileName("")
    setEditMode(null)
    setEditText("")
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
        
        {preview.length === 0 ? (
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
            
            <p className="text-xs text-muted-foreground mt-4">
              Formatos soportados: PDF, DOCX, JPG, PNG (máx. 10MB)
            </p>
          </>
        ) : (
          <div className="w-full">
            <div className="flex items-center justify-between gap-2 text-sm bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-3 rounded-lg mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 shrink-0" />
                <span className="flex-1 text-left">
                  Se encontraron {preview.length} actividades
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setPreview([...preview, ""])
                    setEditMode(preview.length)
                    setEditText("")
                  }}
                  className="px-2 py-1 text-xs bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
                >
                  <Plus className="h-3 w-3 inline mr-1" />
                  Agregar
                </button>
                <button
                  onClick={handleCancel}
                  className="p-1 hover:bg-green-200 dark:hover:bg-green-800 rounded transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto border border-border rounded-lg mb-4">
              {preview.map((act, idx) => (
                <div
                  key={idx}
                  className="p-3 border-b border-border last:border-0 hover:bg-accent/50 group transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-medium text-muted-foreground mt-0.5">
                      {idx + 1}.
                    </span>
                    
                    {editMode === idx ? (
                      <div className="flex-1">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full p-2 border border-input rounded-md text-sm resize-y focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                          rows={3}
                          autoFocus
                          placeholder="Escribe la actividad aquí..."
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => {
                              if (editText.trim()) {
                                const nuevas = [...preview]
                                nuevas[idx] = editText.trim()
                                setPreview(nuevas)
                                setEditMode(null)
                                setEditText("")
                                toast.success("Actividad actualizada")
                              } else {
                                toast.error("La actividad no puede estar vacía")
                              }
                            }}
                            className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => {
                              setEditMode(null)
                              setEditText("")
                            }}
                            className="px-2 py-1 text-xs border border-border rounded hover:bg-accent transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1">
                          <p className="text-sm whitespace-pre-wrap">
                            {act || <span className="text-muted-foreground italic">[Actividad vacía]</span>}
                          </p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditText(act)
                              setEditMode(idx)
                            }}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => {
                              const nuevas = preview.filter((_, i) => i !== idx)
                              setPreview(nuevas)
                              if (editMode === idx) {
                                setEditMode(null)
                                setEditText("")
                              }
                              toast.info("Actividad eliminada")
                            }}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Confirmar y agregar ({preview.filter(a => a.trim()).length} actividades)
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
      </div>
    </div>
  )
}