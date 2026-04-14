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
  actividadDescripcion?: string;
  contratoId: string;
  usuarioId: string;
}

export const EvidenciaForm = ({
  visible,
  onClose,
  onSuccess,
  actividadId,
  actividadTitulo,
  actividadDescripcion,
  contratoId,
  usuarioId,
}: EvidenciaFormProps) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'archivo' | 'enlace' | 'nota'>('archivo');
  const [enlaceUrl, setEnlaceUrl] = useState('');
  const [enlaceTitulo, setEnlaceTitulo] = useState('');
  const [notaTitulo, setNotaTitulo] = useState('');
  const [notaContenido, setNotaContenido] = useState('');
  const [evidenciasAgregadas, setEvidenciasAgregadas] = useState<any[]>([]);
  const [mostrarResumen, setMostrarResumen] = useState(false);

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
      
      // Agregar a la lista sin cerrar
      setEvidenciasAgregadas([...evidenciasAgregadas, {
        tipo: 'archivo',
        nombre: fileName,
        fecha: new Date(),
      }]);
      
      Alert.alert('Éxito', 'Evidencia agregada correctamente');
      setActiveTab('archivo');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo subir la evidencia');
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

      // Agregar a la lista sin cerrar
      setEvidenciasAgregadas([...evidenciasAgregadas, {
        tipo: 'nota',
        nombre: notaTitulo || 'Nota sin título',
        fecha: new Date(),
      }]);

      Alert.alert('Éxito', 'Nota agregada correctamente');
      setNotaTitulo('');
      setNotaContenido('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo agregar la nota');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizarRegistro = () => {
    onSuccess();
    // Resetear estado y cerrar
    setEvidenciasAgregadas([]);
    setMostrarResumen(false);
    setActiveTab('archivo');
    setEnlaceUrl('');
    setEnlaceTitulo('');
    setNotaTitulo('');
    setNotaContenido('');
    onClose();
  };

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
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
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
  resumenContainer: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  resumenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  resumenTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#166534',
  },
  resumenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
  },
  resumenItemInfo: {
    flex: 1,
  },
  resumenItemName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1f2937',
  },
  resumenItemType: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryButtonDisabled: {
    backgroundColor: '#86efac',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fee2e2',
    paddingVertical: 12,
    borderRadius: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
});
