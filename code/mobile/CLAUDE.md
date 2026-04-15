# CLAUDE.md — UpFit Frontend Project Rules

## Objetivo
Este conjunto de regras define como agentes de IA devem atuar no frontend do UpFit.

## Leia Sempre Primeiro
Ao iniciar qualquer sessão neste projeto frontend, leia os arquivos na seguinte ordem:
1. `memory-bank/projectbrief.md`
2. `memory-bank/activeContext.md`
3. `memory-bank/systemPatterns.md`
4. `memory-bank/techContext.md`
5. `memory-bank/apiContracts.md`  ← nunca inventar endpoints, sempre consultar este arquivo

## Stack — Decisão Tomada

### Mobile (prioridade)
```
Framework:   Expo (React Native)
Navegação:   Expo Router
Estilização: NativeWind (Tailwind)
Estado:      Zustand
HTTP:        Axios
Tokens:      Expo SecureStore
Linguagem:   TypeScript
```

### Web (fase futura)
```
Framework:   Next.js
Estilização: TailwindCSS
Estado:      Zustand
HTTP:        Axios
Linguagem:   TypeScript
```

**Nunca sugira outra stack sem aprovação explícita.**

## Regras Gerais

### Sempre faça
- Ler `apiContracts.md` antes de qualquer integração com backend
- Usar a base URL via variável de ambiente — nunca hardcodar
- Tratar autenticação via JWT + refresh token em camada central
- Separar claramente camadas de UI, estado e acesso à API
- Reutilizar componentes visuais
- Atualizar `memory-bank/activeContext.md` ao final de cada sessão
- Atualizar `memory-bank/progress.md` quando algo for concluído
- Implementar estados de loading, empty state e erro

### Nunca faça sem perguntar
- Inventar endpoint que não exista no `apiContracts.md`
- Alterar contrato de API
- Acoplar tela diretamente a fetch/axios sem camada de serviço
- Misturar regras de negócio pesadas dentro de componentes visuais
- Armazenar tokens em AsyncStorage — usar sempre SecureStore

## Regras de Arquitetura

### Fluxo correto
```
UI → feature/state (Zustand) → service (Axios) → backend
```

### Fluxo incorreto
```
UI → chamada HTTP direta espalhada em vários componentes
```

## Estrutura de Pastas Mobile

```
mobile/
├── app/                    ← Expo Router (screens)
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/
│   │   ├── home.tsx
│   │   ├── workouts.tsx
│   │   ├── groups.tsx
│   │   ├── challenges.tsx
│   │   └── notifications.tsx
│   └── profile.tsx
├── features/               ← lógica por domínio
│   ├── auth/
│   ├── workout/
│   ├── progression/
│   ├── groups/
│   ├── challenges/
│   └── notifications/
├── shared/
│   ├── api/                ← Axios client + interceptors
│   ├── auth/               ← token storage, refresh
│   ├── components/         ← componentes reutilizáveis
│   ├── types/              ← DTOs e enums
│   └── config/             ← variáveis de ambiente
└── memory-bank/
```

## Convenções
- Pastas: kebab-case
- Componentes: PascalCase
- Hooks: camelCase com prefixo `use`
- Serviços: `<feature>.service.ts`
- Tipos/DTOs: PascalCase
- Telas: `<FeatureName>Screen.tsx`

## Regras de UI
- Mobile é a experiência principal
- Implementar sempre conforme protótipo enviado pelo dev
- Gamificação deve ser visível: XP, nível, streak, conquistas
- Social deve ser visível: grupos, ranking, feed, desafios
- Feedback visual para ações importantes (treino salvo, nível subiu, etc.)
- Nunca pular estados de loading, empty state e erro

## Upload de imagens
```
1. Chamar GET /*/upload-url?filename=
2. Receber { presignedUrl, objectUrl }
3. Fazer PUT direto no S3 com presignedUrl
4. Enviar objectUrl no endpoint de negócio
```

## Telas condicionadas por role
- Telas e ações ADMIN verificam `role` extraído do JWT
- Nunca esconder apenas via UI — validação real está no backend

## Ao encontrar ambiguidade
1. Liste 2 ou 3 opções com prós e contras
2. Peça decisão antes de implementar
3. NÃO assuma e implemente
