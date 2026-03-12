import { Router } from 'express';
import { Informe } from './model';
import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const router = Router();

// Helper de Handlebars para formatear fechas
Handlebars.registerHelper('formatDate', function(date: string, formatStr: string) {
  if (!date) return 'Fecha no disponible';
  try {
    return format(new Date(date), formatStr, { locale: es });
  } catch {
    return 'Fecha inválida';
  }
});

Handlebars.registerHelper('formatCurrency', function(valor: number) {
  if (!valor) return '$0';
  return new Intl.NumberFormat('es-CO', { 
    style: 'currency', 
    currency: 'COP',
    minimumFractionDigits: 0 
  }).format(valor);
});

// Helper para obtener el día de una fecha
Handlebars.registerHelper('getDay', function(date: string) {
  if (!date) return '__';
  try {
    return format(new Date(date), "d");
  } catch {
    return '__';
  }
});

// Helper para obtener el mes y año de una fecha
Handlebars.registerHelper('getMonthYear', function(date: string) {
  if (!date) return '__________';
  try {
    return format(new Date(date), "MMMM 'de' yyyy", { locale: es });
  } catch {
    return '__________';
  }
});

// Plantilla HTML del informe - IGUAL A ReportePreview
const templateHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Informe de Ejecución</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      color: #333;
    }
    h1 {
      text-align: center;
      color: #2c3e50;
      border-bottom: 2px solid #3498db;
      padding-bottom: 10px;
    }
    h2 {
      color: #34495e;
      margin-top: 30px;
      border-bottom: 1px solid #bdc3c7;
      padding-bottom: 5px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin: 20px 0;
    }
    .info-item {
      margin-bottom: 10px;
    }
    .info-label {
      font-weight: bold;
      color: #7f8c8d;
      font-size: 0.9em;
    }
    .info-value {
      font-size: 1.1em;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th {
      background-color: #3498db;
      color: white;
      padding: 10px;
      text-align: left;
    }
    td {
      border: 1px solid #ddd;
      padding: 10px;
      vertical-align: top;
    }
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    .actividad-titulo {
      font-weight: bold;
      margin-bottom: 5px;
    }
    .actividad-descripcion {
      font-size: 0.9em;
      color: #666;
    }
    .aporte-item {
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 1px dashed #ddd;
    }
    .aporte-item:last-child {
      border-bottom: none;
    }
    .aporte-fecha {
      font-size: 0.8em;
      color: #7f8c8d;
    }
    .evidencia-item {
      margin-bottom: 3px;
      font-size: 0.9em;
    }
    .firma {
      margin-top: 50px;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 40px;
      text-align: center;
    }
    .firma-line {
      margin-top: 10px;
      border-top: 1px solid #000;
      width: 100%;
    }
    .firma-imagen {
      max-height: 60px;
      object-fit: contain;
      margin-bottom: 10px;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      font-size: 0.9em;
      color: #7f8c8d;
    }
    .sin-datos {
      text-align: center;
      color: #999;
      font-style: italic;
      padding: 20px;
    }
  </style>
</head>
<body>
  <h1>{{titulo}}</h1>
  <p style="text-align: center;">OFICINA UNIDAD ESTRATEGICA DE NEGOCIOS ITM</p>

  <h2>Información del Contrato</h2>
  <div class="info-grid">
    <div class="info-item">
      <div class="info-label">NOMBRE DEL CONTRATISTA</div>
      <div class="info-value">{{contrato.contratistaNombre}}</div>
    </div>
    <div class="info-item">
      <div class="info-label">NÚMERO DEL CONTRATO</div>
      <div class="info-value">{{contrato.numero}}</div>
    </div>
    <div class="info-item">
      <div class="info-label">FECHA DE INICIO</div>
      <div class="info-value">{{formatDate contrato.fechaInicio "d 'de' MMMM 'de' yyyy"}}</div>
    </div>
    <div class="info-item">
      <div class="info-label">FECHA DE FIN</div>
      <div class="info-value">{{formatDate contrato.fechaFin "d 'de' MMMM 'de' yyyy"}}</div>
    </div>
    <div class="info-item" style="grid-column: span 2;">
      <div class="info-label">OBJETO</div>
      <div class="info-value">{{contrato.objeto}}</div>
    </div>
    <div class="info-item">
      <div class="info-label">VALOR DEL CONTRATO</div>
      <div class="info-value">{{formatCurrency contrato.valor}}</div>
    </div>
    <div class="info-item">
      <div class="info-label">SUPERVISOR ITM</div>
      <div class="info-value">{{contrato.supervisorNombre}}</div>
    </div>
  </div>

  <h2>PERIODO EJECUTADO</h2>
  <p>Del {{formatDate periodo.fechaInicio "d 'de' MMMM 'de' yyyy"}} al {{formatDate periodo.fechaFin "d 'de' MMMM 'de' yyyy"}}</p>

  <h2>EJECUCIÓN DE ACTIVIDADES</h2>
  
  {{#if actividades.length}}
  <table>
    <thead>
      <tr>
        <th>Actividad</th>
        <th>Resumen de Aportes</th>
        <th>Evidencias</th>
      </tr>
    </thead>
    <tbody>
      {{#each actividades}}
      <tr>
        <td class="align-top">
          <p class="actividad-descripcion">{{this.descripcion}}</p>
        </td>
        <td class="align-top">
          {{#if this.resumenAportes}}
            <p>{{this.resumenAportes}}</p>
          {{else}}
            <em class="sin-datos">No hay resumen disponible</em>
          {{/if}}
        </td>
        <td class="align-top">
          {{#if this.evidencias.length}}
            <ul style="margin: 0; padding-left: 20px;">
              {{#each this.evidencias}}
              <li class="evidencia-item">{{this.nombre}}</li>
              {{/each}}
            </ul>
          {{else}}
            <em class="sin-datos">Sin evidencias</em>
          {{/if}}
        </td>
      </tr>
      {{/each}}
    </tbody>
  </table>
  {{else}}
  <p class="sin-datos">No hay actividades registradas en este período</p>
  {{/if}}

  <h2>FIRMAS</h2>
  <div class="firma">
    <div>
      {{#if firmas.contratista.firmaDigital}}
        <img src="{{firmas.contratista.firmaDigital}}" class="firma-imagen" alt="Firma del contratista" />
      {{else}}
        <div class="firma-line"></div>
      {{/if}}
      <p><strong>{{contrato.contratistaNombre}}</strong></p>
      <p>C.C. {{contrato.contratistaCedula}}</p>
      <p style="font-size: 0.9em; color: #666;">Firma del Contratista</p>
      {{#if firmas.contratista.fecha}}
        <p style="font-size: 0.8em;">{{formatDate firmas.contratista.fecha "d 'de' MMMM 'de' yyyy"}}</p>
      {{/if}}
    </div>
    <div>
      {{#if firmas.supervisor.firmaDigital}}
        <img src="{{firmas.supervisor.firmaDigital}}" class="firma-imagen" alt="Firma del supervisor" />
      {{else}}
        <div class="firma-line"></div>
      {{/if}}
      <p><strong>{{contrato.supervisorNombre}}</strong></p>
      <p>{{contrato.supervisorCargo}}</p>
      <p style="font-size: 0.9em; color: #666;">Firma del Supervisor</p>
      {{#if firmas.supervisor.fecha}}
        <p style="font-size: 0.8em;">{{formatDate firmas.supervisor.fecha "d 'de' MMMM 'de' yyyy"}}</p>
      {{/if}}
    </div>
  </div>

  <div class="footer">
    <p>Para constancia se firma en {{contrato.lugarFirma}} a los {{getDay periodo.fechaFin}} días del mes de {{getMonthYear periodo.fechaFin}}.</p>
  </div>
</body>
</html>
`;

// Compilar la plantilla
const template = Handlebars.compile(templateHTML);

// GET /api/informes/:id/pdf
router.get('/:id/pdf', async (req, res) => {
  try {
    const { id } = req.params;
    const { usuarioId } = req.query;
    
    console.log(`🔍 GET /api/informes/${id}/pdf - usuarioId:`, usuarioId);
    
    if (!usuarioId) {
      return res.status(400).json({ error: 'usuarioId requerido' });
    }

    // Obtener el informe
    const informe = await Informe.findOne({ 
      id: id,
      usuarioId: usuarioId.toString() 
    });
    
    if (!informe) {
      return res.status(404).json({ error: 'Informe no encontrado' });
    }

    if (!informe.contenido) {
      return res.status(400).json({ error: 'El informe no tiene contenido' });
    }

    // Preparar datos para la plantilla - MISMA ESTRUCTURA QUE ReportePreview
    const data = {
      titulo: informe.tipo === 'mensual' ? 'INFORME DE EJECUCIÓN MENSUAL' : 'INFORME DE EJECUCIÓN PARCIAL',
      contrato: {
        contratistaNombre: informe.contenido.contrato?.contratistaNombre || 'No especificado',
        numero: informe.contenido.contrato?.numero || 'No especificado',
        fechaInicio: informe.contenido.contrato?.fechaInicio || new Date().toISOString(),
        fechaFin: informe.contenido.contrato?.fechaFin || new Date().toISOString(),
        objeto: informe.contenido.contrato?.objeto || 'No especificado',
        valor: informe.contenido.contrato?.valor || 0,
        supervisorNombre: informe.contenido.contrato?.supervisorNombre || 'No especificado',
        contratistaCedula: informe.contenido.contrato?.contratistaCedula || 'No especificada',
        supervisorCargo: informe.contenido.contrato?.supervisorCargo || 'No especificado',
        lugarFirma: informe.contenido.contrato?.lugarFirma || 'Rionegro'
      },
      periodo: {
        fechaInicio: informe.periodo?.fechaInicio || new Date().toISOString(),
        fechaFin: informe.periodo?.fechaFin || new Date().toISOString()
      },
      actividades: (informe.contenido.actividades || []).map((act: any) => ({
        descripcion: act.descripcion || '',
        resumenAportes: act.resumenAportes || '',
        evidencias: (act.evidencias || []).map((ev: any) => ({
          nombre: ev.nombre || ev.archivo?.nombre || 'Evidencia'
        }))
      })),
      firmas: {
        contratista: {
          firmaDigital: informe.contenido.firmas?.contratista?.firmaDigital || null,
          fecha: informe.contenido.firmas?.contratista?.fecha || null
        },
        supervisor: {
          firmaDigital: informe.contenido.firmas?.supervisor?.firmaDigital || null,
          fecha: informe.contenido.firmas?.supervisor?.fecha || null
        }
      }
    };

    console.log('📊 Datos para PDF - actividades:', data.actividades.length);

    // Generar HTML
    const html = template(data);

    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Generar PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '40px',
        bottom: '40px',
        left: '40px',
        right: '40px'
      }
    });

    await browser.close();

    const año = informe.periodo?.año || new Date().getFullYear();
    const mes = informe.periodo?.mes || new Date().getMonth() + 1;
    const mesStr = mes.toString().padStart(2, '0');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=informe-${año}-${mesStr}.pdf`);
    res.send(pdf);

  } catch (error) {
    console.error('❌ Error generando PDF:', error);
    res.status(500).json({ error: 'Error al generar PDF' });
  }
});

export default router;