import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import Icon from '@expo/vector-icons/Ionicons';
import { api } from '../lib/api';

// ─── Tipos ───────────────────────────────────────────────────────────────────

type TipoEvidencia = 'archivo' | 'enlace' | 'nota';

interface EvidenciaUploadProps {
  actividadId: string;
  usuarioId: string;
  contratoId: string;
  onSuccess: (evidencia: any) => void;
}

// ─── Componente ──────────────────────────────────────────────────────────────

export const EvidenciaUpload = ({
  actividadId,
  usuarioId,
  contratoId,
  onSuccess,
}: EvidenciaUploadProps) => {
  const [tipo, setTipo] = useState<TipoEvidencia>('archivo');
  const [uploading, setUploading] = useState(false);

  // Formulario enlace
  const [enlaceUrl, setEnlaceUrl] = useState('');
  const [enlaceTitulo, setEnlaceTitulo] = useState('');
  const [enlaceDesc, setEnlaceDesc] = useState('');

  // Formulario nota
  const [notaTitulo, setNotaTitulo] = useState('');
  const [notaContenido, setNotaContenido] = useState('');

  // ─── Helpers ────────────────────────────────────────────────────────────

  const resetForms = () => {
    setEnlaceUrl('');
    setEnlaceTitulo('');
    setEnlaceDesc('');
    setNotaTitulo('');
    setNotaContenido('');
  };

  const changeTipo = (t: TipoEvidencia) => {
    setTipo(t);
    resetForms();
  };

  // ─── Archivo ────────────────────────────────────────────────────────────

  const uploadFile = async (uri: string, fileName: string, mimeType?: string) => {
    if (!usuarioId || !contratoId) {
      Alert.alert('Error', 'Falta información del contrato o usuario');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('archivo', {
        uri,
        name: fileName,
        type: mimeType || 'application/octet-stream',
      } as any);
      // Los tres campos que el backend requiere (igual que la versión web)
      formData.append('usuarioId', usuarioId);
      formData.append('contratoId', contratoId);
      formData.append('actividadId', actividadId);

      const response = await api.uploadEvidence(formData, usuarioId, contratoId, actividadId);
      onSuccess(response);
      Alert.alert('✓ Éxito', 'Evidencia subida correctamente');
    } catch (error) {
      console.error('Error subiendo archivo:', error);
      Alert.alert('Error', 'No se pudo subir la evidencia');
    } finally {
      setUploading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tus fotos');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      await uploadFile(asset.uri, asset.fileName || 'imagen.jpg', asset.mimeType);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a la cámara');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      await uploadFile(asset.uri, asset.fileName || 'foto.jpg', asset.mimeType);
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      await uploadFile(asset.uri, asset.name || 'documento', asset.mimeType);
    }
  };

  // ─── Enlace ─────────────────────────────────────────────────────────────

  const handleEnlaceSubmit = async () => {
    if (!enlaceUrl.trim()) {
      Alert.alert('Error', 'La URL es requerida');
      return;
    }
    if (!usuarioId || !contratoId) {
      Alert.alert('Error', 'Falta información del contrato o usuario');
      return;
    }

    setUploading(true);
    try {
      const res = await api.addEvidence({
        tipo: 'enlace',
        usuarioId,
        contratoId,
        actividadId,
        url: enlaceUrl.trim(),
        titulo: enlaceTitulo.trim(),
        descripcion: enlaceDesc.trim(),
      });
      resetForms();
      onSuccess(res);
      Alert.alert('✓ Éxito', 'Enlace guardado correctamente');
    } catch (error) {
      console.error('Error guardando enlace:', error);
      Alert.alert('Error', 'No se pudo guardar el enlace');
    } finally {
      setUploading(false);
    }
  };

  // ─── Nota ───────────────────────────────────────────────────────────────

  const handleNotaSubmit = async () => {
    if (!notaContenido.trim()) {
      Alert.alert('Error', 'El contenido de la nota es requerido');
      return;
    }
    if (!usuarioId || !contratoId) {
      Alert.alert('Error', 'Falta información del contrato o usuario');
      return;
    }

    setUploading(true);
    try {
      const res = await api.addEvidence({
        tipo: 'nota',
        usuarioId,
        contratoId,
        actividadId,
        titulo: notaTitulo.trim(),
        contenido: notaContenido.trim(),
      });
      resetForms();
      onSuccess(res);
      Alert.alert('✓ Éxito', 'Nota guardada correctamente');
    } catch (error) {
      console.error('Error guardando nota:', error);
      Alert.alert('Error', 'No se pudo guardar la nota');
    } finally {
      setUploading(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* Selector de tipo */}
      <View style={styles.tabs}>
        {(['archivo', 'enlace', 'nota'] as TipoEvidencia[]).map((t) => {
          const icons = { archivo: 'attach-outline', enlace: 'link-outline', nota: 'document-text-outline' } as const;
          const labels = { archivo: 'Archivo', enlace: 'Enlace', nota: 'Nota' };
          const active = tipo === t;
          return (
            <TouchableOpacity
              key={t}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => changeTipo(t)}
              disabled={uploading}
            >
              <Icon name={icons[t]} size={15} color={active ? '#fff' : COLORS.muted} />
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {labels[t]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Contenido */}
      <View style={styles.panel}>

        {/* ── Archivo ── */}
        {tipo === 'archivo' && (
          <View style={styles.fileOptions}>
            <TouchableOpacity
              style={styles.fileBtn}
              onPress={takePhoto}
              disabled={uploading}
            >
              <Icon name="camera" size={26} color={COLORS.primary} />
              <Text style={styles.fileBtnText}>Foto</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.fileBtn}
              onPress={pickImage}
              disabled={uploading}
            >
              <Icon name="images" size={26} color={COLORS.primary} />
              <Text style={styles.fileBtnText}>Galería</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.fileBtn}
              onPress={pickDocument}
              disabled={uploading}
            >
              <Icon name="document" size={26} color={COLORS.primary} />
              <Text style={styles.fileBtnText}>Documento</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Enlace ── */}
        {tipo === 'enlace' && (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="URL del enlace *"
              placeholderTextColor={COLORS.placeholder}
              value={enlaceUrl}
              onChangeText={setEnlaceUrl}
              autoCapitalize="none"
              keyboardType="url"
            />
            <TextInput
              style={styles.input}
              placeholder="Título (opcional)"
              placeholderTextColor={COLORS.placeholder}
              value={enlaceTitulo}
              onChangeText={setEnlaceTitulo}
            />
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Descripción (opcional)"
              placeholderTextColor={COLORS.placeholder}
              value={enlaceDesc}
              onChangeText={setEnlaceDesc}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.submitBtn, uploading && styles.submitBtnDisabled]}
              onPress={handleEnlaceSubmit}
              disabled={uploading}
            >
              {uploading
                ? <ActivityIndicator size="small" color="#fff" />
                : <><Icon name="link" size={16} color="#fff" /><Text style={styles.submitBtnText}>Guardar enlace</Text></>
              }
            </TouchableOpacity>
          </View>
        )}

        {/* ── Nota ── */}
        {tipo === 'nota' && (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Título (opcional)"
              placeholderTextColor={COLORS.placeholder}
              value={notaTitulo}
              onChangeText={setNotaTitulo}
            />
            <TextInput
              style={[styles.input, styles.textareaLarge]}
              placeholder="Contenido de la nota *"
              placeholderTextColor={COLORS.placeholder}
              value={notaContenido}
              onChangeText={setNotaContenido}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.submitBtn, uploading && styles.submitBtnDisabled]}
              onPress={handleNotaSubmit}
              disabled={uploading}
            >
              {uploading
                ? <ActivityIndicator size="small" color="#fff" />
                : <><Icon name="document-text" size={16} color="#fff" /><Text style={styles.submitBtnText}>Guardar nota</Text></>
              }
            </TouchableOpacity>
          </View>
        )}

        {/* Loading overlay para archivo */}
        {uploading && tipo === 'archivo' && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loadingText}>Subiendo evidencia...</Text>
          </View>
        )}
      </View>
    </View>
  );
};

// ─── Colores ─────────────────────────────────────────────────────────────────

const COLORS = {
  primary: '#4f6ef7',
  primaryLight: '#eef1fe',
  muted: '#6b7280',
  placeholder: '#9ca3af',
  border: '#e5e7eb',
  card: '#ffffff',
  bg: '#f3f4f8',
  text: '#111827',
};

// ─── Estilos ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    gap: 10,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.muted,
  },
  tabTextActive: {
    color: '#fff',
  },
  panel: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    backgroundColor: COLORS.card,
    gap: 10,
  },
  // Archivo
  fileOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 10,
  },
  fileBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: COLORS.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  fileBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.muted,
  },
  // Formulario
  form: {
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: COLORS.bg,
  },
  textarea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  textareaLarge: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});