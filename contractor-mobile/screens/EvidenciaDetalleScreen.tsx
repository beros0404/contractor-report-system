import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
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
    descripcion?: string;
  };
  nota?: {
    contenido: string;
    titulo: string;
  };
}

interface EvidenciaDetalleScreenProps {
  route: {
    params: {
      evidencia: Evidencia;
      actividadTitulo: string;
    };
  };
  navigation: any;
}

export default function EvidenciaDetalleScreen({
  route,
  navigation,
}: EvidenciaDetalleScreenProps) {
  const { evidencia, actividadTitulo } = route.params;

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

  const getTipoLabel = (tipo: string) => {
    const labels: { [key: string]: string } = {
      archivo: 'Archivo',
      enlace: 'Enlace',
      nota: 'Nota',
    };
    return labels[tipo] || tipo;
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleOpenUrl = async () => {
    if (evidencia.enlace?.url) {
      try {
        const url = evidencia.enlace.url.startsWith('http')
          ? evidencia.enlace.url
          : `https://${evidencia.enlace.url}`;
        
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        } else {
          Alert.alert('Error', 'No se puede abrir el enlace');
        }
      } catch (error) {
        Alert.alert('Error', 'No se pudo abrir el enlace');
      }
    }
  };

  const handleDownload = () => {
    Alert.alert(
      'Descargar',
      '¿Deseas descargar este archivo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Descargar', 
          onPress: () => {
            Alert.alert(
              'En desarrollo',
              'La función de descarga se habilitará próximamente'
            );
          }
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="chevron-back" size={28} color="#1f2937" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Detalle de Evidencia</Text>
        </View>
      </View>

      {/* Actividad info */}
      <View style={styles.actividadInfo}>
        <Icon name="document-text" size={20} color="#3b82f6" />
        <View>
          <Text style={styles.actividadLabel}>Actividad</Text>
          <Text style={styles.actividadTitulo}>{actividadTitulo}</Text>
        </View>
      </View>

      {/* Tipo de evidencia */}
      <View style={styles.section}>
        <View style={styles.typeCard}>
          <View
            style={[
              styles.typeIcon,
              { backgroundColor: getTipoEvidenciaColor(evidencia.tipo) + '20' },
            ]}
          >
            <Icon
              name={getTipoEvidenciaIcon(evidencia.tipo)}
              size={32}
              color={getTipoEvidenciaColor(evidencia.tipo)}
            />
          </View>
          <View style={styles.typeInfo}>
            <Text style={styles.typeLabel}>Tipo de evidencia</Text>
            <Text style={styles.typeName}>
              {getTipoLabel(evidencia.tipo)}
            </Text>
          </View>
        </View>
      </View>

      {/* Nombre/Título */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nombre</Text>
        <Text style={styles.content}>{evidencia.nombre}</Text>
      </View>

      {/* Fecha */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fecha de registro</Text>
        <View style={styles.dateContainer}>
          <Icon name="calendar" size={16} color="#6b7280" />
          <Text style={styles.content}>{formatFecha(evidencia.fecha)}</Text>
        </View>
      </View>

      {/* Contenido específico por tipo */}
      {evidencia.tipo === 'archivo' && evidencia.archivo && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del archivo</Text>
          <View style={styles.fileInfo}>
            <View style={styles.fileInfoItem}>
              <Icon name="document" size={16} color="#6b7280" />
              <View>
                <Text style={styles.fileInfoLabel}>Nombre del archivo</Text>
                <Text style={styles.fileInfoValue}>
                  {evidencia.archivo.nombre}
                </Text>
              </View>
            </View>
            <View style={styles.fileInfoItem}>
              <Icon name="folder" size={16} color="#6b7280" />
              <View>
                <Text style={styles.fileInfoLabel}>Tamaño</Text>
                <Text style={styles.fileInfoValue}>
                  {(evidencia.archivo.tamaño / 1024 / 1024).toFixed(2)} MB
                </Text>
              </View>
            </View>
            <View style={styles.fileInfoItem}>
              <Icon name="information-circle" size={16} color="#6b7280" />
              <View>
                <Text style={styles.fileInfoLabel}>Tipo de archivo</Text>
                <Text style={styles.fileInfoValue}>
                  {evidencia.archivo.tipo}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleDownload}
          >
            <Icon name="download" size={18} color="#fff" />
            <Text style={styles.actionButtonText}>Descargar archivo</Text>
          </TouchableOpacity>
        </View>
      )}

      {evidencia.tipo === 'enlace' && evidencia.enlace && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del enlace</Text>
          <View style={styles.linkSection}>
            {evidencia.enlace.titulo && (
              <View>
                <Text style={styles.sectionSubtitle}>Título</Text>
                <Text style={styles.content}>{evidencia.enlace.titulo}</Text>
              </View>
            )}
            <View style={styles.urlContainer}>
              <Text style={styles.sectionSubtitle}>URL</Text>
              <TouchableOpacity
                style={styles.urlBox}
                onPress={handleOpenUrl}
              >
                <Icon name="link" size={16} color="#3b82f6" />
                <Text style={styles.urlText} numberOfLines={1}>
                  {evidencia.enlace.url}
                </Text>
                <Icon name="open" size={16} color="#3b82f6" />
              </TouchableOpacity>
            </View>
            {evidencia.enlace.descripcion && (
              <View>
                <Text style={styles.sectionSubtitle}>Descripción</Text>
                <Text style={styles.content}>
                  {evidencia.enlace.descripcion}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleOpenUrl}
          >
            <Icon name="open" size={18} color="#fff" />
            <Text style={styles.actionButtonText}>Abrir enlace</Text>
          </TouchableOpacity>
        </View>
      )}

      {evidencia.tipo === 'nota' && evidencia.nota && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contenido de la nota</Text>
          {evidencia.nota.titulo && (
            <View style={styles.notaTitleContainer}>
              <Text style={styles.notaTitle}>{evidencia.nota.titulo}</Text>
            </View>
          )}
          <View style={styles.notaContainer}>
            <Text style={styles.notaContent}>
              {evidencia.nota.contenido}
            </Text>
          </View>
        </View>
      )}

      {/* Acciones adicionales */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            Alert.alert(
              'Eliminar',
              '¿Deseas eliminar esta evidencia?',
              [
                { text: 'Cancelar', style: 'cancel' },
                { 
                  text: 'Eliminar',
                  style: 'destructive',
                  onPress: () => {
                    Alert.alert(
                      'En desarrollo',
                      'La función de eliminación se habilitará próximamente'
                    );
                  }
                },
              ]
            );
          }}
        >
          <Icon name="trash" size={18} color="#ef4444" />
          <Text style={styles.deleteButtonText}>Eliminar evidencia</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  actividadInfo: {
    flexDirection: 'row',
    gap: 12,
    margin: 16,
    padding: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    alignItems: 'center',
  },
  actividadLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  actividadTitulo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 2,
  },
  section: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  typeCard: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  typeIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeInfo: {
    flex: 1,
  },
  typeLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  typeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 6,
  },
  content: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  fileInfo: {
    gap: 12,
    marginBottom: 16,
  },
  fileInfoItem: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  fileInfoLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  fileInfoValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1f2937',
    marginTop: 2,
  },
  linkSection: {
    gap: 16,
    marginBottom: 16,
  },
  urlContainer: {
    gap: 8,
  },
  urlBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  urlText: {
    flex: 1,
    fontSize: 12,
    color: '#3b82f6',
    fontFamily: 'monospace',
  },
  notaTitleContainer: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 12,
  },
  notaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  notaContainer: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  notaContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
    marginBottom: 40,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
});
