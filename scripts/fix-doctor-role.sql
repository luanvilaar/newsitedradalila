-- Fix Doctor Account Role
-- ========================
-- Corrige a role da conta da doutora para 'admin'

-- 1. Verificar role atual
SELECT
  u.id,
  u.email,
  p.role as "Role Atual",
  p.full_name
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'dalilalucenaa@gmail.com';

-- 2. Atualizar role para 'admin' (se necessário)
UPDATE profiles
SET
  role = 'admin'::text,
  full_name = COALESCE(full_name, 'Dra. Dalila Lucena'),
  updated_at = NOW()
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email = 'dalilalucenaa@gmail.com'
);

-- 3. Verificar após atualização
SELECT
  u.id,
  u.email,
  p.role as "Role Atualizado ✅",
  p.full_name,
  p.updated_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'dalilalucenaa@gmail.com';
