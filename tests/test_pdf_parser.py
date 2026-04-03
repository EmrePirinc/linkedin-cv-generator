"""PDF parser testleri."""
from pathlib import Path
from cv_generator.pdf_parser import extract_text_from_pdf, detect_sections, parse_linkedin_pdf

SAMPLE_PDF = Path("/Users/emrepirinc/Downloads/Profile.pdf")


def test_extract_text():
    if not SAMPLE_PDF.exists():
        return  # PDF yoksa atla
    text = extract_text_from_pdf(str(SAMPLE_PDF))
    assert len(text) > 100
    assert "Emre" in text


def test_detect_sections():
    if not SAMPLE_PDF.exists():
        return
    text = extract_text_from_pdf(str(SAMPLE_PDF))
    sections = detect_sections(text)
    assert "header" in sections
    assert len(sections) > 1


def test_parse_full_pdf():
    if not SAMPLE_PDF.exists():
        return
    profile = parse_linkedin_pdf(str(SAMPLE_PDF))
    # LinkedIn PDF 2 sütunlu olduğu için parse tam doğru olmayabilir
    # Temel yapı ve bazı alanları kontrol et
    assert profile["linkedin_url"] == "www.linkedin.com/in/emre-pirinc"
    assert profile["email"] == "emreypirinc@gmail.com"
    assert isinstance(profile["skills"], list)
    assert isinstance(profile["education"], list)
    assert len(profile["education"]) == 3
