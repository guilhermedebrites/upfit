import { View, Text, Image, StyleSheet } from 'react-native';

interface Props {
  photoUrl?:   string | null;
  initial?:    string;          // primeira letra do nome — fallback do avatar
  level?:      number | null;   // TODO: Fase 3 — GET /progression/:userId
  streak?:     number | null;   // TODO: Fase 3 — GET /progression/:userId
}

/** Header fixo exibido em quase todas as telas.
 *  Esquerda: avatar pequeno + "UPFIT"
 *  Direita: pílula "LEVEL X • Y 🔥"
 */
export function AppHeader({ photoUrl, initial = '?', level, streak }: Props) {
  const hasPhoto = !!photoUrl;

  return (
    <View style={styles.container}>
      {/* ── Esquerda: avatar + marca ── */}
      <View style={styles.left}>
        <View style={styles.avatarSmall}>
          {hasPhoto ? (
            <Image source={{ uri: photoUrl! }} style={styles.avatarSmallImg} />
          ) : (
            <Text style={styles.avatarSmallInitial}>
              {initial.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        <Text style={styles.brand}>UPFIT</Text>
      </View>

      {/* ── Direita: pílula level + streak ── */}
      <View style={styles.pill}>
        <Text style={styles.pillText}>
          LEVEL {level ?? '—'}
          {'  '}
          {streak != null ? streak : '—'} 🔥
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    paddingHorizontal: 16,
    paddingVertical:   12,
    backgroundColor:   '#0a0a0a',
  },

  left: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           10,
  },

  avatarSmall: {
    width:           32,
    height:          32,
    borderRadius:    16,
    backgroundColor: '#1a1a1a',
    borderWidth:     1.5,
    borderColor:     '#00d4ff',
    alignItems:      'center',
    justifyContent:  'center',
    overflow:        'hidden',
  },
  avatarSmallImg: {
    width:  32,
    height: 32,
  },
  avatarSmallInitial: {
    color:      '#00d4ff',
    fontSize:   13,
    fontWeight: 'bold',
  },

  brand: {
    color:       '#00d4ff',
    fontSize:    16,
    fontWeight:  'bold',
    letterSpacing: 4,
  },

  pill: {
    backgroundColor: '#1a1a1a',
    borderRadius:    20,
    borderWidth:     1,
    borderColor:     '#00d4ff33',
    paddingHorizontal: 12,
    paddingVertical:    6,
  },
  pillText: {
    color:       '#00d4ff',
    fontSize:    11,
    fontWeight:  '600',
    letterSpacing: 1,
  },
});
