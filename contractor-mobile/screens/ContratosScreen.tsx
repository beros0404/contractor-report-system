import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../lib/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface User {
  id: string;
  email: string;
  user_metadata?: {
    nombre?: string;
  };
}

interface Contrato {
  _id: string;
  numero: string;
  entidad: string;
  objeto: string;
  valor: number;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
  contratistaNombre: string;
  supervisorNombre: string;
}

export default function ContratosScreen({ navigation }: any) {
  const [user, setUser] = useState<User | null>(null);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadUser = async () => {
    try {
      const currentUser = await api.getCurrentUser();
      if (!currentUser) {
        navigation.replace('Login');
        return;
      }
      setUser(currentUser as User);
      await loadContratos(currentUser.id);
    } catch (error) {
      console.error('Error loading user:', error);
      Alert.alert('Error', 'No se pudo cargar los datos del usuario');
    }
  };

  const loadContratos = async (usuarioId: string) => {
    try {
      setLoading(true);
      const data = await api.getContratos(usuarioId);
      const contratosFiltrados = data.filter((c: Contrato) => c.estado !== 'finalizado');
      setContratos(contratosFiltrados);
    } catch (error) {
      console.error('Error loading contratos:', error);
      Alert.alert('Error', 'No se pudieron cargar los contratos');
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
        loadContratos(user.id);
      }
    }, [user])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (user) {
      loadContratos(user.id);
    }
  }, [user]);

  const handleSelectContrato = (contrato: Contrato) => {
    navigation.navigate('ActividadesDetalle', {
      contratoId: contrato._id,
      contratoNumero: contrato.numero,
    });
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatValor = (valor: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(valor);
  };

  const getDiasRestantes = (fechaFin: string): number => {
    const fin = new Date(fechaFin);
    const hoy = new Date();
    return Math.ceil((fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo':
        return '#10b981';
      case 'inactivo':
        return '#f59e0b';
      case 'finalizado':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'Activo';
      case 'inactivo':
        return 'Inactivo';
      case 'finalizado':
        return 'Finalizado';
      default:
        return estado;
    }
  };

  if (loading) return <LoadingSpinner />;

  const nombre = user?.user_metadata?.nombre || user?.email?.split('@')[0] || 'Usuario';

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
          <View>
            <Text style={styles.greeting}>Bienvenido,</Text>
            <Text style={styles.nombre}>{nombre.split(' ')[0]}</Text>
          </View>
          <TouchableOpacity
            style={styles.userButton}
            onPress={() => navigation.navigate('Perfil')}
          >
            <Icon name="person-circle" size={32} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        {/* Resumen */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Icon name="document-text" size={28} color="#3b82f6" />
            <View style={styles.summaryText}>
              <Text style={styles.summaryNumber}>{contratos.length}</Text>
              <Text style={styles.summaryLabel}>Contratos Activos</Text>
            </View>
          </View>
        </View>

        {/* Título */}
        <Text style={styles.sectionTitle}>Mis Contratos</Text>

        {/* Lista de contratos */}
        {contratos.length > 0 ? (
          <FlatList
            scrollEnabled={false}
            data={contratos}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => {
              const diasRestantes = getDiasRestantes(item.fechaFin);
              const urgente = diasRestantes <= 30 && diasRestantes > 0;

              return (
                <TouchableOpacity
                  style={styles.contratoCard}
                  onPress={() => handleSelectContrato(item)}
                  activeOpacity={0.7}
                >
                  {urgente && (
                    <View style={styles.urgenteTag}>
                      <Icon name="warning" size={14} color="#ff6b6b" />
                      <Text style={styles.urgenteText}>Vence pronto</Text>
                    </View>
                  )}

                  <View style={styles.contratoHeader}>
                    <View style={styles.contratoTitleSection}>
                      <Text style={styles.contratoNumero}>{item.numero}</Text>
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
                    <Icon name="chevron-forward" size={24} color="#d1d5db" />
                  </View>

                  <Text style={styles.contratoEntidad}>{item.entidad}</Text>
                  <Text style={styles.contratoObjeto} numberOfLines={2}>
                    {item.objeto}
                  </Text>

                  <View style={styles.contratoDetails}>
                    <View style={styles.detailItem}>
                      <Icon name="cash" size={16} color="#6b7280" />
                      <Text style={styles.detailText}>{formatValor(item.valor)}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Icon name="calendar" size={16} color="#6b7280" />
                      <Text style={styles.detailText}>{formatFecha(item.fechaFin)}</Text>
                    </View>
                  </View>

                  {diasRestantes > 0 && (
                    <View style={styles.diasRestantesBar}>
                      <View style={styles.diasRestantesInfo}>
                        <Icon name="time" size={14} color="#3b82f6" />
                        <Text style={styles.diasRestantesText}>
                          {diasRestantes} {diasRestantes === 1 ? 'día' : 'días'} restantes
                        </Text>
                      </View>
                    </View>
                  )}

                  <View style={styles.supervisorInfo}>
                    <Icon name="person" size={14} color="#9ca3af" />
                    <Text style={styles.supervisorText}>
                      Supervisor: {item.supervisorNombre}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="document-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>No hay contratos disponibles</Text>
            <Text style={styles.emptyHint}>
              Crea un nuevo contrato para comenzar a registrar actividades y evidencias
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('Perfil')}
            >
              <Icon name="add" size={20} color="#fff" />
              <Text style={styles.emptyButtonText}>Ir a configuración</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: '#6b7280',
  },
  nombre: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 4,
  },
  userButton: {
    padding: 8,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryText: {
    flex: 1,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  contratoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  urgenteTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  urgenteText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ff6b6b',
  },
  contratoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  contratoTitleSection: {
    flex: 1,
    gap: 8,
  },
  contratoNumero: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  estadoText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  contratoEntidad: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  contratoObjeto: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 18,
  },
  contratoDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  detailText: {
    fontSize: 12,
    color: '#6b7280',
  },
  diasRestantesBar: {
    marginBottom: 12,
  },
  diasRestantesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  diasRestantesText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3b82f6',
  },
  supervisorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  supervisorText: {
    fontSize: 12,
    color: '#9ca3af',
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
