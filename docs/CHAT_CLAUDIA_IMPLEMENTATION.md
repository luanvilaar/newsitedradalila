# Implementação Claudia (Recepcionista Virtual)

## O que foi implementado

1. **Prompt principal da Claudia** no endpoint `POST /api/chat`
2. **Contexto do sistema (developer prompt)** por requisição
3. **Linha machine-readable `AGENT_META`** no formato solicitado
4. **Endpoint de Memory Writer** em `POST /api/chat/memory`
5. **Estrutura Supabase para WhatsApp** (migration `006_whatsapp_conversations.sql`)
6. **Comando de rollback**: `npm run fimdaclaudia`

## Formato esperado no `/api/chat`

Payload:

```json
{
  "messages": [{ "role": "user", "content": "..." }],
  "systemContext": {
    "channel": "WhatsApp",
    "wa_phone": "55819...",
    "wa_profile_name": "Nome",
    "default_city_or_null": "Recife",
    "consulta_valor_or_null": "R$ 450",
    "retorno_valor_or_null": "R$ 300",
    "bio_valor_or_null": null,
    "slots_json_or_text": [{ "date": "2026-03-10", "time": "14:00" }],
    "memory_summary_text_or_empty": "Paciente busca emagrecimento"
  }
}
```

Resposta:

```json
{
  "message": "Texto limpo para exibir ao usuário",
  "rawMessage": "Texto completo com <<AGENT_META ... >>",
  "agentMeta": {
    "intent": "schedule",
    "collect": {
      "name": false,
      "city": true,
      "goal": false,
      "period": true,
      "whatsapp": false
    },
    "handoff": false
  }
}
```

## Formato esperado no `/api/chat/memory`

Payload:

```json
{
  "history": [
    { "role": "user", "content": "Quero marcar consulta" },
    { "role": "assistant", "content": "Você prefere Recife ou João Pessoa?" }
  ],
  "latestUserMessage": "Recife, de tarde"
}
```

Retorno:

```json
{
  "memory": {
    "patient_name": null,
    "city_preference": "Recife",
    "main_goal": null,
    "preferred_period": "tarde",
    "requested_service": "consulta",
    "notes": null
  }
}
```

## Rollback

Para desfazer esta implementação específica:

```bash
npm run fimdaclaudia
```
