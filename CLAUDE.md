# CV Generator - LinkedIn Fotoğraflarından Otomatik CV

## Otomatik Tetikleme

Kullanıcı aşağıdaki durumlardan birini yaptığında **otomatik olarak CV akışını başlat**:
- "CV oluştur", "CV yap", "CV güncelle" derse
- LinkedIn ekran görüntüsü/fotoğrafı atarsa
- "LinkedIn'den CV" gibi bir şey söylerse

## Tam Akış Algoritması

### ADIM 1: Fotoğraf Kontrolü
Kullanıcının attığı fotoğrafları kontrol et. Aşağıdaki 7 bölümün fotoğrafı gerekli:

| # | Bölüm | Zorunlu | Nasıl anlaşılır |
|---|-------|---------|----------------|
| 1 | Profil üst kısım | EVET | İsim, başlık, konum görünür |
| 2 | Hakkında | EVET | "Hakkında" veya "About" başlığı |
| 3 | Deneyim | EVET | "Deneyim" veya "Experience" başlığı |
| 4 | Eğitim | EVET | "Eğitim" veya "Education" başlığı |
| 5 | Sertifikalar | EVET | "Lisanslar ve sertifikalar" başlığı |
| 6 | Projeler | HAYIR | "Projeler" başlığı (yoksa atla) |
| 7 | Ödüller | HAYIR | "Onur ve ödüller" başlığı (yoksa atla) |

**Eksik fotoğraf varsa**: Kullanıcıdan eksik bölümlerin fotoğraflarını iste.
**Yeterli fotoğraf varsa**: Adım 2'ye geç.

### ADIM 2: Fotoğrafları Oku ve Metin Çıkar
Her fotoğrafı Vision ile oku. Metni kategorilere ayır:
- Kişisel Bilgiler (isim, başlık, konum, e-posta, telefon)
- Hakkında (ön yazı metni)
- Deneyim (şirket, pozisyon, tarih, açıklama)
- Eğitim (okul, derece, alan, tarih, not)
- Sertifikalar (isim, kurum, tarih)
- Projeler (isim, tarih, açıklama)
- Ödüller (isim, veren kurum, tarih, açıklama)
- Yetenekler (liste)
- Diller (isim, seviye)

**ÖNEMLİ**: LinkedIn'deki metin BİREBİR kullanılır. Değiştirme, düzeltme, güzelleştirme YAPMA. Kullanıcının kendi sözleri aynen kalmalı.

### ADIM 3: Kullanıcı Onayı
Çıkarılan verileri kategorik başlıklarla kullanıcıya göster:
```
## 1. KİŞİSEL BİLGİLER
- Ad Soyad: ...
- Başlık: ...
...

## 2. HAKKINDA
...

## 3. DENEYİM
...
```
Kullanıcıdan onay al. Düzeltme isterse uygula.

### ADIM 4: LaTeX ile CV Üret
Onay sonrası:
1. `templates/cv.tex` dosyasını bash ile oluştur (UTF-8 Türkçe karakterler için bash ZORUNLU, Write tool kullanma)
2. XeLaTeX ile derle:
   ```bash
   export PATH="/Library/TeX/texbin:$PATH"
   xelatex -interaction=nonstopmode -output-directory=output templates/cv.tex
   ```
3. İngilizce versiyonu da üret: `templates/cv_en.tex` → `output/cv_en.pdf`

### ADIM 5: PDF Aç ve Son Kontrol
```bash
open output/cv.pdf
```
Kullanıcıya göster, düzeltme isteklerini uygula.

## Teknik Kurallar

### LaTeX Kuralları
- **Font**: Helvetica (macOS sistem fontu)
- **Font boyutu**: 8pt (2 sayfaya sığdırmak için)
- **Kenar boşlukları**: top=0.25in, bottom=0.25in, left=0.4in, right=0.4in
- **Section başlıkları**: BÜYÜK HARF elle yaz (`\uppercase` KULLANMA - Türkçe İ/Ş/Ğ/Ö/Ü bozar)
- **Türkçe**: bash ile yaz (Write tool Unicode escape sorunu yapar)
- **Derleme**: XeLaTeX (UTF-8 Unicode desteği)

### ATS Uyumluluk Kuralları
- Tek sütun düzeni
- Grafik, ikon, tablo YOK
- Standart bölüm başlıkları
- Bullet point'ler standart (•)
- Metin tabanlı PDF (kopyalanabilir)
- Helvetica veya Arial font

### Bölüm Sırası (CV'deki)
1. Kişisel Bilgiler (başlık)
2. Ön Yazı / Cover Letter
3. Yetenekler / Skills
4. İş Deneyimi / Work Experience
5. Eğitim / Education
6. Projeler / Projects
7. Lisanslar ve Sertifikalar / Licenses and Certifications
8. Onur ve Ödüller / Honors and Awards
9. Diller / Languages

## Dosya Yapısı
```
CV/
├── CLAUDE.md                    # Bu dosya (algoritma talimatları)
├── cv_generator/
│   ├── linkedin_parser.py       # LinkedIn veri modeli (dataclass'lar)
│   ├── template_engine.py       # LaTeX üretici + PDF derleyici
│   └── main.py                  # Pipeline
├── templates/
│   ├── cv.tex                   # Türkçe CV şablonu
│   └── cv_en.tex                # İngilizce CV şablonu
├── data/
│   └── profile.json             # Parse edilmiş profil verisi
└── output/
    ├── cv.pdf                   # Türkçe CV
    └── cv_en.pdf                # İngilizce CV
```

## Mevcut Kullanıcı Bilgileri
- E-posta: info@1takimstartuplar.com
- İngilizce seviyesi: A2
- Sayfa limiti: 2 sayfa
