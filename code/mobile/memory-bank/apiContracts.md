# UpFit Frontend — API Contracts Reference

> Base URL: `http://localhost:8080` (dev local via Nginx) | `https://api.upfit.com.br` (produção)
> Todos os endpoints requerem `Authorization: Bearer <jwt>` exceto register, login e refresh.

---

## Auth

### POST /auth/register
Cria usuário e perfil. `experienceLevel` padrão: `BEGINNER`.
```json
// Request
{
  "name": "Arthur Silva",
  "email": "arthur@upfit.com",
  "password": "senha123",
  "experienceLevel": "BEGINNER"
}
// Response 201
{
  "accessToken": "eyJ...",
  "refreshToken": "uuid",
  "userId": "uuid",
  "name": "Arthur Silva",
  "email": "arthur@upfit.com"
}
```
> `role` e `experienceLevel` NÃO vêm na resposta — estão no payload do JWT (`sub`, `email`, `role`).

### POST /auth/login
```json
// Request
{ "email": "arthur@upfit.com", "password": "senha123" }
// Response 200
{
  "accessToken": "eyJ...",
  "refreshToken": "uuid",
  "userId": "uuid",
  "name": "Arthur Silva",
  "email": "arthur@upfit.com"
}
```
> JWT payload: `{ sub, email, role, iat, exp }` — decodificado client-side para extrair `role`.

### POST /auth/refresh
```json
// Request
{ "refreshToken": "uuid" }
// Response 200
{ "accessToken": "eyJ...", "refreshToken": "uuid" }
```

### POST /auth/admin/promote
> ADMIN only
```json
// Request
{ "userId": "uuid" }
// Response 200
```

---

## Profile

### GET /profile/:userId
```json
// Response 200
{
  "id": "uuid",
  "userId": "uuid",
  "photoUrl": "http://...",
  "bio": "Treino todos os dias",
  "weight": 83.4,
  "height": 1.80,
  "goal": "Emagrecimento",
  "experienceLevel": "BEGINNER"
}
```
> `height` em **metros** (ex: `1.80`), `weight` em **kg** (ex: `83.4`).

### PUT /profile/:userId
```json
// Request (todos os campos opcionais)
{
  "bio": "Treino todos os dias",
  "weight": 83.4,
  "height": 1.80,
  "goal": "Emagrecimento",
  "experienceLevel": "INTERMEDIATE",
  "photoUrl": "https://bucket.s3.amazonaws.com/profile-assets/foto.jpg"
}
```
> `height` em **metros**, `weight` em **kg**.
> `photoUrl` é o `objectUrl` retornado pelo fluxo de upload (presigned URL) — enviado no mesmo body.
> `userId` é extraído da URL — não enviar no body.

### GET /profile/upload-url?filename=foto.jpg
> Gerar antes do PUT /profile/:userId quando o usuário selecionar uma imagem.
```json
// Response 200
{
  "presignedUrl": "http://localhost:4566/profile-assets/...",
  "objectUrl": "http://localhost:4566/profile-assets/foto.jpg"
}
```
> Fluxo: GET upload-url → PUT presignedUrl com arquivo → PUT /profile/:userId com objectUrl

---

## Workouts

### POST /workouts
> `userId` extraído do JWT — não enviar no body.
```json
// Request — Corrida
{
  "type": "RUNNING",
  "durationMin": 31,
  "caloriesBurned": 280.0,
  "distanceKm": 5.0,
  "averagePace": 6.2,
  "notes": "Corrida matinal"
}
// Request — Musculação
{
  "type": "STRENGTH",
  "durationMin": 45,
  "caloriesBurned": 320.0,
  "primaryMuscleGroup": "Peitorais",
  "notes": "Treino A",
  "exercises": [
    {
      "exerciseName": "Supino Reto",
      "sets": 4,
      "reps": 10,
      "weight": 80.0,
      "restSeconds": 90
    }
  ]
}
// Response 201
{ "id": "uuid", "type": "RUNNING", ... }
```

### GET /workouts/user/:id
```json
// Response 200
[
  {
    "id": "uuid",
    "type": "RUNNING",
    "dateTime": "2026-04-15T10:00:00",
    "durationMin": 31,
    "caloriesBurned": 280.0,
    "distanceKm": 5.0,
    "averagePace": 6.2
  },
  {
    "id": "uuid",
    "type": "STRENGTH",
    "dateTime": "2026-04-14T18:00:00",
    "durationMin": 45,
    "caloriesBurned": 320.0,
    "primaryMuscleGroup": "Peitorais",
    "exercises": [ { "exerciseName": "Supino Reto", "sets": 4, "reps": 10, "weight": 80.0, "restSeconds": 90 } ]
  }
]
```

---

## Progression

### GET /progression/:userId
```json
// Response 200
{
  "id": "uuid",
  "userId": "uuid",
  "currentXp": 260,
  "totalXp": 260,
  "level": 3,
  "streakDays": 2,
  "xpToNextLevel": 240,
  "currentLevelXpRequired": 250,
  "nextLevelXpRequired": 500,
  "progressPercent": 4.0,
  "achievements": [
    {
      "id": "uuid",
      "definitionId": "uuid",
      "title": "Centurião",
      "description": "Acumulou 100 XP",
      "unlockedAt": "2026-04-16T10:29:33"
    }
  ]
}
```
> `progressPercent` = progresso dentro do nível atual (de `currentLevelXpRequired` até `nextLevelXpRequired`).
> XP ganho no nível = `currentXp - currentLevelXpRequired`.
> XP total do nível = `nextLevelXpRequired - currentLevelXpRequired`.

### POST /achievements/definitions
> ADMIN only
```json
// Request
{
  "title": "Primeira Milha",
  "description": "Complete sua primeira corrida",
  "type": "CONSISTENCY",
  "rule": "WORKOUTS_1",
  "threshold": 1.0
}
```

### GET /achievements/definitions
```json
// Response 200
[
  {
    "id": "uuid",
    "title": "Primeira Milha",
    "description": "...",
    "type": "CONSISTENCY",
    "rule": "WORKOUTS_1",
    "threshold": 1.0,
    "active": true
  }
]
```

### PATCH /achievements/definitions/:id/toggle
> ADMIN only. Inverte `active` (true→false, false→true).
```json
// Response 200
{ "id": "uuid", "active": false, ... }
```

---

## Groups

### POST /groups
> Criador vira OWNER automaticamente. Usuário só pode ser OWNER de um grupo.
```json
// Request
{
  "name": "Runners SP",
  "description": "Grupo de corrida de São Paulo",
  "weeklyGoal": "50km",
  "imageUrl": "http://..."
}
// Response 201
{ "id": "uuid", "name": "Runners SP", ... }
```

### PUT /groups/:id
> Somente OWNER do grupo ou ADMIN da plataforma.
```json
// Request (campos opcionais)
{ "name": "...", "description": "...", "weeklyGoal": "...", "imageUrl": "..." }
```

### POST /groups/:id/join
> Response 200. Publica MemberJoined no NotificationTopic.

### DELETE /groups/:id/leave
> OWNER não pode sair. Response 204. Publica MemberLeft no NotificationTopic.

### GET /groups/upload-url?filename=banner.jpg
```json
// Response 200
{
  "presignedUrl": "http://localhost:4566/group-assets/...",
  "objectUrl": "http://localhost:4566/group-assets/banner.jpg"
}
```

### GET /groups
```json
// Response 200
[
  { "id": "uuid", "name": "Runners SP", "groupLevel": 3, "groupXp": 1500, ... }
]
```

### GET /groups/my
> userId extraído do JWT.
```json
// Response 200 — mesmo formato de GET /groups
```

### GET /groups/:id
```json
// Response 200
{
  "id": "uuid",
  "name": "Runners SP",
  "description": "...",
  "imageUrl": "http://...",
  "createdAt": "2026-04-13T02:31:43",
  "weeklyGoal": "50km",
  "groupXp": 42500,
  "groupLevel": 18,
  "xpToNextLevel": 7500,
  "currentLevelXpRequired": 35000,
  "nextLevelXpRequired": 50000,
  "progressPercent": 85
}
```

### GET /groups/:id/members
```json
// Response 200
[
  { "id": "uuid", "userId": "uuid", "role": "OWNER", "groupScore": 4820, "joinedAt": "..." },
  { "id": "uuid", "userId": "uuid", "role": "MEMBER", "groupScore": 3200, "joinedAt": "..." }
]
```

### GET /groups/:id/ranking
> Membros ordenados por `groupScore DESC`.
```json
// Response 200 — mesmo formato de GET /groups/:id/members
```

### GET /groups/:id/feed
> 10 treinos mais recentes dos membros do grupo.
```json
// Response 200
[
  {
    "id": "uuid",
    "userId": "uuid",
    "workoutId": "uuid",
    "type": "RUNNING",
    "durationMin": 31,
    "caloriesBurned": 280.0,
    "distanceKm": 5.0,
    "recordedAt": "2026-04-15T10:00:00"
  }
]
```

---

## Challenges

### POST /challenges
> ADMIN only.
```json
// Request
{
  "title": "Corra 10km",
  "description": "Complete 10km de corrida",
  "goal": "Acumule 10km de corrida",
  "goalTarget": 10.0,
  "rewardXp": 500,
  "startDate": "2026-04-13",
  "endDate": "2026-04-30",
  "type": "GLOBAL",
  "requiredLevel": null,
  "coverImageUrl": null
}
// Response 201
{ "id": "uuid", "title": "Corra 10km", ... }
```

### GET /challenges
> Query params opcionais — podem ser combinados.
> - `?type=GLOBAL|DAILY|WEEKLY`
> - `?participating=true` → inclui `myParticipation` em cada item
> - `?participating=false` → desafios que o usuário NÃO participa
```json
// Response 200 (com participating=true)
[
  {
    "id": "uuid",
    "title": "Corra 10km",
    "type": "GLOBAL",
    "status": "ACTIVE",
    "rewardXp": 500,
    "endDate": "2026-04-30",
    "coverImageUrl": "http://...",
    "requiredLevel": null,
    "myParticipation": {
      "currentProgress": 4.5,
      "completed": false,
      "progressPercent": 45
    }
  }
]
```

### GET /challenges/:id
```json
// Response 200
{
  "id": "uuid",
  "title": "Corra 10km",
  "description": "...",
  "goal": "...",
  "goalTarget": 10.0,
  "rewardXp": 500,
  "startDate": "2026-04-13",
  "endDate": "2026-04-30",
  "type": "GLOBAL",
  "status": "ACTIVE",
  "requiredLevel": null,
  "coverImageUrl": "http://...",
  "myParticipation": {
    "currentProgress": 4.5,
    "completed": false,
    "progressPercent": 45
  }
}
```
> `myParticipation` é `null` se o usuário não participa.

### POST /challenges/:id/join
> Valida `requiredLevel` — 403 se nível insuficiente.
```json
// Request
{ "userLevel": 2 }
// Response 200
```

### DELETE /challenges/:id/leave
> Somente se `completed = false`. Response 204.

### GET /challenges/upload-url?filename=capa.jpg
> ADMIN only.
```json
// Response 200
{
  "presignedUrl": "http://localhost:4566/challenge-assets/...",
  "objectUrl": "http://localhost:4566/challenge-assets/capa.jpg"
}
```

---

## Notifications

### GET /notifications/:userId
> Retorna apenas notificações não lidas (`read = false`). Ordenadas por `sentAt DESC`.
```json
// Response 200
[
  {
    "id": "uuid",
    "userId": "uuid",
    "title": "Treino registrado!",
    "message": "Continue assim.",
    "type": "WORKOUT",
    "read": false,
    "sentAt": "2026-04-15T10:00:00"
  }
]
```

### GET /notifications/:userId?all=true
> Histórico completo (lidas e não lidas).

### PATCH /notifications/:id/read
> Marca uma notificação como lida. Response 200.

### PATCH /notifications/read-all
> Marca todas as notificações do usuário como lidas. `userId` extraído do JWT. Response 200.

---

## Enums

```typescript
enum ExperienceLevel { BEGINNER = "BEGINNER", INTERMEDIATE = "INTERMEDIATE", ADVANCED = "ADVANCED" }
enum UserRole { USER = "USER", ADMIN = "ADMIN" }
enum GroupRole { MEMBER = "MEMBER", ADMIN = "ADMIN", OWNER = "OWNER" }
enum NotificationType { WORKOUT = "WORKOUT", LEVEL_UP = "LEVEL_UP", ACHIEVEMENT = "ACHIEVEMENT", CHALLENGE = "CHALLENGE", GROUP = "GROUP" }
enum AchievementType { CONSISTENCY = "CONSISTENCY", VOLUME = "VOLUME", SPEED = "SPEED", STRENGTH = "STRENGTH", SOCIAL = "SOCIAL" }
enum ChallengeStatus { ACTIVE = "ACTIVE", COMPLETED = "COMPLETED", EXPIRED = "EXPIRED" }
enum ChallengeType { GLOBAL = "GLOBAL", DAILY = "DAILY", WEEKLY = "WEEKLY" }
```

---

## Fluxo de Upload de Imagem

```
1. Usuário seleciona imagem
2. Frontend: GET /*/upload-url?filename=nome.jpg
3. Backend retorna: { presignedUrl, objectUrl }
4. Frontend: PUT <presignedUrl> com o arquivo (Content-Type: image/jpeg ou image/png)
5. Frontend: usa objectUrl no endpoint de negócio (PUT /profile/:userId, POST /groups, POST /challenges)
```
> Em dev local, substituir `localstack:4566` por `localhost:4566` na presignedUrl antes de fazer o PUT.