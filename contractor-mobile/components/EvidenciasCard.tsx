import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';

interface Evidencia {
  id: string;
  actividadId: string;
  tipo: string;
  nombre: string;
  fecha: string;
  archivo?: {
    nombre: string;
    tamaño: number;
    tipo: string;
  };
  enlace?: {
    url: string;
    titulo: string;
  };
  nota?: {
    contenido: string;
    titulo: string;
  };
}

interface EvidenciasCardProps {
  evidencias: Evidencia[];
  onAddPress: () => void;
  onViewPress?: (evidencia: Evidencia) => void;
  actividadTitulo?: string;
  navigation?: any;
}

export const EvidenciasCard = ({
  evidencias,
  onAddPress,
  onViewPress,
  actividadTitulo,
  navigation,
}: EvidenciasCardProps) => {
  const getTipoEvidenciaIcon = (tipo: string) => {
    switch (tipo) {
      case 'archivo':
        return 'document';
      case 'enlace':
        return 'link';
      case 'nota':
        return 'document-text';
      default:
        return 'document';
    }
  };

  const getTipoEvidenciaColor = (tipo: string) => {
    switch (tipo) {
      case 'archivo':
        return '#3b82f6';
      case 'enlace':
        return '#10b981';
      case 'nota':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTipoLabel = (tipo: string) => {
    const labels: { [key: string]: string } = {
      archivo: 'Archivo',
      enlace: 'Enlace',
      nota: 'Nota',
    };
    return labels[tipo] || tipo;
  };

  const handleViewEvidencia = (evidencia: Evidencia) => {
    if (navigation) {
      navigation.navigate('EvidenciaDetalle', {
        evidencia,
        actividadTitulo: actividadTitulo || 'Actividad',
      });
    } else if (onViewPress) {
      onViewPress(evidencia);
    } else if (evidencia.tipo === 'enlace' && evidencia.enlace?.url) {
      Alert.alert('Enlace', `URL: ${evidencia.enlace.url}`);
    } else if (evidencia.tipo === 'nota') {
      Alert.alert(
        'Nota',
        evidencia.nota?.contenido || 'Sin contenido'
      );
    }
  };

  if (evidencias.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="document-outline" size={32} color="#d1d5db" />
        <Text style={styles.emptyText}>Sin evidencias registradas</Text>
        <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
          <Icon name="add-circle" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Agregar evidencia</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="document-text" size={20} color="#3b82f6" />
        <Text style={styles.title}>
          Evidencias ({evidencias.length})
        </Text>
        <TouchableOpacity style={styles.addIconButton} onPress={onAddPress}>
          <Icon name="add-circle" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      <FlatList
        scrollEnabled={false}
        data={evidencias}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.evidenciaItem}
            onPress={() => handleViewEvidencia(item)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor:
                    getTipoEvidenciaColor(item.tipo) + '20',
                },
              ]}
            >
              <Icon
                name={getTipoEvidenciaIcon(item.tipo)}
                size={20}
                color={getTipoEvidenciaColor(item.tipo)}
              />
            </View>

            <View style={styles.contentContainer}>
              <View style={styles.titleContainer}>
                <Text style={styles.evidenciaNombre} numberOfLines={1}>
                  {item.nombre}
                </Text>
                <View
                  style={[
                    styles.tipoBadge,
                    {
                      backgroundColor:
                        getTipoEvidenciaColor(item.tipo) + '20',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tipoText,
                      {
                        color: getTipoEvidenciaColor(item.tipo),
                      },
                    ]}
                  >
                    {getTipoLabel(item.tipo)}
                  </Text>
                </View>
              </View>
              <Text style={styles.evidenciaFecha}>
                {formatFecha(item.fecha)}
              </Text>
            </View>

            <Icon name="chevron-forward" size={20} color="#d1d5db" />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  addIconButton: {
    padding: 4,
  },
  evidenciaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    gap: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  evidenciaNombre: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    flex: 1,
  },
  tipoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tipoText: {
    fontSize: 10,
    fontWeight: '600',
  },
  evidenciaFecha: {
    fontSize: 11,
    color: '#9ca3af',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
});
