# 🔧 Correção: Conta da Doutora com Role Errado

## Problema

Conta `dalilalucenaa@gmail.com` foi criada com role **'patient'** ao invés de **'admin'**

**Sintomas**:
- ❌ Login redireciona para `/paciente` (paciente)
- ❌ Ao acessar `/admin`, redireciona para `/paciente`
- ❌ Não consegue acessar painel administrativo

---

## ✅ Solução Rápida (2 minutos)

### Via Supabase Console:

1. **Acesse** https://app.supabase.com → seu projeto
2. **Vá para** → SQL Editor (à esquerda)
3. **Cole este SQL:**

```sql
-- Corrigir role da doutora para 'admin'
UPDATE profiles
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email = 'dalilalucenaa@gmail.com'
);
```

4. **Clique** Run (ou Ctrl+Enter)
5. **Verifique** com este SQL:

```sql
-- Verificar se foi corrigido
SELECT u.email, p.role, p.full_name
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'dalilalucenaa@gmail.com';
```

6. **Esperado**: `role = 'admin'` ✅

7. **Faça logout e login novamente** para aplicar as mudanças

---

## 🧪 Teste Após Correção

```
1. Logout em http://localhost:3000/login (clique Sair)
2. Login com:
   - Email: dalilalucenaa@gmail.com
   - Senha: dali1010
3. Esperado:
   ✅ Redireciona para /admin
   ✅ Acessa painel administrativo
   ✅ Pode navegar entre pacientes, documentos, etc.
4. Tente acessar /paciente manualmente
   ✅ Deve redirecionar para /admin
```

---

## 📋 Script SQL Completo

Se preferir um script com verificação:

```sql
-- 1. VER ROLE ATUAL
SELECT
  u.id,
  u.email,
  p.role as "Role Atual",
  p.full_name
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'dalilalucenaa@gmail.com';

-- 2. CORRIGIR PARA ADMIN
UPDATE profiles
SET role = 'admin'::text
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email = 'dalilalucenaa@gmail.com'
);

-- 3. VERIFICAR APÓS CORREÇÃO
SELECT
  u.id,
  u.email,
  p.role as "✅ Role Corrigido",
  p.full_name
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'dalilalucenaa@gmail.com';
```

---

## 🔐 Entender as Roles

| Role | Acesso | Dashboard |
|------|--------|-----------|
| **admin** | Pacientes, documentos, configurações | `/admin` |
| **patient** | Seus próprios dados apenas | `/paciente` |

**Doutora = admin** ✅

---

## 🛠️ Por que aconteceu?

Ao criar a conta via:
1. Supabase Dashboard → Criar user ✅
2. Endpoint de criação → role é auto-definido

Se criou via endpoint que usa role padrão 'patient', isso explica.

**Solução**: Sempre verificar role após criar conta nova!

---

## ✨ Verificação Rápida

Para verificar TODAS as contas e roles:

```sql
SELECT
  u.email,
  p.role,
  p.full_name,
  u.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;
```

---

## 📝 Checklist Pós-Correção

- [ ] Corrigir role no SQL
- [ ] Verificar com SELECT
- [ ] Fazer logout em http://localhost:3000/login
- [ ] Fazer login novamente
- [ ] Verificar se redireciona para `/admin`
- [ ] Acessar painel administrativo
- [ ] Testar navegação entre seções

---

**Status**: ✅ Pronto para corrigir!
**Tempo**: ~2 minutos
**Dificuldade**: ⭐ Muito fácil

Se tiver dúvida, avise! 🚀
