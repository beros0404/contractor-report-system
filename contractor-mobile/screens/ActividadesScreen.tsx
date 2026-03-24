import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '@expo/vector-icons/Ionicons';
import { api } from '../lib/api';
import { ActivityCard } from '../components/ActivityCard';
import { AporteForm } from '../components/AporteForm';
import { EvidenciaForm } from '../components/EvidenciaForm';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface User {
  id: string;
}

interface Contrato {
  id: string;
  numero: string;
  numeroContrato?: string;
}

interface Actividad {
  id: string;
  titulo: string;
  descripcion: string;
  numero?: number;
}

interface Aporte {
  id: string;
  actividadId: string;
}

interface Evidencia {
  id: string;
  actividadId: string;
}

export default function ActividadesScreen({ navigation }: any) {
  const [user, setUser] = useState<User | null>(null);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [contratoActivo, setContratoActivo] = useState<Contrato | null>(null);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [aportes, setAportes] = useState<Aporte[]>([]);
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAporteForm, setShowAporteForm] = useState(false);
  const [showEvidenciaForm, setShowEvidenciaForm] = useState(false);
  const [selectedActividad, setSelectedActividad] = useState<Actividad | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showContratoSelector, setShowContratoSelector] = useState(false);

  const loadUser = async () => {
    try {
      const currentUser = await api.getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        await loadContratos(currentUser.id);
      }
    } catch (error) {
      console.error('Error:', error);
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
      console.error('Error:', error);
    }
  };

  const loadActividades = async () => {
    if (!user?.id || !contratoActivo?.id) return;
    
    try {
      const [acts, aps, evids] = await Promise.all([
        api.getActividades(contratoActivo.id, user.id),
        api.getAportes(contratoActivo.id, user.id),
        api.getEvidencias(contratoActivo.id, user.id),
      ]);
      setActividades(acts);
      setAportes(aps);
      setEvidencias(evids);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user && contratoActivo) {
      loadActividades();
    }
  }, [user, contratoActivo]);

  useFocusEffect(
    useCallback(() => {
      if (user && contratoActivo) {
        loadActividades();
      }
    }, [user, contratoActivo])
  );

  const getAportesCount = (actividadId: string): number => {
    return aportes.filter((a) => a.actividadId === actividadId).length;
  };

  const getEvidenciasCount = (actividadId: string): number => {
    return evidencias.filter((e) => e.actividadId === actividadId).length;
  };

  const getCobertura = (actividadId: string): number => {
    const count = getAportesCount(actividadId);
    const max = Math.max(...actividades.map((a) => getAportesCount(a.id)), 1);
    return Math.round((count / max) * 100);
  };

  const handleCambiarContrato = (contrato: Contrato) => {
    setContratoActivo(contrato);
    setShowContratoSelector(false);
    setLoading(true);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Actividades Contractuales</Text>
          <Text style={styles.subtitle}>
            {actividades.length} actividades definidas en el contrato
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.contratoBadge}
          onPress={() => setShowContratoSelector(true)}
        >
          <Text style={styles.contratoBadgeText}>
            {contratoActivo?.numero || contratoActivo?.numeroContrato || 'Contrato'}
          </Text>
          <Icon name="chevron-down" size={16} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => setShowUpload(!showUpload)}
        >
          <Icon name="cloud-upload-outline" size={20} color="#fff" />
          <Text style={styles.uploadButtonText}>
            {showUpload ? 'Ocultar' : 'Cargar actividades'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('Aporte')}
        >
          <Icon name="add-circle" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Registrar Aporte</Text>
        </TouchableOpacity>
      </View>

      {showUpload && (
        <View style={styles.uploadSection}>
          <Text style={styles.uploadTitle}>Cargar actividades desde documento</Text>
          <Text style={styles.uploadHint}>
            Sube el PDF, Word o imagen del contrato para extraer automáticamente las actividades
          </Text>
          <TouchableOpacity style={styles.uploadSelectButton}>
            <Icon name="document-text-outline" size={24} color="#fff" />
            <Text style={styles.uploadSelectText}>Seleccionar archivo</Text>
          </TouchableOpacity>
          <Text style={styles.uploadFormats}>
            Formatos soportados: PDF, DOCX, JPG, PNG (máx. 10MB)
          </Text>
        </View>
      )}

      <FlatList
        data={actividades}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadActividades} />
        }
        renderItem={({ item }) => (
          <ActivityCard
            actividad={item}
            aportesCount={getAportesCount(item.id)}
            evidenciasCount={getEvidenciasCount(item.id)}
            cobertura={getCobertura(item.id)}
            onPress={() => {}}
            onAddAporte={() => {
              setSelectedActividad(item);
              setShowAporteForm(true);
            }}
            onAddEvidencia={() => {
              setSelectedActividad(item);
              setShowEvidenciaForm(true);
            }}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="document-text-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>No hay actividades</Text>
            <Text style={styles.emptyHint}>
              Comienza cargando las actividades desde el contrato
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setShowUpload(true)}
            >
              <Icon name="cloud-upload-outline" size={20} color="#fff" />
              <Text style={styles.emptyButtonText}>Cargar actividades ahora</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Modal selector de contrato */}
      <Modal
        visible={showContratoSelector}
        transparent
        animationType="fade"
        onRequestClose={() => setShowContratoSelector(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowContratoSelector(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar contrato</Text>
            <FlatList
              data={contratos}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.contratoOption,
                    contratoActivo?.id === item.id && styles.contratoOptionActive,
                  ]}
                  onPress={() => handleCambiarContrato(item)}
                >
                  <Text
                    style={[
                      styles.contratoOptionText,
                      contratoActivo?.id === item.id && styles.contratoOptionTextActive,
                    ]}
                  >
                    {item.numero || item.numeroContrato}
                  </Text>
                  {contratoActivo?.id === item.id && (
                    <Icon name="checkmark" size={20} color="#3b82f6" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {selectedActividad && (
        <>
          <AporteForm
            visible={showAporteForm}
            onClose={() => {
              setShowAporteForm(false);
              setSelectedActividad(null);
            }}
            onSuccess={loadActividades}
            actividadId={selectedActividad.id}
            actividadTitulo={selectedActividad.titulo}
            contratoId={contratoActivo?.id || ''}
            usuarioId={user?.id || ''}
          />
          <EvidenciaForm
            visible={showEvidenciaForm}
            onClose={() => {
              setShowEvidenciaForm(false);
              setSelectedActividad(null);
            }}
            onSuccess={loadActividades}
            actividadId={selectedActividad.id}
            actividadTitulo={selectedActividad.titulo}
            contratoId={contratoActivo?.id || ''}
            usuarioId={user?.id || ''}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  contratoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  contratoBadgeText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  actionBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  uploadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#6b7280',
    paddingVertical: 12,
    borderRadius: 8,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  addButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  uploadSection: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  uploadHint: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
  },
  uploadSelectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  uploadSelectText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  uploadFormats: {
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center',
  },
  list: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 12,
  },
  emptyHint: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
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
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  contratoOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  contratoOptionActive: {
    backgroundColor: '#eff6ff',
  },
  contratoOptionText: {
    fontSize: 16,
    color: '#1f2937',
  },
  contratoOptionTextActive: {
    color: '#3b82f6',
    fontWeight: '500',
  },
});