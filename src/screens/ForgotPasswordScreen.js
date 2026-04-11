import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground } from "react-native";
import { useState } from "react";
import { useRouter } from 'expo-router';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  function handleSendResetEmail() {
    console.log("Enviar email de redefinição para:", email);
    // Aqui você pode adicionar a lógica para enviar o email
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

        <TouchableOpacity style={styles.button} onPress={handleSendResetEmail}>
          <Text style={styles.buttonText}>Enviar</Text>
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
  brandAccent: {
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