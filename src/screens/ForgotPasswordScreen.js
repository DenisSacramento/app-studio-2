import { VALIDATION } from '@/constants/validation';
import AuthService from '@/src/services/authService';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSendResetEmail() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      Alert.alert('Atenção', 'Digite seu email para continuar.');
      return;
    }

    if (!VALIDATION.EMAIL_REGEX.test(normalizedEmail)) {
      Alert.alert('Atenção', 'Informe um email válido.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await AuthService.requestPasswordReset(normalizedEmail);
      Alert.alert('Enviado', response.message);
      router.push({ pathname: '/reset-password', params: { email: normalizedEmail } });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível enviar as instruções.';
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
        <View style={styles.brandContainer}>
          <Text style={styles.brandTop}>
            <Text style={styles.brandLight}>Studio</Text>
            <Text style={styles.brandBold}> Karine</Text>
          </Text>
          <Text style={styles.brandBottom}>Reverte</Text>
        </View>

        <Text style={styles.title}>Redefinir Senha</Text>

        <Text style={styles.description}>
          Digite seu email para receber instruções de redefinição de senha.
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

        <TouchableOpacity style={[styles.button, isSubmitting && styles.buttonDisabled]} onPress={handleSendResetEmail} disabled={isSubmitting}>
          <Text style={styles.buttonText}>{isSubmitting ? 'Enviando...' : 'Enviar'}</Text>
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
  brandContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  brandTop: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
  },
  brandBottom: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#A91E63',
    textAlign: 'center',
  },
  brandLight: {
    color: '#A91E63',
  },
  brandBold: {
    color: '#A91E63',
  },
  title: {
    fontSize: 24,
    marginBottom: 12,
    textAlign: 'center',
    color: '#A91E63',
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
    marginBottom: 20,
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
