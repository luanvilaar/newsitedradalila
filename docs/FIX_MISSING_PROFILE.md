# 🔧 Correção: Profile Não Encontrado (404)

## Problema Identificado

**Erro**: `Erro ao carregar perfil do usuário` após fazer login com email/senha corretos

**Causa**: A tabela `profiles` não tem um registro para o usuário autenticado

---

## 🔍 Por que acontece?

Quando um usuário é criado no Supabase Auth, ele NÃO é automaticamente criado na tabela `profiles`. Isso precisa ser feito manualmente ou via aplicação.

### Fluxo esperado:
```
1. User criado em auth.users ✅
2. Profile criado em profiles ❌ (faltou!)
3. Login tenta buscar profile → 404
4. Erro: "Perfil não encontrado"
```

---

## ✅ Soluções Implementadas

### Solução 1: Auto-criar Profile no Login (Automático)
**Arquivo**: `src/app/(auth)/login/page.tsx`

Agora o login:
1. Tenta buscar o profile
2. Se não existir (error code `PGRST116`):
   - Chama o endpoint `/api/auth/sync-profile`
   - Cria o profile automaticamente
   - Recarrega e faz login

**Vantagem**: Transparente para o usuário

---

### Solução 2: Endpoint de Sincronização
**Arquivo**: `src/app/api/auth/sync-profile/route.ts`

Endpoint POST que:
- ✅ Verifica se profile existe
- ✅ Se não existe, cria um
- ✅ Retorna profile criado ou existente

Uso:
```typescript
POST /api/auth/sync-profile
Response: {
  "message": "Profile created successfully",
  "profile": { id, role, full_name, ... }
}
```

---

## 🧪 Como Testar

### Teste 1: Login Normal (Agora Funciona Automaticamente)
```
1. Acesse http://localhost:3000/login
2. Email: dalilalucenaa@gmail.com
3. Senha: dali1010
4. Deve criar o profile automaticamente
5. Redireciona para /admin ✅
```

### Teste 2: Manual - Verificar Profiles no Supabase
1. Acesse https://app.supabase.com
2. Seu projeto → **SQL Editor**
3. Execute:
```sql
SELECT id, email, role, full_name FROM profiles
ORDER BY created_at DESC LIMIT 5;
```
4. Deve mostrar o novo profile criado

### Teste 3: Chamar Endpoint Manualmente
```bash
curl -X POST http://localhost:3000/api/auth/sync-profile \
  -H "Content-Type: application/json"
```

---

## 📊 Fluxo Completo Agora

```
User faz login
  ↓
✅ Autentica com email/senha
  ↓
✅ getUser() retorna user.id
  ↓
❌ Busca profile → não encontrado (404)
  ↓
🔧 Detecta erro PGRST116 (no rows)
  ↓
📞 Chama POST /api/auth/sync-profile
  ↓
✅ Cria profile automaticamente
  ↓
🔄 Recarrega profile
  ↓
✅ Valida role
  ↓
🎯 Redireciona para /admin
  ↓
✅ Dashboard carrega com sucesso
```

---

## 🛠️ Se Quiser Criar Profile Manualmente

**Via Supabase Console:**

1. Acesse https://app.supabase.com
2. Seu projeto → **SQL Editor**
3. Cole este SQL:

```sql
-- Criar profile para usuário específico
INSERT INTO profiles (id, role, full_name, created_at, updated_at)
SELECT
  id,
  'admin'::text as role,
  'Dra. Dalila Lucena' as full_name,
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'dalilalucenaa@gmail.com'
ON CONFLICT (id) DO UPDATE
SET
  role = 'admin',
  full_name = 'Dra. Dalila Lucena',
  updated_at = NOW();

-- Verificar
SELECT id, email, role, full_name FROM profiles
WHERE id IN (SELECT id FROM auth.users WHERE email = 'dalilalucenaa@gmail.com');
```

4. Click **Run**
5. Tente fazer login novamente

---

## 🆘 Se Ainda Não Funcionar

### Debug Checklist:

- [ ] **Verificar Migração**: As migrations foram aplicadas?
  ```bash
  # No Supabase console, verifique se a tabela profiles existe
  # SQL Editor → Execute:
  SELECT * FROM information_schema.tables
  WHERE table_name = 'profiles';
  ```

- [ ] **Verificar RLS Policies**: As políticas estão bloqueando?
  ```sql
  SELECT * FROM pg_policies WHERE tablename = 'profiles';
  ```

- [ ] **Verificar Auth User**: O usuário foi criado?
  ```sql
  SELECT id, email, created_at FROM auth.users
  WHERE email = 'dalilalucenaa@gmail.com';
  ```

- [ ] **Limpar Cookies**:
  - DevTools → Application → Cookies → Delete all
  - Tente fazer login novamente

---

## 📝 Arquivos Modificados

| Arquivo | Mudança |
|---------|---------|
| `src/app/(auth)/login/page.tsx` | ✅ Auto-criar profile se não existir |
| `src/app/api/auth/sync-profile/route.ts` | ✅ Novo endpoint para sincronizar profiles |

---

## 🔐 Segurança

- ✅ Endpoint `/api/auth/sync-profile` requer autenticação (`getUser()`)
- ✅ Só cria profile para o usuário autenticado
- ✅ Não pode ser explorado por usuários não autenticados

---

## 💡 Próximas Melhorias

1. **Trigger no Supabase**: Criar profile automaticamente quando usuário é registrado
2. **Admin Panel**: Interface para criar/editar profiles
3. **Batch Creation**: Ferramenta para criar múltiplos profiles

---

**Status**: ✅ Corrigido e Pronto
**Data**: 2026-03-03
