"""
LinkedIn "Save as PDF" dosyasını parse eder.

LinkedIn PDF formatı:
- Sol sidebar: İletişim, Yetenekler, Sertifikalar, Ödüller
- Ana içerik: İsim, Başlık, Özet, Deneyim, Eğitim
- Bölüm başlıkları: Deneyim, Eğitim, Lisanslar ve sertifikalar, Projeler, Onur ve ödüller
"""

import json
import re
from pathlib import Path

import pdfplumber

DATA_DIR = Path(__file__).parent.parent / "data"

# LinkedIn PDF'de bilinen bölüm başlıkları
SECTION_HEADERS = [
    "Deneyim", "Experience",
    "Eğitim", "Education", 
    "Lisanslar ve sertifikalar", "Licenses & certifications",
    "Yetenekler", "Skills",
    "Projeler", "Projects",
    "Onur ve ödüller", "Honors-Awards", "Honors & Awards",
    "Diller", "Languages",
    "Özet", "Summary", "Hakkında", "About",
    "En Önemli Yetenekler", "Top Skills",
    "Certifications",
]


def extract_text_from_pdf(pdf_path: str) -> str:
    """PDF'den tüm metni çıkarır."""
    full_text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                full_text += text + "\n"
    return full_text


def detect_sections(text: str) -> dict[str, str]:
    """Metni bölüm başlıklarına göre ayırır."""
    lines = text.split("\n")
    sections = {}
    current_section = "header"
    current_lines = []
    
    for line in lines:
        stripped = line.strip()
        
        # Bölüm başlığı mı kontrol et
        is_header = False
        for header in SECTION_HEADERS:
            if stripped.lower() == header.lower() or stripped.lower().startswith(header.lower()):
                is_header = True
                # Önceki bölümü kaydet
                if current_lines:
                    sections[current_section] = "\n".join(current_lines).strip()
                current_section = stripped.lower()
                current_lines = []
                break
        
        if not is_header:
            current_lines.append(line)
    
    # Son bölümü kaydet
    if current_lines:
        sections[current_section] = "\n".join(current_lines).strip()
    
    return sections


def parse_header(text: str) -> dict:
    """Header bölümünden isim, başlık, konum çıkarır."""
    skip_words = ["iletişim", "bilgileri", "contact", "information"]
    lines = [l.strip() for l in text.split("\n") if l.strip() and not any(w in l.lower() for w in skip_words)]

    info = {
        "full_name": lines[0] if lines else "",
        "headline": "",
        "location": "",
        "email": "",
        "phone": "",
        "linkedin_url": "",
    }
    
    for line in lines[1:]:
        if "@" in line and "." in line:
            info["email"] = line.strip()
        elif re.match(r"^0\d{10}$", line.replace(" ", "").replace("(", "").replace(")", "")):
            info["phone"] = line.strip()
        elif "linkedin.com" in line.lower():
            info["linkedin_url"] = line.strip()
        elif any(loc in line for loc in ["Türkiye", "Turkey", "İstanbul", "Ankara", "İzmir"]):
            info["location"] = line.strip()
        elif not info["headline"] and len(line) > 10:
            info["headline"] = line.strip()
    
    return info


def parse_experience_section(text: str) -> list[dict]:
    """Deneyim bölümünü parse eder."""
    experiences = []
    if not text:
        return experiences
    
    # Her deneyim bloğunu ayır
    lines = text.split("\n")
    current_exp = None
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # Tarih satırı tespiti
        date_match = re.search(
            r"(Oca|Şub|Mar|Nis|May|Haz|Tem|Ağu|Eyl|Eki|Kas|Ara|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\s*[-–]\s*(Present|Devam|Oca|Şub|Mar|Nis|May|Haz|Tem|Ağu|Eyl|Eki|Kas|Ara|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4})",
            line
        )
        
        if date_match:
            if current_exp:
                experiences.append(current_exp)
            current_exp = {
                "company": "",
                "title": "",
                "date_range": line,
                "location": "",
                "description": "",
            }
        elif current_exp:
            if not current_exp["title"]:
                current_exp["title"] = line
            elif not current_exp["company"]:
                current_exp["company"] = line
            else:
                current_exp["description"] += line + "\n"
    
    if current_exp:
        experiences.append(current_exp)
    
    return experiences


def parse_linkedin_pdf(pdf_path: str) -> dict:
    """LinkedIn PDF'i parse edip yapılandırılmış profile dict döndürür."""
    
    pdf_path = Path(pdf_path)
    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF bulunamadı: {pdf_path}")
    
    text = extract_text_from_pdf(str(pdf_path))
    sections = detect_sections(text)
    
    # Header parse
    header_text = sections.get("header", "")
    profile = parse_header(header_text)
    
    # Hakkında / About
    profile["about"] = sections.get("özet", "") or sections.get("hakkında", "") or sections.get("summary", "") or sections.get("about", "")
    
    # Yetenekler
    skills_text = sections.get("en önemli yetenekler", "") or sections.get("yetenekler", "") or sections.get("top skills", "") or sections.get("skills", "")
    profile["skills"] = [s.strip() for s in skills_text.split("\n") if s.strip()] if skills_text else []
    
    # Deneyim
    exp_text = sections.get("deneyim", "") or sections.get("experience", "")
    profile["experiences"] = parse_experience_section(exp_text)
    
    # Eğitim - basit parse
    edu_text = sections.get("eğitim", "") or sections.get("education", "")
    profile["education"] = []
    if edu_text:
        for line in edu_text.split("\n"):
            line = line.strip()
            if line and "üniversite" in line.lower() or "university" in line.lower():
                profile["education"].append({"school": line})
    
    # Sertifikalar
    cert_text = sections.get("lisanslar ve sertifikalar", "") or sections.get("certifications", "") or sections.get("licenses & certifications", "")
    profile["certifications"] = []
    if cert_text:
        for line in cert_text.split("\n"):
            line = line.strip()
            if line and len(line) > 5:
                profile["certifications"].append({"name": line})
    
    # Projeler
    proj_text = sections.get("projeler", "") or sections.get("projects", "")
    profile["projects"] = []
    if proj_text:
        for line in proj_text.split("\n"):
            line = line.strip()
            if line and len(line) > 5:
                profile["projects"].append({"title": line})
    
    # Ödüller
    award_text = sections.get("onur ve ödüller", "") or sections.get("honors-awards", "") or sections.get("honors & awards", "")
    profile["awards"] = []
    if award_text:
        for line in award_text.split("\n"):
            line = line.strip()
            if line and len(line) > 5:
                profile["awards"].append({"title": line})
    
    # Diller
    profile["languages"] = [
        {"name": "Türkçe", "level": "Ana Dil"},
        {"name": "English", "level": "A2"},
    ]
    
    return profile


def save_profile(profile: dict, filename: str = "profile.json") -> Path:
    """Profili JSON dosyasına kaydeder."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    path = DATA_DIR / filename
    path.write_text(json.dumps(profile, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Profil kaydedildi: {path}")
    return path


if __name__ == "__main__":
    import sys
    pdf_path = sys.argv[1] if len(sys.argv) > 1 else "data/Profile.pdf"
    profile = parse_linkedin_pdf(pdf_path)
    save_profile(profile)
    print(f"Profil parse edildi: {profile.get('full_name', 'N/A')}")
