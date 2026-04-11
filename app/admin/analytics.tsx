import reportsService from '@/src/services/reportsService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type PeriodType = 'MONTH' | 'YEAR';

type AnalyticsData = {
  month: {
    totalAppointments: number;
    statusCounts: {
      PENDING: number;
      CONFIRMED: number;
      COMPLETED: number;
      CANCELED: number;
    };
    topServices: {
      serviceId: string;
      name: string;
      count: number;
    }[];
  };
  year: {
    totalAppointments: number;
    statusCounts: {
      PENDING: number;
      CONFIRMED: number;
      COMPLETED: number;
      CANCELED: number;
    };
    topServices: {
      serviceId: string;
      name: string;
      count: number;
    }[];
  };
  activeValidClients: number;
  referenceDate: string;
};

const EMPTY_ANALYTICS: AnalyticsData = {
  month: {
    totalAppointments: 0,
    statusCounts: {
      PENDING: 0,
      CONFIRMED: 0,
      COMPLETED: 0,
      CANCELED: 0,
    },
    topServices: [],
  },
  year: {
    totalAppointments: 0,
    statusCounts: {
      PENDING: 0,
      CONFIRMED: 0,
      COMPLETED: 0,
      CANCELED: 0,
    },
    topServices: [],
  },
  activeValidClients: 0,
  referenceDate: new Date().toISOString(),
};

export default function AdminAnalyticsScreen() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData>(EMPTY_ANALYTICS);
  const [period, setPeriod] = useState<PeriodType>('MONTH');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  async function loadSummary() {
    try {
      setIsLoading(true);
      const response = await reportsService.getSummary();
      setAnalytics(response.summary);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      setAnalytics(EMPTY_ANALYTICS);
    } finally {
      setIsLoading(false);
    }
  }

  const currentPeriod = useMemo(() => {
    return period === 'MONTH' ? analytics.month : analytics.year;
  }, [analytics, period]);

  const periodLabel = period === 'MONTH' ? 'mês atual' : 'ano atual';

  const statusTotal = useMemo(() => {
    const s = currentPeriod.statusCounts;
    return s.PENDING + s.CONFIRMED + s.COMPLETED + s.CANCELED;
  }, [currentPeriod]);

  const getStatusPercentage = (value: number) => {
    if (!statusTotal) {
      return '0';
    }

    return ((value / statusTotal) * 100).toFixed(0);
  };

  const periodButtons: { key: PeriodType; label: string }[] = [
    { key: 'MONTH', label: 'Mês' },
    { key: 'YEAR', label: 'Ano' },
  ];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#a21caf" />
        <Text style={styles.loadingText}>Carregando relatório...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.bgBlob, styles.bgBlobTop]} />
      <View style={[styles.bgBlob, styles.bgBlobMiddle]} />
      <View style={[styles.bgBlob, styles.bgBlobBottom]} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#7a1d55" />
        </TouchableOpacity>
        <Text style={styles.title}>Relatórios</Text>
        <TouchableOpacity onPress={loadSummary} style={styles.refreshButton}>
          <Ionicons name="refresh" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.periodSelector}>
          {periodButtons.map((btn) => (
            <TouchableOpacity
              key={btn.key}
              style={[styles.periodButton, period === btn.key && styles.periodButtonActive]}
              onPress={() => setPeriod(btn.key)}
            >
              <Text style={[styles.periodButtonText, period === btn.key && styles.periodButtonTextActive]}>
                {btn.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={styles.metricIcon}>
              <Ionicons name="calendar" size={24} color="#3b82f6" />
            </View>
            <Text style={styles.metricValue}>{currentPeriod.totalAppointments}</Text>
            <Text style={styles.metricLabel}>Agendamentos ({periodLabel})</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricIcon}>
              <Ionicons name="people" size={24} color="#16a34a" />
            </View>
            <Text style={styles.metricValue}>{analytics.activeValidClients}</Text>
            <Text style={styles.metricLabel}>Clientes ativos válidos</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Status dos agendamentos ({periodLabel})</Text>

          <View style={styles.statusList}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Confirmados</Text>
              <View style={styles.statusCount}>
                <Text style={styles.statusCountText}>{currentPeriod.statusCounts.CONFIRMED}</Text>
                <Text style={styles.statusPercentage}>{getStatusPercentage(currentPeriod.statusCounts.CONFIRMED)}%</Text>
              </View>
            </View>

            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Concluídos</Text>
              <View style={styles.statusCount}>
                <Text style={styles.statusCountText}>{currentPeriod.statusCounts.COMPLETED}</Text>
                <Text style={styles.statusPercentage}>{getStatusPercentage(currentPeriod.statusCounts.COMPLETED)}%</Text>
              </View>
            </View>

            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Cancelados</Text>
              <View style={styles.statusCount}>
                <Text style={styles.statusCountText}>{currentPeriod.statusCounts.CANCELED}</Text>
                <Text style={styles.statusPercentage}>{getStatusPercentage(currentPeriod.statusCounts.CANCELED)}%</Text>
              </View>
            </View>

            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Pendentes</Text>
              <View style={styles.statusCount}>
                <Text style={styles.statusCountText}>{currentPeriod.statusCounts.PENDING}</Text>
                <Text style={styles.statusPercentage}>{getStatusPercentage(currentPeriod.statusCounts.PENDING)}%</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Ranking de serviços mais agendados ({periodLabel})</Text>

          {currentPeriod.topServices.length ? (
            <View style={styles.servicesList}>
              {currentPeriod.topServices.map((service, index) => (
                <View key={service.serviceId} style={styles.serviceItem}>
                  <Text style={styles.serviceRank}>{index + 1}º</Text>
                  <View style={styles.serviceItemContent}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                  </View>
                  <Text style={styles.serviceBookings}>{service.count} agendamentos</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyRanking}>Nenhum agendamento encontrado para este período.</Text>
          )}
        </View>

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5edf7',
  },
  loadingText: {
    marginTop: 8,
    color: '#7a1d55',
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
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#a21caf',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#7a1d55',
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    zIndex: 10,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  periodButtonActive: {
    backgroundColor: '#a21caf',
    borderColor: '#a21caf',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  metricsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    gap: 10,
    zIndex: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  metricIcon: {
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#7a1d55',
  },
  metricLabel: {
    marginTop: 4,
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 12,
    marginHorizontal: 10,
    marginTop: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7a1d55',
    marginBottom: 12,
  },
  statusList: {
    gap: 10,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
  },
  statusCount: {
    alignItems: 'flex-end',
  },
  statusCountText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7a1d55',
  },
  statusPercentage: {
    fontSize: 11,
    color: '#9ca3af',
  },
  servicesList: {
    gap: 10,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  serviceRank: {
    fontSize: 14,
    fontWeight: '700',
    color: '#a21caf',
    width: 30,
  },
  serviceItemContent: {
    flex: 1,
    marginLeft: 8,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
  },
  serviceBookings: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9ca3af',
  },
  emptyRanking: {
    color: '#9ca3af',
    fontSize: 13,
  },
  footer: {
    height: 40,
  },
});
