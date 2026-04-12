# UpFit — Active Context

## Estado Atual
**Fase 5: Groups — ATUAL**

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

---

## Fases (Core Domains)

### Fase 3 — Workout Completo ✅ CONCLUÍDA (11/04/2026)

### Fase 4 — Progression Engine ✅ CONCLUÍDA (11/04/2026)

### Fase 5 — Groups (ATUAL)
**Pré-requisito:** Fase 2 concluída (JWT) ✅
**Critério de done:**
- [ ] POST /groups (incluindo imageUrl vinda do S3 group-assets)
- [ ] PUT /groups/:id
- [ ] POST /groups/:id/join
- [ ] DELETE /groups/:id/leave
- [ ] Carregar group-level-thresholds.json do S3 (upfit-config) no startup
- [ ] Consumir GroupQueue: ao receber WorkoutRecorded, incrementar groupScore do membro e groupXp do grupo
- [ ] Recalcular groupLevel usando thresholds do S3
- [ ] Validado: criar grupo → entrar → fazer treino → groupXp atualizado

### Fase 6 — Challenges
**Pré-requisito:** Fase 2 concluída (JWT)
**Critério de done:**
- [ ] POST /challenges
- [ ] POST /challenges/join
- [ ] Consumir ChallengeQueue: ao receber WorkoutRecorded, atualizar currentProgress das participações ativas do usuário
- [ ] Quando meta atingida → publicar ChallengeCompleted no SNS
- [ ] Validado: criar desafio → participar → fazer treino → progresso atualizado

### Fase 7 — Notifications
**Pré-requisito:** Fases 4, 5 e 6 concluídas (eventos LevelUp, ChallengeCompleted)
**Critério de done:**
- [ ] Consumir NotificationQueue (WorkoutRecorded, LevelUp, AchievementUnlocked, ChallengeCompleted)
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
- [x] Evento WorkoutRecorded: payload com eventType, userId, workoutId, type, durationMin, caloriesBurned
- [x] Filas SQS: Standard (não FIFO)
- [x] UserRole: USER (padrão) e ADMIN — role embutido no JWT
- [x] AchievementDefinition: cadastrada por ADMIN, avaliada pelo progression-service ao processar WorkoutRecorded
- [x] Thresholds de nível: JSON no S3 (upfit-config), lidos no startup com fallback em memória
- [x] Thresholds de usuário e grupo são separados — grupo sobe de nível mais devagar
- [x] Fotos de perfil e grupo: upload direto no S3 pelo cliente, serviço persiste apenas a URL

## Contexto de Sessão
```
Última sessão: 11/04/2026
O que foi feito: Fase 4 concluída e validada — Progression Engine completo.
  - AchievementDefinition: POST/GET/PATCH toggle (ADMIN)
  - S3: user-level-thresholds.json carregado no startup com fallback em memória
  - pathStyleAccessEnabled(true) no S3Client para funcionar com LocalStack
  - XP engine: RUNNING = distanceKm × 10, STRENGTH = durationMin × 1
  - Streak rastreado via lastWorkoutDate na entidade Progression
  - LevelUp e AchievementUnlocked publicados no NotificationTopic
  - Regras suportadas: STREAK_N, VOLUME_N, LEVEL_N
  - GET /progression/:userId retorna achievements com title e description via @ManyToOne EAGER
Próxima tarefa: Fase 5 — Groups
  Começar por: POST /groups, PUT /groups/:id, POST /groups/:id/join, DELETE /groups/:id/leave
Bloqueios: Nenhum
```
