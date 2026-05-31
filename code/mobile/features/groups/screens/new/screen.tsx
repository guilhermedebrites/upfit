import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { groupsService } from '@/features/groups/services/groups.service';
import { Colors } from '@/theme/colors';

// ─── Emblema icons ────────────────────────────────────────────────────────────

type EmblemOption = {
  id:   string;
  lib:  'ion' | 'mci';
  name: string;
  label: string;
};

const EMBLEMS: EmblemOption[] = [
  { id: 'people',    lib: 'ion', name: 'people',           label: 'Comunidade' },
  { id: 'swords',    lib: 'mci', name: 'sword-cross',      label: 'Guerreiros'  },
  { id: 'shield',    lib: 'ion', name: 'shield-checkmark', label: 'Defensores'  },
  { id: 'lightning', lib: 'ion', name: 'flash',            label: 'Potência'    },
];

function EmblemIcon({ emblem, size = 28, color }: { emblem: EmblemOption; size?: number; color: string }) {
  if (emblem.lib === 'mci') {
    return <MaterialCommunityIcons name={emblem.name as any} size={size} color={color} />;
  }
  return <Ionicons name={emblem.name as any} size={size} color={color} />;
}

// ─── Tela ─────────────────────────────────────────────────────────────────────

export default function NewGroupScreen() {
  const router = useRouter();

  const [selectedEmblem, setSelectedEmblem] = useState(EMBLEMS[0].id);
  const [name,        setName]        = useState('');
  const [description, setDescription] = useState('');
  const [weeklyGoal,  setWeeklyGoal]  = useState('');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  const canSubmit = name.trim().length >= 3 && description.trim().length >= 10;

  async function handleCreate() {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError(null);
    try {
      await groupsService.create({
        name:        name.trim(),
        description: description.trim(),
        weeklyGoal:  weeklyGoal.trim() || undefined,
      });
      router.back();
    } catch {
      setError('Não foi possível criar a guilda. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color={Colors.cyber} />
        </TouchableOpacity>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Title ── */}
          <Text style={styles.title}>FUNDAR{'\n'}COMUNIDADE</Text>
          <Text style={styles.subtitle}>
            CONFIGURE OS PARÂMETROS DA SUA NOVA COMUNIDADE DE ELITE
          </Text>

          {/* ── Form card ── */}
          <View style={styles.formCard}>

            {/* Emblem picker */}
            <Text style={styles.fieldLabel}>SELECIONE O EMBLEMA</Text>
            <View style={styles.emblemRow}>
              {EMBLEMS.map((e) => {
                const active = selectedEmblem === e.id;
                return (
                  <TouchableOpacity
                    key={e.id}
                    style={[styles.emblemBtn, active && styles.emblemBtnActive]}
                    onPress={() => setSelectedEmblem(e.id)}
                    activeOpacity={0.75}
                  >
                    <EmblemIcon
                      emblem={e}
                      size={26}
                      color={active ? Colors.cyber : Colors.subtle}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Name */}
            <Text style={[styles.fieldLabel, { marginTop: 20 }]}>IDENTIFICAÇÃO DA COMUNIDADE</Text>
            <TextInput
              style={styles.input}
              placeholder="EX: OS IMPLACÁVEIS"
              placeholderTextColor={Colors.faint}
              value={name}
              onChangeText={setName}
              maxLength={40}
              autoCapitalize="characters"
            />

            {/* Description */}
            <Text style={[styles.fieldLabel, { marginTop: 16 }]}>DIRETRIZES E MISSÃO</Text>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              placeholder="Descreva o propósito da sua comunidade..."
              placeholderTextColor={Colors.faint}
              value={description}
              onChangeText={setDescription}
              maxLength={200}
              multiline
              textAlignVertical="top"
            />

            {/* Weekly goal (optional) */}
            <Text style={[styles.fieldLabel, { marginTop: 16 }]}>OBJETIVO SEMANAL (OPCIONAL)</Text>
            <TextInput
              style={styles.input}
              placeholder="EX: 50km DE CORRIDA"
              placeholderTextColor={Colors.faint}
              value={weeklyGoal}
              onChangeText={setWeeklyGoal}
              maxLength={60}
              autoCapitalize="characters"
            />

            {/* Error */}
            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
              onPress={handleCreate}
              disabled={!canSubmit || loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={Colors.bg} />
              ) : (
                <>
                  <Ionicons name="diamond" size={18} color={Colors.bg} />
                  <Text style={styles.submitBtnText}>FUNDAR COMUNIDADE</Text>
                </>
              )}
            </TouchableOpacity>

          </View>

          {/* ── Info cards ── */}
          <View style={styles.infoRow}>
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>✦</Text>
              <Text style={styles.infoTitle}>STATUS: LÍDER</Text>
              <Text style={styles.infoText}>
                Você terá controle total sobre as missões e recrutamento.
              </Text>
            </View>
            <View style={styles.infoCard}>
              <Ionicons name="people" size={16} color={Colors.cyber} />
              <Text style={styles.infoTitle}>CAPACIDADE: 50</Text>
              <Text style={styles.infoText}>
                Inicie com espaço para 50 membros. Expansível via XP.
              </Text>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 20, paddingTop: 8, paddingBottom: 40, gap: 20 },

  backBtn: { marginLeft: 16, marginTop: 8, padding: 4, alignSelf: 'flex-start' },

  title: {
    color: Colors.cyber, fontSize: 34, fontWeight: '900',
    letterSpacing: 2, lineHeight: 40,
  },
  subtitle: {
    color: Colors.subtle, fontSize: 11, fontWeight: '600',
    letterSpacing: 1.5, lineHeight: 16, marginTop: -6,
  },

  formCard: {
    backgroundColor: Colors.card, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
    padding: 20,
  },

  fieldLabel: {
    color: Colors.cyber, fontSize: 10, fontWeight: '700',
    letterSpacing: 2, marginBottom: 10,
  },

  emblemRow: { flexDirection: 'row', gap: 12 },
  emblemBtn: {
    flex: 1, aspectRatio: 1, borderRadius: 14,
    backgroundColor: Colors.input,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },
  emblemBtnActive: {
    borderColor: Colors.cyber,
    backgroundColor: Colors.cyber + '12',
  },

  input: {
    backgroundColor: Colors.input,
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    color: Colors.white, fontSize: 14, fontWeight: '600',
    paddingHorizontal: 16, paddingVertical: 13,
    letterSpacing: 1,
  },
  inputMulti: {
    minHeight: 100, paddingTop: 13,
  },

  stepRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 20, marginBottom: 6,
  },
  stepDot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.skeleton },
  stepDotActive: { backgroundColor: Colors.cyber },
  stepLabel:     { color: Colors.faint, fontSize: 9, fontWeight: '600', letterSpacing: 2, marginLeft: 4 },

  errorText: { color: Colors.error, fontSize: 12, marginTop: 4, textAlign: 'center' },

  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: Colors.cyber, borderRadius: 16, paddingVertical: 16, marginTop: 12,
  },
  submitBtnDisabled: { opacity: 0.35 },
  submitBtnText: {
    color: Colors.bg, fontSize: 15, fontWeight: '900', letterSpacing: 3,
  },

  infoRow: { flexDirection: 'row', gap: 12 },
  infoCard: {
    flex: 1, backgroundColor: Colors.card, borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    padding: 16, gap: 6,
  },
  infoIcon:  { fontSize: 14 },
  infoTitle: { color: Colors.cyber, fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  infoText:  { color: Colors.subtle, fontSize: 11, lineHeight: 15 },
});
