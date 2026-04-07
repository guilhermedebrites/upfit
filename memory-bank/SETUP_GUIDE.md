# Como usar o Memory Bank com Claude Code

## Estrutura de arquivos gerada

```
memory-bank/
├── CLAUDE.md          ← REGRAS — lido automaticamente pelo Claude Code
├── projectbrief.md    ← O que é o projeto, fase atual, visão de deploy
├── productContext.md  ← Produto, fluxos, gamificação
├── systemPatterns.md  ← Arquitetura, microserviços, eventos, pastas
├── techContext.md     ← Infraestrutura, portas, contratos de API
├── activeContext.md   ← Estado atual, próximo passo, decisões pendentes
└── progress.md        ← Checklist de fases e decisões registradas
```

---

## Passos para começar com Claude Code

### 1. Crie a estrutura do projeto
```bash
mkdir upfit && cd upfit
mkdir -p memory-bank services/auth-service services/workout-service \
  services/progression-service services/group-service \
  services/challenge-service services/notification-service infra/localstack
```

### 2. Copie os arquivos do memory bank
Coloque todos os arquivos `.md` gerados dentro de `memory-bank/`

### 3. Coloque o CLAUDE.md na raiz do projeto
```bash
cp memory-bank/CLAUDE.md ./CLAUDE.md
```
> O Claude Code lê automaticamente o `CLAUDE.md` da raiz em toda sessão.

### 4. Inicie o Claude Code
```bash
claude
```

### 5. Primeiro prompt sugerido
```
Leia os arquivos memory-bank/projectbrief.md, memory-bank/activeContext.md 
e memory-bank/systemPatterns.md.

Depois me ajude a implementar o hello world do auth-service: Spring Boot 3.x, 
Java 21, Maven, seguindo exatamente a estrutura definida no CLAUDE.md.
```

---

## Rotina de sessão recomendada

### Ao iniciar
```
"Leia o memory-bank/activeContext.md e me diga o que estava sendo feito"
```

### Ao terminar
```
"Atualize o memory-bank/activeContext.md com o que fizemos hoje e o próximo passo"
"Atualize o memory-bank/progress.md marcando o que foi concluído"
```

---

## Dicas anti-alucinação

1. **Seja específico com contexto:** Antes de pedir implementação, mencione qual arquivo do memory-bank é relevante
2. **Reforce restrições arquiteturais:** "Lembre que serviços não se comunicam via HTTP, apenas via SQS"
3. **Valide antes de prosseguir:** Peça para o Claude repetir a decisão antes de implementar
4. **Atualize o activeContext.md** ao final de cada sessão — é o "estado da memória"
5. **Documente decisões** no progress.md imediatamente ao tomar

---

## Quando o Claude "alucinar" arquitetura

Se o Claude sugerir algo fora dos padrões (ex: chamar serviço via HTTP):
```
"Isso vai contra as regras do CLAUDE.md — serviços só se comunicam via SQS. 
Reescreva usando o padrão de eventos do systemPatterns.md"
```
