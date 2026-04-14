import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  Platform,
} from 'react-native'
import Icon from '@expo/vector-icons/Ionicons'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { useAuth } from '../src/contexts/AuthContext'
import { useContrato } from '../src/contexts/ContratoContext'
import { api } from '../lib/api'

// Función para formatear fechas
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'No especificada'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Fecha inválida'
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch (error) {
    return 'Fecha inválida'
  }
}

// Función para formatear moneda
const formatCurrency = (amount: number | undefined) => {
  if (!amount) return '$0'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount)
}

export default function ConfiguracionScreen() {
  const navigation = useNavigation<any>()
  const { user, signOut } = useAuth()
  const {
    usuarioId,
    contratos,
    contratoActivo,
    contratoActivoData,
    setContratoActivo,
    loadingContratos,
    refreshContratos,
  } = useContrato()

  const [loading, setLoading] = useState(false)
  const [showCrearModal, setShowCrearModal] = useState(false)
  const [nuevoContrato, setNuevoContrato] = useState({
    numero: '',
    entidad: '',
    objeto: '',
    fechaInicio: '',
    fechaFin: '',
    valor: '',
  })

  // Recargar contratos al entrar a la pantalla
  useFocusEffect(
    React.useCallback(() => {
      if (usuarioId) {
        refreshContratos?.()
      }
    }, [usuarioId])
  )

  const handleSeleccionarContrato = (contratoId: string) => {
    setContratoActivo(contratoId)
    Alert.alert('Éxito', 'Contrato seleccionado correctamente')
  }

  const handleCrearContrato = async () => {
    if (!nuevoContrato.numero.trim()) {
      Alert.alert('Error', 'El número de contrato es requerido')
      return
    }
    if (!nuevoContrato.entidad.trim()) {
      Alert.alert('Error', 'La entidad contratante es requerida')
      return
    }
    if (!usuarioId) {
      Alert.alert('Error', 'Usuario no identificado')
      return
    }

    setLoading(true)
    try {
      const contratoData = {
        numero: nuevoContrato.numero,
        entidad: nuevoContrato.entidad,
        objeto: nuevoContrato.objeto,
        fechaInicio: nuevoContrato.fechaInicio || new Date().toISOString().split('T')[0],
        fechaFin: nuevoContrato.fechaFin || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        valor: parseInt(nuevoContrato.valor) || 0,
        usuarioId,
        estado: 'activo',
      }

      const result = await api.createContrato(contratoData, usuarioId)
      console.log('✅ Contrato creado:', result)

      await refreshContratos?.()
      setShowCrearModal(false)
      setNuevoContrato({
        numero: '',
        entidad: '',
        objeto: '',
        fechaInicio: '',
        fechaFin: '',
        valor: '',
      })
      Alert.alert('Éxito', 'Contrato creado correctamente')
    } catch (error) {
      console.error('Error creando contrato:', error)
      Alert.alert('Error', 'No se pudo crear el contrato')
    } finally {
      setLoading(false)
    }
  }

  const handleCerrarSesion = async () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            await signOut()
            navigation.replace('Login')
          },
        },
      ]
    )
  }

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Icon name="arrow-back" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Configuración</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Sección de usuario */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Perfil</Text>
          <View style={s.userCard}>
            <View style={s.userAvatar}>
              <Icon name="person" size={28} color={C.primary} />
            </View>
            <View style={s.userInfo}>
              <Text style={s.userEmail}>{user?.email}</Text>
              <Text style={s.userId}>ID: {user?.id?.substring(0, 8)}...</Text>
            </View>
          </View>
        </View>

        {/* Sección de contratos */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Mis Contratos</Text>
            <TouchableOpacity
              style={s.addBtn}
              onPress={() => setShowCrearModal(true)}
            >
              <Icon name="add-circle-outline" size={20} color={C.primary} />
              <Text style={s.addBtnText}>Nuevo</Text>
            </TouchableOpacity>
          </View>

          {loadingContratos ? (
            <View style={s.loadingContainer}>
              <ActivityIndicator color={C.primary} />
              <Text style={s.loadingText}>Cargando contratos...</Text>
            </View>
          ) : contratos.length === 0 ? (
            <View style={s.emptyContainer}>
              <Icon name="document-text-outline" size={48} color={C.muted} />
              <Text style={s.emptyText}>No tienes contratos aún</Text>
              <TouchableOpacity
                style={s.crearBtn}
                onPress={() => setShowCrearModal(true)}
              >
                <Text style={s.crearBtnText}>Crear primer contrato</Text>
              </TouchableOpacity>
            </View>
          ) : (
            contratos.map((contrato) => {
              const isActive = contrato.id === contratoActivo
              return (
                <TouchableOpacity
                  key={contrato.id}
                  style={[s.contratoCard, isActive && s.contratoCardActive]}
                  onPress={() => handleSeleccionarContrato(contrato.id)}
                  activeOpacity={0.7}
                >
                  <View style={s.contratoHeader}>
                    <View style={s.contratoNumeroContainer}>
                      <Text style={s.contratoNumero}>
                        {contrato.numero || contrato.numeroContrato}
                      </Text>
                      {isActive && (
                        <View style={s.activeBadge}>
                          <Icon name="checkmark-circle" size={14} color="#fff" />
                          <Text style={s.activeBadgeText}>Activo</Text>
                        </View>
                      )}
                    </View>
                    <Icon
                      name={isActive ? 'radio-button-on' : 'radio-button-off'}
                      size={20}
                      color={isActive ? C.primary : C.muted}
                    />
                  </View>

                  <Text style={s.contratoEntidad}>{contrato.entidad}</Text>
                  
                  {contrato.objeto && (
                    <Text style={s.contratoObjeto} numberOfLines={2}>
                      {contrato.objeto}
                    </Text>
                  )}

                  <View style={s.contratoFechas}>
                    <View style={s.fechaItem}>
                      <Icon name="calendar-outline" size={12} color={C.muted} />
                      <Text style={s.fechaText}>
                        Inicio: {formatDate(contrato.fechaInicio)}
                      </Text>
                    </View>
                    <View style={s.fechaItem}>
                      <Icon name="calendar-outline" size={12} color={C.muted} />
                      <Text style={s.fechaText}>
                        Fin: {formatDate(contrato.fechaFin)}
                      </Text>
                    </View>
                  </View>

                  {contrato.valor && (
                    <Text style={s.contratoValor}>
                      Valor: {formatCurrency(contrato.valor)}
                    </Text>
                  )}
                </TouchableOpacity>
              )
            })
          )}
        </View>

        {/* Sección de soporte */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Soporte</Text>
          <TouchableOpacity style={s.menuItem}>
            <Icon name="help-circle-outline" size={20} color={C.muted} />
            <Text style={s.menuItemText}>Centro de ayuda</Text>
            <Icon name="chevron-forward" size={16} color={C.muted} />
          </TouchableOpacity>
          <TouchableOpacity style={s.menuItem}>
            <Icon name="mail-outline" size={20} color={C.muted} />
            <Text style={s.menuItemText}>Contactar soporte</Text>
            <Icon name="chevron-forward" size={16} color={C.muted} />
          </TouchableOpacity>
          <TouchableOpacity style={s.menuItem}>
            <Icon name="document-text-outline" size={20} color={C.muted} />
            <Text style={s.menuItemText}>Términos y condiciones</Text>
            <Icon name="chevron-forward" size={16} color={C.muted} />
          </TouchableOpacity>
        </View>

        {/* Botón cerrar sesión */}
        <TouchableOpacity style={s.logoutBtn} onPress={handleCerrarSesion}>
          <Icon name="log-out-outline" size={20} color={C.danger} />
          <Text style={s.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal para crear contrato */}
      <Modal
        visible={showCrearModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCrearModal(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Nuevo Contrato</Text>
              <TouchableOpacity onPress={() => setShowCrearModal(false)}>
                <Icon name="close" size={24} color={C.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={s.inputGroup}>
                <Text style={s.inputLabel}>Número de contrato *</Text>
                <TextInput
                  style={s.input}
                  value={nuevoContrato.numero}
                  onChangeText={(text) => setNuevoContrato({ ...nuevoContrato, numero: text })}
                  placeholder="Ej: CO-2024-001"
                  placeholderTextColor={C.placeholder}
                />
              </View>

              <View style={s.inputGroup}>
                <Text style={s.inputLabel}>Entidad contratante *</Text>
                <TextInput
                  style={s.input}
                  value={nuevoContrato.entidad}
                  onChangeText={(text) => setNuevoContrato({ ...nuevoContrato, entidad: text })}
                  placeholder="Ej: Alcaldía de Medellín"
                  placeholderTextColor={C.placeholder}
                />
              </View>

              <View style={s.inputGroup}>
                <Text style={s.inputLabel}>Objeto del contrato</Text>
                <TextInput
                  style={[s.input, s.textArea]}
                  value={nuevoContrato.objeto}
                  onChangeText={(text) => setNuevoContrato({ ...nuevoContrato, objeto: text })}
                  placeholder="Describir el objeto del contrato..."
                  placeholderTextColor={C.placeholder}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={s.row}>
                <View style={[s.inputGroup, { flex: 1 }]}>
                  <Text style={s.inputLabel}>Fecha inicio</Text>
                  <TextInput
                    style={s.input}
                    value={nuevoContrato.fechaInicio}
                    onChangeText={(text) => setNuevoContrato({ ...nuevoContrato, fechaInicio: text })}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={C.placeholder}
                  />
                </View>
                <View style={[s.inputGroup, { flex: 1 }]}>
                  <Text style={s.inputLabel}>Fecha fin</Text>
                  <TextInput
                    style={s.input}
                    value={nuevoContrato.fechaFin}
                    onChangeText={(text) => setNuevoContrato({ ...nuevoContrato, fechaFin: text })}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={C.placeholder}
                  />
                </View>
              </View>

              <View style={s.inputGroup}>
                <Text style={s.inputLabel}>Valor del contrato</Text>
                <TextInput
                  style={s.input}
                  value={nuevoContrato.valor}
                  onChangeText={(text) => setNuevoContrato({ ...nuevoContrato, valor: text })}
                  placeholder="0"
                  placeholderTextColor={C.placeholder}
                  keyboardType="numeric"
                />
              </View>
            </ScrollView>

            <View style={s.modalFooter}>
              <TouchableOpacity
                style={[s.modalBtn, s.cancelBtn]}
                onPress={() => setShowCrearModal(false)}
              >
                <Text style={s.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.modalBtn, s.createBtn]}
                onPress={handleCrearContrato}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={s.createBtnText}>Crear contrato</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

// ─── Colores ──────────────────────────────────────────────────────────────────

const C = {
  primary: '#4f6ef7',
  primaryDim: '#eef1fe',
  danger: '#ef4444',
  dangerDim: '#fef2f2',
  text: '#111827',
  muted: '#6b7280',
  placeholder: '#9ca3af',
  border: '#e5e7eb',
  card: '#ffffff',
  bg: '#f3f4f8',
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 56 : 48,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: C.card,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: C.text,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: C.text,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  addBtnText: {
    fontSize: 14,
    color: C.primary,
    fontWeight: '500',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: C.text,
  },
  userId: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: C.muted,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  emptyText: {
    fontSize: 14,
    color: C.muted,
  },
  crearBtn: {
    backgroundColor: C.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 8,
  },
  crearBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  contratoCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    gap: 8,
  },
  contratoCardActive: {
    borderColor: C.primary,
    backgroundColor: C.primaryDim,
  },
  contratoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contratoNumeroContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contratoNumero: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  activeBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  contratoEntidad: {
    fontSize: 14,
    color: C.primary,
    fontWeight: '500',
  },
  contratoObjeto: {
    fontSize: 13,
    color: C.muted,
    lineHeight: 18,
  },
  contratoFechas: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  fechaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fechaText: {
    fontSize: 11,
    color: C.muted,
  },
  contratoValor: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  menuItemText: {
    flex: 1,
    fontSize: 14,
    color: C.text,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.dangerDim,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: C.danger,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: C.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: C.text,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: C.muted,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: C.text,
    backgroundColor: C.bg,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.muted,
  },
  createBtn: {
    backgroundColor: C.primary,
  },
  createBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
})