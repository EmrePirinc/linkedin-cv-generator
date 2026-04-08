"""
Web arayüzünden CV üretimi için yardımcı script.
Next.js generate-cv route'u tarafından çalıştırılır.

Kullanım:
  python3 cv_generator/web_generate.py [variant]
  variant: general (varsayılan) | sap | ai
"""

import json
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).parent.parent
DATA_DIR = ROOT_DIR / "data"
OUTPUT_DIR = ROOT_DIR / "output"
DOCS_DIR = ROOT_DIR / "docs"

sys.path.insert(0, str(ROOT_DIR))

from cv_generator.template_engine import generate_latex, compile_pdf

VARIANT_TEMPLATES = {
    "general": {"tr": "cv_tr", "en": "cv_en"},
    "sap":     {"tr": "cv_tr_sap", "en": "cv_en"},
    "ai":      {"tr": "cv_tr_ai", "en": "cv_en"},
}

def main():
    variant = sys.argv[1] if len(sys.argv) > 1 else "general"
    if variant not in VARIANT_TEMPLATES:
        print(f"Bilinmeyen varyant: {variant}. Genel kullanılıyor.", file=sys.stderr)
        variant = "general"

    profile_path = DATA_DIR / "profile_web.json"
    if not profile_path.exists():
        print(f"Profil bulunamadı: {profile_path}", file=sys.stderr)
        sys.exit(1)

    profile = json.loads(profile_path.read_text(encoding="utf-8"))

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    generated = []
    for lang in ["tr", "en"]:
        output_name = f"cv_{lang}"
        print(f"Üretiliyor: {output_name}.pdf ({lang.upper()}, {variant})...")

        latex = generate_latex(profile, lang=lang)
        pdf_path = compile_pdf(latex, output_name)

        # docs/ klasörüne de kopyala (GitHub Pages)
        DOCS_DIR.mkdir(parents=True, exist_ok=True)
        docs_pdf = DOCS_DIR / f"{output_name}.pdf"
        docs_pdf.write_bytes(pdf_path.read_bytes())

        generated.append(str(pdf_path))
        print(f"  OK: {pdf_path}")

    print(f"DONE:{','.join(generated)}")


if __name__ == "__main__":
    main()
