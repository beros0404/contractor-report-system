module.exports = [
"[project]/Downloads/contractor-report-system/lib/mock-data.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "actividadesIniciales",
    ()=>actividadesIniciales,
    "aportesIniciales",
    ()=>aportesIniciales,
    "configuracionInicial",
    ()=>configuracionInicial,
    "contratoInicial",
    ()=>contratoInicial,
    "evidenciasIniciales",
    ()=>evidenciasIniciales,
    "informesIniciales",
    ()=>informesIniciales
]);
const contratoInicial = {
    id: "cont-001",
    numero: "CPS-2025-0847",
    entidad: "Secretaria Distrital de Planeacion",
    objeto: "Prestacion de servicios profesionales para apoyar la gestion tecnica y administrativa del proyecto de modernizacion institucional.",
    fechaInicio: "2025-02-01",
    fechaFin: "2025-12-31",
    valor: 72000000,
    supervisorNombre: "Martha Lucia Gonzalez",
    supervisorCargo: "Directora de Planeacion",
    contratistaNombre: "Carlos Andres Rivera",
    contratistaCedula: "1.020.456.789",
    contratistaProfesion: "Ingeniero Industrial"
};
const actividadesIniciales = [
    {
        id: "act-001",
        contratoId: "cont-001",
        numero: 1,
        titulo: "Apoyo en la formulacion de planes estrategicos",
        descripcion: "Elaborar documentos tecnicos de apoyo para la formulacion de planes estrategicos institucionales, incluyendo diagnosticos, matrices de priorizacion y propuestas de mejora continua.",
        porcentajePeso: 20
    },
    {
        id: "act-002",
        contratoId: "cont-001",
        numero: 2,
        titulo: "Seguimiento a indicadores de gestion",
        descripcion: "Realizar el seguimiento periodico a los indicadores de gestion definidos en el plan de accion institucional, elaborando informes de avance y alertas tempranas.",
        porcentajePeso: 15
    },
    {
        id: "act-003",
        contratoId: "cont-001",
        numero: 3,
        titulo: "Elaboracion de informes tecnicos",
        descripcion: "Preparar informes tecnicos mensuales sobre el avance de los proyectos asignados, con analisis de resultados y recomendaciones de mejora.",
        porcentajePeso: 20
    },
    {
        id: "act-004",
        contratoId: "cont-001",
        numero: 4,
        titulo: "Asistencia a reuniones y mesas de trabajo",
        descripcion: "Participar en reuniones de coordinacion, mesas de trabajo interinstitucionales y comites tecnicos relacionados con los proyectos asignados.",
        porcentajePeso: 15
    },
    {
        id: "act-005",
        contratoId: "cont-001",
        numero: 5,
        titulo: "Revision y actualizacion documental",
        descripcion: "Revisar, actualizar y organizar la documentacion tecnica y administrativa relacionada con los procesos a cargo, asegurando el cumplimiento de los procedimientos del sistema de gestion de calidad.",
        porcentajePeso: 15
    },
    {
        id: "act-006",
        contratoId: "cont-001",
        numero: 6,
        titulo: "Apoyo en capacitaciones y transferencia de conocimiento",
        descripcion: "Disenar y participar en jornadas de capacitacion y transferencia de conocimiento dirigidas al equipo de trabajo, sobre temas relacionados con las obligaciones contractuales.",
        porcentajePeso: 15
    }
];
const aportesIniciales = [
    {
        id: "apo-001",
        actividadId: "act-001",
        fecha: "2025-02-05",
        descripcion: "Se elaboro el documento de diagnostico institucional para la Direccion de Planeacion, incluyendo el analisis de brechas y oportunidades de mejora identificadas en el periodo anterior.",
        evidenciaIds: [
            "evi-001"
        ],
        creadoEn: "2025-02-05T10:30:00"
    },
    {
        id: "apo-002",
        actividadId: "act-001",
        fecha: "2025-02-12",
        descripcion: "Se presento la propuesta de matriz de priorizacion de iniciativas estrategicas ante el comite directivo, obteniendo retroalimentacion positiva.",
        evidenciaIds: [
            "evi-002"
        ],
        creadoEn: "2025-02-12T14:00:00"
    },
    {
        id: "apo-003",
        actividadId: "act-002",
        fecha: "2025-02-07",
        descripcion: "Se realizo la recoleccion de datos de los 12 indicadores de gestion correspondientes al mes de enero, consolidando la informacion en la herramienta de seguimiento.",
        evidenciaIds: [
            "evi-003"
        ],
        creadoEn: "2025-02-07T09:15:00"
    },
    {
        id: "apo-004",
        actividadId: "act-002",
        fecha: "2025-02-14",
        descripcion: "Se genero el informe de alertas tempranas para los indicadores que presentan desviacion superior al 10% respecto a las metas establecidas.",
        evidenciaIds: [],
        creadoEn: "2025-02-14T16:45:00"
    },
    {
        id: "apo-005",
        actividadId: "act-003",
        fecha: "2025-02-20",
        descripcion: "Se elaboro el informe tecnico mensual del proyecto de modernizacion correspondiente al mes de febrero, con el analisis de avance del 78% en las metas programadas.",
        evidenciaIds: [
            "evi-004",
            "evi-005"
        ],
        creadoEn: "2025-02-20T11:00:00"
    },
    {
        id: "apo-006",
        actividadId: "act-004",
        fecha: "2025-02-03",
        descripcion: "Se asistio a la reunion de coordinacion con la Secretaria General para articular el cronograma de actividades del primer trimestre.",
        evidenciaIds: [
            "evi-006"
        ],
        creadoEn: "2025-02-03T08:30:00"
    },
    {
        id: "apo-007",
        actividadId: "act-004",
        fecha: "2025-02-10",
        descripcion: "Se participo en la mesa de trabajo interinstitucional sobre gobierno digital con representantes de 5 entidades distritales.",
        evidenciaIds: [
            "evi-007"
        ],
        creadoEn: "2025-02-10T10:00:00"
    },
    {
        id: "apo-008",
        actividadId: "act-004",
        fecha: "2025-02-17",
        descripcion: "Se asistio al comite tecnico de seguimiento del proyecto de transformacion digital, presentando los avances del componente a cargo.",
        evidenciaIds: [],
        creadoEn: "2025-02-17T14:30:00"
    },
    {
        id: "apo-009",
        actividadId: "act-005",
        fecha: "2025-02-06",
        descripcion: "Se inicio la revision del Manual de Procesos y Procedimientos del area, identificando 8 documentos que requieren actualizacion.",
        evidenciaIds: [
            "evi-008"
        ],
        creadoEn: "2025-02-06T09:00:00"
    },
    {
        id: "apo-010",
        actividadId: "act-005",
        fecha: "2025-02-18",
        descripcion: "Se actualizo el procedimiento de gestion documental y se cargo en el sistema de calidad institucional para revision del lider de proceso.",
        evidenciaIds: [
            "evi-009"
        ],
        creadoEn: "2025-02-18T15:00:00"
    },
    {
        id: "apo-011",
        actividadId: "act-006",
        fecha: "2025-02-11",
        descripcion: "Se diseno el material de capacitacion sobre la herramienta de seguimiento a indicadores, preparando presentacion y guia de usuario.",
        evidenciaIds: [
            "evi-010"
        ],
        creadoEn: "2025-02-11T10:30:00"
    },
    {
        id: "apo-012",
        actividadId: "act-006",
        fecha: "2025-02-19",
        descripcion: "Se realizo la jornada de capacitacion dirigida a 15 funcionarios del area sobre el uso de la herramienta de seguimiento a indicadores.",
        evidenciaIds: [
            "evi-011",
            "evi-012"
        ],
        creadoEn: "2025-02-19T09:00:00"
    }
];
const evidenciasIniciales = [
    {
        id: "evi-001",
        actividadId: "act-001",
        nombre: "Diagnostico_Institucional_2025.pdf",
        tipo: "pdf",
        tamaño: 2450000,
        url: "",
        creadoEn: "2025-02-05T10:30:00"
    },
    {
        id: "evi-002",
        actividadId: "act-001",
        nombre: "Matriz_Priorizacion_v1.pdf",
        tipo: "pdf",
        tamaño: 1830000,
        url: "",
        creadoEn: "2025-02-12T14:00:00"
    },
    {
        id: "evi-003",
        actividadId: "act-002",
        nombre: "Consolidado_Indicadores_Enero.pdf",
        tipo: "pdf",
        tamaño: 980000,
        url: "",
        creadoEn: "2025-02-07T09:15:00"
    },
    {
        id: "evi-004",
        actividadId: "act-003",
        nombre: "Informe_Tecnico_Febrero.pdf",
        tipo: "pdf",
        tamaño: 3200000,
        url: "",
        creadoEn: "2025-02-20T11:00:00"
    },
    {
        id: "evi-005",
        actividadId: "act-003",
        nombre: "Grafico_Avance_Metas.png",
        tipo: "imagen",
        tamaño: 450000,
        url: "",
        creadoEn: "2025-02-20T11:05:00"
    },
    {
        id: "evi-006",
        actividadId: "act-004",
        nombre: "Acta_Reunion_SecretariaGeneral.pdf",
        tipo: "pdf",
        tamaño: 780000,
        url: "",
        creadoEn: "2025-02-03T08:30:00"
    },
    {
        id: "evi-007",
        actividadId: "act-004",
        nombre: "Listado_Asistencia_MesaGobiernoDigital.pdf",
        tipo: "pdf",
        tamaño: 520000,
        url: "",
        creadoEn: "2025-02-10T10:00:00"
    },
    {
        id: "evi-008",
        actividadId: "act-005",
        nombre: "Matriz_Documentos_Pendientes.pdf",
        tipo: "pdf",
        tamaño: 340000,
        url: "",
        creadoEn: "2025-02-06T09:00:00"
    },
    {
        id: "evi-009",
        actividadId: "act-005",
        nombre: "Procedimiento_GestionDocumental_v2.pdf",
        tipo: "documento",
        tamaño: 1560000,
        url: "",
        creadoEn: "2025-02-18T15:00:00"
    },
    {
        id: "evi-010",
        actividadId: "act-006",
        nombre: "Presentacion_Capacitacion_Indicadores.pdf",
        tipo: "pdf",
        tamaño: 4200000,
        url: "",
        creadoEn: "2025-02-11T10:30:00"
    },
    {
        id: "evi-011",
        actividadId: "act-006",
        nombre: "Foto_Capacitacion_01.jpg",
        tipo: "imagen",
        tamaño: 890000,
        url: "",
        creadoEn: "2025-02-19T09:00:00"
    },
    {
        id: "evi-012",
        actividadId: "act-006",
        nombre: "Listado_Asistencia_Capacitacion.pdf",
        tipo: "pdf",
        tamaño: 230000,
        url: "",
        creadoEn: "2025-02-19T09:10:00"
    }
];
const informesIniciales = [
    {
        id: "inf-001",
        contratoId: "cont-001",
        periodo: "Febrero 2025",
        fechaInicio: "2025-02-01",
        fechaFin: "2025-02-28",
        fechaGeneracion: "2025-02-28T10:00:00",
        estado: "enviado",
        plantilla: "clasica"
    }
];
const configuracionInicial = {
    contratoId: "cont-001",
    frecuenciaInforme: "mensual",
    diaGeneracion: 28,
    periodoActualInicio: "2025-03-01",
    periodoActualFin: "2025-03-31",
    plantillaSeleccionada: "clasica",
    usuario: {
        nombre: "Carlos Andres Rivera",
        email: "carlos.rivera@correo.com",
        notificaciones: true
    }
};
}),
"[project]/Downloads/contractor-report-system/lib/store.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addActividad",
    ()=>addActividad,
    "addAporte",
    ()=>addAporte,
    "addEvidencia",
    ()=>addEvidencia,
    "addInforme",
    ()=>addInforme,
    "deleteActividad",
    ()=>deleteActividad,
    "deleteAporte",
    ()=>deleteAporte,
    "deleteEvidencia",
    ()=>deleteEvidencia,
    "getActividad",
    ()=>getActividad,
    "getActividades",
    ()=>getActividades,
    "getAportes",
    ()=>getAportes,
    "getAportesByActividad",
    ()=>getAportesByActividad,
    "getConfiguracion",
    ()=>getConfiguracion,
    "getContrato",
    ()=>getContrato,
    "getEvidencias",
    ()=>getEvidencias,
    "getEvidenciasByActividad",
    ()=>getEvidenciasByActividad,
    "getInforme",
    ()=>getInforme,
    "getInformes",
    ()=>getInformes,
    "initializeStore",
    ()=>initializeStore,
    "resetStore",
    ()=>resetStore,
    "updateActividad",
    ()=>updateActividad,
    "updateAporte",
    ()=>updateAporte,
    "updateConfiguracion",
    ()=>updateConfiguracion,
    "updateContrato",
    ()=>updateContrato,
    "updateInforme",
    ()=>updateInforme
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/contractor-report-system/lib/mock-data.ts [app-ssr] (ecmascript)");
;
const KEYS = {
    contrato: "cs_contrato",
    actividades: "cs_actividades",
    aportes: "cs_aportes",
    evidencias: "cs_evidencias",
    informes: "cs_informes",
    configuracion: "cs_configuracion",
    initialized: "cs_initialized"
};
function get(key, fallback) {
    if ("TURBOPACK compile-time truthy", 1) return fallback;
    //TURBOPACK unreachable
    ;
}
function set(key, value) {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
}
function initializeStore() {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
}
function getContrato() {
    return get(KEYS.contrato, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["contratoInicial"]);
}
function updateContrato(data) {
    const current = getContrato();
    const updated = {
        ...current,
        ...data
    };
    set(KEYS.contrato, updated);
    return updated;
}
function getActividades() {
    return get(KEYS.actividades, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["actividadesIniciales"]);
}
function getActividad(id) {
    return getActividades().find((a)=>a.id === id);
}
function addActividad(data) {
    const items = getActividades();
    const nuevo = {
        ...data,
        id: `act-${Date.now()}`
    };
    set(KEYS.actividades, [
        ...items,
        nuevo
    ]);
    return nuevo;
}
function updateActividad(id, data) {
    const items = getActividades();
    const idx = items.findIndex((a)=>a.id === id);
    if (idx === -1) return undefined;
    items[idx] = {
        ...items[idx],
        ...data
    };
    set(KEYS.actividades, items);
    return items[idx];
}
function deleteActividad(id) {
    set(KEYS.actividades, getActividades().filter((a)=>a.id !== id));
}
function getAportes() {
    return get(KEYS.aportes, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["aportesIniciales"]);
}
function getAportesByActividad(actividadId) {
    return getAportes().filter((a)=>a.actividadId === actividadId);
}
function addAporte(data) {
    const items = getAportes();
    const nuevo = {
        ...data,
        id: `apo-${Date.now()}`,
        creadoEn: new Date().toISOString()
    };
    set(KEYS.aportes, [
        ...items,
        nuevo
    ]);
    return nuevo;
}
function updateAporte(id, data) {
    const items = getAportes();
    const idx = items.findIndex((a)=>a.id === id);
    if (idx === -1) return undefined;
    items[idx] = {
        ...items[idx],
        ...data
    };
    set(KEYS.aportes, items);
    return items[idx];
}
function deleteAporte(id) {
    set(KEYS.aportes, getAportes().filter((a)=>a.id !== id));
}
function getEvidencias() {
    return get(KEYS.evidencias, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["evidenciasIniciales"]);
}
function getEvidenciasByActividad(actividadId) {
    return getEvidencias().filter((e)=>e.actividadId === actividadId);
}
function addEvidencia(data) {
    const items = getEvidencias();
    const nuevo = {
        ...data,
        id: `evi-${Date.now()}`,
        creadoEn: new Date().toISOString()
    };
    set(KEYS.evidencias, [
        ...items,
        nuevo
    ]);
    return nuevo;
}
function deleteEvidencia(id) {
    set(KEYS.evidencias, getEvidencias().filter((e)=>e.id !== id));
}
function getInformes() {
    return get(KEYS.informes, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["informesIniciales"]);
}
function getInforme(id) {
    return getInformes().find((i)=>i.id === id);
}
function addInforme(data) {
    const items = getInformes();
    const nuevo = {
        ...data,
        id: `inf-${Date.now()}`,
        fechaGeneracion: new Date().toISOString()
    };
    set(KEYS.informes, [
        ...items,
        nuevo
    ]);
    return nuevo;
}
function updateInforme(id, data) {
    const items = getInformes();
    const idx = items.findIndex((i)=>i.id === id);
    if (idx === -1) return undefined;
    items[idx] = {
        ...items[idx],
        ...data
    };
    set(KEYS.informes, items);
    return items[idx];
}
function getConfiguracion() {
    return get(KEYS.configuracion, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["configuracionInicial"]);
}
function updateConfiguracion(data) {
    const current = getConfiguracion();
    const updated = {
        ...current,
        ...data
    };
    set(KEYS.configuracion, updated);
    return updated;
}
function resetStore() {
    Object.values(KEYS).forEach((key)=>localStorage.removeItem(key));
    initializeStore();
}
}),
"[project]/Downloads/contractor-report-system/components/store-provider.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StoreProvider",
    ()=>StoreProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/contractor-report-system/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/contractor-report-system/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/contractor-report-system/lib/store.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
function StoreProvider({ children }) {
    const [ready, setReady] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["initializeStore"])();
        setReady(true);
    }, []);
    if (!ready) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex h-screen items-center justify-center bg-background",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col items-center gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
                    }, void 0, false, {
                        fileName: "[project]/Downloads/contractor-report-system/components/store-provider.tsx",
                        lineNumber: 18,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-muted-foreground",
                        children: "Cargando..."
                    }, void 0, false, {
                        fileName: "[project]/Downloads/contractor-report-system/components/store-provider.tsx",
                        lineNumber: 19,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Downloads/contractor-report-system/components/store-provider.tsx",
                lineNumber: 17,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/Downloads/contractor-report-system/components/store-provider.tsx",
            lineNumber: 16,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: children
    }, void 0, false);
}
}),
"[project]/Downloads/contractor-report-system/lib/utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/contractor-report-system/node_modules/clsx/dist/clsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/contractor-report-system/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-ssr] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
}),
"[project]/Downloads/contractor-report-system/components/app-sidebar.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppSidebar",
    ()=>AppSidebar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/contractor-report-system/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/contractor-report-system/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/contractor-report-system/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__ = __turbopack_context__.i("[project]/Downloads/contractor-report-system/node_modules/lucide-react/dist/esm/icons/layout-dashboard.js [app-ssr] (ecmascript) <export default as LayoutDashboard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clipboard$2d$list$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ClipboardList$3e$__ = __turbopack_context__.i("[project]/Downloads/contractor-report-system/node_modules/lucide-react/dist/esm/icons/clipboard-list.js [app-ssr] (ecmascript) <export default as ClipboardList>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/Downloads/contractor-report-system/node_modules/lucide-react/dist/esm/icons/file-text.js [app-ssr] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/Downloads/contractor-report-system/node_modules/lucide-react/dist/esm/icons/settings.js [app-ssr] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__ = __turbopack_context__.i("[project]/Downloads/contractor-report-system/node_modules/lucide-react/dist/esm/icons/building-2.js [app-ssr] (ecmascript) <export default as Building2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/Downloads/contractor-report-system/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-ssr] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/Downloads/contractor-report-system/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-ssr] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PlusCircle$3e$__ = __turbopack_context__.i("[project]/Downloads/contractor-report-system/node_modules/lucide-react/dist/esm/icons/circle-plus.js [app-ssr] (ecmascript) <export default as PlusCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/contractor-report-system/lib/utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/contractor-report-system/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
const navItems = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__["LayoutDashboard"]
    },
    {
        label: "Actividades",
        href: "/actividades",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clipboard$2d$list$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ClipboardList$3e$__["ClipboardList"]
    },
    {
        label: "Informes",
        href: "/informes",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"]
    },
    {
        label: "Configuracion",
        href: "/configuracion",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"]
    }
];
function AppSidebar() {
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const [collapsed, setCollapsed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex h-screen flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300", collapsed ? "w-16" : "w-64"),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex h-16 items-center gap-3 border-b border-sidebar-border px-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__["Building2"], {
                            className: "h-4 w-4 text-sidebar-primary-foreground"
                        }, void 0, false, {
                            fileName: "[project]/Downloads/contractor-report-system/components/app-sidebar.tsx",
                            lineNumber: 54,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Downloads/contractor-report-system/components/app-sidebar.tsx",
                        lineNumber: 53,
                        columnNumber: 9
                    }, this),
                    !collapsed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col overflow-hidden",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "truncate text-sm font-semibold tracking-tight",
                                children: "ContraSeguimiento"
                            }, void 0, false, {
                                fileName: "[project]/Downloads/contractor-report-system/components/app-sidebar.tsx",
                                lineNumber: 58,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "truncate text-xs text-sidebar-foreground/60",
                                children: "Seguimiento Contractual"
                            }, void 0, false, {
                                fileName: "[project]/Downloads/contractor-report-system/components/app-sidebar.tsx",
                                lineNumber: 61,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Downloads/contractor-report-system/components/app-sidebar.tsx",
                        lineNumber: 57,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Downloads/contractor-report-system/components/app-sidebar.tsx",
                lineNumber: 52,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-3 pt-4 pb-2",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    href: "/actividades/nuevo-aporte",
                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex items-center gap-2 rounded-lg bg-sidebar-primary px-3 py-2.5 text-sm font-semibold text-sidebar-primary-foreground transition-colors hover:bg-sidebar-primary/90", collapsed && "justify-center px-2"),
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PlusCircle$3e$__["PlusCircle"], {
                            className: "h-4 w-4 shrink-0"
                        }, void 0, false, {
                            fileName: "[project]/Downloads/contractor-report-system/components/app-sidebar.tsx",
                            lineNumber: 76,
                            columnNumber: 11
                        }, this),
                        !collapsed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: "Registrar Aporte"
                        }, void 0, false, {
                            fileName: "[project]/Downloads/contractor-report-system/components/app-sidebar.tsx",
                            lineNumber: 77,
                            columnNumber: 26
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Downloads/contractor-report-system/components/app-sidebar.tsx",
                    lineNumber: 69,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Downloads/contractor-report-system/components/app-sidebar.tsx",
                lineNumber: 68,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                className: "flex-1 px-2 py-2",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                    className: "flex flex-col gap-1",
                    children: navItems.map((item)=>{
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: item.href,
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors", isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(item.icon, {
                                        className: "h-4.5 w-4.5 shrink-0"
                                    }, void 0, false, {
                                        fileName: "[project]/Downloads/contractor-report-system/components/app-sidebar.tsx",
                                        lineNumber: 97,
                                        columnNumber: 19
                                    }, this),
                                    !collapsed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "truncate",
                                        children: item.label
                                    }, void 0, false, {
                                        fileName: "[project]/Downloads/contractor-report-system/components/app-sidebar.tsx",
                                        lineNumber: 98,
                                        columnNumber: 34
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Downloads/contractor-report-system/components/app-sidebar.tsx",
                                lineNumber: 88,
                                columnNumber: 17
                            }, this)
                        }, item.href, false, {
                            fileName: "[project]/Downloads/contractor-report-system/components/app-sidebar.tsx",
                            lineNumber: 87,
                            columnNumber: 15
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/Downloads/contractor-report-system/components/app-sidebar.tsx",
                    lineNumber: 82,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Downloads/contractor-report-system/components/app-sidebar.tsx",
                lineNumber: 81,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "border-t border-sidebar-border p-2",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>setCollapsed(!collapsed),
                    className: "flex w-full items-center justify-center rounded-md p-2 text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                    "aria-label": collapsed ? "Expandir menu" : "Colapsar menu",
                    children: collapsed ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                        className: "h-4 w-4"
                    }, void 0, false, {
                        fileName: "[project]/Downloads/contractor-report-system/components/app-sidebar.tsx",
                        lineNumber: 113,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                        className: "h-4 w-4"
                    }, void 0, false, {
                        fileName: "[project]/Downloads/contractor-report-system/components/app-sidebar.tsx",
                        lineNumber: 115,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/Downloads/contractor-report-system/components/app-sidebar.tsx",
                    lineNumber: 107,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Downloads/contractor-report-system/components/app-sidebar.tsx",
                lineNumber: 106,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Downloads/contractor-report-system/components/app-sidebar.tsx",
        lineNumber: 46,
        columnNumber: 5
    }, this);
}
}),
"[project]/Downloads/contractor-report-system/components/app-shell.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppShell",
    ()=>AppShell
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/contractor-report-system/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/contractor-report-system/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__ = __turbopack_context__.i("[project]/Downloads/contractor-report-system/node_modules/lucide-react/dist/esm/icons/menu.js [app-ssr] (ecmascript) <export default as Menu>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$components$2f$app$2d$sidebar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/contractor-report-system/components/app-sidebar.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/contractor-report-system/lib/utils.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
function AppShell({ children }) {
    const [mobileOpen, setMobileOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex h-screen overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "hidden md:flex",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$components$2f$app$2d$sidebar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AppSidebar"], {}, void 0, false, {
                    fileName: "[project]/Downloads/contractor-report-system/components/app-shell.tsx",
                    lineNumber: 15,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Downloads/contractor-report-system/components/app-shell.tsx",
                lineNumber: 14,
                columnNumber: 7
            }, this),
            mobileOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-40 md:hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 bg-foreground/20",
                        onClick: ()=>setMobileOpen(false),
                        "aria-hidden": "true"
                    }, void 0, false, {
                        fileName: "[project]/Downloads/contractor-report-system/components/app-shell.tsx",
                        lineNumber: 20,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative z-50 h-full w-64",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$components$2f$app$2d$sidebar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AppSidebar"], {}, void 0, false, {
                            fileName: "[project]/Downloads/contractor-report-system/components/app-shell.tsx",
                            lineNumber: 26,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Downloads/contractor-report-system/components/app-shell.tsx",
                        lineNumber: 25,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Downloads/contractor-report-system/components/app-shell.tsx",
                lineNumber: 19,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "flex flex-1 flex-col overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex h-14 items-center gap-3 border-b border-border bg-card px-4 md:hidden",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setMobileOpen(true),
                                className: "flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                                "aria-label": "Abrir menu",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__["Menu"], {
                                    className: "h-5 w-5"
                                }, void 0, false, {
                                    fileName: "[project]/Downloads/contractor-report-system/components/app-shell.tsx",
                                    lineNumber: 38,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Downloads/contractor-report-system/components/app-shell.tsx",
                                lineNumber: 33,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-sm font-semibold text-foreground",
                                children: "ContraSeguimiento"
                            }, void 0, false, {
                                fileName: "[project]/Downloads/contractor-report-system/components/app-shell.tsx",
                                lineNumber: 40,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Downloads/contractor-report-system/components/app-shell.tsx",
                        lineNumber: 32,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex-1 overflow-y-auto"),
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$contractor$2d$report$2d$system$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8",
                            children: children
                        }, void 0, false, {
                            fileName: "[project]/Downloads/contractor-report-system/components/app-shell.tsx",
                            lineNumber: 45,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Downloads/contractor-report-system/components/app-shell.tsx",
                        lineNumber: 44,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Downloads/contractor-report-system/components/app-shell.tsx",
                lineNumber: 31,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Downloads/contractor-report-system/components/app-shell.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=Downloads_contractor-report-system_b1700f2a._.js.map