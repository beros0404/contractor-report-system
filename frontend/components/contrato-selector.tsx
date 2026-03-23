"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, Building2, Check } from "lucide-react"
import type { Contrato } from "@/lib/types"

interface ContratoSelectorProps {
  contratos: Contrato[]
  contratoActivo: string | null
  onContratoChange: (contratoId: string) => void
}

export function ContratoSelector({ 
  contratos, 
  contratoActivo, 
  onContratoChange 
}: ContratoSelectorProps) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const contratoSeleccionado = contratos.find(c => c._id === contratoActivo || c.id === contratoActivo)

  console.log("Contrato seleccionado:", contratoSeleccionado)
  console.log("Contratos disponibles:", contratos)

  const handleSelectContrato = (contrato: Contrato) => {
    console.log("Seleccionando contrato:", contrato)
    const contratoId = contrato._id || contrato.id
    if (contratoId) {
      onContratoChange(contratoId)
      setOpen(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
      >
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <div className="flex flex-col items-start">
          <span className="text-xs text-muted-foreground">Contrato activo</span>
          <span className="text-sm font-medium">
            {contratoSeleccionado?.numero || "Seleccionar contrato"}
          </span>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-72 rounded-lg border border-border bg-card shadow-lg z-50">
          <div className="p-2">
            <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              Tus contratos
            </p>
            {contratos.length === 0 ? (
              <p className="px-2 py-3 text-sm text-muted-foreground text-center">
                No hay contratos disponibles
              </p>
            ) : (
              <div className="max-h-60 overflow-y-auto">
                {contratos.map((contrato) => {
                  const key = contrato._id || contrato.id || `temp-${Math.random()}`
                  const contratoId = contrato._id || contrato.id
                  
                  return (
                    <button
                      key={key}
                      onClick={() => handleSelectContrato(contrato)}
                      className="flex items-center justify-between w-full px-2 py-2 rounded hover:bg-accent text-left"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{contrato.numero || "Contrato sin número"}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {contrato.entidad || "Entidad no especificada"}
                        </p>
                      </div>
                      {(contrato._id === contratoActivo || contrato.id === contratoActivo) && (
                        <Check className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}