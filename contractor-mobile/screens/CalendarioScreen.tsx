import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import Icon from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { api } from '../lib/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface User {
  id: string;
  email: string;
  user_metadata?: {
    nombre?: string;
  };
}

interface Evento {
  id: string;
  summary: string;
  start: string;
  end?: string;
  location?: string;
  hangoutLink?: string;
  description?: string;
}

interface MarkedDates {
  [date: string]: {
    marked: boolean;
    dotColor: string;
    selected?: boolean;
    selectedColor?: string;
  };
}

export default function CalendarioScreen() {
  const navigation = useNavigation<any>();
  const [user, setUser] = useState<User | null>(null);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [actividades, setActividades] = useState<any[]>([]);
  const [contratos, setContratos] = useState<any[]>([]);
  const [contratoActivo, setContratoActivo] = useState<any | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadContratos();
    }
  }, [user]);

  useEffect(() => {
    if (user && contratoActivo) {
      loadEventosYActividades();
    }
  }, [user, contratoActivo, currentMonth]);

  const loadUser = async () => {
    try {
      const currentUser = await api.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadContratos = async () => {
    if (!user?.id) return;
    try {
      const data = await api.getContratos(user.id);
      setContratos(data);
      if (data.length > 0 && !contratoActivo) {
        setContratoActivo(data[0]);
      }
    } catch (error) {
      console.error('Error loading contratos:', error);
    }
  };

  const loadEventosYActividades = async () => {
    if (!user?.id || !contratoActivo?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      try {
        const eventosData = await api.getEventos(user.id, startOfMonth.toISOString(), endOfMonth.toISOString());
        setEventos(eventosData.eventos || []);
      } catch (e) {
        console.error('Error loading eventos:', e);
        setEventos([]);
      }

      try {
        const actividadesData = await api.getActividades(contratoActivo.id, user.id);
        setActividades(Array.isArray(actividadesData) ? actividadesData : []);
      } catch (e) {
        console.error('Error loading actividades:', e);
        setActividades([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const handleCrearAporte = (evento: Evento) => {
    // Navegar a la pantalla de aporte con los datos del evento
    // Asegurarse de que navigation está disponible
    if (navigation) {
      navigation.navigate('Aporte', {
        descripcion: evento.summary,
        fecha: evento.start,
      });
    } else {
      console.error('Navigation not available');
      Alert.alert('Error', 'No se pudo navegar a la pantalla de aporte');
    }
  };

  const getMarkedDates = (): MarkedDates => {
    const marked: MarkedDates = {};
    
    // Marcar eventos con azul
    eventos.forEach((evento) => {
      const date = evento.start.split('T')[0];
      marked[date] = { marked: true, dotColor: '#3b82f6' };
    });

    // Marcar actividades con verde
    actividades.forEach((actividad) => {
      if (actividad.fechaInicio) {
        const date = new Date(actividad.fechaInicio).toISOString().split('T')[0];
        if (marked[date]) {
          marked[date].dotColor = '#10b981'; // Mostrar verde si hay actividades
        } else {
          marked[date] = { marked: true, dotColor: '#10b981' };
        }
      }
    });

    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: '#3b82f6',
      };
    }
    return marked;
  };

  const getFilteredItems = () => {
    const items = [];
    
    // Filtrar eventos
    const filteredEventos = selectedDate
      ? eventos.filter((evento) => evento.start.split('T')[0] === selectedDate)
      : eventos.slice(0, 10);

    // Filtrar actividades
    const filteredActividades = selectedDate
      ? actividades.filter((actividad) => {
        if (!actividad.fechaInicio) return false;
        const actividadDate = new Date(actividad.fechaInicio).toISOString().split('T')[0];
        return actividadDate === selectedDate;
      })
      : actividades.slice(0, 5);

    return { eventos: filteredEventos, actividades: filteredActividades };
  };

  const { eventos: filteredEventos, actividades: filteredActividades } = getFilteredItems();

  if (loading) return <LoadingSpinner />;

  const monthName = currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  return (
    <View style={styles.container}>
      {/* Contratos selector */}
      {contratos.length > 0 && (
        <TouchableOpacity 
          style={styles.contratoHeader}
          onPress={() => {}} // Placeholder para selector de contratos
        >
          <Text style={styles.contratoLabel}>Contrato Activo:</Text>
          <Text style={styles.contratoValue}>
            {contratoActivo?.numero || contratoActivo?.numeroContrato}
          </Text>
        </TouchableOpacity>
      )}

      {/* Navegación de meses */}
      <View style={styles.monthNavigation}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.monthButton}>
          <Icon name="chevron-back" size={24} color="#3b82f6" />
        </TouchableOpacity>
        <View style={styles.monthInfo}>
          <Text style={styles.monthText}>{monthName}</Text>
          <TouchableOpacity onPress={goToToday} style={styles.todayButton}>
            <Text style={styles.todayButtonText}>Hoy</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={goToNextMonth} style={styles.monthButton}>
          <Icon name="chevron-forward" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      <Calendar
        style={styles.calendar}
        theme={{
          todayTextColor: '#3b82f6',
          selectedDayBackgroundColor: '#3b82f6',
          arrowColor: '#3b82f6',
        }}
        markedDates={getMarkedDates()}
        onDayPress={(day: { dateString: string }) => setSelectedDate(day.dateString)}
        monthFormat={''}
        firstDay={1}
        hideArrows={true}
        hideExtraDays={false}
        disableMonthChange={true}
        showWeekNumbers={false}
        current={currentMonth.toISOString().split('T')[0]}
      />

      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#3b82f6' }]} />
          <Text style={styles.legendText}>Eventos</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
          <Text style={styles.legendText}>Actividades</Text>
        </View>
      </View>

      <View style={styles.eventsContainer}>
        <View style={styles.eventsHeader}>
          <Text style={styles.eventsTitle}>
            {selectedDate ? `Detalles del ${selectedDate}` : 'Próximos eventos y actividades'}
          </Text>
          {selectedDate ? (
            <TouchableOpacity onPress={() => setSelectedDate('')}>
              <Text style={styles.clearText}>Limpiar</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <FlatList
          data={[
            ...filteredActividades.map(a => ({ ...a, _type: 'actividad' })),
            ...filteredEventos.map(e => ({ ...e, _type: 'evento' })),
          ]}
          keyExtractor={(item, index) => `${item._type}-${item.id || index}`}
          renderItem={({ item }) => (
            item._type === 'actividad' ? (
              <View style={styles.actividadCard}>
                <View style={styles.actividadHeader}>
                  <Icon name="checkbox-outline" size={20} color="#10b981" />
                  <View style={styles.actividadContent}>
                    <Text style={styles.actividadTitulo}>{item.titulo}</Text>
                    <Text style={styles.actividadSubtitulo} numberOfLines={1}>
                      {item.descripcion}
                    </Text>
                  </View>
                </View>
                <View style={styles.actividadFooter}>
                  <View style={[styles.estadoBadge, { backgroundColor: '#dcfce7' }]}>
                    <Text style={[styles.estadoText, { color: '#166534' }]}>
                      {item.estado || 'Pendiente'}
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.eventCard}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTime}>
                    {new Date(item.start).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  <TouchableOpacity
                    style={styles.aporteButton}
                    onPress={() => handleCrearAporte(item)}
                  >
                    <Icon name="create-outline" size={16} color="#3b82f6" />
                    <Text style={styles.aporteButtonText}>Crear aporte</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.eventTitle}>{item.summary}</Text>
                {item.location ? (
                  <View style={styles.eventLocation}>
                    <Icon name="location-outline" size={12} color="#9ca3af" />
                    <Text style={styles.eventLocationText}>{item.location}</Text>
                  </View>
                ) : null}
                {item.description ? (
                  <Text style={styles.eventDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}
                {item.hangoutLink ? (
                  <TouchableOpacity
                    style={styles.meetButton}
                    onPress={() => {
                      Alert.alert('Enlace de Meet', item.hangoutLink);
                    }}
                  >
                    <Icon name="logo-google" size={14} color="#3b82f6" />
                    <Text style={styles.meetButtonText}>Unirse a Meet</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            )
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Icon name="calendar-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>
                {selectedDate
                  ? 'No hay eventos o actividades en esta fecha'
                  : 'No hay eventos o actividades próximas'}
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contratoHeader: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e7ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contratoLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  contratoValue: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  monthButton: {
    padding: 8,
  },
  monthInfo: {
    alignItems: 'center',
    gap: 4,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    textTransform: 'capitalize',
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#3b82f6',
    borderRadius: 6,
  },
  todayButtonText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '500',
  },
  calendar: {
    marginBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  legendContainer: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280',
  },
  eventsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  clearText: {
    fontSize: 12,
    color: '#3b82f6',
  },
  eventCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  aporteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  aporteButtonText: {
    fontSize: 11,
    color: '#3b82f6',
    fontWeight: '500',
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  eventLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  eventLocationText: {
    fontSize: 11,
    color: '#9ca3af',
  },
  eventDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 6,
    lineHeight: 16,
  },
  meetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  meetButtonText: {
    fontSize: 12,
    color: '#3b82f6',
  },
  empty: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 12,
  },
  actividadCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  actividadHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  actividadContent: {
    flex: 1,
  },
  actividadTitulo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
  },
  actividadSubtitulo: {
    fontSize: 12,
    color: '#4b5563',
    marginTop: 2,
  },
  actividadFooter: {
    marginTop: 8,
  },
  estadoBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  estadoText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
