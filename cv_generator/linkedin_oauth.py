"""
LinkedIn OAuth 2.0 - Profil verisi çekme

Akış:
1. Tarayıcıda LinkedIn login sayfası açılır
2. Kullanıcı giriş yapar ve izin verir
3. LinkedIn callback URL'e code gönderir
4. Code ile access_token alınır
5. Access token ile profil verisi çekilir
"""

import os
import json
import webbrowser
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path

from dotenv import load_dotenv
import requests

load_dotenv(Path(__file__).parent.parent / ".env")

CLIENT_ID = os.getenv("LINKEDIN_CLIENT_ID")
CLIENT_SECRET = os.getenv("LINKEDIN_CLIENT_SECRET")
REDIRECT_URI = "http://localhost:8000/callback"
SCOPES = "openid profile email"

AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization"
TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"
USERINFO_URL = "https://api.linkedin.com/v2/userinfo"

DATA_DIR = Path(__file__).parent.parent / "data"


class OAuthCallbackHandler(BaseHTTPRequestHandler):
    """OAuth callback'i yakalar."""
    
    auth_code = None
    
    def do_GET(self):
        query = urllib.parse.urlparse(self.path).query
        params = urllib.parse.parse_qs(query)
        
        if "code" in params:
            OAuthCallbackHandler.auth_code = params["code"][0]
            self.send_response(200)
            self.send_header("Content-type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(
                "<html><body><h1>LinkedIn bağlantısı başarılı!</h1>"
                "<p>Bu pencereyi kapatabilirsiniz.</p></body></html>".encode("utf-8")
            )
        elif "error" in params:
            self.send_response(400)
            self.send_header("Content-type", "text/html; charset=utf-8")
            self.end_headers()
            error = params.get("error_description", ["Bilinmeyen hata"])[0]
            self.wfile.write(f"<html><body><h1>Hata: {error}</h1></body></html>".encode("utf-8"))
        
    def log_message(self, format, *args):
        pass  # Sessiz mod


def get_auth_code() -> str:
    """Tarayıcı açıp kullanıcının LinkedIn'e giriş yapmasını bekler."""
    
    params = {
        "response_type": "code",
        "client_id": CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "scope": SCOPES,
    }
    auth_url = f"{AUTH_URL}?{urllib.parse.urlencode(params)}"
    
    print("LinkedIn giriş sayfası açılıyor...")
    webbrowser.open(auth_url)
    
    print("LinkedIn'de giriş yapmanız bekleniyor...")
    server = HTTPServer(("localhost", 8000), OAuthCallbackHandler)
    server.handle_request()  # Tek istek bekle
    
    if not OAuthCallbackHandler.auth_code:
        raise RuntimeError("LinkedIn authorization code alınamadı!")
    
    return OAuthCallbackHandler.auth_code


def get_access_token(auth_code: str) -> str:
    """Authorization code ile access token alır."""
    
    response = requests.post(TOKEN_URL, data={
        "grant_type": "authorization_code",
        "code": auth_code,
        "redirect_uri": REDIRECT_URI,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
    })
    response.raise_for_status()
    data = response.json()
    
    # Token'ı kaydet (2 ay geçerli)
    token_path = DATA_DIR / "linkedin_token.json"
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    token_path.write_text(json.dumps(data, indent=2), encoding="utf-8")
    print(f"Access token kaydedildi: {token_path}")
    
    return data["access_token"]


def get_profile(access_token: str) -> dict:
    """LinkedIn profil bilgilerini çeker."""
    
    headers = {"Authorization": f"Bearer {access_token}"}
    
    response = requests.get(USERINFO_URL, headers=headers)
    response.raise_for_status()
    
    profile = response.json()
    
    # Profili kaydet
    profile_path = DATA_DIR / "linkedin_api_profile.json"
    profile_path.write_text(json.dumps(profile, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Profil kaydedildi: {profile_path}")
    
    return profile


def load_saved_token() -> str | None:
    """Kayıtlı token varsa yükler."""
    token_path = DATA_DIR / "linkedin_token.json"
    if token_path.exists():
        data = json.loads(token_path.read_text(encoding="utf-8"))
        return data.get("access_token")
    return None


def connect():
    """Tam OAuth akışı: login → token → profil çek."""
    
    # Kayıtlı token dene
    token = load_saved_token()
    if token:
        print("Kayıtlı token bulundu, profil çekiliyor...")
        try:
            profile = get_profile(token)
            print(f"\nProfil: {profile.get('name', 'N/A')}")
            print(f"E-posta: {profile.get('email', 'N/A')}")
            return profile
        except requests.HTTPError:
            print("Token süresi dolmuş, yeniden giriş yapılıyor...")
    
    # Yeni token al
    auth_code = get_auth_code()
    access_token = get_access_token(auth_code)
    profile = get_profile(access_token)
    
    print(f"\nBağlantı başarılı!")
    print(f"Ad: {profile.get('name', 'N/A')}")
    print(f"E-posta: {profile.get('email', 'N/A')}")
    
    return profile


if __name__ == "__main__":
    connect()
