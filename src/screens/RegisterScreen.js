import { VALIDATION } from '@/constants/validation';
import AuthService from '@/src/services/authService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from "react";
import { ActivityIndicator, Alert, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ name: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  function validateForm() {
    const newErrors = { name: "", email: "", password: "" };

    if (!name.trim()) {
      newErrors.name = VALIDATION.MESSAGES.EMPTY_NAME;
    } else if (name.trim().length < VALIDATION.NAME_MIN_LENGTH) {
      newErrors.name = VALIDATION.MESSAGES.SHORT_NAME;
    }

    if (!email.trim()) {
      newErrors.email = VALIDATION.MESSAGES.EMPTY_EMAIL;
    } else if (!VALIDATION.EMAIL_REGEX.test(email.trim())) {
      newErrors.email = VALIDATION.MESSAGES.INVALID_EMAIL;
    }

    if (!password) {
      newErrors.password = VALIDATION.MESSAGES.EMPTY_PASSWORD;
    } else if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
      newErrors.password = VALIDATION.MESSAGES.SHORT_PASSWORD;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(password)) {
      newErrors.password = VALIDATION.MESSAGES.WEAK_PASSWORD;
    }

    setErrors(newErrors);
    return !newErrors.name && !newErrors.email && !newErrors.password;
  }

  function handleRegister() {
    if (!validateForm()) {
      return;
    }

    registerUser();
  }

  async function registerUser() {
    setIsLoading(true);
    try {
      console.log('📝 Iniciando registro...');
      const response = await AuthService.register(name, email, password);
      console.log('✅ Registro bem-sucedido:', response.user.name);
      
      // Navegando para welcome com o nome do usuário
      router.push({
        pathname: '/welcome',
        params: { userName: response.user.name }
      });
    } catch (error) {
      console.error('❌ Erro no registro:', error);

      const backendErrors = error && typeof error === 'object' ? error.errors : null;
      const backendMessage = error && typeof error === 'object' ? error.message : null;

      if (backendErrors) {
        // Erros de validação do backend
        setErrors(prev => ({
          ...prev,
          ...backendErrors
        }));
      } else {
        // Erro geral
        Alert.alert('Erro', backendMessage || 'Erro ao registrar usuário');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ImageBackground
      source={require('../../assets/images/fundo1.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.brand}>
          <Text style={styles.brandLight}>Studio</Text>
          <Text style={styles.brandBold}> Karine</Text>
          <Text style={styles.brandAccent}> Reverte</Text>
        </Text>

        <Text style={styles.title}>Cadastro</Text>

        <TextInput
          placeholder="Nome"
          placeholderTextColor="#7a7a7a"
          style={styles.input}
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
          }}
        />
        {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

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
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Cadastrar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/login')}>
          <Text style={styles.secondaryButtonText}>Já tem cadastro? Fazer login</Text>
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
    justifyContent: "center",
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // Fundo branco semi-transparente
  },
  brand: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 1,
    textAlign: "center",
    marginBottom: 8,
  },
  brandLight: {
    color: "#A91E63",
  },
  brandBold: {
    color: "#A91E63",
  },
  brandAccent: {
    color: "#A91E63",
  },
  subtitle: {
    color: "#333",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    color: "#A91E63",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    color: "#000",
    backgroundColor: 'transparent',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  passwordInput: {
    flex: 1,
    padding: 10,
    color: "#000",
    backgroundColor: 'transparent',
  },
  eyeIcon: {
    padding: 10,
  },
  button: {
    backgroundColor: "#A91E63",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  secondaryButton: {
    marginTop: 16,
    padding: 14,
    borderRadius: 8,
    backgroundColor: "rgba(169, 30, 99, 0.12)",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#A91E63",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: '#B00020',
    marginBottom: 10,
    marginLeft: 4,
  },
});