# UpFit – Seu próximo nível fitness

O **UpFit** é uma plataforma digital voltada para o acompanhamento e evolução de atividades físicas, permitindo que usuários registrem treinos, acompanhem seu progresso e participem de desafios e grupos dentro de uma comunidade fitness. A proposta do sistema é unir **monitoramento de performance, motivação coletiva e gamificação**, incentivando a consistência nos treinos e a evolução pessoal ao longo do tempo.

A aplicação busca proporcionar uma experiência moderna de acompanhamento fitness, oferecendo funcionalidades como registro de atividades, análise de progresso, desafios entre usuários, conquistas e interação social. Dessa forma, o UpFit transforma o processo de treinamento físico em uma experiência mais motivadora, organizada e orientada a resultados.

---

# Integrantes

* **Guilherme Gomes de Brites**
* **Caio Batella**
* **Pedro Máximo Campos do Carmo**
* **Victor Gabriel Cruz Pereira**
* **Rafael de Paiva Gomes**
* **Vitor Hugo Dutra Marinho**

---

# Orientadores

* **Prof. Cleiton Silva Tavares – PUC Minas**
* **Prof. Cristiano de Macêdo Neto – PUC Minas**
* **Prof. João Paulo Aramuni – PUC Minas**

---

# Tecnologias Utilizadas

O projeto UpFit utiliza uma arquitetura moderna baseada em **microserviços**, com integração entre diferentes tecnologias e serviços em nuvem.

Principais tecnologias e ferramentas utilizadas:

- **Frontend Web:** React.js  
- **Mobile:** Flutter  
- **Backend:** Java + Spring Boot  
- **Arquitetura:** Microservices  
- **Infraestrutura:** AWS  
- **API Gateway:** Amazon API Gateway  
- **Mensageria:** Amazon SNS e Amazon SQS  
- **Banco de Dados:** Amazon RDS (PostgreSQL)  
- **Armazenamento:** Amazon S3  
- **Observabilidade:** Amazon CloudWatch  
- **Hospedagem Web:** AWS Amplify  
- **DNS:** Amazon Route 53  

---

# Arquitetura do Sistema

A arquitetura do UpFit é baseada em **microserviços orientados a eventos**, permitindo maior escalabilidade, desacoplamento entre serviços e facilidade de evolução do sistema.

Entre os principais serviços da aplicação estão:

- **Auth Service** – responsável pela autenticação e gerenciamento de usuários  
- **Workout Service** – responsável pelo registro e gerenciamento de treinos  
- **Group Service** – responsável pela gestão de grupos e comunidades  
- **Challenge Service** – responsável pela criação e controle de desafios  
- **Progression Service** – responsável pelo cálculo de progresso dos usuários  
- **Notification Service** – responsável pelo envio de notificações  

A comunicação entre serviços ocorre tanto de forma **síncrona (REST APIs)** quanto **assíncrona (eventos via SNS/SQS)**.

---

# Instruções de Utilização

As instruções completas de execução da aplicação serão disponibilizadas assim que a primeira versão funcional do sistema estiver concluída.

De forma geral, o sistema será composto por três aplicações principais:

- **Aplicação Web** (React.js)
- **Aplicação Mobile** (Flutter)
- **Backend em Microserviços** (Spring Boot)

Para executar o sistema localmente será necessário:

1. Instalar as dependências do ambiente de desenvolvimento (React.js, Java, Flutter, Docker, entre outros).
2. Configurar as variáveis de ambiente necessárias para comunicação com os serviços.
3. Executar os microserviços do backend.
4. Iniciar a aplicação web e/ou mobile.

As instruções detalhadas de instalação e execução serão adicionadas nas próximas versões do projeto.

---

# Licença

Este projeto está licenciado sob a licença **CC-BY-4.0**.