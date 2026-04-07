# UpFit — Active Context

## Estado Atual
**Fase 3: Workout Completo — ATUAL**

### Concluído (Fase 1)
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

---

## Fases (Core Domains)

### Fase 3 — Workout Completo (ATUAL)
**Pré-requisito:** Fase 2 concluída (JWT necessário)
**Critério de done:**
- [ ] GET /workouts/user/:id com autenticação JWT
- [ ] POST /workouts aceita RunningWorkout e StrengthWorkout corretamente
- [ ] Validado: register → login → POST /workouts autenticado → GET /workouts

### Fase 4 — Progression Engine
**Pré-requisito:** Fase 3 concluída
**Critério de done:**
- [ ] Carregar user-level-thresholds.json do S3 (upfit-config) no startup
- [ ] XP engine: processar WorkoutRecorded e atualizar Progression no banco
- [ ] Recalcular nível usando thresholds do S3
- [ ] Lógica de level up → publicar LevelUp no SNS
- [ ] Lógica de streak
- [ ] GET /progression/:userId
- [ ] Validado: fazer treino → XP atualizado → nível correto

### Fase 5 — Groups
**Pré-requisito:** Fase 2 concluída (JWT)
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
Última sessão: 17/03/2026
O que foi feito: Fase 2 concluída — auth-service completo com UserRole, JWT, refresh token, profile CRUD e endpoint de promoção de admin
Próxima tarefa: Fase 3 — workout-service com autenticação JWT
Bloqueios: Nenhum
```
