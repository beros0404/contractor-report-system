import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
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
      type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
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
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo subir la evidencia');
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
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Subir Evidencia</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.activityInfo}>
            <Icon name="document-text" size={20} color="#3b82f6" />
            <Text style={styles.activityTitle}>{actividadTitulo}</Text>
          </View>

          <View style={styles.options}>
            <TouchableOpacity style={styles.optionButton} onPress={takePhoto} disabled={loading}>
              <Icon name="camera" size={32} color="#3b82f6" />
              <Text style={styles.optionText}>Tomar foto</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionButton} onPress={pickImage} disabled={loading}>
              <Icon name="images" size={32} color="#3b82f6" />
              <Text style={styles.optionText}>Galería</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionButton} onPress={pickDocument} disabled={loading}>
              <Icon name="document" size={32} color="#3b82f6" />
              <Text style={styles.optionText}>Documento</Text>
            </TouchableOpacity>
          </View>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={styles.loadingText}>Subiendo archivo...</Text>
            </View>
          )}
        </View>
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
    marginBottom: 24,
  },
  activityTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  optionButton: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    minWidth: 100,
  },
  optionText: {
    fontSize: 12,
    color: '#1f2937',
    marginTop: 8,
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