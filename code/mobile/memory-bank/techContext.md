# UpFit Frontend — Tech Context

## Base URL por ambiente
| Ambiente | URL Base |
|----------|---------|
| Dev local | `http://localhost:8080` |
| Produção | domínio do API Gateway / Route 53 |

> Só a base URL muda entre ambientes — os paths dos endpoints não mudam.

## Stack Mobile

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | Expo | latest |
| Linguagem | TypeScript | 5.x |
| Navegação | Expo Router | latest |
| Estilização | NativeWind | 4.x |
| Estado | Zustand | latest |
| HTTP | Axios | latest |
| Persistência de token | Expo SecureStore | latest |

## Stack Web (fase futura)

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js |
| Estilização | TailwindCSS |
| Estado | Zustand |
| HTTP | Axios |

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

## Configuração do Axios

```typescript
// Injetar base URL via variável de ambiente
// Interceptor de request: adiciona Authorization Bearer token
// Interceptor de response: em caso de 401, tenta refresh e retry
```

## Persistência de autenticação
- JWT e refreshToken armazenados via **Expo SecureStore**
- Nunca armazenar em AsyncStorage (não criptografado)

## Contratos disponíveis do backend

### Auth / Profile
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `GET /profile/:userId`
- `PUT /profile/:userId`
- `GET /profile/upload-url?filename=...`

### Workouts
- `POST /workouts`
- `GET /workouts/user/:id`

### Progression
- `GET /progression/:userId`
- `POST /achievements/definitions` (ADMIN)
- `GET /achievements/definitions`
- `PATCH /achievements/definitions/:id/toggle` (ADMIN)

### Groups
- `POST /groups`
- `PUT /groups/:id`
- `POST /groups/:id/join`
- `DELETE /groups/:id/leave`
- `GET /groups/upload-url?filename=...`
- `GET /groups`
- `GET /groups/my`
- `GET /groups/:id`
- `GET /groups/:id/members`
- `GET /groups/:id/ranking`
- `GET /groups/:id/feed`

### Challenges
- `POST /challenges` (ADMIN)
- `GET /challenges`
- `GET /challenges/:id`
- `POST /challenges/:id/join`
- `DELETE /challenges/:id/leave`
- `GET /challenges/upload-url?filename=...` (ADMIN)

### Notifications
- `GET /notifications/:userId`
- `GET /notifications/:userId?all=true`
- `PATCH /notifications/:id/read`
- `PATCH /notifications/read-all`

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

## Fluxo de upload de imagem
1. Frontend chama `GET /*/upload-url?filename=`
2. Recebe `{ presignedUrl, objectUrl }`
3. Faz `PUT` direto no S3 usando `presignedUrl`
4. Envia `objectUrl` no endpoint de negócio

## Enums relevantes
```typescript
enum ExperienceLevel { BEGINNER, INTERMEDIATE, ADVANCED }
enum UserRole { USER, ADMIN }
enum GroupRole { MEMBER, ADMIN, OWNER }
enum NotificationType { WORKOUT, LEVEL_UP, ACHIEVEMENT, CHALLENGE, GROUP }
enum AchievementType { CONSISTENCY, VOLUME, SPEED, STRENGTH, SOCIAL }
enum ChallengeStatus { ACTIVE, COMPLETED, EXPIRED }
enum ChallengeType { GLOBAL, DAILY, WEEKLY }
```
