import { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Animated, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { groupsService } from '@/features/groups/services/groups.service';
import { useProgressionStore } from '@/features/progression/store/progression.store';
import { AppHeader } from '@/components/AppHeader';
import { Colors } from '@/theme/colors';
import { GroupRole } from '@/shared/types/enums';
import type { Group, GroupMember } from '@/features/groups/types/groups.types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtXp(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}k`;
  return String(n);
}

function fmtScore(n: number): string {
  return n.toLocaleString('pt-BR');
}

function roleLabel(role: GroupRole): string {
  if (role === GroupRole.OWNER) return 'FUNDADOR';
  if (role === GroupRole.ADMIN) return 'ADMINISTRADOR';
  return 'MEMBRO';
}

function memberName(userId: string, myId: string): string {
  if (userId === myId) return 'VOCÊ';
  return `GUERREIRO #${userId.slice(-4).toUpperCase()}`;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function usePulse() {
  const opacity = useRef(new Animated.Value(0.25)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.55, duration: 750, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.25, duration: 750, useNativeDriver: true }),
      ]),
    ).start();
  }, []);
  return opacity;
}

function Skel({ w, h, r = 10 }: { w: number | string; h: number; r?: number }) {
  const opacity = usePulse();
  return (
    <Animated.View style={{ width: w as any, height: h, borderRadius: r, backgroundColor: Colors.skeleton, opacity }} />
  );
}

function GroupSkeleton() {
  return (
    <View style={{ gap: 14, padding: 16 }}>
      <View style={[styles.card, { gap: 14, alignItems: 'center' }]}>
        <Skel w={80} h={80} r={40} />
        <Skel w={160} h={14} />
        <Skel w={120} h={10} />
      </View>
      <View style={[styles.card, { gap: 12 }]}>
        <Skel w={120} h={10} />
        <Skel w="100%" h={8} r={4} />
      </View>
      <View style={[styles.card, { gap: 10 }]}>
        <Skel w={140} h={10} />
        {[0, 1, 2].map((i) => <Skel key={i} w="100%" h={56} r={12} />)}
      </View>
    </View>
  );
}

// ─── My Group — Hero ──────────────────────────────────────────────────────────

function GroupHero({ group, memberCount }: { group: Group; memberCount?: number }) {
  const count = memberCount ?? group.memberCount;

  return (
    <View style={[styles.card, { alignItems: 'center', gap: 10 }]}>
      {/* Shield icon */}
      <View style={styles.shieldBg}>
        <Ionicons name="shield-checkmark" size={38} color={Colors.cyber} />
      </View>

      <Text style={styles.heroLabel}>SUA GUILDA</Text>
      <Text style={styles.heroName}>{group.name.toUpperCase()}</Text>

      {/* Meta row */}
      <View style={styles.heroMeta}>
        {count != null && (
          <View style={styles.heroMetaItem}>
            <Ionicons name="people" size={14} color={Colors.subtle} />
            <Text style={styles.heroMetaText}>{count} Membros</Text>
          </View>
        )}
        {group.groupLevel != null && (
          <View style={[styles.heroMetaItem, count != null && styles.heroMetaDivider]}>
            <Ionicons name="trophy" size={14} color={Colors.xp} />
            <Text style={[styles.heroMetaText, { color: Colors.xp }]}>
              LVL {group.groupLevel}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── My Group — Level / XP ────────────────────────────────────────────────────

function LevelXpCard({ group }: { group: Group }) {
  const level      = group.groupLevel   ?? 0;
  const xp         = group.groupXp      ?? 0;
  const nextXp     = group.nextLevelXpRequired    ?? 0;
  const currentXp  = group.currentLevelXpRequired ?? 0;
  const percent    = group.progressPercent ?? 0;

  return (
    <View style={styles.levelCard}>
      {/* Header row */}
      <View style={styles.levelHeader}>
        <View>
          <Text style={styles.levelLabel}>NÍVEL DA GUILDA</Text>
          <Text style={styles.levelSub}>Progresso acumulado de XP</Text>
        </View>
        <Text style={styles.levelValue}>LVL {level}</Text>
      </View>

      {/* XP labels */}
      <View style={styles.xpRow}>
        <Text style={styles.xpLeft}>{fmtXp(xp)} XP</Text>
        <Text style={styles.xpRight}>{fmtXp(nextXp)} XP para o LVL {level + 1}</Text>
      </View>

      {/* Bar */}
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${Math.min(percent, 100)}%` }]} />
      </View>

      {/* Bottom labels */}
      <View style={styles.xpRow}>
        <Text style={styles.xpBot}>{fmtXp(currentXp)} XP</Text>
        <Text style={styles.xpBot}>{fmtXp(nextXp)} XP</Text>
      </View>
    </View>
  );
}

// ─── My Group — Weekly Goal ───────────────────────────────────────────────────

function WeeklyGoalCard({ goal }: { goal: string }) {
  return (
    <View style={styles.goalCard}>
      <View style={styles.goalHeader}>
        <Ionicons name="flash" size={16} color={Colors.xp} />
        <Text style={styles.goalTitle}>OBJETIVO SEMANAL</Text>
      </View>
      <Text style={styles.goalText}>{goal}</Text>
    </View>
  );
}

// ─── My Group — Ranking ───────────────────────────────────────────────────────

function RankRow({
  position, member, myId, isFirst,
}: {
  position: number; member: GroupMember; myId: string; isFirst: boolean;
}) {
  const isMe      = member.userId === myId;
  const posStr    = String(position).padStart(2, '0');
  const name      = memberName(member.userId, myId);
  const role      = roleLabel(member.role);
  const score     = fmtScore(member.groupScore);

  return (
    <View style={[styles.rankRow, isFirst && styles.rankRowFirst, isMe && styles.rankRowMe]}>
      {/* Position */}
      <Text style={[styles.rankPos, isFirst && { color: Colors.success }]}>{posStr}</Text>

      {/* Avatar circle */}
      <View style={[styles.rankAvatar, isFirst && styles.rankAvatarFirst]}>
        <Text style={[styles.rankAvatarText, isFirst && { color: Colors.success }]}>
          {isMe ? 'V' : member.userId.slice(-1).toUpperCase()}
        </Text>
      </View>

      {/* Name + role */}
      <View style={{ flex: 1 }}>
        <Text style={[styles.rankName, isMe && { color: Colors.cyber }]} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.rankRole}>{role}</Text>
      </View>

      {/* Score */}
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[styles.rankScore, isFirst && { color: Colors.success }]}>
          {score} XP
        </Text>
        {member.role === GroupRole.OWNER && (
          <Text style={styles.rankBadge}>LÍDER</Text>
        )}
      </View>
    </View>
  );
}

function RankingSection({ ranking, myId }: { ranking: GroupMember[]; myId: string }) {
  const top = ranking.slice(0, 5);

  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>RANKING DA GUILDA</Text>
        <Text style={styles.sectionSub}>ESTA SEMANA</Text>
      </View>
      <View style={styles.card}>
        {top.map((m, i) => (
          <RankRow key={m.id ?? String(i)} position={i + 1} member={m} myId={myId} isFirst={i === 0} />
        ))}
        {top.length === 0 && (
          <Text style={styles.emptyText}>Sem membros ainda.</Text>
        )}
      </View>
    </View>
  );
}

// ─── My Group View ─────────────────────────────────────────────────────────────

function MyGroupView({
  group, ranking, myId,
  onFeed, onLeave,
}: {
  group: Group;
  ranking: GroupMember[];
  myId: string;
  onFeed: () => void;
  onLeave: () => void;
}) {
  const myMember  = ranking.find((m) => m.userId === myId);
  const isOwner   = myMember?.role === GroupRole.OWNER;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <GroupHero group={group} memberCount={ranking.length || undefined} />
      <LevelXpCard group={group} />
      {/* {!!group.weeklyGoal && <WeeklyGoalCard goal={group.weeklyGoal} />} */}
      <RankingSection ranking={ranking} myId={myId} />

      {/* Actions */}
      <TouchableOpacity style={styles.feedBtn} onPress={onFeed} activeOpacity={0.85}>
        <Ionicons name="newspaper-outline" size={18} color={Colors.cyber} />
        <Text style={styles.feedBtnText}>VER FEED DA GUILDA</Text>
      </TouchableOpacity>

      {!isOwner && (
        <TouchableOpacity style={styles.leaveBtn} onPress={onLeave} activeOpacity={0.85}>
          <Ionicons name="exit-outline" size={18} color={Colors.streak} />
          <Text style={styles.leaveBtnText}>SAIR DA GUILDA</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

// ─── Explore — Group Card ─────────────────────────────────────────────────────

function ExploreGroupCard({ group, onPress }: { group: Group; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.exploreCard} onPress={onPress} activeOpacity={0.8}>
      {/* Icon */}
      <View style={styles.exploreIconBg}>
        <Ionicons name="shield-checkmark" size={28} color={Colors.brand} />
      </View>

      {/* Info */}
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={styles.exploreName} numberOfLines={1}>
          {group.name.toUpperCase()}
        </Text>
        <Text style={styles.exploreDesc} numberOfLines={2}>
          {group.description}
        </Text>
        <View style={styles.exploreMeta}>
          {group.groupLevel != null && (
            <Text style={styles.exploreMetaText}>LVL {group.groupLevel}</Text>
          )}
        </View>
      </View>

      {/* Chevron */}
      <Ionicons name="chevron-forward" size={18} color={Colors.faint} />
    </TouchableOpacity>
  );
}

// ─── Explore View ─────────────────────────────────────────────────────────────

function ExploreView({
  groups, onSelectGroup, onCreate,
}: {
  groups: Group[];
  onSelectGroup: (id: string) => void;
  onCreate: () => void;
}) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
    >
      {/* Header */}
      <View style={styles.exploreHeaderCard}>
        <View style={styles.exploreHeaderIcon}>
          <Ionicons name="people" size={32} color={Colors.brand} />
        </View>
        <Text style={styles.exploreHeaderTitle}>ESCOLHA SUA GUILDA</Text>
        <Text style={styles.exploreHeaderSub}>
          Conheça a guilda, veja os membros e entre quando estiver pronto.
        </Text>
      </View>

      {/* List */}
      {groups.length > 0 ? (
        <View style={{ gap: 10 }}>
          {groups.map((g) => (
            <ExploreGroupCard
              key={g.id}
              group={g}
              onPress={() => onSelectGroup(g.id)}
            />
          ))}
        </View>
      ) : (
        <View style={[styles.card, { alignItems: 'center', paddingVertical: 32, gap: 8 }]}>
          <Ionicons name="people-outline" size={36} color={Colors.skeleton} />
          <Text style={styles.emptyTitle}>Nenhuma guilda encontrada</Text>
          <Text style={styles.emptyText}>Seja o primeiro a fundar uma!</Text>
        </View>
      )}
    </ScrollView>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function GroupsScreen() {
  const router       = useRouter();
  const user         = useAuthStore((s) => s.user);
  const progression  = useProgressionStore((s) => s.progression);
  const fetchProgression = useProgressionStore((s) => s.fetch);

  const [loading,   setLoading]   = useState(true);
  const [myGroup,   setMyGroup]   = useState<Group | null | undefined>(undefined);
  const [detail,    setDetail]    = useState<Group | null>(null);
  const [ranking,   setRanking]   = useState<GroupMember[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!user?.id) return;
      load();
      // Busca progressão para o header (usa cache se já existir)
      if (!progression) fetchProgression(user.id);
    }, [user?.id]),
  );

  async function load() {
    setLoading(true);
    try {
      const mine  = await groupsService.listMine();
      const group = mine[0] ?? null;
      setMyGroup(group);

      if (group) {
        const [detailRes, rankingRes] = await Promise.allSettled([
          groupsService.getById(group.id),
          groupsService.getRanking(group.id),
        ]);
        if (detailRes.status  === 'fulfilled') setDetail(detailRes.value);
        if (rankingRes.status === 'fulfilled') setRanking(rankingRes.value);
      } else {
        const all = await groupsService.list();
        setAllGroups(all);
      }
    } catch {
      setMyGroup(null);
    } finally {
      setLoading(false);
    }
  }

  function handleLeave() {
    if (!myGroup) return;
    Alert.alert(
      'SAIR DA GUILDA',
      `Tem certeza que deseja sair de "${myGroup.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'SAIR', style: 'destructive',
          onPress: async () => {
            try {
              await groupsService.leave(myGroup.id);
              setMyGroup(null);
              setDetail(null);
              setRanking([]);
              const all = await groupsService.list();
              setAllGroups(all);
            } catch {
              Alert.alert('Erro', 'Não foi possível sair da guilda.');
            }
          },
        },
      ],
    );
  }

  const nameInitial = (user?.name ?? user?.email ?? '?').charAt(0).toUpperCase();

  // Aguarda user estar disponível (pode ser null no frame do logout)
  if (!user) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader
        initial={nameInitial}
        level={progression?.level ?? null}
        streak={progression?.streakDays ?? null}
      />

      {loading ? (
        <GroupSkeleton />
      ) : myGroup ? (
        <MyGroupView
          group={detail ?? myGroup}
          ranking={ranking}
          myId={user.id}
          onFeed={() => router.push(`/groups/${myGroup.id}/feed` as any)}
          onLeave={handleLeave}
        />
      ) : (
        <>
          <ExploreView
            groups={allGroups}
            onSelectGroup={(id) => router.push(`/groups/${id}` as any)}
            onCreate={() => router.push('/groups/new' as any)}
          />
          {/* FAB */}
          <TouchableOpacity
            style={styles.fab}
            onPress={() => router.push('/groups/new' as any)}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={20} color={Colors.bg} />
            <Text style={styles.fabText}>FUNDAR GUILDA</Text>
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: Colors.bg },
  scrollContent: { padding: 16, gap: 14 },

  card: {
    backgroundColor: Colors.card,
    borderRadius:    16,
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.06)',
    padding:         18,
  },

  // ── Hero ──
  shieldBg: {
    width:           80, height: 80, borderRadius: 40,
    backgroundColor: Colors.cyber + '15',
    borderWidth:     2,  borderColor: Colors.cyber + '40',
    alignItems: 'center', justifyContent: 'center',
  },
  heroLabel: {
    color: Colors.subtle, fontSize: 10, fontWeight: '700',
    letterSpacing: 2, textTransform: 'uppercase',
  },
  heroName: {
    color: Colors.white, fontSize: 22, fontWeight: '800',
    letterSpacing: 1.5, textAlign: 'center',
  },
  heroMeta: { flexDirection: 'row', gap: 16, marginTop: 4 },
  heroMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  heroMetaDivider: {
    paddingLeft: 16,
    borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.08)',
  },
  heroMetaText: { color: Colors.subtle, fontSize: 12, fontWeight: '500' },

  // ── Level card ──
  levelCard: {
    backgroundColor: Colors.card,
    borderRadius:    16,
    borderTopWidth:    1, borderRightWidth:  1, borderBottomWidth: 1,
    borderLeftWidth:   4,
    borderColor:       'rgba(255,255,255,0.06)',
    borderLeftColor:   Colors.success,
    padding: 18,
  },
  levelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  levelLabel:  { color: Colors.cyber,  fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  levelSub:    { color: Colors.subtle, fontSize: 10, marginTop: 2 },
  levelValue:  { color: Colors.success, fontSize: 26, fontWeight: '800', letterSpacing: 1 },
  xpRow:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  xpLeft:      { color: Colors.white,  fontSize: 13, fontWeight: '700' },
  xpRight:     { color: Colors.subtle, fontSize: 11 },
  xpBot:       { color: Colors.faint,  fontSize: 10 },
  barTrack:    { height: 8, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden', marginBottom: 6 },
  barFill:     { height: 8, borderRadius: 99, backgroundColor: Colors.success },

  // ── Weekly goal ──
  goalCard: {
    backgroundColor: Colors.card, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.xp + '30', padding: 18,
  },
  goalHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  goalTitle:  { color: Colors.xp, fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  goalText:   { color: Colors.white, fontSize: 14, fontWeight: '600' },

  // ── Section header ──
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 8, paddingHorizontal: 2,
  },
  sectionTitle: { color: Colors.white, fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  sectionSub:   { color: Colors.subtle, fontSize: 9, fontWeight: '600', letterSpacing: 1 },

  // ── Ranking rows ──
  rankRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, paddingHorizontal: 2,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  rankRowFirst: { borderLeftWidth: 3, borderLeftColor: Colors.success, paddingLeft: 10, marginLeft: -2 },
  rankRowMe:    { backgroundColor: Colors.cyber + '08', borderRadius: 10, paddingHorizontal: 10, marginHorizontal: -2 },
  rankPos:      { color: Colors.subtle, fontSize: 13, fontWeight: '800', width: 24, textAlign: 'center' },
  rankAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.skeleton + '80',
    alignItems: 'center', justifyContent: 'center',
  },
  rankAvatarFirst: { backgroundColor: Colors.success + '20', borderWidth: 1.5, borderColor: Colors.success + '60' },
  rankAvatarText:  { color: Colors.muted, fontSize: 13, fontWeight: '700' },
  rankName:  { color: Colors.white,  fontSize: 12, fontWeight: '700' },
  rankRole:  { color: Colors.subtle, fontSize: 10, marginTop: 1 },
  rankScore: { color: Colors.white,  fontSize: 13, fontWeight: '700' },
  rankBadge: { color: Colors.xp,     fontSize: 9,  fontWeight: '700', letterSpacing: 1, marginTop: 2 },

  // ── Empty ──
  emptyTitle: { color: Colors.muted,   fontSize: 14, fontWeight: '600' },
  emptyText:  { color: Colors.subtle,  fontSize: 12, textAlign: 'center' },

  // ── Action buttons ──
  feedBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderColor: Colors.cyber + '50', borderRadius: 14,
    paddingVertical: 14, backgroundColor: Colors.cyber + '08',
  },
  feedBtnText: { color: Colors.cyber, fontSize: 13, fontWeight: '700', letterSpacing: 2 },

  leaveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1, borderColor: Colors.streak + '40', borderRadius: 14,
    paddingVertical: 14,
  },
  leaveBtnText: { color: Colors.streak, fontSize: 13, fontWeight: '700', letterSpacing: 2 },

  // ── Explore ──
  exploreHeaderCard: {
    backgroundColor: Colors.brand + '12',
    borderRadius: 16, borderWidth: 1, borderColor: Colors.brand + '30',
    padding: 24, alignItems: 'center', gap: 10,
  },
  exploreHeaderIcon: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: Colors.brand + '18', alignItems: 'center', justifyContent: 'center',
  },
  exploreHeaderTitle: { color: Colors.white, fontSize: 17, fontWeight: '800', letterSpacing: 2 },
  exploreHeaderSub:   { color: Colors.subtle, fontSize: 13, textAlign: 'center', lineHeight: 18 },

  exploreCard: {
    backgroundColor: Colors.card, borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  exploreIconBg: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: Colors.brand + '15',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  exploreName: { color: Colors.white, fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
  exploreDesc: { color: Colors.subtle, fontSize: 12, lineHeight: 16 },
  exploreMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  exploreMetaText: { color: Colors.faint, fontSize: 11 },
  exploreMetaDot:  { color: Colors.faint, fontSize: 11 },

  joinBtn: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 10, borderWidth: 1.5, borderColor: Colors.cyber + '60',
    backgroundColor: Colors.cyber + '10', minWidth: 70, alignItems: 'center',
  },
  joinBtnText: { color: Colors.cyber, fontSize: 11, fontWeight: '700', letterSpacing: 1 },

  // ── FAB ──
  fab: {
    position: 'absolute', bottom: 24, left: 20, right: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.brand, borderRadius: 18, paddingVertical: 16,
    shadowColor: Colors.brand, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
  },
  fabText: { color: Colors.white, fontSize: 14, fontWeight: '800', letterSpacing: 3 },
});
