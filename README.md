# Tato Streaming - Backend

API REST do projeto Tato Streaming, desenvolvida com NestJS + Prisma + PostgreSQL.

## Contexto do Projeto

Este repositorio representa a camada de servidor da aplicacao, com foco em:

- autenticacao (registro, login, refresh e usuario autenticado)
- gestao de midias (CRUD de filmes/series)
- persistencia em banco PostgreSQL

No workspace maior, este backend se relaciona com:

- `../front/tatoStreaming-front`: aplica a experiencia web e consome esta API.
- `../shared`: pacote compartilhado para contratos e schemas reutilizaveis entre camadas.

## Endpoints Base

O servidor sobe na porta `3000` por padrao e usa prefixo global `api`.

Base URL local:

```text
http://localhost:3000/api
```

Principais rotas:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `GET /api/media`
- `GET /api/media/:id`
- `POST /api/media`
- `PATCH /api/media/:id`
- `DELETE /api/media/:id`

## Stack

- NestJS 11
- Prisma
- PostgreSQL
- JWT (access + refresh token)
- Zod (validacao de DTOs)

## Requisitos

- Node.js 20+ (recomendado)
- npm 10+ (recomendado)
- PostgreSQL rodando localmente

## Setup Passo a Passo

### 1) Build do pacote shared

Este backend declara dependencia local para `@tato-streaming/shared` usando `file:../shared`.

No terminal, a partir da pasta raiz do workspace (`tato-streaming`):

```bash
cd shared
npm install
npm run build
```

### 2) Instalar dependencias do backend

```bash
cd ../back/tatoStreaming-back
npm install
```

### 3) Configurar variaveis de ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

No Windows PowerShell, alternativa:

```powershell
Copy-Item .env.example .env
```

Valores esperados em `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tato_streaming?schema=public"
JWT_SECRET="troque_para_um_segredo_forte"
JWT_REFRESH_SECRET="troque_para_um_refresh_segredo_forte"
PORT=3000
```

### 4) Preparar banco com Prisma

```bash
npm run prisma:generate
npm run prisma:migrate
```

Opcional para inspecionar dados:

```bash
npm run prisma:studio
```

### 5) Rodar a API

```bash
npm run start:dev
```

## Scripts Principais

- `npm run start:dev`: sobe API com watch.
- `npm run start`: sobe API em modo padrao.
- `npm run build`: gera dist para producao.
- `npm run start:prod`: executa build em producao.
- `npm run lint`: executa lint com correcao.
- `npm run test`: testes unitarios.
- `npm run test:e2e`: testes end-to-end.

## Integracao com as Outras Partes

- O frontend deve apontar para este backend via `VITE_API_BASE_URL`.
- O pacote shared concentra contratos para evitar divergencia entre payloads e validacoes.
- Ordem recomendada para desenvolvimento local:
  1. `shared` (build)
  2. `back` (API + banco)
  3. `front` (UI)
