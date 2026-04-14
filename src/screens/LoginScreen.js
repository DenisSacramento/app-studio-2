import { VALIDATION } from '@/constants/validation';
import AuthService from '@/src/services/authService';
import BiometricService from '@/src/services/biometricService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [hasBiometric, setHasBiometric] = useState(false);
  const [biometricType, setBiometricType] = useState('');

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  async function checkBiometricAvailability() {
    try {
      const available = await BiometricService.isAvailable();
      const enabled = await BiometricService.isBiometricEnabled();
      
      if (available && enabled) {
        setHasBiometric(true);
        const types = await BiometricService.getAvailableTypes();
        setBiometricType(types[0]);
      }
    } catch (error) {
      console.error('❌ Erro ao verificar biometria:', error);
    }
  }

  function validateForm() {
    const newErrors = { email: "", password: "" };

    if (!email.trim()) {
      newErrors.email = VALIDATION.MESSAGES.EMPTY_EMAIL;
    } else if (!VALIDATION.EMAIL_REGEX.test(email.trim())) {
      newErrors.email = VALIDATION.MESSAGES.INVALID_EMAIL;
    }

    if (!password) {
      newErrors.password = VALIDATION.MESSAGES.EMPTY_PASSWORD;
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  }

  function handleLogin() {
    if (!validateForm()) {
      return;
    }

    loginUser();
  }

  async function loginUser() {
    setIsLoading(true);
    try {
      console.log('🔐 Iniciando login...');
      const response = await AuthService.login(email, password);
      console.log('✅ Login bem-sucedido:', response.user.name);
      console.log('👤 Role do usuário:', response.user.role);
      
      // Oferecer habilitar biometria se não estiver habilitada
      if (!hasBiometric) {
        const available = await BiometricService.isAvailable();
        if (available) {
          setTimeout(() => {
            Alert.alert(
              'Biometria Rápida',
              'Ativar login rápido com impressão digital ou rosto?',
              [
                {
                  text: 'Agora não',
                  onPress: redirectUser(response.user.role),
                },
                {
                  text: 'Ativar',
                  onPress: async () => {
                    await enableBiometric(response.token, response.refreshToken, response.user.email);
                    redirectUser(response.user.role)();
                  },
                },
              ]
            );
          }, 500);
        } else {
          redirectUser(response.user.role)();
        }
      } else {
        redirectUser(response.user.role)();
      }
    } catch (error) {
      console.error('❌ Erro no login:', error);

      const backendErrors = error && typeof error === 'object' ? error.errors : null;
      const backendMessage = error && typeof error === 'object' ? error.message : null;

      if (backendErrors) {
        setErrors(prev => ({
          ...prev,
          ...backendErrors
        }));
      } else {
        Alert.alert('Erro', backendMessage || 'Erro ao fazer login');
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function enableBiometric(token, refreshToken, email) {
    try {
      const success = await BiometricService.enableBiometric(token, refreshToken, email);
      if (success) {
        console.log('✅ Biometria habilitada com sucesso');
        setHasBiometric(true);
        const types = await BiometricService.getAvailableTypes();
        setBiometricType(types[0]);
      }
    } catch (error) {
      console.error('❌ Erro ao habilitar biometria:', error);
    }
  }

  async function loginWithBiometric() {
    setIsLoading(true);
    try {
      console.log('🔐 Autenticando com biometria...');
      const result = await BiometricService.authenticateWithBiometric();
      
      if (!result) {
        Alert.alert('Erro', 'Falha na autenticação biométrica');
        return;
      }

      // Restaura sessão local com token biométrico e busca perfil real no backend.
      await AuthService.saveToken(result.token);
      const profileResponse = await AuthService.getProfile();

      await AuthService.saveStoredUser({
        id: profileResponse.user.id,
        name: profileResponse.user.name,
        email: profileResponse.user.email,
        role: profileResponse.user.role,
      });

      console.log('✅ Login com biometria bem-sucedido');
      redirectUser(profileResponse.user.role)();
    } catch (error) {
      console.error('❌ Erro na autenticação biométrica:', error);
      Alert.alert('Erro', 'Falha na autenticação biométrica');
    } finally {
      setIsLoading(false);
    }
  }

  function redirectUser(role) {
    return () => {
      if (role === 'ADMIN') {
        console.log('🛡️ Redirecionando para admin dashboard...');
        router.push('/admin/dashboard');
      } else {
        console.log('👥 Redirecionando para home do cliente...');
        router.push('/home');
      }
    };
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

        <Text style={styles.title}>Login</Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor="#7a7a7a"
          style={styles.input}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Senha"
            placeholderTextColor="#7a7a7a"
            style={styles.passwordInput}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
            }}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={24}
              color="#A91E63"
            />
          </TouchableOpacity>
        </View>
        {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        {hasBiometric && (
          <TouchableOpacity 
            style={styles.biometricButton} 
            onPress={loginWithBiometric}
            disabled={isLoading}
          >
            <Ionicons 
              name={biometricType === 'face' ? 'face' : 'finger-print'} 
              size={24} 
              color="#a21caf" 
            />
            <Text style={styles.biometricButtonText}>
              Entrar com {biometricType === 'face' ? 'Rosto' : 'Impressão Digital'}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.push('/forgot-password')}
        >
          <Text style={styles.linkText}>Esqueci a senha</Text>
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
  brandAccent: {
    color: '#A91E63',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#A91E63',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 14,
    marginBottom: 12,
    borderRadius: 10,
    color: '#000',
    backgroundColor: 'transparent',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    color: '#000',
    backgroundColor: 'transparent',
  },
  eyeIcon: {
    padding: 12,
  },
  button: {
    backgroundColor: '#A91E63',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkButton: {
    marginTop: 18,
    alignItems: 'center',
  },
  linkText: {
    color: '#A91E63',
    fontSize: 16,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  biometricButton: {
    marginTop: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#a21caf',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5edf7',
  },
  biometricButtonText: {
    color: '#a21caf',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
  errorText: {
    color: '#B00020',
    marginBottom: 10,
    marginLeft: 4,
  },
});
