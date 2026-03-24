import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Icon from '@expo/vector-icons/Ionicons';
import { api } from '../lib/api';

interface AporteFormProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  actividadId: string;
  actividadTitulo: string;
  contratoId: string;
  usuarioId: string;
}

export const AporteForm = ({
  visible,
  onClose,
  onSuccess,
  actividadId,
  actividadTitulo,
  contratoId,
  usuarioId,
}: AporteFormProps) => {
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!descripcion.trim()) {
      Alert.alert('Error', 'Por favor describe tu aporte');
      return;
    }

    setLoading(true);
    try {
      await api.createAporte(
        {
          descripcion: descripcion.trim(),
          fecha: fecha.toISOString(),
          actividadId,
        },
        usuarioId,
        contratoId
      );
      
      Alert.alert('Éxito', '¡Aporte registrado correctamente!');
      setDescripcion('');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error:', error);
      Alert.alert('Error', error.message || 'No se pudo registrar el aporte');
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFecha(selectedDate);
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
            <Text style={styles.title}>Registrar Aporte</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.activityInfo}>
              <Icon name="document-text" size={20} color="#3b82f6" />
              <Text style={styles.activityTitle}>{actividadTitulo}</Text>
            </View>

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Icon name="calendar" size={20} color="#6b7280" />
              <Text style={styles.dateText}>
                {fecha.toLocaleDateString('es-ES')}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={fecha}
                mode="date"
                display="default"
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}

            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={6}
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder="Describe lo que hiciste hoy..."
              placeholderTextColor="#9ca3af"
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Icon name="checkmark" size={20} color="#fff" />
                  <Text style={styles.submitText}>Guardar Aporte</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
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
    marginBottom: 16,
  },
  activityTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  dateText: {
    fontSize: 14,
    color: '#1f2937',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1f2937',
    minHeight: 120,
    marginBottom: 20,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 12,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});