import appointmentsService from '@/src/services/appointmentsService';
import AuthService from '@/src/services/authService';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type AdminStats = {
  appointmentsToday: number;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats>({
    appointmentsToday: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [todayLabel, setTodayLabel] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  function formatTodayLabel() {
    const now = new Date();
    const label = now.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  function isSameLocalDate(a: Date, b: Date) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  async function loadDashboardData() {
    try {
      setIsLoading(true);
      setTodayLabel(formatTodayLabel());

      const user = await AuthService.getStoredUser();
      setUserData(user);

      const response = await appointmentsService.list();
      const now = new Date();
      const todayCount = response.appointments.filter((appointment) => {
        return isSameLocalDate(new Date(appointment.scheduledAt), now);
      }).length;

      setStats({
        appointmentsToday: todayCount,
      });
    } catch (error) {
      console.error('❌ Erro ao carregar dados do dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await AuthService.logout();
      router.replace('/login');
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error);
    }
  }

  const menuItems = [
    {
      id: 'appointments',
      title: 'Agendamentos',
      description: 'Gerenciar agendamentos',
      icon: 'calendar',
      route: '/admin/appointments',
      color: '#a21caf',
    },
    {
      id: 'users',
      title: 'Usuários',
      description: 'Gerenciar clientes',
      icon: 'people',
      route: '/admin/users',
      color: '#ec4899',
    },
    {
      id: 'services',
      title: 'Serviços',
      description: 'Gerenciar serviços',
      icon: 'cut',
      route: '/admin/services',
      color: '#f97316',
    },
    {
      id: 'analytics',
      title: 'Relatórios',
      description: 'Ver análises',
      icon: 'bar-chart',
      route: '/admin/analytics',
      color: '#06b6d4',
    },
  ];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background decorativo */}
      <View style={[styles.bgBlob, styles.bgBlobTop]} />
      <View style={[styles.bgBlob, styles.bgBlobMiddle]} />
      <View style={[styles.bgBlob, styles.bgBlobBottom]} />

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.welcomeText}>Bem-vindo,</Text>
            <Text style={styles.userName}>{userData?.name || 'Administrador'}</Text>
            <Text style={styles.userRole}>Painel de Administração</Text>
            <Text style={styles.todayLabel}>Hoje: {todayLabel}</Text>
          </View>
          <Pressable 
            onPress={handleLogout}
            style={styles.logoutButton}
          >
            <Ionicons name="log-out" size={24} color="#fff" />
          </Pressable>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.stat1, styles.singleStatCard]}>
            <View style={styles.statIcon}>
              <Ionicons name="calendar" size={32} color="#a21caf" />
            </View>
            <Text style={styles.statValue}>{stats.appointmentsToday}</Text>
            <Text style={styles.statLabel}>Agendamentos de hoje</Text>
          </View>
        </View>

        {/* Menu Grid */}
        <Text style={styles.sectionTitle}>Gerenciamento</Text>
        <View style={styles.menuGrid}>
          {menuItems.map((item) => (
            <TouchableOpacity 
              key={item.id}
              style={styles.menuItem}
              onPress={() => router.push(item.route as any)}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon as any} size={32} color={item.color} />
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuDescription}>{item.description}</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          ))}
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
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5edf7',
  },
  loadingText: {
    fontSize: 16,
    color: '#7a1d55',
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
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 40,
    zIndex: 10,
  },
  headerContent: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#7a1d55',
    marginTop: 4,
  },
  userRole: {
    fontSize: 12,
    color: '#8b1d5f',
    marginTop: 4,
  },
  todayLabel: {
    marginTop: 8,
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  logoutButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#a21caf',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 10,
    zIndex: 10,
  },
  statCard: {
    width: '48%',
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
  stat1: {
    backgroundColor: '#fce7f3',
  },
  singleStatCard: {
    width: '100%',
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#7a1d55',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#7a1d55',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 10,
    zIndex: 10,
  },
  menuGrid: {
    paddingHorizontal: 10,
    zIndex: 10,
  },
  menuItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 10,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7a1d55',
    flex: 1,
  },
  menuDescription: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  footer: {
    height: 40,
  },
});
