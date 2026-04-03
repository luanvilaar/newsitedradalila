# 🚀 Guia de Configuração - Variáveis de Ambiente

Este guia te ajudará a obter todas as chaves de API necessárias para rodar a aplicação.

---

## 1️⃣ SUPABASE (Banco de Dados)

### O que é?
Supabase é um backend-as-a-service que fornece banco de dados PostgreSQL, autenticação e armazenamento.

### Como obter as chaves:

1. Acesse https://supabase.com/dashboard
2. Faça login ou crie uma conta
3. **Crie um novo projeto** ou selecione um existente
4. Vá para **Settings → API** (ícone de engrenagem no canto inferior esquerdo)
5. Procure por:
   - **Project URL** → copie para `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → copie para `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → copie para `SUPABASE_SERVICE_ROLE_KEY`

### Exemplo:
```
NEXT_PUBLIC_SUPABASE_URL=https://xyzabc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 2️⃣ OPENAI / CHATGPT

### O que é?
API do ChatGPT para integração de IA generativa na aplicação.

### Como obter a chave:

1. Acesse https://platform.openai.com/account/api-keys
2. Faça login com sua conta OpenAI (ou crie uma)
3. Clique em **"Create new secret key"**
4. Copie a chave gerada → `OPENAI_API_KEY`
5. ⚠️ **Salve a chave agora**, pois não conseguirá visualizá-la novamente

### Preços:
- Modelo: `gpt-4` ou `gpt-3.5-turbo`
- Pagamento por token consumido
- Crie um orçamento em Settings → Billing → Usage limits

### Exemplo:
```
OPENAI_API_KEY=sk-proj-abc123XYZ...
```

---

## 3️⃣ GOOGLE GEMINI (Alternativa ao ChatGPT - OPCIONAL)

### O que é?
API do Google Gemini, alternativa gratuita ou complementar ao OpenAI.

### Como obter a chave:

1. Acesse https://makersuite.google.com/app/apikey
2. Faça login com sua conta Google
3. Clique em **"Create API Key"**
4. Copie a chave → `GOOGLE_GEMINI_API_KEY`

### Nota:
- Você pode usar OPENAI **OU** GOOGLE_GEMINI
- A aplicação prioritiza OpenAI, depois Gemini

### Exemplo:
```
GOOGLE_GEMINI_API_KEY=AIzaSyD...
```

---

## 4️⃣ WHATSAPP (AVISA API)

### O que é?
Integração com WhatsApp via Avisa para envio de mensagens.

### Como obter as credenciais:

1. Acesse https://www.avisaapi.com.br
2. Crie uma conta ou faça login
3. Acesse o painel de controle (Dashboard)
4. Vá para **Configurações → API**
5. Procure por:
   - **Token/Chave API** → `AVISA_API_TOKEN`
   - **Instance ID** → `AVISA_API_INSTANCE_ID`

### Configuração do Webhook:
Se precisar receber mensagens de entrada:
1. Em Configurações → Webhooks
2. Configure a URL: `https://seu-dominio.com/api/webhooks/whatsapp`
3. Copie o **Webhook Secret** → `AVISA_WEBHOOK_SECRET`

### Exemplo:
```
AVISA_API_TOKEN=sua-token-secreto
AVISA_API_INSTANCE_ID=123456789
AVISA_WEBHOOK_SECRET=webhook-secret
```

### Custo:
- Varia conforme plano
- Geralmente R$ por mensagem

---

## 5️⃣ NOTA FISCAL ELETRÔNICA (OPCIONAL)

### O que é?
Integração para emissão de notas fiscais eletrônicas (para João Pessoa - PB).

### Como obter as credenciais:

1. Acesse https://www.nuvemfiscal.com.br
2. Crie uma conta
3. Vá para **API → Credenciais**
4. Copie:
   - **Client ID** → `NFE_API_CLIENT_ID`
   - **API Key** → `NFE_API_KEY`

### Dados do Prestador:
Você precisará de:
- **CNPJ**: Número CNPJ da sua empresa
- **Razão Social**: Nome oficial da empresa
- **Inscrição Municipal**: Número de IM

### Exemplo:
```
NFE_API_CLIENT_ID=abc123
NFE_API_KEY=sua-api-key
NFE_JP_PRESTADOR_CNPJ=00000000000000
NFE_JP_PRESTADOR_RAZAO_SOCIAL=Dra. Dalila Lucena
NFE_JP_PRESTADOR_INSCRICAO_MUNICIPAL=123456
```

---

## ✅ Checklist de Configuração

- [ ] Supabase URL configurada
- [ ] Supabase ANON KEY configurada
- [ ] Supabase SERVICE ROLE KEY configurada
- [ ] OpenAI API Key configurada
- [ ] WhatsApp Avisa Token configurado
- [ ] WhatsApp Avisa Instance ID configurado
- [ ] Google Gemini (opcional)
- [ ] NFe (se aplicável)

---

## 🔧 Próximos Passos

Após preencher as variáveis:

1. **Salve o arquivo** `.env.local`
2. **Reinicie o servidor**:
   ```bash
   npm run dev
   ```
3. **Acesse** http://localhost:3000
4. **Teste o login** em http://localhost:3000/login

---

## 🆘 Troubleshooting

### Erro: "NEXT_PUBLIC_SUPABASE_URL not found"
→ Verifique se as variáveis de Supabase estão preenchidas em `.env.local`
→ Reinicie o servidor (`npm run dev`)

### Erro: "ChatGPT API key invalid"
→ Verifique se a chave é válida em https://platform.openai.com/account/api-keys
→ Pode ter expirado ou não ter créditos

### Erro: "WhatsApp não envia mensagens"
→ Verifique Token e Instance ID do Avisa
→ Teste a API em https://www.avisaapi.com.br/docs

---

## 📚 Documentação Oficial

- **Supabase**: https://supabase.com/docs
- **OpenAI**: https://platform.openai.com/docs
- **Google Gemini**: https://ai.google.dev
- **Avisa API**: https://www.avisaapi.com.br/docs

---

**⚠️ IMPORTANTE**: Nunca compartilhe suas chaves de API. Elas são secretas!
