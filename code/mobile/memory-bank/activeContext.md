# UpFit Frontend — Active Context

## Estado Atual
**Fase 1: Estrutura do projeto mobile — CONCLUÍDA ✅**
**Fase 2: Auth UI — EM ANDAMENTO 🔄**

## O que já existe no backend
- Auth ✅
- Workout ✅
- Progression ✅
- Groups ✅
- Challenges ✅
- Notifications ✅

---

## Stack Definida

### Mobile (prioridade)
| Camada | Tecnologia |
|--------|-----------|
| Framework | React Native (Expo ~52) |
| Navegação | Expo Router ~4 |
| Estilização | NativeWind 4.x + StyleSheet híbrido |
| Estado | Zustand |
| HTTP | Axios |
| Linguagem | TypeScript |

### Web (após mobile)
| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js |
| Estilização | TailwindCSS |
| Estado | Zustand |
| HTTP | Axios |

---

## Fase 2 — Auth UI
**Critério de done:**
- [x] Tela de login (estética cyberpunk dark, integração real com API)
- [x] Tela de cadastro (com login automático pós-cadastro)
- [x] Persistência de sessão (SecureStore)
- [x] Refresh token automático via interceptor Axios
- [x] Splash screen (`app/index.tsx`) com redirect por estado de auth
- [ ] Tela de perfil (`app/profile.tsx`)
- [ ] Upload de foto com presigned URL (`GET /profile/upload-url`)

## Fase 3 — Core UX
- [ ] Home/dashboard com XP, nível e streak (`GET /progression/:userId`)
- [ ] Registro de treino de corrida (`POST /workouts`)
- [ ] Registro de treino de musculação (`POST /workouts`)
- [ ] Histórico de treinos (`GET /workouts/user/:id`)
- [ ] Tela de progressão com conquistas (`GET /progression/:userId`)

## Fase 4 — Social
- [ ] Listagem de grupos / meus grupos
- [ ] Criar grupo
- [ ] Entrar/sair de grupo
- [ ] Tela de detalhes do grupo
- [ ] Ranking
- [ ] Feed

## Fase 5 — Challenges
- [ ] Listagem com filtros
- [ ] Detalhe com progresso
- [ ] Participar/desistir
- [ ] Criar desafio (ADMIN)

## Fase 6 — Notifications
- [ ] Lista de notificações
- [ ] Marcar como lida / marcar todas

## Fase 7 — Web (Next.js)
- [ ] A definir após mobile concluído

---

## Decisões Tomadas
- [x] Mobile first
- [x] Expo Router v4 — rota raiz `app/index.tsx` obrigatória
- [x] NativeWind + StyleSheet híbrido (StyleSheet para elementos críticos)
- [x] Navegação pós-login explícita no handler (não apenas guard do layout)
- [x] Guard do `_layout.tsx` apenas para logout/expiração de sessão
- [x] `buildUser()` combina resposta da API + payload JWT para montar `AuthUser`

---

## Contexto de Sessão
```
Última sessão: 15/04/2026
O que foi feito:
  - Telas de login e cadastro implementadas com estética cyberpunk dark
  - Integração real com POST /auth/login e POST /auth/register
  - AuthResponse atualizado para refletir contrato real da API
    (campos na raiz: accessToken, refreshToken, userId, name, email)
  - buildUser() e buildUserFromJwt() para montar AuthUser corretamente
  - app/index.tsx com <Redirect> para dispatch de auth inicial
  - Guard do _layout.tsx simplificado — só protege logout/expiração
  - isLoading check no guard para evitar race condition pós-login
  - StyleSheet adicionado como fallback nos elementos críticos
  - Assets placeholder criados (assets/images/)
  - newArchEnabled: true no app.json
  - Botão de logout temporário no home.tsx

Próxima tarefa:
  Finalizar Fase 2 — Tela de perfil com:
  - Exibir dados do usuário (GET /profile/:userId)
  - Editar bio, peso, altura, objetivo, nível de experiência (PUT /profile/:userId)
  - Upload de foto (GET /profile/upload-url → PUT S3 → PUT /profile/:userId)

Bloqueios: Nenhum
```
