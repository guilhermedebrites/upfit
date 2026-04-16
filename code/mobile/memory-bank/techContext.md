# UpFit Frontend — Tech Context

## Base URL por ambiente
| Ambiente | URL Base |
|----------|---------|
| Dev local | `http://localhost:8080` |
| Produção | domínio do API Gateway / Route 53 |

> Só a base URL muda entre ambientes — os paths dos endpoints não mudam.

---

## Stack Mobile

| Camada | Tecnologia | Versão instalada |
|--------|-----------|-----------------|
| Framework | Expo | ~52.0.11 |
| Linguagem | TypeScript | ^5.3.3 |
| Navegação | Expo Router | ~4.0.17 |
| Estilização | NativeWind | 4.2.3 |
| Tailwind | tailwindcss | ^3.4.17 |
| Estado | Zustand | ^5.0.3 |
| HTTP | Axios | ^1.7.9 |
| Tokens | Expo SecureStore | ~13.0.2 |
| Animações | React Native Reanimated | ~3.16.1 |

## Stack Web (fase futura)
| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js |
| Estilização | TailwindCSS |
| Estado | Zustand |
| HTTP | Axios |

---

## Roteamento do Nginx (dev local)
| Path | Serviço |
|------|---------|
| `/auth/**` | auth-service:8081 |
| `/profile/**` | auth-service:8081 |
| `/workouts/**` | workout-service:8082 |
| `/progression/**` | progression-service:8083 |
| `/achievements/**` | progression-service:8083 |
| `/groups/**` | group-service:8084 |
| `/challenges/**` | challenge-service:8085 |
| `/notifications/**` | notification-service:8086 |

---

## Configuração do Axios (`shared/api/client.ts`)
- Base URL via `ENV.API_BASE_URL` (variável de ambiente `EXPO_PUBLIC_API_BASE_URL`)
- **Request interceptor**: injeta `Authorization: Bearer <accessToken>` em rotas protegidas
- **Response interceptor**: em 401, faz refresh automático e re-tenta a request original
- Fila de requests pendentes durante o refresh (evita múltiplos refreshes simultâneos)
- Rotas públicas: `/auth/register`, `/auth/login`, `/auth/refresh`

---

## Persistência de autenticação
- JWT e refreshToken: `expo-secure-store` (criptografado no keychain do device)
- Nunca usar `AsyncStorage` (não criptografado)
- Na abertura do app, `hydrate()` lê o token do SecureStore e reconstrói o `AuthUser` via decode do JWT

---

## Contrato real da API de Auth

### Resposta de login e register
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "uuid",
  "userId": "uuid",
  "name": "Nome do Usuário",
  "email": "email@exemplo.com"
}
```
> ⚠️ Campo é `accessToken` (não `token`). `role` e `experienceLevel` **não estão** na resposta — estão no payload do JWT.

### Payload do JWT (decodificado client-side)
```json
{
  "sub": "uuid",
  "email": "email@exemplo.com",
  "role": "USER | ADMIN",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Resposta de refresh
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "uuid"
}
```

---

## NativeWind — comportamento com cache

O NativeWind 4.x processa as classes Tailwind via Metro bundler. Com `--clear`, o cache é apagado e as classes podem não estar disponíveis no primeiro render.

**Padrão adotado:** elementos críticos (background, flex, cores de texto) usam `StyleSheet` como fallback + `className` do NativeWind como complemento.

**Comandos:**
```bash
npx expo start --go           # uso normal — sem apagar cache
npx expo start --go --clear   # somente ao mudar metro.config, babel.config ou tailwind.config
```

---

## Expo Router v4 — particularidades

- **Rota raiz:** `app/index.tsx` é obrigatório. Sem ele → "unmatched route" ao abrir o app.
- **Terminal interativo:** o VSCode não captura teclas únicas (`r`, `i`, `a`) do Expo CLI. Usar Terminal.app ou iTerm2.
- **Recarregar no simulador:** `Cmd+R` no iOS Simulator com o app em foco.
- **Expo Go:** rodar com `--go`. Development Build só necessário ao adicionar módulos nativos fora do SDK.

---

## Cores do design system (tailwind.config.js)
| Token | Valor | Uso |
|-------|-------|-----|
| `cyber` | `#00d4ff` | Cor primária de destaque (botões, labels, ícones) |
| `app-bg` | `#0a0a0a` | Fundo das telas |
| `app-card` | `#1a1a1a` | Fundo dos cards |
| `app-input` | `#0f0f0f` | Fundo dos inputs |
| `brand` | `#6366f1` | Cor da marca (uso secundário) |
| `xp` | `#f59e0b` | Indicadores de XP |
| `streak` | `#ef4444` | Indicadores de streak |
| `success` | `#22c55e` | Feedback positivo |

---

## Enums relevantes
```typescript
enum ExperienceLevel { BEGINNER, INTERMEDIATE, ADVANCED }
enum UserRole        { USER, ADMIN }
enum GroupRole       { MEMBER, ADMIN, OWNER }
enum NotificationType{ WORKOUT, LEVEL_UP, ACHIEVEMENT, CHALLENGE, GROUP }
enum AchievementType { CONSISTENCY, VOLUME, SPEED, STRENGTH, SOCIAL }
enum ChallengeStatus { ACTIVE, COMPLETED, EXPIRED }
enum ChallengeType   { GLOBAL, DAILY, WEEKLY }
```

---

## Endpoints que exigem autenticação
Todos exceto:
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`

## Endpoints ADMIN only
- `POST /challenges`
- `GET /challenges/upload-url`
- `POST /achievements/definitions`
- `PATCH /achievements/definitions/:id/toggle`
- `POST /auth/admin/promote`
