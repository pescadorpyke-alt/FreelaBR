# FreelaBR

Ferramenta financeira e de produtividade para freelancers brasileiros:
controle de clientes/projetos, timer, recibos com **QR Code Pix**, e
acompanhamento do **teto do MEI**.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4**
- **Prisma 7** + **PostgreSQL** (via `@prisma/adapter-pg`)
- **NextAuth v5** (email + senha, bcrypt)
- **qrcode** para o BR Code Pix

## Funcionalidades

- Multi-usuário (cadastro/login), dados isolados por usuário
- Clientes e projetos (por hora ou valor fixo)
- Timer com histórico de horas
- Recibos com numeração sequencial, status e **Pix Copia e Cola + QR Code**
- Página fiscal: progresso do teto do MEI, DAS mensal, projeção anual
- Configurações de perfil (dados + chave Pix)

## Desenvolvimento local

```bash
npm install
# configure o .env (veja abaixo)
npx prisma migrate dev
npm run dev
```

App em `http://localhost:3000`.

## Variáveis de ambiente (`.env`)

```env
# Connection string Postgres (Neon/Supabase ou local)
DATABASE_URL="postgresql://user:senha@host/banco?sslmode=require"

# Segredo do NextAuth — gere com: openssl rand -base64 32
AUTH_SECRET="..."
```

> O `.env` está no `.gitignore`. **Nunca** commite credenciais.

## Deploy (Vercel)

1. Importe o repositório em [vercel.com/new](https://vercel.com/new)
2. Configure as variáveis de ambiente `DATABASE_URL` e `AUTH_SECRET`
3. Deploy (o build roda `prisma generate && next build`)

Para alterações de schema em produção, rode `npx prisma migrate deploy`
apontando para a connection string **direta** (sem `-pooler`).
