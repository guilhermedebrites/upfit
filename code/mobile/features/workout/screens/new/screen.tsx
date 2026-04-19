import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/theme/colors';
import type { WorkoutType } from '@/features/workout/types/workout.types';

// ─── Barra de progresso ────────────────────────────────────────────────────────

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <View style={styles.progressRow}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[styles.progressSegment, i < step && styles.progressSegmentActive]}
        />
      ))}
    </View>
  );
}

// ─── Constantes ───────────────────────────────────────────────────────────────

interface DisciplineCard {
  type:     WorkoutType;
  label:    string;
  desc:     string;
  icon:     string;
  color:    string;
}

const CARDS: DisciplineCard[] = [
  {
    type:  'STRENGTH',
    label: 'MUSCULAÇÃO',
    desc:  'Foco em hipertrofia, força bruta e resistência muscular localizada.',
    icon:  'dumbbell',
    color: Colors.cyber,
  },
  {
    type:  'RUNNING',
    label: 'CORRIDA',
    desc:  'Otimização cardiovascular, queima calórica e resistência aeróbica.',
    icon:  'run',
    color: Colors.success,
  },
];

// ─── Tela ─────────────────────────────────────────────────────────────────────

export default function NewWorkoutScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<WorkoutType | null>(null);

  function handleSelect(type: WorkoutType) {
    setSelected(type);
    setTimeout(() => {
      router.push(`/workout/new/${type.toLowerCase()}`);
    }, 110);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      <ProgressBar step={1} total={2} />

      <View style={styles.content}>

        {/* ── Cabeçalho ── */}
        <Text style={styles.label}>REGISTRO DE TREINO</Text>
        <Text style={styles.title}>PASSO 01</Text>
        <Text style={styles.subtitle}>ESCOLHA SUA DISCIPLINA</Text>
        <Text style={styles.desc}>
          Selecione a modalidade do treino para configurar seus parâmetros de performance.
        </Text>

        {/* ── Cards de seleção ── */}
        <View style={styles.cardList}>
          {CARDS.map((card) => {
            const active = selected === card.type;
            return (
              <TouchableOpacity
                key={card.type}
                style={[
                  styles.card,
                  active && { borderColor: card.color, backgroundColor: card.color + '14' },
                ]}
                onPress={() => handleSelect(card.type)}
                activeOpacity={0.8}
              >
                {/* Ícone decorativo de fundo */}
                <View style={styles.decoIconWrapper} pointerEvents="none">
                  <MaterialCommunityIcons
                    name={card.icon as any}
                    size={88}
                    color={card.color}
                    style={{ opacity: 0.07 }}
                  />
                </View>

                {/* Ícone principal */}
                <View style={[styles.iconBg, { backgroundColor: card.color + '18' }]}>
                  <MaterialCommunityIcons name={card.icon as any} size={30} color={card.color} />
                </View>

                {/* Texto */}
                <View style={styles.cardText}>
                  <Text style={styles.cardLabel}>{card.label}</Text>
                  <Text style={styles.cardDesc}>{card.desc}</Text>
                </View>

                {/* Badge de seleção */}
                {active && (
                  <View style={[styles.checkBadge, { backgroundColor: card.color }]}>
                    <Ionicons name="checkmark" size={13} color="#000" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

      </View>

      {/* ── Rodapé bloqueado ── */}
      <View style={styles.footer}>
        <Ionicons name="lock-closed" size={14} color={Colors.faint} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.footerTitle}>PASSO 02: CONFIGURAÇÃO</Text>
          <Text style={styles.footerSub}>Aguardando seleção de disciplina...</Text>
        </View>
        <Ionicons name="arrow-forward" size={16} color={Colors.skeleton} />
      </View>

    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex:            1,
    backgroundColor: Colors.bg,
  },
  progressRow: {
    flexDirection:   'row',
    gap:             6,
    paddingHorizontal: 20,
    paddingTop:      14,
    paddingBottom:   2,
  },
  progressSegment: {
    flex:         1,
    height:       3,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  progressSegmentActive: {
    backgroundColor: Colors.cyber,
  },
  content: {
    flex:    1,
    paddingHorizontal: 20,
    paddingTop:        24,
    paddingBottom:     8,
  },
  label: {
    color:          Colors.cyber,
    fontSize:       10,
    fontWeight:     '700',
    letterSpacing:  3,
    textTransform:  'uppercase',
    marginBottom:   6,
  },
  title: {
    color:         Colors.white,
    fontSize:      28,
    fontWeight:    '800',
    letterSpacing: 1,
  },
  subtitle: {
    color:         'rgba(255,255,255,0.85)',
    fontSize:      15,
    fontWeight:    '600',
    letterSpacing: 0.5,
    marginTop:     2,
    marginBottom:  8,
  },
  desc: {
    color:        Colors.subtle,
    fontSize:     13,
    lineHeight:   20,
    marginBottom: 28,
  },
  cardList: {
    gap: 14,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius:    18,
    borderWidth:     1.5,
    borderColor:     'rgba(255,255,255,0.08)',
    padding:         20,
    flexDirection:   'row',
    alignItems:      'center',
    gap:             16,
    overflow:        'hidden',
    position:        'relative',
    minHeight:       120,
  },
  decoIconWrapper: {
    position: 'absolute',
    right:    -10,
    top:       0,
    bottom:    0,
    justifyContent: 'center',
    alignItems:     'center',
    width:     100,
  },
  iconBg: {
    width:          62,
    height:         62,
    borderRadius:   18,
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
  },
  cardText: {
    flex: 1,
  },
  cardLabel: {
    color:         Colors.white,
    fontSize:      15,
    fontWeight:    '700',
    letterSpacing: 1.5,
    marginBottom:  5,
  },
  cardDesc: {
    color:      Colors.subtle,
    fontSize:   13,
    lineHeight: 19,
  },
  checkBadge: {
    position:       'absolute',
    top:            12,
    right:          12,
    width:          22,
    height:         22,
    borderRadius:   11,
    alignItems:     'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 20,
    paddingVertical:   18,
    borderTopWidth:    1,
    borderTopColor:    'rgba(255,255,255,0.05)',
    backgroundColor:   Colors.bg,
  },
  footerTitle: {
    color:         Colors.faint,
    fontSize:      10,
    fontWeight:    '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  footerSub: {
    color:     Colors.skeleton,
    fontSize:  11,
    marginTop: 2,
  },
});
