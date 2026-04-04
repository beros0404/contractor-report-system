import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { api } from '../lib/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface User {
  id: string;
  email: string;
  user_metadata?: {
    nombre?: string;
  };
}

interface Configuracion {
  id: string;
  nombre: string;
  valor: boolean;
  descripcion?: string;
}

export default function PerfilScreen({ navigation }: any) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'general' | 'contrato' | 'actividades' | 'periodos' | null>(null);
  const [configuraciones, setConfiguraciones] = useState<{
    general: Configuracion[];
    contrato: Configuracion[];
    actividades: Configuracion[];
    periodos: Configuracion[];
  }>({
    general: [
      { id: '1', nombre: 'Notificaciones', valor: true, descripcion: 'Recibir notificaciones de alertas' },
      { id: '2', nombre: 'Recordatorios', valor: true, descripcion: 'Recordatorios de actividades próximas' },
      { id: '3', nombre: 'Modo oscuro', valor: false, descripcion: 'Activar modo oscuro' },
    ],
    contrato: [
      { id: '4', nombre: 'Mostrar contrato activo', valor: true, descripcion: 'Mostrar contrato seleccionado en el dashboard' },
      { id: '5', nombre: 'Mostrar estado', valor: true, descripcion: 'Mostrar estado del contrato' },
      { id: '6', nombre: 'Alertas de cambio', valor: true, descripcion: 'Alertar cuando el contrato cambia' },
    ],
    actividades: [
      { id: '7', nombre: 'Mostrar progreso', valor: true, descripcion: 'Mostrar barra de progreso en actividades' },
      { id: '8', nombre: 'Agrupar por estado', valor: true, descripcion: 'Agrupar actividades por estado' },
      { id: '9', nombre: 'Mostrar comentarios', valor: true, descripcion: 'Mostrar comentarios en actividades' },
    ],
    periodos: [
      { id: '10', nombre: 'Mostrar días restantes', valor: true, descripcion: 'Mostrar contador de días' },
      { id: '11', nombre: 'Alertas de vencimiento', valor: true, descripcion: 'Alertar cuando falta poco para vencer' },
      { id: '12', nombre: 'Mostrar línea de tiempo', valor: true, descripcion: 'Mostrar línea de tiempo de periodos' },
    ],
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await api.getCurrentUser();
      console.log('Usuario cargado:', currentUser);
      
      if (currentUser) {
        setUser(currentUser as User);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      Alert.alert('Error', 'No se pudo cargar la información del usuario');
    } finally {
      setLoading(false);
    }
  };

  const toggleConfiguracion = (section: 'general' | 'contrato' | 'actividades' | 'periodos', id: string) => {
    setConfiguraciones({
      ...configuraciones,
      [section]: configuraciones[section].map((config) =>
        config.id === id ? { ...config, valor: !config.valor } : config
      ),
    });
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.logout();
              navigation.replace('Login');
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
              Alert.alert('Error', 'No se pudo cerrar sesión');
            }
          },
        },
      ]
    );
  };

  if (loading) return <LoadingSpinner />;

  // Obtener nombre de manera segura
  const nombre = user?.user_metadata?.nombre || user?.email?.split('@')[0] || 'Usuario';
  const email = user?.email || 'No disponible';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{nombre.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{nombre}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información de la cuenta</Text>
        
        <View style={styles.infoItem}>
          <Icon name="person-outline" size={20} color="#6b7280" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Nombre</Text>
            <Text style={styles.infoValue}>{nombre}</Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <Icon name="mail-outline" size={20} color="#6b7280" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{email}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuración</Text>
        
        {/* Sección General */}
        <TouchableOpacity 
          style={styles.configSection}
          onPress={() => setActiveSection(activeSection === 'general' ? null : 'general')}
        >
          <View style={styles.configSectionHeader}>
            <Icon name="settings-outline" size={20} color="#3b82f6" />
            <Text style={styles.configSectionTitle}>General</Text>
          </View>
          <Icon 
            name={activeSection === 'general' ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color="#9ca3af" 
          />
        </TouchableOpacity>
        {activeSection === 'general' && (
          <View style={styles.configContent}>
            {configuraciones.general.map((config) => (
              <View key={config.id} style={styles.configItem}>
                <View style={styles.configItemInfo}>
                  <Text style={styles.configItemName}>{config.nombre}</Text>
                  {config.descripcion && (
                    <Text style={styles.configItemDescription}>{config.descripcion}</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={[styles.toggle, config.valor && styles.toggleActive]}
                  onPress={() => toggleConfiguracion('general', config.id)}
                >
                  <View style={[styles.toggleCircle, config.valor && styles.toggleCircleActive]} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Sección Contrato */}
        <TouchableOpacity 
          style={styles.configSection}
          onPress={() => setActiveSection(activeSection === 'contrato' ? null : 'contrato')}
        >
          <View style={styles.configSectionHeader}>
            <Icon name="document-text-outline" size={20} color="#f59e0b" />
            <Text style={styles.configSectionTitle}>Configuración de Contrato</Text>
          </View>
          <Icon 
            name={activeSection === 'contrato' ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color="#9ca3af" 
          />
        </TouchableOpacity>
        {activeSection === 'contrato' && (
          <View style={styles.configContent}>
            {configuraciones.contrato.map((config) => (
              <View key={config.id} style={styles.configItem}>
                <View style={styles.configItemInfo}>
                  <Text style={styles.configItemName}>{config.nombre}</Text>
                  {config.descripcion && (
                    <Text style={styles.configItemDescription}>{config.descripcion}</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={[styles.toggle, config.valor && styles.toggleActive]}
                  onPress={() => toggleConfiguracion('contrato', config.id)}
                >
                  <View style={[styles.toggleCircle, config.valor && styles.toggleCircleActive]} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Sección Actividades */}
        <TouchableOpacity 
          style={styles.configSection}
          onPress={() => setActiveSection(activeSection === 'actividades' ? null : 'actividades')}
        >
          <View style={styles.configSectionHeader}>
            <Icon name="checkmark-circle-outline" size={20} color="#10b981" />
            <Text style={styles.configSectionTitle}>Configuración de Actividades</Text>
          </View>
          <Icon 
            name={activeSection === 'actividades' ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color="#9ca3af" 
          />
        </TouchableOpacity>
        {activeSection === 'actividades' && (
          <View style={styles.configContent}>
            {configuraciones.actividades.map((config) => (
              <View key={config.id} style={styles.configItem}>
                <View style={styles.configItemInfo}>
                  <Text style={styles.configItemName}>{config.nombre}</Text>
                  {config.descripcion && (
                    <Text style={styles.configItemDescription}>{config.descripcion}</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={[styles.toggle, config.valor && styles.toggleActive]}
                  onPress={() => toggleConfiguracion('actividades', config.id)}
                >
                  <View style={[styles.toggleCircle, config.valor && styles.toggleCircleActive]} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Sección Periodos */}
        <TouchableOpacity 
          style={styles.configSection}
          onPress={() => setActiveSection(activeSection === 'periodos' ? null : 'periodos')}
        >
          <View style={styles.configSectionHeader}>
            <Icon name="calendar-outline" size={20} color="#8b5cf6" />
            <Text style={styles.configSectionTitle}>Configuración de Periodos</Text>
          </View>
          <Icon 
            name={activeSection === 'periodos' ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color="#9ca3af" 
          />
        </TouchableOpacity>
        {activeSection === 'periodos' && (
          <View style={styles.configContent}>
            {configuraciones.periodos.map((config) => (
              <View key={config.id} style={styles.configItem}>
                <View style={styles.configItemInfo}>
                  <Text style={styles.configItemName}>{config.nombre}</Text>
                  {config.descripcion && (
                    <Text style={styles.configItemDescription}>{config.descripcion}</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={[styles.toggle, config.valor && styles.toggleActive]}
                  onPress={() => toggleConfiguracion('periodos', config.id)}
                >
                  <View style={[styles.toggleCircle, config.valor && styles.toggleCircleActive]} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Versión 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '600',
    color: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
  },
  email: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    color: '#1f2937',
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ef4444',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 20,
  },
  configSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  configSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  configSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  configContent: {
    backgroundColor: '#f9fafb',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  configItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  configItemInfo: {
    flex: 1,
  },
  configItemName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1f2937',
  },
  configItemDescription: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#10b981',
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
  },
});
