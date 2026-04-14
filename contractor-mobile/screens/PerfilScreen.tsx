import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Switch, Alert, ActivityIndicator, Modal, FlatList,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { api } from '../lib/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

// ─── Constantes ───────────────────────────────────────────────────────────────

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const FRECUENCIAS = [
  { value: 'semanal', label: 'Semanal' },
  { value: 'quincenal', label: 'Quincenal' },
  { value: 'mensual', label: 'Mensual' },
];

const ADMINISTRADORES = [
  'Mi planilla', 'Enlace Operativo',
  'SOI (Seguridad Operativa de Información)',
  'Aportes en Línea', 'PILA Virtual', 'Otro',
];

type Tab = 'general' | 'contrato' | 'periodos';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getContratoId(c: any): string {
  return c?.id || c?._id || c?.numeroContrato || c?.numero || '';
}

function formatCurrency(v: number): string {
  if (!v && v !== 0) return '';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(v);
}

function parseCurrency(s: string): number {
  const n = s.replace(/\D/g, '');
  return n ? parseInt(n, 10) : 0;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function PerfilScreen({ navigation }: any) {
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [contratos, setContratos] = useState<any[]>([]);
  const [contratoActivo, setContratoActivo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [showContratoModal, setShowContratoModal] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const u = await api.getCurrentUser();
        if (!u) return;
        setUser(u);
        setUserId(u.id);
        const data = await api.getContratos(u.id);
        const lista = Array.isArray(data) ? data : [];
        setContratos(lista);
        if (lista.length > 0) setContratoActivo(lista[0]);
      } catch (e) {
        console.error('Error init perfil:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión', style: 'destructive',
        onPress: async () => {
          await api.logout();
          navigation.replace('Login');
        },
      },
    ]);
  };

  if (loading) return <LoadingSpinner />;

  const nombre = user?.user_metadata?.nombre || user?.user_metadata?.full_name
    || user?.email?.split('@')[0] || 'Usuario';
  const email = user?.email || '';
  const iniciales = nombre.substring(0, 2).toUpperCase();
  const cid = getContratoId(contratoActivo);

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Avatar ── */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{iniciales}</Text>
          </View>
          <Text style={styles.userName}>{nombre}</Text>
          <Text style={styles.userEmail}>{email}</Text>
        </View>

        {/* ── Selector de contrato ── */}
        {contratos.length > 0 && (
          <TouchableOpacity style={styles.contratoSelector} onPress={() => setShowContratoModal(true)}>
            <Icon name="document-text-outline" size={16} color={COLORS.primary} />
            <Text style={styles.contratoSelectorText} numberOfLines={1}>
              {contratoActivo?.numero || contratoActivo?.numeroContrato || 'Sin contrato'}
            </Text>
            <Icon name="chevron-down" size={14} color={COLORS.primary} />
          </TouchableOpacity>
        )}

        {/* ── Tabs ── */}
        <View style={styles.tabs}>
          {([
            { id: 'general', label: 'General', icon: 'settings-outline' },
            { id: 'contrato', label: 'Contrato', icon: 'document-text-outline' },
            { id: 'periodos', label: 'Periodos', icon: 'calendar-outline' },
          ] as { id: Tab; label: string; icon: any }[]).map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.tab, activeTab === t.id && styles.tabActive]}
              onPress={() => setActiveTab(t.id)}
            >
              <Icon name={t.icon} size={15} color={activeTab === t.id ? COLORS.primary : COLORS.muted} />
              <Text style={[styles.tabText, activeTab === t.id && styles.tabTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Contenido del tab ── */}
        <View style={styles.tabContent}>
          {activeTab === 'general' && (
            <GeneralTab userId={userId} user={user} contratoId={cid} />
          )}
          {activeTab === 'contrato' && (
            <ContratoTab
              userId={userId}
              contratoId={cid}
              contratos={contratos}
              setContratos={setContratos}
              contratoActivo={contratoActivo}
              setContratoActivo={setContratoActivo}
              navigation={navigation}
            />
          )}
          {activeTab === 'periodos' && (
            <PeriodosTab userId={userId} contratoId={cid} />
          )}
        </View>

        {/* ── Logout ── */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Icon name="log-out-outline" size={18} color="#fff" />
          <Text style={styles.logoutBtnText}>Cerrar sesión</Text>
        </TouchableOpacity>
        <Text style={styles.version}>v1.0.0</Text>
      </ScrollView>

      {/* Modal selector contrato */}
      <Modal visible={showContratoModal} transparent animationType="slide" onRequestClose={() => setShowContratoModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar contrato</Text>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowContratoModal(false)}>
                <Icon name="close" size={20} color={COLORS.muted} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={contratos}
              keyExtractor={(item, idx) => getContratoId(item) || `c-${idx}`}
              renderItem={({ item }) => {
                const active = getContratoId(item) === getContratoId(contratoActivo);
                return (
                  <TouchableOpacity
                    style={[styles.modalItem, active && styles.modalItemActive]}
                    onPress={() => { setContratoActivo(item); setShowContratoModal(false); }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.modalItemTitle, active && styles.modalItemTitleActive]}>
                        {item.numero || item.numeroContrato}
                      </Text>
                      {item.entidad ? <Text style={styles.modalItemSub}>{item.entidad}</Text> : null}
                    </View>
                    {active && <Icon name="checkmark-circle" size={20} color={COLORS.primary} />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Tab General ─────────────────────────────────────────────────────────────

function GeneralTab({ userId, user, contratoId }: any) {
  const [nombre, setNombre] = useState(
    user?.user_metadata?.full_name || user?.email?.split('@')[0] || ''
  );
  const [notificaciones, setNotificaciones] = useState(true);
  const [saving, setSaving] = useState(false);
  const [calStatus, setCalStatus] = useState<{ conectado: boolean; loading: boolean; email?: string }>({ conectado: false, loading: true });
  const [driveStatus, setDriveStatus] = useState<{ conectado: boolean; loading: boolean; email?: string }>({ conectado: false, loading: true });
  const [showReset, setShowReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (userId) verificarConexiones();
  }, [userId]);

  const verificarConexiones = async () => {
    try {
      const [calRes, driveRes] = await Promise.allSettled([
        fetch(`${API_URL}/api/auth/google/status?usuarioId=${userId}`),
        fetch(`${API_URL}/api/auth/google/drive/status?usuarioId=${userId}`),
      ]);
      if (calRes.status === 'fulfilled' && calRes.value.ok) {
        const d = await calRes.value.json();
        setCalStatus({ conectado: d.conectado, loading: false, email: d.email });
      } else {
        setCalStatus({ conectado: false, loading: false });
      }
      if (driveRes.status === 'fulfilled' && driveRes.value.ok) {
        const d = await driveRes.value.json();
        setDriveStatus({ conectado: d.conectado, loading: false, email: d.email });
      } else {
        setDriveStatus({ conectado: false, loading: false });
      }
    } catch { 
      setCalStatus({ conectado: false, loading: false });
      setDriveStatus({ conectado: false, loading: false });
    }
  };

  const desconectar = async (tipo: 'calendar' | 'drive') => {
    const endpoint = tipo === 'calendar'
      ? `${API_URL}/api/auth/google/disconnect`
      : `${API_URL}/api/auth/google/drive/disconnect`;
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId: userId }),
      });
      if (res.ok) {
        if (tipo === 'calendar') setCalStatus({ conectado: false, loading: false });
        else setDriveStatus({ conectado: false, loading: false });
        Alert.alert('✓', tipo === 'calendar' ? 'Calendario desconectado' : 'Drive desconectado');
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo desconectar');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`${API_URL}/api/configuracion/${contratoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId: userId, usuario: { nombre, notificaciones } }),
      });
      Alert.alert('✓', 'Preferencias guardadas');
    } catch {
      Alert.alert('Error', 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      await fetch(`${API_URL}/api/configuracion/${contratoId}/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId: userId }),
      });
      setShowReset(false);
      Alert.alert('✓', 'Sistema reiniciado');
    } catch {
      Alert.alert('Error', 'No se pudo reiniciar');
    } finally {
      setResetting(false);
    }
  };

  return (
    <View style={styles.tabInner}>
      {/* Info usuario */}
      <SectionCard title="Información del usuario">
        <FieldLabel label="Nombre completo">
          <TextInput
            style={styles.input}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Tu nombre"
            placeholderTextColor={COLORS.placeholder}
          />
        </FieldLabel>
        <FieldLabel label="Correo electrónico">
          <TextInput
            style={[styles.input, styles.inputReadonly]}
            value={user?.email || ''}
            editable={false}
          />
        </FieldLabel>
      </SectionCard>

      {/* Conexiones Google */}
      <SectionCard title="Conexiones con Google">
        <GoogleRow
          icon="calendar-outline"
          title="Google Calendar"
          status={calStatus}
          onDesconectar={() => Alert.alert(
            'Desconectar Calendar', '¿Seguro?',
            [{ text: 'Cancelar', style: 'cancel' }, { text: 'Desconectar', style: 'destructive', onPress: () => desconectar('calendar') }]
          )}
          onConectar={() => Alert.alert('Conectar', 'Abre la app web para conectar Google Calendar')}
        />
        <View style={styles.divider} />
        <GoogleRow
          icon="logo-google"
          title="Google Drive"
          status={driveStatus}
          onDesconectar={() => Alert.alert(
            'Desconectar Drive', '¿Seguro?',
            [{ text: 'Cancelar', style: 'cancel' }, { text: 'Desconectar', style: 'destructive', onPress: () => desconectar('drive') }]
          )}
          onConectar={() => Alert.alert('Conectar', 'Abre la app web para conectar Google Drive')}
        />
        <Text style={styles.hint}>
          Conecta Google Calendar para ver reuniones y Google Drive para guardar evidencias automáticamente.
        </Text>
      </SectionCard>

      {/* Notificaciones */}
      <SectionCard title="Notificaciones">
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchLabel}>Recordatorios de informe</Text>
            <Text style={styles.switchHint}>Recibir notificaciones cuando se acerque la fecha de generación</Text>
          </View>
          <Switch
            value={notificaciones}
            onValueChange={setNotificaciones}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
            thumbColor="#fff"
          />
        </View>
      </SectionCard>

      {/* Acciones */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.resetBtn} onPress={() => setShowReset(true)}>
          <Icon name="refresh-outline" size={15} color="#ef4444" />
          <Text style={styles.resetBtnText}>Reiniciar sistema</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>Guardar</Text>}
        </TouchableOpacity>
      </View>

      {/* Modal reset */}
      <Modal visible={showReset} transparent animationType="fade" onRequestClose={() => setShowReset(false)}>
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>¿Reiniciar sistema?</Text>
            <Text style={styles.alertBody}>
              Esto eliminará todos los datos y restaurará los valores por defecto. Esta acción no se puede deshacer.
            </Text>
            <View style={styles.alertActions}>
              <TouchableOpacity style={styles.alertCancel} onPress={() => setShowReset(false)}>
                <Text style={styles.alertCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.alertConfirm, resetting && { opacity: 0.6 }]}
                onPress={handleReset}
                disabled={resetting}
              >
                {resetting
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.alertConfirmText}>Confirmar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Tab Contrato ─────────────────────────────────────────────────────────────

function ContratoTab({ userId, contratoId, contratos, setContratos, contratoActivo, setContratoActivo, navigation }: any) {
  const [form, setForm] = useState<any>({
    numero: '', entidad: '', dependenciaContratante: '', objeto: '',
    fechaInicio: '', fechaFin: '', valor: 0,
    contratistaNombre: '', contratistaCedula: '', contratistaProfesion: '',
    supervisorNombre: '', supervisorCargo: '',
    lugarFirma: 'Rionegro',
  });
  const [displayValor, setDisplayValor] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (contratoId) cargarContrato();
    else setLoading(false);
  }, [contratoId]);

  const cargarContrato = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/contracts/${contratoId}?usuarioId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setForm({
          numero: data.numero || '',
          entidad: data.entidad || '',
          dependenciaContratante: data.dependenciaContratante || '',
          objeto: data.objeto || '',
          fechaInicio: data.fechaInicio?.split('T')[0] || '',
          fechaFin: data.fechaFin?.split('T')[0] || '',
          valor: data.valor || 0,
          contratistaNombre: data.contratistaNombre || '',
          contratistaCedula: data.contratistaCedula || '',
          contratistaProfesion: data.contratistaProfesion || '',
          supervisorNombre: data.supervisorNombre || '',
          supervisorCargo: data.supervisorCargo || '',
          lugarFirma: data.lugarFirma || 'Rionegro',
        });
        setDisplayValor(formatCurrency(data.valor));
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo cargar el contrato');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!contratoId) { Alert.alert('Error', 'No hay contrato seleccionado'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/contracts/${contratoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, usuarioId: userId }),
      });
      if (!res.ok) throw new Error();
      Alert.alert('✓', 'Contrato actualizado');
    } catch {
      Alert.alert('Error', 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/api/contracts/${contratoId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      const nuevos = contratos.filter((c: any) => getContratoId(c) !== contratoId);
      setContratos(nuevos);
      setContratoActivo(nuevos[0] || null);
      setShowDelete(false);
      Alert.alert('✓', 'Contrato eliminado');
    } catch {
      Alert.alert('Error', 'No se pudo eliminar');
    } finally {
      setDeleting(false);
    }
  };

  const upd = (k: string, v: string) => setForm((p: any) => ({ ...p, [k]: v }));

  if (loading) return <View style={styles.centered}><ActivityIndicator color={COLORS.primary} /></View>;

  return (
    <View style={styles.tabInner}>
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={() => Alert.alert('Nuevo contrato', 'Usa la app web para crear un nuevo contrato')}
        >
          <Icon name="add" size={15} color="#fff" />
          <Text style={styles.saveBtnText}>Nuevo contrato</Text>
        </TouchableOpacity>
        {contratoId && (
          <TouchableOpacity style={styles.resetBtn} onPress={() => setShowDelete(true)}>
            <Icon name="trash-outline" size={15} color="#ef4444" />
            <Text style={styles.resetBtnText}>Eliminar</Text>
          </TouchableOpacity>
        )}
      </View>

      <SectionCard title="Datos del contrato">
        <FieldLabel label="Número de contrato *">
          <TextInput style={styles.input} value={form.numero} onChangeText={(v) => upd('numero', v)} placeholderTextColor={COLORS.placeholder} />
        </FieldLabel>
        <FieldLabel label="Entidad contratante *">
          <TextInput style={styles.input} value={form.entidad} onChangeText={(v) => upd('entidad', v)} placeholderTextColor={COLORS.placeholder} />
        </FieldLabel>
        <FieldLabel label="Dependencia contratante">
          <TextInput style={styles.input} value={form.dependenciaContratante} onChangeText={(v) => upd('dependenciaContratante', v)} placeholderTextColor={COLORS.placeholder} />
        </FieldLabel>
        <FieldLabel label="Objeto del contrato *">
          <TextInput style={[styles.input, styles.textarea]} value={form.objeto} onChangeText={(v) => upd('objeto', v)} multiline numberOfLines={3} textAlignVertical="top" placeholderTextColor={COLORS.placeholder} />
        </FieldLabel>
        <FieldLabel label="Fecha inicio">
          <TextInput style={styles.input} value={form.fechaInicio} onChangeText={(v) => upd('fechaInicio', v)} placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.placeholder} />
        </FieldLabel>
        <FieldLabel label="Fecha fin">
          <TextInput style={styles.input} value={form.fechaFin} onChangeText={(v) => upd('fechaFin', v)} placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.placeholder} />
        </FieldLabel>
        <FieldLabel label="Valor del contrato">
          <TextInput
            style={styles.input}
            value={displayValor}
            onChangeText={(v) => { setDisplayValor(v); upd('valor', String(parseCurrency(v))); }}
            keyboardType="numeric"
            placeholderTextColor={COLORS.placeholder}
          />
        </FieldLabel>
      </SectionCard>

      <SectionCard title="Datos del contratista">
        <FieldLabel label="Nombre completo *">
          <TextInput style={styles.input} value={form.contratistaNombre} onChangeText={(v) => upd('contratistaNombre', v)} placeholderTextColor={COLORS.placeholder} />
        </FieldLabel>
        <FieldLabel label="Cédula *">
          <TextInput style={styles.input} value={form.contratistaCedula} onChangeText={(v) => upd('contratistaCedula', v)} keyboardType="numeric" placeholderTextColor={COLORS.placeholder} />
        </FieldLabel>
        <FieldLabel label="Profesión">
          <TextInput style={styles.input} value={form.contratistaProfesion} onChangeText={(v) => upd('contratistaProfesion', v)} placeholderTextColor={COLORS.placeholder} />
        </FieldLabel>
      </SectionCard>

      <SectionCard title="Datos del supervisor">
        <FieldLabel label="Nombre del supervisor *">
          <TextInput style={styles.input} value={form.supervisorNombre} onChangeText={(v) => upd('supervisorNombre', v)} placeholderTextColor={COLORS.placeholder} />
        </FieldLabel>
        <FieldLabel label="Cargo del supervisor">
          <TextInput style={styles.input} value={form.supervisorCargo} onChangeText={(v) => upd('supervisorCargo', v)} placeholderTextColor={COLORS.placeholder} />
        </FieldLabel>
      </SectionCard>

      <SectionCard title="Localización de firma">
        <FieldLabel label="Lugar de firma">
          <TextInput style={styles.input} value={form.lugarFirma} onChangeText={(v) => upd('lugarFirma', v)} placeholder="Ej: Rionegro" placeholderTextColor={COLORS.placeholder} />
        </FieldLabel>
        <View style={styles.previewBox}>
          <Text style={styles.previewText}>
            <Text style={{ fontWeight: '600' }}>Vista previa: </Text>
            Para constancia se firma en <Text style={{ fontWeight: '700' }}>{form.lugarFirma || 'Rionegro'}</Text> a los [días] días del mes de [mes] de [año].
          </Text>
        </View>
      </SectionCard>

      <TouchableOpacity
        style={[styles.saveBtn, { alignSelf: 'flex-end' }, saving && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>Guardar cambios</Text>}
      </TouchableOpacity>

      {/* Modal eliminar */}
      <Modal visible={showDelete} transparent animationType="fade" onRequestClose={() => setShowDelete(false)}>
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>¿Eliminar contrato?</Text>
            <Text style={styles.alertBody}>
              Se eliminarán permanentemente el contrato y todos sus datos (actividades, aportes, evidencias, informes).
            </Text>
            <View style={styles.alertActions}>
              <TouchableOpacity style={styles.alertCancel} onPress={() => setShowDelete(false)}>
                <Text style={styles.alertCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.alertConfirm, deleting && { opacity: 0.6 }]}
                onPress={handleDelete}
                disabled={deleting}
              >
                {deleting
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.alertConfirmText}>Eliminar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Tab Periodos ─────────────────────────────────────────────────────────────

function PeriodosTab({ userId, contratoId }: any) {
  const [form, setForm] = useState({
    frecuenciaInforme: 'mensual',
    diaGeneracion: '30',
    periodoActualInicio: '',
    periodoActualFin: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (contratoId && userId) cargarConfig();
    else setLoading(false);
  }, [contratoId, userId]);

  const cargarConfig = async () => {
    try {
      const res = await fetch(`${API_URL}/api/configuracion/${contratoId}?usuarioId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        const r = data.reportes || {};
        setForm({
          frecuenciaInforme: r.frecuencia || 'mensual',
          diaGeneracion: String(r.diaGeneracion || 30),
          periodoActualInicio: r.periodoActualInicio?.split('T')[0] || '',
          periodoActualFin: r.periodoActualFin?.split('T')[0] || '',
        });
      }
    } catch (e) {
      console.error('Error cargando config periodos:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!contratoId || !userId) { Alert.alert('Error', 'No hay contrato seleccionado'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/configuracion/${contratoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuarioId: userId,
          reportes: {
            frecuencia: form.frecuenciaInforme,
            diaGeneracion: parseInt(form.diaGeneracion),
            periodoActualInicio: form.periodoActualInicio,
            periodoActualFin: form.periodoActualFin,
          },
        }),
      });
      if (!res.ok) throw new Error();
      Alert.alert('✓', 'Configuración de periodos guardada');
    } catch {
      Alert.alert('Error', 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator color={COLORS.primary} /></View>;

  return (
    <View style={styles.tabInner}>
      <SectionCard title="Frecuencia de informes">
        <FieldLabel label="Frecuencia">
          <View style={styles.segmented}>
            {FRECUENCIAS.map((f) => (
              <TouchableOpacity
                key={f.value}
                style={[styles.segment, form.frecuenciaInforme === f.value && styles.segmentActive]}
                onPress={() => setForm((p) => ({ ...p, frecuenciaInforme: f.value }))}
              >
                <Text style={[styles.segmentText, form.frecuenciaInforme === f.value && styles.segmentTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </FieldLabel>
        <FieldLabel label="Día de generación">
          <TextInput
            style={[styles.input, { width: 100 }]}
            value={form.diaGeneracion}
            onChangeText={(v) => setForm((p) => ({ ...p, diaGeneracion: v.replace(/\D/g, '') }))}
            keyboardType="numeric"
            maxLength={2}
            placeholderTextColor={COLORS.placeholder}
          />
        </FieldLabel>
      </SectionCard>


      <TouchableOpacity
        style={[styles.saveBtn, { alignSelf: 'flex-end' }, saving && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>Guardar cambios</Text>}
      </TouchableOpacity>
    </View>
  );
}

// ─── Subcomponentes ───────────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionCardTitle}>{title}</Text>
      {children}
    </View>
  );
}

function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.fieldLabel}>
      <Text style={styles.fieldLabelText}>{label}</Text>
      {children}
    </View>
  );
}

function GoogleRow({ icon, title, status, onConectar, onDesconectar }: any) {
  return (
    <View style={styles.googleRow}>
      <View style={styles.googleRowLeft}>
        <View style={styles.googleIconBox}>
          <Icon name={icon} size={18} color={COLORS.primary} />
        </View>
        <View>
          <Text style={styles.googleTitle}>{title}</Text>
          <Text style={styles.googleSub}>
            {status.loading
              ? 'Verificando...'
              : status.conectado
              ? `Conectado${status.email ? ` · ${status.email}` : ''}`
              : 'No conectado'}
          </Text>
        </View>
      </View>
      {status.loading
        ? <ActivityIndicator size="small" color={COLORS.muted} />
        : status.conectado
        ? (
          <TouchableOpacity style={styles.disconnectBtn} onPress={onDesconectar}>
            <Text style={styles.disconnectBtnText}>Desconectar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.connectBtn} onPress={onConectar}>
            <Text style={styles.connectBtnText}>Conectar</Text>
          </TouchableOpacity>
        )}
    </View>
  );
}

// ─── Colores ──────────────────────────────────────────────────────────────────

const COLORS = {
  primary: '#4f6ef7',
  primaryLight: '#eef1fe',
  muted: '#6b7280',
  placeholder: '#9ca3af',
  border: '#e5e7eb',
  card: '#ffffff',
  bg: '#f3f4f8',
  text: '#111827',
};

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 16, paddingBottom: 48, gap: 12 },
  centered: { paddingVertical: 32, alignItems: 'center' },

  // Avatar
  avatarSection: { alignItems: 'center', paddingVertical: 24, gap: 6 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', marginBottom: 4,
  },
  avatarText: { fontSize: 30, fontWeight: '700', color: '#fff' },
  userName: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  userEmail: { fontSize: 13, color: COLORS.muted },

  // Selector contrato
  contratoSelector: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
  },
  contratoSelectorText: { fontSize: 13, fontWeight: '600', color: COLORS.primary, maxWidth: 200 },

  // Tabs
  tabs: {
    flexDirection: 'row', gap: 6,
    backgroundColor: COLORS.card,
    borderRadius: 14, padding: 4,
    borderWidth: 1, borderColor: COLORS.border,
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 10, borderRadius: 10,
  },
  tabActive: { backgroundColor: COLORS.primaryLight },
  tabText: { fontSize: 11, fontWeight: '500', color: COLORS.muted },
  tabTextActive: { color: COLORS.primary, fontWeight: '700' },
  tabContent: { gap: 12 },
  tabInner: { gap: 12 },

  // Section card
  sectionCard: {
    backgroundColor: COLORS.card, borderRadius: 14,
    padding: 16, gap: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  sectionCardTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 4 },

  // Field
  fieldLabel: { gap: 6 },
  fieldLabelText: {
    fontSize: 11, fontWeight: '600', textTransform: 'uppercase',
    letterSpacing: 0.4, color: COLORS.muted,
  },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, color: COLORS.text, backgroundColor: COLORS.bg,
  },
  inputReadonly: { color: COLORS.muted },
  textarea: { minHeight: 80, textAlignVertical: 'top' },

  // Google row
  googleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  googleRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  googleIconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  googleTitle: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  googleSub: { fontSize: 11, color: COLORS.muted, marginTop: 1 },
  connectBtn: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
  },
  connectBtnText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
  disconnectBtn: {
    borderWidth: 1, borderColor: '#fca5a5',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
  },
  disconnectBtnText: { fontSize: 12, fontWeight: '600', color: '#ef4444' },
  hint: { fontSize: 11, color: COLORS.muted, lineHeight: 16, marginTop: 4 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 4 },

  // Switch
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  switchLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  switchHint: { fontSize: 11, color: COLORS.muted, marginTop: 2, lineHeight: 15 },

  // Segmented
  segmented: { flexDirection: 'row', backgroundColor: COLORS.bg, borderRadius: 10, padding: 3 },
  segment: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  segmentActive: { backgroundColor: COLORS.card, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 2, elevation: 1 },
  segmentText: { fontSize: 12, fontWeight: '500', color: COLORS.muted },
  segmentTextActive: { color: COLORS.primary, fontWeight: '700' },

  // Preview
  previewBox: {
    backgroundColor: COLORS.bg, borderRadius: 10,
    padding: 12, marginTop: 4,
    borderWidth: 1, borderColor: COLORS.border,
  },
  previewText: { fontSize: 12, color: COLORS.text, lineHeight: 18 },

  // Action row
  actionRow: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10,
  },
  saveBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  resetBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: '#fca5a5',
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10,
  },
  resetBtnText: { fontSize: 13, fontWeight: '600', color: '#ef4444' },

  // Logout
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#ef4444',
    paddingVertical: 14, borderRadius: 14, marginTop: 8,
  },
  logoutBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  version: { textAlign: 'center', fontSize: 12, color: COLORS.muted, marginTop: 12 },

  // Alert modal
  alertOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  alertBox: {
    backgroundColor: COLORS.card, borderRadius: 16, padding: 24,
    width: '100%', maxWidth: 380,
  },
  alertTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  alertBody: { fontSize: 14, color: COLORS.muted, lineHeight: 20, marginBottom: 20 },
  alertActions: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  alertCancel: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  alertCancelText: { fontSize: 14, color: COLORS.text },
  alertConfirm: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 10, backgroundColor: '#ef4444',
  },
  alertConfirmText: { fontSize: 14, fontWeight: '600', color: '#fff' },

  // Modal contrato
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingBottom: 32, maxHeight: '75%',
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: COLORS.border, alignSelf: 'center',
    marginTop: 12, marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  modalCloseBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center',
  },
  modalItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  modalItemActive: { backgroundColor: COLORS.primaryLight },
  modalItemTitle: { fontSize: 14, fontWeight: '500', color: COLORS.text },
  modalItemTitleActive: { color: COLORS.primary, fontWeight: '600' },
  modalItemSub: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
});