import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { profileService } from '@/features/auth/services/profile.service';
import { parseApiError } from '@/shared/api/api-error';
import { ExperienceLevel } from '@/shared/types/enums';
import { Colors } from '@/theme/colors';

// ─── Constantes ───────────────────────────────────────────────────────────────

const EXP_OPTIONS: { label: string; value: ExperienceLevel }[] = [
  { label: 'INICIANTE', value: ExperienceLevel.BEGINNER     },
  { label: 'INTER.',    value: ExperienceLevel.INTERMEDIATE },
  { label: 'AVANÇADO',  value: ExperienceLevel.ADVANCED     },
];

const AVATAR_SIZE = 96;

// ─── Tela ─────────────────────────────────────────────────────────────────────

export default function EditProfileScreen() {
  const router    = useRouter();
  const user      = useAuthStore((s) => s.user);
  const patchUser = useAuthStore((s) => s.patchUser);

  // ── Estado de UI ──
  const [pageLoading,    setPageLoading]    = useState(true);
  const [saving,         setSaving]         = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error,          setError]          = useState<string | null>(null);

  // ── Campos do formulário ──
  const [bio,             setBio]             = useState('');
  const [weight,          setWeight]          = useState('');
  const [height,          setHeight]          = useState('');
  const [goal,            setGoal]            = useState('');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(ExperienceLevel.BEGINNER);

  // ── Foto ──
  // displayUri  = o que é mostrado na tela (local ou S3)
  // savedS3Url  = URL do S3 confirmada após upload bem-sucedido (enviada no save)
  const [displayUri, setDisplayUri] = useState<string | null>(null);
  const [savedS3Url, setSavedS3Url] = useState<string | null>(null);

  // ─── Carrega perfil ao entrar na tela ────────────────────────────────────────

  useFocusEffect(
    useCallback(() => {
      if (!user?.id) return;
      setPageLoading(true);
      profileService
        .get(user.id)
        .then((p) => {
          setBio(p.bio ?? '');
          setWeight(p.weight  != null ? String(p.weight)  : '');
          setHeight(p.height  != null ? String(p.height)  : '');
          setGoal(p.goal ?? '');
          setExperienceLevel(p.experienceLevel ?? ExperienceLevel.BEGINNER);
          // Popula foto apenas se ainda não tem preview local
          const url = p.photoUrl ?? null;
          setDisplayUri(url);
          setSavedS3Url(url);
        })
        .catch(() => {})
        .finally(() => setPageLoading(false));
    }, [user?.id]),
  );

  // ─── Selecionar e fazer upload de foto ───────────────────────────────────────

  async function handlePickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Permite o acesso à galeria nas configurações do app.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:    ['images'],
      allowsEditing: true,
      aspect:        [1, 1],
      quality:       0.8,
    });

    if (result.canceled || !result.assets?.[0]?.uri) return;

    const localUri = result.assets[0].uri;

    // 1. Mostra a imagem local imediatamente — o usuário vê o resultado na hora
    setDisplayUri(localUri);
    setUploadingPhoto(true);
    setError(null);

    try {
      // 2. Obtém presigned URL do S3
      const filename = `profile-${user!.id}-${Date.now()}.jpg`;
      const { presignedUrl, objectUrl } = await profileService.getUploadUrl(filename);

      // 3. Faz o upload para o S3
      const fileBlob = await fetch(localUri).then((r) => r.blob());
      const putResp  = await fetch(presignedUrl, {
        method:  'PUT',
        headers: { 'Content-Type': 'image/jpeg' },
        body:    fileBlob,
      });

      if (!putResp.ok) throw new Error(`S3 PUT falhou: ${putResp.status}`);

      // 4. Upload OK — guarda a URL do S3 mas mantém o display na URI local
      //    (já está mostrando a imagem correta; trocar para S3 causaria reload)
      setSavedS3Url(objectUrl);
    } catch (e) {
      // Upload falhou — reverte para a foto anterior
      setDisplayUri(savedS3Url);
      setError('Erro ao enviar a foto. Tente novamente.');
    } finally {
      setUploadingPhoto(false);
    }
  }

  // ─── Salvar perfil ───────────────────────────────────────────────────────────

  async function handleSave() {
    if (!user?.id) return;
    setSaving(true);
    setError(null);
    try {
      await profileService.update(user.id, {
        bio:             bio.trim()  || undefined,
        weight:          weight      ? parseFloat(weight)  : undefined,
        height:          height      ? parseFloat(height)  : undefined,
        goal:            goal.trim() || undefined,
        experienceLevel,
        photoUrl:        savedS3Url  ?? undefined,
      });

      // Sincroniza com o store para o AppHeader atualizar sem esperar o fetch
      if (savedS3Url) patchUser({ avatarUrl: savedS3Url });

      router.back();
    } catch (e) {
      setError(parseApiError(e));
    } finally {
      setSaving(false);
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  const nameInitial = (user?.name ?? user?.email ?? '?').charAt(0).toUpperCase();

  if (pageLoading) {
    return (
      <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={Colors.cyber} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>

      {/* ── Header ── */}
      <View className="flex-row items-center justify-between px-4 py-3.5 border-b border-white/5">
        <TouchableOpacity
          onPress={() => router.back()}
          className="min-w-[80px] py-1"
          activeOpacity={0.7}
        >
          <Text className="text-cyber text-sm font-semibold" style={{ letterSpacing: 1 }}>
            ← VOLTAR
          </Text>
        </TouchableOpacity>

        <Text className="text-white text-sm font-bold" style={{ letterSpacing: 3 }}>
          EDITAR PERFIL
        </Text>

        <View className="min-w-[80px]" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* ── Avatar ── */}
        <TouchableOpacity
          className="items-center mb-8"
          onPress={handlePickPhoto}
          disabled={uploadingPhoto}
          activeOpacity={0.8}
        >
          <View style={styles.avatarWrapper}>
            {/* key força remount do <Image> quando a URI muda */}
            {displayUri ? (
              <Image
                key={displayUri}
                source={{ uri: displayUri }}
                style={styles.avatarImg}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={{ color: Colors.cyber, fontSize: 36, fontWeight: 'bold' }}>
                  {nameInitial}
                </Text>
              </View>
            )}

            {/* Overlay de upload */}
            {uploadingPhoto && (
              <View style={styles.uploadOverlay}>
                <ActivityIndicator color={Colors.cyber} size="small" />
              </View>
            )}

            {/* Badge de câmera */}
            {!uploadingPhoto && (
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={14} color={Colors.cyber} />
              </View>
            )}
          </View>

          <Text
            className="text-cyber text-xs font-bold uppercase mt-3"
            style={{ letterSpacing: 2, opacity: uploadingPhoto ? 0.4 : 1 }}
          >
            {uploadingPhoto ? 'ENVIANDO...' : 'ALTERAR FOTO'}
          </Text>
        </TouchableOpacity>

        {/* ── Erro ── */}
        {error && (
          <View className="bg-red-500/10 border border-red-500/30 rounded-xl p-3.5 mb-5">
            <Text className="text-red-400 text-sm text-center">{error}</Text>
          </View>
        )}

        {/* ── Campos ── */}
        <View className="gap-5">

          {/* Bio */}
          <View className="gap-2">
            <Text className="text-cyber/70 text-[10px] font-bold uppercase" style={{ letterSpacing: 2 }}>
              BIO
            </Text>
            <TextInput
              style={styles.inputMultiline}
              className="bg-app-card rounded-xl border border-white/10 text-white text-[15px] px-3.5"
              value={bio}
              onChangeText={setBio}
              placeholder="Conte um pouco sobre você..."
              placeholderTextColor="#ffffff25"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Peso + Altura */}
          <View className="flex-row gap-3">
            <View className="flex-1 gap-2">
              <Text className="text-cyber/70 text-[10px] font-bold uppercase" style={{ letterSpacing: 2 }}>
                PESO
              </Text>
              <View className="flex-row items-center bg-app-card rounded-xl border border-white/10 px-3.5">
                <TextInput
                  className="flex-1 text-white text-[15px] py-3"
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="0"
                  placeholderTextColor="#ffffff25"
                  keyboardType="decimal-pad"
                />
                <Text className="text-subtle text-sm font-medium ml-1">kg</Text>
              </View>
            </View>

            <View className="flex-1 gap-2">
              <Text className="text-cyber/70 text-[10px] font-bold uppercase" style={{ letterSpacing: 2 }}>
                ALTURA
              </Text>
              <View className="flex-row items-center bg-app-card rounded-xl border border-white/10 px-3.5">
                <TextInput
                  className="flex-1 text-white text-[15px] py-3"
                  value={height}
                  onChangeText={setHeight}
                  placeholder="0"
                  placeholderTextColor="#ffffff25"
                  keyboardType="decimal-pad"
                />
                <Text className="text-subtle text-sm font-medium ml-1">m</Text>
              </View>
            </View>
          </View>

          {/* Meta */}
          <View className="gap-2">
            <Text className="text-cyber/70 text-[10px] font-bold uppercase" style={{ letterSpacing: 2 }}>
              META
            </Text>
            <TextInput
              className="bg-app-card rounded-xl border border-white/10 text-white text-[15px] px-3.5 py-3"
              value={goal}
              onChangeText={setGoal}
              placeholder="Ex: Emagrecimento"
              placeholderTextColor="#ffffff25"
            />
          </View>

          {/* Nível de experiência */}
          <View className="gap-2">
            <Text className="text-cyber/70 text-[10px] font-bold uppercase" style={{ letterSpacing: 2 }}>
              NÍVEL DE EXPERIÊNCIA
            </Text>
            <View className="flex-row gap-2">
              {EXP_OPTIONS.map((opt) => {
                const active = experienceLevel === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    className={`flex-1 py-2.5 rounded-[10px] border items-center ${
                      active ? 'border-cyber bg-cyber/10' : 'border-white/10 bg-app-card'
                    }`}
                    onPress={() => setExperienceLevel(opt.value)}
                    activeOpacity={0.7}
                  >
                    <Text
                      className={`text-[10px] font-bold ${active ? 'text-cyber' : 'text-subtle'}`}
                      style={{ letterSpacing: 1 }}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

        </View>
      </ScrollView>

      {/* ── Botão salvar fixo no rodapé ── */}
      <View className="px-5 py-4 border-t border-white/5 bg-app-bg">
        <TouchableOpacity
          className="bg-cyber rounded-2xl py-4 items-center"
          onPress={handleSave}
          disabled={saving || uploadingPhoto}
          activeOpacity={0.85}
          style={{ opacity: saving || uploadingPhoto ? 0.6 : 1 }}
        >
          {saving ? (
            <ActivityIndicator color={Colors.bg} />
          ) : (
            <Text className="text-app-bg text-[15px] font-bold" style={{ letterSpacing: 3 }}>
              SALVAR
            </Text>
          )}
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

// ─── Styles — apenas valores computados ──────────────────────────────────────

const styles = StyleSheet.create({
  avatarWrapper: {
    width:          AVATAR_SIZE + 8,
    height:         AVATAR_SIZE + 8,
    borderRadius:   (AVATAR_SIZE + 8) / 2,
    borderWidth:    2,
    borderColor:    Colors.cyber,
    alignItems:     'center',
    justifyContent: 'center',
    overflow:       'hidden',  // garante que a imagem respeita o borderRadius
    position:       'relative',
  },
  avatarImg: {
    width:  AVATAR_SIZE + 8,
    height: AVATAR_SIZE + 8,
  },
  avatarPlaceholder: {
    width:           AVATAR_SIZE + 8,
    height:          AVATAR_SIZE + 8,
    backgroundColor: Colors.input,
    alignItems:      'center',
    justifyContent:  'center',
  },
  uploadOverlay: {
    position:        'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#000000aa',
    alignItems:      'center',
    justifyContent:  'center',
  },
  cameraBadge: {
    position:        'absolute',
    bottom:          0,
    right:           0,
    width:           28,
    height:          28,
    borderRadius:    14,
    backgroundColor: '#1a1a1a',
    borderWidth:     1.5,
    borderColor:     Colors.cyber,
    alignItems:      'center',
    justifyContent:  'center',
  },
  inputMultiline: {
    minHeight:  88,
    paddingTop: 12,
  },
});
