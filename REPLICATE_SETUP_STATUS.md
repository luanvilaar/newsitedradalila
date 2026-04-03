# ✅ Token do Replicate Configurado com Sucesso!

## 🎉 Status de Configuração

- ✅ Token reconhecido: `REPLICATE_TOKEN_REDACTED`
- ✅ Script pronto para gerar imagens
- ⚠️ Precisa adicionar crédito na conta Replicate

## 🔴 Erro 402 - Payment Required

Seu token está funcionando, mas a conta não tem crédito suficiente para gerar imagens.

## 💳 Como Adicionar Crédito

### Passo 1: Acesse Billing
- Vá para: https://replicate.com/account/billing
- Ou clique em "Settings" → "Billing"

### Passo 2: Adicione Método de Pagamento
- Clique no botão "Add payment method"
- Insira dados do cartão de crédito/débito
- Confirme

### Passo 3: Carregue Crédito
- Clique em "Add balance" ou "Buy balance"
- Escolha valor mínimo: **$5** (recomendado para começar)
- A $5 rende aproximadamente **2.500 imagens** em Stable Diffusion

### Passo 4: Confirme e Gere
- Tras adicionar crédito, volte ao terminal
- Execute: `npm run generate-images`

## 📊 Custo por Imagem

| Modelo | Custo | Tempo |
|--------|-------|-------|
| Stable Diffusion XL | $0.002 | 30-60s |
| Stable Diffusion 3 | $0.025 | 10-20s |

Com **$5** você consegue:
- ~2.500 imagens com SDXL
- ~200 imagens com SD3

## 🚀 Gerar Todas as Imagens

Após adicionar crédito, escolha uma opção:

### Opção 1: Gerar Todas (8 imagens)
```bash
npm run generate-images
```

### Opção 2: Gerar por Categoria
```bash
# Apenas MethodGrid cards
npm run generate-images:method

# Apenas Specialties cards
npm run generate-images:specialty
```

### Opção 3: Gerar Uma por Uma
```bash
npm run generate-images -- --single atendimento-personalizado
npm run generate-images -- --single bioimpedancia-assessment
# ... continuar com outros nomes
```

## 📋 Nomes das Imagens

**MethodGrid Cards:**
- atendimento-personalizado
- bioimpedancia-assessment
- acompanhamento-estrategico
- protocolos-individualizados

**Specialties Cards:**
- obesidade-treatment
- performance-sports
- reposicao-hormonal
- implantes-hormonais

## ✅ Checklist Final

- [ ] Crédito adicionado na conta
- [ ] Método de pagamento configurado
- [ ] Token carregado (verificar em `.env.images.local`)
- [ ] Executar `npm run generate-images`
- [ ] Imagens geradas em `/public/`
- [ ] Integrar imagens nos componentes React

## 🆘 Troubleshooting

**Erro: Token inválido**
- Verifique se o token foi copiado corretamente
- Vá para https://replicate.com/account/api-tokens e crie um novo

**Erro: API rate limit**
- Espere alguns segundos entre gerações
- O script já inclui delay de 2 segundos entre imagens

**Imagens com qualidade baixa**
- Use `npm run generate-images:specialty --model sd3` para melhor qualidade (mais caro)
- Tweaks nos prompts em `scripts/generate-images.js`

## 💡 Próximas Etapas

Após gerar as imagens:
1. Revisar qualidade e corretude
2. Integrar em `MethodGrid.tsx` e `SpecialtiesSlider.tsx`
3. Atualizar componentes com as imagens
4. Testar responsividade no mobile
5. Deploy para produção

---

**Tudo pronto! Basta adicionar crédito e começar a gerar! 🚀**