"use client"

import { useState, useRef } from "react"
import { Upload, FileText, Loader2, CheckCircle, X, Edit2, Trash2, Plus, GripVertical } from "lucide-react"
import { toast } from "sonner"
import * as Tesseract from "tesseract.js"
import * as pdfjsLib from "pdfjs-dist"
import mammoth from "mammoth"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

interface UploadActividadesProps {
  onActividadesExtracted: (actividades: string[]) => Promise<void>
  contratoId: string
  usuarioId: string
}

const SortableActividad = ({ 
  actividad, 
  index, 
  editMode, 
  editText, 
  setEditText, 
  setEditMode, 
  onDelete,
  onSave 
}: { 
  actividad: string, 
  index: number,
  editMode: number | null,
  editText: string,
  setEditText: (text: string) => void,
  setEditMode: (index: number | null) => void,
  onDelete: (index: number) => void,
  onSave: (index: number, newText: string) => void,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: index })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-3 border-b border-border last:border-0 hover:bg-accent/50 group transition-colors"
    >
      <div className="flex items-start gap-2">
        {/* Manejador de drag */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded mt-0.5"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        
        <span className="text-xs font-medium text-muted-foreground mt-0.5 min-w-[24px]">
          {index + 1}.
        </span>
        
        {editMode === index ? (
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
                onClick={() => onSave(index, editText)}
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
                {actividad || <span className="text-muted-foreground italic">[Actividad vacía]</span>}
              </p>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => {
                  setEditText(actividad)
                  setEditMode(index)
                }}
                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Editar"
              >
                <Edit2 className="h-3 w-3" />
              </button>
              <button
                onClick={() => onDelete(index)}
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
  )
}

export function UploadActividades({ onActividadesExtracted, contratoId, usuarioId }: UploadActividadesProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [fileName, setFileName] = useState("")
  const [preview, setPreview] = useState<string[]>([])
  const [editMode, setEditMode] = useState<number | null>(null)
  const [editText, setEditText] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      setPreview((items) => {
        const oldIndex = items.findIndex((_, idx) => idx === active.id)
        const newIndex = items.findIndex((_, idx) => idx === over.id)
        const newItems = arrayMove(items, oldIndex, newIndex)
        toast.success("Orden actualizado")
        return newItems
      })
    }
  }

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {      
      const arrayBuffer = await file.arrayBuffer()
      
      const loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer,
        useSystemFonts: true,
        verbosity: 0
      })
      
      const pdf = await loadingTask.promise
      
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
        
        fullText += pageText + '\n'
        setProgress(Math.round((i / pdf.numPages) * 100))
      }
      
      return fullText
    } catch (error) {
      throw error
    }
  }

  const extractTextFromDOCX = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const result = await mammoth.extractRawText({ arrayBuffer })
      return result.value
    } catch (error) {
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
  const actividades: string[] = []

  let cleanedText = text
    .replace(/\r\n/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .replace(/[•\-–—]/g, '•') 
  const seccionRegex = /ACTIVIDADES?(?:\s+(?:CONTRACTUALES|ESPECÍFICAS|DEL CONTRATISTA))?[:\s]*([\s\S]*?)(?=OBSERVACIONES|FIRMAS|---|$)/i
  const seccionMatch = cleanedText.match(seccionRegex)

  let contenidoActividades = seccionMatch ? seccionMatch[1] : cleanedText

  contenidoActividades = contenidoActividades
    .replace(/(\d+)[\.\-\):]\s*/g, '\n$1. ')
    .replace(/\n{2,}/g, '\n')


  const patronNumerado = /(\d+)[\.\-\):]\s+([\s\S]*?)(?=\n?\s*\d+[\.\-\):]\s|OBSERVACIONES|FIRMAS|---|$)/gi

  let match
  while ((match = patronNumerado.exec(contenidoActividades)) !== null) {
    let actividad = match[2]?.trim()

    if (!actividad) continue

    actividad = actividad
      .replace(/\s+/g, ' ')
      .replace(/["']/g, '')
      .trim()

    if (actividad.length > 20 && actividad.length < 500) {
      actividades.push(actividad)
    }
  }

  if (actividades.length === 0) {
    const lineas = contenidoActividades.split('\n')

    for (let linea of lineas) {
      linea = linea.trim()

      if (linea.startsWith('•')) {
        let actividad = linea.replace(/^•\s*/, '').trim()

        if (actividad.length > 20) {
          actividades.push(actividad)
        }
      }
    }
  }

  if (actividades.length === 0) {
    const lineas = contenidoActividades
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 20)

    for (const linea of lineas) {
      const esTitulo =
        linea.toUpperCase().includes('ACTIVIDADES') ||
        linea.toUpperCase().includes('CONTRATO') ||
        linea.toUpperCase().includes('OBJETO') ||
        linea.toUpperCase().includes('OBSERVACIONES') ||
        linea.toUpperCase().includes('FIRMAS')

      if (!esTitulo) {
        actividades.push(linea)
      }
    }
  }

  const actividadesLimpias = actividades
    .map(act =>
      act
        .replace(/\s+/g, ' ')
        .replace(/["']/g, '')
        .trim()
    )
    .filter(act =>
      act.length > 20 &&
      act.split(' ').length >= 4 &&
      !act.match(/^[A-Z\s]{10,}$/)
    )

  const actividadesUnicas = actividadesLimpias.filter(
    (act, index, self) => self.indexOf(act) === index
  )

  return actividadesUnicas.slice(0, 50)
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
      
      console.log("Texto extraído:", text)
      
      const actividades = parseActividades(text)
      
      console.log("Actividades encontradas:", actividades)
      
      setPreview(actividades)
      
      if (actividades.length === 0) {
        toast.error("No se encontraron actividades en el documento. Asegúrate de que el documento contenga una lista numerada de actividades.")
      } else {
        toast.success(`${actividades.length} actividades encontradas. Arrastra las actividades para reordenarlas.`)
      }

    } catch (error) {
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

  const handleSaveActividad = (index: number, newText: string) => {
    if (newText.trim()) {
      const nuevas = [...preview]
      nuevas[index] = newText.trim()
      setPreview(nuevas)
      setEditMode(null)
      setEditText("")
      toast.success("Actividad actualizada")
    } else {
      toast.error("La actividad no puede estar vacía")
    }
  }

  const handleDeleteActividad = (index: number) => {
    const nuevas = preview.filter((_, i) => i !== index)
    setPreview(nuevas)
    if (editMode === index) {
      setEditMode(null)
      setEditText("")
    }
    toast.info("Actividad eliminada")
  }

  return (
    <div className="border-2 border-dashed border-border rounded-lg p-6 bg-muted/30">
      <div className="flex flex-col items-center text-center">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Cargar actividades desde documento
        </h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-md">
          Sube el PDF o Word del contrato para extraer automáticamente las actividades
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
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={preview.map((_, idx) => idx)}
                  strategy={verticalListSortingStrategy}
                >
                  {preview.map((act, idx) => (
                    <SortableActividad
                      key={idx}
                      actividad={act}
                      index={idx}
                      editMode={editMode}
                      editText={editText}
                      setEditText={setEditText}
                      setEditMode={setEditMode}
                      onDelete={handleDeleteActividad}
                      onSave={handleSaveActividad}
                    />
                  ))}
                </SortableContext>
              </DndContext>
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