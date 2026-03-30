# UpFit – Seu próximo nível fitness

**Guilherme Gomes de Brites**
**Caio Batella**
**Pedro Máximo Campos do Carmo**
**Victor Gabriel Cruz Pereira**
**Rafael de Paiva Gomes**
**Vitor Hugo Dutra Marinho**

---

Professores:

**Prof. Cleiton Silva Tavares – PUC Minas**
**Prof. Cristiano de Macêdo Neto – PUC Minas**
**Prof. João Paulo Aramuni – PUC Minas**

---

_Curso de Engenharia de Software, Campus Lourdes_

_Instituto de Informática e Ciências Exatas – Pontifícia Universidade de Minas Gerais (PUC MINAS), Belo Horizonte – MG – Brasil_

---

_**Resumo**. A alta taxa de abandono de atividades físicas nos primeiros 60 dias é um problema amplamente documentado, impulsionado pela falta de motivação, progressão visível e senso de comunidade. O UpFit é uma plataforma de gamificação social — disponível em versão web e mobile — que transforma a constância nos treinos em uma experiência de RPG da vida real, onde o esforço físico gera XP, evolução de avatar, badges e competições em guildas. O objetivo do trabalho é descrever a arquitetura do sistema UpFit, detalhando suas decisões estruturais, mecanismos de integração e escolhas tecnológicas. A solução adota uma arquitetura de microserviços com backend em Java (Spring Boot), frontend em Next.js, mensageria assíncrona via Amazon SNS/SQS e infraestrutura hospedada na AWS. Como resultado, a arquitetura proposta demonstra escalabilidade horizontal, separação de domínios por serviço e uma camada de engajamento capaz de sustentar o ciclo de retenção do usuário a longo prazo._

---

## SUMÁRIO

1. [Apresentação](1.apresentacao.md#apresentacao "Apresentação") <br />
   1.1. Problema <br />
   1.2. Objetivos do trabalho <br />
   1.3. Definições e Abreviaturas <br />

2. [Nosso Produto](2.nosso_produto.md#produto "Nosso Produto") <br />
   2.1. Visão do Produto <br />
   2.2. Nosso Produto <br />
   2.3. Personas <br />

3. [Requisitos](3.requisitos.md#requisitos "Requisitos") <br />
   3.1. Requisitos Funcionais <br />
   3.2. Requisitos Não-Funcionais <br />
   3.3. Restrições Arquiteturais <br />
   3.4. Mecanismos Arquiteturais <br />

4. [Modelagem](4.modelagem.md#modelagem "Modelagem e projeto arquitetural") <br />
   4.1. Visão de Negócio <br />
   4.2. Visão Lógica <br />
   4.3. Modelo de dados (opcional) <br />

5. [Wireframes](5.wireframe.md#wireframes "Wireframes") <br />

6. [Solução](6.solucao.md#solucao "Projeto da Solução") <br />

7. [Avaliação](7.avaliacao.md#avaliacao "Avaliação da Arquitetura") <br />
   7.1. Cenários <br />
   7.2. Avaliação <br />

[Ferramentas](#ferramentas "Ferramentas")<br />

<a name="ferramentas"></a>

# Ferramentas

_Inclua o URL do repositório (Github, Bitbucket, etc) onde você armazenou o código da sua prova de conceito/protótipo arquitetural da aplicação como anexos. A inclusão da URL desse repositório de código servirá como base para garantir a autenticidade dos trabalhos._

| Ambiente              | Plataforma        | Link de Acesso                |
| --------------------- | ----------------- | ----------------------------- |
| Repositório de código | GitHub            | https://github.com/XXXXXXX    |
| Hospedagem do site    | Heroku            | https://XXXXXXX.herokuapp.com |
| Protótipo Interativo  | MavelApp ou Figma | https://figma.com/XXXXXXX     |
