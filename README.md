# Tato Streaming - Backend

API REST do ecossistema Tato Streaming, construída com NestJS + Prisma + PostgreSQL.

## Visão Geral

Este repositório concentra autenticação, usuários e CRUD de mídias.

Relações no workspace:
- `../front/tatoStreaming-front`: cliente web que consome esta API.
- `../shared`: contratos de entrada/saída compartilhados.

## Stack

- NestJS 11
- Prisma
- PostgreSQL
- JWT (access token + refresh token)
- Zod (validação de DTOs)

## Mapa de Implementação (status real)

### Fase 1 - Fundação da API

- Concluído: bootstrap Nest com CORS e prefixo global `/api`.
- Concluído: arquitetura modular (`AuthModule`, `MediaModule`, `UsersModule`, `PrismaModule`).
- Concluído: Prisma global injetado para acesso ao banco.

### Fase 2 - Autenticação

- Concluído: `POST /api/auth/register`.
- Concluído: `POST /api/auth/login`.
- Concluído: `POST /api/auth/refresh`.
- Concluído: `GET /api/auth/me` protegido por JWT.
- Concluído: hash de senha com `bcryptjs`.
- Concluído: hash do refresh token salvo no usuário.
- Parcial: não existe endpoint dedicado de logout/revogação explícita.

### Fase 3 - Mídias

- Concluído: `GET /api/media` e `GET /api/media/:id`.
- Concluído: `POST /api/media`, `PATCH /api/media/:id`, `DELETE /api/media/:id` com `JwtAuthGuard`.
- Concluído: autorização por dono do recurso em update/delete (`createdById`).
- Concluído: mapeamento Prisma -> contrato compartilhado (`Media`).

### Fase 4 - Contratos e validação

- Concluído: uso dos schemas compartilhados do pacote `@tato-streaming/shared`.
- Concluído: `ZodValidationPipe` para body/params nos endpoints.
- Concluído: DTOs tipados com reexport de tipos do shared.

### Fase 5 - Qualidade

- Parcial: estrutura de testes está presente (Jest unit + e2e).
- Pendente: testes de domínio de auth/media ainda não cobrem fluxos reais (arquivos atuais são boilerplate de `Hello World`).

## Endpoints principais

Base local:

```text
http://localhost:3000/api
```

Rotas:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `GET /api/media`
- `GET /api/media/:id`
- `POST /api/media`
- `PATCH /api/media/:id`
- `DELETE /api/media/:id`

## Requisitos

- Node.js 20+
- npm 10+
- PostgreSQL disponível

## Setup Local

### 1) Build do pacote shared

```bash
cd ../shared
npm install
npm run build
```

### 2) Instalar dependências do backend

```bash
cd ../back/tatoStreaming-back
npm install
```

### 3) Configurar ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

PowerShell:

```powershell
Copy-Item .env.example .env
```

Exemplo:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tato_streaming?schema=public"
JWT_SECRET="troque_para_um_segredo_forte"
JWT_REFRESH_SECRET="troque_para_um_refresh_segredo_forte"
PORT=3000
```

### 4) Prisma

```bash
npm run prisma:generate
npm run prisma:migrate
```

Opcional:

```bash
npm run prisma:studio
```

### 5) Rodar API

```bash
npm run start:dev
```

## Banco via Docker

Arquivo: `docker-compose.yml`

```bash
docker-compose up -d
```

Comandos úteis:
- `docker-compose down`
- `docker-compose logs -f postgres`
- `docker-compose down -v`

## Scripts

- `npm run start:dev`
- `npm run build`
- `npm run start:prod`
- `npm run lint`
- `npm run test`
- `npm run test:e2e`
