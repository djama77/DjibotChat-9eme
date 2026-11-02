#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then INPUT_DIR="."; else INPUT_DIR="$1"; fi
if [[ $# -lt 2 ]]; then OUTPUT_DIR="./ocr_ready"; else OUTPUT_DIR="$2"; fi

if ! command -v ocrmypdf >/dev/null 2>&1; then
  echo "OCRmyPDF est introuvable. Installez OCRmyPDF et Tesseract avant de continuer." >&2
  exit 1
fi
if [[ ! -d "$INPUT_DIR" ]]; then
  echo "Dossier PDF introuvable : $INPUT_DIR" >&2
  exit 1
fi

mkdir -p "$OUTPUT_DIR"
found=0
for input in "$INPUT_DIR"/*.pdf "$INPUT_DIR"/*.PDF; do
  [[ -f "$input" ]] || continue
  found=1
  filename="$(basename "$input")"
  output="$OUTPUT_DIR/$filename"
  echo "OCR : $filename"
  ocrmypdf --skip-text --rotate-pages --deskew -l fra+eng "$input" "$output"
done

if [[ "$found" -eq 0 ]]; then
  echo "Aucun PDF trouvé dans $INPUT_DIR"
  exit 0
fi

echo "Terminé. Vérifiez les PDF produits dans : $OUTPUT_DIR"
