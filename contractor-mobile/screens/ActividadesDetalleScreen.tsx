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
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../lib/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EvidenciaForm } from '../components/EvidenciaForm';

interface User {
  id: string;
  email: string;
  user_metadata?: {
    nombre?: string;
  };
}

interface Actividad {
  _id?: string;
  id: string;
  titulo: string;
  descripcion: string;
  numero: number;
  porcentajePeso: number;
  estado: string;
  tipo: string;
}

interface Evidencia {
  id: string;
  actividadId: string;
  tipo: string;
  nombre: string;
  fecha: string;
}

export default function ActividadesDetalleScreen({ route, navigation }: any) {
  const { contratoId, contratoNumero } = route.params;
  
  const [user, setUser] = useState<User | null>(null);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedActividad, setSelectedActividad] = useState<Actividad | null>(null);
  const [showEvidenciaForm, setShowEvidenciaForm] = useState(false);
  const [expandedActividadId, setExpandedActividadId] = useState<string | null>(null);

  const loadUser = async () => {
    try {
      const currentUser = await api.getCurrentUser();
      if (!currentUser) {
        navigation.replace('Login');
        return;
      }
      setUser(currentUser as User);
      await loadActividades(currentUser.id);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadActividades = async (usuarioId: string) => {
    try {
      setLoading(true);
      const [acts, evs] = await Promise.all([
        api.getActividades(contratoId, usuarioId),
        api.getEvidencias(contratoId, usuarioId),
      ]);
      setActividades(acts);
      setEvidencias(evs);
    } catch (error) {
      console.error('Error loading actividades:', error);
      Alert.alert('Error', 'No se pudieron cargar las actividades');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadActividades(user.id);
      }
    }, [user])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (user) {
      loadActividades(user.id);
    }
  }, [user]);

  const getEvidenciasForActividad = (actividadId: string): Evidencia[] => {
    return evidencias.filter((e) => e.actividadId === actividadId);
  };

  const handleSelectActividad = (actividad: Actividad) => {
    // Alternar expansión para ver evidencias
    if (expandedActividadId === actividad.id) {
      setExpandedActividadId(null);
    } else {
      setExpandedActividadId(actividad.id);
    }
  };

  const handleAddEvidencia = (actividad: Actividad) => {
    setSelectedActividad(actividad);
    setShowEvidenciaForm(true);
  };

  const handleCrearAporte = (actividad: Actividad) => {
    if (!user) return;
    navigation.navigate('Aporte', {
      contratoId,
      actividadId: actividad.id,
    });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activa':
        return '#10b981';
      case 'completada':
        return '#3b82f6';
      case 'sin_inicio':
        return '#9ca3af';
      case 'baja':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getEstadoLabel = (estado: string) => {
    const labels: { [key: string]: string } = {
      activa: 'Activa',
      completada: 'Completada',
      sin_inicio: 'Sin Iniciar',
      baja: 'Baja',
    };
    return labels[estado] || estado;
  };

  const getTipoEvidenciaIcon = (tipo: string) => {
    switch (tipo) {
      case 'archivo':
        return 'document';
      case 'enlace':
        return 'link';
      case 'nota':
        return 'document-text';
      default:
        return 'document';
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="chevron-back" size={28} color="#1f2937" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Contrato {contratoNumero}</Text>
            <Text style={styles.headerSubtitle}>Actividades y Evidencias</Text>
          </View>
        </View>

        {/* Resumen de actividades */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Icon name="checkmark-circle" size={28} color="#10b981" />
            <View style={styles.summaryText}>
              <Text style={styles.summaryNumber}>
                {actividades.filter((a) => a.estado === 'completada').length}
              </Text>
              <Text style={styles.summaryLabel}>Completadas</Text>
            </View>
          </View>
          <View style={styles.summaryCard}>
            <Icon name="hourglass" size={28} color="#f59e0b" />
            <View style={styles.summaryText}>
              <Text style={styles.summaryNumber}>
                {actividades.filter((a) => a.estado === 'activa').length}
              </Text>
              <Text style={styles.summaryLabel}>En Progreso</Text>
            </View>
          </View>
          <View style={styles.summaryCard}>
            <Icon name="document" size={28} color="#3b82f6" />
            <View style={styles.summaryText}>
              <Text style={styles.summaryNumber}>{evidencias.length}</Text>
              <Text style={styles.summaryLabel}>Evidencias</Text>
            </View>
          </View>
        </View>

        {/* Título */}
        <Text style={styles.sectionTitle}>Actividades</Text>

        {/* Lista de actividades */}
        {actividades.length > 0 ? (
          <View>
            {actividades.map((item) => {
              const actividadEvidencias = getEvidenciasForActividad(item.id);
              const isExpanded = expandedActividadId === item.id;
              return (
                <TouchableOpacity
                  key={item.id || item._id || item.numero.toString()}
                  style={styles.actividadCard}
                  activeOpacity={0.7}
                  onPress={() => handleSelectActividad(item)}
                >
                  <View style={styles.actividadHeader}>
                    <View style={styles.actividadTitleSection}>
                      <Text style={styles.actividadNumero}>Act. {item.numero}</Text>
                      <Text style={styles.actividadTitulo}>{item.titulo}</Text>
                      <View
                        style={[
                          styles.estadoBadge,
                          { backgroundColor: getEstadoColor(item.estado) },
                        ]}
                      >
                        <Text style={styles.estadoText}>
                          {getEstadoLabel(item.estado)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.headerActions}>
                      <TouchableOpacity
                        style={styles.expandButton}
                        onPress={() => handleSelectActividad(item)}
                      >
                        <Icon 
                          name={isExpanded ? "chevron-up" : "chevron-down"} 
                          size={24} 
                          color="#3b82f6" 
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => handleCrearAporte(item)}
                        title="Crear Aporte"
                      >
                        <Icon name="create-outline" size={24} color="#10b981" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => handleAddEvidencia(item)}
                      >
                        <Icon name="add-circle" size={28} color="#3b82f6" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={styles.actividadDescripcion}>{item.descripcion}</Text>

                  <View style={styles.actividadMeta}>
                    <View style={styles.metaItem}>
                      <Icon name="pie-chart-outline" size={14} color="#6b7280" />
                      <Text style={styles.metaText}>{item.porcentajePeso}%</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Icon name="bookmark" size={14} color="#6b7280" />
                      <Text style={styles.metaText}>{item.tipo}</Text>
                    </View>
                  </View>

                  {/* Evidencias - Solo mostrar si está expandida */}
                  {isExpanded && (
                    <>
                      {actividadEvidencias.length > 0 && (
                        <View style={styles.evidenciasSection}>
                          <View style={styles.evidenciasHeader}>
                            <Icon name="document-text" size={16} color="#3b82f6" />
                            <Text style={styles.evidenciasTitle}>
                              Evidencias ({actividadEvidencias.length})
                            </Text>
                          </View>
                          {actividadEvidencias.map((evidencia) => (
                            <View key={evidencia.id} style={styles.evidenciaItem}>
                              <Icon
                                name={getTipoEvidenciaIcon(evidencia.tipo)}
                                size={16}
                                color="#6b7280"
                              />
                              <View style={styles.evidenciaInfo}>
                                <Text style={styles.evidenciaNombre}>{evidencia.nombre}</Text>
                                <Text style={styles.evidenciaFecha}>
                                  {new Date(evidencia.fecha).toLocaleDateString('es-CO')}
                                </Text>
                              </View>
                              <View style={styles.tipoBadge}>
                                <Text style={styles.tipoText}>{evidencia.tipo}</Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      )}

                      {actividadEvidencias.length === 0 && (
                        <View style={styles.noEvidenciasContainer}>
                          <Icon name="document-outline" size={24} color="#d1d5db" />
                          <Text style={styles.noEvidenciasText}>
                            Sin evidencias registradas
                          </Text>
                        </View>
                      )}
                    </>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="document-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>No hay actividades para este contrato</Text>
            <Text style={styles.emptyHint}>
              Las actividades se cargarán cuando estén disponibles en el sistema
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('Contratos')}
            >
              <Icon name="chevron-back" size={20} color="#fff" />
              <Text style={styles.emptyButtonText}>Volver a contratos</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Formulario de evidencia */}
      {selectedActividad && (
        <EvidenciaForm
          visible={showEvidenciaForm}
          onClose={() => {
            setShowEvidenciaForm(false);
            setSelectedActividad(null);
          }}
          onSuccess={() => {
            if (user) {
              loadActividades(user.id);
            }
          }}
          actividadId={selectedActividad.id}
          actividadTitulo={selectedActividad.titulo}
          actividadDescripcion={selectedActividad.descripcion}
          contratoId={contratoId}
          usuarioId={user?.id || ''}
        />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryText: {
    flex: 1,
  },
  summaryNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  summaryLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  actividadCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actividadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  actividadTitleSection: {
    flex: 1,
  },
  actividadNumero: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  actividadTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 4,
  },
  estadoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  estadoText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expandButton: {
    padding: 8,
  },
  addButton: {
    padding: 4,
  },
  actividadDescripcion: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 18,
  },
  actividadMeta: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
  },
  evidenciasSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  evidenciasHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  evidenciasTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  evidenciaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
  },
  evidenciaInfo: {
    flex: 1,
  },
  evidenciaNombre: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1f2937',
  },
  evidenciaFecha: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  tipoBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tipoText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0284c7',
  },
  noEvidenciasContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    alignItems: 'center',
    paddingVertical: 20,
  },
  noEvidenciasText: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 8,
  },
  addEvidenciaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 12,
  },
  addEvidenciaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptyHint: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 280,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
