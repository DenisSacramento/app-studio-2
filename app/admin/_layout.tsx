import AuthService from '@/src/services/authService';
import { Stack, usePathname, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function AdminLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function validateAdminAccess() {
      try {
        const token = await AuthService.getValidToken();

        if (!token) {
          if (isMounted) {
            router.replace('/login');
          }
          return;
        }

        const profile = await AuthService.getProfile();

        if (profile.user.role !== 'ADMIN') {
          if (isMounted) {
            router.replace('/home');
          }
          return;
        }
      } catch (error) {
        console.error('❌ Erro ao validar acesso admin:', error);
        if (isMounted) {
          router.replace('/login');
        }
      } finally {
        if (isMounted) {
          setIsCheckingAccess(false);
        }
      }
    }

    validateAdminAccess();

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  if (isCheckingAccess) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#a21caf" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen
        name="dashboard"
        options={{
          title: 'Admin Dashboard',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="appointments"
        options={{
          title: 'Gerenciar Agendamentos',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="users"
        options={{
          title: 'Usuários',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="services"
        options={{
          title: 'Serviços',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="analytics"
        options={{
          title: 'Relatórios',
          headerShown: false,
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5edf7',
  },
});
