import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="register" options={{ title: 'Cadastro', headerShown: false }} />
        <Stack.Screen name="welcome" options={{ title: 'Bem-vindo', headerShown: false }} />
        <Stack.Screen name="register-success" options={{ title: 'Cadastro Concluído', headerShown: false }} />
        <Stack.Screen name="login" options={{ title: 'Login', headerShown: false }} />
        <Stack.Screen name="reset-password" options={{ title: 'Nova Senha', headerShown: false }} />
        <Stack.Screen name="home" options={{ title: 'Home', headerShown: false }} />
        <Stack.Screen name="services" options={{ title: 'Serviços', headerShown: false }} />
        <Stack.Screen name="appointments" options={{ title: 'Agendamentos', headerShown: false }} />
        <Stack.Screen name="profile" options={{ title: 'Perfil', headerShown: false }} />
        <Stack.Screen name="forgot-password" options={{ title: 'Recuperar Senha', headerShown: false }} />
        <Stack.Screen name="admin" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
