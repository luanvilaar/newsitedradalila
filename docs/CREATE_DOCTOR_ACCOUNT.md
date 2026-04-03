# Criar Conta de Doutora

Guia para criar uma conta de doutora (admin) na plataforma.

## Dados da Doutora

- **Email**: dalilalucenaa@gmail.com
- **Senha**: dali1010
- **Nome**: Dra. Dalila Lucena
- **Função**: Médica (Admin)

## Método 1: Via Script Node.js (Recomendado)

### Pré-requisitos

1. **Obter a Service Role Key do Supabase**:
   - Acesse: https://app.supabase.com/
   - Vá para seu projeto
   - Clique em "Settings" → "API"
   - Copie a chave em "Service Role Key" (role `service_role`)
   - ⚠️ NUNCA compartilhe esta chave publicamente

2. **Adicionar a chave ao .env.local**:
   ```bash
   # Edite .env.local e substitua:
   SUPABASE_SERVICE_ROLE_KEY=sua_chave_aqui
   ```

3. **Executar o script**:
   ```bash
   node scripts/create-doctor.js
   ```

### O que o script faz:
- ✅ Cria um usuário no Supabase Auth
- ✅ Cria um perfil com role 'admin'
- ✅ Confirma o email automaticamente
- ✅ Pronto para fazer login

## Método 2: Via cURL (Alternativa)

```bash
# 1. Inicie o servidor
npm run dev

# 2. Em outro terminal, execute:
curl -X POST http://localhost:3000/api/auth/register-doctor \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dalilalucenaa@gmail.com",
    "password": "dali1010",
    "full_name": "Dra. Dalila Lucena"
  }'
```

## Método 3: Via Supabase Dashboard (Manual)

1. Acesse https://app.supabase.com/
2. Vá para seu projeto
3. Clique em "Authentication" → "Users"
4. Clique em "Add user" → "Create new user"
5. Preencha:
   - Email: `dalilalucenaa@gmail.com`
   - Password: `dali1010`
   - Auto confirm user: ✅
6. Clique "Save"

7. Vá para "SQL Editor" e execute:
   ```sql
   INSERT INTO profiles (id, role, full_name)
   SELECT
     id,
     'admin' as role,
     'Dra. Dalila Lucena' as full_name
   FROM auth.users
   WHERE email = 'dalilalucenaa@gmail.com'
   ON CONFLICT (id) DO NOTHING;
   ```

## Verificar Conta Criada

Para verificar se a conta foi criada com sucesso:

```bash
# 1. Login via navegador
# Acesse http://localhost:3000/login
# Email: dalilalucenaa@gmail.com
# Senha: dali1010

# 2. Você deve ser redirecionado para /admin
```

## Troubleshooting

### Erro: "Service role key not configured"
- Adicione `SUPABASE_SERVICE_ROLE_KEY` ao `.env.local`
- Reinicie o servidor (`npm run dev`)

### Erro: "Email already exists"
- A conta já foi criada
- Tente fazer login normalmente

### Erro: "Failed to create profile"
- Verifique se a Service Role Key está correta
- Verifique as RLS policies no Supabase

## Segurança

⚠️ **IMPORTANTE**:
- A senha `dali1010` deve ser alterada após o primeiro login
- A Service Role Key em `.env.local` está no `.gitignore`
- NUNCA exponha a Service Role Key em repositórios públicos

## Próximos Passos

1. ✅ Criar conta de doutora
2. 📝 Fazer login e completar perfil
3. 🔐 Alterar senha via painel
4. 👥 Adicionar pacientes
5. 📋 Iniciar consultórios

---

**Dúvidas?** Verifique a documentação do Supabase:
- https://supabase.com/docs
- https://supabase.com/docs/guides/auth
