# UpFit — Active Context

## Estado Atual
**Fase 7: Notifications — ATUAL**

### Concluído (Fase 1) ✅ 17/03/2026
- ✅ Todos os 6 serviços respondem GET /health
- ✅ docker-compose up sobe tudo sem erro
- ✅ PostgreSQL com 5 bancos separados
- ✅ LocalStack com filas SQS + tópico SNS configurados
- ✅ workout-service: POST /workouts salva no banco e publica WorkoutRecorded no SNS
- ✅ progression-service: consome ProgressionQueue e loga o evento
- ✅ Pipeline end-to-end validado

### Concluído (Fase 2) ✅ 17/03/2026
- ✅ POST /auth/register → cria User + Profile no banco
- ✅ POST /auth/login → retorna JWT + refreshToken
- ✅ POST /auth/refresh → renova JWT
- ✅ GET /profile/:userId
- ✅ PUT /profile/:userId (incluindo photoUrl vinda do S3 profile-assets)
- ✅ UserRole (USER/ADMIN) adicionado ao User e embutido no JWT (V1__add_user_role.sql)
- ✅ JwtAuthFilter — valida Bearer token e popula SecurityContextHolder com role
- ✅ POST /auth/admin/promote — endpoint ADMIN-only para promover usuário
- ✅ Validado end-to-end: register → login → token JWT válido

### Concluído (Fase 3) ✅ 11/04/2026
- ✅ GET /workouts/user/:id com autenticação JWT
- ✅ POST /workouts protegido por JWT (userId extraído do token, não do body)
- ✅ WorkoutResponse tipado: campos específicos por tipo (RUNNING / STRENGTH)
- ✅ workout-service com Spring Security + jjwt
- ✅ JWT_SECRET adicionado ao docker-compose do workout-service
- ✅ Validado: register → login → POST /workouts → GET /workouts/user/:id

### Concluído (Fase 4) ✅ 11/04/2026
- ✅ POST /achievements/definitions (ADMIN)
- ✅ GET /achievements/definitions
- ✅ PATCH /achievements/definitions/:id/toggle (ADMIN)
- ✅ user-level-thresholds.json carregado do S3 no startup com fallback em memória
- ✅ XP engine: processa WorkoutRecorded e atualiza Progression no banco
- ✅ Nível recalculado usando thresholds do S3
- ✅ Streak atualizado (lastWorkoutDate rastreado na entidade)
- ✅ LevelUp publicado no NotificationTopic
- ✅ AchievementUnlocked publicado quando regra atingida (STREAK_N, VOLUME_N, LEVEL_N)
- ✅ GET /progression/:userId retorna XP, nível, streak e achievements com title e description

### Concluído (Fase 5) ✅ 13/04/2026
- ✅ Entidades JPA: Group, GroupMembership, GroupFeedEntry
- ✅ POST /groups — criador entra automaticamente como OWNER; valida OWNER único por usuário
- ✅ PUT /groups/:id — somente OWNER do grupo ou ADMIN da plataforma
- ✅ POST /groups/:id/join — cria GroupMembership com role MEMBER, publica MemberJoined
- ✅ DELETE /groups/:id/leave — OWNER não pode sair, publica MemberLeft
- ✅ GET /groups/upload-url?filename= — presigned URL via S3Presigner (5 min), bucket group-assets
- ✅ GET /groups — lista todos os grupos
- ✅ GET /groups/my — grupos que o usuário participa (userId do JWT)
- ✅ GET /groups/:id — detalhes com xpToNextLevel, currentLevelXpRequired, nextLevelXpRequired, progressPercent
- ✅ GET /groups/:id/members — lista de membros com groupScore e role
- ✅ GET /groups/:id/ranking — membros ordenados por groupScore DESC
- ✅ GET /groups/:id/feed — 10 treinos mais recentes (findTop10ByGroupIdOrderByRecordedAtDesc)
- ✅ group-level-thresholds.json carregado do S3 (upfit-config) no startup com fallback em memória
- ✅ GroupQueue: WorkoutRecorded → incrementa groupScore + groupXp, recalcula groupLevel, salva GroupFeedEntry
- ✅ GroupLevelUp, MemberJoined e MemberLeft publicados no NotificationTopic
- ✅ JWT protection: mesmo padrão JwtProperties/JwtService/JwtAuthFilter/SecurityConfig
- ✅ S3Client e S3Presigner com pathStyleAccessEnabled(true) para LocalStack
- ✅ docker-compose.yml atualizado: JWT_SECRET, SQS_GROUP_QUEUE_URL, NOTIFICATION_TOPIC_ARN, S3_GROUP_ASSETS_BUCKET, S3_CONFIG_BUCKET
- ✅ Validado end-to-end: criar grupo → entrar → fazer treino → feed e ranking atualizados

### Concluído (Fase 6) ✅ 14/04/2026
- ✅ Entidades JPA: Challenge (type, requiredLevel, coverImageUrl, goalTarget) e ChallengeParticipation
- ✅ POST /challenges (ADMIN) — cria desafio com type, requiredLevel, coverImageUrl, goalTarget
- ✅ GET /challenges — lista desafios ativos com filtros opcionais:
  - ?type=GLOBAL|DAILY|WEEKLY filtra por tipo
  - ?participating=true retorna desafios que o usuário participa + myParticipation embutido por item
  - ?participating=false retorna desafios que o usuário NÃO participa
  - params combinados: ?type=GLOBAL&participating=true
- ✅ GET /challenges/:id — detalhes + myParticipation embutido (currentProgress, completed, progressPercent)
- ✅ POST /challenges/:id/join — valida requiredLevel contra userLevel recebido no body
- ✅ DELETE /challenges/:id/leave — somente se completed = false
- ✅ GET /challenges/upload-url?filename= — presigned URL para challenge-assets (ADMIN)
- ✅ @Scheduled diário (0 0 0 * * *): expirar desafios com endDate < hoje e status = ACTIVE → EXPIRED
- ✅ ChallengeQueue: WorkoutRecorded → atualiza currentProgress das participações ativas
- ✅ Quando meta atingida → publica ChallengeCompleted no NotificationTopic
- ✅ Bucket challenge-assets criado no LocalStack (setup.sh)
- ✅ Validado end-to-end: criar desafio → participar → fazer treino → progresso atualizado

---

## Fases (Core Domains)

### Fase 3 — Workout Completo ✅ CONCLUÍDA (11/04/2026)

### Fase 4 — Progression Engine ✅ CONCLUÍDA (11/04/2026)

### Fase 5 — Groups ✅ CONCLUÍDA (13/04/2026)

### Fase 6 — Challenges ✅ CONCLUÍDA (14/04/2026)

### Fase 7 — Notifications
**Pré-requisito:** Fases 4, 5 e 6 concluídas (eventos LevelUp, ChallengeCompleted)
**Critério de done:**
- [ ] Consumir NotificationQueue (WorkoutRecorded, LevelUp, AchievementUnlocked, ChallengeCompleted, GroupLevelUp, MemberJoined, MemberLeft)
- [ ] Persistir Notification no banco
- [ ] GET /notifications/:userId
- [ ] Validado: fazer treino → notificação aparece no GET

---

## Decisões Tomadas
- [x] Stack: Java 21 + Spring Boot 3.3.5
- [x] ORM: Spring Data JPA (Hibernate)
- [x] Estrutura de pacotes: por camada
- [x] Herança JPA: JOINED (Workout abstrata)
- [x] SQS polling: @Scheduled sem Spring Cloud AWS
- [x] Evento WorkoutRecorded: payload com eventType, userId, workoutId, type, durationMin, caloriesBurned, distanceKm
- [x] Filas SQS: Standard (não FIFO)
- [x] UserRole: USER (padrão) e ADMIN — role embutido no JWT
- [x] AchievementDefinition: cadastrada por ADMIN, avaliada pelo progression-service ao processar WorkoutRecorded
- [x] Thresholds de nível: JSON no S3 (upfit-config), lidos no startup com fallback em memória
- [x] Thresholds de usuário e grupo são separados — grupo sobe de nível mais devagar
- [x] Fotos de perfil e grupo: upload direto no S3 pelo cliente, serviço persiste apenas a URL
- [x] XP do grupo: RUNNING = distanceKm × 10, STRENGTH = durationMin (mesma fórmula do usuário)
- [x] OWNER do grupo não pode sair — transferência de ownership não implementada
- [x] PUT /groups/:id — autorização híbrida: OWNER (verificado no banco) ou ADMIN (verificado no JWT)

## Contexto de Sessão
```
Última sessão: 14/04/2026
O que foi feito: Fase 6 — challenge-service concluído e validado.
  - GET /challenges atualizado: filtros ?type e ?participating=true|false combinados
  - participating=true retorna myParticipation embutido em cada item da lista
  - Retorno da listagem alterado para List<ChallengeDetailResponse> (consistente com GET /:id)
  - Validado end-to-end: criar desafio → participar → fazer treino → progresso atualizado
Próxima tarefa: Fase 7 — Notifications
  Começar por: notification-service (consumir NotificationQueue, persistir Notification, GET /notifications/:userId)
Bloqueios: Nenhum
```
