"""
CV Generator - Ana Pipeline CLI

Kullanım:
  python -m cv_generator --pdf data/Profile.pdf   # PDF'den CV üret
  python -m cv_generator --render                  # Mevcut profile.json'dan CV üret
  python -m cv_generator --api                     # LinkedIn API'den temel bilgi çek
"""

import argparse
import subprocess
import sys
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"
TEMPLATES_DIR = Path(__file__).parent.parent / "templates"
OUTPUT_DIR = Path(__file__).parent.parent / "output"


def cmd_pdf(pdf_path: str):
    """LinkedIn PDF'den profile.json oluştur ve CV üret."""
    from .pdf_parser import parse_linkedin_pdf, save_profile
    
    print(f"PDF parse ediliyor: {pdf_path}")
    profile = parse_linkedin_pdf(pdf_path)
    save_profile(profile)
    print(f"Profil: {profile.get('full_name', 'N/A')}")
    
    cmd_render()


def cmd_render():
    """Mevcut profile.json'dan CV PDF üret."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    for template, output_name in [("cv.tex", "cv"), ("cv_en.tex", "cv_en")]:
        template_path = TEMPLATES_DIR / template
        if not template_path.exists():
            print(f"Şablon bulunamadı: {template_path}")
            continue
        
        print(f"Derleniyor: {template} → {output_name}.pdf")
        result = subprocess.run(
            ["xelatex", "-interaction=nonstopmode",
             "-output-directory", str(OUTPUT_DIR),
             str(template_path)],
            capture_output=True, text=True, timeout=60,
            env={**__import__("os").environ, "PATH": f"/Library/TeX/texbin:{__import__('os').environ.get('PATH', '')}"}
        )
        
        pdf_path = OUTPUT_DIR / f"{output_name}.pdf"
        if pdf_path.exists():
            print(f"  ✓ {pdf_path}")
        else:
            print(f"  ✗ Derleme hatası")
            print(result.stdout[-500:] if result.stdout else "")
    
    print("\nTamamlandı!")


def cmd_api():
    """LinkedIn API'den temel profil bilgisi çek."""
    from .linkedin_oauth import connect
    
    profile = connect()
    print(f"\nAPI'den alınan bilgiler:")
    for key, value in profile.items():
        print(f"  {key}: {value}")


def main():
    parser = argparse.ArgumentParser(description="LinkedIn CV Generator")
    parser.add_argument("--pdf", type=str, help="LinkedIn PDF dosya yolu")
    parser.add_argument("--render", action="store_true", help="Mevcut şablondan CV üret")
    parser.add_argument("--api", action="store_true", help="LinkedIn API'den bilgi çek")
    
    args = parser.parse_args()
    
    if args.pdf:
        cmd_pdf(args.pdf)
    elif args.render:
        cmd_render()
    elif args.api:
        cmd_api()
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
