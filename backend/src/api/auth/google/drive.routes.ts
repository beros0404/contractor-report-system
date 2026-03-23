import { Router } from 'express';
import { google } from 'googleapis';
import { Usuario, IUsuario } from '../../usuarios/model';

const router = Router();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/auth/google/drive/callback'
);

const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.appdata'
];

async function refreshTokenIfNeeded(usuario: any) {
  if (!usuario.googleTokens) return null;
  
  if (usuario.googleTokens.expiry_date && 
      usuario.googleTokens.expiry_date < Date.now()) {
    console.log('🔄 Refrescando token Drive...');
    
    oauth2Client.setCredentials({
      refresh_token: usuario.googleTokens.refresh_token
    });
    
    const { credentials } = await oauth2Client.refreshAccessToken();
    
    await Usuario.findOneAndUpdate(
      { supabaseId: usuario.supabaseId },
      { googleTokens: credentials }
    );
    
    return credentials;
  }
  
  return usuario.googleTokens;
}

router.get('/auth', (req, res) => {
  try {
    const { usuarioId, redirect } = req.query;
    
    if (!usuarioId) {
      return res.status(400).json({ error: 'usuarioId es requerido' });
    }

    const state = JSON.stringify({ 
      usuarioId, 
      redirect: redirect || '/configuracion',
      service: 'drive'
    });
    
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent',
      state: state
    });
    
    res.redirect(authUrl);
    
  } catch (error) {
    console.error('❌ Error en auth Drive:', error);
    res.status(500).json({ error: 'Error al conectar con Google Drive' });
  }
});

router.get('/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code || !state) {
      return res.status(400).send('Código o estado no proporcionado');
    }

    const { usuarioId, redirect } = JSON.parse(state as string);
    
    const { tokens } = await oauth2Client.getToken(code as string);
    
    await Usuario.findOneAndUpdate(
      { supabaseId: usuarioId },
      { 
        googleTokens: tokens,
        'preferencias.driveConectado': true
      },
      { upsert: true }
    );

    res.redirect(`${process.env.FRONTEND_URL}${redirect}?drive=connected`);
    
  } catch (error) {
    console.error('❌ Error en callback Drive:', error);
    res.redirect(`${process.env.FRONTEND_URL}/configuracion?drive=error`);
  }
});

router.get('/status', async (req, res) => {
  try {
    const { usuarioId } = req.query;
    
    if (!usuarioId) {
      return res.status(400).json({ error: 'usuarioId requerido' });
    }
    
    const usuario = await Usuario.findOne({ supabaseId: usuarioId as string });
    
    if (!usuario?.googleTokens?.access_token) {
      return res.json({ conectado: false });
    }
    
    const tieneScopeDrive = usuario.googleTokens.scope?.includes('drive.file') || false;
    
    res.json({ 
      conectado: tieneScopeDrive,
      email: usuario.email 
    });
    
  } catch (error) {
    console.error('❌ Error verificando Drive:', error);
    res.status(500).json({ error: 'Error al verificar estado' });
  }
});

router.post('/disconnect', async (req, res) => {
  try {
    const { usuarioId } = req.body;
    
    if (!usuarioId) {
      return res.status(400).json({ error: 'usuarioId requerido' });
    }
    
    await Usuario.findOneAndUpdate(
      { supabaseId: usuarioId },
      { 
        $unset: { googleTokens: 1 },
        'preferencias.driveConectado': false
      }
    );
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('❌ Error desconectando Drive:', error);
    res.status(500).json({ error: 'Error al desconectar' });
  }
});

export default router;