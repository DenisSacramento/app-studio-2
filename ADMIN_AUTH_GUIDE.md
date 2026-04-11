# 🛡️ Admin Authentication System Implementation Guide

## Overview
Sistema completo de autenticação com suporte a roles (CLIENT/ADMIN) com 4 fases implementadas:
- **Fase 1:** Role Enum + Admin Seed no banco de dados
- **Fase 2:** Login com roteamento baseado em role e dashboard admin
- **Fase 3:** Biometric unlock com SecureStore
- **Fase 4:** Admin dashboard com gerenciamento completo

---

## 🚀 COMO USAR

### 1️⃣ Setup Inicial (Backend)

#### Variáveis de Ambiente (.env)
```bash
# Banco de dados
DATABASE_URL="postgresql://user:password@localhost:5432/app_studio"

# JWT
JWT_SECRET="your-secret-key-change-this-in-production"
JWT_REFRESH_SECRET="your-refresh-secret-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Admin Seed
ADMIN_EMAIL="admin@studio-karine.com"
ADMIN_PASSWORD="Admin@12345"

# Bcrypt
BCRYPT_ROUNDS=10
```

#### Criar Admin Account
```bash
cd backend
npm run seed
```

Isso vai criar:
```
✅ Usuário ADMIN
   Email: admin@studio-karine.com
   Role: ADMIN
   Senha: Admin@12345 (do .env)
```

---

### 2️⃣ Banco de Dados

#### Executar Migração (já foi feito, mas se precisar:)
```bash
cd backend
npm run prisma:migrate
```

Migrations criadas:
- `20260411152344_add_user_role` - Adiciona enum UserRole e campo role ao User

#### Schema Atualizado
```sql
-- UserRole enum
CREATE TYPE "UserRole" AS ENUM ('CLIENT', 'ADMIN');

-- User table
ALTER TABLE "users" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'CLIENT';
```

---

### 3️⃣ Login e Redirecionamento

#### LoginScreen (Frontend)
Fluxo automático baseado em role:

```typescript
if (response.user.role === 'ADMIN')
  router.push('/admin/dashboard')  // Painel admin
else
  router.push('/home')              // Home cliente
```

#### Endpoints (Backend)
```bash
POST /api/auth/login
{
  "email": "admin@studio-karine.com",
  "password": "Admin@12345"
}

Response:
{
  "message": "Login realizado com sucesso",
  "token": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "name": "Administrador",
    "email": "admin@studio-karine.com",
    "role": "ADMIN"  ← Role incluído!
  }
}
```

---

### 4️⃣ Admin Dashboard

#### Telas Disponíveis
1. **Dashboard** (`/admin/dashboard`)
   - Stats: Agendamentos, Clientes, Serviços, Faturamento
   - Menu para acessar outras telas
   - Botão logout

2. **Agendamentos** (`/admin/appointments`)
   - Lista todos agendamentos
   - Filtro por status (Pendente, Confirmado, Concluído, Cancelado)
   - Info: Data, hora, status, notas

3. **Usuários** (`/admin/users`)
   - Lista clientes
   - Busca por nome/email
   - Mostra: Nome, email, telefone, role, data criação

4. **Serviços** (`/admin/services`)
   - Lista serviços cadastrados
   - Mostra: Nome, descrição, valor, duração, status
   - Botão para adicionar novo (implementar depois)

5. **Relatórios** (`/admin/analytics`)
   - Selector de período (Mês, Trimestre, Ano)
   - Métricas: Faturamento, agendamentos, clientes, ticket médio
   - Breakdown por status
   - Top 5 serviços

#### Exemplo de Acesso
```bash
# Admin login
Email: admin@studio-karine.com
Password: Admin@12345

# Sistema redireciona para:
/admin/dashboard
```

---

### 5️⃣ Biometric (FASE 3)

#### Requisitos
- Device com suporte a biometria (fingerprint ou face recognition)
- Biometria cadastrada no device
- expo-local-authentication instalado
- expo-secure-store instalado

#### Como Funciona

1. **Após primeiro login bem-sucedido:**
   ```
   Alert: "Ativar login rápido com impressão digital ou rosto?"
   [Agora não]  [Ativar]
   ```

2. **Se escolher "Ativar":**
   - Biometric dialog aparece
   - Confirma com fingerprint/face
   - Tokens armazenados em SecureStore
   - Flag gravado em AsyncStorage

3. **Próximo login:**
   - Botão biometric aparece na LoginScreen
   - Clica no botão → Autenticação rápida
   - Se falhar → Fallback para email/password

#### Segurança
- ✅ Tokens em **SecureStore** (não AsyncStorage)
- ✅ Biometric valida o **device**, não o usuário
- ✅ Backend ainda valida o token JWT
- ✅ Fallback automático para senha se biometric falhar

---

## 🔒 Segurança & Boas Práticas

### ✅ Implementado
1. **JWT Tokens** - Access + Refresh com expiração
2. **Password Hashing** - bcrypt com 10 rounds
3. **Role-Based Access Control** - Middleware no backend
4. **SecureStore** - Biometric tokens não em AsyncStorage
5. **Rate Limiting** - 30 requisições/15min em /auth
6. **Token Refresh** - Renovação automática de sessão

### ⚠️ Para Produção

1. **JWT Secrets**
   ```bash
   # Gerar secrets fortes
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Admin Credentials**
   ```bash
   # Mudar ANTES de deploy
   ADMIN_EMAIL="seu-email@empresa.com"
   ADMIN_PASSWORD="SenhaForte@123456"
   ```

3. **HTTPS**
   ```bash
   # Remover esta linha antes de produção
   # (habilitada apenas para localhost)
   ```

4. **Audit Logs**
   ```bash
   # TODO: Implementar logging de ações admin
   # - Quem acessou o quê
   # - Quando
   # - Resultado
   ```

---

## 📁 Estrutura de Arquivos Adicionados

### Backend
```
backend/
├── prisma/
│   ├── schema.prisma               # ✏️ Role enum, campo role
│   ├── migrations/
│   │   └── 20260411152344_add_user_role/
│   │       └── migration.sql       # Adiciona role
│   └── seed.ts                     # ✨ NOVO: Cria admin
├── src/
│   ├── middlewares/
│   │   └── role.middleware.ts      # ✨ NOVO: Validação de role
│   └── modules/auth/
│       ├── auth.types.ts           # ✏️ PublicUser com role
│       ├── auth.service.ts         # ✏️ Retorna role
│       └── auth.routes.ts          # ✏️ Profile retorna role
└── package.json                     # ✏️ Script: npm run seed
```

### Frontend
```
app/
├── admin/                          # ✨ NOVA PASTA
│   ├── _layout.tsx                # Stack navigation
│   ├── dashboard.tsx               # Dashboard principal
│   ├── appointments.tsx            # Gerenciar agendamentos
│   ├── users.tsx                   # Listar usuários
│   ├── services.tsx                # Gerenciar serviços
│   └── analytics.tsx               # Relatórios
└── _layout.tsx                     # ✏️ Registra /admin

src/
├── screens/
│   └── LoginScreen.js              # ✏️ Biometric + role routing
└── services/
    ├── authService.ts              # ✏️ Armazena role
    └── biometricService.ts         # ✨ NOVO: Biometric unlock
```

---

## 🧪 TESTES & VALIDAÇÃO

### Tester Checklist

#### ✅ Fase 1: Role Setup
- [ ] Database tem enum UserRole (CLIENT, ADMIN)
- [ ] User table tem coluna role
- [ ] Migração aplicada
- [ ] Seed script cria admin
- [ ] Backend `npm run build` sem erros

#### ✅ Fase 2: Routing
- [ ] Admin login → /admin/dashboard
- [ ] Client login → /home  
- [ ] Admin vê dashboard
- [ ] Client não acessa /admin/*

#### ✅ Fase 3: Biometric
- [ ] LoginScreen oferece biometric
- [ ] Pode habilitar após login
- [ ] SecureStore armazena tokens
- [ ] Biometric unlock funciona

#### ✅ Fase 4: Dashboard
- [ ] Todos 5 screens carregam
- [ ] Logout funciona de cada screen
- [ ] Navegação entre telas funciona
- [ ] Dados mockados exibem

#### ✅ Integridade
- [ ] Features antigas ainda funcionam
- [ ] Client pode fazer agendamento
- [ ] Client pode ver services
- [ ] Frontend `expo lint` passa
- [ ] Backend compila sem erros

---

## 🐛 Troubleshooting

### Error: "Biometria não disponível"
```
Cause: Device não tem biometria ou não está configurada
Fix: Habilitar fingerprint/face no device ou usar senha
```

### Error: "Token inválido"
```
Cause: Token expirou ou foi revoccado
Fix: Fazer logout e login novamente
```

### Admin não aparece no dashboard
```
Cause: Seed script não foi executado
Fix: npm run seed (com ADMIN_EMAIL e ADMIN_PASSWORD no .env)
```

### LoginScreen mostra erro de compilação
```
Cause: expo-local-authentication não instalado
Fix: npx expo install expo-local-authentication expo-secure-store
```

---

## 📊 Fluxo Completo

```
┌─────────────────────────────────────────────────────────┐
│                    NOVO USUÁRIO                          │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
                   ┌────────────┐
                   │  Register  │
                   └────────────┘
                          │
                         ▼
              role = CLIENT (default)
              AsyncStorage ← role
              AsyncStorage ← token
                         │
                         ▼
                     /home (redirect)

┌─────────────────────────────────────────────────────────┐
│                 ADMIN SEED CREATED                       │
└─────────────────────────────────────────────────────────┘
          ADMIN_EMAIL (do .env)
          ADMIN_PASSWORD (do .env)
          role = ADMIN (explicit)

┌─────────────────────────────────────────────────────────┐
│               LOGIN FLOW (AMBOS)                         │
└─────────────────────────────────────────────────────────┘
        Email + Password
              │
              ▼
         POST /auth/login
              │
              ▼
    Backend valida credentials
              │
              ▼
         Retorna user.role
              │
      ┌───────┴──────┐
      ▼              ▼
    ADMIN          CLIENT
      │              │
      ▼              ▼
  /admin/        /home
  dashboard

┌─────────────────────────────────────────────────────────┐
│           BIOMETRIC UNLOCK FLOW (OPCIONAL)               │
└─────────────────────────────────────────────────────────┘
   Login bem-sucedido
         │
         ▼
    "Ativar biometric?"
         │
    ┌────┴────┐
    ▼         ▼
  Agora     Ativar
   não       │
    │        ▼
    │   BiometricService.enableBiometric()
    │        │
    │        ▼
    │   SecureStore.setItem(token)
    │        │
    │        ▼
    │   AsyncStorage.setItem('biometric_enabled', true)
    │        │
    └────┬───┘
         ▼
    Redirect (Admin/Client)
         │
    Próximo login:
         │
         ▼
    Biometric button aparece
         │
    ┌────┴────────────────┐
    ▼                     ▼
  Usar biometric     Usar senha
         │                │
         ▼                ▼
   LocalAuth         Email+password
         │
         ▼
    Se sucesso: recupera token do SecureStore
    Se falha: Fallback para senha
```

---

## 📝 Notas Importantes

1. **Seed Script**: Executar DEPOIS que DB está limpo ou antes de produção
2. **Admin Credentials**: Mudar ANTES de deploy em .env
3. **Biometric**: Opcional - fallback automático para senha
4. **Role Field**: Todos usuários têm role, default é CLIENT
5. **Dashboard**: Telas com dados **mockados** - integrar com API depois
6. **Security**: Senhas NUNCA em logs, tokens em SecureStore

---

## 🔄 Próximos Passos (Futuro)

- [ ] Backend endpoints para /admin/appointments, /admin/users, etc
- [ ] Real data em dashboard em vez de mockado
- [ ] Audit logging para todas ações admin
- [ ] Delete/block cliente
- [ ] Criar novos serviços
- [ ] Editar preços serviços
- [ ] Relatórios em PDF
- [ ] Email notifications para admin
- [ ] 2FA (Two-Factor Authentication)
- [ ] Admin invite system (em vez de seed)

---

## ✅ Checklist Final de Deployment

- [ ] Mudar ADMIN_EMAIL em .env
- [ ] Mudar ADMIN_PASSWORD em .env (senha forte!)
- [ ] Mudar JWT_SECRET em .env
- [ ] Mudar JWT_REFRESH_SECRET em .env
- [ ] Verificar DATABASE_URL para produção
- [ ] npm run seed executado
- [ ] Backend compila sem erros
- [ ] Frontend lint passa
- [ ] Testar login admin
- [ ] Testar dashboard
- [ ] Testar logout
- [ ] Testar client não acessa admin
- [ ] HTTPS habilitado em produção
- [ ] Rate limits em .env revisados
