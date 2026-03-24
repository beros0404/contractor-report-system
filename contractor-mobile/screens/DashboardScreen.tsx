import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../lib/api';
import { ActivityCard } from '../components/ActivityCard';
import { AporteForm } from '../components/AporteForm';
import { EvidenciaForm } from '../components/EvidenciaForm';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface User {
  id: string;
  email: string;
  user_metadata?: {
    nombre?: string;
  };
}

interface Contrato {
  id: string;
  numero: string;
  numeroContrato?: string;
  entidad?: string;
  fechaFin?: string;
}

interface Actividad {
  id: string;
  titulo: string;
  descripcion: string;
  numero?: number;
  estado?: string;
}

interface Aporte {
  id: string;
  actividadId: string;
  fecha: string;
  descripcion: string;
}

interface Evidencia {
  id: string;
  actividadId: string;
}

export default function DashboardScreen({ navigation }: any) {
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
  const [showContratoSelector, setShowContratoSelector] = useState(false);

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
      console.error('Error loading actividades:', error);
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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadActividades();
  }, [user, contratoActivo]);

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

  // Calcular días restantes
  const diasRestantes = (() => {
    if (contratoActivo?.fechaFin) {
      const fin = new Date(contratoActivo.fechaFin);
      const hoy = new Date();
      const diff = Math.ceil((fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
      return Math.max(diff, 0);
    }
    return 0;
  })();

  const progresoPeriodo = Math.min(100, Math.max(0, Math.round(((30 - diasRestantes) / 30) * 100)));

  const handleCambiarContrato = (contrato: Contrato) => {
    setContratoActivo(contrato);
    setShowContratoSelector(false);
    setLoading(true);
  };

  if (loading) return <LoadingSpinner />;

  const nombre = user?.user_metadata?.nombre || user?.email?.split('@')[0] || 'Usuario';
  const iniciales = nombre.substring(0, 2).toUpperCase();

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header móvil */}
        <View style={styles.mobileHeader}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Hola, {nombre.split(' ')[0]}</Text>
              <TouchableOpacity 
                style={styles.contratoSelector}
                onPress={() => setShowContratoSelector(true)}
              >
                <Text style={styles.contratoNumero}>
                  {contratoActivo?.numero || contratoActivo?.numeroContrato || 'Sin contrato'}
                </Text>
                <Icon name="chevron-down" size={16} color="#9ca3af" />
              </TouchableOpacity>
            </View>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{iniciales}</Text>
            </View>
          </View>

          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progreso del periodo</Text>
              <Text style={styles.progressValue}>{progresoPeriodo}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progresoPeriodo}%` }]} />
            </View>
            <Text style={styles.progressInfo}>
              {diasRestantes} días restantes
            </Text>
          </View>
        </View>

        {/* Acceso rápido móvil */}
        <View style={styles.quickAccess}>
          <Text style={styles.sectionTitle}>Acceso Rápido</Text>
          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => navigation.navigate('Aporte')}
          >
            <Icon name="add-circle" size={24} color="#f59e0b" />
            <Text style={styles.quickButtonText}>Registrar Aporte</Text>
          </TouchableOpacity>

          <View style={styles.todayCard}>
            <Text style={styles.todayTitle}>Hoy</Text>
            <View style={styles.todayContent}>
              <View style={styles.todayIcon}>
                <Text style={styles.todayIconText}>!</Text>
              </View>
              <View>
                <Text style={styles.todayStatus}>
                  {aportes.filter(ap => {
                    const fechaAporte = new Date(ap.fecha);
                    const hoy = new Date();
                    return fechaAporte.toDateString() === hoy.toDateString();
                  }).length > 0 ? 'Aportes registrados hoy' : 'Sin aportes hoy'}
                </Text>
                <Text style={styles.todayHint}>
                  {aportes.filter(ap => {
                    const fechaAporte = new Date(ap.fecha);
                    const hoy = new Date();
                    return fechaAporte.toDateString() === hoy.toDateString();
                  }).length > 0 
                    ? 'Continúa con el registro' 
                    : 'Registra las acciones realizadas para mantener tu informe actualizado'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Estadísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{actividades.length}</Text>
            <Text style={styles.statLabel}>Actividades</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{aportes.length}</Text>
            <Text style={styles.statLabel}>Aportes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{evidencias.length}</Text>
            <Text style={styles.statLabel}>Evidencias</Text>
          </View>
        </View>

        {/* Lista de actividades */}
        <Text style={styles.sectionTitle}>Últimas actividades</Text>

        {actividades.slice(0, 5).map((actividad) => (
          <ActivityCard
            key={actividad.id}
            actividad={actividad}
            aportesCount={getAportesCount(actividad.id)}
            evidenciasCount={getEvidenciasCount(actividad.id)}
            cobertura={getCobertura(actividad.id)}
            onPress={() => navigation.navigate('ActividadesDetalle', { actividadId: actividad.id })}
            onAddAporte={() => {
              setSelectedActividad(actividad);
              setShowAporteForm(true);
            }}
            onAddEvidencia={() => {
              setSelectedActividad(actividad);
              setShowEvidenciaForm(true);
            }}
          />
        ))}

        {actividades.length === 0 && (
          <View style={styles.emptyContainer}>
            <Icon name="document-text-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>No hay actividades</Text>
            <Text style={styles.emptyHint}>
              Comienza cargando las actividades desde el contrato
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('Actividades')}
            >
              <Icon name="cloud-upload-outline" size={20} color="#fff" />
              <Text style={styles.emptyButtonText}>Cargar actividades</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

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
            onSuccess={() => {
              loadActividades();
            }}
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
            onSuccess={() => {
              loadActividades();
            }}
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
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  mobileHeader: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 14,
    color: '#9ca3af',
  },
  contratoSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  contratoNumero: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  progressCard: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9ca3af',
  },
  progressValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#4b5563',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: 3,
  },
  progressInfo: {
    fontSize: 10,
    color: '#9ca3af',
  },
  quickAccess: {
    marginBottom: 24,
  },
  quickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  quickButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  todayCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  todayTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  todayContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  todayIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayIconText: {
    fontSize: 14,
    color: '#f59e0b',
  },
  todayStatus: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  todayHint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
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