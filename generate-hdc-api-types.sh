#!/bin/bash
set -euo pipefail

OUTPUT_FILE="server/@types/hdcApiImport/index.d.ts"
SWAGGER_ENDPOINT="/v3/api-docs"

# Ensure output directory exists
OUTPUT_DIR="$(dirname "$OUTPUT_FILE")"
mkdir -p "$OUTPUT_DIR"

# Determine endpoint
if [[ "${1:-}" == "--local" ]]; then
  API_URL="http://localhost:8089$SWAGGER_ENDPOINT"
else
  API_URL="https://hdc-api-dev.hmpps.service.justice.gov.uk$SWAGGER_ENDPOINT"
fi

echo "Generating types from $API_URL"

# Generate to temp file first (safer)
TMP_FILE="$(mktemp)"

npx openapi-typescript "$API_URL" \
  | npx prettier --parser typescript --single-quote \
  > "$TMP_FILE"

# Ensure file actually contains content
if [[ ! -s "$TMP_FILE" ]]; then
  echo "Failed to generate OpenAPI types."
  rm -f "$TMP_FILE"
  exit 1
fi

# Move into final location
mv "$TMP_FILE" "$OUTPUT_FILE"

echo "Cleaning duplicate JSON adjacent structures..."

# Node script for cleaning duplicates and generating schema aliases
node - <<'EOF'
  const fs = require('fs');

  const file = 'server/@types/hdcApiImport/index.d.ts';
  let content = fs.readFileSync(file, 'utf-8');

  // Clean duplicate adjacent structures
  content = content.replace(/(&\s*\{[\s\S]*?\})\s*\1/g, '$1');

  // Match top-level schema names in components.schemas (Capitalized keys)
  // Creates code as follows and adds to the end of index.d.ts
  // export type RetryDlqResult = components['schemas']['RetryDlqResult'];
  const schemasBlockMatch = content.match(/export interface components\s*{\s*schemas\s*:\s*{([\s\S]*?)^\s*}\s*}/m);
  let aliases = '';
  let schemaNames = [];
  if (schemasBlockMatch) {
    const schemasBlock = schemasBlockMatch[1];
    schemaNames = [...schemasBlock.matchAll(/^\s*([A-Z][A-Za-z0-9_]*)\s*:\s*{/gm)].map(m => m[1]);
    aliases = schemaNames.map(name => `export type ${name} = components['schemas']['${name}'];`).join('\n');
  }

  // Append schema type aliases to file e.g. type RetryDlqResult = components['schemas']['RetryDlqResult']
  if (aliases) {
    content += '\n\n// --- Auto-generated schema type aliases ---\n' + aliases + '\n';
  }

  fs.writeFileSync(file, content);
  console.log(`Schema type aliases generated for ${schemaNames.length} schemas.`);
EOF

echo "Types successfully generated at $OUTPUT_FILE"
