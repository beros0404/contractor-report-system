"use client"

import { useState, useRef, useEffect } from "react"
import { X, Upload, Pen, Save, Trash2, Check, Loader2 } from "lucide-react"
import SignatureCanvas from "react-signature-canvas"
import { toast } from "sonner"

interface FirmaModalProps {
  onClose: () => void
  onSave: (firma: { imagen: string; guardar: boolean; nombre?: string }) => void
  titulo: string
  nombrePersona: string
  tipo: 'contratista' | 'supervisor'
  firmasGuardadas?: Array<{ id: string; nombre: string; imagen: string; fecha: Date }>
}

export function FirmaModal({ onClose, onSave, titulo, nombrePersona, tipo, firmasGuardadas = [] }: FirmaModalProps) {
  const [modo, setModo] = useState<'dibujar' | 'subir'>('dibujar')
  const [imagenSubida, setImagenSubida] = useState<string | null>(null)
  const [guardarFirma, setGuardarFirma] = useState(false)
  const [nombreFirma, setNombreFirma] = useState(`${nombrePersona} - ${new Date().toLocaleDateString()}`)
  const [cargando, setCargando] = useState(false)
  const [mostrarGuardadas, setMostrarGuardadas] = useState(false)
  
  const signatureRef = useRef<SignatureCanvas>(null)

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear()
    }
    setImagenSubida(null)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      setImagenSubida(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    let firmaImagen = ''

    if (modo === 'dibujar') {
      if (signatureRef.current?.isEmpty()) {
        toast.error("Dibuja una firma primero")
        return
      }
      firmaImagen = signatureRef.current?.toDataURL() || ''
    } else {
      if (!imagenSubida) {
        toast.error("Selecciona una imagen de firma")
        return
      }
      firmaImagen = imagenSubida
    }

    onSave({
      imagen: firmaImagen,
      guardar: guardarFirma,
      nombre: guardarFirma ? nombreFirma : undefined
    })
  }

  const seleccionarFirmaGuardada = (imagen: string) => {
    setImagenSubida(imagen)
    setModo('subir')
    setMostrarGuardadas(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">{titulo}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Selector de modo */}
          <div className="flex gap-2">
            <button
              onClick={() => setModo('dibujar')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                modo === 'dibujar'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Pen className="h-4 w-4 inline mr-2" />
              Dibujar firma
            </button>
            <button
              onClick={() => setModo('subir')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                modo === 'subir'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Upload className="h-4 w-4 inline mr-2" />
              Subir imagen
            </button>
          </div>

          {/* Firmas guardadas */}
          {firmasGuardadas.length > 0 && (
            <div>
              <button
                onClick={() => setMostrarGuardadas(!mostrarGuardadas)}
                className="text-sm text-primary hover:underline"
              >
                {mostrarGuardadas ? 'Ocultar' : 'Mostrar'} firmas guardadas ({firmasGuardadas.length})
              </button>
              
              {mostrarGuardadas && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {firmasGuardadas.map((firma) => (
                    <button
                      key={firma.id}
                      onClick={() => seleccionarFirmaGuardada(firma.imagen)}
                      className="p-2 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <img 
                        src={firma.imagen} 
                        alt={firma.nombre}
                        className="h-12 w-full object-contain mb-1"
                      />
                      <p className="text-xs truncate">{firma.nombre}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Área de firma */}
          <div className="border-2 border-dashed border-border rounded-lg p-4">
            <p className="text-sm text-foreground mb-2">
              Firma de: <span className="font-semibold">{nombrePersona}</span>
            </p>
            
            {modo === 'dibujar' ? (
              <div className="border border-border rounded-lg bg-white">
                <SignatureCanvas
                  ref={signatureRef}
                  canvasProps={{
                    className: 'w-full h-40 rounded-lg cursor-crosshair',
                    style: { backgroundColor: 'white' }
                  }}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                {imagenSubida ? (
                  <div className="relative">
                    <img 
                      src={imagenSubida} 
                      alt="Firma subida" 
                      className="max-h-40 object-contain border border-border rounded-lg p-2"
                    />
                    <button
                      onClick={clearSignature}
                      className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-full hover:bg-destructive/90"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="firma-upload"
                    />
                    <label
                      htmlFor="firma-upload"
                      className="flex flex-col items-center gap-2 px-6 py-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Haz clic para seleccionar una imagen de firma
                      </p>
                    </label>
                  </>
                )}
              </div>
            )}

            {modo === 'dibujar' && (
              <button
                onClick={clearSignature}
                className="mt-2 text-sm text-destructive hover:underline flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" />
                Limpiar firma
              </button>
            )}
          </div>

          {/* Opciones de guardado */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={guardarFirma}
                onChange={(e) => setGuardarFirma(e.target.checked)}
                className="rounded border-input"
              />
              <span className="text-sm">Guardar firma para usar en otros contratos</span>
            </label>

            {guardarFirma && (
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Nombre para la firma guardada
                </label>
                <input
                  type="text"
                  value={nombreFirma}
                  onChange={(e) => setNombreFirma(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-lg text-sm"
                  placeholder="Ej: Mi firma oficial"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={cargando}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {cargando ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Aplicar firma
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}