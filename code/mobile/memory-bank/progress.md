# UpFit Frontend — Progress

## Fase 0 — Descoberta e Base ✅
- [x] Consolidar contexto do backend
- [x] Levantar endpoints disponíveis
- [x] Definir necessidade de memory bank específico para frontend
- [x] Criar primeira versão dos arquivos de memória do frontend
- [x] Definir stack mobile: Expo + Expo Router + NativeWind + Zustand + Axios
- [x] Definir stack web: Next.js + TailwindCSS + Zustand + Axios
- [x] Definir ordem: mobile primeiro, web depois

## Fase 1 — Estrutura do projeto mobile ✅
- [x] Projeto Expo criado com TypeScript
- [x] Expo Router configurado
- [x] NativeWind configurado
- [x] Axios configurado com base URL e interceptors JWT
- [x] Zustand configurado
- [x] Estrutura de pastas por feature criada
- [x] Variáveis de ambiente configuradas (.env)
- [x] Fluxo de autenticação base (login, register, refresh token, persistência)

## Fase 2 — Auth UI (EM ANDAMENTO)
- [x] Tela de login — estética cyberpunk dark, integração POST /auth/login
- [x] Tela de cadastro — integração POST /auth/register com login automático
- [x] Persistência de sessão (SecureStore)
- [x] Refresh token automático via interceptor Axios
- [x] Splash screen de carregamento com redirect por estado de auth
- [ ] Tela de perfil
- [ ] Upload de foto com presigned URL

## Fase 3 — Core UX
- [ ] Home/dashboard com XP, nível e streak
- [ ] Registro de treino de corrida
- [ ] Registro de treino de musculação
- [ ] Histórico de treinos
- [ ] Tela de progressão com conquistas

## Fase 4 — Social
- [ ] Listagem de grupos
- [ ] Criar grupo
- [ ] Entrar/sair de grupo
- [ ] Tela de detalhes do grupo
- [ ] Ranking
- [ ] Feed

## Fase 5 — Challenges
- [ ] Listagem de desafios (filtros por tipo e participação)
- [ ] Detalhe de desafio com progresso
- [ ] Participar/desistir
- [ ] Tela administrativa para criar desafio (ADMIN)

## Fase 6 — Notifications
- [ ] Lista de notificações
- [ ] Marcar como lida
- [ ] Marcar todas como lidas

## Fase 7 — Web (Next.js)
- [ ] A definir após mobile concluído

## Decisões Técnicas Registradas
| Data | Decisão | Motivo |
|------|---------|--------|
| 14/04 | Mobile first (Expo + Expo Router) | Experiência principal do usuário |
| 14/04 | NativeWind para estilização | Produtividade com Tailwind no mobile |
| 14/04 | Zustand para estado | Simples e leve para o escopo do projeto |
| 14/04 | Axios para HTTP | Facilidade com interceptors para JWT |
| 14/04 | Expo SecureStore para tokens | Armazenamento criptografado no device |
| 14/04 | URL base única por ambiente | Nginx local / API Gateway em produção |
| 14/04 | Web com Next.js (fase futura) | Dashboard / visão expandida após mobile |
| 14/04 | Telas implementadas conforme protótipos do dev | Fidelidade ao design definido |
| 15/04 | StyleSheet + NativeWind híbrido | StyleSheet garante render sem cache; NativeWind complementa |
| 15/04 | Navegação explícita pós-login | `router.replace` no handler evita race condition com guard do layout |
| 15/04 | `app/index.tsx` com `<Redirect>` | Rota raiz obrigatória no Expo Router v4; despacha por estado de auth |
