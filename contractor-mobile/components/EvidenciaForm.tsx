import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import Icon from '@expo/vector-icons/Ionicons';
import { api } from '../lib/api';

interface EvidenciaFormProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  actividadId: string;
  actividadTitulo: string;
  contratoId: string;
  usuarioId: string;
}

export const EvidenciaForm = ({
  visible,
  onClose,
  onSuccess,
  actividadId,
  actividadTitulo,
  contratoId,
  usuarioId,
}: EvidenciaFormProps) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'archivo' | 'enlace' | 'nota'>('archivo');
  const [enlaceUrl, setEnlaceUrl] = useState('');
  const [enlaceTitulo, setEnlaceTitulo] = useState('');
  const [notaTitulo, setNotaTitulo] = useState('');
  const [notaContenido, setNotaContenido] = useState('');

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tus fotos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadFile(result.assets[0].uri, result.assets[0].fileName || 'imagen');
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
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadFile(result.assets[0].uri, result.assets[0].fileName || 'foto');
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['*/*'],
    });

    if (result.canceled === false && result.assets && result.assets[0]) {
      await uploadFile(result.assets[0].uri, result.assets[0].name || 'documento');
    }
  };

  const uploadFile = async (uri: string, fileName: string) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('archivo', {
        uri,
        name: fileName,
        type: 'application/octet-stream',
      } as any);

      await api.uploadEvidence(formData, usuarioId, contratoId, actividadId);
      
      Alert.alert('Éxito', 'Evidencia subida correctamente');
      onSuccess();
      onClose();
      setActiveTab('archivo');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo subir la evidencia');
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarEnlace = async () => {
    if (!enlaceUrl.trim()) {
      Alert.alert('Error', 'Por favor ingresa una URL válida');
      return;
    }

    setLoading(true);
    try {
      await api.addEvidence({
        usuarioId,
        contratoId,
        actividadId,
        tipo: 'enlace',
        url: enlaceUrl,
        titulo: enlaceTitulo || enlaceUrl,
        descripcion: '',
      });

      Alert.alert('Éxito', 'Enlace agregado correctamente');
      setEnlaceUrl('');
      setEnlaceTitulo('');
      onSuccess();
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo agregar el enlace');
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarNota = async () => {
    if (!notaContenido.trim()) {
      Alert.alert('Error', 'Por favor escribe el contenido de la nota');
      return;
    }

    setLoading(true);
    try {
      await api.addEvidence({
        usuarioId,
        contratoId,
        actividadId,
        tipo: 'nota',
        titulo: notaTitulo,
        contenido: notaContenido,
      });

      Alert.alert('Éxito', 'Nota agregada correctamente');
      setNotaTitulo('');
      setNotaContenido('');
      onSuccess();
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo agregar la nota');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <ScrollView style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Registrar Evidencia</Text>
            <TouchableOpacity onPress={onClose} disabled={loading}>
              <Icon name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.activityInfo}>
            <Icon name="document-text" size={20} color="#3b82f6" />
            <Text style={styles.activityTitle}>{actividadTitulo}</Text>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'archivo' && styles.tabButtonActive]}
              onPress={() => setActiveTab('archivo')}
              disabled={loading}
            >
              <Icon name="document" size={16} color={activeTab === 'archivo' ? '#3b82f6' : '#9ca3af'} />
              <Text style={[styles.tabText, activeTab === 'archivo' && styles.tabTextActive]}>
                Archivo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'enlace' && styles.tabButtonActive]}
              onPress={() => setActiveTab('enlace')}
              disabled={loading}
            >
              <Icon name="link" size={16} color={activeTab === 'enlace' ? '#3b82f6' : '#9ca3af'} />
              <Text style={[styles.tabText, activeTab === 'enlace' && styles.tabTextActive]}>
                Enlace
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'nota' && styles.tabButtonActive]}
              onPress={() => setActiveTab('nota')}
              disabled={loading}
            >
              <Icon name="document-text" size={16} color={activeTab === 'nota' ? '#3b82f6' : '#9ca3af'} />
              <Text style={[styles.tabText, activeTab === 'nota' && styles.tabTextActive]}>
                Nota
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === 'archivo' && (
            <View style={styles.tabContent}>
              <Text style={styles.sectionLabel}>Selecciona cómo deseas subir el archivo:</Text>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={takePhoto}
                disabled={loading}
              >
                <Icon name="camera" size={32} color="#3b82f6" />
                <Text style={styles.optionText}>Tomar Foto</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionButton}
                onPress={pickImage}
                disabled={loading}
              >
                <Icon name="images" size={32} color="#3b82f6" />
                <Text style={styles.optionText}>Desde Galería</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionButton}
                onPress={pickDocument}
                disabled={loading}
              >
                <Icon name="document-attach" size={32} color="#3b82f6" />
                <Text style={styles.optionText}>Cargar Documento</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeTab === 'enlace' && (
            <View style={styles.tabContent}>
              <Text style={styles.sectionLabel}>Agregar un enlace</Text>
              <TextInput
                style={styles.input}
                placeholder="Título (opcional)"
                value={enlaceTitulo}
                onChangeText={setEnlaceTitulo}
                placeholderTextColor="#9ca3af"
                editable={!loading}
              />
              <TextInput
                style={[styles.input, styles.urlInput]}
                placeholder="https://ejemplo.com"
                value={enlaceUrl}
                onChangeText={setEnlaceUrl}
                placeholderTextColor="#9ca3af"
                editable={!loading}
              />
              <TouchableOpacity
                style={[styles.actionButton, loading && styles.actionButtonDisabled]}
                onPress={handleAgregarEnlace}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Icon name="add-circle" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Agregar Enlace</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {activeTab === 'nota' && (
            <View style={styles.tabContent}>
              <Text style={styles.sectionLabel}>Crear una nota</Text>
              <TextInput
                style={styles.input}
                placeholder="Título de la nota"
                value={notaTitulo}
                onChangeText={setNotaTitulo}
                placeholderTextColor="#9ca3af"
                editable={!loading}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Escribe el contenido de la nota..."
                value={notaContenido}
                onChangeText={setNotaContenido}
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={6}
                editable={!loading}
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={[styles.actionButton, loading && styles.actionButtonDisabled]}
                onPress={handleAgregarNota}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Icon name="add-circle" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Guardar Nota</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {loading && activeTab === 'archivo' && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={styles.loadingText}>Subiendo archivo...</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  activityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  activityTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9ca3af',
  },
  tabTextActive: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  tabContent: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  optionButton: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginTop: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 12,
  },
  urlInput: {
    fontFamily: 'monospace',
  },
  textArea: {
    minHeight: 120,
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
});
