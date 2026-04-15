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
import { ExperienceLevel } from '@/shared/types/enums';

export default function RegisterScreen() {
  const [name, setName]             = useState('');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const register   = useAuthStore((s) => s.register);
  const clearError = useAuthStore((s) => s.clearError);
  const isLoading  = useAuthStore(selectIsLoading);
  const error      = useAuthStore(selectAuthError);
  const router     = useRouter();

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password) return;
    clearError();
    try {
      await register({
        name:            name.trim(),
        email:           email.trim(),
        password,
        experienceLevel: ExperienceLevel.BEGINNER,
      });
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

          {/* ── Header ── */}
          <View className="items-center mb-8">
            <Text
              className="text-cyber text-4xl font-bold tracking-widest uppercase"
              style={styles.underline}
            >
              UPFIT
            </Text>
            <Text className="text-white text-xl font-semibold mt-3">
              Novo Cadastro
            </Text>
            <Text
              className="text-cyber text-xs uppercase tracking-widest mt-1"
              style={styles.subtitleOpacity}
            >
              ACESSE O COMANDO CENTRAL
            </Text>
          </View>

          {/* ── Card with corner markers ── */}
          <View className="w-full" style={styles.cardWrapper}>
            {/* Corner decorators */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            <View className="bg-app-card rounded-2xl p-6 mx-1">

              {/* Error banner */}
              {error ? (
                <View className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-5">
                  <Text className="text-red-400 text-sm text-center">{error}</Text>
                </View>
              ) : null}

              {/* Name field */}
              <View className="mb-5">
                <Text className="text-cyber/70 text-xs tracking-widest uppercase font-semibold mb-2">
                  NOME COMPLETO
                </Text>
                <View className="flex-row items-center bg-app-input border border-white/10 rounded-xl px-4 py-3">
                  <Ionicons name="person-outline" size={18} color="#00d4ff" />
                  <TextInput
                    className="flex-1 text-white text-base ml-3"
                    style={styles.input}
                    placeholder="Seu nome completo"
                    placeholderTextColor="#ffffff30"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    autoCorrect={false}
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* Email field */}
              <View className="mb-5">
                <Text className="text-cyber/70 text-xs tracking-widest uppercase font-semibold mb-2">
                  ENDEREÇO DE E-MAIL
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
                  CÓDIGO DE ACESSO
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
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleRegister}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword((v) => !v)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color="#ffffff50"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Register button */}
              <TouchableOpacity
                className="bg-cyber rounded-xl py-4 items-center"
                onPress={handleRegister}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color="#0a0a0a" />
                ) : (
                  <Text className="text-app-bg font-bold text-base tracking-widest uppercase">
                    CRIAR CONTA →
                  </Text>
                )}
              </TouchableOpacity>

            </View>
          </View>

          {/* Login link */}
          <TouchableOpacity
            className="mt-8"
            activeOpacity={0.7}
            onPress={() => { clearError(); router.push('/(auth)/login'); }}
          >
            <Text className="text-white/40 text-sm tracking-wide">
              Já possui acesso autorizado?{' '}
              <Text className="text-cyber font-bold uppercase">ENTRAR</Text>
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const CORNER_SIZE = 18;
const CORNER_WIDTH = 2;
const CORNER_COLOR = '#00d4ff';

const styles = StyleSheet.create({
  scrollContent:   { flexGrow: 1 },
  underline:       { textDecorationLine: 'underline' },
  subtitleOpacity: { opacity: 0.55, letterSpacing: 4 },
  input:           { color: '#ffffff' },
  cardWrapper:     { position: 'relative' },

  corner: {
    position:  'absolute',
    width:     CORNER_SIZE,
    height:    CORNER_SIZE,
    zIndex:    10,
    borderColor: CORNER_COLOR,
    borderWidth: 0,
  },
  cornerTL: {
    top: 0, left: 0,
    borderTopWidth:  CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    top: 0, right: 0,
    borderTopWidth:   CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderTopRightRadius: 4,
  },
  cornerBL: {
    bottom: 0, left: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderLeftWidth:   CORNER_WIDTH,
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    bottom: 0, right: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderRightWidth:  CORNER_WIDTH,
    borderBottomRightRadius: 4,
  },
});
