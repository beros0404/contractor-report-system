import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  Platform,
  Animated,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Icon from '@expo/vector-icons/Ionicons';
import { api } from '../lib/api';
import { EvidenciaUpload } from '../components/EvidenciaUpload';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Fecha actual en zona horaria Colombia (UTC-5) como string YYYY-MM-DD */
function getCurrentColombiaDate(): string {
  const now = new Date();
  const colombiaOffset = -5 * 60;
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const colombia = new Date(utc + colombiaOffset * 60000);
  return colombia.toISOString().split('T')[0];
}

/** Convierte un string YYYY-MM-DD a Date interpretado en Colombia */
function colombiaStringToDate(str: string): Date {
  const [year, month, day] = str.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** Devuelve YYYY-MM-DD de un objeto Date usando hora Colombia */
function dateToColombiaString(date: Date): string {
  const colombiaOffset = -5 * 60;
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const colombia = new Date(utc + colombiaOffset * 60000);
  return colombia.toISOString().split('T')[0];
}

/** Formatea YYYY-MM-DD a "DD/MM/YYYY" para mostrar */
function formatDate(str: string): string {
  const [y, m, d] = str.split('-');
  return `${d}/${m}/${y}`;
}

const MAX_DESC = 500;

// ─── Tipos ──────────────────────────────────────────────────────────────────

interface Contrato {
  id: string;
  numero?: string;
  numeroContrato?: string;
  entidad?: string;
  fechaFin?: string;
}

interface Actividad {
  id: string;
  titulo: string;
  descripcion?: string;
  numero?: number;
}

// ─── Componente principal ────────────────────────────────────────────────────

export default function AporteScreen({ navigation, route }: any) {
  const {
    actividadId: preseleccionada,
    descripcion: descripcionPrefill,
  } = route.params || {};

  // — Estado general
  const [userId, setUserId] = useState<string | null>(null);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [contratoActivo, setContratoActivo] = useState<Contrato | null>(null);
  const [actividades, setActividades] = useState<Actividad[]>([]);

  // — Formulario
  const [actividadesSeleccionadas, setActividadesSeleccionadas] = useState<string[]>(
    preseleccionada ? [preseleccionada] : []
  );
  const [fecha, setFecha] = useState(getCurrentColombiaDate());
  const [descripcion, setDescripcion] = useState(descripcionPrefill || '');
  const [errorFecha, setErrorFecha] = useState<string | null>(null);
  const [evidenciasGuardadas, setEvidenciasGuardadas] = useState<any[]>([]);

  // — UI
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showContratoModal, setShowContratoModal] = useState(false);
  const [showActividadModal, setShowActividadModal] = useState(false);

  // — Audio
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [tiempoRestante, setTiempoRestante] = useState(60);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const finalTranscriptRef = useRef('');

  // Animación para el indicador de grabación
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.25, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  // ─── Carga inicial ─────────────────────────────────────────────────────────

  useEffect(() => {
    (async () => {
      try {
        const currentUser = await api.getCurrentUser();
        if (!currentUser) { setLoading(false); return; }
        setUserId(currentUser.id);
        await loadContratos(currentUser.id);
      } catch (e) {
        console.error('Error init:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loadContratos = async (uid: string) => {
    try {
      const data: Contrato[] = await api.getContratos(uid);
      setContratos(data);
      if (data.length > 0) {
        await selectContrato(data[0], uid);
      }
    } catch (e) {
      console.error('Error contratos:', e);
    }
  };

  const selectContrato = async (contrato: Contrato, uid?: string) => {
    const resolvedUid = uid || userId;
    try {
      // Usar el contrato original como fallback
      setContratoActivo(contrato);
      if (resolvedUid && contrato.id) {
        await loadActividades(contrato.id, resolvedUid, contrato);
      }
    } catch (e) {
      console.error('Error en selectContrato:', e);
      // El contrato ya fue seteado arriba, no hacer nada más
    }
  };

  const loadActividades = async (
    contratoId: string,
    uid: string,
    contrato?: Contrato
  ) => {
    try {
      const data: Actividad[] = await api.getActividades(contratoId, uid);
      setActividades(Array.isArray(data) ? data : []);
      // Preseleccionar si viene del route
      if (preseleccionada && data.some((a) => a.id === preseleccionada)) {
        setActividadesSeleccionadas([preseleccionada]);
      }
    } catch (e) {
      console.error('Error actividades:', e);
      setActividades([]);
    }
  };

  // ─── Validación de fecha ───────────────────────────────────────────────────

  useEffect(() => {
    if (contratoActivo?.fechaFin && fecha) {
      const sel = new Date(fecha);
      const fin = new Date(contratoActivo.fechaFin);
      sel.setHours(0, 0, 0, 0);
      fin.setHours(0, 0, 0, 0);
      if (sel > fin) {
        const fechaFinFmt = new Date(contratoActivo.fechaFin).toLocaleDateString('es-CO');
        setErrorFecha(`Fecha posterior al cierre del contrato (${fechaFinFmt})`);
      } else {
        setErrorFecha(null);
      }
    }
  }, [fecha, contratoActivo?.fechaFin]);

  // ─── Selección múltiple de actividades ────────────────────────────────────

  const toggleActividad = (id: string) => {
    setActividadesSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleTodas = () => {
    setActividadesSeleccionadas(
      actividadesSeleccionadas.length === actividades.length
        ? []
        : actividades.map((a) => a.id)
    );
  };

  // ─── Cambio de contrato ───────────────────────────────────────────────────

  const handleChangeContrato = async (contrato: Contrato) => {
    setShowContratoModal(false);
    setActividadesSeleccionadas([]);
    await selectContrato(contrato);
  };

  // ─── Grabación de audio (Web Speech API vía WebView / Expo) ──────────────

  const startRecording = () => {
    try {
      setAudioError(null);
      finalTranscriptRef.current = '';

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setAudioError('Tu dispositivo no soporta reconocimiento de voz');
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      setTiempoRestante(60);
      timerRef.current = setInterval(() => {
        setTiempoRestante((prev) => {
          if (prev <= 1) { stopRecording(); return 0; }
          return prev - 1;
        });
      }, 1000);

      recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscriptRef.current += event.results[i][0].transcript + ' ';
          }
        }
      };

      recognition.onerror = (event: any) => {
        if (timerRef.current) clearInterval(timerRef.current);
        const msgs: Record<string, string> = {
          'not-allowed': 'Permiso de micrófono denegado',
          'no-speech': 'No se detectó voz',
          'network': 'Error de conexión',
        };
        setAudioError(msgs[event.error] || 'Error al grabar audio');
        setIsRecording(false);
        setIsProcessing(false);
      };

      recognition.onend = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (finalTranscriptRef.current.trim()) {
          setIsProcessing(true);
          setTimeout(() => {
            setDescripcion((prev) =>
              prev ? `${prev} ${finalTranscriptRef.current.trim()}` : finalTranscriptRef.current.trim()
            );
            setIsProcessing(false);
          }, 500);
        }
        setIsRecording(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
    } catch (e) {
      setAudioError('Error al iniciar grabación');
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // ─── Evidencias ───────────────────────────────────────────────────────────

  const handleEvidenciaGuardada = (evidencia: any) => {
    setEvidenciasGuardadas((prev) => [...prev, evidencia]);
  };

  // ─── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async (asBorrador: boolean) => {
    if (!contratoActivo?.id || !userId) {
      Alert.alert('Error', 'No hay un contrato seleccionado');
      return;
    }
    if (actividadesSeleccionadas.length === 0) {
      Alert.alert('Error', 'Selecciona al menos una actividad contractual');
      return;
    }
    if (!descripcion.trim() && !asBorrador) {
      Alert.alert('Error', 'La descripción es requerida');
      return;
    }
    if (errorFecha) {
      Alert.alert('Error', errorFecha);
      return;
    }

    setSubmitting(true);
    try {
      const evidenciaIds = evidenciasGuardadas.map((ev) => ev.id || ev._id);
      // Convertir a ISO con zona Colombia
      const fechaISO = colombiaStringToDate(fecha).toISOString();

      await Promise.all(
        actividadesSeleccionadas.map((actividadId) =>
          api.createAporte(
            {
              actividadId,
              fecha: fechaISO,
              descripcion: descripcion.trim() || '(Borrador sin descripción)',
              evidenciaIds,
              estado: asBorrador ? 'borrador' : 'completado',
              monto: 1,
            },
            userId,
            contratoActivo.id
          )
        )
      );

      const msg =
        actividadesSeleccionadas.length === 1
          ? 'la actividad seleccionada'
          : `las ${actividadesSeleccionadas.length} actividades`;

      Alert.alert(
        asBorrador ? '✓ Borrador guardado' : '✓ Aporte enviado',
        `Registrado para ${msg}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      console.error('Error submit:', e);
      Alert.alert('Error', 'No se pudo registrar el aporte');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Renders condicionales ────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  const contratoLabel =
    contratoActivo?.numero ||
    contratoActivo?.numeroContrato ||
    'Seleccionar contrato';

  const selCount = actividadesSeleccionadas.length;
  const maxFechaDate = contratoActivo?.fechaFin
    ? colombiaStringToDate(contratoActivo.fechaFin)
    : undefined;

  // ─── UI ───────────────────────────────────────────────────────────────────

  return (
    <View style={styles.root}>
      {/* Header fijo */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Nuevo Aporte</Text>
          <Text style={styles.headerSub}>
            {contratoActivo?.numero || contratoActivo?.numeroContrato
              ? `Contrato ${contratoLabel}`
              : 'Documenta tu actividad de hoy'}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Card: Contrato & Fecha ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Información general</Text>

          {/* Contrato */}
          <Field label="Contrato activo">
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setShowContratoModal(true)}
            >
              <Icon name="document-text-outline" size={18} color={COLORS.muted} />
              <Text style={styles.selectorText} numberOfLines={1}>
                {contratoLabel}
              </Text>
              <Icon name="chevron-down" size={16} color={COLORS.muted} />
            </TouchableOpacity>
          </Field>

          {/* Fecha */}
          <Field label="Fecha de reporte" error={errorFecha}>
            <TouchableOpacity
              style={[styles.selector, errorFecha ? styles.selectorError : null]}
              onPress={() => setShowDatePicker(true)}
            >
              <Icon name="calendar-outline" size={18} color={COLORS.muted} />
              <Text style={styles.selectorText}>{formatDate(fecha)}</Text>
              <Icon name="chevron-forward" size={16} color={COLORS.muted} />
            </TouchableOpacity>
          </Field>

          {showDatePicker && (
            <DateTimePicker
              value={colombiaStringToDate(fecha)}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={maxFechaDate || new Date()}
              onChange={(_: DateTimePickerEvent, selected?: Date) => {
                setShowDatePicker(false);
                if (selected) setFecha(dateToColombiaString(selected));
              }}
            />
          )}
        </View>

        {/* ── Card: Actividades ── */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.cardTitle}>Actividades contractuales</Text>
              <Text style={styles.cardSub}>
                {selCount === 0
                  ? 'Selecciona al menos una'
                  : `${selCount} seleccionada${selCount !== 1 ? 's' : ''}`}
              </Text>
            </View>
            {actividades.length > 1 && (
              <TouchableOpacity onPress={toggleTodas} style={styles.chipBtn}>
                <Text style={styles.chipBtnText}>
                  {selCount === actividades.length ? 'Ninguna' : 'Todas'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {actividades.length === 0 ? (
            <View style={styles.empty}>
              <Icon name="list-outline" size={32} color={COLORS.border} />
              <Text style={styles.emptyText}>
                No hay actividades para este contrato
              </Text>
            </View>
          ) : (
            actividades.map((act) => {
              const sel = actividadesSeleccionadas.includes(act.id);
              return (
                <TouchableOpacity
                  key={act.id}
                  style={[styles.actItem, sel && styles.actItemSel]}
                  onPress={() => toggleActividad(act.id)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[styles.checkbox, sel && styles.checkboxSel]}
                  >
                    {sel && <Icon name="checkmark" size={12} color="#fff" />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.actTitle, sel && styles.actTitleSel]}>
                      {act.numero != null ? `${act.numero}. ` : ''}
                      {act.titulo}
                    </Text>
                    {act.descripcion ? (
                      <Text style={styles.actDesc} numberOfLines={2}>
                        {act.descripcion}
                      </Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* ── Card: Descripción ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Descripción del aporte
            <Text style={{ color: '#ef4444' }}>*</Text>
          </Text>
          <Text style={styles.cardSub}>
            Campo obligatorio - Describe la acción concreta que realizaste hoy
          </Text>

          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={5}
            value={descripcion}
            onChangeText={setDescripcion}
            placeholder="Describe brevemente la acción..."
            placeholderTextColor={COLORS.placeholder}
            textAlignVertical="top"
            maxLength={MAX_DESC}
          />
          <Text style={styles.charCount}>
            {descripcion.length} / {MAX_DESC}
          </Text>

          {/* Grabación de audio */}
          <View style={styles.audioBox}>
            <View style={styles.audioBoxHeader}>
              <Icon name="mic-outline" size={16} color={COLORS.primary} />
              <Text style={styles.audioBoxTitle}>Dictado por voz</Text>
            </View>

            {!isRecording && !isProcessing && (
              <TouchableOpacity style={styles.audioBtn} onPress={startRecording}>
                <Icon name="mic" size={18} color="#fff" />
                <Text style={styles.audioBtnText}>Grabar (máx. 60 s)</Text>
              </TouchableOpacity>
            )}

            {isRecording && (
              <View style={styles.audioRecordingRow}>
                <Animated.View
                  style={[styles.recordDot, { transform: [{ scale: pulseAnim }] }]}
                />
                <Text style={styles.recordTime}>{tiempoRestante}s</Text>
                <TouchableOpacity
                  style={styles.stopBtn}
                  onPress={stopRecording}
                >
                  <Icon name="stop" size={16} color="#fff" />
                  <Text style={styles.stopBtnText}>Detener</Text>
                </TouchableOpacity>
              </View>
            )}

            {isProcessing && !isRecording && (
              <View style={styles.audioRow}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.audioMuted}>Transcribiendo...</Text>
              </View>
            )}

            {audioError && (
              <View style={styles.audioRow}>
                <Icon name="alert-circle-outline" size={14} color={COLORS.danger} />
                <Text style={styles.audioError}>{audioError}</Text>
              </View>
            )}

            <Text style={styles.audioHint}>
              El texto se añadirá automáticamente al campo de descripción
            </Text>
          </View>
        </View>

        {/* ── Card: Evidencias ── */}
        <View style={[styles.card, !descripcion.trim() && styles.cardDisabled]}>
          <View>
            <Text style={styles.cardTitle}>Evidencias</Text>
            <Text style={styles.cardSub}>
              {descripcion.trim() ? 'Adjunta archivos, enlaces o notas' : 'Primero escribe la descripción del aporte'}
            </Text>
          </View>

          {descripcion.trim() ? (
            <EvidenciaUpload
              actividadId={actividadesSeleccionadas[0] || ''}
              onSuccess={handleEvidenciaGuardada}
            />
          ) : (
            <View style={styles.disabledPlaceholder}>
              <Icon name="lock-closed-outline" size={32} color={COLORS.disabled} />
              <Text style={styles.disabledText}>
                Debes escribir primero la descripción del aporte para poder agregar evidencias
              </Text>
            </View>
          )}

          {evidenciasGuardadas.length > 0 && (
            <View style={styles.evidList}>
              <Text style={styles.evidListTitle}>
                {evidenciasGuardadas.length} evidencia
                {evidenciasGuardadas.length !== 1 ? 's' : ''} guardada
                {evidenciasGuardadas.length !== 1 ? 's' : ''}:
              </Text>
              {evidenciasGuardadas.map((ev, idx) => (
                <View key={idx} style={styles.evidItem}>
                  <View style={styles.evidIcon}>
                    <Icon
                      name={
                        ev.tipo === 'enlace'
                          ? 'link-outline'
                          : ev.tipo === 'nota'
                          ? 'document-text-outline'
                          : 'attach-outline'
                      }
                      size={14}
                      color={COLORS.primary}
                    />
                  </View>
                  <Text style={styles.evidName} numberOfLines={1}>
                    {ev.nombre || ev.archivo?.nombre || 'Evidencia'}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ── Info IA ── */}
        <View style={styles.infoBox}>
          <View style={styles.infoIcon}>
            <Icon name="sparkles" size={16} color={COLORS.primary} />
          </View>
          <Text style={styles.infoText}>
            Al enviar, la IA consolidará este aporte con los anteriores de la misma
            actividad para generar un resumen ejecutivo automático.
          </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Botones flotantes ── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.footerBtn, styles.footerBtnDraft]}
          onPress={() => handleSubmit(true)}
          disabled={submitting || selCount === 0}
        >
          <Icon name="save-outline" size={18} color={COLORS.text} />
          <Text style={styles.footerBtnDraftText}>Borrador</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.footerBtn,
            styles.footerBtnPrimary,
            (submitting || selCount === 0 || !!errorFecha) && styles.footerBtnDisabled,
          ]}
          onPress={() => handleSubmit(false)}
          disabled={submitting || selCount === 0 || !!errorFecha}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Icon name="send" size={18} color="#fff" />
              <Text style={styles.footerBtnPrimaryText}>Enviar aporte</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Modal: Contratos ── */}
      <BottomModal
        visible={showContratoModal}
        title="Seleccionar contrato"
        onClose={() => setShowContratoModal(false)}
      >
        {contratos.length === 0 ? (
          <View style={styles.emptyModal}>
            <Icon name="document-text-outline" size={40} color={COLORS.border} />
            <Text style={styles.emptyModalText}>No hay contratos disponibles</Text>
          </View>
        ) : (
          <FlatList
            data={contratos}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const active = contratoActivo?.id === item.id;
              return (
                <TouchableOpacity
                  style={[styles.modalItem, active && styles.modalItemActive]}
                  onPress={() => handleChangeContrato(item)}
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
      </BottomModal>

      {/* ── Modal: Actividades (solo info; la selección es inline) ── */}
      <BottomModal
        visible={showActividadModal}
        title="Actividades"
        onClose={() => setShowActividadModal(false)}
      >
        <Text style={{ color: COLORS.muted, paddingHorizontal: 16, paddingBottom: 16 }}>
          Selecciona las actividades directamente en el listado.
        </Text>
      </BottomModal>
    </View>
  );
}

// ─── Subcomponentes ──────────────────────────────────────────────────────────

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
      {error ? (
        <View style={styles.fieldError}>
          <Icon name="alert-circle-outline" size={12} color={COLORS.danger} />
          <Text style={styles.fieldErrorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

function BottomModal({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalClose}>
              <Icon name="close" size={22} color={COLORS.muted} />
            </TouchableOpacity>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}

// ─── Colores ─────────────────────────────────────────────────────────────────

const COLORS = {
  primary: '#4f6ef7',
  primaryLight: '#eef1fe',
  danger: '#ef4444',
  dangerLight: '#fef2f2',
  success: '#22c55e',
  text: '#111827',
  muted: '#6b7280',
  placeholder: '#9ca3af',
  border: '#e5e7eb',
  card: '#ffffff',
  bg: '#f3f4f8',
};

// ─── Estilos ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: COLORS.muted },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  headerSub: { fontSize: 12, color: COLORS.muted, marginTop: 1 },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12 },

  // Card
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    marginBottom: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  cardSub: { fontSize: 12, color: COLORS.muted, marginBottom: 14 },

  chipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
  },
  chipBtnText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },

  // Field
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: COLORS.muted,
    marginBottom: 8,
  },
  fieldError: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  fieldErrorText: { fontSize: 11, color: COLORS.danger, flex: 1 },

  // Selector
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
  },
  selectorError: { borderColor: COLORS.danger, backgroundColor: COLORS.dangerLight },
  selectorText: { flex: 1, fontSize: 14, color: COLORS.text },

  // Actividades
  empty: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  emptyText: { fontSize: 13, color: COLORS.muted, textAlign: 'center' },

  actItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
    backgroundColor: COLORS.card,
  },
  actItemSel: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxSel: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  actTitle: { fontSize: 13, fontWeight: '500', color: COLORS.text, lineHeight: 18 },
  actTitleSel: { color: COLORS.primary },
  actDesc: { fontSize: 12, color: COLORS.muted, marginTop: 2, lineHeight: 16 },

  // TextArea
  textArea: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: COLORS.text,
    minHeight: 120,
    textAlignVertical: 'top',
    lineHeight: 20,
  },
  charCount: { fontSize: 11, color: COLORS.muted, textAlign: 'right', marginTop: 6 },

  // Audio
  audioBox: {
    marginTop: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.primary + '50',
    borderRadius: 12,
    padding: 14,
    backgroundColor: COLORS.primaryLight,
    gap: 10,
  },
  audioBoxHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  audioBoxTitle: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  audioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  audioBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  audioRecordingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  recordDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.danger },
  recordTime: { fontSize: 14, fontWeight: '700', color: COLORS.danger, minWidth: 30 },
  stopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.danger,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  stopBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  audioRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  audioMuted: { fontSize: 13, color: COLORS.muted },
  audioError: { fontSize: 12, color: COLORS.danger, flex: 1 },
  audioHint: { fontSize: 11, color: COLORS.muted, lineHeight: 15 },

  // Evidencias
  cardDisabled: {
    opacity: 0.6,
  },
  disabledPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  disabledText: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  evidList: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  evidListTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.muted,
    marginBottom: 10,
  },
  evidItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  evidIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  evidName: { fontSize: 13, color: COLORS.text, flex: 1 },

  // Info box
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
    padding: 16,
    marginTop: 4,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  infoText: { flex: 1, fontSize: 13, color: '#1e40af', lineHeight: 18 },

  // Footer
  footer: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    paddingBottom: 28,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  footerBtnDraft: {
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    flex: 0.8,
  },
  footerBtnDraftText: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  footerBtnPrimary: { backgroundColor: COLORS.primary, flex: 1.2 },
  footerBtnPrimaryText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  footerBtnDisabled: { opacity: 0.45 },

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
    maxHeight: '80%',
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
  modalItemActive: { backgroundColor: COLORS.primaryLight },
  modalItemTitle: { fontSize: 14, fontWeight: '500', color: COLORS.text },
  modalItemTitleActive: { color: COLORS.primary, fontWeight: '600' },
  modalItemSub: { fontSize: 12, color: COLORS.muted, marginTop: 2 },

  emptyModal: { alignItems: 'center', padding: 40, gap: 12 },
  emptyModalText: { fontSize: 14, color: COLORS.muted, textAlign: 'center' },
});
