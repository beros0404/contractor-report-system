import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../lib/api';
import { ActivityCard } from '../components/ActivityCard';
import { LoadingSpinner } from '../components/LoadingSpinner';

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface User {
  id: string;
  email: string;
  user_metadata?: { nombre?: string };
}

interface Contrato {
  id?: string;
  _id?: string;
  numero?: string;
  numeroContrato?: string;
  entidad?: string;
  fechaFin?: string;
}

interface Actividad {
  id?: string;
  _id?: string;
  titulo: string;
  descripcion?: string;
  numero?: number;
}

interface Aporte {
  id?: string;
  actividadId: string;
  fecha: string;
}

interface Evidencia {
  id?: string;
  actividadId: string;
}

function getContratoId(c: Contrato): string {
  return c.id || c._id || c.numeroContrato || c.numero || '';
}

function getActividadId(a: Actividad): string {
  return a.id || a._id || '';
}

// ─── Componente ──────────────────────────────────────────────────────────────

export default function DashboardScreen({ navigation }: any) {
  const [user, setUser] = useState<User | null>(null);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [contratoActivo, setContratoActivo] = useState<Contrato | null>(null);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [aportes, setAportes] = useState<Aporte[]>([]);
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingActividades, setLoadingActividades] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showContratoModal, setShowContratoModal] = useState(false);

  // ─── Carga ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    (async () => {
      try {
        const currentUser = await api.getCurrentUser();
        if (!currentUser) return;
        setUser(currentUser as User);
        const data = await api.getContratos(currentUser.id);
        const lista = Array.isArray(data) ? data : [];
        setContratos(lista);
        if (lista.length > 0) setContratoActivo(lista[0]);
      } catch (e) {
        console.error('Error init dashboard:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cargarDatos = useCallback(async () => {
    if (!user?.id || !contratoActivo) return;
    const cid = getContratoId(contratoActivo);
    if (!cid) return;
    setLoadingActividades(true);
    try {
      const [acts, aps, evids] = await Promise.all([
        api.getActividades(cid, user.id),
        api.getAportes(cid, user.id),
        api.getEvidencias(cid, user.id),
      ]);
      setActividades(Array.isArray(acts) ? acts : []);
      setAportes(Array.isArray(aps) ? aps : []);
      setEvidencias(Array.isArray(evids) ? evids : []);
    } catch (e) {
      console.error('Error cargando datos:', e);
    } finally {
      setLoadingActividades(false);
      setRefreshing(false);
    }
  }, [user, contratoActivo]);

  useEffect(() => {
    if (user && contratoActivo) cargarDatos();
  }, [user, contratoActivo]);

  useFocusEffect(useCallback(() => {
    if (user && contratoActivo) cargarDatos();
  }, [user, contratoActivo]));

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    cargarDatos();
  }, [cargarDatos]);

  // ─── Métricas ──────────────────────────────────────────────────────────────

  const getAportesCount = (actId: string) =>
    aportes.filter((a) => a.actividadId === actId).length;

  const getEvidenciasCount = (actId: string) =>
    evidencias.filter((e) => e.actividadId === actId).length;

  const getCobertura = (actId: string) => {
    const count = getAportesCount(actId);
    const max = Math.max(...actividades.map((a) => getAportesCount(getActividadId(a))), 1);
    return Math.round((count / max) * 100);
  };

  const aportesHoy = aportes.filter((ap) => {
    const d = new Date(ap.fecha);
    const h = new Date();
    return d.toDateString() === h.toDateString();
  }).length;

  const diasRestantes = (() => {
    if (!contratoActivo?.fechaFin) return null;
    const diff = Math.ceil(
      (new Date(contratoActivo.fechaFin).getTime() - Date.now()) / 86400000
    );
    return Math.max(diff, 0);
  })();

  const progreso = diasRestantes != null
    ? Math.min(100, Math.max(0, Math.round(((30 - diasRestantes) / 30) * 100)))
    : 0;

  // ─── Selector de contrato ──────────────────────────────────────────────────

  const handleSelectContrato = (c: Contrato) => {
    setShowContratoModal(false);
    if (getContratoId(c) !== getContratoId(contratoActivo || {})) {
      setActividades([]);
      setAportes([]);
      setEvidencias([]);
      setContratoActivo(c);
    }
  };

  if (loading) return <LoadingSpinner />;

  const nombre = user?.user_metadata?.nombre || user?.email?.split('@')[0] || 'Usuario';
  const iniciales = nombre.substring(0, 2).toUpperCase();
  const contratoLabel = contratoActivo?.numero || contratoActivo?.numeroContrato || 'Sin contrato';

  // ─── UI ────────────────────────────────────────────────────────────────────

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Hola, {nombre.split(' ')[0]} 👋</Text>
              <TouchableOpacity
                style={styles.contratoBtn}
                onPress={() => setShowContratoModal(true)}
              >
                <Icon name="document-text-outline" size={14} color={COLORS.primaryLight} />
                <Text style={styles.contratoBtnText} numberOfLines={1}>
                  {contratoLabel}
                </Text>
                <Icon name="chevron-down" size={14} color={COLORS.primaryLight} />
              </TouchableOpacity>
            </View>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{iniciales}</Text>
            </View>
          </View>

          {/* Progreso */}
          <View style={styles.progressCard}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Progreso del periodo</Text>
              <Text style={styles.progressPct}>{progreso}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progreso}%` as any }]} />
            </View>
            <Text style={styles.progressSub}>
              {diasRestantes != null ? `${diasRestantes} días restantes` : 'Sin fecha de cierre'}
            </Text>
          </View>
        </View>

        {/* ── Métricas ── */}
        <View style={styles.metricsRow}>
          <MetricCard
            icon="list-outline"
            value={loadingActividades ? '—' : String(actividades.length)}
            label="Actividades"
            color={COLORS.primary}
          />
          <MetricCard
            icon="create-outline"
            value={loadingActividades ? '—' : String(aportes.length)}
            label="Aportes"
            color="#10b981"
          />
          <MetricCard
            icon="attach-outline"
            value={loadingActividades ? '—' : String(evidencias.length)}
            label="Evidencias"
            color="#f59e0b"
          />
        </View>

        {/* ── Acceso rápido ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Acceso rápido</Text>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('Aporte', { contratoParam: contratoActivo })}
          >
            <Icon name="add-circle-outline" size={20} color="#fff" />
            <Text style={styles.primaryBtnText}>Registrar Aporte</Text>
          </TouchableOpacity>

          {/* Estado de hoy */}
          <View style={styles.todayRow}>
            <View style={[styles.todayDot, { backgroundColor: aportesHoy > 0 ? '#10b981' : '#f59e0b' }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.todayStatus}>
                {aportesHoy > 0 ? `${aportesHoy} aporte${aportesHoy !== 1 ? 's' : ''} registrado${aportesHoy !== 1 ? 's' : ''} hoy` : 'Sin aportes hoy'}
              </Text>
              <Text style={styles.todayHint}>
                {aportesHoy > 0 ? 'Continúa documentando tu trabajo' : 'Registra las acciones realizadas hoy'}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Actividades recientes ── */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Actividades recientes</Text>
          </View>

          {loadingActividades ? (
            <View style={styles.centered}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingText}>Cargando...</Text>
            </View>
          ) : actividades.length === 0 ? (
            <View style={styles.emptyBox}>
              <Icon name="document-text-outline" size={36} color={COLORS.border} />
              <Text style={styles.emptyText}>Sin actividades</Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => navigation.navigate('Actividades')}
              >
                <Text style={styles.emptyBtnText}>Ir a Actividades</Text>
              </TouchableOpacity>
            </View>
          ) : (
            actividades.slice(0, 4).map((act) => {
              const actId = getActividadId(act);
              return (
                <ActivityCard
                  key={actId || act.titulo}
                  actividad={act}
                  aportesCount={getAportesCount(actId)}
                  evidenciasCount={getEvidenciasCount(actId)}
                  cobertura={getCobertura(actId)}
                  onPress={() => navigation.navigate('Actividades')}
                  onAddAporte={() =>
                    navigation.navigate('Aporte', {
                      contratoParam: contratoActivo,
                      actividadId: actId,
                    })
                  }
                  onAddEvidencia={() => navigation.navigate('Actividades')}
                />
              );
            })
          )}
        </View>
      </ScrollView>

      {/* ── Modal contrato ── */}
      <Modal
        visible={showContratoModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowContratoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar contrato</Text>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setShowContratoModal(false)}
              >
                <Icon name="close" size={20} color={COLORS.muted} />
              </TouchableOpacity>
            </View>
            {contratos.length === 0 ? (
              <View style={styles.centered}>
                <Text style={styles.emptyText}>No hay contratos disponibles</Text>
              </View>
            ) : (
              <FlatList
                data={contratos}
                keyExtractor={(item, idx) => {
                  const id = getContratoId(item);
                  return id ? `c-${id}` : `c-idx-${idx}`;
                }}
                renderItem={({ item }) => {
                  const itemId = getContratoId(item);
                  const activeId = contratoActivo ? getContratoId(contratoActivo) : '';
                  const active = !!itemId && !!activeId && itemId === activeId;
                  return (
                    <TouchableOpacity
                      style={[styles.modalItem, active && styles.modalItemActive]}
                      onPress={() => handleSelectContrato(item)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.modalItemTitle, active && styles.modalItemTitleActive]}>
                          {item.numero || item.numeroContrato}
                        </Text>
                        {item.entidad ? (
                          <Text style={styles.modalItemSub}>{item.entidad}</Text>
                        ) : null}
                      </View>
                      {active && <Icon name="checkmark-circle" size={20} color={COLORS.primary} />}
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Subcomponente métrica ────────────────────────────────────────────────────

function MetricCard({ icon, value, label, color }: {
  icon: any; value: string; label: string; color: string;
}) {
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: color + '18' }]}>
        <Icon name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

// ─── Colores ─────────────────────────────────────────────────────────────────

const COLORS = {
  primary: '#4f6ef7',
  primaryLight: '#c7d0fd',
  primaryDark: '#3d5bd9',
  muted: '#6b7280',
  border: '#e5e7eb',
  card: '#ffffff',
  bg: '#f3f4f8',
  text: '#111827',
};

// ─── Estilos ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 16, paddingBottom: 40, gap: 12 },

  // Header
  header: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: { fontSize: 13, color: COLORS.primaryLight, marginBottom: 6 },
  contratoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    maxWidth: 220,
  },
  contratoBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  // Progreso
  progressCard: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 12, color: COLORS.primaryLight },
  progressPct: { fontSize: 12, fontWeight: '700', color: '#fff' },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#fff', borderRadius: 3 },
  progressSub: { fontSize: 11, color: COLORS.primaryLight },

  // Métricas
  metricsRow: { flexDirection: 'row', gap: 10 },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  metricIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricValue: { fontSize: 24, fontWeight: '700' },
  metricLabel: { fontSize: 11, color: COLORS.muted },

  // Card genérica
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 18,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  verTodas: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },

  // Botón primario
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  // Hoy
  todayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.bg,
    borderRadius: 12,
    padding: 12,
  },
  todayDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  todayStatus: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  todayHint: { fontSize: 12, color: COLORS.muted, marginTop: 2 },

  // Empty / loading
  centered: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  loadingText: { fontSize: 13, color: COLORS.muted },
  emptyBox: { alignItems: 'center', paddingVertical: 20, gap: 10 },
  emptyText: { fontSize: 13, color: COLORS.muted },
  emptyBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  emptyBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    maxHeight: '75%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalItemActive: { backgroundColor: '#eef1fe' },
  modalItemTitle: { fontSize: 14, fontWeight: '500', color: COLORS.text },
  modalItemTitleActive: { color: COLORS.primary, fontWeight: '600' },
  modalItemSub: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
});