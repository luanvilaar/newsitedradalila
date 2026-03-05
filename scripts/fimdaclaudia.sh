#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "Revertendo implementação Claudia..."

# Restaura arquivos rastreados alterados nesta implementação
TRACKED_FILES=(
  "src/app/api/chat/route.ts"
  "src/components/shared/ChatWidget.tsx"
)

git restore --source=HEAD -- "${TRACKED_FILES[@]}" || true

# Remove arquivos criados nesta implementação
rm -f "src/app/api/chat/memory/route.ts"
rm -f "supabase/migrations/006_whatsapp_conversations.sql"

echo "Rollback concluído."
