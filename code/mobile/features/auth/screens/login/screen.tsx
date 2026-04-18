import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore, selectIsLoading, selectAuthError } from '@/features/auth/store/auth.store';
import { Colors } from '@/theme/colors';

export default function LoginScreen() {
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
    <SafeAreaView className="flex-1 bg-app-bg">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 items-center justify-center px-6 py-10">

          {/* ── Logo ── */}
          <View className="items-center mb-10">
            <Text className="text-cyber text-4xl font-bold" style={{ letterSpacing: 6 }}>
              ⚡ UPFIT
            </Text>
            <Text
              className="text-cyber text-xs uppercase mt-1"
              style={{ opacity: 0.55, letterSpacing: 4 }}
            >
              CENTRO DE COMANDO CINÉTICO
            </Text>
          </View>

          {/* ── Card ── */}
          <View className="w-full bg-app-card rounded-2xl p-6 border border-cyber/20">

            {/* Error */}
            {error ? (
              <View className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-5">
                <Text className="text-red-400 text-sm text-center">{error}</Text>
              </View>
            ) : null}

            {/* Email */}
            <View className="mb-5">
              <Text
                className="text-cyber/70 text-xs font-semibold uppercase mb-2"
                style={{ letterSpacing: 2 }}
              >
                PROTOCOLO DE COMANDO (E-MAIL)
              </Text>
              <View className="flex-row items-center bg-app-input rounded-xl px-4 py-3 border border-white/10">
                <Ionicons name="at" size={18} color={Colors.cyber} />
                <TextInput
                  className="flex-1 text-white text-base ml-3"
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

            {/* Password */}
            <View className="mb-7">
              <Text
                className="text-cyber/70 text-xs font-semibold uppercase mb-2"
                style={{ letterSpacing: 2 }}
              >
                CIFRA DE ACESSO (SENHA)
              </Text>
              <View className="flex-row items-center bg-app-input rounded-xl px-4 py-3 border border-white/10">
                <Ionicons name="lock-closed" size={18} color={Colors.cyber} />
                <TextInput
                  className="flex-1 text-white text-base ml-3"
                  placeholder="••••••••"
                  placeholderTextColor="#ffffff40"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
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

            {/* Botão */}
            <TouchableOpacity
              className="bg-cyber rounded-xl py-4 items-center mb-4"
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.bg} />
              ) : (
                <Text
                  className="text-app-bg font-bold text-base uppercase"
                  style={{ letterSpacing: 3 }}
                >
                  ENTRAR &gt;
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Link cadastro */}
          <TouchableOpacity
            className="mt-8"
            activeOpacity={0.7}
            onPress={() => { clearError(); router.push('/(auth)/register'); }}
          >
            <Text
              className="text-white/40 text-sm uppercase"
              style={{ letterSpacing: 1 }}
            >
              NOVO USUÁRIO?{' '}
              <Text className="text-cyber font-bold">CADASTRAR</Text>
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
