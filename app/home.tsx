import AuthService from '@/src/services/authService';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { userName: paramUserName } = useLocalSearchParams();
  const [greeting, setGreeting] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');

  const loadUserData = useCallback(async () => {
    try {
      setIsLoading(true);
      let displayName = paramUserName;

      // Se não vem do paramUserName, buscar do AuthService
      if (!displayName) {
        const storedUser = await AuthService.getStoredUser();
        displayName = storedUser?.name || 'Usuário';
      }

      setUserName(String(displayName));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  }, [paramUserName]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Bom dia');
    } else if (hour < 18) {
      setGreeting('Boa tarde');
    } else {
      setGreeting('Boa noite');
    }

    // Carregar dados do usuário
    loadUserData();
  }, [loadUserData]);

  const handleLogout = () => {
    Alert.alert(
      'Confirmação',
      'Deseja realmente fazer logout?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AuthService.logout();
              router.replace('/login');
            } catch {
              Alert.alert('Erro', 'Falha ao fazer logout');
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#A91E63" />
          <Text style={styles.loadingText}>Carregando...</Text>
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

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header com logout */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>{greeting}!</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#A91E63" />
          </TouchableOpacity>
        </View>

        {/* Card de boas-vindas */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Bem-vindo à Studio Karine Reverte</Text>
          <Text style={styles.welcomeSubtitle}>
            Agende seus serviços e aproveite as melhores experiências de beleza
          </Text>
        </View>

        {/* Seção de Menu Principal */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>O que você gostaria de fazer?</Text>

          <TouchableOpacity style={styles.menuCard} onPress={() => router.push('/appointments?mode=services')}>
            <View style={styles.menuCardIcon}>
              <Ionicons name="calendar" size={28} color="#A91E63" />
            </View>
            <View style={styles.menuCardContent}>
              <Text style={styles.menuCardTitle}>Agendar Serviço</Text>
              <Text style={styles.menuCardDescription}>Reserve seu horário</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuCard} onPress={() => router.push('/appointments?mode=list')}>
            <View style={styles.menuCardIcon}>
              <Ionicons name="list" size={28} color="#A91E63" />
            </View>
            <View style={styles.menuCardContent}>
              <Text style={styles.menuCardTitle}>Meus Agendamentos</Text>
              <Text style={styles.menuCardDescription}>Consulte seus compromissos</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuCard} onPress={() => router.push('/profile')}>
            <View style={styles.menuCardIcon}>
              <Ionicons name="person" size={28} color="#A91E63" />
            </View>
            <View style={styles.menuCardContent}>
              <Text style={styles.menuCardTitle}>Meu Perfil</Text>
              <Text style={styles.menuCardDescription}>Edite suas informações</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>

        </View>

        {/* Espaço vazio no final para scroll confortável */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5edf7',
  },
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#A91E63',
    fontWeight: '600',
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  greetingText: {
    fontSize: 16,
    color: '#A91E63',
    fontWeight: '600',
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#333',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(169, 30, 99, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeCard: {
    backgroundColor: '#A91E63',
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  menuSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  menuCardIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(169, 30, 99, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuCardContent: {
    flex: 1,
  },
  menuCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  menuCardDescription: {
    fontSize: 13,
    color: '#999',
  },
  bottomSpacing: {
    height: 40,
  },
});
