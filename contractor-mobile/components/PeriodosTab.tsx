import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';

interface PeriodosConfig {
  mostrarDiasRestantes: boolean;
  alertasVencimiento: boolean;
  mostrarLineaTiempo: boolean;
  mostrarProximosPeriodos: boolean;
}

export default function PeriodosTab() {
  const [config, setConfig] = useState<PeriodosConfig>({
    mostrarDiasRestantes: true,
    alertasVencimiento: true,
    mostrarLineaTiempo: true,
    mostrarProximosPeriodos: true,
  });

  const toggleConfig = (key: keyof PeriodosConfig) => {
    setConfig({
      ...config,
      [key]: !config[key],
    });
    Alert.alert('Configuración guardada', `${key} actualizado correctamente`);
  };

  const configItems = [
    {
      key: 'mostrarDiasRestantes',
      titulo: 'Mostrar Días Restantes',
      descripcion: 'Mostrar contador de días para vencimiento',
      icon: 'timer-outline',
    },
    {
      key: 'alertasVencimiento',
      titulo: 'Alertas de Vencimiento',
      descripcion: 'Alertar cuando falta poco para vencer un período',
      icon: 'warning-outline',
    },
    {
      key: 'mostrarLineaTiempo',
      titulo: 'Mostrar Línea de Tiempo',
      descripcion: 'Mostrar línea de tiempo visual de períodos',
      icon: 'gitbranch-outline',
    },
    {
      key: 'mostrarProximosPeriodos',
      titulo: 'Mostrar Próximos Períodos',
      descripcion: 'Mostrar vista previa de períodos próximos',
      icon: 'eye-outline',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {configItems.map((item) => (
        <View key={item.key} style={styles.configItem}>
          <View style={styles.itemHeader}>
            <Icon name={item.icon as any} size={20} color="#8b5cf6" />
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitulo}>{item.titulo}</Text>
              <Text style={styles.itemDescripcion}>{item.descripcion}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.toggle, config[item.key as keyof PeriodosConfig] && styles.toggleActive]}
            onPress={() => toggleConfig(item.key as keyof PeriodosConfig)}
          >
            <View style={[styles.toggleCircle, config[item.key as keyof PeriodosConfig] && styles.toggleCircleActive]} />
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
    backgroundColor: '#8b5cf6',
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
