"use client"

import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts"
import type { Actividad, Aporte } from "@/lib/types"

interface ActivityProgressChartProps {
  actividades: Actividad[]
  aportes: Aporte[]
}

const COLORS = [
  "#3366cc",
  "#4488aa",
  "#336688",
  "#558899",
  "#446677",
  "#557799",
]

export function ActivityProgressChart({
  actividades,
  aportes,
}: ActivityProgressChartProps) {
  const data = actividades.map((act, i) => {
    const actAportes = aportes.filter((a) => a.actividadId === act.id)
    return {
      name: `Act. ${act.numero}`,
      aportes: actAportes.length,
      peso: act.porcentajePeso,
      fill: COLORS[i % COLORS.length],
    }
  })

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={{ stroke: "#e5e7eb" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "13px",
            }}
            formatter={(value: number, name: string) => [
              value,
              name === "aportes" ? "Aportes registrados" : name,
            ]}
          />
          <Bar dataKey="aportes" radius={[4, 4, 0, 0]} barSize={36}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
