# UpFit Frontend — System Patterns

## Arquitetura de frontend
Separar frontend em:
- apresentação (UI)
- estado/feature
- integração com API
- tipos/contratos
- design system

## Padrão recomendado por feature
```txt
<feature>/
├── components/
├── screens/
├── hooks/
├── services/
├── types/
└── utils/
```

## Features principais
- auth
- profile
- workouts
- progression
- groups
- challenges
- notifications
- home

## Shared
```txt
shared/
├── api/
├── auth/
├── components/
├── design-system/
├── config/
├── types/
└── utils/
```

## API client
Criar um client central que:
- injeta base URL
- envia Authorization Bearer token quando necessário
- faz refresh token em caso de 401 controlado
- centraliza parse de erro

## Estado
Separar:
- estado remoto (requests, cache, loading, erro)
- estado local de UI (modal, aba ativa, formulário)

## Navegação sugerida — mobile
- Home
- Workouts
- Groups
- Challenges
- Notifications
- Profile

## Navegação sugerida — web
- Dashboard
- Workouts
- Progression
- Groups
- Challenges
- Notifications
- Profile/Admin

## Componentes reutilizáveis importantes
- XPProgressBar
- LevelBadge
- StreakCard
- WorkoutCard
- AchievementCard
- GroupCard
- GroupRankingList
- GroupFeedList
- ChallengeCard
- NotificationListItem
- EmptyState
- ErrorState
- LoadingSkeleton

## Regras de integração
- Não inferir regras de negócio no frontend se o backend já retorna cálculo
- Exibir valores calculados pelo backend sempre que possível
- Frontend pode calcular apenas apresentação, como porcentagem visual quando o backend já fornece dados base

## Upload de imagens
Fluxo padrão:
1. Pedir presigned URL ao backend
2. Fazer PUT direto no S3
3. Persistir objectUrl no backend

## Segurança
- Nunca armazenar segredo real no app
- JWT e refresh token em camada de auth central
- Rotas/telas administrativas condicionadas à role ADMIN do token
