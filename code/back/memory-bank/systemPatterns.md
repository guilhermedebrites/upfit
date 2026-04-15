# UpFit — System Patterns

## Arquitetura
**Microserviços + Event-Driven**

Cada serviço é autônomo: tem seu próprio banco de dados, codebase e Dockerfile.
Serviços NÃO se chamam diretamente — comunicação via eventos (SNS/SQS).

---

## Microserviços

| Serviço | Responsabilidade | Porta | Banco |
|---------|-----------------|-------|-------|
| auth-service | Usuário, Perfil, autenticação JWT | 8081 | auth_db |
| workout-service | Registro de treinos (corrida/musculação) | 8082 | workout_db |
| progression-service | XP, Nível, Streak, Conquistas | 8083 | progression_db |
| group-service | Grupos e membros | 8084 | group_db |
| challenge-service | Desafios e participações | 8085 | challenge_db |
| notification-service | Notificações ao usuário | 8086 | notification_db |

---

## Tópicos SNS

### `WorkoutRecordedTopic`
Publicado por: `workout-service`
Subscribers: `ProgressionQueue`, `ChallengeQueue`, `GroupQueue`

### `NotificationTopic`
Publicado por: `progression-service`, `challenge-service`, `group-service`
Subscribers: `NotificationQueue`

---

## Filas SQS (por consumidor)

| Fila | Consumidor | Tópico de origem | Eventos recebidos |
|------|-----------|-----------------|-------------------|
| ProgressionQueue | progression-service | WorkoutRecordedTopic | WorkoutRecorded |
| ChallengeQueue | challenge-service | WorkoutRecordedTopic | WorkoutRecorded |
| GroupQueue | group-service | WorkoutRecordedTopic | WorkoutRecorded |
| NotificationQueue | notification-service | NotificationTopic | WorkoutRecorded, LevelUp, AchievementUnlocked, ChallengeCompleted, GroupLevelUp, MemberJoined, MemberLeft |

---

## Eventos do Sistema

### Publicados no `WorkoutRecordedTopic`

| Evento | Payload | Publicado por |
|--------|---------|--------------|
| WorkoutRecorded | userId, workoutId, type, durationMin, caloriesBurned | workout-service |

### Publicados no `NotificationTopic`

| Evento | Payload | Publicado por |
|--------|---------|--------------|
| WorkoutRecorded | userId, workoutId, type, durationMin, caloriesBurned | progression-service (após processar XP) |
| LevelUp | userId, newLevel | progression-service |
| AchievementUnlocked | userId, achievementId | progression-service |
| ChallengeCompleted | userId, challengeId | challenge-service |
| GroupLevelUp | groupId, newLevel | group-service |
| MemberJoined | groupId, userId | group-service |
| MemberLeft | groupId, userId | group-service |

---

## Fluxo Principal (Workout Flow)

```
User → POST /workouts
  → workout-service salva treino no banco
  → publica WorkoutRecorded no WorkoutRecordedTopic
    → ProgressionQueue → progression-service
        → adiciona XP, recalcula nível (thresholds do S3)
        → se LevelUp → publica LevelUp no NotificationTopic
        → se AchievementUnlocked → publica AchievementUnlocked no NotificationTopic
        → publica WorkoutRecorded no NotificationTopic (confirmação de processamento)
    → ChallengeQueue → challenge-service
        → atualiza currentProgress das participações ativas
        → se meta atingida → publica ChallengeCompleted no NotificationTopic
    → GroupQueue → group-service
        → incrementa groupScore do membro e groupXp do grupo
        → recalcula groupLevel (thresholds do S3)
        → se GroupLevelUp → publica GroupLevelUp no NotificationTopic
  → NotificationQueue → notification-service
      → persiste Notification no banco
```

---

## Regras de Dados

- Cada serviço possui seu banco exclusivo (sem tabelas compartilhadas)
- Serviços referenciam outros domínios apenas por ID (ex: `userId`)
- Modelo de consistência eventual
- Sem joins cross-service

---

## Infraestrutura Local (Docker Compose)

```
LocalStack → simula SQS, SNS, S3
PostgreSQL → uma instância, múltiplos bancos (auth_db, workout_db, etc.)
Cada serviço → container próprio
```

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Linguagem | Java 21 |
| Framework | Spring Boot 3.x |
| ORM | Spring Data JPA (Hibernate) |
| Banco local | PostgreSQL 15 (Docker) |
| Mensageria | AWS SDK v2 (SQS/SNS) |
| Auth | Spring Security + JWT |
| Build | Maven (pom.xml por serviço) |
| Container | Docker (eclipse-temurin:21-jre-alpine) |

---

## Estrutura de Pastas do Projeto

```
upfit/
└── code/
    └── back/                        ← raiz do backend
        ├── docker-compose.yml       ← orquestra todos os serviços
        ├── memory-bank/             ← documentação viva do projeto
        ├── services/
        │   ├── auth-service/
        │   │   ├── Dockerfile
        │   │   ├── .env.example
        │   │   └── src/
        │   ├── workout-service/
        │   ├── progression-service/
        │   ├── group-service/
        │   ├── challenge-service/
        │   └── notification-service/
        └── infra/
            ├── localstack/          ← setup.sh: filas SQS, tópicos SNS, buckets S3
            ├── nginx/               ← nginx.conf: API Gateway local (porta 8080)
            └── postgres/            ← init.sql: criação dos bancos
```
