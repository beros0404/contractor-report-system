import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Icon from '@expo/vector-icons/Ionicons';
import { api } from '../lib/api';
import { EvidenciaUpload } from '../components/EvidenciaUpload';

interface User {
  id: string;
  email: string;
}

interface Contrato {
  id: string;
  numero: string;
  numeroContrato?: string;
  entidad?: string;
}

interface Actividad {
  id: string;
  titulo: string;
  descripcion: string;
  numero?: number;
}

export default function AporteScreen({ navigation, route }: any) {
  const { actividadId: preseleccionada, descripcion: descripcionPrefill, fecha: fechaPrefill } = route.params || {};
  const [user, setUser] = useState<User | null>(null);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [contratoActivo, setContratoActivo] = useState<Contrato | null>(null);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [actividadId, setActividadId] = useState(preseleccionada || '');
  const [fecha, setFecha] = useState(fechaPrefill ? new Date(fechaPrefill) : new Date());
  const [descripcion, setDescripcion] = useState(descripcionPrefill || '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [evidenciasGuardadas, setEvidenciasGuardadas] = useState<any[]>([]);
  
  // Modales
  const [showContratoSelector, setShowContratoSelector] = useState(false);
  const [showActividadSelector, setShowActividadSelector] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

const loadUser = async () => {
    try {
      const currentUser = await api.getCurrentUser();

      if (!currentUser) {
        setUser(null);
        return;
      }

      setUser(currentUser as User);
      await loadContratos(currentUser.id);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadContratos = async (usuarioId: string) => {
    try {
      const data = await api.getContratos(usuarioId);
      setContratos(data);
      if (data.length > 0 && !contratoActivo) {
        setContratoActivo(data[0]);
      }
    } catch (error) {
      console.error('Error loading contratos:', error);
    }
  };

  const loadActividades = async (contratoId: string, usuarioId: string) => {
    try {
      const data = await api.getActividades(contratoId, usuarioId);
      setActividades(data);
      
      // Si hay una actividad preseleccionada y está en la lista, seleccionarla
      if (preseleccionada && data.some(a => a.id === preseleccionada)) {
        setActividadId(preseleccionada);
      } else if (data.length > 0 && !actividadId) {
        setActividadId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading actividades:', error);
      setActividades([]);
    }
  };

  const handleChangeContrato = (contrato: Contrato) => {
    setContratoActivo(contrato);
    setActividadId(''); // Resetear actividad seleccionada
    setShowContratoSelector(false);
    if (user) {
      loadActividades(contrato.id, user.id);
    }
  };

  const handleEvidenciaGuardada = (evidencia: any) => {
    setEvidenciasGuardadas(prev => [...prev, evidencia]);
  };

  const handleSubmit = async (asBorrador: boolean) => {
    if (!contratoActivo?.id) {
      Alert.alert('Error', 'Selecciona un contrato');
      return;
    }
    if (!actividadId) {
      Alert.alert('Error', 'Selecciona una actividad');
      return;
    }
    if (!descripcion.trim() && !asBorrador) {
      Alert.alert('Error', 'La descripción es requerida');
      return;
    }

    setSubmitting(true);
    try {
      const evidenciaIds = evidenciasGuardadas.map(ev => ev.id);
      
      await api.createAporte(
        {
          actividadId,
          fecha: fecha.toISOString(),
          descripcion: descripcion.trim() || '(Borrador sin descripción)',
          evidenciaIds,
          estado: asBorrador ? 'borrador' : 'completado',
        },
        user?.id || '',
        contratoActivo.id
      );

      Alert.alert('Éxito', asBorrador ? 'Borrador guardado' : 'Aporte enviado');
      navigation.goBack();
    } catch (error) {
      console.error('Error creating aporte:', error);
      Alert.alert('Error', 'No se pudo registrar el aporte');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedActividad = actividades.find(a => a.id === actividadId);
  const selectedContrato = contratoActivo;

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-back" size={24} color="#6b7280" />
        <Text style={styles.backText}>Volver</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Registrar Aporte</Text>
      <Text style={styles.subtitle}>Documenta la acción concreta realizada hoy</Text>

      <View style={styles.card}>
        {/* Selector de Contrato */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Contrato</Text>
          <TouchableOpacity 
            style={styles.selectButton} 
            onPress={() => setShowContratoSelector(true)}
          >
            <Icon name="document-text-outline" size={20} color="#6b7280" />
            <Text style={styles.selectButtonText}>
              {selectedContrato?.numero || selectedContrato?.numeroContrato || 'Seleccionar contrato'}
            </Text>
            <Icon name="chevron-down" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Fecha */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Fecha de Reporte</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Icon name="calendar" size={20} color="#6b7280" />
            <Text style={styles.dateText}>{fecha.toLocaleDateString('es-ES')}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={fecha}
              mode="date"
              display="default"
              onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                setShowDatePicker(false);
                if (selectedDate) setFecha(selectedDate);
              }}
              maximumDate={new Date()}
            />
          )}
        </View>

        {/* Selector de Actividad (solo si hay contrato seleccionado) */}
        {contratoActivo && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Actividad Contractual</Text>
            <TouchableOpacity 
              style={styles.selectButton} 
              onPress={() => setShowActividadSelector(true)}
              disabled={actividades.length === 0}
            >
              <Icon name="list-outline" size={20} color="#6b7280" />
              <Text style={styles.selectButtonText}>
                {selectedActividad 
                  ? `${selectedActividad.numero || ''}. ${selectedActividad.titulo.substring(0, 60)}${selectedActividad.titulo.length > 60 ? '...' : ''}` 
                  : actividades.length === 0 ? 'No hay actividades' : 'Seleccionar actividad'}
              </Text>
              {actividades.length > 0 && <Icon name="chevron-down" size={20} color="#6b7280" />}
            </TouchableOpacity>
            <Text style={styles.hint}>
              Actividades extraídas automáticamente del contrato
            </Text>
          </View>
        )}

        {/* Descripción */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Descripción del Aporte</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={5}
            value={descripcion}
            onChangeText={setDescripcion}
            placeholder="Describe brevemente la acción..."
            placeholderTextColor="#9ca3af"
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={styles.charCount}>{descripcion.length} / 500</Text>
        </View>

        {/* Evidencias */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Evidencias</Text>
          <EvidenciaUpload
            actividadId={actividadId}
            onSuccess={handleEvidenciaGuardada}
          />
          
          {evidenciasGuardadas.length > 0 && (
            <View style={styles.evidenciasList}>
              <Text style={styles.evidenciasTitle}>Evidencias guardadas:</Text>
              {evidenciasGuardadas.map((ev, idx) => (
                <View key={idx} style={styles.evidenciaItem}>
                  <Icon name="document-text" size={16} color="#3b82f6" />
                  <Text style={styles.evidenciaName}>{ev.nombre || ev.archivo?.nombre}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Botones de acción */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.draftButton]}
            onPress={() => handleSubmit(true)}
            disabled={submitting}
          >
            <Icon name="save-outline" size={20} color="#374151" />
            <Text style={styles.draftButtonText}>Guardar borrador</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={() => handleSubmit(false)}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="send-outline" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Enviar Aporte</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Información de IA */}
      <View style={styles.infoBox}>
        <Icon name="sparkles" size={20} color="#3b82f6" />
        <Text style={styles.infoText}>
          Al enviar, la IA consolidará este aporte con los anteriores de la misma actividad
          para generar un resumen ejecutivo automático al final del período.
        </Text>
      </View>

      {/* Modal selector de contrato */}
      <Modal
        visible={showContratoSelector}
        transparent
        animationType="slide"
        onRequestClose={() => setShowContratoSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar contrato</Text>
              <TouchableOpacity onPress={() => setShowContratoSelector(false)}>
                <Icon name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            {contratos.length === 0 ? (
              <View style={styles.emptyModalContainer}>
                <Icon name="document-text-outline" size={48} color="#d1d5db" />
                <Text style={styles.emptyModalText}>No hay contratos disponibles</Text>
              </View>
            ) : (
              <FlatList
                data={contratos}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      contratoActivo?.id === item.id && styles.optionItemActive,
                    ]}
                    onPress={() => handleChangeContrato(item)}
                  >
                    <View>
                      <Text
                        style={[
                          styles.optionTitle,
                          contratoActivo?.id === item.id && styles.optionTitleActive,
                        ]}
                      >
                        {item.numero || item.numeroContrato}
                      </Text>
                      {item.entidad && (
                        <Text style={styles.optionSubtitle}>{item.entidad}</Text>
                      )}
                    </View>
                    {contratoActivo?.id === item.id && (
                      <Icon name="checkmark" size={20} color="#3b82f6" />
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Modal selector de actividad */}
      <Modal
        visible={showActividadSelector}
        transparent
        animationType="slide"
        onRequestClose={() => setShowActividadSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar actividad</Text>
              <TouchableOpacity onPress={() => setShowActividadSelector(false)}>
                <Icon name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            {actividades.length === 0 ? (
              <View style={styles.emptyModalContainer}>
                <Icon name="list-outline" size={48} color="#d1d5db" />
                <Text style={styles.emptyModalText}>No hay actividades para este contrato</Text>
                <TouchableOpacity 
                  style={styles.emptyModalButton}
                  onPress={() => {
                    setShowActividadSelector(false);
                    navigation.navigate('Actividades');
                  }}
                >
                  <Text style={styles.emptyModalButtonText}>Cargar actividades</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={actividades}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      actividadId === item.id && styles.optionItemActive,
                    ]}
                    onPress={() => {
                      setActividadId(item.id);
                      setShowActividadSelector(false);
                    }}
                  >
                    <View style={styles.optionContent}>
                      <Text style={styles.optionNumber}>{item.numero || ''}</Text>
                      <Text
                        style={[
                          styles.optionTitle,
                          actividadId === item.id && styles.optionTitleActive,
                        ]}
                      >
                        {item.titulo}
                      </Text>
                    </View>
                    {actividadId === item.id && (
                      <Icon name="checkmark" size={20} color="#3b82f6" />
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 20,
  },
  backText: {
    fontSize: 14,
    color: '#6b7280',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    color: '#6b7280',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 14,
    color: '#1f2937',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
  },
  selectButtonText: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
  },
  hint: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 6,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1f2937',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 4,
  },
  evidenciasList: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  evidenciasTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 8,
  },
  evidenciaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  evidenciaName: {
    fontSize: 14,
    color: '#1f2937',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  draftButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  draftButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  emptyModalContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyModalText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 12,
    textAlign: 'center',
  },
  emptyModalButton: {
    marginTop: 16,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyModalButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  optionItemActive: {
    backgroundColor: '#eff6ff',
  },
  optionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    minWidth: 30,
  },
  optionTitle: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
  },
  optionTitleActive: {
    color: '#3b82f6',
    fontWeight: '500',
  },
  optionSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
});