"use client"

import { useState, useRef } from "react"
import { Upload, Link2, FileText, X, Loader2, FolderOpen, Download } from "lucide-react"
import { useContrato } from "@/contexts/contrato-context"
import { toast } from "sonner"

interface EvidenciaUploadProps {
  actividadId: string
  onSuccess?: (evidencia: any) => void
}

type TipoEvidencia = 'archivo' | 'enlace' | 'nota'

interface EnlaceForm {
  url: string
  titulo: string
  descripcion: string
}

interface NotaForm {
  titulo: string
  contenido: string
}

export function EvidenciaUpload({ actividadId, onSuccess }: EvidenciaUploadProps) {
  const { contratoActivo, usuarioId } = useContrato()
  const [tipo, setTipo] = useState<TipoEvidencia>('archivo')
  const [uploading, setUploading] = useState(false)
  const [enlaceForm, setEnlaceForm] = useState<EnlaceForm>({ url: '', titulo: '', descripcion: '' })
  const [notaForm, setNotaForm] = useState<NotaForm>({ titulo: '', contenido: '' })
  const [carpetaUrl, setCarpetaUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('archivo', file)
    formData.append('usuarioId', usuarioId!)
    formData.append('contratoId', contratoActivo!)
    formData.append('actividadId', actividadId)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/evidencias/upload`, {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        const errorText = await res.text()
        console.error('❌ Error response:', errorText)
        throw new Error('Error al subir archivo')
      }

      const data = await res.json()
      
      if (data.drive?.usado) {
        toast.success("Archivo subido a Google Drive")
        setCarpetaUrl(data.drive.url)
      } else {
        toast.success("Archivo guardado en el sistema")
      }
      
      if (onSuccess) onSuccess(data)
      
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al subir archivo')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleEnlaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!enlaceForm.url) {
      toast.error('La URL es requerida')
      return
    }

    setUploading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/evidencias/enlace`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuarioId,
          contratoId: contratoActivo,
          actividadId,
          ...enlaceForm
        })
      })

      if (!res.ok) {
        const errorText = await res.text()
        console.error('❌ Error response:', errorText)
        throw new Error('Error al guardar enlace')
      }

      const data = await res.json()
      
      if (data.drive?.usado) {
        toast.success("Enlace guardado en Google Drive")
        setCarpetaUrl(data.drive.url)
      } else {
        toast.success("Enlace guardado")
      }
      
      setEnlaceForm({ url: '', titulo: '', descripcion: '' })
      if (onSuccess) onSuccess(data)
      
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al guardar enlace')
    } finally {
      setUploading(false)
    }
  }

  const handleNotaSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!notaForm.contenido) {
      toast.error('El contenido es requerido')
      return
    }

    setUploading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/evidencias/nota`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuarioId,
          contratoId: contratoActivo,
          actividadId,
          ...notaForm
        })
      })

      if (!res.ok) {
        const errorText = await res.text()
        console.error('❌ Error response:', errorText)
        throw new Error('Error al guardar nota')
      }

      const data = await res.json()
      
      if (data.drive?.usado) {
        toast.success("Nota guardada en Google Drive")
        setCarpetaUrl(data.drive.url)
      } else {
        toast.success("Nota guardada")
      }
      
      setNotaForm({ titulo: '', contenido: '' })
      if (onSuccess) onSuccess(data)
      
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al guardar nota')
    } finally {
      setUploading(false)
    }
  }

  const handleDownloadZip = async () => {
    if (!contratoActivo || !usuarioId) {
      toast.error('No hay contrato seleccionado')
      return
    }

    try {
      toast.info("Preparando descarga de evidencias...")
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/evidencias/contrato/${contratoActivo}/zip?usuarioId=${usuarioId}`
      )
      
      if (!response.ok) throw new Error('Error al descargar evidencias')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `evidencias-contrato-${contratoActivo.substring(0, 8)}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      toast.success("Descarga completada")
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al descargar evidencias')
    }
  }

  const resetForm = () => {
    setEnlaceForm({ url: '', titulo: '', descripcion: '' })
    setNotaForm({ titulo: '', contenido: '' })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-4">
      {/* Selector de tipo */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setTipo('archivo')
            resetForm()
          }}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            tipo === 'archivo'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          <Upload className="h-4 w-4 inline mr-2" />
          Archivo
        </button>
        <button
          type="button"
          onClick={() => {
            setTipo('enlace')
            resetForm()
          }}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            tipo === 'enlace'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          <Link2 className="h-4 w-4 inline mr-2" />
          Enlace
        </button>
        <button
          type="button"
          onClick={() => {
            setTipo('nota')
            resetForm()
          }}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            tipo === 'nota'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          <FileText className="h-4 w-4 inline mr-2" />
          Nota
        </button>
      </div>

      {/* Contenido según tipo */}
      <div className="border border-border rounded-lg p-4">
        {tipo === 'archivo' && (
          <div className="text-center space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:bg-primary/90 transition-colors"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Seleccionar archivo
                </>
              )}
            </label>
            <p className="text-xs text-muted-foreground">
              {carpetaUrl ? 'Se usará Google Drive' : 'Se guardará en el sistema'}
            </p>
          </div>
        )}

        {tipo === 'enlace' && (
          <div className="space-y-3">
            <input
              type="url"
              placeholder="URL del enlace *"
              value={enlaceForm.url}
              onChange={(e) => setEnlaceForm({ ...enlaceForm, url: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <input
              type="text"
              placeholder="Título (opcional)"
              value={enlaceForm.titulo}
              onChange={(e) => setEnlaceForm({ ...enlaceForm, titulo: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <textarea
              placeholder="Descripción (opcional)"
              value={enlaceForm.descripcion}
              onChange={(e) => setEnlaceForm({ ...enlaceForm, descripcion: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-input rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={handleEnlaceSubmit}
              disabled={uploading}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 inline mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4 inline mr-2" />
                  Guardar enlace
                </>
              )}
            </button>
          </div>
        )}

        {tipo === 'nota' && (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Título (opcional)"
              value={notaForm.titulo}
              onChange={(e) => setNotaForm({ ...notaForm, titulo: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <textarea
              placeholder="Contenido de la nota *"
              value={notaForm.contenido}
              onChange={(e) => setNotaForm({ ...notaForm, contenido: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-input rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <button
              type="button"
              onClick={handleNotaSubmit}
              disabled={uploading}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 inline mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 inline mr-2" />
                  Guardar nota
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Acciones adicionales */}
      <div className="flex gap-2">
        {carpetaUrl && (
          <a
            href={carpetaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm"
          >
            <FolderOpen className="h-4 w-4" />
            Ver en Drive
          </a>
        )}
        
        <button
          type="button"
          onClick={handleDownloadZip}
          className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg hover:bg-accent transition-colors text-sm"
        >
          <Download className="h-4 w-4" />
          Descargar ZIP
        </button>
      </div>
    </div>
  )
}