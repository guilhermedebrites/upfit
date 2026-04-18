import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Pencil } from 'lucide-react-native';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { profileService } from '@/features/auth/services/profile.service';
import { progressionService } from '@/features/progression/services/progression.service';
import { workoutService } from '@/features/workout/services/workout.service';
import { parseApiError } from '@/shared/api/api-error';
import { AppHeader } from '@/shared/components/AppHeader';
import type { ProfileDto } from '@/features/auth/types/profile.types';
import type { ProgressionDto } from '@/features/progression/types/progression.types';
import type { WorkoutDto } from '@/features/workout/types/workout.types';

// ─── Avatar grande ────────────────────────────────────────────────────────────

function AvatarLarge({ photoUrl, initial }: { photoUrl?: string | null; initial: string }) {
  if (photoUrl) {
    return <Image source={{ uri: photoUrl }} style={styles.avatarImg} />;
  }
  return (
    <View style={styles.avatarPlaceholder}>
      <Text style={styles.avatarInitial}>{initial.charAt(0).toUpperCase()}</Text>
    </View>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function useSkeletonOpacity() {
  const opacity = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ]),
    ).start();
  }, []);
  return opacity;
}

function ProfileSkeleton() {
  const opacity = useSkeletonOpacity();
  return (
    <View style={styles.card}>
      <Animated.View style={[styles.skeletonCircle, { opacity }]} />
      <Animated.View style={[styles.skeletonLine, { width: 120, opacity }]} />
      <Animated.View style={[styles.skeletonLine, { width: 200, opacity }]} />
    </View>
  );
}

function StatsSkeleton() {
  const opacity = useSkeletonOpacity();
  return (
    <View style={styles.statsRow}>
      {[0, 1, 2].map((i) => (
        <Animated.View key={i} style={[styles.statCard, styles.skeletonStatCard, { opacity }]} />
      ))}
    </View>
  );
}

// ─── Stats row ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | null | undefined;
  unit?: string;
  valueColor?: string;
  large?: boolean;
}

function StatCard({ label, value, unit, valueColor, large = false }: StatCardProps) {
  const displayValue = value != null && value !== '' ? value : '—';
  const hasValue     = displayValue !== '—';

  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statValueRow}>
        <Text style={[
          styles.statValue,
          large && styles.statValueLarge,
          hasValue && valueColor ? { color: valueColor } : null,
        ]}>
          {displayValue}
        </Text>
        {unit && hasValue && (
          <Text style={[styles.statUnit, large && styles.statUnitLarge]}>{unit}</Text>
        )}
      </View>
    </View>
  );
}

function StatsRow({ profile }: { profile: ProfileDto }) {
  const weight = profile.weight != null ? String(profile.weight) : null;
  const height = profile.height != null ? String(profile.height) : null;

  return (
    <View style={styles.statsRow}>
      <StatCard label="PESO"   value={weight} unit="kg" large />
      <StatCard label="ALTURA" value={height} unit="m"  large />
      <StatCard label="META"   value={profile.goal} valueColor="#FFB547" />
    </View>
  );
}

// ─── Level card ───────────────────────────────────────────────────────────────

function LevelCardSkeleton() {
  const opacity = useSkeletonOpacity();
  return (
    <Animated.View style={[styles.levelCard, styles.skeletonLevelCard, { opacity }]} />
  );
}

function LevelCard({ progression }: { progression: ProgressionDto }) {
  const {
    level,
    currentXp,
    currentLevelXpRequired,
    nextLevelXpRequired,
    progressPercent,
  } = progression;

  const barPercent = Math.min(Math.max(progressPercent, 0), 100);

  // XP ganho dentro do nível atual vs total necessário para o nível
  const xpInLevel   = currentXp - currentLevelXpRequired;
  const xpForLevel  = nextLevelXpRequired - currentLevelXpRequired;

  return (
    <View style={styles.levelCard}>
      {/* Linha superior */}
      <View style={styles.levelHeader}>
        <Text style={styles.levelHeaderLabel}>PROGRESSO DE NÍVEL</Text>
        <Text style={styles.levelHeaderIcon}>⚡</Text>
      </View>

      {/* Nível atual */}
      <Text style={styles.levelValue}>LVL {level}</Text>

      {/* Barra de progresso */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${barPercent}%` }]} />
      </View>

      {/* Labels: XP no nível à esquerda, XP total do nível à direita */}
      <View style={styles.progressLabels}>
        <Text style={styles.xpLabel}>{xpInLevel} XP</Text>
        <Text style={styles.xpLabel}>{xpForLevel} XP</Text>
      </View>
    </View>
  );
}

// ─── Conquistas ──────────────────────────────────────────────────────────────

const ACHIEVEMENT_ICON: Record<string, string> = {
  CONSISTENCY: '📅',
  VOLUME:      '🏋️',
  SPEED:       '⚡',
  STRENGTH:    '💪',
  SOCIAL:      '👥',
};

const ACHIEVEMENT_GLOW_COLOR: Record<string, string> = {
  CONSISTENCY: '#3b82f6',
  VOLUME:      '#8b5cf6',
  SPEED:       '#00d4ff',
  STRENGTH:    '#f97316',
  SOCIAL:      '#22c55e',
};

type LockedSlot = { type: 'locked' };
type AchievementSlotData =
  | ProgressionDto['achievements'][number]
  | LockedSlot;

const LOCKED: LockedSlot = { type: 'locked' };

function isLocked(slot: AchievementSlotData): slot is LockedSlot {
  return (slot as LockedSlot).type === 'locked';
}

function AchievementSlot({ item }: { item: AchievementSlotData }) {
  if (isLocked(item)) {
    return (
      <View style={[styles.achievementCard, styles.achievementCardLocked]}>
        <Text style={styles.achievementIcon}>🔒</Text>
        <Text style={styles.achievementLockedText}>BLOQUEADO</Text>
      </View>
    );
  }

  const icon      = item.type ? (ACHIEVEMENT_ICON[item.type] ?? '🏆') : '🏆';
  const glowColor = item.type ? (ACHIEVEMENT_GLOW_COLOR[item.type] ?? '#00d4ff') : '#00d4ff';

  return (
    <View style={styles.achievementCard}>
      <View style={[styles.achievementGlow, { backgroundColor: glowColor }]} />
      <Text style={styles.achievementIcon}>{icon}</Text>
      <Text style={[styles.achievementTitle, { marginTop: 2 }]} numberOfLines={2}>{item.title}</Text>
    </View>
  );
}

function AchievementsSection({ achievements }: { achievements: ProgressionDto['achievements'] }) {
  // Array fixo de 4 posições — posições sem conquista recebem LOCKED
  const slots: [AchievementSlotData, AchievementSlotData, AchievementSlotData, AchievementSlotData] = [
    achievements[0] ?? LOCKED,
    achievements[1] ?? LOCKED,
    achievements[2] ?? LOCKED,
    achievements[3] ?? LOCKED,
  ];

  return (
    <View style={styles.achievementsSection}>
      <Text style={styles.achievementsTitle}>🎖️ CONQUISTAS</Text>

      {/* Linha 1 */}
      <View style={styles.achievementsRow}>
        <AchievementSlot item={slots[0]} />
        <AchievementSlot item={slots[1]} />
      </View>

      {/* Linha 2 */}
      <View style={styles.achievementsRowSecond}>
        <AchievementSlot item={slots[2]} />
        <AchievementSlot item={slots[3]} />
      </View>
    </View>
  );
}

// ─── Atividade Recente ────────────────────────────────────────────────────────

const MONTHS_PT = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];

function formatRelativeDate(dateTime: string): string {
  const date      = new Date(dateTime);
  const today     = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getDate()     === b.getDate()  &&
    a.getMonth()    === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  if (sameDay(date, today))     return 'HOJE';
  if (sameDay(date, yesterday)) return 'ONTEM';
  return `${date.getDate()} ${MONTHS_PT[date.getMonth()]}`;
}

function getWorkoutTitle(w: WorkoutDto): string {
  if (w.notes) return w.notes;
  if (w.type === 'RUNNING') {
    return w.distanceKm != null ? `Corrida • ${w.distanceKm} km` : 'Corrida';
  }
  return w.primaryMuscleGroup ? `Treino • ${w.primaryMuscleGroup}` : 'Treino de Força';
}

const WORKOUT_CONFIG = {
  RUNNING:  { icon: '🏃', color: '#00d4ff' },
  STRENGTH: { icon: '🏋️', color: '#22c55e' },
} as const;

function WorkoutCard({ workout }: { workout: WorkoutDto }) {
  const cfg      = WORKOUT_CONFIG[workout.type] ?? WORKOUT_CONFIG.STRENGTH;
  const title    = getWorkoutTitle(workout);
  const dateStr  = formatRelativeDate(workout.dateTime);
  const subtitle = `${dateStr}  •  ${workout.durationMin} MIN  •  ${Math.round(workout.caloriesBurned)} KCAL`;

  return (
    <View style={styles.workoutCard}>
      {/* Ícone colorido */}
      <View style={[styles.workoutIconBox, { borderColor: cfg.color }]}>
        <Text style={styles.workoutIconEmoji}>{cfg.icon}</Text>
      </View>

      {/* Texto */}
      <View style={styles.workoutInfo}>
        <Text style={styles.workoutTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.workoutSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

function ActivitySkeleton() {
  const opacity = useSkeletonOpacity();
  return (
    <View style={styles.activitySection}>
      <Animated.View style={[styles.skeletonLine, { width: 160, opacity }]} />
      {[0, 1, 2].map((i) => (
        <Animated.View key={i} style={[styles.skeletonWorkoutCard, { opacity }]} />
      ))}
    </View>
  );
}

function RecentActivitySection({ workouts }: { workouts: WorkoutDto[] }) {
  if (workouts.length === 0) return null;

  return (
    <View style={styles.activitySection}>
      <Text style={styles.activityTitle}>⏱ ATIVIDADES RECENTES</Text>
      {workouts.map((w) => (
        <WorkoutCard key={w.id} workout={w} />
      ))}
    </View>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const router = useRouter();
  const user   = useAuthStore((s) => s.user);

  const [profile,      setProfile]      = useState<ProfileDto | null>(null);
  const [progression,  setProgression]  = useState<ProgressionDto | null>(null);
  const [workouts,     setWorkouts]     = useState<WorkoutDto[]>([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [progLoading,  setProgLoading]  = useState(true);
  const [wktLoading,   setWktLoading]   = useState(true);
  const [error,        setError]        = useState<string | null>(null);

  const nameInitial = user?.name?.charAt(0) ?? user?.email?.charAt(0) ?? '?';

  // Refetch toda vez que a aba entra em foco
  useFocusEffect(
    useCallback(() => {
      if (!user?.id) return;

      setIsLoading(true);
      setProgLoading(true);
      setWktLoading(true);
      setError(null);

      profileService
        .get(user.id)
        .then(setProfile)
        .catch((err) => setError(parseApiError(err)))
        .finally(() => setIsLoading(false));

      progressionService
        .get(user.id)
        .then(setProgression)
        .catch(() => {})
        .finally(() => setProgLoading(false));

      workoutService
        .listByUser(user.id)
        .then((list) => setWorkouts(list.slice(0, 3)))
        .catch(() => setWorkouts([]))
        .finally(() => setWktLoading(false));
    }, [user?.id]),
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* ── Header fixo ── */}
      <AppHeader
        photoUrl={profile?.photoUrl}
        initial={nameInitial}
        level={progression?.level ?? null}
        streak={progression?.streakDays ?? null}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Skeleton ── */}
        {isLoading && (
          <>
            <ProfileSkeleton />
            <StatsSkeleton />
            <LevelCardSkeleton />
          </>
        )}

        {/* ── Erro ── */}
        {!isLoading && error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* ── Card de identidade ── */}
        {!isLoading && !error && (
          <>
            <View style={styles.card}>
              {/* Botão de editar — canto superior direito */}
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => router.push('/profile/edit')}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Pencil size={18} color="#00d4ff" />
              </TouchableOpacity>

              {/* Avatar grande */}
              <View style={styles.avatarWrapper}>
                <AvatarLarge
                  photoUrl={profile?.photoUrl}
                  initial={user?.name ?? user?.email ?? '?'}
                />
              </View>

              {/* Nome */}
              <Text style={styles.name}>
                {user?.name ? user.name.toUpperCase() : '—'}
              </Text>

              {/* Bio */}
              {profile?.bio ? (
                <Text style={styles.bio}>{profile.bio}</Text>
              ) : (
                <Text style={styles.bioEmpty}>Sem descrição ainda</Text>
              )}
            </View>

            {/* ── Stats ── */}
            {profile && <StatsRow profile={profile} />}

            {/* ── Progresso de nível ── */}
            {progLoading && <LevelCardSkeleton />}
            {!progLoading && progression && <LevelCard progression={progression} />}

            {/* ── Conquistas ── */}
            {!progLoading && progression && (
              <AchievementsSection achievements={progression.achievements} />
            )}

            {/* ── Atividade Recente ── */}
            {wktLoading && <ActivitySkeleton />}
            {!wktLoading && <RecentActivitySection workouts={workouts} />}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const AVATAR_SIZE = 96;

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#0a0a0a' },
  scroll:        { flex: 1 },
  scrollContent: { 
    paddingHorizontal: 16, 
    paddingTop: 8, 
    paddingBottom: 40 
  },

  // ── Card ──
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius:    16,
    padding:         24,
    alignItems:      'center',
    borderWidth:     1,
    borderColor:     '#00d4ff1a',
    marginTop:       8,
    position:        'relative',
  },
  editBtn: {
    position: 'absolute',
    top:      12,
    right:    12,
    zIndex:   1,
    padding:  4,
  },

  // ── Avatar ──
  avatarWrapper: {
    width:        AVATAR_SIZE + 8,
    height:       AVATAR_SIZE + 8,
    borderRadius: (AVATAR_SIZE + 8) / 2,
    borderWidth:  2,
    borderColor:  '#00d4ff',
    alignItems:   'center',
    justifyContent: 'center',
    marginBottom: 16,
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

  // ── Identidade ──
  name: {
    color:         '#ffffff',
    fontSize:      20,
    fontWeight:    'bold',
    letterSpacing: 2,
    textAlign:     'center',
    marginBottom:  8,
  },
  bio: {
    color:      '#94a3b8',
    fontSize:   14,
    textAlign:  'center',
    lineHeight: 20,
  },
  bioEmpty: {
    color:     '#475569',
    fontSize:  13,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // ── Stats row ──
  statsRow: {
    flexDirection: 'row',
    marginTop:     16,
    gap:           8,
  },
  statCard: {
    flex:              1,
    backgroundColor:   '#1a1a1a',
    borderRadius:      14,
    borderWidth:       1,
    borderColor:       '#00d4ff1a',
    paddingVertical:   16,
    paddingHorizontal: 10,
    alignItems:        'center',
    justifyContent:    'center',
  },
  statLabel: {
    color:         '#475569',
    fontSize:      10,
    fontWeight:    '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom:  6,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems:    'flex-end',
    gap:           3,
  },
  statValue: {
    color:      '#ffffff',
    fontSize:   18,
    fontWeight: 'bold',
  },
  statValueLarge: {
    fontSize: 26,
  },
  statUnit: {
    color:        '#64748b',
    fontSize:     11,
    fontWeight:   '500',
    marginBottom: 2,
  },
  statUnitLarge: {
    fontSize:     13,
    marginBottom: 4,
  },
  skeletonStatCard: {
    height:          72,
    backgroundColor: '#334155',
  },

  // ── Level card ──
  levelCard: {
    backgroundColor: '#1a1a1a',
    borderRadius:    16,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 5,
    borderColor:     '#00d4ff1a',
    borderLeftColor: '#69DAFF',
    padding:         20,
    marginTop:       16,
  },
  levelHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   12,
  },
  levelHeaderLabel: {
    color:         '#00d4ff',
    fontSize:      10,
    fontWeight:    '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  levelHeaderIcon: {
    fontSize: 16,
    opacity:  0.3,
  },
  levelValue: {
    color:         '#ffffff',
    fontSize:      32,
    fontWeight:    'bold',
    letterSpacing: 2,
    marginBottom:  14,
  },
  progressTrack: {
    height:          8,
    backgroundColor: '#0f0f0f',
    borderRadius:    4,
    overflow:        'hidden',
    marginBottom:    8,
  },
  progressFill: {
    height:          8,
    backgroundColor: '#00d4ff',
    borderRadius:    4,
  },
  progressLabels: {
    flexDirection:  'row',
    justifyContent: 'space-between',
  },
  xpLabel: {
    color:     '#475569',
    fontSize:  11,
    fontWeight: '500',
  },
  skeletonLevelCard: {
    height:          140,
    backgroundColor: '#334155',
  },

  // ── Conquistas ──
  achievementsSection: {
    marginTop: 16,
  },
  achievementsTitle: {
    color:         '#ffffff',
    fontSize:      15,
    fontWeight:    'bold',
    letterSpacing: 1,
    marginBottom:  12,
  },
  achievementsRow: {
    flexDirection: 'row',
    gap:           12,
  },
  achievementsRowSecond: {
    flexDirection: 'row',
    gap:           12,
    marginTop:     12,
  },
  achievementCard: {
    flex:              1,
    backgroundColor:   '#1a1a1a',
    borderRadius:      14,
    borderWidth:       1,
    paddingVertical:   20,
    paddingHorizontal: 12,
    alignItems:        'center',
    gap:               10,
    position:          'relative',
    overflow:          'hidden',
  },
  achievementCardLocked: {
    borderStyle:  'dashed',
    borderColor:  '#ffffff15',
    backgroundColor: '#111111',
  },
  achievementGlow: {
    position:     'absolute',
    width:        56,
    height:       56,
    borderRadius: 28,
    opacity:      0.15,
    top:          14,
  },
  achievementIcon: {
    fontSize: 30,
    zIndex:   1,
  },
  achievementTitle: {
    color:      '#ffffff',
    fontSize:   12,
    fontWeight: '600',
    textAlign:  'center',
    lineHeight: 17,
    zIndex:     1,
  },
  achievementLockedText: {
    color:         '#334155',
    fontSize:      10,
    fontWeight:    '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  // ── Skeleton ──
  skeletonCircle: {
    width:           AVATAR_SIZE + 8,
    height:          AVATAR_SIZE + 8,
    borderRadius:    (AVATAR_SIZE + 8) / 2,
    backgroundColor: '#334155',
    marginBottom:    16,
  },
  skeletonLine: {
    height:          14,
    borderRadius:    7,
    backgroundColor: '#334155',
    marginBottom:    10,
  },

  // ── Atividade Recente ──
  activitySection: {
    marginTop: 24,
  },
  activityTitle: {
    color:         '#ffffff',
    fontSize:      15,
    fontWeight:    'bold',
    letterSpacing: 1,
    marginBottom:  12,
  },
  workoutCard: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: '#1a1a1a',
    borderRadius:    14,
    borderWidth:     1,
    borderColor:     '#ffffff0a',
    padding:         14,
    marginBottom:    10,
    gap:             14,
  },
  workoutIconBox: {
    width:           44,
    height:          44,
    borderRadius:    10,
    borderWidth:     1,
    backgroundColor: '#0f0f0f',
    alignItems:      'center',
    justifyContent:  'center',
  },
  workoutIconEmoji: {
    fontSize: 22,
  },
  workoutInfo: {
    flex: 1,
    gap:  4,
  },
  workoutTitle: {
    color:      '#ffffff',
    fontSize:   14,
    fontWeight: '600',
  },
  workoutSubtitle: {
    color:         '#475569',
    fontSize:      11,
    fontWeight:    '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  skeletonWorkoutCard: {
    height:          72,
    borderRadius:    14,
    backgroundColor: '#334155',
    marginBottom:    10,
  },

  // ── Erro ──
  errorBox: {
    backgroundColor: '#ff000015',
    borderWidth:     1,
    borderColor:     '#ff000040',
    borderRadius:    12,
    padding:         16,
    marginTop:       8,
  },
  errorText: {
    color:     '#f87171',
    fontSize:  13,
    textAlign: 'center',
  },
});
