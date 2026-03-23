"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, GripVertical, Eye, EyeOff } from "lucide-react"
import { useDrag } from 'react-dnd'

interface Campo {
  id: string
  label: string
  visible: boolean
  orden: number
}

interface SeccionBase {
  id: string
  tipo: string
  titulo: string
  visible: boolean
  orden: number
}

interface SeccionInfoContrato extends SeccionBase {
  campos: Campo[]
}

interface PanelComponentesProps {
  onAgregarSeccion: (tipo: string) => void
  onAgregarCampo: (seccionId: string, campo: Campo) => void
  config: any
}

export function PanelComponentes({ onAgregarSeccion, onAgregarCampo, config }: PanelComponentesProps) {
  const [seccionesExpandidas, setSeccionesExpandidas] = useState<Record<string, boolean>>({
    'info-contrato': true,
    'periodo': true,
    'actividades': true,
    'firmas': true
  })

  const toggleSeccion = (tipo: string) => {
    setSeccionesExpandidas(prev => ({
      ...prev,
      [tipo]: !prev[tipo]
    }))
  }

  const CampoArrastrable = ({ campo, seccionId }: { campo: Campo; seccionId: string }) => {
    const [{ isDragging }, drag] = useDrag({
      type: 'CAMPO',
      item: { tipo: 'campo', seccionId, campo },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    })

    return (
      <div
        ref={drag}
        className={`flex items-center gap-2 p-2 bg-muted/30 rounded border border-border cursor-move hover:bg-muted/50 transition-colors ${
          isDragging ? 'opacity-50' : ''
        }`}
      >
        <GripVertical className="h-3 w-3 text-muted-foreground" />
        <span className="text-xs flex-1">{campo.label}</span>
        <Eye className="h-3 w-3 text-muted-foreground" />
      </div>
    )
  }

  const seccionesDisponibles = {
    'info-contrato': {
      titulo: 'Información del Contrato',
      icono: '📋',
      descripcion: 'Datos básicos del contrato',
      campos: [
        { id: 'contratista', label: 'Nombre del Contratista', visible: true, orden: 1 },
        { id: 'numero', label: 'Número de Contrato', visible: true, orden: 2 },
        { id: 'entidad', label: 'Entidad Contratante', visible: true, orden: 3 },
        { id: 'fechaInicio', label: 'Fecha de Inicio', visible: true, orden: 4 },
        { id: 'fechaFin', label: 'Fecha de Fin', visible: true, orden: 5 },
        { id: 'objeto', label: 'Objeto del Contrato', visible: true, orden: 6 },
        { id: 'valor', label: 'Valor del Contrato', visible: true, orden: 7 },
        { id: 'supervisor', label: 'Supervisor', visible: true, orden: 8 }
      ]
    },
    'periodo': {
      titulo: 'Período Ejecutado',
      icono: '📅',
      descripcion: 'Fechas del informe',
      campos: [
        { id: 'fechaInicio', label: 'Fecha de Inicio', visible: true, orden: 1 },
        { id: 'fechaFin', label: 'Fecha de Fin', visible: true, orden: 2 },
        { id: 'diasTranscurridos', label: 'Días Transcurridos', visible: true, orden: 3 }
      ]
    },
    'actividades': {
      titulo: 'Tabla de Actividades',
      icono: '📊',
      descripcion: 'Actividades con aportes y evidencias',
      campos: [
        { id: 'descripcion', label: 'Descripción de Actividad', visible: true, orden: 1 },
        { id: 'resumen', label: 'Resumen de Aportes', visible: true, orden: 2 },
        { id: 'evidencias', label: 'Lista de Evidencias', visible: true, orden: 3 }
      ]
    },
    'firmas': {
      titulo: 'Firmas',
      icono: '✍️',
      descripcion: 'Firmas del contratista y supervisor',
      campos: [
        { id: 'contratista', label: 'Firma del Contratista', visible: true, orden: 1 },
        { id: 'supervisor', label: 'Firma del Supervisor', visible: true, orden: 2 },
        { id: 'lugar', label: 'Lugar y Fecha', visible: true, orden: 3 }
      ]
    },
    'personalizado': {
      titulo: 'Texto Personalizado',
      icono: '📝',
      descripcion: 'Agregar texto libre',
      campos: [
        { id: 'contenido', label: 'Contenido', visible: true, orden: 1 }
      ]
    }
  }

  return (
    <div className="space-y-3">
      {Object.entries(seccionesDisponibles).map(([tipo, seccion]) => (
        <div key={tipo} className="border border-border rounded-lg overflow-hidden">
          {/* Cabecera de la sección */}
          <button
            onClick={() => toggleSeccion(tipo)}
            className="w-full flex items-center gap-2 p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <span className="text-lg">{seccion.icono}</span>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium">{seccion.titulo}</p>
              <p className="text-xs text-muted-foreground">{seccion.descripcion}</p>
            </div>
            {seccionesExpandidas[tipo] ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {/* Campos de la sección (arrastrables) */}
          {seccionesExpandidas[tipo] && (
            <div className="p-2 space-y-2 bg-card">
              {seccion.campos.map((campo) => (
                <CampoArrastrable
                  key={campo.id}
                  campo={campo}
                  seccionId={tipo}
                />
              ))}
              
              {/* Botón para agregar la sección completa */}
              <button
                onClick={() => onAgregarSeccion(tipo)}
                className="w-full mt-2 p-2 text-xs bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
              >
                + Agregar sección completa
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}