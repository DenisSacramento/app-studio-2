import { useRouter } from 'expo-router';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleContinue = () => {
    router.push('/register-success');
  };

  return (
    <ImageBackground
      source={require('../assets/images/fundo1.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.emoji}>🎉</Text>
          
          <Text style={styles.title}>Seja bem-vindo!</Text>
          
          <Text style={styles.subtitle}>
            Seu cadastro foi validado com sucesso. Agora você faz parte da família Studio Karine Reverte.
          </Text>

          <View style={styles.highlightBox}>
            <Text style={styles.highlightText}>
              Próximos passos: Complete seu perfil e comece a agendar seus serviços!
            </Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleContinue}>
            <Text style={styles.buttonText}>Continuar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/login')}>
            <Text style={styles.secondaryButtonText}>Voltar ao login</Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 12,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 60,
    marginBottom: 16,
    textAlign: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    color: '#A91E63',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginBottom: 20,
    lineHeight: 24,
  },
  highlightBox: {
    backgroundColor: 'rgba(169, 30, 99, 0.08)',
    borderLeftWidth: 4,
    borderLeftColor: '#A91E63',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 24,
    borderRadius: 8,
  },
  highlightText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#A91E63',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A91E63',
    width: '100%',
  },
  secondaryButtonText: {
    color: '#A91E63',
    fontWeight: '700',
    fontSize: 16,
  },
});
