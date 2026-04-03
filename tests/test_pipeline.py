"""Pipeline testleri."""
from pathlib import Path

OUTPUT_DIR = Path(__file__).parent.parent / "output"
DATA_DIR = Path(__file__).parent.parent / "data"


def test_output_dir_exists():
    assert OUTPUT_DIR.exists()


def test_tr_pdf_exists():
    assert (OUTPUT_DIR / "cv.pdf").exists()


def test_en_pdf_exists():
    assert (OUTPUT_DIR / "cv_en.pdf").exists()


def test_pdf_not_empty():
    tr_pdf = OUTPUT_DIR / "cv.pdf"
    en_pdf = OUTPUT_DIR / "cv_en.pdf"
    assert tr_pdf.stat().st_size > 10000  # En az 10KB
    assert en_pdf.stat().st_size > 10000


def test_linkedin_oauth_module():
    """OAuth modülü import edilebilir."""
    from cv_generator.linkedin_oauth import CLIENT_ID
    assert CLIENT_ID is not None


def test_env_file_exists():
    env_path = Path(__file__).parent.parent / ".env"
    assert env_path.exists()
