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
      router.replace('/(tabs)/home');
    } catch {
      // Error already set in auth store
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-app-bg" style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 items-center justify-center px-6 py-10" style={styles.inner}>

          {/* ── Header ── */}
          <View style={styles.headerBlock}>
            <Text
              className="text-cyber text-4xl font-bold tracking-widest uppercase"
              style={styles.logoText}
            >
              UPFIT
            </Text>
            <Text style={styles.titleText}>Novo Cadastro</Text>
            <Text style={styles.subtitleText}>ACESSE O COMANDO CENTRAL</Text>
          </View>

          {/* ── Card with corner markers ── */}
          <View style={styles.cardWrapper}>
            {/* Corner decorators */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            <View className="bg-app-card rounded-2xl p-6 mx-1" style={styles.card}>

              {/* Error banner */}
              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Name field */}
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>NOME COMPLETO</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="person-outline" size={18} color="#00d4ff" />
                  <TextInput
                    style={styles.input}
                    placeholder="Seu nome completo"
                    placeholderTextColor="#ffffff40"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    autoCorrect={false}
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* Email field */}
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>ENDEREÇO DE E-MAIL</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="at" size={18} color="#00d4ff" />
                  <TextInput
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
              <View style={[styles.fieldBlock, { marginBottom: 28 }]}>
                <Text style={styles.label}>CÓDIGO DE ACESSO</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="lock-closed" size={18} color="#00d4ff" />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#ffffff40"
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
                style={styles.button}
                onPress={handleRegister}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color="#0a0a0a" />
                ) : (
                  <Text style={styles.buttonText}>CRIAR CONTA →</Text>
                )}
              </TouchableOpacity>

            </View>
          </View>

          {/* Login link */}
          <TouchableOpacity
            style={styles.linkButton}
            activeOpacity={0.7}
            onPress={() => { clearError(); router.push('/(auth)/login'); }}
          >
            <Text style={styles.linkText}>
              Já possui acesso autorizado?{' '}
              <Text style={styles.linkHighlight}>ENTRAR</Text>
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const CORNER_SIZE  = 18;
const CORNER_WIDTH = 2;
const CORNER_COLOR = '#00d4ff';

const styles = StyleSheet.create({
  safeArea:     { flex: 1, backgroundColor: '#0a0a0a' },
  scrollContent:{ flexGrow: 1 },
  inner:        { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },

  headerBlock:  { alignItems: 'center', marginBottom: 32 },
  logoText:     { color: '#00d4ff', fontSize: 36, fontWeight: 'bold', letterSpacing: 6, textDecorationLine: 'underline' },
  titleText:    { color: '#ffffff', fontSize: 20, fontWeight: '600', marginTop: 12 },
  subtitleText: { color: '#00d4ff', opacity: 0.55, fontSize: 11, letterSpacing: 4, marginTop: 4, textTransform: 'uppercase' },

  cardWrapper:  { width: '100%', position: 'relative' },
  card:         { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 24, marginHorizontal: 4 },

  fieldBlock:   { marginBottom: 20 },
  label:        { color: '#00d4ffb3', fontSize: 11, letterSpacing: 2, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase' },
  inputRow:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f0f0f', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: '#ffffff1a' },
  input:        { flex: 1, color: '#ffffff', fontSize: 16, marginLeft: 12 },

  button:       { backgroundColor: '#00d4ff', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  buttonText:   { color: '#0a0a0a', fontWeight: 'bold', fontSize: 15, letterSpacing: 3, textTransform: 'uppercase' },

  linkButton:   { marginTop: 32 },
  linkText:     { color: '#ffffff66', fontSize: 13 },
  linkHighlight:{ color: '#00d4ff', fontWeight: 'bold', textTransform: 'uppercase' },

  errorBox:     { backgroundColor: '#ff000020', borderWidth: 1, borderColor: '#ff000050', borderRadius: 8, padding: 12, marginBottom: 20 },
  errorText:    { color: '#f87171', fontSize: 13, textAlign: 'center' },

  corner: {
    position: 'absolute', width: CORNER_SIZE, height: CORNER_SIZE,
    zIndex: 10, borderColor: CORNER_COLOR, borderWidth: 0,
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH, borderTopLeftRadius: 4 },
  cornerTR: { top: 0, right: 0, borderTopWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH, borderTopRightRadius: 4 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH, borderBottomRightRadius: 4 },
});
