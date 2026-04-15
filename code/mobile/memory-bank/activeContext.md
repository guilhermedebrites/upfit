# UpFit Frontend — Active Context

## Estado Atual
**Fase 1: Estrutura do projeto mobile — CONCLUÍDA ✅**
**Fase 2: Auth UI — A iniciar**

## O que já existe no backend
- Auth ✅
- Workout ✅
- Progression ✅
- Groups ✅
- Challenges ✅
- Notifications ✅
- Cloud: pendente

## Stack Definida

### Mobile (prioridade)
| Camada | Tecnologia |
|--------|-----------|
| Framework | React Native (Expo) |
| Navegação | Expo Router |
| Estilização | NativeWind (Tailwind) |
| Estado remoto | Zustand |
| HTTP client | Axios |
| Linguagem | TypeScript |

### Web (após mobile)
| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js |
| Estilização | TailwindCSS |
| Estado remoto | Zustand |
| HTTP client | Axios |
| Linguagem | TypeScript |

## Ordem de implementação
1. **Mobile primeiro** — experiência principal do usuário
2. **Web depois** — dashboard / visão expandida

## Fase 1 — Estrutura do projeto mobile
**Critério de done:**
- [x] Projeto Expo criado com TypeScript
- [x] Expo Router configurado
- [x] NativeWind configurado
- [x] Axios configurado com base URL e interceptors JWT
- [x] Zustand configurado
- [x] Estrutura de pastas por feature criada
- [x] Variáveis de ambiente configuradas (.env)
- [x] Fluxo de autenticação base (login, register, refresh token, persistência)

## Fase 2 — Auth UI
**Critério de done:**
- [ ] Tela de login
- [ ] Tela de cadastro
- [ ] Persistência de sessão (SecureStore)
- [ ] Refresh token automático via interceptor Axios
- [ ] Tela de perfil
- [ ] Upload de foto com presigned URL

## Fase 3 — Core UX
**Critério de done:**
- [ ] Home/dashboard com XP, nível e streak
- [ ] Registro de treino de corrida
- [ ] Registro de treino de musculação
- [ ] Histórico de treinos
- [ ] Tela de progressão com conquistas

## Fase 4 — Social
**Critério de done:**
- [ ] Listagem de grupos
- [ ] Criar grupo
- [ ] Entrar/sair de grupo
- [ ] Tela de detalhes do grupo
- [ ] Ranking
- [ ] Feed

## Fase 5 — Challenges
**Critério de done:**
- [ ] Listagem de desafios (filtros por tipo e participação)
- [ ] Detalhe de desafio com progresso
- [ ] Participar/desistir
- [ ] Tela administrativa para criar desafio (ADMIN)

## Fase 6 — Notifications
**Critério de done:**
- [ ] Lista de notificações
- [ ] Marcar como lida
- [ ] Marcar todas como lidas

## Fase 7 — Web (Next.js)
- [ ] A definir após mobile concluído

## Decisões Tomadas
- [x] Mobile first — React Native com Expo
- [x] Web depois — Next.js
- [x] Expo Router para navegação
- [x] NativeWind para estilização
- [x] Zustand para estado
- [x] Axios para HTTP com interceptors JWT
- [x] URL base única por ambiente (Nginx local / API Gateway produção)
- [x] Telas implementadas conforme protótipos enviados pelo dev

## Contexto de Sessão
```
Última sessão: 14/04/2026
O que foi feito: Fase 1 concluída — projeto Expo scaffoldado com TypeScript,
  Expo Router, NativeWind, Axios+JWT interceptors, Zustand, SecureStore,
  estrutura de pastas por feature, todos os serviços base criados.
Próxima tarefa: Fase 2 — Auth UI (telas de login, cadastro, perfil, upload de foto)
Bloqueios: Nenhum
```
