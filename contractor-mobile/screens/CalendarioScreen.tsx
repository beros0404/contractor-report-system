import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Icon from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../lib/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface Contrato {
  id?: string;
  _id?: string;
  numero?: string;
  numeroContrato?: string;
  entidad?: string;
}

interface Evento {
  id: string;
  summary: string;
  title?: string;
  start: string;
  end?: string;
  location?: string;
  hangoutLink?: string;
  description?: string;
}

interface Actividad {
  id?: string;
  _id?: string;
  titulo: string;
  descripcion?: string;
  numero?: number;
  estado?: string;
}

interface EventoForm {
  summary: string;
  description: string;
  start: Date;
  end: Date;
  location: string;
}

function getContratoId(c: Contrato | null): string {
  if (!c) return '';
  return c.id || c._id || c.numeroContrato || c.numero || '';
}

function getActividadId(a: Actividad): string {
  return a.id || a._id || '';
}

function formatHora(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
}

function formatFecha(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return iso; }
}

function dateToISO(d: Date): string {
  return d.toISOString().split('T')[0];
}

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// ─── Componente principal ────────────────────────────────────────────────────

export default function CalendarioScreen({ navigation }: any) {
  const [userId, setUserId] = useState<string | null>(null);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [contratoActivo, setContratoActivo] = useState<Contrato | null>(null);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(dateToISO(new Date()));
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [loadingEventos, setLoadingEventos] = useState(false);
  const [googleConectado, setGoogleConectado] = useState(true);

  // Modales
  const [showContratoModal, setShowContratoModal] = useState(false);
  const [showEventoModal, setShowEventoModal] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null);
  const [showEventoDetalle, setShowEventoDetalle] = useState(false);

  // Form nuevo evento
  const emptyForm: EventoForm = {
    summary: '',
    description: '',
    start: new Date(),
    end: new Date(Date.now() + 3600000),
    location: '',
  };
  const [form, setForm] = useState<EventoForm>(emptyForm);
  const [savingEvento, setSavingEvento] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [activePicker, setActivePicker] = useState<'start' | 'end'>('start');

  // ─── Init ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    (async () => {
      try {
        const user = await api.getCurrentUser();
        if (!user) return;
        setUserId(user.id);
        const data = await api.getContratos(user.id);
        const lista = Array.isArray(data) ? data : [];
        setContratos(lista);
        if (lista.length > 0) setContratoActivo(lista[0]);
        await verificarGoogle(user.id);
      } catch (e) {
        console.error('Error init calendario:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useFocusEffect(useCallback(() => {
    if (userId && contratoActivo) {
      cargarDatos();
    }
  }, [userId, contratoActivo, currentMonth]));

  useEffect(() => {
    if (userId && contratoActivo) cargarDatos();
  }, [userId, contratoActivo, currentMonth]);

  const verificarGoogle = async (uid: string) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/google/status?usuarioId=${uid}`);
      if (res.ok) {
        const data = await res.json();
        setGoogleConectado(data.conectado ?? true);
      }
    } catch { /* silencioso */ }
  };

  const cargarDatos = async () => {
    if (!userId || !contratoActivo) return;
    const cid = getContratoId(contratoActivo);
    setLoadingEventos(true);
    try {
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const [actData, evData] = await Promise.allSettled([
        api.getActividades(cid, userId),
        api.getEventos(userId, startOfMonth.toISOString(), endOfMonth.toISOString()),
      ]);

      if (actData.status === 'fulfilled') {
        setActividades(Array.isArray(actData.value) ? actData.value : []);
      }
      if (evData.status === 'fulfilled') {
        setEventos(evData.value?.eventos || []);
      }
    } catch (e) {
      console.error('Error cargando datos calendario:', e);
    } finally {
      setLoadingEventos(false);
    }
  };

  // ─── Calendario marks ─────────────────────────────────────────────────────

  const markedDates = (() => {
    const marks: any = {};
    eventos.forEach((ev) => {
      const d = ev.start?.split('T')[0];
      if (d) marks[d] = { marked: true, dotColor: COLORS.primary };
    });
    if (selectedDate) {
      marks[selectedDate] = {
        ...(marks[selectedDate] || {}),
        selected: true,
        selectedColor: COLORS.primary,
      };
    }
    return marks;
  })();

  // ─── Filtros por fecha ─────────────────────────────────────────────────────

  const eventosDia = selectedDate
    ? eventos.filter((e) => e.start?.split('T')[0] === selectedDate)
    : eventos.slice(0, 10);

  // ─── Crear aporte desde evento ────────────────────────────────────────────

  const handleCrearAporte = (evento: Evento) => {
    if (!contratoActivo) {
      Alert.alert('Sin contrato', 'Selecciona un contrato activo primero');
      return;
    }

    const startDate = new Date(evento.start);
    const endDate = evento.end ? new Date(evento.end) : null;

    const descripcionPrefill = [
      `Reunión: ${evento.summary || evento.title}`,
      evento.description ? `\n${evento.description}` : '',
      `\nFecha: ${formatFecha(evento.start)}`,
      endDate ? `\nHora: ${formatHora(evento.start)} - ${formatHora(evento.end!)}` : '',
      evento.location ? `\nLugar: ${evento.location}` : '',
      evento.hangoutLink ? `\nEnlace: ${evento.hangoutLink}` : '',
    ].join('');

    setShowEventoDetalle(false);
    navigation.navigate('Aporte', {
      contratoParam: contratoActivo,
      descripcion: descripcionPrefill,
    });
  };

  // ─── Guardar evento ───────────────────────────────────────────────────────

  const handleSaveEvento = async () => {
    if (!userId) return;
    if (!form.summary.trim()) {
      Alert.alert('Error', 'El título es requerido');
      return;
    }
    if (form.end <= form.start) {
      Alert.alert('Error', 'La fecha de fin debe ser posterior al inicio');
      return;
    }

    setSavingEvento(true);
    try {
      const payload = {
        summary: form.summary.trim(),
        description: form.description.trim(),
        start: form.start.toISOString(),
        end: form.end.toISOString(),
        location: form.location.trim(),
      };

      const isEdit = !!eventoSeleccionado?.id;
      const url = isEdit
        ? `${API_URL}/api/auth/google/events/${eventoSeleccionado!.id}`
        : `${API_URL}/api/auth/google/events`;

      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId: userId, evento: payload }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || `Error ${res.status}`);
      }

      const saved = await res.json();
      const formateado: Evento = {
        id: saved.id || saved._id,
        summary: saved.summary,
        start: saved.start,
        end: saved.end,
        location: saved.location,
        description: saved.description,
        hangoutLink: saved.hangoutLink,
      };

      if (isEdit) {
        setEventos((prev) => prev.map((e) => (e.id === formateado.id ? formateado : e)));
      } else {
        setEventos((prev) => [...prev, formateado]);
      }

      setShowEventoModal(false);
      setEventoSeleccionado(null);
      setForm(emptyForm);
      Alert.alert('✓', isEdit ? 'Evento actualizado' : 'Evento creado');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo guardar el evento');
    } finally {
      setSavingEvento(false);
    }
  };

  // ─── Eliminar evento ──────────────────────────────────────────────────────

  const handleDeleteEvento = (id: string) => {
    Alert.alert('Eliminar evento', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await fetch(
              `${API_URL}/api/auth/google/events/${id}?usuarioId=${userId}`,
              { method: 'DELETE' }
            );
            if (!res.ok) throw new Error('Error al eliminar');
            setEventos((prev) => prev.filter((e) => e.id !== id));
            setShowEventoDetalle(false);
            setShowEventoModal(false);
          } catch (e: any) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  // ─── Abrir formulario ─────────────────────────────────────────────────────

  const abrirNuevoEvento = () => {
    const startBase = selectedDate ? new Date(selectedDate + 'T09:00:00') : new Date();
    setEventoSeleccionado(null);
    setForm({ ...emptyForm, start: startBase, end: new Date(startBase.getTime() + 3600000) });
    setShowEventoModal(true);
  };

  const abrirEditarEvento = (evento: Evento) => {
    setEventoSeleccionado(evento);
    setForm({
      summary: evento.summary || '',
      description: evento.description || '',
      start: new Date(evento.start),
      end: evento.end ? new Date(evento.end) : new Date(new Date(evento.start).getTime() + 3600000),
      location: evento.location || '',
    });
    setShowEventoDetalle(false);
    setShowEventoModal(true);
  };

  // ─── DateTimePicker helpers ───────────────────────────────────────────────

  const openPicker = (which: 'start' | 'end', mode: 'date' | 'time') => {
    setActivePicker(which);
    setPickerMode(mode);
    if (which === 'start') setShowStartPicker(true);
    else setShowEndPicker(true);
  };

  const handleDateChange = (_: DateTimePickerEvent, date?: Date) => {
    setShowStartPicker(false);
    setShowEndPicker(false);
    if (!date) return;
    setForm((prev) => {
      const updated = { ...prev };
      if (activePicker === 'start') updated.start = date;
      else updated.end = date;
      return updated;
    });
  };

  if (loading) return <LoadingSpinner />;

  const monthLabel = currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  // ─── UI ───────────────────────────────────────────────────────────────────

  return (
    <View style={styles.root}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Calendario</Text>
          <TouchableOpacity
            style={styles.contratoBtn}
            onPress={() => setShowContratoModal(true)}
          >
            <Icon name="document-text-outline" size={13} color={COLORS.primary} />
            <Text style={styles.contratoBtnText} numberOfLines={1}>
              {contratoActivo?.numero || contratoActivo?.numeroContrato || 'Sin contrato'}
            </Text>
            <Icon name="chevron-down" size={13} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={abrirNuevoEvento}>
          <Icon name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {!googleConectado && (
        <View style={styles.alertBanner}>
          <Icon name="logo-google" size={14} color="#92400e" />
          <Text style={styles.alertText}>Conecta Google Calendar para sincronizar eventos</Text>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Navegación de mes ── */}
        <View style={styles.monthNav}>
          <TouchableOpacity
            style={styles.monthBtn}
            onPress={() => {
              const d = new Date(currentMonth);
              d.setMonth(d.getMonth() - 1);
              setCurrentMonth(d);
            }}
          >
            <Icon name="chevron-back" size={22} color={COLORS.primary} />
          </TouchableOpacity>
          <View style={styles.monthCenter}>
            <Text style={styles.monthText}>{monthLabel}</Text>
            <TouchableOpacity
              style={styles.todayBtn}
              onPress={() => {
                setCurrentMonth(new Date());
                setSelectedDate(dateToISO(new Date()));
              }}
            >
              <Text style={styles.todayBtnText}>Hoy</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.monthBtn}
            onPress={() => {
              const d = new Date(currentMonth);
              d.setMonth(d.getMonth() + 1);
              setCurrentMonth(d);
            }}
          >
            <Icon name="chevron-forward" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* ── Calendario ── */}
        <Calendar
          style={styles.calendar}
          theme={{
            todayTextColor: COLORS.primary,
            selectedDayBackgroundColor: COLORS.primary,
            dotColor: COLORS.primary,
            arrowColor: COLORS.primary,
            textDayFontSize: 13,
            textMonthFontSize: 0,
            textDayHeaderFontSize: 12,
            calendarBackground: COLORS.card,
          }}
          markedDates={markedDates}
          onDayPress={(day: { dateString: string }) => setSelectedDate(day.dateString)}
          firstDay={1}
          hideArrows
          hideExtraDays={false}
          disableMonthChange
          current={currentMonth.toISOString().split('T')[0]}
        />

        {/* ── Leyenda ── */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
            <Text style={styles.legendText}>Eventos</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
            <Text style={styles.legendText}>Actividades</Text>
          </View>
        </View>

        {/* ── Eventos del día ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
              {selectedDate
                ? `Eventos del ${new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}`
                : 'Próximos eventos'}
            </Text>
            <View style={styles.sectionActions}>
              {selectedDate && (
                <TouchableOpacity onPress={() => setSelectedDate(dateToISO(new Date()))}>
                  <Text style={styles.clearBtn}>Limpiar</Text>
                </TouchableOpacity>
              )}
              {loadingEventos && <ActivityIndicator size="small" color={COLORS.primary} />}
            </View>
          </View>

          {eventosDia.length === 0 ? (
            <View style={styles.emptyBox}>
              <Icon name="calendar-outline" size={32} color={COLORS.border} />
              <Text style={styles.emptyText}>
                {selectedDate ? 'Sin eventos este día' : 'Sin eventos próximos'}
              </Text>
              <TouchableOpacity style={styles.emptyAddBtn} onPress={abrirNuevoEvento}>
                <Icon name="add" size={14} color={COLORS.primary} />
                <Text style={styles.emptyAddBtnText}>Crear evento</Text>
              </TouchableOpacity>
            </View>
          ) : (
            eventosDia.map((evento) => (
              <TouchableOpacity
                key={evento.id}
                style={styles.eventoCard}
                onPress={() => {
                  setEventoSeleccionado(evento);
                  setShowEventoDetalle(true);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.eventoHeader}>
                  <View style={styles.eventoTimeBox}>
                    <Icon name="time-outline" size={13} color={COLORS.primary} />
                    <Text style={styles.eventoTime}>{formatHora(evento.start)}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.aporteBtn}
                    onPress={() => handleCrearAporte(evento)}
                  >
                    <Icon name="create-outline" size={14} color={COLORS.primary} />
                    <Text style={styles.aporteBtnText}>Crear aporte</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.eventoTitle}>{evento.summary}</Text>
                {evento.location ? (
                  <View style={styles.eventoMeta}>
                    <Icon name="location-outline" size={12} color={COLORS.muted} />
                    <Text style={styles.eventoMetaText} numberOfLines={1}>{evento.location}</Text>
                  </View>
                ) : null}
                {evento.description ? (
                  <Text style={styles.eventoDesc} numberOfLines={2}>{evento.description}</Text>
                ) : null}
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ══ Modal: Seleccionar contrato ══ */}
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
              keyExtractor={(item, idx) => {
                const id = getContratoId(item);
                return id ? `c-${id}` : `c-${idx}`;
              }}
              renderItem={({ item }) => {
                const itemId = getContratoId(item);
                const activeId = getContratoId(contratoActivo);
                const active = !!itemId && !!activeId && itemId === activeId;
                return (
                  <TouchableOpacity
                    style={[styles.modalItem, active && styles.modalItemActive]}
                    onPress={() => {
                      setContratoActivo(item);
                      setActividades([]);
                      setEventos([]);
                      setShowContratoModal(false);
                    }}
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

      {/* ══ Modal: Detalle evento ══ */}
      <Modal visible={showEventoDetalle} transparent animationType="slide" onRequestClose={() => setShowEventoDetalle(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={2}>
                {eventoSeleccionado?.summary}
              </Text>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowEventoDetalle(false)}>
                <Icon name="close" size={20} color={COLORS.muted} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ padding: 20 }}>
              {eventoSeleccionado && (
                <>
                  <DetalleRow icon="time-outline" label="Inicio" value={`${formatFecha(eventoSeleccionado.start)} ${formatHora(eventoSeleccionado.start)}`} />
                  {eventoSeleccionado.end && <DetalleRow icon="time-outline" label="Fin" value={`${formatFecha(eventoSeleccionado.end)} ${formatHora(eventoSeleccionado.end)}`} />}
                  {eventoSeleccionado.location && <DetalleRow icon="location-outline" label="Lugar" value={eventoSeleccionado.location} />}
                  {eventoSeleccionado.description && <DetalleRow icon="document-text-outline" label="Descripción" value={eventoSeleccionado.description} />}
                  {eventoSeleccionado.hangoutLink && <DetalleRow icon="logo-google" label="Meet" value={eventoSeleccionado.hangoutLink} />}

                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={() => handleCrearAporte(eventoSeleccionado)}
                  >
                    <Icon name="create-outline" size={18} color="#fff" />
                    <Text style={styles.primaryBtnText}>Crear aporte desde este evento</Text>
                  </TouchableOpacity>

                  <View style={styles.detalleActions}>
                    <TouchableOpacity style={styles.editBtn} onPress={() => abrirEditarEvento(eventoSeleccionado)}>
                      <Icon name="pencil-outline" size={16} color={COLORS.primary} />
                      <Text style={styles.editBtnText}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteEvento(eventoSeleccionado.id)}>
                      <Icon name="trash-outline" size={16} color="#ef4444" />
                      <Text style={styles.deleteBtnText}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ══ Modal: Crear / Editar evento ══ */}
      <Modal visible={showEventoModal} transparent animationType="slide" onRequestClose={() => setShowEventoModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { maxHeight: '90%' }]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {eventoSeleccionado ? 'Editar evento' : 'Nuevo evento'}
              </Text>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowEventoModal(false)}>
                <Icon name="close" size={20} color={COLORS.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formScroll} keyboardShouldPersistTaps="handled">
              <FormField label="Título *">
                <TextInput
                  style={styles.input}
                  value={form.summary}
                  onChangeText={(v) => setForm((p) => ({ ...p, summary: v }))}
                  placeholder="Nombre del evento"
                  placeholderTextColor={COLORS.placeholder}
                />
              </FormField>

              <FormField label="Descripción">
                <TextInput
                  style={[styles.input, styles.textarea]}
                  value={form.description}
                  onChangeText={(v) => setForm((p) => ({ ...p, description: v }))}
                  placeholder="Descripción del evento"
                  placeholderTextColor={COLORS.placeholder}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </FormField>

              <FormField label="Inicio">
                <View style={styles.dateRow}>
                  <TouchableOpacity style={styles.dateBtn} onPress={() => openPicker('start', 'date')}>
                    <Icon name="calendar-outline" size={15} color={COLORS.muted} />
                    <Text style={styles.dateBtnText}>{form.start.toLocaleDateString('es-ES')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.dateBtn} onPress={() => openPicker('start', 'time')}>
                    <Icon name="time-outline" size={15} color={COLORS.muted} />
                    <Text style={styles.dateBtnText}>{form.start.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</Text>
                  </TouchableOpacity>
                </View>
              </FormField>

              <FormField label="Fin">
                <View style={styles.dateRow}>
                  <TouchableOpacity style={styles.dateBtn} onPress={() => openPicker('end', 'date')}>
                    <Icon name="calendar-outline" size={15} color={COLORS.muted} />
                    <Text style={styles.dateBtnText}>{form.end.toLocaleDateString('es-ES')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.dateBtn} onPress={() => openPicker('end', 'time')}>
                    <Icon name="time-outline" size={15} color={COLORS.muted} />
                    <Text style={styles.dateBtnText}>{form.end.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</Text>
                  </TouchableOpacity>
                </View>
              </FormField>

              <FormField label="Lugar">
                <TextInput
                  style={styles.input}
                  value={form.location}
                  onChangeText={(v) => setForm((p) => ({ ...p, location: v }))}
                  placeholder="Ubicación (opcional)"
                  placeholderTextColor={COLORS.placeholder}
                />
              </FormField>

              <TouchableOpacity
                style={[styles.primaryBtn, savingEvento && { opacity: 0.6 }]}
                onPress={handleSaveEvento}
                disabled={savingEvento}
              >
                {savingEvento
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <><Icon name="checkmark" size={18} color="#fff" /><Text style={styles.primaryBtnText}>{eventoSeleccionado ? 'Actualizar' : 'Crear evento'}</Text></>
                }
              </TouchableOpacity>

              {eventoSeleccionado && (
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteEvento(eventoSeleccionado.id)}
                >
                  <Icon name="trash-outline" size={16} color="#ef4444" />
                  <Text style={styles.deleteBtnText}>Eliminar evento</Text>
                </TouchableOpacity>
              )}

              <View style={{ height: 32 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* DateTimePicker nativo */}
      {(showStartPicker || showEndPicker) && (
        <DateTimePicker
          value={activePicker === 'start' ? form.start : form.end}
          mode={pickerMode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}
    </View>
  );
}

// ─── Subcomponentes ──────────────────────────────────────────────────────────

function DetalleRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.detalleRow}>
      <Icon name={icon} size={16} color={COLORS.muted} style={{ marginTop: 2 }} />
      <View style={{ flex: 1 }}>
        <Text style={styles.detalleLabel}>{label}</Text>
        <Text style={styles.detalleValue}>{value}</Text>
      </View>
    </View>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>{label}</Text>
      {children}
    </View>
  );
}

// ─── Colores ─────────────────────────────────────────────────────────────────

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

// ─── Estilos ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: { gap: 6 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  contratoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  contratoBtnText: { fontSize: 12, fontWeight: '600', color: COLORS.primary, maxWidth: 180 },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Alert
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#fde68a',
  },
  alertText: { fontSize: 12, color: '#92400e', flex: 1 },

  // Mes
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: COLORS.card,
  },
  monthBtn: { padding: 8 },
  monthCenter: { alignItems: 'center', gap: 4 },
  monthText: { fontSize: 15, fontWeight: '600', color: COLORS.text, textTransform: 'capitalize' },
  todayBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 3, borderRadius: 10 },
  todayBtnText: { fontSize: 11, color: '#fff', fontWeight: '600' },

  // Calendario
  calendar: { backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border },

  // Leyenda
  legend: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: COLORS.muted },

  // Secciones
  section: { padding: 16, gap: 10 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  clearBtn: { fontSize: 12, color: COLORS.primary, fontWeight: '500' },

  // Actividad card
  actividadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actividadLeft: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  actividadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981', marginTop: 5, flexShrink: 0 },
  actividadTitulo: { fontSize: 13, fontWeight: '600', color: COLORS.text, lineHeight: 18 },
  actividadDesc: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  actAporteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    flexShrink: 0,
  },
  actAporteBtnText: { fontSize: 11, color: COLORS.primary, fontWeight: '600' },

  // Evento card
  eventoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  eventoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eventoTimeBox: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  eventoTime: { fontSize: 12, color: COLORS.primary, fontWeight: '500' },
  aporteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  aporteBtnText: { fontSize: 11, color: COLORS.primary, fontWeight: '600' },
  eventoTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  eventoMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  eventoMetaText: { fontSize: 11, color: COLORS.muted, flex: 1 },
  eventoDesc: { fontSize: 12, color: COLORS.muted, lineHeight: 16 },

  // Empty
  emptyBox: { alignItems: 'center', paddingVertical: 24, gap: 10 },
  emptyText: { fontSize: 13, color: COLORS.muted },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  emptyAddBtnText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },

  // Modal base
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    maxHeight: '80%',
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
  modalTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, flex: 1 },
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

  // Detalle evento
  detalleRow: {
    flexDirection: 'row', gap: 12, marginBottom: 14,
    paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  detalleLabel: { fontSize: 11, color: COLORS.muted, fontWeight: '600', textTransform: 'uppercase', marginBottom: 2 },
  detalleValue: { fontSize: 14, color: COLORS.text, lineHeight: 20 },
  detalleActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  editBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderWidth: 1, borderColor: COLORS.primary,
    paddingVertical: 12, borderRadius: 12,
  },
  editBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
  deleteBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderWidth: 1, borderColor: '#ef4444',
    paddingVertical: 12, borderRadius: 12,
  },
  deleteBtnText: { fontSize: 14, fontWeight: '600', color: '#ef4444' },

  // Botón primario
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: COLORS.primary,
    paddingVertical: 14, borderRadius: 12, marginTop: 16,
  },
  primaryBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  // Formulario evento
  formScroll: { padding: 20 },
  formField: { marginBottom: 16 },
  formLabel: {
    fontSize: 11, fontWeight: '600', textTransform: 'uppercase',
    letterSpacing: 0.5, color: COLORS.muted, marginBottom: 8,
  },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, color: COLORS.text, backgroundColor: COLORS.bg,
  },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  dateRow: { flexDirection: 'row', gap: 10 },
  dateBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 10, backgroundColor: COLORS.bg,
  },
  dateBtnText: { fontSize: 13, color: COLORS.text },
});