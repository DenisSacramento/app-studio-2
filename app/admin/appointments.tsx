import appointmentsService from '@/src/services/appointmentsService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type Appointment = {
  id: string;
  userId: string;
  serviceId: string;
  scheduledAt: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    lastName?: string | null;
    email: string;
  };
  service: {
    id: string;
    name: string;
    durationMinutes: number;
    price: string;
  };
};

function isSameDay(dateA: Date, dateB: Date) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

function isSameMonth(dateA: Date, dateB: Date) {
  return dateA.getFullYear() === dateB.getFullYear() && dateA.getMonth() === dateB.getMonth();
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export default function AdminAppointmentsScreen() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingAppointmentId, setUpdatingAppointmentId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELED'>('ALL');
  const [selectedDate, setSelectedDate] = useState<Date>(() => startOfDay(new Date()));

  useEffect(() => {
    loadAppointments();
  }, [filter, selectedDate]);

  async function loadAppointments() {
    try {
      setIsLoading(true);
      const response = await appointmentsService.list();
      console.log('ADMIN APPOINTMENTS RESPONSE:', response);
      console.log(
        'ADMIN APPOINTMENTS COUNT:',
        Array.isArray(response.appointments) ? response.appointments.length : 'invalid'
      );

      const allAppointments = (response.appointments || []) as Appointment[];
      const selectedDay = startOfDay(selectedDate);

      const filteredAppointments = allAppointments.filter((appointment) => {
        const appointmentDate = new Date(appointment.scheduledAt);

        if (filter === 'ALL') {
          return true;
        }

        if (filter === 'PENDING') {
          // "Pendentes": mostra todos os ainda não confirmados.
          return appointment.status === 'PENDING';
        }

        // Confirmados/Concluídos/Cancelados: somente do dia selecionado.
        return appointment.status === filter && isSameDay(appointmentDate, selectedDay);
      });
      
      setAppointments(filteredAppointments as Appointment[]);
    } catch (error) {
      console.error('❌ Erro ao carregar agendamentos:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatusChange(
    appointment: Appointment,
    newStatus: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELED'
  ) {
    try {
      setUpdatingAppointmentId(appointment.id);
      await appointmentsService.updateStatus(appointment.id, newStatus);
      await loadAppointments();
      Alert.alert('Sucesso', `Status alterado para ${getStatusLabel(newStatus).toLowerCase()}.`);
    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o status do agendamento.');
    } finally {
      setUpdatingAppointmentId(null);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '#f97316';
      case 'CONFIRMED':
        return '#3b82f6';
      case 'COMPLETED':
        return '#10b981';
      case 'CANCELED':
        return '#ef4444';
      default:
        return '#9ca3af';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendente';
      case 'CONFIRMED':
        return 'Confirmado';
      case 'COMPLETED':
        return 'Concluído';
      case 'CANCELED':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const filterButtons = [
    { key: 'ALL', label: 'Todos' },
    { key: 'PENDING', label: 'Pendentes' },
    { key: 'CONFIRMED', label: 'Confirmados' },
    { key: 'COMPLETED', label: 'Concluídos' },
    { key: 'CANCELED', label: 'Cancelados' },
  ];

  const selectedDateLabel = selectedDate.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const isTodaySelected = isSameDay(selectedDate, new Date());

  return (
    <View style={styles.container}>
      {/* Background decorativo */}
      <View style={[styles.bgBlob, styles.bgBlobTop]} />
      <View style={[styles.bgBlob, styles.bgBlobMiddle]} />
      <View style={[styles.bgBlob, styles.bgBlobBottom]} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#7a1d55" />
        </TouchableOpacity>
        <Text style={styles.title}>Agendamentos</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Filter Buttons */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          {filterButtons.map((btn) => (
            <TouchableOpacity
              key={btn.key}
              style={[
                styles.filterButton,
                filter === btn.key && styles.filterButtonActive,
              ]}
              onPress={() => setFilter(btn.key as any)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filter === btn.key && styles.filterButtonTextActive,
                ]}
              >
                {btn.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.dateSelectorContainer}>
          <TouchableOpacity
            style={styles.dateArrowButton}
            onPress={() => setSelectedDate((prev) => startOfDay(addDays(prev, -1)))}
          >
            <Ionicons name="chevron-back" size={18} color="#7a1d55" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dateTodayButton, isTodaySelected && styles.dateTodayButtonActive]}
            onPress={() => setSelectedDate(startOfDay(new Date()))}
          >
            <Text style={[styles.dateTodayButtonText, isTodaySelected && styles.dateTodayButtonTextActive]}>Hoje</Text>
          </TouchableOpacity>

          <View style={styles.dateLabelBox}>
            <Text style={styles.dateLabel}>{selectedDateLabel}</Text>
          </View>

          <TouchableOpacity
            style={styles.dateArrowButton}
            onPress={() => setSelectedDate((prev) => startOfDay(addDays(prev, 1)))}
          >
            <Ionicons name="chevron-forward" size={18} color="#7a1d55" />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#a21caf" />
          </View>
        ) : appointments.length === 0 ? (
          <View style={styles.centerContainer}>
            <Ionicons name="calendar-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>Nenhum agendamento encontrado</Text>
          </View>
        ) : (
          <View style={styles.appointmentsList}>
            {appointments.map((appointment) => (
              <View key={appointment.id} style={styles.appointmentCard}>
                <View style={styles.appointmentCardContent}>
                  <View style={styles.appointmentHeader}>
                    <View>
                      <Text style={styles.clientName}>
                        Cliente: {appointment.user?.name ?? 'Cliente'}
                        {appointment.user?.lastName ? ` ${appointment.user.lastName}` : ''}
                      </Text>
                      <Text style={styles.serviceName}>Serviço: {appointment.service?.name ?? '-'}</Text>
                      <Text style={styles.appointmentDate}>
                        {new Date(appointment.scheduledAt).toLocaleDateString('pt-BR')}
                      </Text>
                      <Text style={styles.appointmentTime}>
                        {new Date(appointment.scheduledAt).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(appointment.status) + '20' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(appointment.status) },
                        ]}
                      >
                        {getStatusLabel(appointment.status)}
                      </Text>
                    </View>
                  </View>
                  {appointment.notes && (
                    <Text style={styles.appointmentNotes}>{appointment.notes}</Text>
                  )}

                  <View style={styles.actionsRow}>
                    {appointment.status === 'PENDING' && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.approveButton, updatingAppointmentId === appointment.id && styles.actionButtonDisabled]}
                        disabled={updatingAppointmentId === appointment.id}
                        onPress={() => handleStatusChange(appointment, 'CONFIRMED')}
                      >
                        <Text style={styles.actionButtonText}>Aprovar</Text>
                      </TouchableOpacity>
                    )}

                    {appointment.status === 'CONFIRMED' && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.completeButton, updatingAppointmentId === appointment.id && styles.actionButtonDisabled]}
                        disabled={updatingAppointmentId === appointment.id}
                        onPress={() => handleStatusChange(appointment, 'COMPLETED')}
                      >
                        <Text style={styles.actionButtonText}>Concluir</Text>
                      </TouchableOpacity>
                    )}

                    {(appointment.status === 'PENDING' || appointment.status === 'CONFIRMED') && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.cancelButton, updatingAppointmentId === appointment.id && styles.actionButtonDisabled]}
                        disabled={updatingAppointmentId === appointment.id}
                        onPress={() => handleStatusChange(appointment, 'CANCELED')}
                      >
                        <Text style={styles.actionButtonText}>Cancelar</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5edf7',
  },
  scrollView: {
    flex: 1,
  },
  bgBlob: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.22,
  },
  bgBlobTop: {
    width: 400,
    height: 400,
    top: -100,
    right: -100,
    backgroundColor: '#ffc0cb',
  },
  bgBlobMiddle: {
    width: 300,
    height: 300,
    top: '30%',
    left: -50,
    backgroundColor: '#da70d6',
  },
  bgBlobBottom: {
    width: 350,
    height: 350,
    bottom: -50,
    right: 50,
    backgroundColor: '#c91585',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#7a1d55',
  },
  headerPlaceholder: {
    width: 40,
  },
  filterContainer: {
    paddingHorizontal: 10,
    paddingVertical: 12,
    zIndex: 10,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterButtonActive: {
    backgroundColor: '#a21caf',
    borderColor: '#a21caf',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  dateSelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
    zIndex: 10,
  },
  dateArrowButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dateTodayButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dateTodayButtonActive: {
    backgroundColor: '#a21caf',
    borderColor: '#a21caf',
  },
  dateTodayButtonText: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '700',
  },
  dateTodayButtonTextActive: {
    color: '#fff',
  },
  dateLabelBox: {
    minWidth: 170,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7a1d55',
    textTransform: 'capitalize',
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 16,
  },
  appointmentsList: {
    paddingHorizontal: 10,
    zIndex: 10,
  },
  appointmentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 12,
    marginHorizontal: 10,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  appointmentCardContent: {
    padding: 16,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  appointmentDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7a1d55',
    marginTop: 4,
  },
  clientName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7a1d55',
  },
  serviceName: {
    fontSize: 12,
    color: '#8b1d5f',
    marginTop: 2,
  },
  appointmentTime: {
    fontSize: 16,
    fontWeight: '700',
    color: '#a21caf',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  appointmentNotes: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    lineHeight: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  approveButton: {
    backgroundColor: '#2563eb',
  },
  completeButton: {
    backgroundColor: '#059669',
  },
  cancelButton: {
    backgroundColor: '#dc2626',
  },
  footer: {
    height: 40,
  },
});
