import { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Animated, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { groupsService } from '@/features/groups/services/groups.service';
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

function displayName(userId: string, myId: string): string {
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
    <Animated.View
      style={{ width: w as any, height: h, borderRadius: r, backgroundColor: Colors.skeleton, opacity }}
    />
  );
}

function DetailSkeleton() {
  return (
    <View style={{ gap: 14, padding: 16 }}>
      <View style={[styles.card, { gap: 14, alignItems: 'center' }]}>
        <Skel w={72} h={72} r={36} />
        <Skel w={180} h={16} />
        <Skel w={120} h={10} />
        <Skel w="100%" h={8} r={4} />
      </View>
      <View style={[styles.card, { gap: 12 }]}>
        <Skel w={140} h={10} />
        {[0, 1, 2].map((i) => <Skel key={i} w="100%" h={60} r={12} />)}
      </View>
    </View>
  );
}

// ─── Member row ───────────────────────────────────────────────────────────────

function MemberRow({ member, myId, index }: { member: GroupMember; myId: string; index: number }) {
  const isOwner  = member.role === GroupRole.OWNER;
  const isAdmin  = member.role === GroupRole.ADMIN;
  const isMe     = member.userId === myId;
  const name     = displayName(member.userId, myId);
  const role     = roleLabel(member.role);
  const score    = fmtScore(member.groupScore);

  const accentColor = isOwner ? Colors.xp : isAdmin ? Colors.cyber : Colors.subtle;

  return (
    <View style={[styles.memberRow, isOwner && styles.memberRowOwner]}>
      {/* Position / Avatar */}
      <View style={[styles.memberAvatar, { borderColor: accentColor + '50' }]}>
        {isOwner ? (
          <Ionicons name="shield-checkmark" size={18} color={Colors.xp} />
        ) : (
          <Text style={[styles.memberAvatarText, { color: accentColor }]}>
            {isMe ? 'V' : member.userId.slice(-1).toUpperCase()}
          </Text>
        )}
      </View>

      {/* Info */}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={[styles.memberName, isMe && { color: Colors.cyber }]} numberOfLines={1}>
            {name}
          </Text>
          {isOwner && (
            <View style={styles.leaderBadge}>
              <Text style={styles.leaderBadgeText}>LÍDER</Text>
            </View>
          )}
          {isAdmin && !isOwner && (
            <View style={[styles.leaderBadge, { backgroundColor: Colors.cyber + '18', borderColor: Colors.cyber + '40' }]}>
              <Text style={[styles.leaderBadgeText, { color: Colors.cyber }]}>ADMIN</Text>
            </View>
          )}
        </View>
        <Text style={styles.memberRole}>{role}</Text>
      </View>

      {/* Score */}
      <Text style={[styles.memberScore, isOwner && { color: Colors.xp }]}>
        {score} XP
      </Text>
    </View>
  );
}

// ─── Tela ─────────────────────────────────────────────────────────────────────

export default function GroupDetailScreen() {
  const router = useRouter();
  const user   = useAuthStore((s) => s.user);
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading,  setLoading]  = useState(true);
  const [group,    setGroup]    = useState<Group | null>(null);
  const [members,  setMembers]  = useState<GroupMember[]>([]);
  const [joining,  setJoining]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      setLoading(true);
      setError(null);

      Promise.allSettled([
        groupsService.getById(id),
        groupsService.getMembers(id),
      ]).then(([groupRes, membersRes]) => {
        if (groupRes.status   === 'fulfilled') setGroup(groupRes.value);
        if (membersRes.status === 'fulfilled') setMembers(membersRes.value);
        if (groupRes.status   === 'rejected')  setError('Não foi possível carregar a guilda.');
      }).finally(() => setLoading(false));
    }, [id]),
  );

  async function handleJoin() {
    if (!id || !user) return;
    setJoining(true);
    try {
      await groupsService.join(id);
      router.back();
    } catch {
      Alert.alert('Erro', 'Não foi possível entrar na guilda. Tente novamente.');
    } finally {
      setJoining(false);
    }
  }

  const owner   = members.find((m) => m.role === GroupRole.OWNER);
  // Ordena: OWNER primeiro, depois ADMIN, depois MEMBER — todos por score desc
  const sorted  = [...members].sort((a, b) => {
    const roleOrder = { [GroupRole.OWNER]: 0, [GroupRole.ADMIN]: 1, [GroupRole.MEMBER]: 2 };
    const rDiff = roleOrder[a.role] - roleOrder[b.role];
    return rDiff !== 0 ? rDiff : b.groupScore - a.groupScore;
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.cyber} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>DETALHES DA GUILDA</Text>
      </View>

      {loading ? (
        <DetailSkeleton />
      ) : error || !group ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={40} color={Colors.error} />
          <Text style={styles.errorText}>{error ?? 'Guilda não encontrada.'}</Text>
        </View>
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scroll}
          >
            {/* ── Info card ── */}
            <View style={[styles.card, { alignItems: 'center', gap: 10 }]}>
              <View style={styles.iconBg}>
                <Ionicons name="shield-checkmark" size={34} color={Colors.brand} />
              </View>

              <Text style={styles.groupName}>{group.name.toUpperCase()}</Text>
              <Text style={styles.groupDesc}>{group.description}</Text>

              {/* Meta pills */}
              <View style={styles.metaRow}>
                <View style={styles.metaPill}>
                  <Ionicons name="people" size={13} color={Colors.subtle} />
                  <Text style={styles.metaPillText}>{members.length} membros</Text>
                </View>
                {group.groupLevel != null && (
                  <View style={[styles.metaPill, { borderColor: Colors.xp + '40' }]}>
                    <Ionicons name="trophy" size={13} color={Colors.xp} />
                    <Text style={[styles.metaPillText, { color: Colors.xp }]}>LVL {group.groupLevel}</Text>
                  </View>
                )}
                {group.groupXp != null && (
                  <View style={[styles.metaPill, { borderColor: Colors.cyber + '40' }]}>
                    <Ionicons name="flash" size={13} color={Colors.cyber} />
                    <Text style={[styles.metaPillText, { color: Colors.cyber }]}>{fmtXp(group.groupXp)} XP</Text>
                  </View>
                )}
              </View>

              {/* XP bar */}
              {group.progressPercent != null && (
                <View style={{ width: '100%', gap: 6 }}>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${Math.min(group.progressPercent, 100)}%` }]} />
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.barLabel}>{fmtXp(group.groupXp ?? 0)} XP</Text>
                    <Text style={styles.barLabel}>{fmtXp(group.nextLevelXpRequired ?? 0)} XP</Text>
                  </View>
                </View>
              )}

              {/* Weekly goal */}
              {/* {!!group.weeklyGoal && (
                <View style={styles.goalRow}>
                  <Ionicons name="flag" size={13} color={Colors.success} />
                  <Text style={styles.goalText}>Objetivo: {group.weeklyGoal}</Text>
                </View>
              )} */}
            </View>

            {/* ── Members ── */}
            <View>
              <Text style={styles.sectionTitle}>
                MEMBROS · {members.length}
              </Text>
              <View style={styles.card}>
                {sorted.map((m, i) => (
                  <MemberRow
                    key={m.id ?? String(i)}
                    member={m}
                    myId={user?.id ?? ''}
                    index={i}
                  />
                ))}
              </View>
            </View>

          </ScrollView>

          {/* ── Join button (fixo no rodapé) ── */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.joinBtn, joining && { opacity: 0.6 }]}
              onPress={handleJoin}
              disabled={joining}
              activeOpacity={0.85}
            >
              {joining ? (
                <ActivityIndicator color={Colors.bg} />
              ) : (
                <>
                  <Ionicons name="enter-outline" size={20} color={Colors.bg} />
                  <Text style={styles.joinBtnText}>ENTRAR NA GUILDA</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 16, gap: 14, paddingBottom: 100 },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 12,
  },
  backBtn:     { padding: 4 },
  headerTitle: { color: Colors.white, fontSize: 13, fontWeight: '700', letterSpacing: 2 },

  card: {
    backgroundColor: Colors.card, borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', padding: 18,
  },

  iconBg: {
    width: 72, height: 72, borderRadius: 24,
    backgroundColor: Colors.brand + '15',
    borderWidth: 1.5, borderColor: Colors.brand + '40',
    alignItems: 'center', justifyContent: 'center',
  },

  groupName: {
    color: Colors.white, fontSize: 20, fontWeight: '800',
    letterSpacing: 1.5, textAlign: 'center',
  },
  groupDesc: {
    color: Colors.subtle, fontSize: 13, textAlign: 'center',
    lineHeight: 18, paddingHorizontal: 4,
  },

  metaRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  metaPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  metaPillText: { color: Colors.subtle, fontSize: 12, fontWeight: '600' },

  barTrack: { height: 6, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' },
  barFill:  { height: 6, borderRadius: 99, backgroundColor: Colors.brand },
  barLabel: { color: Colors.faint, fontSize: 10 },

  goalRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  goalText: { color: Colors.success, fontSize: 12, fontWeight: '600' },

  sectionTitle: {
    color: Colors.white, fontSize: 10, fontWeight: '700',
    letterSpacing: 2, marginBottom: 8, paddingHorizontal: 2,
  },

  // ── Member row ──
  memberRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, paddingHorizontal: 4,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  memberRowOwner: {
    backgroundColor: Colors.xp + '06',
    borderRadius: 12, paddingHorizontal: 10, marginHorizontal: -4,
    borderBottomWidth: 0, marginBottom: 4,
  },
  memberAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.input,
    borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  memberAvatarText: { fontSize: 15, fontWeight: '700' },
  memberName:  { color: Colors.white,  fontSize: 13, fontWeight: '700' },
  memberRole:  { color: Colors.subtle, fontSize: 10, marginTop: 2 },
  memberScore: { color: Colors.muted,  fontSize: 12, fontWeight: '600' },

  leaderBadge: {
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 6, borderWidth: 1,
    backgroundColor: Colors.xp + '18', borderColor: Colors.xp + '50',
  },
  leaderBadgeText: { color: Colors.xp, fontSize: 8, fontWeight: '800', letterSpacing: 1 },

  // ── Footer ──
  footer: {
    padding: 16, paddingBottom: 28,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
    backgroundColor: Colors.bg,
  },
  joinBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: Colors.brand, borderRadius: 16, paddingVertical: 16,
    shadowColor: Colors.brand, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
  },
  joinBtnText: { color: Colors.white, fontSize: 15, fontWeight: '900', letterSpacing: 3 },

  // ── States ──
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  errorText: { color: Colors.error, fontSize: 13, textAlign: 'center' },
});
