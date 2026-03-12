"use client"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  Download,
  Send,
  CheckCircle2,
  Loader2,
  FolderOpen,
  ExternalLink,
  Pen
} from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { ReportePreview } from "@/components/reporte-preview"
import { FirmaModal } from "@/components/firma-modal"
import { apiClient } from "@/lib/api-client"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { useContrato } from "@/contexts/contrato-context"
import { Brush } from "lucide-react"


type EstadoInforme = 'borrador' | 'finalizado' | 'enviado'

const estadoBadge: Record<EstadoInforme, { label: string; className: string }> = {
  borrador: {
    label: "Borrador",
    className: "bg-muted text-muted-foreground",
  },
  finalizado: {
    label: "Finalizado",
    className: "bg-chart-2/15 text-chart-2",
  },
  enviado: {
    label: "Enviado",
    className: "bg-chart-1/15 text-chart-1",
  },
}

export default function InformeDetailPage() {
  const params = useParams()
  const { contratoActivo, usuarioId } = useContrato()
  const [informe, setInforme] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [carpetasActividades, setCarpetasActividades] = useState<Record<string, string>>({})
  
  // Estados para firmas
  const [showFirmaModal, setShowFirmaModal] = useState(false)
  const [tipoFirma, setTipoFirma] = useState<'contratista' | 'supervisor'>('contratista')
  const [firmasGuardadas, setFirmasGuardadas] = useState<any[]>([])

  const informeId = params.id as string

  const cargarDatos = useCallback(async () => {
    if (!informeId || !usuarioId) return
  
    try {
      setLoading(true)
      const inf = await apiClient.getInforme(informeId, usuarioId)
      console.log('📋 Informe cargado:', inf)
      console.log('📋 Actividades:', inf?.contenido?.actividades)
      setInforme(inf)
      
      // Obtener carpetas de Drive para cada actividad
      if (inf?.contenido?.actividades) {
        const carpetas: Record<string, string> = {}
        for (const actividad of inf.contenido.actividades) {
          try {
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/evidencias/carpeta/${actividad.actividadId}?usuarioId=${usuarioId}`
            )
            if (res.ok) {
              const data = await res.json()
              if (data.carpetaUrl) {
                carpetas[actividad.actividadId] = data.carpetaUrl
              }
            }
          } catch (error) {
            console.error(`Error obteniendo carpeta para actividad ${actividad.actividadId}:`, error)
          }
        }
        setCarpetasActividades(carpetas)
      }
    } catch (error) {
      console.error("Error cargando informe:", error)
      toast.error("Error al cargar el informe")
    } finally {
      setLoading(false)
    }
  }, [informeId, usuarioId])

  // Función para cargar firmas guardadas
  const cargarFirmasGuardadas = async () => {
    if (!usuarioId) return
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/firmas?usuarioId=${usuarioId}&tipo=${tipoFirma}`)
      if (res.ok) {
        const data = await res.json()
        setFirmasGuardadas(data)
      }
    } catch (error) {
      console.error("Error cargando firmas:", error)
    }
  }

  const handleGuardarFirma = async (firmaData: any) => {
    try {
      if (!informe || !usuarioId) {
        console.error('❌ Falta informe o usuarioId');
        return;
      }
  
      console.log('📝 Guardando firma para:', tipoFirma);
      console.log('📦 firmaData:', firmaData);
  
      // Crear el objeto de firma
      const firmaObj: any = {
        nombre: tipoFirma === 'contratista' 
          ? informe.contenido.contrato?.contratistaNombre 
          : informe.contenido.contrato?.supervisorNombre,
        firmaDigital: firmaData.imagen,
        fecha: new Date().toISOString()
      };
  
      if (tipoFirma === 'contratista') {
        firmaObj.cedula = informe.contenido.contrato?.contratistaCedula;
      } else {
        firmaObj.cargo = informe.contenido.contrato?.supervisorCargo;
      }
  
      if (firmaData.guardar && firmaData.nombre) {
        firmaObj.firmaGuardadaId = 'pending';
      }
  
      // Actualizar el informe con la nueva firma
      const updatedInforme = {
        ...informe,
        contenido: {
          ...informe.contenido,
          firmas: {
            ...informe.contenido?.firmas,
            [tipoFirma]: firmaObj
          }
        }
      };
  
      console.log('📦 Informe actualizado:', JSON.stringify(updatedInforme, null, 2));
      
      // Guardar en el backend
      const result = await apiClient.updateInforme(informe.id, updatedInforme, usuarioId);
      console.log('✅ Informe guardado:', result);
      
      // Si se debe guardar la firma para futuros usos
      if (firmaData.guardar && firmaData.nombre) {
        console.log('📝 Guardando firma en biblioteca...');
        const saveRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/firmas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            usuarioId,
            nombre: firmaData.nombre,
            imagen: firmaData.imagen,
            tipo: tipoFirma
          })
        });
        
        if (saveRes.ok) {
          const firmaGuardada = await saveRes.json();
          console.log('✅ Firma guardada en biblioteca:', firmaGuardada);
          
          // Actualizar el ID de la firma guardada
          updatedInforme.contenido.firmas[tipoFirma].firmaGuardadaId = firmaGuardada.id;
          await apiClient.updateInforme(informe.id, updatedInforme, usuarioId);
        }
      }
      
      setInforme(updatedInforme);
      setShowFirmaModal(false);
      toast.success("Firma agregada correctamente");
      
    } catch (error) {
      console.error("❌ Error guardando firma:", error);
      toast.error("Error al guardar la firma");
    }
  };

  useEffect(() => {
    if (informeId && usuarioId) {
      cargarDatos()
    }
  }, [informeId, usuarioId, cargarDatos])

  const actualizarEstado = async (nuevoEstado: EstadoInforme) => {
    if (!informe || !usuarioId) return

    try {
      setRefreshing(true)
      
      if (nuevoEstado === 'finalizado') {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/informes/${informe.id}/finalizar?usuarioId=${usuarioId}`, {
          method: 'PUT'
        })
        if (!res.ok) throw new Error('Error al finalizar informe')
        const data = await res.json()
        setInforme(data)
      } else if (nuevoEstado === 'enviado') {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/informes/${informe.id}/enviar?usuarioId=${usuarioId}`, {
          method: 'PUT'
        })
        if (!res.ok) throw new Error('Error al enviar informe')
        const data = await res.json()
        setInforme(data)
      }

      toast.success(`Informe marcado como ${nuevoEstado}`)
    } catch (error) {
      console.error("Error actualizando informe:", error)
      toast.error("Error al actualizar el informe")
    } finally {
      setRefreshing(false)
    }
  }

  function handleFinalize() {
    actualizarEstado("finalizado")
  }

  function handleSend() {
    actualizarEstado("enviado")
  }

  // Función para descargar PDF
  const handleDownload = async () => {
    if (!informe?.id || !usuarioId) {
      toast.error("Informe no disponible");
      return;
    }
    
    // Verificar datos antes de enviar
    console.log('📊 INFORME COMPLETO:', informe);
    console.log('📊 ACTIVIDADES:', informe.contenido?.actividades);
    console.log('📊 PRIMERA ACTIVIDAD:', informe.contenido?.actividades?.[0]);
    
    try {
      toast.info("Generando PDF...");
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/informes/${informe.id}/pdf?usuarioId=${usuarioId}`,
        {
          method: 'GET',
        }
      );
      
      if (!response.ok) {
        let errorMessage = 'Error al generar PDF';
        try {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
        } catch {
          errorMessage = await response.text() || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const año = informe.periodo?.año || new Date().getFullYear();
      const mes = informe.periodo?.mes || new Date().getMonth() + 1;
      const mesStr = mes.toString().padStart(2, '0');
      
      a.download = `informe-${año}-${mesStr}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success("PDF descargado correctamente");
      
    } catch (error: any) {
      console.error("Error descargando PDF:", error);
      toast.error(error.message || "Error al descargar PDF");
    }
  };

const handleDownloadEvidencias = async () => {
  if (!informe?.contratoId || !usuarioId) {
    toast.error("No hay información del contrato");
    return;
  }
  
  try {
    toast.info("Preparando descarga de evidencias del contrato...");
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/evidencias/contrato/${informe.contratoId}/zip?usuarioId=${usuarioId}`,
      {
        method: 'GET',
      }
    );
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('No hay evidencias para este contrato');
      }
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Error al descargar evidencias');
    }
    
    // Obtener el blob del ZIP
    const blob = await response.blob();
    
    // Crear URL para descarga
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evidencias-contrato-${informe.contratoId.substring(0, 8)}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success("Descarga completada");
    
  } catch (error: any) {
    console.error("Error descargando evidencias:", error);
    toast.error(error.message || "Error al descargar evidencias");
  }
};

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-sm text-muted-foreground">Cargando informe...</p>
        </div>
      </div>
    )
  }

  if (!informe) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <p className="text-sm font-medium text-foreground">
          Informe no encontrado
        </p>
        <Link
          href="/informes"
          className="text-sm text-primary hover:underline"
        >
          Volver a informes
        </Link>
      </div>
    )
  }

  const badge = estadoBadge[informe.estado as EstadoInforme] || estadoBadge.borrador
  const fecha = new Date(informe.periodo?.fechaFin || informe.fechaFin)
  const titulo = informe.tipo === 'mensual' ? 'Informe Mensual' : 'Preinforme 80%'

  return (
    <div className="flex flex-col gap-6 p-6">
      <Link
        href="/informes"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a informes
      </Link>

      <div className="flex items-center justify-between">
        <PageHeader 
          titulo={`${titulo} - ${format(fecha, "MMMM yyyy", { locale: es })}`}
        />
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${badge.className}`}
          >
            {badge.label}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {informe.estado === "borrador" && (
          <button
            onClick={handleFinalize}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {refreshing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Actualizando...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Finalizar Informe
              </>
            )}
          </button>
        )}
        {informe.estado === "finalizado" && (
          <button
            onClick={handleSend}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {refreshing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Actualizando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Marcar como Enviado
              </>
            )}
          </button>
        )}
        <button
          onClick={handleDownload}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="h-4 w-4" />
          Descargar PDF
        </button>
        <button
          onClick={handleDownloadEvidencias}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FolderOpen className="h-4 w-4" />
          Descargar Evidencias
        </button>
        <Link
  href={`/informes/${informe.id}/diseno`}
  className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
>
  <Brush className="h-4 w-4" />
  Diseño de informe
</Link>
      </div>

      {/* Botón de firma - Solo contratista por ahora */}
      {!informe.contenido?.firmas?.contratista?.firmaDigital && (
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => {
              setTipoFirma('contratista')
              setShowFirmaModal(true)
              cargarFirmasGuardadas()
            }}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
          >
            <Pen className="h-4 w-4" />
            Firmar como contratista
          </button>
        </div>
      )}

      {/* Mostrar firma ya aplicada */}
      {informe.contenido?.firmas?.contratista?.firmaDigital && (
        <div className="mt-2 p-4 bg-muted/30 rounded-lg">
          <p className="text-sm font-medium text-foreground mb-2">Firma del contratista aplicada:</p>
          <div className="flex items-center gap-4">
            <img 
              src={informe.contenido.firmas.contratista.firmaDigital} 
              alt="Firma del contratista"
              className="h-12 object-contain bg-white p-1 rounded border border-border"
            />
            <p className="text-xs text-muted-foreground">
              Firmado el {informe.contenido.firmas.contratista.fecha 
                ? format(new Date(informe.contenido.firmas.contratista.fecha), "d 'de' MMMM 'de' yyyy", { locale: es })
                : 'Fecha no disponible'}
            </p>
          </div>
        </div>
      )}

      {/* Reporte Preview con enlaces a carpetas */}
      <div className="space-y-4">
        <ReportePreview 
          informe={informe} 
          carpetasActividades={carpetasActividades}
        />
        
        {/* Enlaces a carpetas de Drive por actividad */}
        {Object.keys(carpetasActividades).length > 0 && (
          <div className="mt-6 p-4 bg-card border border-border rounded-lg">
            <h3 className="text-sm font-semibold text-card-foreground mb-3">
              Carpetas de evidencias en Google Drive
            </h3>
            <div className="space-y-2">
              {informe.contenido.actividades.map((actividad: any) => {
                const carpetaUrl = carpetasActividades[actividad.actividadId]
                if (!carpetaUrl) return null
                
                return (
                  <a
                    key={actividad.actividadId}
                    href={carpetaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <FolderOpen className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {actividad.titulo}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Ver carpeta en Google Drive
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </a>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal de firma */}
      {showFirmaModal && (
        <FirmaModal
          onClose={() => setShowFirmaModal(false)}
          onSave={handleGuardarFirma}
          titulo={`Firma del ${tipoFirma === 'contratista' ? 'Contratista' : 'Supervisor'}`}
          nombrePersona={tipoFirma === 'contratista' 
            ? informe?.contenido?.contrato?.contratistaNombre || 'Contratista'
            : informe?.contenido?.contrato?.supervisorNombre || 'Supervisor'}
          tipo={tipoFirma}
          firmasGuardadas={firmasGuardadas}
        />
      )}
    </div>
  )
}