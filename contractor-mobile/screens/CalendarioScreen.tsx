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

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadEventos();
    }
  }, [user]);

  const loadUser = async () => {
    try {
      const currentUser = await api.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadEventos = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      const data = await api.getEventos(
        user.id,
        startOfMonth.toISOString(),
        endOfMonth.toISOString()
      );
      setEventos(data.eventos || []);
    } catch (error) {
      console.error('Error loading eventos:', error);
    } finally {
      setLoading(false);
    }
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
    eventos.forEach((evento) => {
      const date = evento.start.split('T')[0];
      marked[date] = { marked: true, dotColor: '#3b82f6' };
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

  const filteredEventos: Evento[] = selectedDate
    ? eventos.filter((evento) => evento.start.split('T')[0] === selectedDate)
    : eventos.slice(0, 10);

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <Calendar
        style={styles.calendar}
        theme={{
          todayTextColor: '#3b82f6',
          selectedDayBackgroundColor: '#3b82f6',
          arrowColor: '#3b82f6',
        }}
        markedDates={getMarkedDates()}
        onDayPress={(day: { dateString: string }) => setSelectedDate(day.dateString)}
        monthFormat={'MMMM yyyy'}
        firstDay={1}
      />

      <View style={styles.eventsContainer}>
        <View style={styles.eventsHeader}>
          <Text style={styles.eventsTitle}>
            {selectedDate ? `Eventos del ${selectedDate}` : 'Próximos eventos'}
          </Text>
          {selectedDate ? (
            <TouchableOpacity onPress={() => setSelectedDate('')}>
              <Text style={styles.clearText}>Limpiar</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <FlatList
          data={filteredEventos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
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
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Icon name="calendar-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>
                {selectedDate
                  ? 'No hay eventos en esta fecha'
                  : 'No hay eventos próximos'}
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
  calendar: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
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
});