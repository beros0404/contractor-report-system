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

export default function PerfilScreen({ navigation }: any) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
        
        <TouchableOpacity style={styles.infoItem} onPress={() => {}}>
          <Icon name="notifications-outline" size={20} color="#6b7280" />
          <View style={styles.infoContent}>
            <Text style={styles.infoValue}>Notificaciones</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoItem} onPress={() => {}}>
          <Icon name="shield-outline" size={20} color="#6b7280" />
          <View style={styles.infoContent}>
            <Text style={styles.infoValue}>Privacidad</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
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
});