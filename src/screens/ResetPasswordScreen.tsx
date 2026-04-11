import AuthService from '@/src/services/authService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email ? String(params.email) : '');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleResetPassword() {
    const normalizedEmail = email.trim();

    if (!normalizedEmail || !token.trim() || !password || !confirmPassword) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Atenção', 'As senhas não coincidem.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await AuthService.resetPassword(normalizedEmail, token.trim(), password);
      Alert.alert('Sucesso', response.message);
      router.replace('/login');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível redefinir a senha.';
      Alert.alert('Erro', message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ImageBackground
      source={require('../../assets/images/fundo1.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Nova senha</Text>
        <Text style={styles.description}>
          Digite o email, o código recebido por email e a nova senha para concluir a redefinição.
        </Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor="#7a7a7a"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          placeholder="Código recebido por email"
          placeholderTextColor="#7a7a7a"
          style={styles.input}
          value={token}
          onChangeText={setToken}
          autoCapitalize="none"
        />

        <TextInput
          placeholder="Nova senha"
          placeholderTextColor="#7a7a7a"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          placeholder="Confirmar nova senha"
          placeholderTextColor="#7a7a7a"
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity style={[styles.button, isSubmitting && styles.buttonDisabled]} onPress={handleResetPassword} disabled={isSubmitting}>
          <Text style={styles.buttonText}>{isSubmitting ? 'Salvando...' : 'Redefinir senha'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  title: {
    fontSize: 26,
    marginBottom: 12,
    textAlign: 'center',
    color: '#A91E63',
    fontWeight: '700',
  },
  description: {
    color: '#333',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 14,
    marginBottom: 16,
    borderRadius: 10,
    color: '#000',
    backgroundColor: 'transparent',
  },
  button: {
    backgroundColor: '#A91E63',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    alignItems: 'center',
  },
  backButtonText: {
    color: '#A91E63',
    fontSize: 16,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});