# Assistente Virtual - Setup Completo

## Overview

O assistente virtual da Dra. Dalila Lucena usa:
- **OpenAI GPT-4** para processamento de linguagem natural
- **Vercel AI SDK** para streaming de respostas
- **n8n** para automações (agendamento, notificações, leads)

## Variáveis de Ambiente

Adicione ao seu `.env.local`:

```bash
# OpenAI (obrigatório)
OPENAI_API_KEY=sk-...

# n8n Webhooks (opcional - configure quando tiver n8n rodando)
N8N_WEBHOOK_LEAD=https://seu-n8n.com/webhook/lead
N8N_WEBHOOK_SCHEDULE=https://seu-n8n.com/webhook/schedule
```

## Funcionalidades do Assistente

| Função | Descrição | Requer n8n? |
|--------|-----------|-------------|
| Responder dúvidas | Informações sobre tratamentos, médica, clínica | ❌ |
| Agendar consultas | Link do Google Calendar + WhatsApp | ❌ |
| Capturar leads | Nome, telefone, email, interesse | ✅ Opcional |
| Consultar paciente | Dados do paciente logado | ❌ |
| Notificação WhatsApp | Envio automático ao agendar | ✅ Obrigatório |

## Setup n8n (Modo Fácil)

### Opção 1: n8n Cloud (Recomendado)

1. Crie conta gratuita em [n8n.cloud](https://n8n.cloud)
2. Crie os workflows abaixo
3. Copie as URLs dos webhooks para seu `.env.local`

### Opção 2: n8n Self-Hosted (Docker)

```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v n8n_data:/home/node/.n8n \
  docker.n8n.io/n8nio/n8n
```

Acesse http://localhost:5678

## Workflows n8n

### 1. Workflow de Captura de Leads

```
[Webhook] → [Google Sheets / Supabase] → [WhatsApp Notification]
```

**Nodes:**
1. **Webhook** - Recebe dados do chat
2. **Google Sheets** - Salva lead na planilha
3. **WhatsApp Business API** - Notifica equipe

**Configuração do Webhook:**
- Method: POST
- Path: /lead
- Response Mode: Last Node

**JSON esperado:**
```json
{
  "name": "João Silva",
  "phone": "5581999999999",
  "email": "joao@email.com",
  "interest": "Emagrecimento",
  "source": "chat_assistant",
  "timestamp": "2026-03-04T10:30:00Z"
}
```

### 2. Workflow de Agendamento (Avançado)

```
[Webhook] → [Google Calendar] → [WhatsApp] → [Email Confirmação]
```

**Este workflow requer:**
- Google Calendar API configurada
- WhatsApp Business API ou Twilio
- SMTP para emails

## Integrações Opcionais

### WhatsApp Business API

Para enviar notificações automáticas:

1. Configure WhatsApp Business API na Meta
2. No n8n, adicione node "HTTP Request" ou "WhatsApp Business Cloud"
3. Template de mensagem:

```
Olá! 👋

Novo lead recebido pelo assistente virtual:

📋 Nome: {{name}}
📞 Telefone: {{phone}}
💡 Interesse: {{interest}}
📅 Data: {{timestamp}}

Entrar em contato!
```

### Google Sheets (para leads simples)

1. Crie planilha no Google Sheets
2. Colunas: Nome | Telefone | Email | Interesse | Data | Fonte
3. No n8n, use node "Google Sheets" para append

## Testando o Assistente

1. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

2. Acesse http://localhost:3000

3. Clique no botão de chat flutuante (canto inferior direito)

4. Teste as funcionalidades:
   - "Quais tratamentos vocês oferecem?"
   - "Quero agendar uma consulta de emagrecimento"
   - "Onde fica a clínica em Recife?"

## Personalização

### Editar informações da clínica

Arquivo: `src/app/api/chat/route.ts`

Atualize o objeto `CLINIC_INFO` com:
- Dados da médica
- Tratamentos oferecidos
- Endereços das clínicas
- Números de WhatsApp

### Editar prompt do assistente

No mesmo arquivo, modifique `SYSTEM_PROMPT` para ajustar:
- Tom de voz
- Diretrizes de resposta
- Limitações

## Troubleshooting

### Chat não responde
- Verifique se `OPENAI_API_KEY` está configurada
- Cheque logs do servidor: `npm run dev`

### Leads não chegam no n8n
- Confirme URL do webhook em `.env.local`
- Teste webhook manualmente com curl:
```bash
curl -X POST https://seu-n8n.com/webhook/lead \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","phone":"5581999999999","interest":"Teste"}'
```

### Widget não aparece
- Verifique se está acessando páginas da landing (não dashboard)
- Inspecione console do browser para erros

## Arquitetura

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│   ChatWidget    │────▶│  /api/chat   │────▶│   OpenAI    │
│   (Frontend)    │◀────│  (Backend)   │◀────│   GPT-4     │
└─────────────────┘     └──────┬───────┘     └─────────────┘
                               │
                               │ Webhooks
                               ▼
                        ┌──────────────┐
                        │     n8n      │
                        │  (Automação) │
                        └──────┬───────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
       ┌──────────┐     ┌──────────┐     ┌──────────┐
       │  Sheets  │     │ WhatsApp │     │  Email   │
       └──────────┘     └──────────┘     └──────────┘
```

## Próximos Passos

1. [ ] Configurar OPENAI_API_KEY no .env.local
2. [ ] Criar conta n8n Cloud
3. [ ] Criar workflow de leads
4. [ ] Configurar WhatsApp Business (opcional)
5. [ ] Testar fluxo completo
