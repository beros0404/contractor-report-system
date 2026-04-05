import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';

interface GeneralConfig {
  notificaciones: boolean;
  recordatorios: boolean;
  modoOscuro: boolean;
}

export default function GeneralTab() {
  const [config, setConfig] = useState<GeneralConfig>({
    notificaciones: true,
    recordatorios: true,
    modoOscuro: false,
  });

  const toggleConfig = (key: keyof GeneralConfig) => {
    setConfig({
      ...config,
      [key]: !config[key],
    });
    Alert.alert('Configuración guardada', `${key} actualizado correctamente`);
  };

  const configItems = [
    {
      key: 'notificaciones',
      titulo: 'Notificaciones',
      descripcion: 'Recibir notificaciones de alertas y cambios',
      icon: 'notifications-outline',
    },
    {
      key: 'recordatorios',
      titulo: 'Recordatorios',
      descripcion: 'Recordatorios de actividades próximas',
      icon: 'alarm-outline',
    },
    {
      key: 'modoOscuro',
      titulo: 'Modo Oscuro',
      descripcion: 'Activar tema oscuro en la aplicación',
      icon: 'moon-outline',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {configItems.map((item) => (
        <View key={item.key} style={styles.configItem}>
          <View style={styles.itemHeader}>
            <Icon name={item.icon as any} size={20} color="#3b82f6" />
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitulo}>{item.titulo}</Text>
              <Text style={styles.itemDescripcion}>{item.descripcion}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.toggle, config[item.key as keyof GeneralConfig] && styles.toggleActive]}
            onPress={() => toggleConfig(item.key as keyof GeneralConfig)}
          >
            <View style={[styles.toggleCircle, config[item.key as keyof GeneralConfig] && styles.toggleCircleActive]} />
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  configItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitulo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  itemDescripcion: {
    fontSize: 12,
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
