import { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { profileService } from '@/features/auth/services/profile.service';
import { progressionService } from '@/features/progression/services/progression.service';
import { workoutService } from '@/features/workout/services/workout.service';
import { groupsService } from '@/features/groups/services/groups.service';
import { challengesService } from '@/features/challenges/services/challenges.service';
import { AppHeader } from '@/components/AppHeader';
import { Colors } from '@/theme/colors';
import { ChallengeStatus } from '@/shared/types/enums';
import type { ProgressionDto } from '@/features/progression/types/progression.types';
import type { WorkoutDto } from '@/features/workout/types/workout.types';
import type { Group } from '@/features/groups/types/groups.types';
import type { Challenge } from '@/features/challenges/types/challenges.types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatXp(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return String(n);
}

function timeAgo(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  if (mins < 1)  return 'agora';
  if (mins < 60) return `${mins} min atrás`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h atrás`;
  return `${Math.floor(hrs / 24)}d atrás`;
}

function workoutTitle(w: WorkoutDto): string {
  if (w.notes?.trim()) return w.notes.trim();
  return w.type === 'RUNNING' ? 'Corrida' : 'Musculação';
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function useSkeletonOpacity() {
  const opacity = useRef(new Animated.Value(0.25)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.55, duration: 750, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.25, duration: 750, useNativeDriver: true }),
      ]),
    ).start();
  }, [opacity]);
  return opacity;
}

function SkeletonBlock({ w, h, radius = 10 }: { w: number | string; h: number; radius?: number }) {
  const opacity = useSkeletonOpacity();
  return (
    <Animated.View
      style={{ width: w as any, height: h, borderRadius: radius, backgroundColor: Colors.skeleton, opacity }}
    />
  );
}

function HomeSkeleton() {
  return (
    <View style={{ gap: 16, padding: 20, paddingTop: 8 }}>
      {/* HUD */}
      <View style={[styles.card, { gap: 12 }]}>
        <SkeletonBlock w={140} h={10} />
        <SkeletonBlock w="70%" h={28} radius={6} />
        <SkeletonBlock w="100%" h={8} radius={4} />
      </View>
      {/* Stats */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={[styles.card, { flex: 1, gap: 10 }]}>
          <SkeletonBlock w={80}  h={10} />
          <SkeletonBlock w={50}  h={28} radius={6} />
        </View>
        <View style={[styles.card, { flex: 1, gap: 10 }]}>
          <SkeletonBlock w={80}  h={10} />
          <SkeletonBlock w={50}  h={28} radius={6} />
        </View>
      </View>
      {/* Activity */}
      <View style={[styles.card, { gap: 12 }]}>
        <SkeletonBlock w={160} h={10} />
        <SkeletonBlock w="100%" h={72} radius={12} />
      </View>
    </View>
  );
}

// ─── Tela ─────────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const user   = useAuthStore((s) => s.user);
  const patchUser = useAuthStore((s) => s.patchUser);

  const [loading,         setLoading]         = useState(true);
  const [photoUrl,        setPhotoUrl]        = useState<string | null>(null);
  const [progression,     setProgression]     = useState<ProgressionDto | null>(null);
  const [lastWorkout,     setLastWorkout]     = useState<WorkoutDto | null>(null);
  const [myGroup,         setMyGroup]         = useState<Group | null | undefined>(undefined); // undefined = ainda não carregou
  const [rank,            setRank]            = useState<number | null>(null);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!user?.id) return;
      setLoading(true);

      async function load() {
        const [progRes, workoutsRes, groupsRes, challengesRes, profileRes] = await Promise.allSettled([
          progressionService.get(user!.id),
          workoutService.listByUser(user!.id),
          groupsService.listMine(),
          challengesService.listParticipating(),
          profileService.get(user!.id),
        ]);

        if (progRes.status       === 'fulfilled') setProgression(progRes.value);
        if (workoutsRes.status   === 'fulfilled') setLastWorkout(workoutsRes.value[0] ?? null);
        if (challengesRes.status === 'fulfilled') {
          const active = challengesRes.value.find((c) => c.status === ChallengeStatus.ACTIVE) ?? null;
          setActiveChallenge(active);
        }
        if (profileRes.status === 'fulfilled') {
          setPhotoUrl(profileRes.value.photoUrl ?? null);
          if (profileRes.value.photoUrl) {
            patchUser({ avatarUrl: profileRes.value.photoUrl });
          }
        }

        if (groupsRes.status === 'fulfilled') {
          const group = groupsRes.value[0] ?? null;
          setMyGroup(group);
          if (group) {
            try {
              const ranking = await groupsService.getRanking(group.id);
              const pos     = ranking.findIndex((m) => m.userId === user!.id);
              setRank(pos >= 0 ? pos + 1 : null);
            } catch { /* silencioso */ }
          }
        } else {
          setMyGroup(null);
        }

        setLoading(false);
      }

      load();
    }, [user?.id]),
  );

  const nameInitial = (user?.name ?? user?.email ?? '?').charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      <AppHeader
        initial={nameInitial}
        photoUrl={photoUrl}
        level={progression?.level ?? null}
        streak={progression?.streakDays ?? null}
      />

      {loading ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <HomeSkeleton />
        </ScrollView>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >

          {/* ── HUD Panel ── */}
          <View style={{ paddingVertical: 8 }}>
            <Text style={styles.sectionLabel}>PAINEL HUD UPFIT</Text>

            <View style={styles.xpRow}>
              <Text style={styles.xpValue}>
                {formatXp(progression?.currentXp ?? 0)}
              </Text>
              <Text style={styles.xpSeparator}> / </Text>
              <Text style={styles.xpTotal}>
                {formatXp(progression?.nextLevelXpRequired ?? 0)} XP
              </Text>
            </View>

            <Text style={styles.xpLabel}>XP ATUAL — NÍVEL {progression?.level ?? '—'}</Text>

            {/* Barra de progresso */}
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: `${Math.min(progression?.progressPercent ?? 0, 100)}%` },
                ]}
              />
            </View>

            <View style={styles.barLabels}>
              <Text style={styles.barLabelLeft}>
                {formatXp(progression?.currentLevelXpRequired ?? 0)} XP
              </Text>
              <Text style={styles.barLabelRight}>
                {formatXp(progression?.xpToNextLevel ?? 0)} XP restantes
              </Text>
            </View>
          </View>

          {/* ── Stats ── */}
          <View style={styles.statsRow}>

            {/* Ofensiva de Poder */}
            <View style={[styles.statCard, { position: 'relative', overflow: 'hidden' }]}>
              <View style={{ position: 'absolute', right: -15, bottom: -15, opacity: 0.08 }}>
                <Ionicons name="flame" size={80} color="#ffffff" />
              </View>
              <Text style={[styles.sectionLabel, { marginBottom: 12 }]}>OFENSIVA DE PODER</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[styles.statValue, { fontSize: 32, fontWeight: '800' }]}>
                  {progression?.streakDays ?? 0}
                </Text>
                <Text style={[styles.statUnit, { color: Colors.xp, fontSize: 16, fontWeight: '700' }]}>
                  DIAS
                </Text>
              </View>
            </View>

            {/* Rank da Guilda */}
            <View style={[styles.statCard, { position: 'relative', overflow: 'hidden' }]}>
              <View style={{ position: 'absolute', right: -15, bottom: -15, opacity: 0.08 }}>
                <Ionicons name="trophy" size={80} color="#ffffff" />
              </View>
              <Text style={[styles.sectionLabel, { marginBottom: 12 }]}>RANK DA GUILDA</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[styles.statValue, { fontSize: 32, fontWeight: '800' }]}>
                  {rank != null ? `#${rank}` : '—'}
                </Text>
              </View>
            </View>

          </View>

          {/* ── Atividade Recente ── */}
          <View>
            <View style={[styles.sectionHeaderRow, { alignItems: 'center', marginVertical: 12 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                <View style={{ width: 4, height: 32, backgroundColor: Colors.cyber, borderRadius: 2 }} />
                <Text style={[styles.sectionTitle, { fontSize: 12, fontWeight: '800' }]}>ATIVIDADE RECENTE</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(tabs)/workouts')} activeOpacity={0.7}>
                <Text style={styles.sectionLink}>VER HISTÓRICO →</Text>
              </TouchableOpacity>
            </View>

            {lastWorkout ? (
              <View style={[styles.card, {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 16,
                elevation: 10,
                position: 'relative',
                paddingVertical: 20,
                paddingRight: 140,
              }]}>
                {/* Destaque: Kilometragem ou Calorias em uma linha */}
                {lastWorkout.type === 'RUNNING' && lastWorkout.distanceKm != null ? (
                  <View style={{ position: 'absolute', top: '50%', right: 16, marginTop: -16, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={{ color: Colors.success, fontSize: 24, fontWeight: '800' }}>
                      {lastWorkout.distanceKm}
                    </Text>
                    <Text style={{ color: Colors.success, fontSize: 14, fontWeight: '700' }}>KM</Text>
                  </View>
                ) : lastWorkout.type === 'STRENGTH' && lastWorkout.caloriesBurned != null ? (
                  <View style={{ position: 'absolute', top: '50%', right: 16, marginTop: -16, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={{ color: Colors.xp, fontSize: 24, fontWeight: '800' }}>
                      {lastWorkout.caloriesBurned}
                    </Text>
                    <Text style={{ color: Colors.xp, fontSize: 14, fontWeight: '700' }}>KCAL</Text>
                  </View>
                ) : null}
                
                <View style={styles.workoutRow}>
                  <View style={[
                    styles.workoutIconBg,
                    { backgroundColor: lastWorkout.type === 'RUNNING'
                      ? Colors.success + '18' : Colors.cyber + '18' },
                  ]}>
                    <MaterialCommunityIcons
                      name={lastWorkout.type === 'RUNNING' ? 'run' : 'dumbbell'}
                      size={22}
                      color={lastWorkout.type === 'RUNNING' ? Colors.success : Colors.cyber}
                    />
                  </View>

                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={styles.workoutTitle} numberOfLines={1}>
                      {workoutTitle(lastWorkout)}
                    </Text>
                    <View style={styles.workoutMeta}>
                      <Text style={styles.workoutMetaText}>
                        {lastWorkout.durationMin} min
                      </Text>
                      {lastWorkout.type === 'RUNNING' && lastWorkout.distanceKm != null && (
                        <>
                          <Text style={styles.workoutMetaDot}>·</Text>
                          <Text style={styles.workoutMetaText}>
                            {lastWorkout.distanceKm} km
                          </Text>
                        </>
                      )}
                      <Text style={styles.workoutMetaDot}>·</Text>
                      <Text style={styles.workoutMetaText}>
                        {timeAgo(lastWorkout.dateTime)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ) : (
              <View style={[styles.card, styles.emptyCard]}>
                <MaterialCommunityIcons name="dumbbell" size={28} color={Colors.skeleton} />
                <Text style={styles.emptyTitle}>Nenhum treino registrado</Text>
                <Text style={styles.emptyDesc}>Seu primeiro treino aparece aqui.</Text>
              </View>
            )}
          </View>

          {/* ── Desafio Ativo ── */}
          {activeChallenge && (
            <View>
              <View style={styles.sectionHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="flash" size={14} color={Colors.xp} />
                  <Text style={styles.sectionTitle}>DESAFIO ATIVO</Text>
                </View>
                <Text style={styles.challengePercent}>
                  {activeChallenge.myParticipation?.progressPercent ?? 0}%
                </Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.challengeTitle}>{activeChallenge.title}</Text>
                <Text style={styles.challengeDesc} numberOfLines={2}>
                  {activeChallenge.description}
                </Text>

                {/* Progress bar amarela */}
                <View style={[styles.barTrack, { marginTop: 12 }]}>
                  <View
                    style={[
                      styles.barFill,
                      styles.barFillChallenge,
                      { width: `${Math.min(activeChallenge.myParticipation?.progressPercent ?? 0, 100)}%` },
                    ]}
                  />
                </View>

                <View style={styles.barLabels}>
                  <Text style={styles.barLabelLeft}>
                    {activeChallenge.myParticipation?.currentProgress ?? 0} / {activeChallenge.goalTarget}
                  </Text>
                  <Text style={[styles.barLabelRight, { color: Colors.xp }]}>
                    +{activeChallenge.rewardXp} XP
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* ── Card Guilda (se sem grupo) ── */}
          {myGroup === null && (
            <View style={[styles.card, styles.guildCard]}>
              <View style={styles.guildIconBg}>
                <Ionicons name="people" size={28} color={Colors.brand} />
              </View>
              <Text style={styles.guildTitle}>ENTRE EM UMA GUILDA</Text>
              <Text style={styles.guildDesc}>
                Conecte-se com outros atletas, suba no ranking e conquiste desafios em grupo.
              </Text>
              <TouchableOpacity
                style={styles.guildBtn}
                onPress={() => router.push('/(tabs)/groups')}
                activeOpacity={0.85}
              >
                <Ionicons name="search-outline" size={16} color={Colors.brand} />
                <Text style={styles.guildBtnText}>ACHAR GUILDA</Text>
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      )}

      {/* ── FAB ── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/workout/new')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={22} color={Colors.bg} />
        <Text style={styles.fabText}>REGISTRAR TREINO</Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: Colors.bg },
  scrollContent: {
    padding:       16,
    paddingBottom: 100,
    gap:           14,
  },

  // ── Card base ──
  card: {
    backgroundColor: Colors.card,
    borderRadius:    16,
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.06)',
    padding:         18,
  },

  // ── Labels de seção ──
  sectionLabel: {
    color:         Colors.subtle,
    fontSize:      9,
    fontWeight:    '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom:  10,
  },
  sectionHeaderRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   8,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    color:         Colors.white,
    fontSize:      10,
    fontWeight:    '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  sectionLink: {
    color:         Colors.cyber,
    fontSize:      10,
    fontWeight:    '700',
    letterSpacing: 1,
  },

  // ── XP ──
  xpRow: {
    flexDirection: 'row',
    alignItems:    'baseline',
    marginBottom:  2,
  },
  xpValue: {
    color:      Colors.white,
    fontSize:   32,
    fontWeight: '800',
  },
  xpSeparator: {
    color:    Colors.subtle,
    fontSize: 20,
  },
  xpTotal: {
    color:      Colors.subtle,
    fontSize:   18,
    fontWeight: '600',
  },
  xpLabel: {
    color:         Colors.subtle,
    fontSize:      9,
    fontWeight:    '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom:  12,
  },

  // ── Barras ──
  barTrack: {
    height:          12,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius:    99,
    overflow:        'hidden',
    marginVertical:  4,
  },
  barFill: {
    height:          12,
    borderRadius:    99,
    backgroundColor: Colors.success,
    shadowColor:     Colors.success,
    shadowOffset:    { width: 0, height: 0 },
    shadowOpacity:   0.5,
    shadowRadius:    8,
    elevation:       8,
  },
  barFillChallenge: {
    backgroundColor: Colors.xp,
  },
  barLabels: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    marginTop:      6,
  },
  barLabelLeft: {
    color:    Colors.faint,
    fontSize: 10,
  },
  barLabelRight: {
    color:    Colors.subtle,
    fontSize: 10,
  },

  // ── Stats ──
  statsRow: {
    flexDirection: 'row',
    gap:           12,
  },
  statCard: {
    flex:       1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  statIconBg: {
    width:           40,
    height:          40,
    borderRadius:    12,
    backgroundColor: Colors.streak + '20',
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    10,
  },
  statValue: {
    color:      Colors.white,
    fontSize:   28,
    fontWeight: '800',
    lineHeight: 32,
  },
  statUnit: {
    color:         Colors.subtle,
    fontSize:      9,
    fontWeight:    '700',
    letterSpacing: 2,
    marginTop:     2,
  },

  // ── Último treino ──
  workoutRow: {
    flexDirection: 'row',
    alignItems:    'center',
  },
  workoutIconBg: {
    width:          48,
    height:         48,
    borderRadius:   14,
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
  },
  workoutTitle: {
    color:      Colors.white,
    fontSize:   14,
    fontWeight: '600',
    marginBottom: 4,
  },
  workoutMeta: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
  },
  workoutMetaText: {
    color:    Colors.subtle,
    fontSize: 12,
  },
  workoutMetaDot: {
    color:    Colors.faint,
    fontSize: 12,
  },
  workoutTime: {
    color:    Colors.faint,
    fontSize: 11,
    marginLeft: 8,
    flexShrink: 0,
  },

  // ── Empty state ──
  emptyCard: {
    alignItems:   'center',
    paddingVertical: 28,
    gap:          8,
  },
  emptyTitle: {
    color:      Colors.muted,
    fontSize:   14,
    fontWeight: '600',
  },
  emptyDesc: {
    color:    Colors.subtle,
    fontSize: 12,
  },

  // ── Challenge ──
  challengePercent: {
    color:      Colors.xp,
    fontSize:   13,
    fontWeight: '700',
  },
  challengeTitle: {
    color:        Colors.white,
    fontSize:     15,
    fontWeight:   '700',
    marginBottom: 4,
  },
  challengeDesc: {
    color:    Colors.subtle,
    fontSize: 13,
    lineHeight: 18,
  },

  // ── Guild card ──
  guildCard: {
    alignItems: 'center',
    paddingVertical: 28,
    borderColor: Colors.brand + '30',
    gap: 10,
  },
  guildIconBg: {
    width:           60,
    height:          60,
    borderRadius:    18,
    backgroundColor: Colors.brand + '18',
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    4,
  },
  guildTitle: {
    color:         Colors.white,
    fontSize:      14,
    fontWeight:    '800',
    letterSpacing: 1.5,
  },
  guildDesc: {
    color:     Colors.subtle,
    fontSize:  13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  guildBtn: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               8,
    marginTop:         6,
    borderWidth:       1.5,
    borderColor:       Colors.brand + '60',
    borderRadius:      12,
    paddingHorizontal: 20,
    paddingVertical:   10,
    backgroundColor:   Colors.brand + '10',
  },
  guildBtnText: {
    color:         Colors.brand,
    fontSize:      12,
    fontWeight:    '700',
    letterSpacing: 2,
  },

  // ── FAB ──
  fab: {
    position:        'absolute',
    bottom:          24,
    left:            20,
    right:           20,
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             8,
    backgroundColor: Colors.success,
    borderRadius:    18,
    paddingVertical: 16,
    shadowColor:     Colors.success,
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.35,
    shadowRadius:    12,
    elevation:       8,
  },
  fabText: {
    color:         Colors.bg,
    fontSize:      14,
    fontWeight:    '800',
    letterSpacing: 3,
  },
});
