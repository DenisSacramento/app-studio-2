import { SERVICES_CATALOG } from '@/src/constants/services-catalog';
import appointmentsService, { AppointmentItem } from '@/src/services/appointmentsService';
import servicesService from '@/src/services/servicesService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const WORK_START_MINUTES = 8 * 60;
const WORK_END_MINUTES = 20 * 60;
const SLOT_INTERVAL_MINUTES = 30;

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

function formatTimeLabel(totalMinutes: number) {
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const minutes = String(totalMinutes % 60).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function toTotalMinutes(timeLabel: string) {
  const [hours, minutes] = timeLabel.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatStatusLabel(status: AppointmentItem['status']) {
  const statusMap: Record<AppointmentItem['status'], string> = {
    PENDING: 'Pendente',
    CONFIRMED: 'Confirmado',
    COMPLETED: 'Concluído',
    CANCELED: 'Cancelado',
  };

  return statusMap[status] ?? status;
}

function ceilToNextSlot(date: Date, stepMinutes: number) {
  const totalMinutes = date.getHours() * 60 + date.getMinutes();
  const remainder = totalMinutes % stepMinutes;
  if (remainder === 0) {
    return totalMinutes;
  }

  return totalMinutes + (stepMinutes - remainder);
}

export default function AppointmentsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const mode = typeof (params as any)?.mode === 'string' ? (params as any).mode : undefined;
  const today = useMemo(() => new Date(), []);
  const todayDateKey = useMemo(() => formatDateKey(today), [today]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [services, setServices] = useState<
    {
      id: string;
      name: string;
      description?: string | null;
      durationMinutes: number;
      isActive: boolean;
    }[]
  >([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedDateKey, setSelectedDateKey] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [step, setStep] = useState<'services' | 'datetime' | 'confirm' | 'list'>(() => (mode === 'list' ? 'list' : 'services'));

  function normalize(text: string) {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }

  const selectedService = useMemo(
    () => services.find((service) => service.id === selectedServiceId) ?? null,
    [selectedServiceId, services]
  );

  const currentMonthDays = useMemo(() => {
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const days: Date[] = [];

    for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
      days.push(new Date(cursor));
    }

    return days;
  }, [today]);

  const availableTimeSlots = useMemo(() => {
    if (!selectedDateKey || !selectedService) {
      return [] as string[];
    }

    const selectedDate = parseDateKey(selectedDateKey);
    const selectedDuration = selectedService.durationMinutes;

    const existingIntervals = appointments
      .filter((appointment) => appointment.status !== 'CANCELED')
      .filter((appointment) => formatDateKey(new Date(appointment.scheduledAt)) === selectedDateKey)
      .map((appointment) => {
        const start = new Date(appointment.scheduledAt);
        const end = new Date(start.getTime() + appointment.service.durationMinutes * 60 * 1000);
        return { start, end };
      });

    let earliestStartMinutes = WORK_START_MINUTES;
    if (selectedDateKey === todayDateKey) {
      earliestStartMinutes = Math.max(earliestStartMinutes, ceilToNextSlot(new Date(), SLOT_INTERVAL_MINUTES));
    }

    const latestStart = WORK_END_MINUTES - selectedDuration;
    const slots: string[] = [];

    for (let slotMinutes = earliestStartMinutes; slotMinutes <= latestStart; slotMinutes += SLOT_INTERVAL_MINUTES) {
      const slotStart = new Date(selectedDate);
      slotStart.setHours(0, slotMinutes, 0, 0);
      const slotEnd = new Date(slotStart.getTime() + selectedDuration * 60 * 1000);

      const hasConflict = existingIntervals.some((interval) => slotStart < interval.end && slotEnd > interval.start);
      if (!hasConflict) {
        slots.push(formatTimeLabel(slotMinutes));
      }
    }

    return slots;
  }, [appointments, selectedDateKey, selectedService, todayDateKey]);

  const selectedDateLabel = useMemo(() => {
    if (!selectedDateKey) {
      return '';
    }

    return parseDateKey(selectedDateKey).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }, [selectedDateKey]);

  function resetScheduler() {
    setSelectedServiceId(null);
    setSelectedDateKey(todayDateKey);
    setSelectedTime('');
    setStep('services');
  }

  const loadAppointments = useCallback(async () => {
    const response = await appointmentsService.list();
    console.log('APPOINTMENTS RESPONSE:', response);
    console.log(
      'APPOINTMENTS COUNT:',
      Array.isArray(response.appointments) ? response.appointments.length : 'invalid'
    );

    setAppointments(Array.isArray(response.appointments) ? response.appointments : []);
  }, []);

  const loadServices = useCallback(async () => {
    const response = await servicesService.list();
    console.log('SERVICES RESPONSE:', response);

    const activeServices = response.services.filter((service) => service.isActive);
    console.log('ACTIVE SERVICES COUNT:', activeServices.length);

    const refreshedByName = new Map(activeServices.map((item) => [normalize(item.name), item]));

    const orderedServices = SERVICES_CATALOG.map((catalogItem) => {
      const existing = refreshedByName.get(normalize(catalogItem.name));
      if (!existing) {
        return null;
      }

      return {
        ...existing,
        name: catalogItem.name,
        description: catalogItem.description,
        durationMinutes: catalogItem.averageDurationMinutes,
      };
    }).filter((service): service is NonNullable<typeof service> => Boolean(service));

    setServices(orderedServices.length ? orderedServices : activeServices);
  }, []);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      await Promise.all([loadAppointments(), loadServices()]);
    } catch (error: any) {
      Alert.alert('Erro', error?.message ?? 'Falha ao carregar agendamentos');
    } finally {
      setIsLoading(false);
    }
  }, [loadAppointments, loadServices]);

  function goToDateTime() {
    if (!selectedService) {
      Alert.alert('Agendamento', 'Selecione um serviço para continuar.');
      return;
    }

    if (!selectedDateKey) {
      setSelectedDateKey(todayDateKey);
    }
    setSelectedTime('');
    setStep('datetime');
  }

  function goToConfirm() {
    if (!selectedDateKey) {
      Alert.alert('Agendamento', 'Selecione uma data para continuar.');
      return;
    }

    if (!selectedTime) {
      Alert.alert('Agendamento', 'Selecione um horário disponível para continuar.');
      return;
    }

    if (!availableTimeSlots.includes(selectedTime)) {
      Alert.alert('Agendamento', 'O horário selecionado não está mais disponível. Escolha outro horário.');
      return;
    }

    setStep('confirm');
  }

  async function confirmAppointment() {
    if (!selectedService) {
      Alert.alert('Agendamento', 'Selecione um serviço para continuar.');
      setStep('services');
      return;
    }

    if (!selectedDateKey || !selectedTime) {
      Alert.alert('Agendamento', 'Selecione data e horário para continuar.');
      setStep('datetime');
      return;
    }

    const selectedDate = parseDateKey(selectedDateKey);
    const startMinutes = toTotalMinutes(selectedTime);
    const parsedDate = new Date(selectedDate);
    parsedDate.setHours(0, startMinutes, 0, 0);

    if (parsedDate.getTime() < Date.now()) {
      Alert.alert('Agendamento', 'Escolha um horário futuro para continuar.');
      setStep('datetime');
      return;
    }

    try {
      setIsSaving(true);
      await appointmentsService.create({
        serviceId: selectedService.id,
        scheduledAt: parsedDate.toISOString(),
      });
      await loadAppointments();
      Alert.alert('Sucesso', 'Agendamento confirmado com sucesso.');
      resetScheduler();
      setStep('list');
    } catch (error: any) {
      Alert.alert('Erro', error?.message ?? 'Falha ao confirmar agendamento');
    } finally {
      setIsSaving(false);
    }
  }

  function cancelConfirmation() {
    Alert.alert('Não confirmar agendamento?', 'Deseja voltar para a tela inicial ou continuar no agendamento?', [
      {
        text: 'Tela inicial',
        onPress: () => {
          resetScheduler();
          router.push('/home');
        },
      },
      {
        text: 'Voltar ao agendamento',
        onPress: () => setStep('datetime'),
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  useEffect(() => {
    setStep(mode === 'list' ? 'list' : 'services');
  }, [mode]);

  useEffect(() => {
    if (!selectedDateKey) {
      return;
    }

    if (selectedTime && !availableTimeSlots.includes(selectedTime)) {
      setSelectedTime('');
    }
  }, [availableTimeSlots, selectedDateKey, selectedTime]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#A91E63" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View pointerEvents="none" style={styles.backgroundDecor}>
        <View style={[styles.bgBlob, styles.bgBlobTop]} />
        <View style={[styles.bgBlob, styles.bgBlobMiddle]} />
        <View style={[styles.bgBlob, styles.bgBlobBottom]} />
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>Agendamentos</Text>
        <TouchableOpacity onPress={loadData} style={styles.reloadButton}>
          <Text style={styles.reloadText}>Atualizar</Text>
        </TouchableOpacity>
      </View>

      {step === 'services' ? (
        <View style={[styles.panel, styles.panelExpanded]}>
          <Text style={styles.panelTitle}>Escolha o serviço</Text>
          <Text style={styles.panelSubtitle}>Toque no serviço para seguir para data e horário.</Text>

          <FlatList
            data={services}
            keyExtractor={(item) => item.id}
            style={styles.servicesList}
            contentContainerStyle={styles.servicesListContent}
            ListEmptyComponent={<Text style={styles.emptyText}>Nenhum serviço disponível no momento.</Text>}
            ListFooterComponent={(
              <TouchableOpacity style={styles.primaryButton} onPress={goToDateTime}>
                <Text style={styles.primaryButtonText}>Continuar</Text>
              </TouchableOpacity>
            )}
            renderItem={({ item }) => {
              const isSelected = selectedServiceId === item.id;
              return (
                <TouchableOpacity
                  style={[styles.card, isSelected && styles.selectedCard]}
                  onPress={() => setSelectedServiceId(item.id)}
                >
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  {item.description ? <Text style={styles.cardSubtitle}>{item.description}</Text> : null}
                  <Text style={styles.metaText}>{item.durationMinutes} min</Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      ) : null}

      {step === 'datetime' ? (
        <ScrollView
          style={styles.stepScroll}
          contentContainerStyle={styles.stepScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.panel, styles.stepPanel]}>
            <Text style={styles.panelTitle}>Data e horário</Text>
            <Text style={styles.panelSubtitle}>Selecione uma data deste mês e um horário livre.</Text>

            {selectedService ? (
              <View style={styles.summaryBox}>
                <Text style={styles.summaryTitle}>{selectedService.name}</Text>
                <Text style={styles.summaryText}>Tempo médio: {selectedService.durationMinutes} min</Text>
              </View>
            ) : null}

            <Text style={styles.blockTitle}>Datas disponíveis ({today.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })})</Text>
            <View style={styles.dateGrid}>
              {currentMonthDays.map((day) => {
                const dayKey = formatDateKey(day);
                const isSelected = selectedDateKey === dayKey;
                return (
                  <TouchableOpacity
                    key={dayKey}
                    style={[styles.dateChip, isSelected && styles.dateChipSelected]}
                    onPress={() => {
                      setSelectedDateKey(dayKey);
                      setSelectedTime('');
                    }}
                  >
                    <Text style={[styles.dateChipWeekday, isSelected && styles.dateChipTextSelected]}>
                      {day.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                    </Text>
                    <Text style={[styles.dateChipDay, isSelected && styles.dateChipTextSelected]}>{day.getDate()}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {selectedDateKey ? <Text style={styles.selectedDateText}>{selectedDateLabel}</Text> : null}

            <Text style={styles.blockTitle}>Horários disponíveis</Text>
            {availableTimeSlots.length ? (
              <View style={styles.timeGrid}>
                {availableTimeSlots.map((time) => {
                  const isSelected = selectedTime === time;
                  return (
                    <TouchableOpacity
                      key={time}
                      style={[styles.timeChip, isSelected && styles.timeChipSelected]}
                      onPress={() => setSelectedTime(time)}
                    >
                      <Text style={[styles.timeChipText, isSelected && styles.timeChipTextSelected]}>{time}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.noSlotsText}>Sem horários livres para esta data.</Text>
            )}

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep('services')}>
                <Text style={styles.secondaryButtonText}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButtonCompact} onPress={goToConfirm}>
                <Text style={styles.primaryButtonText}>Seguir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      ) : null}

      {step === 'confirm' ? (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Confirmar agendamento</Text>

          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>{selectedService?.name ?? 'Serviço'}</Text>
            <Text style={styles.summaryText}>Data: {selectedDateKey ? parseDateKey(selectedDateKey).toLocaleDateString('pt-BR') : '-'}</Text>
            <Text style={styles.summaryText}>Horário: {selectedTime || '-'}</Text>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, isSaving && styles.buttonDisabled]}
            disabled={isSaving}
            onPress={confirmAppointment}
          >
            <Text style={styles.primaryButtonText}>Confirmar agendamento</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButtonFull} onPress={cancelConfirmation}>
            <Text style={styles.secondaryButtonText}>Não confirmar</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {step === 'list' ? (
        <>
          <View style={styles.topActionArea}>
            <TouchableOpacity style={styles.primaryButton} onPress={() => setStep('services')}>
              <Text style={styles.primaryButtonText}>Novo agendamento</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={appointments}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<Text style={styles.emptyText}>Nenhum agendamento encontrado.</Text>}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{item.service.name}</Text>
                <Text style={styles.cardSubtitle}>{new Date(item.scheduledAt).toLocaleString('pt-BR')}</Text>
                <Text style={styles.status}>{formatStatusLabel(item.status)}</Text>
              </View>
            )}
          />
        </>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5edf7' },
  backgroundDecor: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  bgBlob: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.22,
  },
  bgBlobTop: {
    width: 320,
    height: 320,
    backgroundColor: '#f472b6',
    top: -120,
    right: -80,
  },
  bgBlobMiddle: {
    width: 300,
    height: 300,
    backgroundColor: '#c084fc',
    top: 190,
    left: -130,
  },
  bgBlobBottom: {
    width: 360,
    height: 360,
    backgroundColor: '#9d174d',
    bottom: -170,
    right: -120,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: '#7a1d55' },
  reloadButton: { backgroundColor: '#a21caf', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  reloadText: { color: '#fff', fontWeight: '700' },
  panel: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 14,
  },
  panelExpanded: {
    flex: 1,
    marginBottom: 20,
  },
  panelTitle: { fontSize: 20, fontWeight: '800', color: '#333', marginBottom: 6 },
  panelSubtitle: { color: '#5b5560', marginBottom: 12 },
  stepScroll: { flex: 1 },
  stepScrollContent: { paddingHorizontal: 20, paddingBottom: 24 },
  stepPanel: { marginHorizontal: 0, marginBottom: 0 },
  blockTitle: { fontWeight: '700', color: '#6b3a66', marginBottom: 8, marginTop: 4 },
  dateGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  dateChip: {
    width: 62,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e9d5ff',
    backgroundColor: '#fff',
    paddingVertical: 8,
    alignItems: 'center',
  },
  dateChipSelected: { backgroundColor: '#a21caf', borderColor: '#a21caf' },
  dateChipWeekday: { fontSize: 11, color: '#6b7280', textTransform: 'capitalize' },
  dateChipDay: { marginTop: 3, fontSize: 16, fontWeight: '700', color: '#333' },
  dateChipTextSelected: { color: '#fff' },
  selectedDateText: {
    color: '#5b5560',
    marginBottom: 10,
    textTransform: 'capitalize',
  },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  timeChip: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e9d5ff',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  timeChipSelected: { backgroundColor: '#a21caf', borderColor: '#a21caf' },
  timeChipText: { color: '#6b3a66', fontWeight: '600' },
  timeChipTextSelected: { color: '#fff' },
  noSlotsText: { color: '#8b1d5f', marginBottom: 10 },
  topActionArea: { paddingHorizontal: 20, marginBottom: 8 },
  listContent: { paddingHorizontal: 20, paddingBottom: 20, gap: 10 },
  servicesList: { flex: 1 },
  servicesListContent: { paddingBottom: 16, gap: 10 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3e8ff',
  },
  selectedCard: { borderWidth: 1.5, borderColor: '#a21caf', backgroundColor: '#fdf4ff' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#333' },
  cardSubtitle: { marginTop: 6, color: '#666' },
  metaText: { marginTop: 8, color: '#8b1d5f', fontWeight: '700' },
  status: { marginTop: 8, color: '#8b1d5f', fontWeight: '700' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  primaryButton: {
    backgroundColor: '#a21caf',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  primaryButtonCompact: {
    flex: 1,
    backgroundColor: '#a21caf',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#a21caf',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  secondaryButtonFull: {
    borderWidth: 1,
    borderColor: '#a21caf',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#fff',
  },
  secondaryButtonText: { color: '#8b1d5f', fontWeight: '700' },
  summaryBox: {
    backgroundColor: 'rgba(162, 28, 175, 0.08)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  summaryTitle: { fontWeight: '700', color: '#333', marginBottom: 4 },
  summaryText: { color: '#555' },
  buttonDisabled: { opacity: 0.6 },
  emptyText: { textAlign: 'center', color: '#666', marginTop: 40 },
});
