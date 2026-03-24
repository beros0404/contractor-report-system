import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import Icon from '@expo/vector-icons/Ionicons';
import { api } from '../lib/api';

interface EvidenciaUploadProps {
  actividadId: string;
  onSuccess: (evidencia: any) => void;
}

export const EvidenciaUpload = ({ actividadId, onSuccess }: EvidenciaUploadProps) => {
  const [uploading, setUploading] = useState(false);

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

    if (!result.canceled && result.assets && result.assets[0]) {
      await uploadFile(result.assets[0].uri, result.assets[0].fileName || 'imagen.jpg');
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

    if (!result.canceled && result.assets && result.assets[0]) {
      await uploadFile(result.assets[0].uri, result.assets[0].fileName || 'foto.jpg');
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
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('archivo', {
        uri,
        name: fileName,
        type: 'application/octet-stream',
      } as any);

      const response = await api.uploadEvidence(formData, '', '', actividadId);
      onSuccess(response);
      Alert.alert('Éxito', 'Evidencia subida correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo subir la evidencia');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.options}>
        <TouchableOpacity style={styles.option} onPress={takePhoto} disabled={uploading}>
          <Icon name="camera" size={28} color="#3b82f6" />
          <Text style={styles.optionText}>Foto</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={pickImage} disabled={uploading}>
          <Icon name="images" size={28} color="#3b82f6" />
          <Text style={styles.optionText}>Galería</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={pickDocument} disabled={uploading}>
          <Icon name="document" size={28} color="#3b82f6" />
          <Text style={styles.optionText}>Documento</Text>
        </TouchableOpacity>
      </View>
      {uploading && (
        <View style={styles.loading}>
          <ActivityIndicator size="small" color="#3b82f6" />
          <Text style={styles.loadingText}>Subiendo...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  option: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    flex: 1,
  },
  optionText: {
    fontSize: 12,
    color: '#1f2937',
    marginTop: 4,
  },
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
  },
  loadingText: {
    fontSize: 12,
    color: '#6b7280',
  },
});