import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { workoutService } from '@/features/workout/services/workout.service';
import { parseApiError } from '@/shared/api/api-error';
import { Colors } from '@/theme/colors';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Formata "3000" → "30:00" à medida que o usuário digita */
function formatDurationInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return digits.slice(0, 2) + ':' + digits.slice(2, 4);
}

/** Converte "MM:SS" para minutos decimais */
function durationToMinutes(value: string): number {
  const parts  = value.split(':');
  const mins   = parseInt(parts[0] ?? '0', 10) || 0;
  const secs   = parseInt(parts[1] ?? '0', 10) || 0;
  return mins + secs / 60;
}

/** Calcula pace em decimal (min/km) e formata como "X'XX\"/km" */
function calcPace(durationStr: string, distanceStr: string): { decimal: number | null; display: string } {
  const totalMin = durationToMinutes(durationStr);
  const dist     = parseFloat(distanceStr);
  if (!dist || !totalMin || isNaN(dist)) return { decimal: null, display: '—' };
  const pace = totalMin / dist;
  const m    = Math.floor(pace);
  const s    = Math.round((pace - m) * 60);
  return { decimal: pace, display: `${m}'${String(s).padStart(2, '0')}"/km` };
}

// ─── Barra de progresso ────────────────────────────────────────────────────────

function ProgressBar() {
  return (
    <View style={styles.progressRow}>
      <View style={[styles.progressSegment, styles.progressActive]} />
      <View style={[styles.progressSegment, styles.progressActive]} />
    </View>
  );
}

// ─── Tela ─────────────────────────────────────────────────────────────────────

export default function RunningWorkoutScreen() {
  const router = useRouter();

  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');
  const [notes,    setNotes]    = useState('');
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const pace = useMemo(() => calcPace(duration, distance), [duration, distance]);

  function handleDurationChange(raw: string) {
    setDuration(formatDurationInput(raw));
  }

  async function handleSave() {
    const dist     = parseFloat(distance);
    const totalMin = durationToMinutes(duration);

    if (!dist || dist <= 0) {
      setError('Informe uma distância válida.');
      return;
    }
    if (!totalMin || duration.length < 3) {
      setError('Informe a duração no formato MM:SS.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await workoutService.create({
        type:           'RUNNING',
        distanceKm:     dist,
        averagePace:    pace.decimal ?? 0,
        durationMin:    totalMin,
        caloriesBurned: parseFloat(calories) || 0,
        notes:          notes.trim() || undefined,
      });

      Alert.alert(
        'Treino registrado!',
        'Sua corrida foi salva. Continue assim!',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)/home') }],
      );
    } catch (e) {
      setError(parseApiError(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      <ProgressBar />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.backText}>← VOLTAR</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>PASSO 02: CORRIDA</Text>
          <Text style={styles.headerSub}>REGISTRO DE ATIVIDADE DE ALTO IMPACTO</Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* ── Erro ── */}
        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={15} color={Colors.error} style={{ marginRight: 8 }} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* ── Campos ── */}
        <View style={styles.fieldList}>

          {/* Distância */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>DISTÂNCIA</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={distance}
                onChangeText={setDistance}
                placeholder="0.0"
                placeholderTextColor="rgba(255,255,255,0.15)"
                keyboardType="decimal-pad"
              />
              <Text style={styles.unit}>km</Text>
            </View>
          </View>

          {/* Duração */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>DURAÇÃO</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={duration}
                onChangeText={handleDurationChange}
                placeholder="30:00"
                placeholderTextColor="rgba(255,255,255,0.15)"
                keyboardType="numeric"
                maxLength={5}
              />
              <Text style={styles.unit}>min:seg</Text>
            </View>
          </View>

          {/* Ritmo médio — somente leitura */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>RITMO MÉDIO</Text>
            <View style={[styles.inputRow, styles.readonlyRow]}>
              <View style={styles.paceIconBg}>
                <Ionicons name="speedometer-outline" size={18} color={Colors.cyber} />
              </View>
              <Text style={[styles.input, styles.paceText]} numberOfLines={1}>
                {pace.display}
              </Text>
              <Text style={styles.unit}>calculado</Text>
            </View>
            <Text style={styles.fieldHint}>Calculado automaticamente com base na distância e duração.</Text>
          </View>

          {/* Calorias */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>CALORIAS GASTAS</Text>
              <Text style={styles.optionalTag}>OPCIONAL</Text>
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={calories}
                onChangeText={setCalories}
                placeholder="0"
                placeholderTextColor="rgba(255,255,255,0.15)"
                keyboardType="decimal-pad"
              />
              <Text style={styles.unit}>kcal</Text>
            </View>
          </View>

          {/* Observações */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>OBSERVAÇÕES</Text>
              <Text style={styles.optionalTag}>OPCIONAL</Text>
            </View>
            <TextInput
              style={styles.textarea}
              value={notes}
              onChangeText={setNotes}
              placeholder="Ex: Corrida matinal no parque..."
              placeholderTextColor="rgba(255,255,255,0.15)"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

        </View>

      </ScrollView>

      {/* ── Botão salvar ── */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.saveBtn, (saving) && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color={Colors.bg} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color={Colors.bg} style={{ marginRight: 8 }} />
              <Text style={styles.saveBtnText}>REGISTRAR TREINO</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  progressRow: {
    flexDirection:     'row',
    gap:               6,
    paddingHorizontal: 20,
    paddingTop:        14,
    paddingBottom:     2,
  },
  progressSegment: {
    flex:            1,
    height:          3,
    borderRadius:    99,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  progressActive: { backgroundColor: Colors.cyber },

  header: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingHorizontal: 16,
    paddingVertical:   14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backBtn: { minWidth: 70, paddingVertical: 4 },
  backText: {
    color:         Colors.cyber,
    fontSize:      12,
    fontWeight:    '700',
    letterSpacing: 1,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: {
    color:         Colors.white,
    fontSize:      11,
    fontWeight:    '700',
    letterSpacing: 2,
  },
  headerSub: {
    color:         Colors.subtle,
    fontSize:      9,
    letterSpacing: 1.5,
    marginTop:     2,
    textTransform: 'uppercase',
  },
  headerSpacer: { minWidth: 70 },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop:        24,
    paddingBottom:     32,
  },

  errorBox: {
    flexDirection:  'row',
    alignItems:     'center',
    backgroundColor: 'rgba(248,113,113,0.1)',
    borderWidth:     1,
    borderColor:     'rgba(248,113,113,0.25)',
    borderRadius:    12,
    padding:         14,
    marginBottom:    20,
  },
  errorText: { color: Colors.error, fontSize: 13, flex: 1 },

  fieldList: { gap: 20 },

  field: { gap: 8 },

  fieldLabel: {
    color:         Colors.cyber,
    fontSize:      10,
    fontWeight:    '700',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },

  labelRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
  },
  optionalTag: {
    color:           Colors.faint,
    fontSize:        9,
    fontWeight:      '600',
    letterSpacing:   1.5,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 6,
    paddingVertical:   2,
    borderRadius:    4,
  },

  inputRow: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: Colors.card,
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.08)',
    borderRadius:    14,
    paddingHorizontal: 16,
  },
  readonlyRow: {
    backgroundColor: 'rgba(0,212,255,0.04)',
    borderColor:     'rgba(0,212,255,0.15)',
  },
  paceIconBg: {
    marginRight: 10,
  },
  input: {
    flex:      1,
    color:     Colors.white,
    fontSize:  16,
    paddingVertical: 14,
  },
  paceText: {
    color:      Colors.cyber,
    fontWeight: '700',
    fontSize:   17,
  },
  unit: {
    color:      Colors.subtle,
    fontSize:   13,
    fontWeight: '500',
    marginLeft: 8,
  },
  fieldHint: {
    color:    Colors.faint,
    fontSize: 11,
    lineHeight: 16,
  },
  textarea: {
    backgroundColor: Colors.card,
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.08)',
    borderRadius:    14,
    padding:         16,
    color:           Colors.white,
    fontSize:        15,
    minHeight:       90,
    textAlignVertical: 'top',
  },

  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical:   16,
    borderTopWidth:    1,
    borderTopColor:    'rgba(255,255,255,0.05)',
    backgroundColor:   Colors.bg,
  },
  saveBtn: {
    backgroundColor: Colors.cyber,
    borderRadius:    16,
    paddingVertical: 16,
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
  },
  saveBtnText: {
    color:         Colors.bg,
    fontSize:      14,
    fontWeight:    '800',
    letterSpacing: 3,
  },
});
