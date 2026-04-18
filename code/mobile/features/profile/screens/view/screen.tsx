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
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pencil } from 'lucide-react-native';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { profileService } from '@/features/auth/services/profile.service';
import { progressionService } from '@/features/progression/services/progression.service';
import { workoutService } from '@/features/workout/services/workout.service';
import { parseApiError } from '@/shared/api/api-error';
import { AppHeader } from '@/components/AppHeader';
import { Colors } from '@/theme/colors';
import type { ProfileDto } from '@/features/auth/types/profile.types';
import type { ProgressionDto } from '@/features/progression/types/progression.types';
import type { WorkoutDto } from '@/features/workout/types/workout.types';

// ─── Avatar grande ────────────────────────────────────────────────────────────

function AvatarLarge({ photoUrl, initial }: { photoUrl?: string | null; initial: string }) {
  const [imgError, setImgError] = useState(false);

  // Reseta o erro sempre que uma nova URL chegar (ex: após upload)
  useEffect(() => { setImgError(false); }, [photoUrl]);

  if (photoUrl && !imgError) {
    return (
      <Image
        key={photoUrl}
        source={{ uri: photoUrl }}
        style={styles.avatarImg}
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <View style={styles.avatarPlaceholder}>
      <Text style={{ color: '#00d4ff', fontSize: 36, fontWeight: 'bold' }}>
        {initial.charAt(0).toUpperCase()}
      </Text>
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
    <View className="bg-app-card rounded-2xl p-6 items-center border border-cyber/10 mt-2">
      <Animated.View style={[styles.skeletonCircle, { opacity }]} />
      <Animated.View style={[styles.skeletonLine, { width: 120, opacity }]} />
      <Animated.View style={[styles.skeletonLine, { width: 200, opacity }]} />
    </View>
  );
}

function StatsSkeleton() {
  const opacity = useSkeletonOpacity();
  return (
    <View className="flex-row mt-4 gap-2">
      {[0, 1, 2].map((i) => (
        <Animated.View key={i} style={[styles.skeletonStatCard, { opacity }]} />
      ))}
    </View>
  );
}

// ─── Stats row ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label:       string;
  value:       string | null | undefined;
  unit?:       string;
  valueColor?: string;
  large?:      boolean;
}

function StatCard({ label, value, unit, valueColor, large = false }: StatCardProps) {
  const displayValue = value != null && value !== '' ? value : '—';
  const hasValue     = displayValue !== '—';

  return (
    <View className="flex-1 bg-app-card rounded-2xl border border-cyber/10 py-4 px-2.5 items-center justify-center">
      <Text
        className="text-subtle text-[10px] font-semibold uppercase mb-1.5"
        style={{ letterSpacing: 1.5 }}
      >
        {label}
      </Text>
      <View className="flex-row items-end gap-1">
        <Text
          className="text-white font-bold"
          style={[
            large ? { fontSize: 26 } : { fontSize: 18 },
            hasValue && valueColor ? { color: valueColor } : undefined,
          ]}
        >
          {displayValue}
        </Text>
        {unit && hasValue && (
          <Text
            className="text-faint font-medium"
            style={large ? { fontSize: 13, marginBottom: 4 } : { fontSize: 11, marginBottom: 2 }}
          >
            {unit}
          </Text>
        )}
      </View>
    </View>
  );
}

function StatsRow({ profile }: { profile: ProfileDto }) {
  const weight = profile.weight != null ? String(profile.weight) : null;
  const height = profile.height != null ? String(profile.height) : null;

  return (
    <View className="flex-row gap-2 mt-6">
      <StatCard label="PESO"   value={weight} unit="kg" large />
      <StatCard label="ALTURA" value={height} unit="m"  large />
      <StatCard label="META"   value={profile.goal} valueColor={Colors.goal} />
    </View>
  );
}

// ─── Level card ───────────────────────────────────────────────────────────────

function LevelCardSkeleton() {
  const opacity = useSkeletonOpacity();
  return (
    <Animated.View style={[styles.skeletonLevelCard, { opacity }]} />
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
  const xpInLevel  = currentXp - currentLevelXpRequired;
  const xpForLevel = nextLevelXpRequired - currentLevelXpRequired;

  return (
    <View style={styles.levelCard} className="mt-4 p-5">
      {/* Header row */}
      <View className="flex-row justify-between items-center mb-3">
        <Text
          className="text-cyber text-[10px] font-semibold uppercase"
          style={{ letterSpacing: 2 }}
        >
          PROGRESSO DE NÍVEL
        </Text>
        <Text style={{ fontSize: 16, opacity: 0.3 }}>⚡</Text>
      </View>

      {/* Level value */}
      <Text
        className="text-white font-bold mb-3.5"
        style={{ fontSize: 32, letterSpacing: 2 }}
      >
        LVL {level}
      </Text>

      {/* Progress track */}
      <View className="h-2 bg-app-darker rounded overflow-hidden mb-2">
        <View
          className="h-2 bg-cyber rounded"
          style={{ width: `${barPercent}%` }}
        />
      </View>

      {/* XP labels */}
      <View className="flex-row justify-between">
        <Text className="text-subtle text-[11px] font-medium">{xpInLevel} XP</Text>
        <Text className="text-subtle text-[11px] font-medium">{xpForLevel} XP</Text>
      </View>
    </View>
  );
}

// ─── Conquistas ──────────────────────────────────────────────────────────────

type AchievementIconCfg = {
  lib:  'ion' | 'mci';
  name: string;
};

const ACHIEVEMENT_ICON_MAP: Record<string, AchievementIconCfg> = {
  CONSISTENCY: { lib: 'ion', name: 'calendar-outline' },
  VOLUME:      { lib: 'mci', name: 'dumbbell'         },
  SPEED:       { lib: 'ion', name: 'flash-outline'    },
  STRENGTH:    { lib: 'ion', name: 'barbell-outline'  },
  SOCIAL:      { lib: 'ion', name: 'people-outline'   },
};

function AchievementTypeIcon({ type, size = 28 }: { type?: string; size?: number }) {
  const cfg       = type ? (ACHIEVEMENT_ICON_MAP[type] ?? null) : null;
  const glowColor = type ? (Colors.glow[type as keyof typeof Colors.glow] ?? Colors.cyber) : Colors.cyber;

  if (!cfg) {
    return <Ionicons name="trophy-outline" size={size} color={Colors.cyber} />;
  }
  if (cfg.lib === 'mci') {
    return <MaterialCommunityIcons name={cfg.name as any} size={size} color={glowColor} />;
  }
  return <Ionicons name={cfg.name as any} size={size} color={glowColor} />;
}

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
        <Ionicons name="lock-closed" size={26} color="#334155" />
        <Text
          className="text-[#334155] text-[10px] font-semibold uppercase"
          style={{ letterSpacing: 1.5, marginTop: 10 }}
        >
          BLOQUEADO
        </Text>
      </View>
    );
  }

  const glowColor = item.type
    ? (Colors.glow[item.type as keyof typeof Colors.glow] ?? Colors.cyber)
    : Colors.cyber;

  return (
    <View style={styles.achievementCard} className="bg-app-card border border-cyber/10">
      {/* Glow + ícone centralizados */}
      <View style={styles.achievementIconContainer}>
        <View style={[styles.achievementGlow, { backgroundColor: glowColor }]} />
        <AchievementTypeIcon type={item.type} size={28} />
      </View>

      <Text
        className="text-white text-xs font-semibold text-center"
        style={{ lineHeight: 17, marginTop: 10 }}
        numberOfLines={2}
      >
        {item.title}
      </Text>
    </View>
  );
}

function AchievementsSection({ achievements }: { achievements: ProgressionDto['achievements'] }) {
  const slots: [AchievementSlotData, AchievementSlotData, AchievementSlotData, AchievementSlotData] = [
    achievements[0] ?? LOCKED,
    achievements[1] ?? LOCKED,
    achievements[2] ?? LOCKED,
    achievements[3] ?? LOCKED,
  ];

  return (
    <View className="mt-8">
      <View className="flex-row items-center gap-2 mb-3">
        <Ionicons name="trophy" size={16} color={Colors.cyber} />
        <Text className="text-white text-[15px] font-bold" style={{ letterSpacing: 1 }}>
          CONQUISTAS
        </Text>
      </View>

      {/* Row 1 */}
      <View style={styles.achievementsRow}>
        <AchievementSlot item={slots[0]} />
        <AchievementSlot item={slots[1]} />
      </View>

      {/* Row 2 */}
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

const WORKOUT_CONFIG: Record<string, { iconName: string; color: string }> = {
  RUNNING:  { iconName: 'run',     color: Colors.cyber   },
  STRENGTH: { iconName: 'dumbbell', color: Colors.success },
};

function WorkoutCard({ workout }: { workout: WorkoutDto }) {
  const cfg      = WORKOUT_CONFIG[workout.type] ?? WORKOUT_CONFIG.STRENGTH;
  const title    = getWorkoutTitle(workout);
  const dateStr  = formatRelativeDate(workout.dateTime);
  const subtitle = `${dateStr}  •  ${workout.durationMin} MIN  •  ${Math.round(workout.caloriesBurned)} KCAL`;

  return (
    <View className="flex-row items-center bg-app-card rounded-2xl border border-white/5 p-3.5 mb-2.5 gap-3.5">
      {/* Icon box */}
      <View
        className="w-11 h-11 rounded-[10px] bg-app-input items-center justify-center border"
        style={{ borderColor: cfg.color }}
      >
        <MaterialCommunityIcons name={cfg.iconName as any} size={22} color={cfg.color} />
      </View>

      {/* Text */}
      <View className="flex-1 gap-1">
        <Text className="text-white text-sm font-semibold" numberOfLines={1}>{title}</Text>
        <Text
          className="text-subtle text-[11px] font-medium uppercase"
          style={{ letterSpacing: 0.5 }}
        >
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

function ActivitySkeleton() {
  const opacity = useSkeletonOpacity();
  return (
    <View className="mt-6">
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
    <View className="mt-6">
      <View className="flex-row items-center gap-2 mb-3">
        <Ionicons name="time-outline" size={16} color={Colors.cyber} />
        <Text className="text-white text-[15px] font-bold" style={{ letterSpacing: 1 }}>
          ATIVIDADES RECENTES
        </Text>
      </View>
      {workouts.map((w) => (
        <WorkoutCard key={w.id} workout={w} />
      ))}
    </View>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const router    = useRouter();
  const user      = useAuthStore((s) => s.user);
  const patchUser = useAuthStore((s) => s.patchUser);

  const [profile,     setProfile]     = useState<ProfileDto | null>(null);
  const [progression, setProgression] = useState<ProgressionDto | null>(null);
  const [workouts,    setWorkouts]    = useState<WorkoutDto[]>([]);
  const [isLoading,   setIsLoading]   = useState(true);
  const [progLoading, setProgLoading] = useState(true);
  const [wktLoading,  setWktLoading]  = useState(true);
  const [error,       setError]       = useState<string | null>(null);

  const nameInitial = user?.name?.charAt(0) ?? user?.email?.charAt(0) ?? '?';

  // avatarUrl do store serve como cache imediato enquanto o fetch não termina
  const cachedPhotoUrl = user?.avatarUrl ?? null;

  useFocusEffect(
    useCallback(() => {
      if (!user?.id) return;

      setIsLoading(true);
      setProgLoading(true);
      setWktLoading(true);
      setError(null);

      profileService
        .get(user.id)
        .then((p) => {
          setProfile(p);
          // Mantém o store sincronizado para exibição imediata na próxima vez
          if (p.photoUrl) patchUser({ avatarUrl: p.photoUrl });
        })
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

  // Foto: usa a do fetch (mais fresca) ou o cache do store enquanto carrega
  const displayPhotoUrl = profile?.photoUrl ?? cachedPhotoUrl;

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      {/* ── Header fixo ── */}
      <AppHeader
        initial={nameInitial}
        level={progression?.level ?? null}
        streak={progression?.streakDays ?? null}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40}}
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
          <View className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mt-2">
            <Text className="text-red-400 text-sm text-center">{error}</Text>
          </View>
        )}

        {/* ── Conteúdo ── */}
        {!isLoading && !error && (
          <>
            {/* Identity card */}
            <View className="bg-app-card rounded-2xl p-6 items-center border border-cyber/10 mt-2 relative">
              {/* Edit button */}
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => router.push('/profile/edit')}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Pencil size={18} color={Colors.cyber} />
              </TouchableOpacity>

              {/* Avatar */}
              <View style={styles.avatarWrapper} className="mb-4">
                <AvatarLarge
                  photoUrl={displayPhotoUrl}
                  initial={user?.name ?? user?.email ?? '?'}
                />
              </View>

              {/* Name */}
              <Text
                className="text-white text-xl font-bold text-center mb-2"
                style={{ letterSpacing: 2 }}
              >
                {user?.name ? user.name.toUpperCase() : 'GUILHERME'}
              </Text>

              {/* Bio */}
              {profile?.bio ? (
                <Text className="text-muted text-base/8 text-center leading-5">{profile.bio}</Text>
              ) : (
                <Text className="text-faint text-[13px] text-center italic">Sem descrição ainda</Text>
              )}
            </View>

            {/* Stats */}
            {profile && <StatsRow profile={profile} />}

            {/* Level progress */}
            {progLoading && <LevelCardSkeleton />}
            {!progLoading && progression && <LevelCard progression={progression} />}

            {/* Achievements */}
            {!progLoading && progression && (
              <AchievementsSection achievements={progression.achievements} />
            )}

            {/* Recent Activity */}
            {wktLoading && <ActivitySkeleton />}
            {!wktLoading && <RecentActivitySection workouts={workouts} />}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── StyleSheet — apenas para valores computados e impossíveis no NativeWind ──

const AVATAR_SIZE = 96;

const styles = StyleSheet.create({
  // Avatar — dimensões calculadas
  avatarWrapper: {
    width:          AVATAR_SIZE + 8,
    height:         AVATAR_SIZE + 8,
    borderRadius:   (AVATAR_SIZE + 8) / 2,
    borderWidth:    2,
    borderColor:    Colors.cyber,
    alignItems:     'center',
    justifyContent: 'center',
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
    backgroundColor: Colors.input,
    alignItems:      'center',
    justifyContent:  'center',
  },

  // Edit button — absolute position
  editBtn: {
    position: 'absolute',
    top:      12,
    right:    12,
    zIndex:   1,
    padding:  4,
  },

  // Level card — asymmetric left border
  levelCard: {
    backgroundColor: Colors.card,
    borderRadius:    16,
    borderTopWidth:    1,
    borderRightWidth:  1,
    borderBottomWidth: 1,
    borderLeftWidth:   5,
    borderColor:       '#00d4ff1a',
    borderLeftColor:   '#69DAFF',
  },

  // Base compartilhada — altura fixa garante todos os cards iguais
  achievementCard: {
    flex:              1,
    height:            148,
    borderRadius:      16,
    paddingVertical:   20,
    paddingHorizontal: 12,
    alignItems:        'center',
    justifyContent:    'center',
    overflow:          'hidden',
  },

  // Achievement bloqueado — dashed border exige StyleSheet
  achievementCardLocked: {
    borderStyle:     'dashed',
    borderWidth:     1,
    borderColor:     '#ffffff15',
    backgroundColor: Colors.darker,
  },

  // Container do ícone — tamanho fixo, glow e ícone centralizados
  achievementIconContainer: {
    width:          56,
    height:         56,
    alignItems:     'center',
    justifyContent: 'center',
  },

  // Glow circle — preenche o container e fica atrás do ícone
  achievementGlow: {
    position:     'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 28,
    opacity:      0.20,
  },

  // Achievement rows — explicit rows to avoid flexWrap issues
  achievementsRow: {
    flexDirection: 'row',
    gap:           12,
  },
  achievementsRowSecond: {
    flexDirection: 'row',
    gap:           12,
    marginTop:     12,
  },

  // Skeleton shapes
  skeletonCircle: {
    width:           AVATAR_SIZE + 8,
    height:          AVATAR_SIZE + 8,
    borderRadius:    (AVATAR_SIZE + 8) / 2,
    backgroundColor: Colors.skeleton,
    marginBottom:    16,
  },
  skeletonLine: {
    height:          14,
    borderRadius:    7,
    backgroundColor: Colors.skeleton,
    marginBottom:    10,
  },
  skeletonStatCard: {
    flex:            1,
    height:          72,
    borderRadius:    14,
    backgroundColor: Colors.skeleton,
  },
  skeletonLevelCard: {
    height:          140,
    borderRadius:    16,
    backgroundColor: Colors.skeleton,
    marginTop:       16,
  },
  skeletonWorkoutCard: {
    height:          72,
    borderRadius:    14,
    backgroundColor: Colors.skeleton,
    marginBottom:    10,
  },
});
