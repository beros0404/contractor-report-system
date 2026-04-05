import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';

interface ContratoConfig {
  mostrarContrato: boolean;
  mostrarEstado: boolean;
  alertasCambio: boolean;
  mostrarValor: boolean;
}

export default function ContratoTab() {
  const [config, setConfig] = useState<ContratoConfig>({
    mostrarContrato: true,
    mostrarEstado: true,
    alertasCambio: true,
    mostrarValor: false,
  });

  const toggleConfig = (key: keyof ContratoConfig) => {
    setConfig({
      ...config,
      [key]: !config[key],
    });
    Alert.alert('Configuración guardada', `${key} actualizado correctamente`);
  };

  const configItems = [
    {
      key: 'mostrarContrato',
      titulo: 'Mostrar Contrato Activo',
      descripcion: 'Mostrar número de contrato seleccionado en el dashboard',
      icon: 'document-text-outline',
    },
    {
      key: 'mostrarEstado',
      titulo: 'Mostrar Estado',
      descripcion: 'Mostrar estado actual del contrato',
      icon: 'checkmark-circle-outline',
    },
    {
      key: 'alertasCambio',
      titulo: 'Alertas de Cambio',
      descripcion: 'Notificar cuando el estado del contrato cambia',
      icon: 'alert-circle-outline',
    },
    {
      key: 'mostrarValor',
      titulo: 'Mostrar Valor',
      descripcion: 'Mostrar el valor del contrato en la lista',
      icon: 'cash-outline',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {configItems.map((item) => (
        <View key={item.key} style={styles.configItem}>
          <View style={styles.itemHeader}>
            <Icon name={item.icon as any} size={20} color="#f59e0b" />
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitulo}>{item.titulo}</Text>
              <Text style={styles.itemDescripcion}>{item.descripcion}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.toggle, config[item.key as keyof ContratoConfig] && styles.toggleActive]}
            onPress={() => toggleConfig(item.key as keyof ContratoConfig)}
          >
            <View style={[styles.toggleCircle, config[item.key as keyof ContratoConfig] && styles.toggleCircleActive]} />
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
    backgroundColor: '#f59e0b',
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
