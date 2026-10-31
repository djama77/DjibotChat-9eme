#!/usr/bin/env bash
set -euo pipefail
INPUT_DIR="\${1:-.}"
OUTPUT_DIR="\${2:-./ocr_ready}"

if ! command -v ocrmypdf >/dev/null 2>&1; then
  echo "OCRmyPDF est introuvable. Installez OCRmyPDF et Tesseract avant de continuer." >&2
  exit 1
fi
if [[ ! -d "$INPUT_DIR" ]]; then
  echo "Dossier PDF introuvable : $INPUT_DIR" >&2
  exit 1
fi

mkdir -p "$OUTPUT_DIR"
shopt -s nullglob
files=("$INPUT_DIR"/*.pdf "$INPUT_DIR"/*.PDF)
if [[ -z "$(printf '%s' "\${files[*]:-}")" ]]; then
  echo "Aucun PDF trouvé dans $INPUT_DIR"
  exit 0
fi

for input in "\${files[@]}"; do
  filename="$(basename "$input")"
  output="$OUTPUT_DIR/$filename"
  echo "OCR : $filename"
  ocrmypdf --skip-text --rotate-pages --deskew -l fra+eng "$input" "$output"
done

echo "Terminé. Vérifiez les PDF produits dans : $OUTPUT_DIR"
