"use client"

import { useDrag, useDrop } from 'react-dnd'
import { GripVertical, Eye, EyeOff, Settings } from 'lucide-react'
import { useState } from 'react'

interface SeccionCardProps {
  seccion: any
  index: number
  moveSeccion: (dragIndex: number, hoverIndex: number) => void
  onToggleVisibilidad: (id: string) => void
  onConfigurar: (seccion: any) => void
}

export function SeccionCard({ seccion, index, moveSeccion, onToggleVisibilidad, onConfigurar }: SeccionCardProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'SECCION',
    item: { index, id: seccion.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [, drop] = useDrop({
    accept: 'SECCION',
    hover: (item: any) => {
      if (item.index !== index) {
        moveSeccion(item.index, index)
        item.index = index
      }
    },
  })

  const getTipoLabel = (tipo: string) => {
    const tipos: Record<string, string> = {
      'info-contrato': 'Información del Contrato',
      'periodo': 'Período Ejecutado',
      'actividades': 'Tabla de Actividades',
      'firmas': 'Firmas',
      'personalizado': 'Texto Personalizado'
    }
    return tipos[tipo] || tipo
  }

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`bg-card border border-border rounded-lg p-3 mb-2 cursor-move ${
        isDragging ? 'opacity-50' : ''
      } ${!seccion.visible ? 'opacity-60 border-dashed' : ''}`}
    >
      <div className="flex items-center gap-2">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
        <div className="flex-1">
          <p className="text-sm font-medium">{seccion.titulo || getTipoLabel(seccion.tipo)}</p>
          <p className="text-xs text-muted-foreground">{getTipoLabel(seccion.tipo)}</p>
        </div>
        <button
          onClick={() => onToggleVisibilidad(seccion.id)}
          className="p-1 hover:bg-accent rounded"
          title={seccion.visible ? 'Ocultar sección' : 'Mostrar sección'}
        >
          {seccion.visible ? (
            <Eye className="h-4 w-4 text-primary" />
          ) : (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        <button
          onClick={() => onConfigurar(seccion)}
          className="p-1 hover:bg-accent rounded"
          title="Configurar sección"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}