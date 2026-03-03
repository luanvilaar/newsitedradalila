# ⚡ Criar Conta da Doutora - Solução Rápida

## 🎯 Opção 1: Supabase CLI (Mais Rápido)

### Passo 1: Instalar Supabase CLI (se ainda não tem)
```bash
# macOS
brew install supabase/tap/supabase

# Linux/Windows
npm install -g supabase
```

### Passo 2: Autenticar com Supabase
```bash
supabase login
# Siga as instruções para autenticar
```

### Passo 3: Criar o usuário
```bash
supabase gen access-token --duration 3600
```

Copie o token gerado e execute:

```bash
# Crie um arquivo .env temporário com o token
export SUPABASE_ACCESS_TOKEN="seu_token_aqui"
export PROJECT_REF="jcvjaiufrbqclcxproee"  # O ID do seu projeto (veja na URL do Supabase)

# Crie o usuário
curl --request POST 'https://api.supabase.com/v1/projects/jcvjaiufrbqclcxproee/auth/users' \
  -H "apikey: seu_service_key_aqui" \
  -H "Authorization: Bearer seu_token_aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dalilalucenaa@gmail.com",
    "password": "dali1010",
    "user_metadata": {}
  }'
```

---

## 🎯 Opção 2: Supabase Dashboard (Mais Simples)

### Passo 1: Acesse o Dashboard
https://app.supabase.com

### Passo 2: Vá para seu projeto
Clique no projeto

### Passo 3: Crie o usuário
1. Clique em **Authentication** (à esquerda)
2. Clique em **Users** (abas no topo)
3. Clique em **Add user** → **Create new user**
4. Preencha:
   - **Email**: `dalilalucenaa@gmail.com`
   - **Password**: `dali1010`
   - **Auto confirm user**: ✅ (marque)
5. Clique em **Save** (ou **Create user**)

### Passo 4: Configure como Admin
1. Vá para **SQL Editor** (à esquerda)
2. Clique em **New query**
3. Cole este SQL:

```sql
INSERT INTO profiles (id, role, full_name)
SELECT
  id,
  'admin'::text,
  'Dra. Dalila Lucena'
FROM auth.users
WHERE email = 'dalilalucenaa@gmail.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin';
```

4. Clique em **Run** (ou execute com Ctrl+Enter)

---

## 🎯 Opção 3: API Endpoint (Automático)

Se você tiver a **Service Role Key**:

### Passo 1: Copie a Service Role Key
1. Settings → API → Service Role Key
2. Copie (cuidado, é sensível!)

### Passo 2: Adicione ao .env.local
```bash
SUPABASE_SERVICE_ROLE_KEY=sua_chave_aqui
```

### Passo 3: Reinicie o servidor
```bash
npm run dev
```

### Passo 4: Crie o usuário via cURL
```bash
curl -X POST http://localhost:3000/api/auth/register-doctor \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dalilalucenaa@gmail.com",
    "password": "dali1010",
    "full_name": "Dra. Dalila Lucena"
  }'
```

---

## ✅ Depois de criar

Teste o login:
- URL: http://localhost:3000/login
- Email: `dalilalucenaa@gmail.com`
- Senha: `dali1010`

Você deve ser redirecionado para `/admin` 🎉

---

## 🆘 Troubleshooting

### "Email ou senha incorretos" no login
- A conta ainda não foi criada
- Verifique os 3 passos acima

### "Error: Email already exists"
- A conta já existe!
- Tente fazer login normalmente

### "User already registered"
- Você está tentando criar uma conta que já existe
- Tente fazer login

---

**Recomendação**: Use a **Opção 2 (Dashboard)** - é a mais simples e mais rápida! 🚀
