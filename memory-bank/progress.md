# UpFit — Progress

## Fase 1: Hello World + Pipeline de Eventos ✅ CONCLUÍDA (17/03/2026)

### Infraestrutura
- [x] docker-compose.yml unificado (raiz do projeto)
- [x] PostgreSQL 15 com 5 bancos separados (auth_db, workout_db, progression_db, group_db, challenge_db)
- [x] LocalStack 3 com 4 filas SQS (ProgressionQueue, ChallengeQueue, GroupQueue, NotificationQueue)
- [x] Tópico SNS WorkoutRecordedTopic com subscriptions para as 4 filas
- [x] Rede compartilhada upfit-network
- [x] Healthcheck no postgres e localstack
- [x] restart: on-failure nos serviços

### Serviços (Hello World — GET /health)
- [x] auth-service — porta 8081, auth_db ✅
- [x] workout-service — porta 8082, workout_db ✅
- [x] progression-service — porta 8083, progression_db ✅
- [x] group-service — porta 8084, group_db ✅
- [x] challenge-service — porta 8085, challenge_db ✅
- [x] notification-service — porta 8086, sem banco ✅

### Pipeline de Eventos (End-to-End)
- [x] workout-service: entidades JPA (Workout JOINED, RunningWorkout, StrengthWorkout, ExerciseEntry)
- [x] workout-service: POST /workouts salva no banco e publica WorkoutRecorded no SNS
- [x] progression-service: consome ProgressionQueue via SQS polling e loga o evento
- [x] Pipeline validado end-to-end: POST /workouts → evento chega em progression-service

---

## Fase 2: Auth Service ✅ CONCLUÍDA (17/03/2026)
- [x] POST /auth/register → cria User + Profile no banco
- [x] POST /auth/login → retorna JWT + refreshToken
- [x] POST /auth/refresh → renova JWT
- [x] GET /profile/:userId
- [x] PUT /profile/:userId (incluindo photoUrl vinda do S3 profile-assets)
- [x] Adicionar UserRole (USER/ADMIN) ao User e embutir no JWT (V1__add_user_role.sql)
- [x] JwtAuthFilter — valida Bearer token e popula SecurityContextHolder com role
- [x] POST /auth/admin/promote — endpoint ADMIN-only para promover usuário
- [x] Validado: register → login → token JWT válido
- [ ] GET /profile/upload-url?filename=... → presigned URL para upload no S3 (profile-assets) ← pendente

---

## Fase 3: Workout Completo ✅ CONCLUÍDA (11/04/2026)
- [x] GET /workouts/user/:id com autenticação JWT
- [x] POST /workouts protegido por JWT — userId extraído do token, não aceito no body
- [x] WorkoutResponse retorna campos específicos por tipo (distanceKm/averagePace para RUNNING; primaryMuscleGroup/exercises para STRENGTH)
- [x] workout-service com Spring Security + jjwt (mesmo padrão do auth-service)
- [x] JWT_SECRET adicionado ao docker-compose para workout-service
- [x] Validado: register → login → POST /workouts autenticado → GET /workouts/user/:id

---

## Fase 4: Progression Engine ✅ CONCLUÍDA (11/04/2026)
- [x] POST /achievements/definitions (ADMIN)
- [x] GET /achievements/definitions
- [x] PATCH /achievements/definitions/:id/toggle (ADMIN)
- [x] user-level-thresholds.json carregado do S3 no startup com fallback em memória
- [x] S3Client com pathStyleAccessEnabled(true) para LocalStack
- [x] XP engine: RUNNING = distanceKm × 10 | STRENGTH = durationMin × 1
- [x] Nível recalculado usando thresholds do S3
- [x] Streak atualizado via lastWorkoutDate
- [x] LevelUp publicado no NotificationTopic
- [x] AchievementUnlocked publicado (regras: STREAK_N, VOLUME_N, LEVEL_N)
- [x] WorkoutRecorded republicado no NotificationTopic após processamento
- [x] GET /progression/:userId retorna XP, nível, streak e achievements com title e description
- [x] Validado: POST /workouts → XP atualizado → nível correto → achievements desbloqueados

---

## Fase 5: Groups ✅ CONCLUÍDA (13/04/2026)
- [x] Entidades JPA: Group (tabela `groups`) e GroupMembership (tabela `group_memberships`)
- [x] POST /groups — criador entra automaticamente como OWNER
- [x] PUT /groups/:id — somente OWNER do grupo ou ADMIN da plataforma
- [x] POST /groups/:id/join — cria GroupMembership com role MEMBER, publica MemberJoined
- [x] DELETE /groups/:id/leave — OWNER não pode sair, publica MemberLeft
- [x] GET /groups/upload-url?filename= — presigned URL via S3Presigner (5 min), bucket group-assets
- [x] group-level-thresholds.json carregado do S3 (upfit-config) no startup com fallback em memória
- [x] GroupQueue: WorkoutRecorded → incrementa groupScore do membro e groupXp do grupo
- [x] groupLevel recalculado usando thresholds do S3
- [x] GroupLevelUp publicado no NotificationTopic quando nível sobe
- [x] MemberJoined e MemberLeft publicados no NotificationTopic
- [x] JWT protection idêntica ao progression-service
- [x] docker-compose atualizado com JWT_SECRET, SQS_GROUP_QUEUE_URL, NOTIFICATION_TOPIC_ARN, S3_GROUP_ASSETS_BUCKET, S3_CONFIG_BUCKET
- [x] Entidade JPA: GroupFeedEntry (tabela `group_feed_entries`)
- [x] GroupService.processWorkoutRecorded: salva GroupFeedEntry por grupo ao processar WorkoutRecorded
- [x] POST /groups: valida que userId não é OWNER de outro grupo (409 Conflict)
- [x] GET /groups — lista todos os grupos
- [x] GET /groups/my — grupos que o usuário autenticado participa (userId do JWT)
- [x] GET /groups/:id — detalhes com xpToNextLevel, currentLevelXpRequired, nextLevelXpRequired, progressPercent
- [x] GET /groups/:id/members — lista de membros com groupScore e role
- [x] GET /groups/:id/ranking — membros ordenados por groupScore DESC
- [x] GET /groups/:id/feed — 10 treinos mais recentes (findTop10ByGroupIdOrderByRecordedAtDesc)
- [x] Validado end-to-end: criar grupo → entrar → fazer treino → feed e ranking atualizados

---

## Fase 6: Challenges (ATUAL)
- [ ] POST /challenges
- [ ] POST /challenges/join
- [ ] Consumir ChallengeQueue: atualizar currentProgress das participações ativas do usuário
- [ ] Quando meta atingida → publicar ChallengeCompleted no SNS
- [ ] Validado: criar desafio → participar → fazer treino → progresso atualizado

---

## Fase 7: Notifications (FUTURO)
- [ ] Consumir NotificationQueue (WorkoutRecorded, LevelUp, AchievementUnlocked, ChallengeCompleted)
- [ ] Persistir Notification no banco
- [ ] GET /notifications/:userId
- [ ] Validado: fazer treino → notificação aparece no GET

---

## Fase 8: Cloud (FUTURO)
- [ ] Terraform / CDK para infra AWS
- [ ] EC2 + Docker deploy
- [ ] RDS, SQS, SNS reais
- [ ] CI/CD pipeline
- [ ] CloudWatch logs e alertas

---

## Decisões Técnicas Registradas
| Data | Decisão | Motivo |
|------|---------|--------|
| 17/03 | Deploy: EC2 (não ECS/Fargate) | Simplicidade na fase inicial |
| 17/03 | Stack: Java 21 + Spring Boot 3.3.5 | Decisão do dev |
| 17/03 | ORM: Spring Data JPA (Hibernate) | Decisão do dev |
| 17/03 | Estrutura de pacotes: por camada | Padrão definido no CLAUDE.md |
| 17/03 | Uma instância PostgreSQL, múltiplos bancos | Simplicidade local; RDS por serviço em prod se necessário |
| 17/03 | Herança JPA: JOINED (sem discriminador) | Definido em domainModel.md |
| 17/03 | SQS polling com @Scheduled(fixedDelay=5000) | Simplicidade; sem Spring Cloud AWS |
| 17/03 | Evento WorkoutRecorded: eventType, userId, workoutId, type, durationMin, caloriesBurned | Payload mínimo definido na Fase 1 |
| 17/03 | Filas SQS: Standard (não FIFO) | Eventos de treino são independentes; FIFO seria over-engineering |
| 18/03 | Thresholds de nível: JSON no S3 (upfit-config) | Alteração sem redeploy; uma fonte de verdade; versionamento nativo do S3 |
| 18/03 | Thresholds de usuário e grupo separados | Grupo acumula XP coletivamente — precisa de thresholds maiores |
| 18/03 | Fotos de perfil/grupo: upload direto no S3 | Serviço persiste apenas a URL; cliente faz upload direto |
| 18/03 | Group possui groupXp e groupLevel | XP do grupo vem dos treinos dos membros via GroupQueue |
| 18/03 | Dois tópicos SNS: WorkoutRecordedTopic e NotificationTopic | WorkoutRecordedTopic para processamento de domínio; NotificationTopic exclusivo para notification-service |
| 18/03 | NotificationQueue subscriber apenas do NotificationTopic | Desacopla notification-service de eventos de domínio |
| 18/03 | UserRole: USER e ADMIN | ADMIN cria desafios e definições de conquistas; role embutido no JWT |
| 18/03 | AchievementDefinition: entidade separada cadastrada por ADMIN | progression-service avalia regras ao processar WorkoutRecorded |
