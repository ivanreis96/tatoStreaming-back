-- CreateEnum
CREATE TYPE "public"."MediaKind" AS ENUM ('movie', 'series');

-- CreateEnum
CREATE TYPE "public"."MediaSituacao" AS ENUM ('lancado', 'producao', 'encerrada');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "refreshTokenHash" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Media" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "tituloOriginal" TEXT NOT NULL,
    "subtitulo" TEXT NOT NULL,
    "sinopse" TEXT NOT NULL,
    "generos" TEXT[],
    "popularidade" TEXT NOT NULL,
    "votos" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "lancamento" TEXT NOT NULL,
    "duracao" TEXT NOT NULL,
    "situacao" "public"."MediaSituacao" NOT NULL,
    "idioma" TEXT NOT NULL,
    "orcamento" TEXT NOT NULL,
    "receita" TEXT NOT NULL,
    "lucro" TEXT NOT NULL,
    "posterUrl" TEXT NOT NULL,
    "kind" "public"."MediaKind" NOT NULL,
    "backgroundUrl" TEXT NOT NULL,
    "teaserUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "Media_createdById_idx" ON "public"."Media"("createdById");

-- AddForeignKey
ALTER TABLE "public"."Media" ADD CONSTRAINT "Media_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
