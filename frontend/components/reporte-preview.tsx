"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { FileText, Calendar, DollarSign, Download, FolderOpen, Link2, Edit3, Save, X, Sparkles } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"

interface ReportePreviewProps {
  informe: any
  carpetasActividades?: Record<string, string>
  usuarioId?: string
  onResumenEditado?: (actividadId: string, nuevoResumen: string) => void
}

export function ReportePreview({ informe, carpetasActividades, usuarioId, onResumenEditado }: ReportePreviewProps) {
  const [editandoActividad, setEditandoActividad] = useState<string | null>(null)
  const [resumenEditado, setResumenEditado] = useState("")
  const [regenerando, setRegenerando] = useState<string | null>(null)

  const { contenido, periodo } = informe
  
  const formatearFecha = (fecha: string) => {
    if (!fecha) return 'Fecha no disponible'
    try {
      return format(new Date(fecha), "d 'de' MMMM 'de' yyyy", { locale: es })
    } catch {
      return 'Fecha inválida'
    }
  }

  const formatearValor = (valor: number) => {
    if (!valor) return '$0'
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP',
      minimumFractionDigits: 0 
    }).format(valor)
  }

  const handleEditResumen = (actividadId: string, resumenActual: string) => {
    setEditandoActividad(actividadId)
    setResumenEditado(resumenActual)
  }

  const handleGuardarResumen = async (actividadId: string) => {
    if (!usuarioId || !informe) return
    
    try {
      // Actualizar el informe con el nuevo resumen
      const actividadesActualizadas = contenido.actividades.map((act: any) => {
        if ((act.actividadId || act.id) === actividadId) {
          return { 
            ...act, 
            resumenAportes: resumenEditado,
            resumenEditado: true 
          }
        }
        return act
      })

      const informeActualizado = {
        ...informe,
        contenido: {
          ...contenido,
          actividades: actividadesActualizadas
        }
      }

      await apiClient.updateInforme(informe.id, informeActualizado, usuarioId)
      
      setEditandoActividad(null)
      if (onResumenEditado) {
        onResumenEditado(actividadId, resumenEditado)
      }
      toast.success("Resumen actualizado")
      
    } catch (error) {
      console.error("Error guardando resumen:", error)
      toast.error("Error al guardar el resumen")
    }
  }

  const handleRegenerarResumen = async (actividadId: string) => {
    if (!usuarioId || !informe) return
    
    setRegenerando(actividadId)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/informes/${informe.id}/regenerar-resumenes?usuarioId=${usuarioId}`,
        { method: 'POST' }
      )
      
      if (!response.ok) throw new Error('Error al regenerar resumen')
      
      const informeActualizado = await response.json()
      toast.success("Resumen regenerado con IA")
      
      // Actualizar el estado local (esto debería venir del padre)
      if (onResumenEditado) {
        const actividad = informeActualizado.contenido.actividades.find(
          (a: any) => (a.actividadId || a.id) === actividadId
        )
        if (actividad) {
          onResumenEditado(actividadId, actividad.resumenAportes)
        }
      }
      
    } catch (error) {
      console.error("Error regenerando resumen:", error)
      toast.error("Error al regenerar resumen")
    } finally {
      setRegenerando(null)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
      {/* Encabezado */}
      <div className="text-center mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold text-foreground">
          INFORME DE EJECUCIÓN {periodo?.tipo === 'mensual' ? 'MENSUAL' : 'PARCIAL'}
        </h1>
        <p className="text-sm text-muted-foreground">
          OFICINA UNIDAD ESTRATEGICA DE NEGOCIOS ITM
        </p>
      </div>

      {/* Información del Contrato */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Información del Contrato</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">NOMBRE DEL CONTRATISTA</p>
            <p className="font-medium">{contenido.contrato?.contratistaNombre || 'No especificado'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">NÚMERO DEL CONTRATO</p>
            <p className="font-medium">{contenido.contrato?.numero || 'No especificado'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">FECHA DE INICIO</p>
            <p className="font-medium">{formatearFecha(contenido.contrato?.fechaInicio)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">FECHA DE FIN</p>
            <p className="font-medium">{formatearFecha(contenido.contrato?.fechaFin)}</p>
          </div>
          <div className="col-span-2">
            <p className="text-muted-foreground">OBJETO</p>
            <p className="font-medium text-sm">{contenido.contrato?.objeto}</p>
          </div>
          <div>
            <p className="text-muted-foreground">VALOR DEL CONTRATO</p>
            <p className="font-medium">
              {formatearValor(contenido.contrato?.valor)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">SUPERVISOR ITM</p>
            <p className="font-medium">{contenido.contrato?.supervisorNombre || 'No especificado'}</p>
          </div>
        </div>
      </div>

      {/* Período ejecutado */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">PERIODO EJECUTADO</h2>
        <p className="text-sm">
          Del {formatearFecha(periodo?.fechaInicio)} al {formatearFecha(periodo?.fechaFin)}
        </p>
      </div>

      {/* Tabla de Actividades */}
      <div className="mb-8 overflow-x-auto">
        <h2 className="text-lg font-semibold mb-4">EJECUCIÓN DE ACTIVIDADES</h2>
        {contenido.actividades && contenido.actividades.length > 0 ? (
          <table className="w-full border-collapse border border-border">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border p-2 text-left text-sm">Actividad</th>
                <th className="border border-border p-2 text-left text-sm">Resumen de Aportes</th>
                <th className="border border-border p-2 text-left text-sm">Evidencias</th>
              </tr>
            </thead>
            <tbody>
              {contenido.actividades.map((act: any, idx: number) => {
                const actividadId = act.actividadId || act.id
                const estaEditando = editandoActividad === actividadId
                
                return (
                  <tr key={idx} className="hover:bg-accent/50">
                    <td className="border border-border p-2 align-top">
                      {/* ✅ SOLO MOSTRAR DESCRIPCIÓN, SIN TÍTULO */}
                      <p className="text-sm">{act.descripcion || 'Sin descripción'}</p>
                    </td>
                    <td className="border border-border p-2 align-top">
                      {estaEditando ? (
                        <div className="space-y-2">
                          <textarea
                            value={resumenEditado}
                            onChange={(e) => setResumenEditado(e.target.value)}
                            rows={4}
                            className="w-full p-2 border border-input rounded-lg text-sm resize-none"
                            placeholder="Escribe el resumen..."
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditandoActividad(null)}
                              className="p-1 text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleGuardarResumen(actividadId)}
                              className="p-1 text-primary hover:text-primary/80"
                            >
                              <Save className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="group relative">
                          <p className="text-sm whitespace-pre-wrap">{act.resumenAportes}</p>
                          <div className="absolute top-0 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditResumen(actividadId, act.resumenAportes)}
                              className="p-1 bg-card rounded shadow hover:bg-accent"
                              title="Editar resumen"
                            >
                              <Edit3 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleRegenerarResumen(actividadId)}
                              disabled={regenerando === actividadId}
                              className="p-1 bg-card rounded shadow hover:bg-accent disabled:opacity-50"
                              title="Regenerar con IA"
                            >
                              {regenerando === actividadId ? (
                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                              ) : (
                                <Sparkles className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="border border-border p-2 align-top">
                      <div className="space-y-2">
                        {/* Enlace a la carpeta de Drive si existe */}
                        {carpetasActividades && actividadId && carpetasActividades[actividadId] && (
                          <a
                            href={carpetasActividades[actividadId]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline text-sm mb-2 bg-primary/5 p-2 rounded"
                          >
                            <FolderOpen className="h-4 w-4" />
                            <span>Ver carpeta en Drive</span>
                          </a>
                        )}
                        
                        {/* Lista de evidencias */}
                        {act.evidencias && act.evidencias.length > 0 ? (
                          <ul className="space-y-2">
                            {act.evidencias.map((ev: any, i: number) => (
                              <li key={i} className="text-sm">
                                {ev.drive?.usado ? (
                                  <a 
                                    href={ev.drive.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-primary hover:underline p-1 rounded hover:bg-primary/5"
                                  >
                                    {ev.tipo === 'enlace' ? (
                                      <Link2 className="h-3 w-3 shrink-0" />
                                    ) : (
                                      <FileText className="h-3 w-3 shrink-0" />
                                    )}
                                    <span className="truncate flex-1">
                                      {ev.nombre || ev.archivo?.nombre || 'Evidencia'}
                                    </span>
                                  </a>
                                ) : ev.local?.usado ? (
                                  <a 
                                    href={`${process.env.NEXT_PUBLIC_API_URL}/evidencias/descargar/${ev.id}?usuarioId=${usuarioId}`}
                                    className="flex items-center gap-2 text-primary hover:underline p-1 rounded hover:bg-primary/5"
                                  >
                                    {ev.tipo === 'enlace' ? (
                                      <Link2 className="h-3 w-3 shrink-0" />
                                    ) : (
                                      <FileText className="h-3 w-3 shrink-0" />
                                    )}
                                    <span className="truncate flex-1">
                                      {ev.nombre || ev.archivo?.nombre || 'Evidencia'}
                                    </span>
                                    <Download className="h-3 w-3" />
                                  </a>
                                ) : (
                                  <div className="flex items-center gap-2 text-foreground p-1">
                                    {ev.tipo === 'enlace' ? (
                                      <Link2 className="h-3 w-3 shrink-0" />
                                    ) : (
                                      <FileText className="h-3 w-3 shrink-0" />
                                    )}
                                    <span className="truncate flex-1">
                                      {ev.nombre || ev.archivo?.nombre || 'Evidencia'}
                                    </span>
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">Sin evidencias</p>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-muted-foreground py-8">No hay actividades registradas</p>
        )}
      </div>

      {/* Firmas */}
      <div className="mt-12 pt-8 border-t">
        <div className="grid grid-cols-2 gap-8">
          <div className="text-center">
            {contenido.firmas?.contratista?.firmaDigital ? (
              <div className="flex flex-col items-center">
                <img 
                  src={contenido.firmas.contratista.firmaDigital} 
                  alt="Firma del contratista"
                  className="h-16 object-contain mb-2 bg-white p-1 rounded border border-border"
                />
                <p className="text-xs text-muted-foreground mb-2">
                  Firmado el {formatearFecha(contenido.firmas.contratista.fecha)}
                </p>
              </div>
            ) : (
              <p className="text-sm font-medium mb-8">_____________________</p>
            )}
            <p className="font-medium">{contenido.contrato?.contratistaNombre || 'Nombre del contratista'}</p>
            <p className="text-sm text-muted-foreground">
              C.C. {contenido.contrato?.contratistaCedula || '__________'}
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              Firma del Contratista
            </p>
          </div>
          <div className="text-center">
            {contenido.firmas?.supervisor?.firmaDigital ? (
              <div className="flex flex-col items-center">
                <img 
                  src={contenido.firmas.supervisor.firmaDigital} 
                  alt="Firma del supervisor"
                  className="h-16 object-contain mb-2 bg-white p-1 rounded border border-border"
                />
                <p className="text-xs text-muted-foreground mb-2">
                  Firmado el {formatearFecha(contenido.firmas.supervisor.fecha)}
                </p>
              </div>
            ) : (
              <p className="text-sm font-medium mb-8">_____________________</p>
            )}
            <p className="font-medium">{contenido.contrato?.supervisorNombre || 'Nombre del supervisor'}</p>
            <p className="text-sm text-muted-foreground">
              {contenido.contrato?.supervisorCargo || 'Supervisor'}
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              Firma del Supervisor
            </p>
          </div>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-8">
    Para constancia se firma en {contenido.contrato?.lugarFirma || 'Rionegro'} a los {periodo?.fechaFin ? format(new Date(periodo.fechaFin), "d") : '__'} días del mes de {periodo?.fechaFin ? format(new Date(periodo.fechaFin), "MMMM 'de' yyyy", { locale: es }) : '__________'}.     
    </p>
     </div>
    </div>
  )
}