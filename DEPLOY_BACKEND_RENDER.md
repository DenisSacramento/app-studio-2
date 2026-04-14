# Deploy do Backend no Render (gratuito)

## 1) Subir o backend

1. Faça push do repositório para o GitHub.
2. No Render, clique em New > Blueprint e selecione este repositório.
3. O arquivo `backend/render.yaml` será usado automaticamente.

## 2) Configurar variáveis obrigatórias no Render

No serviço web criado no Render, em Environment, configure:

- `DATABASE_URL` (PostgreSQL de produção)
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `CORS_ORIGINS`

Exemplo de `CORS_ORIGINS` para app Expo/web:

- `https://seu-dominio.com`
- ou lista separada por vírgula, por exemplo: `https://seu-dominio.com,https://app.expo.dev`

Em producao, nao use `*`.

## 3) Obter URL pública

Após deploy, copie a URL do serviço no Render, por exemplo:

- `https://app-studio-2.onrender.com`

Sua API base fica:

- `https://app-studio-2.onrender.com/api`

## 4) Colar URL no app Expo

Atualize os locais abaixo com sua URL final:

1. `.env` (na raiz do projeto mobile):
   - `EXPO_PUBLIC_API_URL=https://app-studio-2.onrender.com/api`
2. `eas.json`:
   - `build.preview.env.EXPO_PUBLIC_API_URL`
   - `build.production.env.EXPO_PUBLIC_API_URL`

## 4.1) Rodar migracoes no banco de producao

No Render Shell do backend, execute:

- `npx prisma migrate deploy`

Em seguida, reinicie o servico e confira:

- `GET /health`
- `GET /api/health`

## 5) Build do APK/AAB

1. Execute `npx eas build -p android --profile production`.
2. Instale o APK/AAB gerado.
3. Teste em 4G/5G (fora da rede local).
