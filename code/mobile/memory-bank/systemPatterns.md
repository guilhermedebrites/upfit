# UpFit Frontend — System Patterns

## Arquitetura de frontend
Separar frontend em:
- apresentação (UI)
- estado/feature
- integração com API
- tipos/contratos
- design system

## Padrão por feature
```txt
<feature>/
├── services/        ← chamadas Axios tipadas
├── store/           ← Zustand store + selectors
└── types/           ← DTOs e interfaces
```
> Componentes e telas ficam em `app/` (Expo Router) e `shared/components/`.

## Features principais
- auth
- workout
- progression
- groups
- challenges
- notifications

## Shared
```txt
shared/
├── api/             ← Axios client + interceptors + parseApiError
├── auth/            ← token-storage (SecureStore)
├── components/      ← EmptyState, ErrorState, LoadingSkeleton
├── config/          ← env.ts (base URL)
└── types/           ← enums globais
```

---

## Estilização — padrão híbrido NativeWind + StyleSheet

**Regra:** todo elemento com cor de fundo, cor de texto ou `flex: 1` DEVE ter um `style` prop via `StyleSheet` como backup, além das classes NativeWind.

**Por quê:** com `--clear` o cache do NativeWind é apagado e as classes podem não estar prontas no primeiro render. StyleSheet sempre funciona.

```tsx
// ✅ Correto — StyleSheet garante render; className enriquece quando compilado
<SafeAreaView
  className="flex-1 bg-app-bg"
  style={{ flex: 1, backgroundColor: '#0a0a0a' }}
>

// ❌ Frágil — depende do cache do NativeWind
<SafeAreaView className="flex-1 bg-app-bg">
```

---

## Navegação — padrões estabelecidos no Expo Router v4

### Rota raiz obrigatória
Expo Router v4 exige um arquivo `app/index.tsx`. Sem ele → "unmatched route".

```tsx
// app/index.tsx — splash + dispatcher de auth
export default function SplashScreen() {
  const isHydrated = useAuthStore(selectIsHydrated);
  const user       = useAuthStore((s) => s.user);

  if (isHydrated) {
    return <Redirect href={user ? '/(tabs)/home' : '/(auth)/login'} />;
  }
  return <SplashUI />;
}
```

### Navegação pós-login/register — explícita no handler
Não depender apenas do guard do layout. Chamar `router.replace` diretamente após o sucesso:

```tsx
// ✅ Correto
async function handleLogin() {
  await login(dto);
  router.replace('/(tabs)/home');
}

// ❌ Race condition — guard pode ver user=null antes do Zustand propagar
// (depende só do useEffect no _layout.tsx)
```

### Guard no layout — somente para logout/expiração
O `_layout.tsx` protege apenas o caso de token expirar ou logout enquanto nas tabs:

```tsx
useEffect(() => {
  if (!hydrated || isLoading) return;
  if (!user && segments[0] === '(tabs)') {
    router.replace('/(auth)/login');
  }
}, [hydrated, isLoading, user, segments]);
```
> `isLoading: true` bloqueia o guard durante o processo de login para evitar race condition.

---

## Auth — mapeamento de resposta da API

A API retorna os campos do usuário na raiz (não aninhados em `user`):
```json
{ "accessToken", "refreshToken", "userId", "name", "email" }
```

`role` e `experienceLevel` NÃO vêm na resposta — estão no payload do JWT:
```json
{ "sub": "uuid", "email": "...", "role": "USER|ADMIN", "iat", "exp" }
```

O `buildUser()` no auth store combina os dois:
```typescript
function buildUser(response: AuthResponse, token: string): AuthUser {
  const jwt = decodeJwtPayload(token);
  return {
    id:              response.userId,
    name:            response.name,
    email:           response.email,
    role:            jwt?.role ?? UserRole.USER,
    experienceLevel: jwt?.experienceLevel ?? ExperienceLevel.BEGINNER,
  };
}
```

Na **hydration** (app reaberto), o nome fica vazio — será preenchido ao implementar `GET /profile/:userId`.

---

## API client
- `shared/api/client.ts` — Axios com interceptors de request (Bearer token) e response (refresh em 401)
- Endpoints públicos: `/auth/register`, `/auth/login`, `/auth/refresh` — sem token
- Todos os demais: `Authorization: Bearer <accessToken>`

---

## Estado
- **Remoto** (store Zustand): dados da API, loading, error
- **Local** (useState): campos de formulário, toggles de UI

---

## Componentes reutilizáveis importantes
- `XPProgressBar`
- `LevelBadge`
- `StreakCard`
- `WorkoutCard`
- `AchievementCard`
- `GroupCard`
- `GroupRankingList`
- `GroupFeedList`
- `ChallengeCard`
- `NotificationListItem`
- `EmptyState` ✅
- `ErrorState` ✅
- `LoadingSkeleton` ✅

---

## Upload de imagens
Fluxo padrão:
1. `GET /*/upload-url?filename=nome.jpg` → `{ presignedUrl, objectUrl }`
2. `PUT <presignedUrl>` com o arquivo (Content-Type: image/jpeg ou image/png)
3. Enviar `objectUrl` no endpoint de negócio

> Em dev local, substituir `localstack:4566` → `localhost:4566` na presignedUrl.

---

## Segurança
- JWT e refreshToken armazenados via `expo-secure-store` (criptografado)
- Nunca usar `AsyncStorage` para tokens
- Telas/ações ADMIN verificam `user.role === 'ADMIN'` extraído do JWT
- Validação real sempre no backend — frontend só controla visibilidade

---

## Regras de integração
- Não inferir regras de negócio no frontend se o backend já retorna cálculo
- Exibir valores calculados pelo backend (`progressPercent`, `groupLevel`, etc.)
- Frontend calcula apenas apresentação visual

---

## Comandos de desenvolvimento
```bash
npx expo start --go          # desenvolvimento normal
npx expo start --go --clear  # somente ao mudar babel/metro/tailwind config
# Recarregar app: Cmd+R no iOS Simulator
# Terminal interativo: usar Terminal.app (VSCode não captura teclas do Expo CLI)
```
