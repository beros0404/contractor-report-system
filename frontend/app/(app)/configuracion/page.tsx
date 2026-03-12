"use client"

import { useState, useCallback } from "react"
import { PageHeader } from "@/components/page-header"
import { ContratoTab } from "@/components/config/contrato-tab"
import { ActividadesTab } from "@/components/config/actividades-tab"
import { PeriodosTab } from "@/components/config/periodos-tab"
import { GeneralTab } from "@/components/config/general-tab"

const tabs = [
  { id: "contrato", label: "Contrato" },
  { id: "actividades", label: "Actividades" },
  { id: "periodos", label: "Periodos" },
  { id: "general", label: "General" },
] as const

type TabId = (typeof tabs)[number]["id"]

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState<TabId>("contrato")
  const [version, setVersion] = useState(0)
  const refresh = useCallback(() => setVersion((v) => v + 1), [])
  void version

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Configuracion"
        descripcion="Administra los parametros del sistema y datos del contrato"
      />

      <div className="flex items-center gap-1 overflow-x-auto rounded-lg bg-muted p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === "contrato" && <ContratoTab onSave={refresh} />}
        {activeTab === "actividades" && <ActividadesTab onSave={refresh} />}
        {activeTab === "periodos" && <PeriodosTab onSave={refresh} />}
        {activeTab === "general" && <GeneralTab onSave={refresh} />}
      </div>
    </div>
  )
}
