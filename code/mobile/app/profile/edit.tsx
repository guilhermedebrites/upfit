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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { profileService } from '@/features/auth/services/profile.service';
import { parseApiError } from '@/shared/api/api-error';
import { ExperienceLevel } from '@/shared/types/enums';

// ─── Tipos auxiliares ─────────────────────────────────────────────────────────

const EXP_OPTIONS: { label: string; value: ExperienceLevel }[] = [
  { label: 'INICIANTE',  value: ExperienceLevel.BEGINNER      },
  { label: 'INTER.',     value: ExperienceLevel.INTERMEDIATE  },
  { label: 'AVANÇADO',   value: ExperienceLevel.ADVANCED      },
];

// ─── Tela ─────────────────────────────────────────────────────────────────────

export default function EditProfileScreen() {
  const router = useRouter();
  const user   = useAuthStore((s) => s.user);

  // Estados de loading
  const [loading,        setLoading]        = useState(true);
  const [saving,         setSaving]         = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error,          setError]          = useState<string | null>(null);

  // Campos do formulário
  const [photoUrl,         setPhotoUrl]         = useState<string | null>(null);
  const [bio,              setBio]              = useState('');
  const [weight,           setWeight]           = useState('');
  const [height,           setHeight]           = useState('');
  const [goal,             setGoal]             = useState('');
  const [experienceLevel,  setExperienceLevel]  = useState<ExperienceLevel>(ExperienceLevel.BEGINNER);

  // Carrega dados ao entrar na tela
  useFocusEffect(
    useCallback(() => {
      if (!user?.id) return;
      setLoading(true);
      profileService
        .get(user.id)
        .then((p) => {
          setPhotoUrl(p.photoUrl ?? null);
          setBio(p.bio ?? '');
          setWeight(p.weight  != null ? String(p.weight)  : '');
          setHeight(p.height  != null ? String(p.height)  : '');
          setGoal(p.goal ?? '');
          setExperienceLevel(p.experienceLevel ?? ExperienceLevel.BEGINNER);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, [user?.id]),
  );

  // ─── Upload de foto ────────────────────────────────────────────────────────

  async function handlePickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setError('Permissão de galeria negada.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect:        [1, 1],
      quality:       0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;

    setUploadingPhoto(true);
    setError(null);
    try {
      const localUri = result.assets[0].uri;
      const filename = `profile-${user!.id}.jpg`;

      // 1. Obter presigned URL
      const { presignedUrl, objectUrl } = await profileService.getUploadUrl(filename);
      console.log("URL" + objectUrl)

      // 2. Converter URI local em Blob e fazer PUT no S3
      const fileResp = await fetch(localUri);
      const blob     = await fileResp.blob();
      await fetch(presignedUrl, {
        method:  'PUT',
        headers: { 'Content-Type': 'image/jpeg' },
        body:    blob,
      });

      // 3. Atualizar state com a URL pública
      setPhotoUrl(objectUrl);
    } catch {
      setError('Erro ao fazer upload da foto. Tente novamente.');
    } finally {
      setUploadingPhoto(false);
    }
  }

  // ─── Salvar ────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!user?.id) return;
    setSaving(true);
    setError(null);
    try {
      await profileService.update(user.id, {
        bio:             bio.trim()    || undefined,
        weight:          weight        ? parseFloat(weight)  : undefined,
        height:          height        ? parseFloat(height)  : undefined,
        goal:            goal.trim()   || undefined,
        experienceLevel,
        photoUrl:        photoUrl      ?? undefined,
      });
      router.back();
    } catch (e) {
      setError(parseApiError(e));
    } finally {
      setSaving(false);
    }
  }

  const nameInitial = (user?.name ?? user?.email ?? '?').charAt(0).toUpperCase();

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backText}>← VOLTAR</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>EDITAR PERFIL</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator color="#00d4ff" size="large" />
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ── Foto de perfil ── */}
            <View style={styles.photoSection}>
              <View style={styles.avatarWrapper}>
                {photoUrl ? (
                  <Image source={{ uri: photoUrl }} style={styles.avatarImg} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitial}>{nameInitial}</Text>
                  </View>
                )}
                {uploadingPhoto && (
                  <View style={styles.avatarOverlay}>
                    <ActivityIndicator color="#00d4ff" />
                  </View>
                )}
              </View>

              <TouchableOpacity
                onPress={handlePickPhoto}
                disabled={uploadingPhoto}
                activeOpacity={0.7}
              >
                <Text style={[styles.changePhotoText, uploadingPhoto && { opacity: 0.5 }]}>
                  {uploadingPhoto ? 'ENVIANDO...' : 'ALTERAR FOTO'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* ── Erro ── */}
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* ── Campos ── */}
            <View style={styles.fieldsSection}>

              {/* Bio */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>BIO</Text>
                <TextInput
                  style={[styles.input, styles.inputMultiline]}
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
              <View style={styles.fieldRow}>
                <View style={styles.fieldHalf}>
                  <Text style={styles.fieldLabel}>PESO</Text>
                  <View style={styles.inputWithSuffix}>
                    <TextInput
                      style={[styles.input, styles.inputFlex]}
                      value={weight}
                      onChangeText={setWeight}
                      placeholder="0"
                      placeholderTextColor="#ffffff25"
                      keyboardType="decimal-pad"
                    />
                    <Text style={styles.inputSuffix}>kg</Text>
                  </View>
                </View>

                <View style={styles.fieldHalf}>
                  <Text style={styles.fieldLabel}>ALTURA</Text>
                  <View style={styles.inputWithSuffix}>
                    <TextInput
                      style={[styles.input, styles.inputFlex]}
                      value={height}
                      onChangeText={setHeight}
                      placeholder="0"
                      placeholderTextColor="#ffffff25"
                      keyboardType="decimal-pad"
                    />
                    <Text style={styles.inputSuffix}>m</Text>
                  </View>
                </View>
              </View>

              {/* Meta */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>META</Text>
                <TextInput
                  style={styles.input}
                  value={goal}
                  onChangeText={setGoal}
                  placeholder="Ex: Emagrecimento"
                  placeholderTextColor="#ffffff25"
                />
              </View>

              {/* Nível de experiência */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>NÍVEL DE EXPERIÊNCIA</Text>
                <View style={styles.expSelector}>
                  {EXP_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.expOption,
                        experienceLevel === opt.value && styles.expOptionActive,
                      ]}
                      onPress={() => setExperienceLevel(opt.value)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.expOptionText,
                        experienceLevel === opt.value && styles.expOptionTextActive,
                      ]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

            </View>
          </ScrollView>

          {/* ── Botão Salvar (fixo no bottom) ── */}
          <View style={styles.saveContainer}>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving ? (
                <ActivityIndicator color="#0a0a0a" />
              ) : (
                <Text style={styles.saveBtnText}>SALVAR</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}

    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const AVATAR_SIZE = 96;

const styles = StyleSheet.create({
  safe:  { flex: 1, backgroundColor: '#0a0a0a' },

  // ── Header ──
  header: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    paddingHorizontal: 16,
    paddingVertical:   14,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff0a',
  },
  backBtn: {
    paddingVertical:   4,
    paddingHorizontal: 2,
    minWidth:          80,
  },
  backText: {
    color:         '#00d4ff',
    fontSize:      13,
    fontWeight:    '600',
    letterSpacing: 1,
  },
  headerTitle: {
    color:         '#ffffff',
    fontSize:      14,
    fontWeight:    'bold',
    letterSpacing: 3,
  },
  headerSpacer: {
    minWidth: 80,
  },

  // ── Loading ──
  loadingCenter: {
    flex:            1,
    alignItems:      'center',
    justifyContent:  'center',
  },

  // ── Scroll ──
  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 24 },

  // ── Foto ──
  photoSection: {
    alignItems:   'center',
    marginBottom: 28,
  },
  avatarWrapper: {
    width:          AVATAR_SIZE + 8,
    height:         AVATAR_SIZE + 8,
    borderRadius:   (AVATAR_SIZE + 8) / 2,
    borderWidth:    2,
    borderColor:    '#00d4ff',
    alignItems:     'center',
    justifyContent: 'center',
    marginBottom:   12,
    position:       'relative',
  },
  avatarImg: {
    width:        AVATAR_SIZE,
    height:       AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarPlaceholder: {
    width:           AVATAR_SIZE,
    height:          AVATAR_SIZE,
    borderRadius:    AVATAR_SIZE / 2,
    backgroundColor: '#0f0f0f',
    alignItems:      'center',
    justifyContent:  'center',
  },
  avatarInitial: {
    color:      '#00d4ff',
    fontSize:   36,
    fontWeight: 'bold',
  },
  avatarOverlay: {
    position:        'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius:    AVATAR_SIZE / 2,
    backgroundColor: '#00000070',
    alignItems:      'center',
    justifyContent:  'center',
  },
  changePhotoText: {
    color:         '#00d4ff',
    fontSize:      12,
    fontWeight:    '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // ── Erro ──
  errorBox: {
    backgroundColor: '#ff000015',
    borderWidth:     1,
    borderColor:     '#ff000040',
    borderRadius:    10,
    padding:         14,
    marginBottom:    20,
  },
  errorText: {
    color:     '#f87171',
    fontSize:  13,
    textAlign: 'center',
  },

  // ── Campos ──
  fieldsSection: {
    gap: 20,
  },
  field: {
    gap: 8,
  },
  fieldLabel: {
    color:         '#00d4ffb3',
    fontSize:      10,
    fontWeight:    '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius:    12,
    borderWidth:     1,
    borderColor:     '#ffffff15',
    color:           '#ffffff',
    fontSize:        15,
    paddingHorizontal: 14,
    paddingVertical:   12,
  },
  inputMultiline: {
    minHeight:   90,
    paddingTop:  12,
  },
  inputFlex: {
    flex: 1,
  },
  fieldRow: {
    flexDirection: 'row',
    gap:           12,
  },
  fieldHalf: {
    flex: 1,
    gap:  8,
  },
  inputWithSuffix: {
    flexDirection: 'row',
    alignItems:    'center',
    backgroundColor: '#1a1a1a',
    borderRadius:    12,
    borderWidth:     1,
    borderColor:     '#ffffff15',
    paddingHorizontal: 14,
  },
  inputSuffix: {
    color:       '#475569',
    fontSize:    13,
    fontWeight:  '500',
    marginLeft:   4,
  },

  // ── Seletor de experiência ──
  expSelector: {
    flexDirection: 'row',
    gap:           8,
  },
  expOption: {
    flex:              1,
    paddingVertical:   10,
    borderRadius:      10,
    borderWidth:       1,
    borderColor:       '#ffffff15',
    backgroundColor:   '#1a1a1a',
    alignItems:        'center',
  },
  expOptionActive: {
    borderColor:     '#00d4ff',
    backgroundColor: '#00d4ff15',
  },
  expOptionText: {
    color:         '#475569',
    fontSize:      10,
    fontWeight:    '700',
    letterSpacing: 1,
  },
  expOptionTextActive: {
    color: '#00d4ff',
  },

  // ── Botão salvar ──
  saveContainer: {
    paddingHorizontal: 20,
    paddingVertical:   16,
    borderTopWidth:    1,
    borderTopColor:    '#ffffff0a',
    backgroundColor:   '#0a0a0a',
  },
  saveBtn: {
    backgroundColor: '#00d4ff',
    borderRadius:    14,
    paddingVertical: 16,
    alignItems:      'center',
  },
  saveBtnText: {
    color:         '#0a0a0a',
    fontSize:      15,
    fontWeight:    'bold',
    letterSpacing: 3,
  },
});
