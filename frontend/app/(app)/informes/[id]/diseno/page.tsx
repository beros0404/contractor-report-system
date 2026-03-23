"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Loader2,
  Download,
  GripVertical,
  ArrowDown,
  ArrowUp,
  LayoutGrid,
  LayoutList,
  X,
  ChevronDown,
  ChevronUp,
  Building2,
  Users,
  Shield,
  FileText,
  Calendar,
  DollarSign,
  MapPin,
} from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { useContrato } from "@/contexts/contrato-context"
import { toast } from "sonner"


interface Campo {
  id: string
  label: string
  value: string
  tipo: "text" | "date" | "textarea"
  visible: boolean
  orden: number
  zona: "encabezado" | "extra"
}

interface Actividad {
  id: string
  actividad: string
  resumen: string
  evidencias: string
}

interface BloqueTexto {
  id: string
  titulo: string
  descripcion: string
  zona: "encabezado" | "extra"
}

interface Firma {
  titulo: string
  campoRef: string
  cargo: string
}

interface ConfigInforme {
  id: string
  columnas: 1 | 2
  campos: Campo[]
  actividades: Actividad[]
  bloquesTexto: BloqueTexto[]
  firmas: Firma[]
  lugarFecha: string
  dependenciaContratante: string
  seguridadSocial: {
    numeroPlantilla: string
    administrador: string
    otroAdministrador: string
  }
}

const CAMPOS_BASE: Omit<Campo, "value">[] = [
  { id: "contratista", label: "Nombre del Contratista", tipo: "text", visible: true, orden: 1, zona: "encabezado" },
  { id: "numero", label: "Número de Contrato", tipo: "text", visible: true, orden: 2, zona: "encabezado" },
  { id: "entidad", label: "Entidad Contratante", tipo: "text", visible: true, orden: 3, zona: "encabezado" },
  { id: "dependencia", label: "Dependencia Contratante", tipo: "text", visible: true, orden: 4, zona: "encabezado" },
  { id: "fechaInicio", label: "Fecha de Inicio", tipo: "date", visible: true, orden: 5, zona: "encabezado" },
  { id: "fechaFin", label: "Fecha de Fin", tipo: "date", visible: true, orden: 6, zona: "encabezado" },
  { id: "objeto", label: "Objeto del Contrato", tipo: "textarea", visible: true, orden: 7, zona: "encabezado" },
  { id: "valor", label: "Valor del Contrato", tipo: "text", visible: true, orden: 8, zona: "encabezado" },
  { id: "supervisor", label: "Supervisor", tipo: "text", visible: true, orden: 9, zona: "encabezado" },
  { id: "supervisorCargo", label: "Cargo del Supervisor", tipo: "text", visible: true, orden: 10, zona: "encabezado" },
  { id: "contratistaCedula", label: "Cédula del Contratista", tipo: "text", visible: true, orden: 11, zona: "encabezado" },
  { id: "contratistaProfesion", label: "Profesión del Contratista", tipo: "text", visible: true, orden: 12, zona: "encabezado" },
  { id: "lugarFirma", label: "Lugar de Firma", tipo: "text", visible: true, orden: 13, zona: "encabezado" },
]

function mapearContrato(contrato: any): Record<string, string> {
  if (!contrato) return {}
  return {
    contratista: contrato.contratistaNombre ?? "",
    numero: contrato.numero ?? "",
    entidad: contrato.entidad ?? "",
    dependencia: contrato.dependenciaContratante ?? "",
    fechaInicio: contrato.fechaInicio ? new Date(contrato.fechaInicio).toISOString().split('T')[0] : "",
    fechaFin: contrato.fechaFin ? new Date(contrato.fechaFin).toISOString().split('T')[0] : "",
    objeto: contrato.objeto ?? "",
    valor: contrato.valor !== undefined ? `$ ${Number(contrato.valor).toLocaleString("es-CO")}` : "",
    supervisor: contrato.supervisorNombre ?? "",
    supervisorCargo: contrato.supervisorCargo ?? "",
    contratistaCedula: contrato.contratistaCedula ?? "",
    contratistaProfesion: contrato.contratistaProfesion ?? "",
    lugarFirma: contrato.lugarFirma ?? "Rionegro",
  }
}

function configDefault(valores: Record<string, string> = {}): ConfigInforme {
  return {
    id: `temp-${Date.now()}`,
    columnas: 2,
    campos: CAMPOS_BASE.map(c => ({ ...c, value: valores[c.id] ?? "" })),
    actividades: [{ id: `act-${Date.now()}`, actividad: "", resumen: "", evidencias: "" }],
    bloquesTexto: [],
    firmas: [
      { titulo: "Firma del Contratista", campoRef: "contratista", cargo: "" },
      { titulo: "Firma del Supervisor", campoRef: "supervisor", cargo: "" },
    ],
    lugarFecha: "",
    dependenciaContratante: valores.dependencia || "OFICINA UNIDAD ESTRATEGICA DE NEGOCIOS ITM",
    seguridadSocial: {
      numeroPlantilla: valores.numeroPlantillaSocial || "",
      administrador: valores.administradorPlantilla || "",
      otroAdministrador: valores.otroAdministradorPlantilla || "",
    }
  }
}

export default function DisenoInformePage() {
  const params = useParams()
  const router = useRouter()
  const { contratoActivo, usuarioId } = useContrato()
  const [config, setConfig] = useState<ConfigInforme | null>(null)
  const [contrato, setContrato] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)

  const informeId = params.id as string

  useEffect(() => {
    if (usuarioId && contratoActivo) {
      cargarDatos()
    } else {
      setConfig(configDefault())
      setLoading(false)
    }
  }, [usuarioId, contratoActivo])

const cargarDatos = async () => {
  setLoading(true)
  try {
    // CORREGIDO: Agregar /api/ a la URL del contrato
    const [resContrato, resConfig] = await Promise.allSettled([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contracts/${contratoActivo}?usuarioId=${usuarioId}`),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/configuracion-informe?usuarioId=${usuarioId}&contratoId=${contratoActivo}`),
    ])

    let datosContrato: any = null
    if (resContrato.status === "fulfilled" && resContrato.value.ok) {
      datosContrato = await resContrato.value.json()
      setContrato(datosContrato)
    } else {
      console.log('⚠️ No se pudo cargar el contrato, usando valores por defecto')
    }

    const valoresContrato = mapearContrato(datosContrato)

    if (resConfig.status === "fulfilled" && resConfig.value.ok) {
      const configGuardada = await resConfig.value.json()
      const configConValores: ConfigInforme = {
        ...configGuardada,
        campos: (configGuardada.campos ?? CAMPOS_BASE).map((c: Campo) => ({
          ...c,
          value: valoresContrato[c.id] ?? c.value ?? "",
        })),
        dependenciaContratante: valoresContrato.dependencia || configGuardada.dependenciaContratante || "OFICINA UNIDAD ESTRATEGICA DE NEGOCIOS ITM",
        seguridadSocial: {
          numeroPlantilla: datosContrato?.numeroPlantillaSocial || configGuardada.seguridadSocial?.numeroPlantilla || "",
          administrador: datosContrato?.administradorPlantilla || configGuardada.seguridadSocial?.administrador || "",
          otroAdministrador: datosContrato?.otroAdministradorPlantilla || configGuardada.seguridadSocial?.otroAdministrador || "",
        }
      }
      setConfig(configConValores)
    } else {
      setConfig(configDefault(valoresContrato))
    }
  } catch (err) {
    console.error("Error cargando datos:", err)
    toast.error("Error al cargar datos, usando valores por defecto")
    setConfig(configDefault())
  } finally {
    setLoading(false)
  }
}

  const update = (fn: (c: ConfigInforme) => ConfigInforme) =>
    setConfig(prev => prev ? fn(prev) : prev)

  const toggleVisible = (id: string) =>
    update(c => ({ ...c, campos: c.campos.map(f => f.id === id ? { ...f, visible: !f.visible } : f) }))

  const setCampoZona = (id: string, zona: "encabezado" | "extra") =>
    update(c => ({ ...c, campos: c.campos.map(f => f.id === id ? { ...f, zona, visible: true } : f) }))

  const moverCampo = (id: string, dir: "up" | "down", zona: "encabezado" | "extra") =>
    update(c => {
      const lista = [...c.campos].filter(f => f.zona === zona).sort((a, b) => a.orden - b.orden)
      const idx = lista.findIndex(f => f.id === id)
      if (dir === "up" && idx === 0) return c
      if (dir === "down" && idx === lista.length - 1) return c
      const swapIdx = dir === "up" ? idx - 1 : idx + 1
      const temp = lista[idx].orden
      lista[idx].orden = lista[swapIdx].orden
      lista[swapIdx].orden = temp
      const mapa = Object.fromEntries(lista.map(f => [f.id, f.orden]))
      return { ...c, campos: c.campos.map(f => mapa[f.id] !== undefined ? { ...f, orden: mapa[f.id] } : f) }
    })

  const agregarBloque = (zona: "encabezado" | "extra") =>
    update(c => ({
      ...c,
      bloquesTexto: [...c.bloquesTexto, { id: `tb-${Date.now()}`, titulo: "", descripcion: "", zona }]
    }))

  const actualizarBloque = (id: string, campo: "titulo" | "descripcion", valor: string) =>
    update(c => ({ ...c, bloquesTexto: c.bloquesTexto.map(b => b.id === id ? { ...b, [campo]: valor } : b) }))

  const eliminarBloque = (id: string) =>
    update(c => ({ ...c, bloquesTexto: c.bloquesTexto.filter(b => b.id !== id) }))

  const agregarActividad = () =>
    update(c => ({
      ...c,
      actividades: [...c.actividades, { id: `act-${Date.now()}`, actividad: "", resumen: "", evidencias: "" }]
    }))

  const actualizarActividad = (id: string, campo: keyof Actividad, valor: string) =>
    update(c => ({ ...c, actividades: c.actividades.map(a => a.id === id ? { ...a, [campo]: valor } : a) }))

  const eliminarActividad = (id: string) =>
    update(c => ({ ...c, actividades: c.actividades.filter(a => a.id !== id) }))

  const actualizarSeguridadSocial = (campo: keyof ConfigInforme["seguridadSocial"], valor: string) =>
    update(c => ({ ...c, seguridadSocial: { ...c.seguridadSocial, [campo]: valor } }))

const guardarYAplicar = async () => {
  if (!config) return
  setGuardando(true)
  try {
    const method = config.id.startsWith("temp-") ? "POST" : "PUT"
    const url = config.id.startsWith("temp-")
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/configuracion-informe`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/configuracion-informe/${config.id}`
    
    console.log('📡 Enviando configuración a:', url)
    console.log('📦 Datos:', { ...config, usuarioId, contratoId: contratoActivo })
    
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...config, usuarioId, contratoId: contratoActivo }),
    })
    
    if (!res.ok) {
      const errorText = await res.text()
      console.error('❌ Error response:', errorText)
      throw new Error(`Error ${res.status}: ${errorText}`)
    }
    
    const data = await res.json()
    console.log('✅ Configuración guardada:', data)
    
    if (method === "POST") {
      update(c => ({ ...c, id: data.id ?? c.id }))
    }
    
    toast.success("Configuración guardada")
    
    router.push(`/informes/${informeId}`)
    
  } catch (error) {
    console.error('❌ Error guardando configuración:', error)
    toast.error("Error al guardar la configuración")
  } finally {
    setGuardando(false)
  }
}

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const camposEncabezado = config.campos
    .filter(f => f.zona === "encabezado" && f.visible)
    .sort((a, b) => a.orden - b.orden)

  const camposExtra = config.campos
    .filter(f => f.zona === "extra" && f.visible)
    .sort((a, b) => a.orden - b.orden)

  const bloquesEncabezado = config.bloquesTexto.filter(b => b.zona === "encabezado")
  const bloquesExtra = config.bloquesTexto.filter(b => b.zona === "extra")

  const tieneSeccionExtra = camposExtra.length > 0 || bloquesExtra.length > 0

  const gridCls = config.columnas === 2
    ? "grid grid-cols-2 gap-3"
    : "grid grid-cols-1 gap-3"

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Barra superior */}
      <div className="flex items-center justify-between">
        <Link
          href={`/informes/${informeId}`}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al informe
        </Link>
        <button
          onClick={guardarYAplicar}
          disabled={guardando}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
        >
          {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Guardar diseño
        </button>
      </div>

      <PageHeader
        titulo="Diseño de Informe"
        descripcion="Personaliza la estructura y contenido de tu informe. Al guardar, el diseño se aplicará automáticamente al informe."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Panel lateral ── */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-lg p-4 sticky top-6 flex flex-col gap-5">

            {/* Campos */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Campos del encabezado
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                Los valores se cargan automáticamente desde el contrato.
                Usa ↓ para mover un campo a la sección extra (después de actividades).
              </p>
              <div className="flex flex-col gap-1.5">
                {config.campos.map(campo => {
                  const enExtra = campo.zona === "extra"
                  return (
                    <div
                      key={campo.id}
                      className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-xs transition-colors ${
                        !campo.visible
                          ? "border-border bg-muted/30 text-muted-foreground"
                          : enExtra
                          ? "border-amber-300 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300"
                          : "border-blue-300 bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300"
                      }`}
                    >
                      <span className="flex-1 truncate">{campo.label}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => toggleVisible(campo.id)}
                          title={campo.visible ? "Ocultar" : "Mostrar"}
                          className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
                        >
                          {campo.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        </button>
                        {campo.visible && !enExtra && (
                          <button
                            onClick={() => setCampoZona(campo.id, "extra")}
                            title="Mover a sección extra"
                            className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </button>
                        )}
                        {campo.visible && enExtra && (
                          <button
                            onClick={() => setCampoZona(campo.id, "encabezado")}
                            title="Mover al encabezado"
                            className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="border-t border-border" />

            {/* Dependencia Contratante */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Dependencia Contratante
              </p>
              <input
                value={config.dependenciaContratante}
                onChange={(e) => update(c => ({ ...c, dependenciaContratante: e.target.value }))}
                placeholder="Ej: Oficina Unidad Estratégica de Negocios ITM"
                className="w-full text-xs p-2 border border-input rounded-lg bg-background"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Este texto aparecerá en el encabezado del informe
              </p>
            </div>

            <div className="border-t border-border" />

            {/* Seguridad Social */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Seguridad Social
              </p>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-[10px] text-muted-foreground">Número de plantilla social</label>
                  <input
                    value={config.seguridadSocial.numeroPlantilla}
                    onChange={(e) => actualizarSeguridadSocial("numeroPlantilla", e.target.value)}
                    placeholder="Ej: 123456789-0"
                    className="w-full text-xs p-2 border border-input rounded-lg bg-background mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">Administrador de plantilla</label>
                  <select
                    value={config.seguridadSocial.administrador}
                    onChange={(e) => actualizarSeguridadSocial("administrador", e.target.value)}
                    className="w-full text-xs p-2 border border-input rounded-lg bg-background mt-1"
                  >
                    <option value="">Seleccionar administrador</option>
                    <option value="Mi planilla">Mi planilla</option>
                    <option value="Enlace Operativo">Enlace Operativo</option>
                    <option value="SOI (Seguridad Operativa de Información)">SOI (Seguridad Operativa de Información)</option>
                    <option value="Aportes en Línea">Aportes en Línea</option>
                    <option value="PILA Virtual">PILA Virtual</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                {config.seguridadSocial.administrador === "Otro" && (
                  <div>
                    <label className="text-[10px] text-muted-foreground">Especificar administrador</label>
                    <input
                      value={config.seguridadSocial.otroAdministrador}
                      onChange={(e) => actualizarSeguridadSocial("otroAdministrador", e.target.value)}
                      placeholder="Nombre del administrador"
                      className="w-full text-xs p-2 border border-input rounded-lg bg-background mt-1"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-border" />

            {/* Bloques de texto */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Texto libre
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => agregarBloque("encabezado")}
                  className="flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-lg text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  <Plus className="h-3 w-3" /> Texto en encabezado
                </button>
                <button
                  onClick={() => agregarBloque("extra")}
                  className="flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-lg text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  <Plus className="h-3 w-3" /> Texto en sección extra
                </button>
              </div>
            </div>

            <div className="border-t border-border" />

            {/* Columnas */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Disposición del encabezado
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => update(c => ({ ...c, columnas: 2 }))}
                  className={`flex flex-col items-center gap-1 px-3 py-2 border rounded-lg text-xs transition-colors ${
                    config.columnas === 2
                      ? "border-blue-400 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300"
                      : "border-border hover:bg-accent text-muted-foreground"
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                  2 columnas
                </button>
                <button
                  onClick={() => update(c => ({ ...c, columnas: 1 }))}
                  className={`flex flex-col items-center gap-1 px-3 py-2 border rounded-lg text-xs transition-colors ${
                    config.columnas === 1
                      ? "border-blue-400 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300"
                      : "border-border hover:bg-accent text-muted-foreground"
                  }`}
                >
                  <LayoutList className="h-4 w-4" />
                  1 columna
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* ── Área del informe (previsualización) ── */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-lg p-6 min-h-[600px]">
            <VistaPrevia config={config} />
          </div>
        </div>
      </div>
    </div>
  )
}


function VistaPrevia({ config }: { config: ConfigInforme }) {
  const camposEncabezado = config.campos.filter(f => f.zona === "encabezado" && f.visible).sort((a, b) => a.orden - b.orden)
  const camposExtra = config.campos.filter(f => f.zona === "extra" && f.visible).sort((a, b) => a.orden - b.orden)
  const bloquesEnc = config.bloquesTexto.filter(b => b.zona === "encabezado")
  const bloquesExtra = config.bloquesTexto.filter(b => b.zona === "extra")
  const gridCls = config.columnas === 2 ? "grid grid-cols-2 gap-3" : "grid grid-cols-1 gap-3"

  const contratistaCampo = config.campos.find(f => f.id === "contratista")
  const supervisorCampo = config.campos.find(f => f.id === "supervisor")
  const cedulaCampo = config.campos.find(f => f.id === "contratistaCedula")

  return (
    <div className="border border-border rounded-lg p-8 flex flex-col gap-6 text-sm">
      {/* Header */}
      <div className="text-center border-b pb-4">
        <h1 className="text-lg font-bold">INFORME DE EJECUCIÓN PARCIAL</h1>
        <p className="text-xs text-muted-foreground mt-1">{config.dependenciaContratante}</p>
      </div>

      {/* Info contrato */}
      {camposEncabezado.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Información del Contrato</p>
          <div className={gridCls}>
            {camposEncabezado.map(c => (
              <div key={c.id} className={`${c.tipo === "textarea" && config.columnas === 2 ? "col-span-2" : ""}`}>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{c.label}</p>
                <p className="text-sm mt-0.5">{c.value || "—"}</p>
              </div>
            ))}
            {bloquesEnc.map(b => (
              <div key={b.id} className={config.columnas === 2 ? "col-span-2" : ""}>
                {b.titulo && <p className="text-xs font-semibold mb-1">{b.titulo}</p>}
                <p className="text-xs text-muted-foreground whitespace-pre-wrap">{b.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seguridad Social */}
      {config.seguridadSocial.numeroPlantilla && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Seguridad Social</p>
          <div className={gridCls}>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Número de plantilla social</p>
              <p className="text-sm mt-0.5">{config.seguridadSocial.numeroPlantilla}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Administrador de plantilla</p>
              <p className="text-sm mt-0.5">
                {config.seguridadSocial.administrador === "Otro" && config.seguridadSocial.otroAdministrador
                  ? config.seguridadSocial.otroAdministrador
                  : config.seguridadSocial.administrador || "—"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actividades */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Ejecución de Actividades</p>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              {["Actividad", "Resumen de aportes", "Evidencias"].map(h => (
                <th key={h} className="bg-muted text-left px-3 py-2 border border-border font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {config.actividades.map(a => (
              <tr key={a.id}>
                <td className="border border-border px-3 py-2 align-top w-[28%]">{a.actividad || "—"}</td>
                <td className="border border-border px-3 py-2 align-top">{a.resumen || "—"}</td>
                <td className="border border-border px-3 py-2 align-top w-[16%]">{a.evidencias || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sección extra */}
      {(camposExtra.length > 0 || bloquesExtra.length > 0) && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Información Adicional</p>
          <div className={gridCls}>
            {camposExtra.map(c => (
              <div key={c.id} className={c.tipo === "textarea" && config.columnas === 2 ? "col-span-2" : ""}>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{c.label}</p>
                <p className="text-sm mt-0.5">{c.value || "—"}</p>
              </div>
            ))}
            {bloquesExtra.map(b => (
              <div key={b.id} className={config.columnas === 2 ? "col-span-2" : ""}>
                {b.titulo && <p className="text-xs font-semibold mb-1">{b.titulo}</p>}
                <p className="text-xs text-muted-foreground whitespace-pre-wrap">{b.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Firmas - Solo previsualización */}
      <div className="border-t pt-4">
        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-1">
            <div className="border-t border-foreground/40 pt-2 mt-6">
              <p className="font-medium text-sm">{contratistaCampo?.value || "—"}</p>
              {cedulaCampo?.value && <p className="text-xs text-muted-foreground">C.C. {cedulaCampo.value}</p>}
              <p className="text-xs font-medium mt-1">Firma del Contratista</p>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="border-t border-foreground/40 pt-2 mt-6">
              <p className="font-medium text-sm">{supervisorCampo?.value || "—"}</p>
              <p className="text-xs font-medium mt-1">Firma del Supervisor</p>
            </div>
          </div>
        </div>
        {config.lugarFecha && (
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Para constancia se firma en {config.lugarFecha}
          </p>
        )}
      </div>
    </div>
  )
}