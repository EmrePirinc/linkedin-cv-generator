"""
LaTeX Şablon Motoru

LinkedIn profil verisini LaTeX şablonuna doldurur ve PDF derler.
Hem Türkçe hem İngilizce CV üretir.

== CV OPTİMİZASYON KURALLARI ==
Bu motor aşağıdaki kurallara göre CV üretir:

FORMAT:
- Maks 2 sayfa, tek sütun, Helvetica 8pt
- Boşluklar: titlespacing 7pt/3pt, vspace 3pt, parskip 1pt
- Grafik/ikon/tablo/fotoğraf YOK (ATS uyumlu)
- XeLaTeX ile derleme (UTF-8 Unicode)

BÖLÜM BAŞLIKLARI:
- Türkçe: HAKKIMDA (ÖN YAZI değil!), YETENEKLER, İŞ DENEYİMİ, PROJELER, EĞİTİM,
  LİSANSLAR VE SERTİFİKALAR, ONUR VE ÖDÜLLER, DİLLER, REFERANSLAR
- İngilizce: ABOUT ME (COVER LETTER değil!), SKILLS, WORK EXPERIENCE, PROJECTS,
  EDUCATION, LICENSES AND CERTIFICATIONS, HONORS AND AWARDS, LANGUAGES, REFERENCES

SIRALAMA:
- Tüm bölümlerde TERS KRONOLOJİK (en güncel en üstte)
- İş deneyimi, eğitim, projeler, sertifikalar hepsi bu kurala uyar

ATS:
- Telefon uluslararası format: +90 5XX XXX XX XX
- LinkedIn/GitHub \href ile tıklanabilir
- Sertifika doğrulama linki (Credly) eklenebilir
- Standart bullet point (•), metin tabanlı PDF

İÇERİK:
- Bullet point'ler görev değil BAŞARI anlatır (rakamlarla)
- "Uçtan uca" max 1 kez kullanılır
- Kişisel özellikler yazılmaz (hobi, karakter vs.)
- Eğitim geçişleri açıklanır (transfer, ön lisans nedeni)
- Benzer ödüller tek paragrafta özetlenir
"""

import subprocess
import json
from pathlib import Path
from typing import Optional

TEMPLATES_DIR = Path(__file__).parent.parent / "templates"
OUTPUT_DIR = Path(__file__).parent.parent / "output"
DATA_DIR = Path(__file__).parent.parent / "data"

# Türkçe ay isimleri
MONTHS_TR = {
    "1": "Ocak", "2": "Şubat", "3": "Mart", "4": "Nisan",
    "5": "Mayıs", "6": "Haziran", "7": "Temmuz", "8": "Ağustos",
    "9": "Eylül", "10": "Ekim", "11": "Kasım", "12": "Aralık"
}

# İngilizce ay isimleri
MONTHS_EN = {
    "1": "January", "2": "February", "3": "March", "4": "April",
    "5": "May", "6": "June", "7": "July", "8": "August",
    "9": "September", "10": "October", "11": "November", "12": "December"
}


def escape_latex(text: str) -> str:
    """LaTeX özel karakterlerini escape eder."""
    replacements = {
        "&": r"\&",
        "%": r"\%",
        "$": r"\$",
        "#": r"\#",
        "_": r"\_",
        "~": r"\textasciitilde{}",
        "^": r"\textasciicircum{}",
    }
    for char, replacement in replacements.items():
        text = text.replace(char, replacement)
    return text


def generate_experience_block(exp: dict, lang: str = "tr") -> str:
    """Tek bir deneyim bloğunu LaTeX formatında üretir."""
    lines = []
    
    # Ana şirket mi alt pozisyon mu?
    if exp.get("parent_company"):
        # Alt pozisyon (AIFTeam altındaki roller gibi)
        emp_type = exp.get("employment_type", "")
        type_str = f" · {emp_type}" if emp_type else ""
        lines.append(f"{{\\small \\textbf{{{escape_latex(exp['title'])}}}{type_str} \\hfill {exp['start_date']} -- {exp['end_date']}}}")
        if exp.get("work_mode"):
            lines.append(f"\\\\{{\\small {exp['work_mode']}}}")
    else:
        # Ana şirket
        date_str = f"{exp['start_date']} -- {exp['end_date']}" if exp.get("start_date") else ""
        lines.append(f"\\textbf{{{escape_latex(exp['title'])}}} \\hfill {{\\small {date_str}}}")
        if exp.get("company") and exp["company"] != exp["title"]:
            lines.append(f"\\\\{{\\small \\textit{{{escape_latex(exp['company'])}}}")
            if exp.get("location"):
                lines[-1] += f" -- {exp['location']}"
            lines[-1] += "}"
    
    # Açıklama
    if exp.get("description"):
        lines.append("\\begin{itemize}")
        for bullet in exp["description"].split("\n"):
            bullet = bullet.strip()
            if bullet:
                lines.append(f"\\item {{\\small {escape_latex(bullet)}}}")
        lines.append("\\end{itemize}")
    
    return "\n".join(lines)


def sort_reverse_chronological(items: list, date_key: str = "start_date") -> list:
    """Öğeleri ters kronolojik sıralar (en güncel en üstte).
    'Devam Ediyor' / 'Present' olanlar en üste gelir."""
    import re

    def parse_date(item):
        date_str = item.get(date_key, "") or item.get("date", "") or ""
        # "Devam Ediyor" / "Present" en üstte
        end = item.get("end_date", "")
        if end and ("devam" in end.lower() or "present" in end.lower()):
            return (9999, 12)
        # Yıl ve ay çıkar
        numbers = re.findall(r'\d+', date_str)
        if len(numbers) >= 2:
            year = int(numbers[-1]) if int(numbers[-1]) > 100 else int(numbers[0])
            month = int(numbers[0]) if int(numbers[0]) <= 12 else 1
            return (year, month)
        elif len(numbers) == 1:
            return (int(numbers[0]), 1)
        return (0, 0)

    return sorted(items, key=parse_date, reverse=True)


def generate_latex(profile: dict, lang: str = "tr") -> str:
    """Profil verisinden tam LaTeX dosyası üretir."""
    
    # Şablon başlangıcı
    latex = r"""\documentclass[a4paper,8pt]{article}

\usepackage[top=0.25in, bottom=0.25in, left=0.4in, right=0.4in]{geometry}
\usepackage{fontspec}
\usepackage{enumitem}
\usepackage{titlesec}
\usepackage[hidelinks]{hyperref}

\setmainfont{Helvetica}
\setlength{\parindent}{0pt}
\setlength{\parskip}{1pt}

\titleformat{\section}{\normalsize\bfseries}{}{0em}{}[\titlerule]
\titlespacing*{\section}{0pt}{7pt}{3pt}

\setlist[itemize]{nosep, topsep=1pt, leftmargin=1.5em, label=\textbullet, itemsep=0pt, parsep=0pt}

\pagestyle{empty}

\begin{document}
"""
    
    # Kişisel bilgiler
    name = escape_latex(profile.get("full_name", ""))
    headline = escape_latex(profile.get("headline", ""))
    location = profile.get("location", "")
    email = escape_latex(profile.get("email", ""))
    phone = profile.get("phone", "")
    linkedin = profile.get("linkedin_url", "")
    
    contact_parts = [p for p in [location, email, phone] if p]
    contact_line = " | ".join(contact_parts)
    
    # LinkedIn/GitHub tıklanabilir linkler
    linkedin_display = linkedin.replace("https://", "").replace("http://", "")
    linkedin_href = linkedin if linkedin.startswith("http") else f"https://{linkedin}"
    github = profile.get("github_url", "")
    github_display = github.replace("https://", "").replace("http://", "")
    github_href = github if github.startswith("http") else f"https://{github}"

    links_line = f"LinkedIn: \\href{{{linkedin_href}}}{{{linkedin_display}}}"
    if github:
        links_line += f" \\textbar{{}} GitHub: \\href{{{github_href}}}{{{github_display}}}"

    latex += f"""
\\begin{{center}}
{{\\Large\\bfseries {name}}}\\\\[2pt]
{{\\small {headline}}}\\\\[2pt]
{{\\small {contact_line}}}\\\\[1pt]
{{\\small {links_line}}}
\\end{{center}}

\\vspace{{-2pt}}
"""
    
    # Ön yazı / Cover Letter
    section_title = "HAKKIMDA" if lang == "tr" else "ABOUT ME"
    about = escape_latex(profile.get("about", ""))
    if about:
        latex += f"""
\\section{{{section_title}}}
{{\\small {about}}}
"""
    
    # Yetenekler / Skills
    section_title = "YETENEKLER" if lang == "tr" else "SKILLS"
    skills = profile.get("skills", [])
    if skills:
        skills_str = ", ".join(skills)
        latex += f"""
\\section{{{section_title}}}
{{\\small {escape_latex(skills_str)}}}
"""
    
    # İş Deneyimi / Work Experience
    section_title = "İŞ DENEYİMİ" if lang == "tr" else "WORK EXPERIENCE"
    experiences = sort_reverse_chronological(profile.get("experiences", []))
    if experiences:
        latex += f"\n\\section{{{section_title}}}\n"
        
        current_parent = None
        for exp in experiences:
            parent = exp.get("parent_company", "")
            
            if parent and parent != current_parent:
                # Yeni üst şirket başlığı
                duration = exp.get("parent_duration", "")
                latex += f"\n\\textbf{{{escape_latex(parent)}}} \\hfill {{\\small {duration}}}\\\\\n"
                latex += f"{{\\small \\textit{{{exp.get('location', '')}}}}}\n"
                current_parent = parent
            
            latex += "\n\\vspace{3pt}\n"
            latex += generate_experience_block(exp, lang)
            latex += "\n"
    
    # Projeler / Projects (Eğitim'den önce — sayfa bölünmesi riskini azaltır)
    section_title = "PROJELER" if lang == "tr" else "PROJECTS"
    projects = sort_reverse_chronological(profile.get("projects", []))
    if projects:
        latex += f"\n\\section{{{section_title}}}\n"
        for proj in projects:
            title = escape_latex(proj.get("title", ""))
            dates = f"{proj.get('start_date', '')} -- {proj.get('end_date', '')}"
            desc = escape_latex(proj.get("description", ""))
            
            latex += f"\n\\textbf{{{title}}} \\hfill {{\\small {dates}}}\\\\\n"
            if desc:
                latex += f"{{\\small {desc}}}\n"
            latex += "\n\\vspace{3pt}\n"
    
    # Eğitim / Education
    section_title = "EĞİTİM" if lang == "tr" else "EDUCATION"
    education = sort_reverse_chronological(profile.get("education", []))
    if education:
        latex += f"\n\\section{{{section_title}}}\n"
        for edu in education:
            school = escape_latex(edu.get("school", ""))
            degree = escape_latex(edu.get("degree", ""))
            field = escape_latex(edu.get("field_of_study", ""))
            dates = f"{edu.get('start_date', '')} -- {edu.get('end_date', '')}"

            latex += f"\n\\textbf{{{school}}} \\hfill {{\\small {dates}}}\\\\\n"
            degree_parts = [p for p in [degree, field] if p]
            degree_str = ", ".join(degree_parts)
            if edu.get("grade"):
                grade_label = "Not" if lang == "tr" else "GPA"
                degree_str += f" -- {grade_label}: {edu['grade']}"
            if edu.get("note"):
                degree_str += f" -- {escape_latex(edu['note'])}"
            latex += f"{{\\small \\textit{{{degree_str}}}}}\n"
            latex += "\n\\vspace{3pt}\n"

    # Sertifikalar / Certifications
    section_title = "LİSANSLAR VE SERTİFİKALAR" if lang == "tr" else "LICENSES AND CERTIFICATIONS"
    certs = sort_reverse_chronological(profile.get("certifications", []), date_key="date")
    if certs:
        latex += f"\n\\section{{{section_title}}}\n{{\\small\n"
        for cert in certs:
            name = escape_latex(cert.get("name", ""))
            authority = escape_latex(cert.get("authority", ""))
            date = cert.get("date", "")
            line = f"\\textbf{{{name}}}"
            if authority:
                line += f" -- {authority}"
            if date:
                line += f" ({date})"
            latex += line + "\\\\\n"
        latex += "}\n"
    
    # Ödüller / Awards
    section_title = "ONUR VE ÖDÜLLER" if lang == "tr" else "HONORS AND AWARDS"
    awards = profile.get("awards", [])
    if awards:
        latex += f"\n\\section{{{section_title}}}\n{{\\small\n"
        for award in awards:
            title = escape_latex(award.get("title", ""))
            issuer = escape_latex(award.get("issuer", ""))
            date = award.get("date", "")
            desc = escape_latex(award.get("description", ""))
            line = f"\\textbf{{{title}}} -- {issuer} ({date})"
            if desc:
                line += f" -- {desc}"
            latex += line + "\\\\\n"
        latex += "}\n"
    
    # Diller / Languages
    section_title = "DİLLER" if lang == "tr" else "LANGUAGES"
    languages = profile.get("languages", [])
    if languages:
        lang_strs = []
        for l in languages:
            s = l.get("name", "")
            if l.get("level"):
                s += f" ({l['level']})"
            lang_strs.append(s)
        latex += f"\n\\section{{{section_title}}}\n"
        latex += f"{{\\small {', '.join(lang_strs)}}}\n"
    
    # Referanslar / References
    section_title = "REFERANSLAR" if lang == "tr" else "REFERENCES"
    references = profile.get("references", [])
    if references:
        latex += f"\n\\section{{{section_title}}}\n{{\\small\n"
        for i, ref in enumerate(references):
            name = escape_latex(ref.get("name", ""))
            institution = escape_latex(ref.get("institution", ""))
            department = escape_latex(ref.get("department", ""))
            email = ref.get("email", "")
            phone = ref.get("phone", "")

            line = f"\\textbf{{{name}}}"
            if institution:
                line += f" -- {institution}"
            if department:
                line += f", {department}"
            latex += line + "\\\\\n"

            contact_parts = []
            if email:
                contact_parts.append(email)
            if phone:
                contact_parts.append(phone)
            if contact_parts:
                latex += " | ".join(contact_parts)

            if i < len(references) - 1:
                latex += "\\\\[3pt]\n"
            else:
                latex += "\n"
        latex += "}\n"

    latex += "\n\\end{document}\n"
    return latex


def compile_pdf(latex_source: str, output_name: str) -> Path:
    """LaTeX kaynağını PDF'e derler."""
    import tempfile
    
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    with tempfile.TemporaryDirectory() as tmpdir:
        tex_path = Path(tmpdir) / f"{output_name}.tex"
        tex_path.write_text(latex_source, encoding="utf-8")
        
        for _ in range(2):
            result = subprocess.run(
                ["xelatex", "-interaction=nonstopmode",
                 "-output-directory", tmpdir, str(tex_path)],
                capture_output=True, text=True, timeout=60
            )
        
        pdf_source = Path(tmpdir) / f"{output_name}.pdf"
        if not pdf_source.exists():
            raise RuntimeError(f"PDF oluşturulamadı:\n{result.stdout}")
        
        pdf_dest = OUTPUT_DIR / f"{output_name}.pdf"
        pdf_dest.write_bytes(pdf_source.read_bytes())
        return pdf_dest


def generate_cv(profile_path: str = "profile.json", lang: str = "both") -> list[Path]:
    """Profil dosyasından CV PDF'leri üretir."""
    data = json.loads((DATA_DIR / profile_path).read_text(encoding="utf-8"))
    
    pdfs = []
    languages = ["tr", "en"] if lang == "both" else [lang]
    
    for l in languages:
        latex = generate_latex(data, lang=l)
        suffix = "tr" if l == "tr" else "en"
        name_slug = data.get("full_name", "cv").lower().replace(" ", "_").replace("ç", "c").replace("ş", "s").replace("ğ", "g").replace("ı", "i").replace("ö", "o").replace("ü", "u")
        output_name = f"{name_slug}_cv_{suffix}"
        
        pdf = compile_pdf(latex, output_name)
        print(f"CV oluşturuldu ({l.upper()}): {pdf}")
        pdfs.append(pdf)
    
    return pdfs
