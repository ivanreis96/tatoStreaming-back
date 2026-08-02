# Passo 1 - Setup de E-mail com Mailhog

Objetivo deste documento:
- Permitir desenvolvimento local com Mailhog.
- Validar o fluxo de recuperacao de senha sem depender de provedor externo.

Ordem recomendada de execucao:
1. Executar A1 para subir o Mailhog.
2. Executar A2 para configurar o ambiente.
3. Executar A3 para instalar as dependencias.
4. Executar A4 para validar o envio.

---

## A) Mailhog (desenvolvimento local)

Resultado esperado:
- Sua API envia e-mails para uma inbox local.
- Voce testa token e link sem depender de internet.

### A1. Subir Mailhog no Docker Compose

Arquivo para editar:
- docker-compose.yml

Adicionar um servico mailhog no mesmo compose do postgres.

Exemplo:

```yaml
services:
  postgres:
    image: postgres:16
    container_name: tato_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: tato_streaming
    ports:
      - "5432:5432"
    volumes:
      - tato_postgres_data:/var/lib/postgresql/data

  mailhog:
    image: mailhog/mailhog:latest
    container_name: tato_mailhog
    restart: unless-stopped
    ports:
      - "1025:1025" # SMTP
      - "8025:8025" # UI Web

volumes:
  tato_postgres_data:
```

Subir servicos:

```powershell
docker compose up -d
```

Validar:
- UI Mailhog em http://localhost:8025

### A2. Configurar variaveis SMTP para Mailhog

Arquivo:
- .env

Adicionar:

```env
EMAIL_PROVIDER=mailhog
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_FROM="Tato Streaming <no-reply@tato.local>"
RESET_PASSWORD_URL_BASE="http://localhost:5173/reset-password"
```

Observacao:
- RESET_PASSWORD_URL_BASE deve apontar para a rota de redefinicao no front.

### A3. Dependencias para envio SMTP

Instalar no backend:

```powershell
npm install nodemailer
npm install -D @types/nodemailer
```

### A4. Teste de envio

Fluxo de teste:
1. Fazer chamada no endpoint de forgot password.
2. Abrir http://localhost:8025.
3. Confirmar recebimento.
4. Abrir o link da mensagem e validar redirecionamento para o front.

Documentacao oficial Mailhog:
- https://github.com/mailhog/MailHog

---

## B) Escopo atual

Resultado esperado:
- Neste momento o projeto fica preparado apenas para Mailhog.
- Resend e modo hibrido ficam para uma etapa futura.

### B1. O que isso significa no projeto

1. O backend vai enviar apenas por SMTP local.
2. O .env.example deve conter apenas as variaveis necessarias para Mailhog.
3. Nenhuma dependencia de Resend precisa ser instalada agora.

### B2. Evolucao futura

Quando voce quiser retomar envio real com Resend, eu posso criar um Passo 2 dedicado para:
1. instalar a SDK;
2. adicionar novas variaveis de ambiente;
3. adaptar o servico de e-mail para escolher entre provedores.

---

## C) Boas praticas minimas para recuperacao de senha

1. Endpoint forgot password deve sempre retornar mensagem neutra.
Exemplo: "Se o e-mail existir, enviaremos as instrucoes." 

2. Token deve expirar (exemplo: 15 a 30 minutos).

3. Salvar no banco apenas hash do token, nunca token puro.

4. Invalidar token apos uso.

5. Aplicar rate limit por IP e por e-mail no forgot password.

---

## D) Quando me pedir para executar

Voce pode me chamar com frases como:
- "Execute o passo A1"
- "Execute do passo A1 ate A4"
- "Revise o passo A2"
- "Agora implemente o fluxo depois do A4"

Assim eu sigo exatamente o bloco solicitado.

---

## E) Referencias oficiais

- Mailhog: https://github.com/mailhog/MailHog
