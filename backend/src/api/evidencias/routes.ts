import { Router } from 'express';
import { Evidencia } from './model';
import multer from 'multer';
import { google } from 'googleapis';
import { Usuario } from '../usuarios/model';
import archiver from 'archiver';
import { Readable } from 'stream';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

async function getDriveClient(usuarioId: string) {
  const usuario = await Usuario.findOne({ supabaseId: usuarioId });
  
  if (!usuario?.googleTokens?.access_token) {
    return null; 
  }
  
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  
  oauth2Client.setCredentials(usuario.googleTokens);
  
  if (usuario.googleTokens.expiry_date && 
      usuario.googleTokens.expiry_date < Date.now()) {
    try {
      oauth2Client.setCredentials({
        refresh_token: usuario.googleTokens.refresh_token
      });
      const { credentials } = await oauth2Client.refreshAccessToken();
      await Usuario.findOneAndUpdate(
        { supabaseId: usuarioId },
        { googleTokens: credentials }
      );
      oauth2Client.setCredentials(credentials);
    } catch {
      return null; 
    }
  }
  
  return google.drive({ version: 'v3', auth: oauth2Client });
}

async function crearEstructuraCarpetas(drive: any, usuarioId: string, contratoId: string, actividadId: string) {
  try {
    let rootFolder = await drive.files.list({
      q: `name='ContraSeguimiento' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)'
    });
    
    let rootFolderId;
    if (rootFolder.data.files.length === 0) {
      const folder = await drive.files.create({
        requestBody: {
          name: 'ContraSeguimiento',
          mimeType: 'application/vnd.google-apps.folder'
        },
        fields: 'id'
      });
      rootFolderId = folder.data.id;
    } else {
      rootFolderId = rootFolder.data.files[0].id;
    }
    
    const contratoFolder = await drive.files.list({
      q: `name='Contrato-${contratoId}' and '${rootFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name, webViewLink)'
    });
    
    let contratoFolderId;
    let contratoFolderUrl;
    if (contratoFolder.data.files.length === 0) {
      const folder = await drive.files.create({
        requestBody: {
          name: `Contrato-${contratoId}`,
          parents: [rootFolderId],
          mimeType: 'application/vnd.google-apps.folder'
        },
        fields: 'id, webViewLink'
      });
      contratoFolderId = folder.data.id;
      contratoFolderUrl = folder.data.webViewLink;
    } else {
      contratoFolderId = contratoFolder.data.files[0].id;
      contratoFolderUrl = contratoFolder.data.files[0].webViewLink;
    }
    
    const actividadFolder = await drive.files.list({
      q: `name='Actividad-${actividadId}' and '${contratoFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name, webViewLink)'
    });
    
    if (actividadFolder.data.files.length > 0) {
      return {
        carpetaId: actividadFolder.data.files[0].id,
        carpetaNombre: actividadFolder.data.files[0].name,
        url: actividadFolder.data.files[0].webViewLink
      };
    } else {
      const folder = await drive.files.create({
        requestBody: {
          name: `Actividad-${actividadId}`,
          parents: [contratoFolderId],
          mimeType: 'application/vnd.google-apps.folder'
        },
        fields: 'id, name, webViewLink'
      });
      return {
        carpetaId: folder.data.id,
        carpetaNombre: folder.data.name,
        url: folder.data.webViewLink
      };
    }
  } catch (error) {
    console.error('Error creando estructura de carpetas:', error);
    return null;
  }
}

router.get('/', async (req, res) => {
  try {
    const { usuarioId, contratoId } = req.query;
    
    if (!usuarioId || !contratoId) {
      return res.status(400).json({ error: 'usuarioId y contratoId son requeridos' });
    }

    const evidencias = await Evidencia.find({ 
      usuarioId: usuarioId.toString(),
      contratoId: contratoId.toString() 
    }).sort({ fecha: -1 });
    
    res.json(evidencias);
  } catch (error) {
    console.error('Error obteniendo evidencias:', error);
    res.status(500).json({ error: 'Error al obtener evidencias' });
  }
});

router.get('/actividad/:actividadId', async (req, res) => {
  try {
    const { actividadId } = req.params;
    const { usuarioId } = req.query;
    
    if (!usuarioId) {
      return res.status(400).json({ error: 'usuarioId es requerido' });
    }

    const evidencias = await Evidencia.find({ 
      actividadId: actividadId,
      usuarioId: usuarioId.toString() 
    }).sort({ fecha: -1 });
    
    res.json(evidencias);
  } catch (error) {
    console.error('Error obteniendo evidencias:', error);
    res.status(500).json({ error: 'Error al obtener evidencias' });
  }
});

router.get('/descargar/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { usuarioId } = req.query;
    
    const evidencia = await Evidencia.findOne({ 
      id: id,
      usuarioId: usuarioId?.toString() 
    });
    
    if (!evidencia) {
      return res.status(404).json({ error: 'Evidencia no encontrada' });
    }
    
    if (evidencia.local?.usado && evidencia.local?.data) {
      res.setHeader('Content-Type', evidencia.local.contentType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${evidencia.archivo?.nombre || 'archivo'}"`);
      res.send(evidencia.local.data);
    } else if (evidencia.drive?.usado && evidencia.drive?.archivoId) {
      res.redirect(evidencia.drive.url || `https://drive.google.com/file/d/${evidencia.drive.archivoId}/view`);
    } else {
      res.status(404).json({ error: 'Archivo no disponible' });
    }
  } catch (error) {
    console.error('Error descargando evidencia:', error);
    res.status(500).json({ error: 'Error al descargar evidencia' });
  }
});

router.get('/contrato/:contratoId/zip', async (req, res) => {
  try {
    const { contratoId } = req.params;
    const { usuarioId } = req.query;
    
    console.log(`🔍 GET /evidencias/contrato/${contratoId}/zip - usuarioId:`, usuarioId);
    
    if (!usuarioId) {
      return res.status(400).json({ error: 'usuarioId requerido' });
    }
    
    const evidencias = await Evidencia.find({ 
      contratoId,
      usuarioId: usuarioId.toString()
    });
    
    console.log(`📦 ${evidencias.length} evidencias encontradas`);
    
    if (evidencias.length === 0) {
      return res.status(404).json({ error: 'No hay evidencias para este contrato' });
    }
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=evidencias-contrato-${contratoId}.zip`);
    
    const archive = archiver('zip', {
      zlib: { level: 9 } 
    });
    
    archive.on('error', (err) => {
      console.error('❌ Error en archiver:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error al crear ZIP' });
      }
    });
    
    archive.pipe(res);
    
    const porActividad: Record<string, any[]> = {};
    evidencias.forEach(ev => {
      const actividadId = ev.actividadId || 'sin-actividad';
      if (!porActividad[actividadId]) {
        porActividad[actividadId] = [];
      }
      porActividad[actividadId].push(ev);
    });
    
    for (const [actividadId, evs] of Object.entries(porActividad)) {
      const folderName = `Actividad-${actividadId.substring(0, 8)}`;
      
      for (const ev of evs) {
        try {
          let fileName = `${folderName}/`;
          
          if (ev.archivo?.nombre) {
            fileName += ev.archivo.nombre;
          } else if (ev.nombre) {
            fileName += ev.nombre;
          } else {
            fileName += `evidencia-${ev.id}.txt`;
          }
          
          if (ev.local?.usado && ev.local?.data) {
            archive.append(ev.local.data, { name: fileName });
            console.log(`✅ Agregado desde MongoDB: ${fileName}`);
            
          } else if (ev.drive?.usado && ev.drive?.archivoId) {
            try {
              const drive = await getDriveClient(usuarioId as string);
              if (drive) {
                const fileResponse = await drive.files.get({
                  fileId: ev.drive.archivoId,
                  alt: 'media'
                }, { responseType: 'stream' });
                
                archive.append(fileResponse.data, { name: fileName });
                console.log(`✅ Agregado desde Drive: ${fileName}`);
              } else {
                const errorContent = `No se pudo descargar de Google Drive. Archivo ID: ${ev.drive.archivoId}`;
                archive.append(errorContent, { name: `${fileName}.error.txt` });
              }
            } catch (driveError) {
              console.error(`Error descargando de Drive:`, driveError);
              const errorContent = `Error al descargar de Google Drive. Archivo ID: ${ev.drive.archivoId}`;
              archive.append(errorContent, { name: `${fileName}.error.txt` });
            }
            
          } else if (ev.enlace?.url) {
            const urlContent = `[InternetShortcut]\nURL=${ev.enlace.url}`;
            archive.append(urlContent, { name: fileName.replace(/\.url$/, '') + '.url' });
            console.log(`✅ Agregado enlace: ${fileName}`);
            
          } else if (ev.nota?.contenido) {
            const contenido = ev.nota.titulo 
              ? `${ev.nota.titulo}\n\n${ev.nota.contenido}`
              : ev.nota.contenido;
            archive.append(contenido, { name: fileName.replace(/\.txt$/, '') + '.txt' });
            console.log(`✅ Agregado nota: ${fileName}`);
          }
        } catch (itemError) {
          console.error(`Error procesando evidencia ${ev.id}:`, itemError);
        }
      }
    }
    
    console.log('📦 Finalizando ZIP...');
    await archive.finalize();
    
  } catch (error) {
    console.error('❌ Error creando ZIP:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error al crear ZIP' });
    }
  }
});

router.post('/upload', upload.single('archivo'), async (req, res) => {
  try {
    const { usuarioId, contratoId, actividadId } = req.body;
    
    if (!usuarioId || !contratoId || !actividadId || !req.file) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }
    
    const drive = await getDriveClient(usuarioId);
    let driveUsado = false;
    let driveInfo = null;
    
    if (drive) {
      try {
        const carpetas = await crearEstructuraCarpetas(drive, usuarioId, contratoId, actividadId);
        
        if (carpetas) {
          const fileMetadata = {
            name: req.file.originalname,
            parents: [carpetas.carpetaId]
          };
          
          const media = {
            mimeType: req.file.mimetype,
            body: Readable.from(req.file.buffer)
          };
          
          const file = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, name, webViewLink, size'
          });
          
          driveUsado = true;
          driveInfo = {
            usado: true,
            carpetaId: carpetas.carpetaId,
            carpetaNombre: carpetas.carpetaNombre,
            url: carpetas.url,
            archivoId: file.data.id
          };
        }
      } catch (driveError) {
        console.error('Error subiendo a Drive, usando almacenamiento local:', driveError);
      }
    }
    
    const nuevaEvidencia = new Evidencia({
      id: `EV-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      actividadId,
      contratoId,
      usuarioId,
      tipo: 'archivo',
      nombre: req.file.originalname,
      archivo: {
        nombre: req.file.originalname,
        tamaño: req.file.size,
        tipo: req.file.mimetype
      },
      drive: driveUsado ? driveInfo : { usado: false },
      local: driveUsado ? { usado: false } : {
        usado: true,
        data: req.file.buffer,
        contentType: req.file.mimetype,
        tamaño: req.file.size
      },
      fecha: new Date()
    });
    
    await nuevaEvidencia.save();
    
    const evidenciaResponse = nuevaEvidencia.toObject();
    if (evidenciaResponse.local?.data) {
      delete evidenciaResponse.local.data;
    }
    
    res.json(evidenciaResponse);
    
  } catch (error) {
    console.error('Error subiendo archivo:', error);
    res.status(500).json({ error: 'Error al subir archivo' });
  }
});

router.post('/enlace', async (req, res) => {
  try {
    const { usuarioId, contratoId, actividadId, url, titulo, descripcion } = req.body;
    
    if (!usuarioId || !contratoId || !actividadId || !url) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }
    
    const drive = await getDriveClient(usuarioId);
    let driveUsado = false;
    let driveInfo = null;
    
    if (drive) {
      try {
        const carpetas = await crearEstructuraCarpetas(drive, usuarioId, contratoId, actividadId);
        
        if (carpetas) {
          const urlContent = `[InternetShortcut]\nURL=${url}`;
          const urlBuffer = Buffer.from(urlContent, 'utf-8');
          
          const fileName = titulo ? `${titulo}.url` : `enlace-${Date.now()}.url`;
          
          const fileMetadata = {
            name: fileName,
            parents: [carpetas.carpetaId]
          };
          
          const media = {
            mimeType: 'application/internet-shortcut',
            body: Readable.from(urlBuffer)
          };
          
          const file = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, name, webViewLink'
          });
          
          driveUsado = true;
          driveInfo = {
            usado: true,
            carpetaId: carpetas.carpetaId,
            carpetaNombre: carpetas.carpetaNombre,
            url: carpetas.url,
            archivoId: file.data.id
          };
        }
      } catch (driveError) {
        console.error('Error subiendo a Drive:', driveError);
      }
    }
    
    const nuevaEvidencia = new Evidencia({
      id: `EV-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      actividadId,
      contratoId,
      usuarioId,
      tipo: 'enlace',
      nombre: titulo || url,
      enlace: { url, titulo, descripcion },
      drive: driveUsado ? driveInfo : { usado: false },
      local: { usado: false }, 
      fecha: new Date()
    });
    
    await nuevaEvidencia.save();
    
    res.json(nuevaEvidencia);
    
  } catch (error) {
    console.error('Error guardando enlace:', error);
    res.status(500).json({ error: 'Error al guardar enlace' });
  }
});

router.post('/nota', async (req, res) => {
  try {
    const { usuarioId, contratoId, actividadId, titulo, contenido } = req.body;
    
    if (!usuarioId || !contratoId || !actividadId || !contenido) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }
    
    const drive = await getDriveClient(usuarioId);
    let driveUsado = false;
    let driveInfo = null;
    
    if (drive) {
      try {
        const carpetas = await crearEstructuraCarpetas(drive, usuarioId, contratoId, actividadId);
        
        if (carpetas) {
          const notaContent = titulo ? `${titulo}\n\n${contenido}` : contenido;
          const notaBuffer = Buffer.from(notaContent, 'utf-8');
          
          const fileName = titulo ? `${titulo}.txt` : `nota-${Date.now()}.txt`;
          
          const fileMetadata = {
            name: fileName,
            parents: [carpetas.carpetaId]
          };
          
          const media = {
            mimeType: 'text/plain',
            body: Readable.from(notaBuffer)
          };
          
          const file = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, name, webViewLink'
          });
          
          driveUsado = true;
          driveInfo = {
            usado: true,
            carpetaId: carpetas.carpetaId,
            carpetaNombre: carpetas.carpetaNombre,
            url: carpetas.url,
            archivoId: file.data.id
          };
        }
      } catch (driveError) {
        console.error('Error subiendo a Drive:', driveError);
      }
    }
    
    const nuevaEvidencia = new Evidencia({
      id: `EV-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      actividadId,
      contratoId,
      usuarioId,
      tipo: 'nota',
      nombre: titulo || 'Nota',
      nota: { titulo, contenido },
      drive: driveUsado ? driveInfo : { usado: false },
      local: driveUsado ? { usado: false } : {
        usado: true,
        data: Buffer.from(contenido, 'utf-8'),
        contentType: 'text/plain',
        tamaño: contenido.length
      },
      fecha: new Date()
    });
    
    await nuevaEvidencia.save();
    
    res.json(nuevaEvidencia);
    
  } catch (error) {
    console.error('Error guardando nota:', error);
    res.status(500).json({ error: 'Error al guardar nota' });
  }
});

router.get('/carpeta/:actividadId', async (req, res) => {
  try {
    const { actividadId } = req.params;
    const { usuarioId } = req.query;
    
    if (!usuarioId) {
      return res.status(400).json({ error: 'usuarioId requerido' });
    }
    
    const evidencia = await Evidencia.findOne({ 
      actividadId,
      usuarioId: usuarioId.toString(),
      'drive.usado': true
    }).sort({ fecha: -1 });
    
    if (evidencia?.drive?.url) {
      return res.json({ 
        carpetaUrl: evidencia.drive.url,
        carpetaId: evidencia.drive.carpetaId
      });
    }
    
    res.json({ carpetaUrl: null });
    
  } catch (error) {
    console.error('Error obteniendo carpeta:', error);
    res.status(500).json({ error: 'Error al obtener carpeta' });
  }
});

export default router;