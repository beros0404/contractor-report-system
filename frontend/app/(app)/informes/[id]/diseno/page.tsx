"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import {
  ArrowLeft,
  Save,
  Eye,
  Plus,
  Settings,
  Trash2,
  Loader2,
  Download,
  Brush
} from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { SeccionCard } from "@/components/editor-informe/seccion-card"
import { PanelComponentes } from "@/components/editor-informe/panel-componentes"
import { ModalConfigSeccion } from "@/components/editor-informe/modal-config-seccion"
import { useContrato } from "@/contexts/contrato-context"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"

// Configuración por defecto
const configuracionDefault = {
  id: `temp-${Date.now()}`,
  plantilla: {
    header: { visible: true, tituloPersonalizado: 'INFORME DE EJECUCIÓN' },
    secciones: [
      {
        id: `sec-${Date.now()}-1`,
        tipo: 'info-contrato',
        titulo: 'Información del Contrato',
        visible: true,
        orden: 1,
        columnas: 2,
        campos: [
          { id: 'contratista', label: 'Nombre del Contratista', visible: true, orden: 1 },
          { id: 'numero', label: 'Número de Contrato', visible: true, orden: 2 },
          { id: 'fechaInicio', label: 'Fecha de Inicio', visible: true, orden: 3 },
          { id: 'fechaFin', label: 'Fecha de Fin', visible: true, orden: 4 },
          { id: 'objeto', label: 'Objeto', visible: true, orden: 5 },
          { id: 'valor', label: 'Valor', visible: true, orden: 6 },
          { id: 'supervisor', label: 'Supervisor', visible: true, orden: 7 }
        ]
      },
      {
        id: `sec-${Date.now()}-2`,
        tipo: 'periodo',
        titulo: 'Período Ejecutado',
        visible: true,
        orden: 2
      },
      {
        id: `sec-${Date.now()}-3`,
        tipo: 'actividades',
        titulo: 'Ejecución de Actividades',
        visible: true,
        orden: 3
      },
      {
        id: `sec-${Date.now()}-4`,
        tipo: 'firmas',
        titulo: 'Firmas',
        visible: true,
        orden: 4
      }
    ],
    footer: {
      visible: true,
      mostrarFecha: true,
      mostrarLugar: true
    }
  },
  estilos: {
    fuente: 'Arial',
    colorPrimario: '#3498db',
    colorSecundario: '#2c3e50',
    margenes: {
      top: 40,
      bottom: 40,
      left: 40,
      right: 40
    }
  }
}

export default function DisenoInformePage() {
  const params = useParams()
  const router = useRouter()
  const { contratoActivo, usuarioId } = useContrato()
  const [config, setConfig] = useState<any>(configuracionDefault)
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [vistaPrevia, setVistaPrevia] = useState(false)
  const [modalConfig, setModalConfig] = useState<any>(null)

  const informeId = params.id as string

  useEffect(() => {
    if (usuarioId && contratoActivo) {
      cargarConfiguracion()
    } else {
      setLoading(false)
    }
  }, [usuarioId, contratoActivo])

  const cargarConfiguracion = async () => {
    try {
      setLoading(true)
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/configuracion-informe?usuarioId=${usuarioId}&contratoId=${contratoActivo}`
      )
      
      if (res.ok) {
        const data = await res.json()
        setConfig(data)
      }
    } catch (error) {
      console.error("Error cargando configuración:", error)
      toast.error("Error al cargar la configuración, usando valores por defecto")
    } finally {
      setLoading(false)
    }
  }

  const moveSeccion = (dragIndex: number, hoverIndex: number) => {
    if (!config?.plantilla?.secciones) return
    
    const nuevasSecciones = [...config.plantilla.secciones]
    const [removida] = nuevasSecciones.splice(dragIndex, 1)
    nuevasSecciones.splice(hoverIndex, 0, removida)
    
    const seccionesConOrden = nuevasSecciones.map((sec, idx) => ({
      ...sec,
      orden: idx + 1
    }))
    
    setConfig({
      ...config,
      plantilla: {
        ...config.plantilla,
        secciones: seccionesConOrden
      }
    })
  }

  const toggleVisibilidadSeccion = (seccionId: string) => {
    if (!config?.plantilla?.secciones) return
    
    setConfig({
      ...config,
      plantilla: {
        ...config.plantilla,
        secciones: config.plantilla.secciones.map((sec: any) =>
          sec.id === seccionId ? { ...sec, visible: !sec.visible } : sec
        )
      }
    })
  }

  const handleConfigSeccion = (seccion: any) => {
    setModalConfig(seccion)
  }

  const handleGuardarConfigSeccion = (seccionActualizada: any) => {
    setConfig({
      ...config,
      plantilla: {
        ...config.plantilla,
        secciones: config.plantilla.secciones.map((sec: any) =>
          sec.id === seccionActualizada.id ? seccionActualizada : sec
        )
      }
    })
  }

  const handleAgregarSeccion = (tipo: string) => {
    const nuevaSeccion = {
      id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      tipo,
      titulo: tipo === 'info-contrato' ? 'Información del Contrato' :
              tipo === 'periodo' ? 'Período Ejecutado' :
              tipo === 'actividades' ? 'Ejecución de Actividades' :
              tipo === 'firmas' ? 'Firmas' : 'Texto Personalizado',
      visible: true,
      orden: config.plantilla.secciones.length + 1,
      ...(tipo === 'info-contrato' && { columnas: 2, campos: [] }),
      ...(tipo === 'personalizado' && { contenido: 'Escribe aquí tu texto personalizado...' })
    }
    
    setConfig({
      ...config,
      plantilla: {
        ...config.plantilla,
        secciones: [...config.plantilla.secciones, nuevaSeccion]
      }
    })
  }

  const handleAgregarCampo = (seccionId: string, campo: any) => {
    setConfig({
      ...config,
      plantilla: {
        ...config.plantilla,
        secciones: config.plantilla.secciones.map((sec: any) =>
          sec.id === seccionId
            ? { ...sec, campos: [...(sec.campos || []), { ...campo, id: `campo-${Date.now()}` }] }
            : sec
        )
      }
    })
  }

  const eliminarSeccion = (seccionId: string) => {
    if (!config?.plantilla?.secciones) return
    
    if (confirm('¿Eliminar esta sección?')) {
      setConfig({
        ...config,
        plantilla: {
          ...config.plantilla,
          secciones: config.plantilla.secciones.filter((s: any) => s.id !== seccionId)
        }
      })
    }
  }

  const guardarConfiguracion = async () => {
    if (!config?.id) {
      toast.error("No hay configuración para guardar")
      return
    }
    
    setGuardando(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/configuracion-informe/${config.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      
      if (!res.ok) throw new Error('Error al guardar')
      
      toast.success("Configuración guardada")
    } catch (error) {
      console.error("Error guardando:", error)
      toast.error("Error al guardar la configuración")
    } finally {
      setGuardando(false)
    }
  }

  const generarPDF = async () => {
    try {
      toast.info("Generando PDF con nuevo diseño...")
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/informes/${informeId}/pdf?usuarioId=${usuarioId}`,
        { method: 'GET' }
      )
      
      if (!response.ok) throw new Error('Error al generar PDF')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `informe-${informeId}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success("PDF generado")
    } catch (error) {
      console.error("Error generando PDF:", error)
      toast.error("Error al generar PDF")
    }
  }

  const actualizarEstilo = (campo: string, valor: any) => {
    setConfig({
      ...config,
      estilos: {
        ...config.estilos,
        [campo]: valor
      }
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <Link
            href={`/informes/${informeId}`}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al informe
          </Link>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setVistaPrevia(!vistaPrevia)}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
            >
              <Eye className="h-4 w-4" />
              {vistaPrevia ? 'Editar' : 'Vista previa'}
            </button>
            <button
              onClick={generarPDF}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
            >
              <Download className="h-4 w-4" />
              Probar PDF
            </button>
            <button
              onClick={guardarConfiguracion}
              disabled={guardando}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {guardando ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Guardar diseño
            </button>
          </div>
        </div>

        <PageHeader
          titulo="Diseño de Informe"
          descripcion="Personaliza la estructura y contenido de tu informe"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Barra lateral de componentes disponibles */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-4 sticky top-6">
              <h3 className="font-semibold mb-4">Componentes disponibles</h3>
              
              <PanelComponentes
                onAgregarSeccion={handleAgregarSeccion}
                onAgregarCampo={handleAgregarCampo}
                config={config}
              />

              <div className="mt-6 pt-4 border-t border-border">
                <h4 className="text-sm font-medium mb-2">Estilos</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-muted-foreground">Color primario</label>
                    <input
                      type="color"
                      value={config?.estilos?.colorPrimario || '#3498db'}
                      onChange={(e) => actualizarEstilo('colorPrimario', e.target.value)}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Fuente</label>
                    <select
                      value={config?.estilos?.fuente || 'Arial'}
                      onChange={(e) => actualizarEstilo('fuente', e.target.value)}
                      className="w-full p-2 border border-input rounded-lg text-sm"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Helvetica">Helvetica</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Área de diseño */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-lg p-6 min-h-[600px]">
              {vistaPrevia ? (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-center">VISTA PREVIA</h2>
                  <p className="text-sm text-muted-foreground text-center">
                    Así se verá el informe con la configuración actual
                  </p>
                  
                  <div className="border border-border rounded-lg p-8 space-y-6">
                    {/* Header */}
                    {config?.plantilla?.header?.visible && (
                      <div className="text-center border-b pb-4">
                        <h1 className="text-2xl font-bold" style={{ color: config.estilos?.colorPrimario }}>
                          {config.plantilla.header.tituloPersonalizado || 'INFORME DE EJECUCIÓN'}
                        </h1>
                      </div>
                    )}

                    {/* Secciones */}
                    {config?.plantilla?.secciones
                      .filter((s: any) => s.visible)
                      .sort((a: any, b: any) => a.orden - b.orden)
                      .map((seccion: any) => (
                        <div key={seccion.id} className="border border-dashed border-border p-4 rounded">
                          <p className="text-sm font-medium mb-2" style={{ color: config.estilos?.colorSecundario }}>
                            {seccion.titulo}
                          </p>
                          <div className="h-20 bg-muted/30 rounded flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">
                              Vista previa de {seccion.titulo}
                            </span>
                          </div>
                        </div>
                      ))}

                    {/* Footer */}
                    {config?.plantilla?.footer?.visible && (
                      <div className="text-center text-sm text-muted-foreground border-t pt-4">
                        <p>Para constancia se firma en... | Fecha del informe</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="font-semibold mb-4">Estructura del informe</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Arrastra las secciones para reordenarlas. Haz clic en el ojo para ocultar/mostrar.
                  </p>
                  
                  <div className="space-y-2">
                    {config?.plantilla?.secciones && config.plantilla.secciones.length > 0 ? (
                      config.plantilla.secciones
                        .sort((a: any, b: any) => a.orden - b.orden)
                        .map((seccion: any, index: number) => (
                          <div key={seccion.id} className="relative group">
                            <SeccionCard
                              seccion={seccion}
                              index={index}
                              moveSeccion={moveSeccion}
                              onToggleVisibilidad={toggleVisibilidadSeccion}
                              onConfigurar={() => handleConfigSeccion(seccion)}
                            />
                            {seccion.tipo === 'personalizado' && (
                              <button
                                onClick={() => eliminarSeccion(seccion.id)}
                                className="absolute -right-2 -top-2 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Eliminar sección"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        ))
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        No hay secciones configuradas
                      </p>
                    )}
                  </div>

                  <div className="mt-4 p-4 border-2 border-dashed border-border rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">
                      Arrastra componentes desde la barra lateral para agregarlos al informe
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Modal de configuración */}
        {modalConfig && (
          <ModalConfigSeccion
            seccion={modalConfig}
            onClose={() => setModalConfig(null)}
            onSave={handleGuardarConfigSeccion}
          />
        )}
      </div>
    </DndProvider>
  )
}