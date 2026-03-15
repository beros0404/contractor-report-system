"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const model_1 = require("../api/informes/model");
dotenv_1.default.config();
const informesIniciales = [{
        id: "INF-2025-001",
        tipo: "mensual",
        encabezado: {
            titulo: "INFORME DE EJECUCIÓN MENSUAL",
            oficina: "OFICINA UNIDAD ESTRATEGICA DE NEGOCIOS ITM"
        },
        contratista: {
            nombreCompleto: "YEIZON FABIAN SANCHEZ MARIN",
            identificacion: "1036949896"
        },
        contrato: {
            numero: "12080",
            fechaInicio: new Date("2025-03-19"),
            plazo: "NUEVE (9) MESES Y TRECE (13) DÍAS",
            objeto: "PRESTACIÓN DE SERVICIOS, COMO CONTRATISTA INDEPENDIENTE, SIN VINCULO LABORAL POR SU PROPIA CUENTA Y RIESGO, EN LA GESTIÓN DE ESPECIALISTA DE APOYO EN EJECUCIÓN DEL CONTRATO INTERADMINISTRATIVO N° 10.12.00-22.07-008-2025, CELEBRADO ENTRE EL MUNICIPIO DE RIONEGRO Y EL ITM.",
            valor: "$53.49.6433",
            valorNumerico: 53496433,
            supervisor: "GERMAN ALBERTO CARDONA QUINTERO"
        },
        periodoEjecutado: {
            fechaInicio: new Date("2025-01-11"),
            fechaFin: new Date("2025-11-30"),
            descripcion: "Del 11/01/2025 al 30 de noviembre de 2025",
            mes: "noviembre",
            año: 2025
        },
        valorPeriodo: {
            texto: "CINCO MILLONES SEISCIENTOS SETENTA Y UN MIL PESOS M.L",
            numerico: 5671000,
            moneda: "COP"
        },
        obligacionesEspecificas: [{
                numero: 1,
                descripcion: "Realizar acompañamiento empresarial y asesorías en innovación a emprendedores, grupos de investigación y/o empresarios en el marco de la Ruta de Innovación.",
                ejecucion: [{
                        subnumero: "1.1",
                        descripcion: "Se realizó mentoría personalizada a emprendedores dentro de la Estrategia Nodo 360°",
                        detalles: "Tatiana Giraldo: Estandarización de las líneas de negocio. Cuarto de Maletas: Presupuestos",
                        fecha: new Date("2025-11-15")
                    }]
            }],
        ejecucion: [{
                obligacionNumero: 1,
                items: [{
                        numero: "1.1",
                        descripcion: "Mentoría personalizada a emprendedores",
                        detalles: [{
                                beneficiario: "Tatiana Giraldo",
                                accion: "Estandarización de las líneas de negocio",
                                fecha: new Date("2025-11-15")
                            }, {
                                beneficiario: "Cuarto de Maletas",
                                accion: "Presupuestos",
                                fecha: new Date("2025-11-16")
                            }]
                    }]
            }],
        firma: {
            lugar: "Rionegro",
            fecha: new Date("2025-11-30"),
            fechaTexto: "30 días del mes de noviembre del año 2025",
            contratista: {
                nombre: "YÉIZON FABIAN SANCHEZ MARIN",
                identificacion: "1036949896"
            }
        }
    }];
async function seedInformes() {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado a MongoDB');
        await model_1.Informe.deleteMany({});
        console.log('🗑️ Colección de informes limpiada');
        await model_1.Informe.insertMany(informesIniciales);
        console.log(`✅ ${informesIniciales.length} informes insertados`);
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}
seedInformes();
