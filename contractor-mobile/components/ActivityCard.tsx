import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';

interface Actividad {
  id: string;
  titulo: string;
  descripcion: string;
  numero?: number;
}

interface ActivityCardProps {
  actividad: Actividad;
  aportesCount: number;
  evidenciasCount: number;
  cobertura: number;
  onPress: () => void;
  onAddAporte: () => void;
  onAddEvidencia: () => void;
}

export const ActivityCard = ({
  actividad,
  aportesCount,
  evidenciasCount,
  cobertura,
  onPress,
  onAddAporte,
  onAddEvidencia,
}: ActivityCardProps) => {
  const getColorByCobertura = () => {
    if (cobertura >= 60) return '#22c55e';
    if (cobertura >= 25) return '#eab308';
    return '#ef4444';
  };

  const getEstadoText = () => {
    if (cobertura >= 60) return 'Activa';
    if (cobertura >= 25) return 'Baja';
    return 'Sin inicio';
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          {actividad.numero ? `${actividad.numero}. ` : ''}{actividad.titulo}
        </Text>
        <View style={[styles.badge, { backgroundColor: getColorByCobertura() }]}>
          <Text style={styles.badgeText}>{getEstadoText()}</Text>
        </View>
      </View>
      
      <Text style={styles.description} numberOfLines={2}>
        {actividad.descripcion}
      </Text>
      
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Icon name="document-text-outline" size={14} color="#6b7280" />
          <Text style={styles.statText}>{aportesCount} aportes</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="attach-outline" size={14} color="#6b7280" />
          <Text style={styles.statText}>{evidenciasCount} evidencias</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${cobertura}%`, backgroundColor: getColorByCobertura() },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{cobertura}%</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={onAddAporte}>
          <Icon name="create-outline" size={18} color="#3b82f6" />
          <Text style={styles.actionText}>Aporte</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onAddEvidencia}>
          <Icon name="cloud-upload-outline" size={18} color="#3b82f6" />
          <Text style={styles.actionText}>Evidencia</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#fff',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#6b7280',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1f2937',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3b82f6',
  },
});