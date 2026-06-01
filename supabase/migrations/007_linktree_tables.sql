-- Create linktree_config table
CREATE TABLE IF NOT EXISTS public.linktree_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL DEFAULT 'Dra. Dalila Lucena',
    subtitle TEXT NOT NULL DEFAULT 'Medicina de Performance & Longevidade',
    bio TEXT NOT NULL DEFAULT 'Ciência, precisão e performance aplicadas para transformar sua saúde e alcançar sua melhor versão.',
    avatar_url TEXT NOT NULL DEFAULT '/perfil-links.png',
    instagram_url TEXT DEFAULT 'https://www.instagram.com/dalilalucena',
    whatsapp_url TEXT DEFAULT 'https://wa.me/5583988118436?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20uma%20consulta%20em%20Jo%C3%A3o%20Pessoa.',
    video_url TEXT NOT NULL DEFAULT '',
    video_redirect_url TEXT NOT NULL DEFAULT 'https://www.instagram.com/p/DYnJV9XJcQS/',
    show_video BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create linktree_links table
CREATE TABLE IF NOT EXISTS public.linktree_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    url TEXT NOT NULL,
    icon_name TEXT NOT NULL DEFAULT 'external-link',
    is_primary BOOLEAN NOT NULL DEFAULT false,
    position_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.linktree_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linktree_links ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist (to avoid replication errors)
DROP POLICY IF EXISTS "Allow public read access to linktree_config" ON public.linktree_config;
DROP POLICY IF EXISTS "Allow auth admin edit access to linktree_config" ON public.linktree_config;
DROP POLICY IF EXISTS "Allow public read access to linktree_links" ON public.linktree_links;
DROP POLICY IF EXISTS "Allow auth admin edit access to linktree_links" ON public.linktree_links;

-- Create Policies for linktree_config
CREATE POLICY "Allow public read access to linktree_config"
ON public.linktree_config FOR SELECT USING (true);

CREATE POLICY "Allow auth admin edit access to linktree_config"
ON public.linktree_config FOR ALL TO authenticated USING (true);

-- Create Policies for linktree_links
CREATE POLICY "Allow public read access to linktree_links"
ON public.linktree_links FOR SELECT USING (true);

CREATE POLICY "Allow auth admin edit access to linktree_links"
ON public.linktree_links FOR ALL TO authenticated USING (true);

-- Seed initial config data
INSERT INTO public.linktree_config (id, title, subtitle, bio, avatar_url, instagram_url, whatsapp_url, video_url, video_redirect_url, show_video)
VALUES (
    'a3e20000-0000-0000-0000-000000000001',
    'Dra. Dalila Lucena',
    'Medicina de Performance & Longevidade',
    'Ciência, precisão e performance aplicadas para transformar sua saúde e alcançar sua melhor versão.',
    '/perfil-links.png',
    'https://www.instagram.com/dalilalucena',
    'https://wa.me/5583988118436?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20uma%20consulta%20em%20Jo%C3%A3o%20Pessoa.',
    'https://assets.mixkit.co/videos/preview/mixkit-medical-research-in-a-laboratory-40081-large.mp4',
    'https://www.instagram.com/p/DYnJV9XJcQS/',
    true
) ON CONFLICT (id) DO NOTHING;

-- Seed initial links data
INSERT INTO public.linktree_links (id, title, subtitle, url, icon_name, is_primary, position_order, is_active)
VALUES
(
    'b3e30000-0000-0000-0000-000000000001',
    'Agendar Consulta Online',
    'Escolha o melhor horário via Google Calendar',
    '/agendar',
    'calendar',
    true,
    0,
    true
),
(
    'b3e30000-0000-0000-0000-000000000002',
    'Falar no WhatsApp (João Pessoa)',
    'Atendimento presencial em Manaíra',
    'https://wa.me/5583988118436?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20uma%20consulta%20em%20Jo%C3%A3o%20Pessoa.',
    'message-square',
    false,
    1,
    true
),
(
    'b3e30000-0000-0000-0000-000000000003',
    'Conhecer Nosso Site Principal',
    'Nossos tratamentos, especialidades e método',
    '/',
    'external-link',
    false,
    2,
    true
),
(
    'b3e30000-0000-0000-0000-000000000004',
    'Área do Paciente',
    'Acesse seus exames, receitas e prontuário',
    '/login',
    'user',
    false,
    3,
    true
),
(
    'b3e30000-0000-0000-0000-000000000005',
    'Consultório João Pessoa - PB',
    'Rua Silvino Chaves, 911 - Manaíra',
    'https://www.google.com/maps/search/?api=1&query=R.%20Silvino%20Chaves%2C%20911%20-%20Mana%C3%ADra%2C%20Jo%C3%A3o%20Pessoa%20-%20PB%2C%2058038-420',
    'map-pin',
    false,
    4,
    true
),
(
    'b3e30000-0000-0000-0000-000000000006',
    'Consultório Recife - PE',
    'Av. Mal. Mascarenhas de Morais, 4861',
    'https://www.google.com/maps/search/?api=1&query=Av.%20Mal.%20Mascarenhas%20de%20Morais%2C%204861%20-%20Imbiribeira%2C%20Recife%20-%20PE%2C%2051150-000',
    'map-pin',
    false,
    5,
    true
) ON CONFLICT (id) DO NOTHING;
