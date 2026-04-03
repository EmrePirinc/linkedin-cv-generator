"""
LinkedIn Fotoğraf → Yapılandırılmış Veri Parser

Bu modül LinkedIn ekran görüntülerinden çıkarılan metin verisini
yapılandırılmış JSON formatına dönüştürür.

Akış:
1. Kullanıcı LinkedIn fotoğraflarını atar (veya ileride bot kendi çeker)
2. Fotoğraflardan metin çıkarılır (Claude Vision / OCR)
3. Metin kategorilere ayrılır
4. JSON profil dosyası oluşturulur
5. LaTeX şablonuna doldurulur
6. PDF derlenir
"""

import json
from pathlib import Path
from dataclasses import dataclass, field, asdict
from typing import Optional

DATA_DIR = Path(__file__).parent.parent / "data"


@dataclass
class Experience:
    company: str
    title: str
    employment_type: str = ""  # Tam zamanlı, Stajyer, Dönemsel, Kendi işim
    start_date: str = ""
    end_date: str = ""  # "Devam Ediyor" if current
    location: str = ""
    work_mode: str = ""  # Ofisten, Uzaktan, Hibrit
    description: str = ""
    parent_company: str = ""  # Alt pozisyonlar için üst şirket
    skills: list[str] = field(default_factory=list)


@dataclass
class Education:
    school: str
    degree: str = ""
    field_of_study: str = ""
    start_date: str = ""
    end_date: str = ""
    grade: str = ""
    skills: list[str] = field(default_factory=list)


@dataclass
class Certification:
    name: str
    authority: str = ""
    date: str = ""
    credential_id: str = ""
    skills: list[str] = field(default_factory=list)


@dataclass
class Project:
    title: str
    start_date: str = ""
    end_date: str = ""
    association: str = ""
    description: str = ""
    skills: list[str] = field(default_factory=list)


@dataclass
class Award:
    title: str
    issuer: str = ""
    date: str = ""
    description: str = ""


@dataclass
class LinkedInProfile:
    """LinkedIn profilinin tam yapılandırılmış temsili."""
    
    # Kişisel bilgiler
    full_name: str = ""
    headline: str = ""
    location: str = ""
    email: str = ""
    phone: str = ""
    linkedin_url: str = ""
    
    # Hakkında / Ön yazı
    about: str = ""
    
    # Yetenekler
    skills: list[str] = field(default_factory=list)
    
    # Deneyim
    experiences: list[Experience] = field(default_factory=list)
    
    # Eğitim
    education: list[Education] = field(default_factory=list)
    
    # Sertifikalar
    certifications: list[Certification] = field(default_factory=list)
    
    # Projeler
    projects: list[Project] = field(default_factory=list)
    
    # Ödüller
    awards: list[Award] = field(default_factory=list)
    
    # Diller
    languages: list[dict] = field(default_factory=list)
    
    def save(self, filename: str = "profile.json"):
        """Profili JSON dosyasına kaydeder."""
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        path = DATA_DIR / filename
        path.write_text(
            json.dumps(asdict(self), indent=2, ensure_ascii=False),
            encoding="utf-8"
        )
        print(f"Profil kaydedildi: {path}")
        return path
    
    @classmethod
    def load(cls, filename: str = "profile.json") -> "LinkedInProfile":
        """JSON dosyasından profil yükler."""
        path = DATA_DIR / filename
        data = json.loads(path.read_text(encoding="utf-8"))
        
        # Nested dataclass'ları yeniden oluştur
        data["experiences"] = [Experience(**e) for e in data.get("experiences", [])]
        data["education"] = [Education(**e) for e in data.get("education", [])]
        data["certifications"] = [Certification(**c) for c in data.get("certifications", [])]
        data["projects"] = [Project(**p) for p in data.get("projects", [])]
        data["awards"] = [Award(**a) for a in data.get("awards", [])]
        
        return cls(**data)


# ============================================================
# FOTOĞRAF PARSE KURALLARI
# ============================================================
# 
# Kullanıcıdan istenen fotoğraflar (ZORUNLU):
#
# 1. PROFIL FOTOĞRAFI  → İsim, başlık, konum, şirket
# 2. HAKKINDA           → Ön yazı / about metni
# 3. DENEYİM            → Tüm iş deneyimleri (scroll ile tamamı)
# 4. EĞİTİM             → Üniversite bilgileri
# 5. SERTİFİKALAR       → Lisanslar ve sertifikalar (scroll ile tamamı)
# 6. PROJELER           → Proje listesi (scroll ile tamamı)
# 7. ONUR VE ÖDÜLLER    → Ödüller (varsa)
# 8. YETENEKLER         → Yetenek listesi (opsiyonel, deneyimlerden çıkarılabilir)
#
# Parse algoritması:
#
# Her fotoğraf → metin çıkarımı (Claude Vision) → kategori tespiti → 
# ilgili dataclass'a dönüştürme → LinkedInProfile'a ekleme
#
# Kategori tespiti anahtar kelimeleri:
# - "Deneyim" / "Experience" → experiences
# - "Eğitim" / "Education" → education  
# - "Hakkında" / "About" → about
# - "Lisanslar ve sertifikalar" / "Licenses" → certifications
# - "Projeler" / "Projects" → projects
# - "Onur ve ödüller" / "Honors" → awards
# - "Yetenekler" / "Skills" → skills
# ============================================================


REQUIRED_SCREENSHOTS = {
    "profile": "Profil sayfası üst kısım (isim, başlık, konum)",
    "about": "Hakkında bölümü (tam metin görünsün)",
    "experience": "Deneyim bölümü (tüm deneyimler, scroll ile)",
    "education": "Eğitim bölümü",
    "certifications": "Lisanslar ve sertifikalar (tüm liste, scroll ile)",
    "projects": "Projeler bölümü (tüm projeler, scroll ile)",
    "awards": "Onur ve ödüller (varsa)",
}

OPTIONAL_SCREENSHOTS = {
    "skills": "Yetenekler bölümü (opsiyonel)",
}


def get_required_screenshots_prompt() -> str:
    """Kullanıcıdan istenen fotoğrafların açıklama metnini döndürür."""
    lines = ["LinkedIn CV oluşturmak için aşağıdaki ekran görüntülerini at:\n"]
    lines.append("ZORUNLU:")
    for i, (key, desc) in enumerate(REQUIRED_SCREENSHOTS.items(), 1):
        lines.append(f"  {i}. {desc}")
    lines.append("\nOPSİYONEL:")
    for key, desc in OPTIONAL_SCREENSHOTS.items():
        lines.append(f"  - {desc}")
    lines.append("\nTüm fotoğrafları tek mesajda atabilirsin.")
    return "\n".join(lines)
