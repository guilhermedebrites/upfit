import { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { groupsService } from '@/features/groups/services/groups.service';
import { Colors } from '@/theme/colors';
import type { GroupFeedItem } from '@/features/groups/types/groups.types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS_PT = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];

function formatTime(iso: string): string {
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}H`;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) =>
    a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
  if (sameDay(date, today))     return 'HOJE';
  if (sameDay(date, yesterday)) return 'ONTEM';
  return `${date.getDate()} ${MONTHS_PT[date.getMonth()]}`;
}

function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}:00`;
  return `${h}:${String(m).padStart(2, '0')}`;
}

function memberTag(userId: string, myId: string): string {
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

function FeedSkeleton() {
  return (
    <View style={{ gap: 16, padding: 16 }}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={[styles.card, { gap: 14 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Skel w={44} h={44} r={22} />
            <View style={{ gap: 6 }}>
              <Skel w={120} h={12} />
              <Skel w={80} h={9} />
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Skel w="48%" h={56} r={12} />
            <Skel w="48%" h={56} r={12} />
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── Stat box ─────────────────────────────────────────────────────────────────

function StatBox({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 3 }}>
        <Text style={styles.statValue}>{value}</Text>
        {unit && <Text style={styles.statUnit}>{unit}</Text>}
      </View>
    </View>
  );
}

// ─── Feed card ────────────────────────────────────────────────────────────────

function FeedCard({ item, myId }: { item: GroupFeedItem; myId: string }) {
  const isRunning = item.type === 'RUNNING';
  const typeColor = isRunning ? Colors.cyber : Colors.success;
  const typeLabel = isRunning ? 'CARDIO' : 'HIPERTROFIA';
  const typeIcon  = isRunning ? 'run' : 'dumbbell';
  const name      = memberTag(item.userId, myId);
  const dateStr   = formatDate(item.recordedAt);
  const timeStr   = formatTime(item.recordedAt);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        {/* Avatar circle */}
        <View style={[styles.avatar, { borderColor: typeColor + '60' }]}>
          <Text style={[styles.avatarText, { color: typeColor }]}>
            {item.userId === myId ? 'V' : item.userId.slice(-1).toUpperCase()}
          </Text>
        </View>

        {/* Name + meta */}
        <View style={{ flex: 1 }}>
          <Text style={styles.memberName} numberOfLines={1}>{name}</Text>
          <Text style={styles.memberMeta}>
            {item.type} • {dateStr} • {timeStr}
          </Text>
        </View>

        {/* Type badge */}
        <View style={[styles.typeBadge, { backgroundColor: typeColor + '15', borderColor: typeColor + '40' }]}>
          <MaterialCommunityIcons name={typeIcon as any} size={12} color={typeColor} />
          <Text style={[styles.typeBadgeText, { color: typeColor }]}>{typeLabel}</Text>
        </View>
      </View>

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        {isRunning ? (
          <>
            {item.distanceKm != null && (
              <StatBox label="DISTÂNCIA" value={String(item.distanceKm)} unit="km" />
            )}
            <StatBox label="DURAÇÃO" value={formatDuration(item.durationMin)} unit="min" />
            {item.averagePace != null && (
              <StatBox label="PACE" value={String(item.averagePace)} unit="/km" />
            )}
            <StatBox label="CALORIAS" value={String(Math.round(item.caloriesBurned))} unit="kcal" />
          </>
        ) : (
          <>
            <StatBox label="DURAÇÃO"  value={formatDuration(item.durationMin)} unit="min" />
            <StatBox label="CALORIAS" value={String(Math.round(item.caloriesBurned))} unit="kcal" />
            {item.primaryMuscle && (
              <View style={[styles.statBox, { gridColumn: '1 / -1' as any }]}>
                <Text style={styles.statLabel}>MÚSCULO PRIMÁRIO</Text>
                <Text style={styles.statValue}>{item.primaryMuscle}</Text>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
}

// ─── Tela ─────────────────────────────────────────────────────────────────────

export default function GroupFeedScreen() {
  const router = useRouter();
  const user   = useAuthStore((s) => s.user);
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [feed,    setFeed]    = useState<GroupFeedItem[]>([]);
  const [error,   setError]   = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      setLoading(true);
      setError(null);
      groupsService.getFeed(id)
        .then(setFeed)
        .catch(() => setError('Não foi possível carregar o feed.'))
        .finally(() => setLoading(false));
    }, [id]),
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.cyber} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Feed da Guilda</Text>
          <View style={styles.headerLine} />
        </View>
      </View>

      {loading ? (
        <FeedSkeleton />
      ) : error ? (
        <View style={styles.centerMsg}>
          <Ionicons name="alert-circle-outline" size={40} color={Colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : feed.length === 0 ? (
        <View style={styles.centerMsg}>
          <MaterialCommunityIcons name="dumbbell" size={40} color={Colors.skeleton} />
          <Text style={styles.emptyTitle}>Feed vazio</Text>
          <Text style={styles.emptyText}>Os treinos dos membros aparecerão aqui.</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {feed.map((item) => (
            <FeedCard key={item.id} item={item} myId={user?.id ?? ''} />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: Colors.bg },
  scrollContent: { padding: 16, gap: 16 },

  // ── Header ──
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { color: Colors.white, fontSize: 22, fontWeight: '700' },
  headerLine: {
    height: 3, width: 40, borderRadius: 2,
    backgroundColor: Colors.cyber, marginTop: 4,
  },

  // ── Card ──
  card: {
    backgroundColor: Colors.card, borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    padding: 16, gap: 14,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },

  // ── Avatar ──
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.input,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700' },

  // ── Member info ──
  memberName: { color: Colors.white,  fontSize: 14, fontWeight: '700' },
  memberMeta: { color: Colors.subtle, fontSize: 11, marginTop: 2 },

  // ── Type badge ──
  typeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1,
  },
  typeBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },

  // ── Stats grid ──
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statBox: {
    flex: 1, minWidth: '45%',
    backgroundColor: Colors.input, borderRadius: 12,
    padding: 12, gap: 4,
  },
  statLabel: { color: Colors.subtle, fontSize: 9, fontWeight: '700', letterSpacing: 1.5 },
  statValue: { color: Colors.white,  fontSize: 20, fontWeight: '800' },
  statUnit:  { color: Colors.muted,  fontSize: 12, fontWeight: '500', marginBottom: 2 },

  // ── States ──
  centerMsg:  { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  errorText:  { color: Colors.error,  fontSize: 13, textAlign: 'center' },
  emptyTitle: { color: Colors.muted,  fontSize: 15, fontWeight: '600' },
  emptyText:  { color: Colors.subtle, fontSize: 13 },
});
