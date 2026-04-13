# UpFit — Domain Model

Baseado no diagrama de classes oficial do projeto.

---

## Enums

```java
enum ExperienceLevel {
    BEGINNER, INTERMEDIATE, ADVANCED
}

enum UserRole {
    USER, ADMIN
}

enum GroupRole {
    MEMBER, ADMIN, OWNER
}

enum NotificationType {
    WORKOUT, LEVEL_UP, ACHIEVEMENT, CHALLENGE, GROUP
}

enum AchievementType {
    CONSISTENCY, VOLUME, SPEED, STRENGTH, SOCIAL
}

enum ChallengeStatus {
    ACTIVE, COMPLETED, EXPIRED
}
```

---

## Entidades por Serviço

### auth-service (auth_db)

**User** → tabela `users`
```
id: UUID
name: String
email: String
passwordHash: String
role: UserRole          ← USER (padrão) ou ADMIN
createdAt: DateTime
status: String
```

> `role` é incluído no payload do JWT para que outros serviços possam verificar permissões sem chamar o auth-service.

**Profile** → tabela `profiles` (1:1 com User)
```
id: UUID
userId: UUID
photoUrl: String        ← URL do objeto no S3 (bucket: profile-assets)
bio: String
weight: Double
height: Double
goal: String
experienceLevel: ExperienceLevel
```

> `photoUrl` armazena a URL do objeto no S3. O upload da foto é feito diretamente no S3 pelo cliente; o serviço apenas persiste a URL resultante.

**RefreshToken** → tabela `refresh_tokens`
```
id: UUID
userId: UUID
token: String
expiresAt: DateTime
```

---

### workout-service (workout_db)

**Workout** → tabela `workouts` (classe abstrata)
```
id: UUID
userId: UUID
dateTime: DateTime
durationMin: int
notes: String
caloriesBurned: Double
```

**RunningWorkout** → tabela `running_workouts` (extends Workout)
```
distanceKm: Double
averagePace: Double
```

**StrengthWorkout** → tabela `strength_workouts` (extends Workout)
```
primaryMuscleGroup: String
```

**ExerciseEntry** → tabela `exercise_entries` (composição com StrengthWorkout — 1 para 1..*)
```
id: UUID
workoutId: UUID
exerciseName: String
sets: int
reps: int
weight: Double
restSeconds: int
```

> **Herança JPA:** `@Inheritance(strategy = InheritanceType.JOINED)` — sem coluna discriminadora. O Hibernate resolve o tipo pelo JOIN entre `workouts` e a tabela filha correspondente (`running_workouts` ou `strength_workouts`).

---

### progression-service (progression_db)

**Progression** → tabela `progressions` (1:1 com User)
```
id: UUID
userId: UUID
currentXp: int
totalXp: int
level: int
streakDays: int
```

**AchievementDefinition** → tabela `achievement_definitions` (cadastrada por ADMIN)
```
id: UUID
title: String
description: String
type: AchievementType
rule: String            ← ex: "STREAK_7", "VOLUME_1000", "WORKOUTS_30"
threshold: Double       ← valor que precisa ser atingido
active: Boolean
```

**Achievement** → tabela `achievements` (desbloqueado quando usuário atinge a regra)
```
id: UUID
progressionId: UUID
definitionId: UUID      ← referência à AchievementDefinition
unlockedAt: DateTime
```

> Ao processar `WorkoutRecorded`, o `progression-service` avalia todas as `AchievementDefinition` ativas contra os dados do usuário. Se a regra for atingida e o usuário ainda não tem aquele achievement, desbloqueia e publica `AchievementUnlocked` no `NotificationTopic`.
>
> **Thresholds de nível do usuário:** carregados do S3 no startup do serviço.
> Arquivo: `s3://upfit-config/user-level-thresholds.json`
> Formato: `[{ "level": 1, "xpRequired": 0 }, { "level": 2, "xpRequired": 100 }, ...]`
> Fallback: thresholds padrão em memória caso o S3 esteja inacessível.

---

### group-service (group_db)

**Group** → tabela `groups`
```
id: UUID
name: String
description: String
imageUrl: String        ← URL do objeto no S3 (bucket: group-assets)
createdAt: DateTime
weeklyGoal: String
groupXp: int
groupLevel: int
```

**GroupMembership** → tabela `group_memberships` (associação User ↔ Group)
```
id: UUID
userId: UUID
groupId: UUID
joinedAt: DateTime
role: GroupRole
groupScore: int         ← XP contribuído pelo membro ao grupo
```

**GroupFeedEntry** → tabela `group_feed_entries` (feed de treinos do grupo)
```
id: UUID
groupId: UUID
userId: UUID
workoutId: UUID
type: String            ← "RUNNING" ou "STRENGTH"
durationMin: int
caloriesBurned: Double
distanceKm: Double      ← null se STRENGTH
recordedAt: DateTime
```

> `imageUrl` armazena a URL do objeto no S3. O upload é feito diretamente no S3 pelo cliente.
>
> **XP do grupo:** ao receber `WorkoutRecorded` via `GroupQueue`, o `group-service` verifica se o `userId` é membro ativo. Se sim, incrementa `groupScore` do membro e `groupXp` do grupo, depois recalcula `groupLevel`.
>
> **Feed do grupo:** ao processar `WorkoutRecorded`, o `GroupQueueListener` também salva uma `GroupFeedEntry` para cada grupo do qual o usuário é membro, permitindo exibir os treinos recentes dos membros ordenados por `recordedAt DESC`.
>
> **Restrição de OWNER:** um usuário só pode ser OWNER de um grupo por vez. Validado no `POST /groups` antes de criar.
>
> **Thresholds de nível do grupo:** carregados do S3 no startup do serviço.
> Arquivo: `s3://upfit-config/group-level-thresholds.json`
> Valores maiores que os de usuário — grupo sobe de nível mais devagar.
> Fallback: thresholds padrão em memória caso o S3 esteja inacessível.

---

### challenge-service (challenge_db)

**Challenge** → tabela `challenges`
```
id: UUID
title: String
description: String
goal: String
rewardXp: int
startDate: DateTime
endDate: DateTime
status: ChallengeStatus
```

**ChallengeParticipation** → tabela `challenge_participations` (associação User ↔ Challenge)
```
id: UUID
userId: UUID
challengeId: UUID
currentProgress: Double
completed: Boolean
completedAt: DateTime
```

> **Progresso no desafio:** ao receber `WorkoutRecorded` via `ChallengeQueue`, o `challenge-service` atualiza `currentProgress` de todas as participações ativas do usuário. Quando meta atingida → publica `ChallengeCompleted` no `NotificationTopic`.

---

### notification-service (notification_db)

**Notification** → tabela `notifications`
```
id: UUID
userId: UUID
title: String
message: String
type: NotificationType
read: Boolean
sentAt: DateTime
```

---

## Controle de Acesso (UserRole)

| Endpoint | Role exigida |
|----------|-------------|
| POST /challenges | ADMIN |
| POST /achievements/definitions | ADMIN |
| Todo o restante | USER ou ADMIN |

> O `role` do usuário é embutido no JWT pelo `auth-service`. Os demais serviços extraem e validam do token — sem chamar o auth-service.

---

## Buckets S3

| Bucket | Dono | Conteúdo |
|--------|------|---------|
| `profile-assets` | auth-service | Fotos de perfil dos usuários |
| `group-assets` | group-service | Imagens dos grupos |
| `upfit-config` | progression-service, group-service | Arquivos de configuração de negócio |

### Arquivos de configuração (`upfit-config`)
```
user-level-thresholds.json   → lido por progression-service
group-level-thresholds.json  → lido por group-service
```

---

## Relacionamentos

| From | To | Cardinality |
|------|----|-------------|
| User | Profile | 1:1 |
| User | RefreshToken | 1:0..* |
| User | Progression | 1:1 |
| User | Notification | 1:0..* |
| User | GroupMembership | 1:0..* |
| User | ChallengeParticipation | 1:0..* |
| Group | GroupMembership | 1:0..* |
| Group | GroupFeedEntry | 1:0..* |
| Challenge | ChallengeParticipation | 1:0..* |
| Progression | Achievement | 1:0..* |
| AchievementDefinition | Achievement | 1:0..* |
| StrengthWorkout | ExerciseEntry | 1:1..* |
| Workout | RunningWorkout | inheritance |
| Workout | StrengthWorkout | inheritance |

---

## Regra de Ownership por Serviço

```
auth-service        → User, Profile, RefreshToken              | S3: profile-assets
workout-service     → Workout, RunningWorkout, StrengthWorkout, ExerciseEntry
progression-service → Progression, AchievementDefinition, Achievement | S3: upfit-config (leitura)
group-service       → Group, GroupMembership, GroupFeedEntry    | S3: group-assets, upfit-config (leitura)
challenge-service   → Challenge, ChallengeParticipation
notification-service → Notification
```
