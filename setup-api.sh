#!/bin/bash

# Script Helper para Configuração de API de Imagens
# Uso: ./setup-api.sh [replicate|openai]

echo "🎨 CONFIGURADOR DE API PARA GERAÇÃO DE IMAGENS"
echo "=============================================="

if [ "$1" = "replicate" ]; then
    echo "🚀 Configurando Replicate (Stable Diffusion)"
    echo ""
    echo "1. Acesse: https://replicate.com/"
    echo "2. Crie conta gratuita"
    echo "3. Vá para: https://replicate.com/account/api-tokens"
    echo "4. Crie um token"
    echo "5. Cole o token abaixo:"
    echo ""
    read -p "Token do Replicate: " token
    echo "export REPLICATE_API_TOKEN='$token'" >> ~/.zshrc
    echo "✅ Token configurado! Reinicie o terminal ou execute: source ~/.zshrc"
    echo ""
    echo "🧪 Teste: npm run generate-images -- --single atendimento-personalizado"

elif [ "$1" = "openai" ]; then
    echo "🎯 Configurando OpenAI (DALL-E 3)"
    echo ""
    echo "1. Acesse: https://platform.openai.com/"
    echo "2. Faça login ou crie conta"
    echo "3. Vá para API Keys: https://platform.openai.com/api-keys"
    echo "4. Crie uma nova chave"
    echo "5. Adicione crédito (~$5 para começar)"
    echo "6. Cole a chave abaixo:"
    echo ""
    read -p "Chave da OpenAI: " key
    echo "export OPENAI_API_KEY='$key'" >> ~/.zshrc
    echo "✅ Chave configurada! Reinicie o terminal ou execute: source ~/.zshrc"
    echo ""
    echo "🧪 Teste: npm run generate-images -- --single atendimento-personalizado"

else
    echo "📋 USO:"
    echo "  ./setup-api.sh replicate  # Para Replicate (gratuito)"
    echo "  ./setup-api.sh openai     # Para OpenAI (pago)"
    echo ""
    echo "💡 RECOMENDAÇÃO: Comece com 'replicate' (gratuito para testes)"
fi