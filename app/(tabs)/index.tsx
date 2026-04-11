import { Link } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.brand}>
        <Text style={styles.brandLight}>Studio</Text>
        <Text style={styles.brandBold}> Karine</Text>
        <Text style={styles.brandAccent}> Reverte</Text>
      </Text>
      <Text style={styles.subtitle}>Design moderno, profissional e intuitivo</Text>
      <Link href="/register" style={styles.link}>
        <Text style={styles.linkText}>Ir para Cadastro</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  brand: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 10,
  },
  brandLight: {
    color: '#111',
  },
  brandBold: {
    color: '#E84D9F',
  },
  brandAccent: {
    color: '#A91E63',
  },
  subtitle: {
    color: '#333',
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  link: {
    backgroundColor: '#A91E63',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  linkText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});