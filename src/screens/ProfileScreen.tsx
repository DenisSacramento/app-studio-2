import usersService from '@/src/services/usersService';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ProfileScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  async function loadProfile() {
    try {
      setIsLoading(true);
      const response = await usersService.getMe();
      setName(response.user.name);
      setLastName(response.user.lastName ?? '');
      setNickname(response.user.nickname ?? '');
      setEmail(response.user.email);
      setPhone(response.user.phone ?? '');
      setAddress(response.user.address ?? '');
    } catch (error: any) {
      Alert.alert('Erro', error?.message ?? 'Falha ao carregar perfil');
    } finally {
      setIsLoading(false);
    }
  }

  function validateForm() {
    if (!name.trim()) {
      return 'Informe o nome.';
    }

    if (!lastName.trim()) {
      return 'Informe o sobrenome.';
    }

    if (!email.trim()) {
      return 'Informe o email.';
    }

    return null;
  }

  async function saveProfile() {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Validação', validationError);
      return;
    }

    try {
      setIsSaving(true);
      await usersService.updateMe({
        name: name.trim(),
        lastName: lastName.trim(),
        nickname: nickname.trim() || undefined,
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
      });
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso');
    } catch (error: any) {
      Alert.alert('Erro', error?.message ?? 'Falha ao atualizar perfil');
    } finally {
      setIsSaving(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

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

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          <Text style={styles.title}>Meu Perfil</Text>
          <Text style={styles.subtitle}>Mantenha seus dados atualizados para facilitar seus agendamentos.</Text>

          <TextInput style={styles.input} placeholder="Nome" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Sobrenome" value={lastName} onChangeText={setLastName} />
          <TextInput style={styles.input} placeholder="Apelido (opcional)" value={nickname} onChangeText={setNickname} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Telefone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Endereço (opcional)"
            value={address}
            onChangeText={setAddress}
            multiline
          />

          <TouchableOpacity style={[styles.button, isSaving && styles.buttonDisabled]} disabled={isSaving} onPress={saveProfile}>
            <Text style={styles.buttonText}>{isSaving ? 'Salvando...' : 'Salvar'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    top: 220,
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
  content: { padding: 20, paddingBottom: 30 },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: { fontSize: 24, fontWeight: '800', color: '#7a1d55' },
  subtitle: { marginTop: 6, marginBottom: 14, color: '#5b5560' },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e9d5ff',
    marginBottom: 10,
    color: '#333',
  },
  textArea: { minHeight: 82, textAlignVertical: 'top' },
  button: { backgroundColor: '#a21caf', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 4 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '700' },
});
