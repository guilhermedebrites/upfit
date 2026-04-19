import { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/features/auth/store/auth.store';

interface Props {
  initial?:  string;
  photoUrl?: string | null;
  level?:    number | null;
  streak?:   number | null;
}

/**
 * Header fixo exibido em quase todas as telas.
 * - photoUrl pode ser passada como prop (ex: home screen), ou lê do auth store se não fornecida
 * - Esquerda: avatar pequeno + "UPFIT"
 * - Direita: pílula "LEVEL X • Y 🔥"
 */
export function AppHeader({ initial = '?', photoUrl, level, streak }: Props) {
  const router   = useRouter();
  const storePhotoUrl = useAuthStore((s) => s.user?.avatarUrl ?? null);
  const displayPhotoUrl = photoUrl ?? storePhotoUrl;
  const [imgError, setImgError] = useState(false);

  // Reseta o erro sempre que chegar uma nova URL (ex: após upload ou prop change)
  useEffect(() => { setImgError(false); }, [displayPhotoUrl]);

  const showPhoto = !!displayPhotoUrl && !imgError;

  return (
    <View className="flex-row items-center justify-between px-4 py-3 bg-app-bg">
      {/* Esquerda — avatar clicável abre o perfil */}
      <TouchableOpacity
        onPress={() => router.push('/profile')}
        activeOpacity={0.75}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
      >
        <View style={styles.avatarSmall}>
          {showPhoto ? (
            <Image
              key={displayPhotoUrl!}
              source={{ uri: displayPhotoUrl! }}
              style={styles.avatarSmallImg}
              onError={() => setImgError(true)}
            />
          ) : (
            <Text style={{ color: '#00d4ff', fontSize: 13, fontWeight: 'bold' }}>
              {initial.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        <Text className="text-cyber font-bold text-base" style={{ letterSpacing: 4 }}>
          UPFIT
        </Text>
      </TouchableOpacity>

      {/* Pílula direita */}
      <View className="bg-app-card rounded-[20px] border border-cyber/20 px-3 py-1.5">
        <Text className="text-cyber text-[11px] font-semibold" style={{ letterSpacing: 1 }}>
          LEVEL {level ?? '—'}
          {' • '}
          {streak != null ? streak : '—'} 🔥
        </Text>
      </View>
    </View>
  );
}

// StyleSheet apenas para os tamanhos computados do avatar
const AVATAR = 32;
const styles = StyleSheet.create({
  avatarSmall: {
    width:           AVATAR,
    height:          AVATAR,
    borderRadius:    AVATAR / 2,
    backgroundColor: '#1a1a1a',
    borderWidth:     1.5,
    borderColor:     '#00d4ff',
    alignItems:      'center',
    justifyContent:  'center',
    overflow:        'hidden',
  },
  avatarSmallImg: {
    width:  AVATAR,
    height: AVATAR,
  },
});
