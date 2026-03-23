"use strict";
import { Router } from 'express';
import { google } from 'googleapis';
import { Usuario } from '../../usuarios/model';
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const googleapis_1 = require("googleapis");
const model_1 = require("../../usuarios/model");
const router = (0, express_1.Router)();
const oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/auth/google/callback');
const SCOPES = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/calendar'
];
async function refreshTokenIfNeeded(usuario) {
    if (!usuario.googleTokens)
        return null;
    if (usuario.googleTokens.expiry_date &&
        usuario.googleTokens.expiry_date < Date.now()) {
        console.log('🔄 Refrescando token...');
        oauth2Client.setCredentials({
            refresh_token: usuario.googleTokens.refresh_token
        });
        const { credentials } = await oauth2Client.refreshAccessToken();
        await model_1.Usuario.findOneAndUpdate({ supabaseId: usuario.supabaseId }, { googleTokens: credentials });
        return credentials;
    }
    return usuario.googleTokens;
}
async function getAuthenticatedCalendar(usuarioId) {
    const usuario = await model_1.Usuario.findOne({ supabaseId: usuarioId });
    if (!usuario?.googleTokens?.access_token) {
        throw new Error('No autorizado');
    }
    const tokens = await refreshTokenIfNeeded(usuario);
    if (!tokens)
        throw new Error('No autorizado');
    oauth2Client.setCredentials(tokens);
    return googleapis_1.google.calendar({ version: 'v3', auth: oauth2Client });
}
router.get('/test', (req, res) => {
    res.json({ message: 'Ruta de Google Auth funcionando' });
});
router.get('/auth', (req, res) => {
    try {
        const { usuarioId, redirect } = req.query;
        if (!usuarioId) {
            return res.status(400).json({ error: 'usuarioId es requerido' });
        }
        const state = JSON.stringify({
            usuarioId,
            redirect: redirect || '/dashboard'
        });
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
            prompt: 'consent', // Importante: force consent para pedir nuevos permisos
            state
        });
        res.redirect(authUrl);
    }
    catch (error) {
        console.error('❌ Error en auth:', error);
        res.status(500).json({ error: 'Error al conectar con Google Calendar' });
    }
});
router.get('/callback', async (req, res) => {
    try {
        const { code, state } = req.query;
        if (!code || !state) {
            return res.status(400).send('Código o estado no proporcionado');
        }
        const { usuarioId, redirect } = JSON.parse(state);
        const { tokens } = await oauth2Client.getToken(code);
        await model_1.Usuario.findOneAndUpdate({ supabaseId: usuarioId }, {
            googleTokens: {
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                scope: tokens.scope,
                token_type: tokens.token_type,
                expiry_date: tokens.expiry_date,
                fecha_conexion: new Date()
            },
            'preferencias.calendarioConectado': true
        }, { upsert: true });
        res.redirect(`${process.env.FRONTEND_URL}${redirect}?calendar=connected`);
    }
    catch (error) {
        console.error('❌ Error en callback:', error);
        res.redirect(`${process.env.FRONTEND_URL}/configuracion-inicial?calendar=error`);
    }
});
// Agrega este endpoint antes del `export default router`
router.get('/events', async (req, res) => {
  try {
    const { usuarioId, timeMin, timeMax } = req.query;
    
    console.log('🔍 GET /api/auth/google/events - usuarioId:', usuarioId);
    console.log('📅 timeMin:', timeMin);
    console.log('📅 timeMax:', timeMax);
    
    if (!usuarioId) {
      return res.status(400).json({ error: 'usuarioId requerido' });
    }

    // Buscar usuario y sus tokens
    const usuario = await Usuario.findOne({ supabaseId: usuarioId as string });
    
    if (!usuario?.googleTokens?.access_token) {
      console.log('❌ Usuario no tiene tokens de Google');
      return res.status(401).json({ error: 'No autorizado', needsAuth: true });
    }

    // Configurar cliente OAuth2
    oauth2Client.setCredentials({
      access_token: usuario.googleTokens.access_token,
      refresh_token: usuario.googleTokens.refresh_token,
      expiry_date: usuario.googleTokens.expiry_date
    });
    
    // Refrescar token si es necesario
    if (usuario.googleTokens.expiry_date && 
        usuario.googleTokens.expiry_date < Date.now()) {
      console.log('🔄 Refrescando token...');
      const { credentials } = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(credentials);
      
      await Usuario.findOneAndUpdate(
        { supabaseId: usuarioId },
        { googleTokens: credentials }
      );
    }
    
    // Crear cliente de Calendar
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    // Determinar rango de fechas
    let timeMinDate: Date;
    let timeMaxDate: Date;
    
    if (timeMin && timeMax) {
      timeMinDate = new Date(timeMin as string);
      timeMaxDate = new Date(timeMax as string);
    } else {
      // Default: mes actual
      const now = new Date();
      timeMinDate = new Date(now.getFullYear(), now.getMonth(), 1);
      timeMaxDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }
    
    console.log('📅 Buscando eventos desde:', timeMinDate.toISOString());
    console.log('📅 hasta:', timeMaxDate.toISOString());
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMinDate.toISOString(),
      timeMax: timeMaxDate.toISOString(),
      maxResults: 250,
      singleEvents: true,
      orderBy: 'startTime'
    });
    
    console.log(`✅ ${response.data.items?.length || 0} eventos encontrados`);
    
    // Formatear eventos
    const eventos = (response.data.items || []).map(event => ({
      id: event.id,
      summary: event.summary || 'Sin título',
      description: event.description || '',
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      location: event.location || '',
      attendees: event.attendees?.map(a => a.email) || [],
      hangoutLink: event.hangoutLink || null
    }));
    
    res.json({ eventos });
    
  } catch (error: any) {
    console.error('❌ Error obteniendo eventos:', error);
    res.status(500).json({ 
      error: 'Error al obtener eventos',
      details: error.message
    });
  }
});

router.post('/events', async (req, res) => {
    try {
        const { usuarioId, evento } = req.body;
        if (!usuarioId || !evento) {
            return res.status(400).json({ error: 'usuarioId y evento son requeridos' });
        }
        if (!evento.summary || !evento.start || !evento.end) {
            return res.status(400).json({
                error: 'Campos requeridos: summary, start, end'
            });
        }
        const calendar = await getAuthenticatedCalendar(usuarioId);
        const eventResource = {
            summary: evento.summary,
            description: evento.description || '',
            start: {
                dateTime: evento.start,
                timeZone: 'America/Bogota'
            },
            end: {
                dateTime: evento.end,
                timeZone: 'America/Bogota'
            }
        };
        if (evento.location)
            eventResource.location = evento.location;
        if (evento.hangoutLink) {
            eventResource.conferenceData = {
                createRequest: {
                    requestId: `meet-${Date.now()}`,
                    conferenceSolutionKey: { type: 'hangoutsMeet' }
                }
            };
        }
        if (evento.attendees?.length) {
            eventResource.attendees = evento.attendees.map((email) => ({ email }));
        }
        const response = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: eventResource,
            conferenceDataVersion: evento.hangoutLink ? 1 : 0
        });
        res.json(response.data);
    }
    catch (error) {
        console.error('❌ Error creando evento:', error);
        res.status(500).json({
            error: 'Error al crear evento',
            details: error.message
        });
    }
});
router.put('/events/:eventId', async (req, res) => {
    try {
        const { eventId } = req.params;
        const { usuarioId, evento } = req.body;
        if (!usuarioId || !evento) {
            return res.status(400).json({ error: 'usuarioId y evento son requeridos' });
        }
        const calendar = await getAuthenticatedCalendar(usuarioId);
        const eventResource = {
            summary: evento.summary,
            description: evento.description,
            start: {
                dateTime: evento.start,
                timeZone: 'America/Bogota'
            },
            end: {
                dateTime: evento.end,
                timeZone: 'America/Bogota'
            }
        };
        if (evento.location)
            eventResource.location = evento.location;
        if (evento.attendees?.length) {
            eventResource.attendees = evento.attendees.map((email) => ({ email }));
        }
        const response = await calendar.events.update({
            calendarId: 'primary',
            eventId,
            requestBody: eventResource
        });
        res.json(response.data);
    }
    catch (error) {
        console.error('❌ Error actualizando evento:', error);
        res.status(500).json({ error: 'Error al actualizar evento' });
    }
});
router.delete('/events/:eventId', async (req, res) => {
    try {
        const { eventId } = req.params;
        const { usuarioId } = req.query;
        if (!usuarioId) {
            return res.status(400).json({ error: 'usuarioId requerido' });
        }
        const calendar = await getAuthenticatedCalendar(usuarioId);
        await calendar.events.delete({
            calendarId: 'primary',
            eventId
        });
        res.json({ success: true });
    }
    catch (error) {
        console.error('❌ Error eliminando evento:', error);
        res.status(500).json({ error: 'Error al eliminar evento' });
    }
});
router.get('/status', async (req, res) => {
    try {
        const { usuarioId } = req.query;
        if (!usuarioId) {
            return res.status(400).json({ error: 'usuarioId requerido' });
        }
        const usuario = await model_1.Usuario.findOne({ supabaseId: usuarioId });
        res.json({
            conectado: !!(usuario?.googleTokens?.access_token)
        });
    }
    catch (error) {
        console.error('❌ Error verificando estado:', error);
        res.status(500).json({ error: 'Error al verificar estado' });
    }
});
router.post('/disconnect', async (req, res) => {
    try {
        const { usuarioId } = req.body;
        if (!usuarioId) {
            return res.status(400).json({ error: 'usuarioId requerido' });
        }
        await model_1.Usuario.findOneAndUpdate({ supabaseId: usuarioId }, {
            $unset: { googleTokens: 1 },
            'preferencias.calendarioConectado': false
        });
        res.json({ success: true });
    }
    catch (error) {
        console.error('❌ Error desconectando:', error);
        res.status(500).json({ error: 'Error al desconectar' });
    }
});
exports.default = router;
