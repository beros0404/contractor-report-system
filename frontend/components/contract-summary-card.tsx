"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarDays, FileText, Mail, Clock, DollarSign } from "lucide-react"

interface ContractSummaryCardProps {
  contrato: {
    numero?: string
    numeroContrato?: string
    entidad?: string
    entidadContratante?: string
    fechaInicio?: string
    fechaFin?: string
    valor?: number
    valorTotalHonorarios?: number
    numeroPlanillaSeguridadSocial?: string
    logotipo?: string
    contratistaNombre?: string
    supervisorNombre?: string
    supervisorCargo?: string
  }
  configuracion?: any
}

export function ContractSummaryCard({ contrato, configuracion }: ContractSummaryCardProps) {
  console.log('📄 ContractSummaryCard - contrato recibido:', contrato)
  
  // Usar datos del contrato (priorizar campos específicos)
  const numero = contrato?.numero || contrato?.numeroContrato || "No especificado"
  const entidad = contrato?.entidad || contrato?.entidadContratante || "No especificada"
  
  // El valor puede estar en 'valor' o 'valorTotalHonorarios'
  const valor = contrato?.valor || contrato?.valorTotalHonorarios || 0
  
  const fechaInicio = contrato?.fechaInicio 
    ? format(parseISO(contrato.fechaInicio), "d 'de' MMMM 'de' yyyy", { locale: es })
    : "No disponible"
  
  const fechaFin = contrato?.fechaFin 
    ? format(parseISO(contrato.fechaFin), "d 'de' MMMM 'de' yyyy", { locale: es })
    : "No disponible"
  
  const valorFormateado = new Intl.NumberFormat('es-CO', { 
    style: 'currency', 
    currency: 'COP', 
    minimumFractionDigits: 0 
  }).format(valor)

  // Datos de configuración (opcional)
  const datosReportes = configuracion?.reportes || {}
  const frecuencia = datosReportes?.frecuencia || "Mensual"
  const diaGeneracion = datosReportes?.diaGeneracion || 31
  const correoNotificacion = datosReportes?.correoNotificacion

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Resumen del Contrato</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Datos del Contrato */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Información General</h3>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Número de Contrato</p>
                <p className="text-sm font-medium">{numero}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Vigencia</p>
                <p className="text-sm">
                  {fechaInicio} - {fechaFin}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Valor Total</p>
                <p className="text-sm font-medium">{valorFormateado}</p>
              </div>
            </div>

            {contrato?.numeroPlanillaSeguridadSocial && (
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Planilla SS</p>
                  <p className="text-sm">{contrato.numeroPlanillaSeguridadSocial}</p>
                </div>
              </div>
            )}

            {contrato?.contratistaNombre && (
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Contratista</p>
                  <p className="text-sm">{contrato.contratistaNombre}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Configuración de Reportes (opcional) */}
        {configuracion && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Configuración de Reportes</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Frecuencia</p>
                  <p className="text-sm">{frecuencia}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Día de generación</p>
                  <p className="text-sm">Día {diaGeneracion}</p>
                </div>
              </div>

              {correoNotificacion && (
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Notificaciones</p>
                    <p className="text-sm">{correoNotificacion}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}