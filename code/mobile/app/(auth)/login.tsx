import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore, selectIsLoading, selectAuthError } from '@/features/auth/store/auth.store';

export default function LoginScreen() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  const login      = useAuthStore((s) => s.login);
  const clearError = useAuthStore((s) => s.clearError);
  const isLoading  = useAuthStore(selectIsLoading);
  const error      = useAuthStore(selectAuthError);
  const router     = useRouter();

  async function handleLogin() {
    if (!email.trim() || !password) return;
    clearError();
    await login({ email: email.trim(), password });
    router.replace('/(tabs)/home');
  }

  return (
    <SafeAreaView className="flex-1 bg-app-bg" style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 items-center justify-center px-6 py-10" style={styles.inner}>

          {/* ── Logo ── */}
          <View className="items-center mb-10">
            <Text className="text-cyber text-4xl font-bold tracking-widest" style={styles.logo}>
              ⚡ UPFIT
            </Text>
            <Text
              className="text-cyber text-xs tracking-widest uppercase mt-1"
              style={styles.subtitle}
            >
              CENTRO DE COMANDO CINÉTICO
            </Text>
          </View>

          {/* ── Card ── */}
          <View className="w-full bg-app-card rounded-2xl p-6 border border-cyber/20" style={styles.card}>

            {/* Error banner */}
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Email field */}
            <View className="mb-5">
              <Text className="text-cyber/70 text-xs tracking-widest uppercase font-semibold mb-2" style={styles.label}>
                PROTOCOLO DE COMANDO (E-MAIL)
              </Text>
              <View className="flex-row items-center bg-app-input border border-white/10 rounded-xl px-4 py-3" style={styles.inputRow}>
                <Ionicons name="at" size={18} color="#00d4ff" />
                <TextInput
                  className="flex-1 text-white text-base ml-3"
                  style={styles.input}
                  placeholder="seu@email.com"
                  placeholderTextColor="#ffffff40"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Password field */}
            <View className="mb-7">
              <Text className="text-cyber/70 text-xs tracking-widest uppercase font-semibold mb-2" style={styles.label}>
                CIFRA DE ACESSO (SENHA)
              </Text>
              <View className="flex-row items-center bg-app-input border border-white/10 rounded-xl px-4 py-3" style={styles.inputRow}>
                <Ionicons name="lock-closed" size={18} color="#00d4ff" />
                <TextInput
                  className="flex-1 text-white text-base ml-3"
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#ffffff40"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
              </View>
            </View>

            {/* Login button */}
            <TouchableOpacity
              className="bg-cyber rounded-xl py-4 items-center mb-4"
              style={styles.button}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#0a0a0a" />
              ) : (
                <Text className="text-app-bg font-bold text-base tracking-widest uppercase" style={styles.buttonText}>
                  ENTRAR &gt;
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Register link */}
          <TouchableOpacity
            className="mt-8"
            style={styles.linkButton}
            activeOpacity={0.7}
            onPress={() => { clearError(); router.push('/(auth)/register'); }}
          >
            <Text className="text-white/40 text-sm tracking-wider uppercase" style={styles.linkText}>
              NOVO USUÁRIO?{' '}
              <Text className="text-cyber font-bold" style={styles.linkHighlight}>CADASTRAR</Text>
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:     { flex: 1, backgroundColor: '#0a0a0a' },
  scrollContent:{ flexGrow: 1 },
  inner:        { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  logo:         { color: '#00d4ff', fontSize: 36, fontWeight: 'bold', letterSpacing: 6 },
  subtitle:     { color: '#00d4ff', opacity: 0.55, fontSize: 11, letterSpacing: 4, marginTop: 4 },
  card:         { width: '100%', backgroundColor: '#1a1a1a', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: '#00d4ff33' },
  label:        { color: '#00d4ffb3', fontSize: 11, letterSpacing: 2, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase' },
  inputRow:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f0f0f', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: '#ffffff1a' },
  input:        { flex: 1, color: '#ffffff', fontSize: 16, marginLeft: 12 },
  button:       { backgroundColor: '#00d4ff', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 16 },
  buttonText:   { color: '#0a0a0a', fontWeight: 'bold', fontSize: 15, letterSpacing: 3, textTransform: 'uppercase' },
  forgotText:   { color: '#ffffff40', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase' },
  linkButton:   { marginTop: 32 },
  linkText:     { color: '#ffffff66', fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' },
  linkHighlight:{ color: '#00d4ff', fontWeight: 'bold' },
  errorBox:     { backgroundColor: '#ff000020', borderWidth: 1, borderColor: '#ff000050', borderRadius: 8, padding: 12, marginBottom: 20 },
  errorText:    { color: '#f87171', fontSize: 13, textAlign: 'center' },
});
