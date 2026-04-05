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
import GeneralTab from '../components/GeneralTab';
import ContratoTab from '../components/ContratoTab';
import ActividadesTab from '../components/ActividadesTab';
import PeriodosTab from '../components/PeriodosTab';

interface User {
  id: string;
  email: string;
  user_metadata?: {
    nombre?: string;
  };
}

export default function PerfilScreen({ navigation }: any) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'general' | 'contrato' | 'actividades' | 'periodos'>('general');

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
        
        {/* Tabs de configuración */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'general' && styles.tabActive]}
            onPress={() => setActiveTab('general')}
          >
            <Icon name="settings-outline" size={18} color={activeTab === 'general' ? '#3b82f6' : '#9ca3af'} />
            <Text style={[styles.tabText, activeTab === 'general' && styles.tabTextActive]}>General</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tab, activeTab === 'contrato' && styles.tabActive]}
            onPress={() => setActiveTab('contrato')}
          >
            <Icon name="document-text-outline" size={18} color={activeTab === 'contrato' ? '#f59e0b' : '#9ca3af'} />
            <Text style={[styles.tabText, activeTab === 'contrato' && styles.tabTextActive]}>Contrato</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tab, activeTab === 'actividades' && styles.tabActive]}
            onPress={() => setActiveTab('actividades')}
          >
            <Icon name="checkmark-circle-outline" size={18} color={activeTab === 'actividades' ? '#10b981' : '#9ca3af'} />
            <Text style={[styles.tabText, activeTab === 'actividades' && styles.tabTextActive]}>Actividades</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tab, activeTab === 'periodos' && styles.tabActive]}
            onPress={() => setActiveTab('periodos')}
          >
            <Icon name="calendar-outline" size={18} color={activeTab === 'periodos' ? '#8b5cf6' : '#9ca3af'} />
            <Text style={[styles.tabText, activeTab === 'periodos' && styles.tabTextActive]}>Periodos</Text>
          </TouchableOpacity>
        </View>

        {/* Contenido de tabs */}
        <View style={styles.tabContent}>
          {activeTab === 'general' && <GeneralTab />}
          {activeTab === 'contrato' && <ContratoTab />}
          {activeTab === 'actividades' && <ActividadesTab />}
          {activeTab === 'periodos' && <PeriodosTab />}
        </View>
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
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9ca3af',
  },
  tabTextActive: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  tabContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
});
