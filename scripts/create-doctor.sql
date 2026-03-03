-- Script para criar conta de doutora no Supabase
-- ⚠️ IMPORTANTE: Execute este script no SQL Editor do Supabase
-- https://app.supabase.com -> seu projeto -> SQL Editor

-- Passo 1: Criar o usuário no auth.users
-- ❌ NÃO RECOMENDADO: Não podemos inserir diretamente em auth.users via SQL
-- Vamos usar uma abordagem alternativa...

-- ALTERNATIVA: Use o endpoint POST /api/auth/register-doctor
-- OU crie via Supabase Dashboard e depois execute o SQL abaixo

-- Passo 2: Se o usuário já foi criado (via Dashboard ou CLI),
-- execute isto para criar o perfil de admin:

BEGIN;

-- Cria o perfil da doutora como ADMIN
INSERT INTO profiles (id, role, full_name)
SELECT
  id,
  'admin'::text as role,
  'Dra. Dalila Lucena' as full_name
FROM auth.users
WHERE email = 'dalilalucenaa@gmail.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin';

COMMIT;

-- Verificar se foi criado com sucesso
SELECT id, email, role, full_name FROM profiles
WHERE email IN (SELECT email FROM auth.users WHERE email = 'dalilalucenaa@gmail.com');
