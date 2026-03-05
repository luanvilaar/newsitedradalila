# Hostinger Deployment Guide — DT (Dra. Dalila Lucena)

## Opção 1: Hostinger VPS (Recomendado)

### Requisitos
- Hostinger VPS com Node.js 18+ (recomendado: Node 22 LTS)
- 1 GB RAM mínimo, 2 GB recomendado
- PM2 para gerenciamento de processos
- Nginx como reverse proxy

### 1. Acesse o VPS via SSH
```bash
ssh root@SEU_IP_VPS
```

### 2. Instale dependências do sistema
```bash
# Instala Node.js 22 via NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22

# Instala PM2 globalmente
npm install -g pm2

# Instala Nginx
apt update && apt install -y nginx
```

### 3. Clone o repositório
```bash
cd /var/www
git clone https://github.com/luanvilaar/newsitedradalila.git dt-app
cd dt-app
```

### 4. Configure as variáveis de ambiente
```bash
cp .env.example .env.local
nano .env.local
# Preencha todas as variáveis com os valores de produção
```

### 5. Instale dependências e faça build
```bash
npm ci
npm run build
```

### 6. Inicie com PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 7. Configure Nginx como reverse proxy
```bash
cp hostinger/nginx.conf /etc/nginx/sites-available/dt-app
ln -sf /etc/nginx/sites-available/dt-app /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

### 8. Configure SSL (Let's Encrypt)
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d seudominio.com.br -d www.seudominio.com.br
```

### 9. Configure o webhook da Avisa
```bash
# Após o domínio estar ativo com SSL:
AVISA_WEBHOOK_URL=https://seudominio.com.br/api/webhooks/avisa
npm run avisa:webhook:set -- $AVISA_WEBHOOK_URL
```

---

## Opção 2: Hostinger Web Hosting (Plano Business+)

Para planos compartilhados com Node.js:

### 1. No painel Hostinger
- Acesse **Avançado → Node.js**
- Crie uma aplicação Node.js:
  - **Versão:** 22.x
  - **Modo:** Produção
  - **Diretório raiz:** /
  - **Arquivo de inicialização:** server.js
  - **Porta:** será atribuída automaticamente

### 2. Upload dos arquivos
- Use File Manager ou Git para fazer upload
- Execute no terminal SSH:
```bash
npm ci
npm run build
```

### 3. Configure .env.local
- Crie o arquivo `.env.local` via File Manager
- Ou use variáveis de ambiente no painel Node.js

---

## Opção 3: Hostinger VPS com Docker

```bash
# No VPS
git clone https://github.com/luanvilaar/newsitedradalila.git dt-app
cd dt-app

# Configure env
cp .env.example .env.local
nano .env.local

# Build e run com Docker
docker compose up -d --build
```

---

## Comandos Úteis (pós-deploy)

```bash
# Ver logs da aplicação
pm2 logs dt-app

# Reiniciar após atualizar código
cd /var/www/dt-app
git pull origin main
npm ci
npm run build
pm2 restart dt-app

# Ver status
pm2 status

# Checar status Avisa
npm run avisa:status
```

## Variáveis de Ambiente Obrigatórias

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon do Supabase | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service role do Supabase | ✅ |
| `OPENAI_API_KEY` | Chave da API OpenAI | ✅ |
| `AVISA_API_TOKEN` | Token da API Avisa | ✅ |
| `AVISA_API_BASE_URL` | URL base da Avisa | ✅ |
| `GOOGLE_GEMINI_API_KEY` | Chave Gemini (chat) | ⚠️ Opcional |
| `NEXT_PUBLIC_GOOGLE_API_KEY` | Chave Google Maps | ⚠️ Opcional |
| `REPLICATE_API_TOKEN` | Token Replicate (imagens) | ⚠️ Opcional |

## Portas e Firewall

| Porta | Serviço | Regra |
|-------|---------|-------|
| 80 | HTTP (Nginx) | Aberta |
| 443 | HTTPS (Nginx) | Aberta |
| 3000 | Next.js (interno) | Apenas localhost |
| 22 | SSH | Aberta (restringir IP) |
