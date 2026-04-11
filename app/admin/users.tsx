import usersService from '@/src/services/usersService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export type User = {
  id: string;
  name: string;
  lastName?: string;
  email: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
};

export default function AdminUsersScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setIsLoading(true);
      const response = await usersService.listClients();
      setUsers(
        (response.users || []).map((user) => ({
          id: user.id,
          name: user.name,
          lastName: user.lastName ?? undefined,
          email: user.email,
          phone: user.phone ?? undefined,
          isActive: user.isActive,
          createdAt: user.createdAt,
        }))
      );
    } catch (error) {
      console.error('❌ Erro ao carregar usuários:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchText.toLowerCase()) ||
    user.email.toLowerCase().includes(searchText.toLowerCase())
  );

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
        <Text style={styles.title}>Usuários</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color="#9ca3af" />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Buscar por nome ou email"
            placeholderTextColor="#9ca3af"
            style={styles.searchInput}
          />
        </View>

        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#a21caf" />
          </View>
        ) : filteredUsers.length === 0 ? (
          <View style={styles.centerContainer}>
            <Ionicons name="people-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>Nenhum usuário encontrado</Text>
          </View>
        ) : (
          <View style={styles.usersList}>
            {filteredUsers.map((user) => (
              <View key={user.id} style={styles.userCard}>
                <View style={styles.userAvatar}>
                  <Text style={styles.avatarText}>
                    {user.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>
                    {user.name} {user.lastName || ''}
                  </Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                  {user.phone && (
                    <Text style={styles.userPhone}>{user.phone}</Text>
                  )}
                  <Text style={styles.userMeta}>
                    Cadastro: {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
                <View style={styles.userRole}>
                  <Text style={styles.roleText}>
                    {user.isActive ? '✅ Ativo' : '🕓 Inativo'}
                  </Text>
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
  searchBox: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    zIndex: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    marginLeft: 8,
    fontSize: 14,
    color: '#374151',
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
  usersList: {
    paddingHorizontal: 10,
    zIndex: 10,
  },
  userCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 12,
    marginHorizontal: 10,
    marginBottom: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#a21caf',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7a1d55',
  },
  userEmail: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  userPhone: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  userMeta: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
  },
  userRole: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  footer: {
    height: 40,
  },
});
