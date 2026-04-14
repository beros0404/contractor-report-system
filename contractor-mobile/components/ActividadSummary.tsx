import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';

interface Actividad {
  id: string;
  titulo: string;
  numero: number;
  estado: string;
  porcentajePeso: number;
}

interface ActividadSummaryProps {
  actividad: Actividad;
  evidenciasCount: number;
  onPress: () => void;
  onAddEvidencia: () => void;
}

export const ActividadSummary = ({
  actividad,
  evidenciasCount,
  onPress,
  onAddEvidencia,
}: ActividadSummaryProps) => {
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
      sin_inicio: 'Sin iniciar',
      baja: 'Baja',
    };
    return labels[estado] || estado;
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'activa':
        return 'play-circle';
      case 'completada':
        return 'checkmark-circle';
      case 'sin_inicio':
        return 'pause-circle';
      case 'baja':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <View style={styles.numeroContainer}>
            <Text style={styles.numero}>{actividad.numero}</Text>
          </View>
          <View style={styles.textSection}>
            <Text style={styles.titulo} numberOfLines={1}>
              {actividad.titulo}
            </Text>
            <View style={styles.metaRow}>
              <Icon
                name={getEstadoIcon(actividad.estado)}
                size={14}
                color={getEstadoColor(actividad.estado)}
              />
              <Text
                style={[
                  styles.estado,
                  { color: getEstadoColor(actividad.estado) },
                ]}
              >
                {getEstadoLabel(actividad.estado)}
              </Text>
              <Text style={styles.peso}>• {actividad.porcentajePeso}%</Text>
            </View>
          </View>
        </View>
        <Icon name="chevron-forward" size={20} color="#d1d5db" />
      </View>

      <View style={styles.footer}>
        <View style={styles.statsContainer}>
          <Icon name="document" size={16} color="#6b7280" />
          <Text style={styles.statsText}>
            {evidenciasCount} {evidenciasCount === 1 ? 'evidencia' : 'evidencias'}
          </Text>
        </View>
        
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleSection: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  numeroContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numero: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3b82f6',
  },
  textSection: {
    flex: 1,
  },
  titulo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  estado: {
    fontSize: 11,
    fontWeight: '500',
  },
  peso: {
    fontSize: 11,
    color: '#6b7280',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statsText: {
    fontSize: 12,
    color: '#6b7280',
  },
  addButton: {
    padding: 4,
  },
});
