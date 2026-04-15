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
    try {
      await login({ email: email.trim(), password });
      // Root layout redirects to /(tabs)/home on success
    } catch {
      // Error already set in auth store
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-app-bg">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 items-center justify-center px-6 py-10">

          {/* ── Logo ── */}
          <View className="items-center mb-10">
            <Text className="text-cyber text-4xl font-bold tracking-widest">
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
          <View className="w-full bg-app-card rounded-2xl p-6 border border-cyber/20">

            {/* Error banner */}
            {error ? (
              <View className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-5">
                <Text className="text-red-400 text-sm text-center">{error}</Text>
              </View>
            ) : null}

            {/* Email field */}
            <View className="mb-5">
              <Text className="text-cyber/70 text-xs tracking-widest uppercase font-semibold mb-2">
                PROTOCOLO DE COMANDO (E-MAIL)
              </Text>
              <View className="flex-row items-center bg-app-input border border-white/10 rounded-xl px-4 py-3">
                <Ionicons name="at" size={18} color="#00d4ff" />
                <TextInput
                  className="flex-1 text-white text-base ml-3"
                  style={styles.input}
                  placeholder="seu@email.com"
                  placeholderTextColor="#ffffff30"
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
              <Text className="text-cyber/70 text-xs tracking-widest uppercase font-semibold mb-2">
                CIFRA DE ACESSO (SENHA)
              </Text>
              <View className="flex-row items-center bg-app-input border border-white/10 rounded-xl px-4 py-3">
                <Ionicons name="lock-closed" size={18} color="#00d4ff" />
                <TextInput
                  className="flex-1 text-white text-base ml-3"
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#ffffff30"
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
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#0a0a0a" />
              ) : (
                <Text className="text-app-bg font-bold text-base tracking-widest uppercase">
                  ENTRAR &gt;
                </Text>
              )}
            </TouchableOpacity>

            {/* Recover password */}
            <TouchableOpacity className="items-center" activeOpacity={0.6}>
              <Text className="text-white/25 text-xs tracking-widest uppercase">
                RECUPERAR CIFRA ESQUECIDA
              </Text>
            </TouchableOpacity>
          </View>

          {/* Register link */}
          <TouchableOpacity
            className="mt-8"
            activeOpacity={0.7}
            onPress={() => { clearError(); router.push('/(auth)/register'); }}
          >
            <Text className="text-white/40 text-sm tracking-wider uppercase">
              NOVO USUÁRIO?{' '}
              <Text className="text-cyber font-bold">CADASTRAR</Text>
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1 },
  subtitle:      { opacity: 0.55, letterSpacing: 4 },
  input:         { color: '#ffffff' },
});
