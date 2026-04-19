import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { workoutService } from '@/features/workout/services/workout.service';
import { parseApiError } from '@/shared/api/api-error';
import { Colors } from '@/theme/colors';

// ─── Lista de exercícios ───────────────────────────────────────────────────────

interface ExerciseDef {
  name:  string;
  group: MuscleGroup;
}

type MuscleGroup =
  | 'PEITO'
  | 'COSTAS'
  | 'OMBROS'
  | 'BÍCEPS'
  | 'TRÍCEPS'
  | 'PERNAS'
  | 'ABDÔMEN';

const GROUP_COLOR: Record<MuscleGroup, string> = {
  'PEITO':   Colors.cyber,
  'COSTAS':  Colors.brand,
  'OMBROS':  Colors.xp,
  'BÍCEPS':  Colors.success,
  'TRÍCEPS': Colors.streak,
  'PERNAS':  Colors.goal,
  'ABDÔMEN': Colors.muted,
};

const EXERCISES_DB: ExerciseDef[] = [
  // Peito
  { name: 'Supino Reto',            group: 'PEITO'   },
  { name: 'Supino Inclinado',       group: 'PEITO'   },
  { name: 'Crucifixo',              group: 'PEITO'   },
  { name: 'Flexão',                 group: 'PEITO'   },
  // Costas
  { name: 'Remada Curvada',         group: 'COSTAS'  },
  { name: 'Puxada',                 group: 'COSTAS'  },
  { name: 'Levantamento Terra',     group: 'COSTAS'  },
  { name: 'Remada Unilateral',      group: 'COSTAS'  },
  // Ombros
  { name: 'Desenvolvimento',        group: 'OMBROS'  },
  { name: 'Elevação Lateral',       group: 'OMBROS'  },
  { name: 'Elevação Frontal',       group: 'OMBROS'  },
  // Bíceps
  { name: 'Rosca Direta',           group: 'BÍCEPS'  },
  { name: 'Rosca Martelo',          group: 'BÍCEPS'  },
  { name: 'Rosca Concentrada',      group: 'BÍCEPS'  },
  // Tríceps
  { name: 'Tríceps Pulley',         group: 'TRÍCEPS' },
  { name: 'Tríceps Testa',          group: 'TRÍCEPS' },
  { name: 'Mergulho',               group: 'TRÍCEPS' },
  // Pernas
  { name: 'Agachamento',            group: 'PERNAS'  },
  { name: 'Leg Press',              group: 'PERNAS'  },
  { name: 'Cadeira Extensora',      group: 'PERNAS'  },
  { name: 'Cadeira Flexora',        group: 'PERNAS'  },
  { name: 'Panturrilha',            group: 'PERNAS'  },
  // Abdômen
  { name: 'Abdominal',              group: 'ABDÔMEN' },
  { name: 'Prancha',                group: 'ABDÔMEN' },
  { name: 'Abdominal Oblíquo',      group: 'ABDÔMEN' },
];

// ─── Tipos locais ──────────────────────────────────────────────────────────────

interface ExerciseEntry {
  localId:      string;
  exerciseName: string;
  group:        MuscleGroup;
  sets:         string;
  reps:         string;
  weight:       string;
}

// ─── Sub-componentes ─────────────────────────────────────────────────────────

function ProgressBar() {
  return (
    <View style={styles.progressRow}>
      <View style={[styles.progressSegment, styles.progressActive]} />
      <View style={[styles.progressSegment, styles.progressActive]} />
    </View>
  );
}

interface ExerciseCardProps {
  entry:    ExerciseEntry;
  onChange: (id: string, field: keyof Pick<ExerciseEntry, 'sets' | 'reps' | 'weight'>, value: string) => void;
  onRemove: (id: string) => void;
}

function ExerciseCard({ entry, onChange, onRemove }: ExerciseCardProps) {
  const color = GROUP_COLOR[entry.group];
  return (
    <View style={styles.exCard}>
      {/* Cabeçalho do card */}
      <View style={styles.exCardHeader}>
        <View style={styles.exIconBg}>
          <MaterialCommunityIcons name="dumbbell" size={18} color={Colors.cyber} />
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.exName}>{entry.exerciseName}</Text>
          <View style={[styles.groupTag, { backgroundColor: color + '20', borderColor: color + '40' }]}>
            <Text style={[styles.groupTagText, { color }]}>{entry.group}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => onRemove(entry.localId)} activeOpacity={0.7} style={styles.removeBtn}>
          <Ionicons name="trash-outline" size={18} color={Colors.faint} />
        </TouchableOpacity>
      </View>

      {/* Inputs: Séries / Reps / Carga */}
      <View style={styles.exInputRow}>
        {([
          { field: 'sets'   as const, label: 'SÉRIES' },
          { field: 'reps'   as const, label: 'REPS'   },
          { field: 'weight' as const, label: 'CARGA'  },
        ] as const).map(({ field, label }) => (
          <View key={field} style={styles.exInputCol}>
            <Text style={styles.exInputLabel}>{label}</Text>
            <View style={styles.exInputWrap}>
              <TextInput
                style={styles.exInput}
                value={entry[field]}
                onChangeText={(v) => onChange(entry.localId, field, v)}
                placeholder="0"
                placeholderTextColor="rgba(255,255,255,0.15)"
                keyboardType="numeric"
                maxLength={5}
              />
              {field === 'weight' && <Text style={styles.exUnit}>kg</Text>}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Modal seletor de exercícios ──────────────────────────────────────────────

const GROUPS: MuscleGroup[] = ['PEITO', 'COSTAS', 'OMBROS', 'BÍCEPS', 'TRÍCEPS', 'PERNAS', 'ABDÔMEN'];

interface ExercisePickerProps {
  visible:  boolean;
  onClose:  () => void;
  onSelect: (def: ExerciseDef) => void;
  search:   string;
  onSearch: (v: string) => void;
}

function ExercisePicker({ visible, onClose, onSelect, search, onSearch }: ExercisePickerProps) {
  const filtered = search.trim()
    ? EXERCISES_DB.filter((e) =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.group.toLowerCase().includes(search.toLowerCase()),
      )
    : EXERCISES_DB;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.modalContainer}>

        {/* Handle */}
        <View style={styles.modalHandle} />

        {/* Cabeçalho */}
        <View style={styles.modalHeader}>
          <View>
            <Text style={styles.modalTitle}>EXERCÍCIOS</Text>
            <Text style={styles.modalSub}>Selecione para adicionar ao treino</Text>
          </View>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.modalCloseBtn}>
            <Ionicons name="close" size={20} color={Colors.muted} />
          </TouchableOpacity>
        </View>

        {/* Busca */}
        <View style={styles.searchRow}>
          <Ionicons name="search" size={16} color={Colors.subtle} style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={onSearch}
            placeholder="Buscar exercício ou grupo..."
            placeholderTextColor="rgba(255,255,255,0.2)"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => onSearch('')} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={16} color={Colors.subtle} />
            </TouchableOpacity>
          )}
        </View>

        {/* Lista */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.name}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhum exercício encontrado.</Text>
          }
          renderItem={({ item, index }) => {
            const color      = GROUP_COLOR[item.group];
            const showHeader = index === 0 || filtered[index - 1].group !== item.group;
            return (
              <>
                {showHeader && !search.trim() && (
                  <Text style={[styles.groupHeader, { color }]}>{item.group}</Text>
                )}
                <TouchableOpacity
                  style={styles.exRow}
                  onPress={() => onSelect(item)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.exRowDot, { backgroundColor: color + '30', borderColor: color + '60' }]}>
                    <View style={[styles.exRowDotInner, { backgroundColor: color }]} />
                  </View>
                  <Text style={styles.exRowName}>{item.name}</Text>
                  {search.trim() && (
                    <View style={[styles.groupTag, { backgroundColor: color + '20', borderColor: color + '40', marginLeft: 'auto' }]}>
                      <Text style={[styles.groupTagText, { color }]}>{item.group}</Text>
                    </View>
                  )}
                  <Ionicons name="add-circle-outline" size={20} color={Colors.cyber} style={{ marginLeft: 8 }} />
                </TouchableOpacity>
              </>
            );
          }}
        />
      </View>
    </Modal>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function StrengthWorkoutScreen() {
  const router = useRouter();

  const [durationMin,  setDurationMin]  = useState('');
  const [calories,     setCalories]     = useState('');
  const [notes,        setNotes]        = useState('');
  const [exercises,    setExercises]    = useState<ExerciseEntry[]>([]);
  const [showPicker,   setShowPicker]   = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  // ── Gerenciar exercícios ──

  const handleAddExercise = useCallback((def: ExerciseDef) => {
    setExercises((prev) => [
      ...prev,
      {
        localId:      `${def.name}-${Date.now()}`,
        exerciseName: def.name,
        group:        def.group,
        sets:         '',
        reps:         '',
        weight:       '',
      },
    ]);
    setShowPicker(false);
    setPickerSearch('');
  }, []);

  const handleChangeField = useCallback(
    (id: string, field: keyof Pick<ExerciseEntry, 'sets' | 'reps' | 'weight'>, value: string) => {
      setExercises((prev) =>
        prev.map((e) => (e.localId === id ? { ...e, [field]: value } : e)),
      );
    },
    [],
  );

  const handleRemove = useCallback((id: string) => {
    setExercises((prev) => prev.filter((e) => e.localId !== id));
  }, []);

  // ── Salvar ──

  async function handleSave() {
    if (exercises.length === 0) {
      setError('Adicione pelo menos um exercício ao treino.');
      return;
    }

    const duration = parseFloat(durationMin);
    if (!duration || duration <= 0) {
      setError('Informe a duração do treino em minutos.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await workoutService.create({
        type:               'STRENGTH',
        primaryMuscleGroup: exercises[0].group,
        durationMin:        duration,
        caloriesBurned:     parseFloat(calories) || 0,
        notes:              notes.trim() || undefined,
        exercises: exercises.map((e) => ({
          exerciseName: e.exerciseName,
          sets:         parseInt(e.sets,   10) || 0,
          reps:         parseInt(e.reps,   10) || 0,
          weight:       parseFloat(e.weight)   || 0,
          restSeconds:  0,
        })),
      });

      Alert.alert(
        'Treino registrado!',
        'Sua sessão de musculação foi salva. Continue evoluindo!',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)/home') }],
      );
    } catch (e) {
      setError(parseApiError(e));
    } finally {
      setSaving(false);
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      <ProgressBar />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backText}>← VOLTAR</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>PASSO 02: MUSCULAÇÃO</Text>
          <Text style={styles.headerSub}>AJUSTE OS PARÂMETROS DE PERFORMANCE</Text>
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

        {/* ── Duração ── */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>DURAÇÃO (MINUTOS)</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={durationMin}
              onChangeText={setDurationMin}
              placeholder="45"
              placeholderTextColor="rgba(255,255,255,0.15)"
              keyboardType="numeric"
            />
            <Text style={styles.unit}>min</Text>
          </View>
        </View>

        {/* ── Calorias ── */}
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

        {/* ── Exercícios ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>EXERCÍCIOS</Text>
            <Text style={styles.sectionCount}>
              {exercises.length > 0 ? `${exercises.length} adicionado${exercises.length > 1 ? 's' : ''}` : 'Nenhum ainda'}
            </Text>
          </View>

          {/* Lista de exercícios */}
          {exercises.map((entry) => (
            <ExerciseCard
              key={entry.localId}
              entry={entry}
              onChange={handleChangeField}
              onRemove={handleRemove}
            />
          ))}

          {/* Botão adicionar */}
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowPicker(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color={Colors.cyber} />
            <Text style={styles.addBtnText}>ADICIONAR EXERCÍCIO</Text>
          </TouchableOpacity>
        </View>

        {/* ── Observações ── */}
        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Text style={styles.fieldLabel}>OBSERVAÇÕES</Text>
            <Text style={styles.optionalTag}>OPCIONAL</Text>
          </View>
          <TextInput
            style={styles.textarea}
            value={notes}
            onChangeText={setNotes}
            placeholder="Ex: Treino A — foco em peitoral..."
            placeholderTextColor="rgba(255,255,255,0.15)"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

      </ScrollView>

      {/* ── Botão salvar ── */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
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

      {/* ── Modal seletor ── */}
      <ExercisePicker
        visible={showPicker}
        onClose={() => { setShowPicker(false); setPickerSearch(''); }}
        onSelect={handleAddExercise}
        search={pickerSearch}
        onSearch={setPickerSearch}
      />

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
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 16,
    paddingVertical:   14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backBtn:    { minWidth: 70, paddingVertical: 4 },
  backText:   { color: Colors.cyber, fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle:  { color: Colors.white, fontSize: 11, fontWeight: '700', letterSpacing: 2 },
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
    gap:               24,
  },

  errorBox: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: 'rgba(248,113,113,0.1)',
    borderWidth:     1,
    borderColor:     'rgba(248,113,113,0.25)',
    borderRadius:    12,
    padding:         14,
  },
  errorText: { color: Colors.error, fontSize: 13, flex: 1 },

  field:    { gap: 8 },
  fieldLabel: {
    color:         Colors.cyber,
    fontSize:      10,
    fontWeight:    '700',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  optionalTag: {
    color:             Colors.faint,
    fontSize:          9,
    fontWeight:        '600',
    letterSpacing:     1.5,
    backgroundColor:   'rgba(255,255,255,0.05)',
    paddingHorizontal: 6,
    paddingVertical:   2,
    borderRadius:      4,
  },

  inputRow: {
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   Colors.card,
    borderWidth:       1,
    borderColor:       'rgba(255,255,255,0.08)',
    borderRadius:      14,
    paddingHorizontal: 16,
  },
  input: { flex: 1, color: Colors.white, fontSize: 16, paddingVertical: 14 },
  unit:  { color: Colors.subtle, fontSize: 13, fontWeight: '500', marginLeft: 8 },

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

  // ── Seção exercícios ──
  section:       { gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle:  { color: Colors.cyber, fontSize: 10, fontWeight: '700', letterSpacing: 2.5, textTransform: 'uppercase' },
  sectionCount:  { color: Colors.subtle, fontSize: 11 },

  // ── Card de exercício ──
  exCard: {
    backgroundColor: Colors.card,
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.08)',
    borderRadius:    16,
    padding:         16,
    gap:             14,
  },
  exCardHeader: { flexDirection: 'row', alignItems: 'center' },
  exIconBg: {
    width:           38,
    height:          38,
    borderRadius:    10,
    backgroundColor: 'rgba(0,212,255,0.1)',
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
  },
  exName:  { color: Colors.white, fontSize: 14, fontWeight: '600', marginBottom: 4 },
  groupTag: {
    alignSelf:         'flex-start',
    borderWidth:       1,
    borderRadius:      4,
    paddingHorizontal: 6,
    paddingVertical:   2,
  },
  groupTagText: { fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  removeBtn: { padding: 4, marginLeft: 8 },

  exInputRow: { flexDirection: 'row', gap: 10 },
  exInputCol: { flex: 1, gap: 6 },
  exInputLabel: {
    color:         Colors.subtle,
    fontSize:      9,
    fontWeight:    '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign:     'center',
  },
  exInputWrap: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: '#111111',
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.1)',
    borderRadius:    10,
    paddingHorizontal: 10,
  },
  exInput: {
    flex:            1,
    color:           Colors.white,
    fontSize:        16,
    fontWeight:      '600',
    paddingVertical: 10,
    textAlign:       'center',
  },
  exUnit: { color: Colors.subtle, fontSize: 11 },

  // ── Botão adicionar ──
  addBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             8,
    paddingVertical: 16,
    borderRadius:    14,
    borderWidth:     1.5,
    borderStyle:     'dashed',
    borderColor:     Colors.cyber + '60',
    backgroundColor: 'rgba(0,212,255,0.04)',
  },
  addBtnText: {
    color:         Colors.cyber,
    fontSize:      12,
    fontWeight:    '700',
    letterSpacing: 2,
  },

  // ── Rodapé ──
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
  saveBtnText: { color: Colors.bg, fontSize: 14, fontWeight: '800', letterSpacing: 3 },

  // ── Modal ──
  modalContainer: {
    flex:            1,
    backgroundColor: '#111111',
    borderTopLeftRadius:  24,
    borderTopRightRadius: 24,
    paddingTop:      12,
  },
  modalHandle: {
    alignSelf:       'center',
    width:           40,
    height:          4,
    borderRadius:    2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginBottom:    16,
  },
  modalHeader: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 20,
    marginBottom:      16,
  },
  modalTitle: {
    color:         Colors.white,
    fontSize:      16,
    fontWeight:    '800',
    letterSpacing: 2,
  },
  modalSub:   { color: Colors.subtle, fontSize: 12, marginTop: 2 },
  modalCloseBtn: {
    width:           36,
    height:          36,
    borderRadius:    18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems:      'center',
    justifyContent:  'center',
  },

  searchRow: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: Colors.card,
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.08)',
    borderRadius:    12,
    paddingHorizontal: 14,
    paddingVertical:   10,
    marginHorizontal:  20,
    marginBottom:      16,
  },
  searchInput: {
    flex:     1,
    color:    Colors.white,
    fontSize: 14,
  },

  groupHeader: {
    fontSize:      10,
    fontWeight:    '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop:     16,
    marginBottom:  8,
  },
  exRow: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  exRowDot: {
    width:          20,
    height:         20,
    borderRadius:   10,
    borderWidth:    1,
    alignItems:     'center',
    justifyContent: 'center',
    marginRight:    12,
    flexShrink:     0,
  },
  exRowDotInner: { width: 6, height: 6, borderRadius: 3 },
  exRowName: { color: Colors.white, fontSize: 14, flex: 1 },

  emptyText: {
    color:     Colors.subtle,
    fontSize:  13,
    textAlign: 'center',
    marginTop: 32,
  },
});
