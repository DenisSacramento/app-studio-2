import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="dashboard" 
        options={{ 
          title: 'Admin Dashboard',
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="appointments" 
        options={{ 
          title: 'Gerenciar Agendamentos',
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="users" 
        options={{ 
          title: 'Usuários',
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="services" 
        options={{ 
          title: 'Serviços',
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="analytics" 
        options={{ 
          title: 'Relatórios',
          headerShown: false 
        }} 
      />
    </Stack>
  );
}
