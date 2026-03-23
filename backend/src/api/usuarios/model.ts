import mongoose from 'mongoose';

interface IGoogleTokens {
  access_token?: string;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  expiry_date?: number;
  fecha_conexion?: Date;
}

interface IPreferencias {
  notificaciones: boolean;
  calendarioConectado: boolean;
}

export interface IUsuario extends mongoose.Document {
  email: string;
  nombre?: string;
  supabaseId: string;
  googleTokens?: IGoogleTokens;
  preferencias: IPreferencias;
  createdAt: Date;
  updatedAt: Date;
}

const usuarioSchema = new mongoose.Schema({
  email: { type: String, required: true },
  nombre: { type: String },
  supabaseId: { type: String, required: true, unique: true },
  
  googleTokens: {
    access_token: { type: String },
    refresh_token: { type: String },
    scope: { type: String },
    token_type: { type: String },
    expiry_date: { type: Number },
    fecha_conexion: { type: Date }
  },
  
  preferencias: {
    notificaciones: { type: Boolean, default: true },
    calendarioConectado: { type: Boolean, default: false }
  }
}, {
  timestamps: { 
    createdAt: 'createdAt', 
    updatedAt: 'updatedAt' 
  }
});

export const Usuario = mongoose.model<IUsuario>('Usuario', usuarioSchema);