"""LaTeX şablon testleri."""
from pathlib import Path

TEMPLATES_DIR = Path(__file__).parent.parent / "templates"


def test_tr_template_exists():
    assert (TEMPLATES_DIR / "cv.tex").exists()


def test_en_template_exists():
    assert (TEMPLATES_DIR / "cv_en.tex").exists()


def test_tr_template_has_sections():
    content = (TEMPLATES_DIR / "cv.tex").read_text(encoding="utf-8")
    assert "ÖN YAZI" in content
    assert "YETENEKLER" in content
    assert "İŞ DENEYİMİ" in content
    assert "EĞİTİM" in content
    assert "PROJELER" in content
    assert "LİSANSLAR VE SERTİFİKALAR" in content
    assert "ONUR VE ÖDÜLLER" in content
    assert "DİLLER" in content


def test_en_template_has_sections():
    content = (TEMPLATES_DIR / "cv_en.tex").read_text(encoding="utf-8")
    assert "COVER LETTER" in content
    assert "SKILLS" in content
    assert "WORK EXPERIENCE" in content
    assert "EDUCATION" in content
    assert "PROJECTS" in content
    assert "LICENSES AND CERTIFICATIONS" in content
    assert "HONORS AND AWARDS" in content
    assert "LANGUAGES" in content


def test_no_uppercase_command():
    """uppercase komutu Türkçe karakterleri bozar, kullanılmamalı."""
    for template in ["cv.tex", "cv_en.tex"]:
        content = (TEMPLATES_DIR / template).read_text(encoding="utf-8")
        assert "\\uppercase" not in content.split("\\titleformat")[1] if "\\titleformat" in content else True
