import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';

interface ActividadesConfig {
  mostrarProgreso: boolean;
  agruparPorEstado: boolean;
  mostrarComentarios: boolean;
  mostrarFechas: boolean;
  mostrarPorcentaje: boolean;
}

export default function ActividadesTab() {
  const [config, setConfig] = useState<ActividadesConfig>({
    mostrarProgreso: true,
    agruparPorEstado: true,
    mostrarComentarios: true,
    mostrarFechas: true,
    mostrarPorcentaje: true,
  });

  const toggleConfig = (key: keyof ActividadesConfig) => {
    setConfig({
      ...config,
      [key]: !config[key],
    });
    Alert.alert('Configuración guardada', `${key} actualizado correctamente`);
  };

  const configItems = [
    {
      key: 'mostrarProgreso',
      titulo: 'Mostrar Progreso',
      descripcion: 'Mostrar barra de progreso en cada actividad',
      icon: 'trending-up-outline',
    },
    {
      key: 'agruparPorEstado',
      titulo: 'Agrupar por Estado',
      descripcion: 'Agrupar actividades por estado (pendiente, en progreso, completada)',
      icon: 'layers-outline',
    },
    {
      key: 'mostrarComentarios',
      titulo: 'Mostrar Comentarios',
      descripcion: 'Mostrar número de comentarios en actividades',
      icon: 'chatbubbles-outline',
    },
    {
      key: 'mostrarFechas',
      titulo: 'Mostrar Fechas',
      descripcion: 'Mostrar fechas de inicio y fin de actividades',
      icon: 'calendar-outline',
    },
    {
      key: 'mostrarPorcentaje',
      titulo: 'Mostrar Porcentaje',
      descripcion: 'Mostrar porcentaje de peso en cada actividad',
      icon: 'percent-outline',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {configItems.map((item) => (
        <View key={item.key} style={styles.configItem}>
          <View style={styles.itemHeader}>
            <Icon name={item.icon as any} size={20} color="#10b981" />
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitulo}>{item.titulo}</Text>
              <Text style={styles.itemDescripcion}>{item.descripcion}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.toggle, config[item.key as keyof ActividadesConfig] && styles.toggleActive]}
            onPress={() => toggleConfig(item.key as keyof ActividadesConfig)}
          >
            <View style={[styles.toggleCircle, config[item.key as keyof ActividadesConfig] && styles.toggleCircleActive]} />
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
