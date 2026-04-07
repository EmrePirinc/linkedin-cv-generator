# CV Optimizasyon Kuralları — Emre Pirinç

Bu doküman, CV oluşturma ve optimize etme sürecinde uyulması gereken tüm kuralları içerir.
IK uzman heyeti değerlendirmesi, ATS taraması ve kullanıcı geri bildirimleri sonucu oluşturulmuştur.

---

## 1. FORMAT & YAPI KURALLARI

### Genel
- **Sayfa limiti:** Maksimum 2 sayfa
- **Düzen:** Tek sütun (ATS uyumlu)
- **Font:** Helvetica veya Arial (sistem fontu)
- **Font boyutu:** 8pt (2 sayfaya sığdırmak için)
- **Kenar boşlukları:** top=0.25in, bottom=0.25in, left=0.4in, right=0.4in
- **Derleme:** XeLaTeX (UTF-8 Unicode desteği)
- **Grafik, ikon, tablo, fotoğraf KULLANMA** — ATS parse edemez

### Boşluk Dengesi
- Section başlıkları: `\titlespacing{0pt}{7pt}{3pt}`
- Girişler arası: `\vspace{3pt}`
- Paragraf arası: `\parskip{1pt}`
- Her iki sayfa eşit dolulukta olmalı — alt kısımda büyük boşluk kalmamalı

### Türkçe Karakter Kuralları
- Section başlıkları BÜYÜK HARF elle yaz (`\uppercase` KULLANMA — Türkçe İ/Ş/Ğ/Ö/Ü bozar)
- LaTeX dosyalarını bash ile yaz (Write tool Unicode escape sorunu yapar)

---

## 2. BÖLÜM SIRASI

1. Kişisel Bilgiler (başlık)
2. HAKKIMDA (Türkçe) / ABOUT ME (İngilizce) — "ÖN YAZI" veya "COVER LETTER" KULLANMA
3. YETENEKLER / SKILLS
4. İŞ DENEYİMİ / WORK EXPERIENCE
5. PROJELER / PROJECTS
6. EĞİTİM / EDUCATION
7. LİSANSLAR VE SERTİFİKALAR / LICENSES AND CERTIFICATIONS
8. ONUR VE ÖDÜLLER / HONORS AND AWARDS
9. DİLLER / LANGUAGES
10. REFERANSLAR / REFERENCES

**ÖNEMLİ:** Eğitim bölünme riski varsa Projeler'in altına taşınabilir. ATS bölüm sırasına bakmaz, section başlıklarını parse eder.

---

## 3. TARİH SIRALAMASI KURALI

**Tüm bölümlerde TERS KRONOLOJİK sıra (en güncel en üstte):**
- İş deneyimi: En son iş → ilk iş
- Eğitim: En son okul → ilk okul
- Projeler: En son proje → ilk proje
- Sertifikalar: En son sertifika → ilk sertifika

Bu kural hiçbir CV versiyonunda bozulmamalı.

---

## 4. HAKKIMDA BÖLÜMÜ KURALLARI

### Yapılacaklar
- Kısa ve öz tut (2 paragraf maksimum)
- 1. paragraf: Mevcut deneyim özeti (ölçülebilir rakamlarla)
- 2. paragraf: Kariyer hedefi (net ve spesifik)

### Yapılmayacaklar
- Kişisel özellikler YAZMA ("FPS oyunları severim", "inatçıyım" gibi)
- AIFTeam detaylarını tekrarlama (zaten İş Deneyimi'nde var)
- "Uçtan uca" ifadesini birden fazla kullanma (tüm CV'de max 1 kez)

---

## 5. İŞ DENEYİMİ KURALLARI

### Bullet Point Kuralları
- **Görev tanımlama, BAŞARI anlat** — rakamlar kullan
  - KÖTÜ: "Crystal Reports ile raporlar tasarladım"
  - İYİ: "3 Crystal Reports raporunu sıfırdan tasarlayıp 10+ raporda düzeltme sağladım"
- Her deneyimde en az 1 bullet point olmalı (boş bırakma)
- Staj deneyimlerinde bile açıklama yaz

### Unvan Kuralları
- "AI Researcher" KULLANMA (yayın/akademik pozisyon yoksa) → "Aspiring AI Engineer"
- "Kurucu Üye" yerine mütevazı ton: "Kendi İşim" ve gerçekçi açıklama
- 1 aylık deneyimler sorgulanır — kısa tutulabilir ama çıkarılmaz

### Kelime Tekrarı
- "Uçtan uca" max 1 kez
- "Aktif rol almaktayım" tekrarından kaçın — farklı fiiller kullan
- "Görev aldım", "sorumluluk üstlendim" yerine somut eylemler

---

## 6. EĞİTİM KURALLARI

- Transfer varsa açıklama ekle: "İngilizce hazırlık eğitimi tamamlandı"
- Lisanstan sonra ön lisans varsa neden açıkla: "Teknik programlama yetkinliğini güçlendirmek amacıyla"
- GPA 3.0+ ise yaz, altındaysa yazma

---

## 7. SERTİFİKA KURALLARI

- Ters kronolojik sıra
- Hedef pozisyonla ALAKASIZ olanları çıkarabilirsin:
  - Çıkarılabilecekler: "Stres Yönetimi", "Blockchain Farkındalık", "Girişimcilik Zirvesi", "Excel'e Giriş" (ileri versiyonu varsa)
- SAP sertifikasına Credly doğrulama linki ekle: `\href{url}{Doğrula}`
- Hiçbir sertifika genel CV'den çıkarılmamalı — sadece pozisyona özel CV'lerde filtrelenebilir

---

## 8. ÖDÜLLER KURALLARI

- Aynı alandaki çok sayıda ödülü TEK PARAGRAFTA özetle
- Rakamlarla güçlendir: "7 turnuvada 5 şampiyonluk, 2 MVP"
- Liderlik/yönetim becerisi olarak çerçevele (IGL → takım yönetimi, strateji, kriz yönetimi)

---

## 9. REFERANSLAR KURALLARI

- Sadece isim + kurum + bölüm yaz (uzun unvanlar gereksiz)
  - İYİ: "Prof. Dr. Adem Akbıyık — Sakarya Üniversitesi, Yönetim Bilişim Sistemleri"
  - KÖTÜ: "Prof. Dr. Adem Akbıyık — Professor of Management Information Systems, Sakarya Üniversitesi"
- E-posta ve telefon numarası ekle
- Türkçe CV'de Türkçe, İngilizce CV'de İngilizce kurum adları

---

## 10. ATS UYUMLULUK KURALLARI

### Format
- Tek sütun düzeni
- Standart bullet point (•)
- Metin tabanlı PDF (kopyalanabilir)
- hidelinks (görünmez hyperlink)

### Telefon
- Uluslararası format: `+90 534 590 58 89` (boşluksuz/ülke kodsuz KULLANMA)

### Linkler
- LinkedIn ve GitHub tıklanabilir olmalı: `\href{https://...}{görünen metin}`
- Sertifika doğrulama linki: `\href{credly-url}{Doğrula}`

### Bölüm Başlıkları
- ATS'nin tanıdığı standart başlıklar kullan
- Türkçe: HAKKIMDA, YETENEKLER, İŞ DENEYİMİ, EĞİTİM, PROJELER, LİSANSLAR VE SERTİFİKALAR, ONUR VE ÖDÜLLER, DİLLER, REFERANSLAR
- İngilizce: ABOUT ME, SKILLS, WORK EXPERIENCE, EDUCATION, PROJECTS, LICENSES AND CERTIFICATIONS, HONORS AND AWARDS, LANGUAGES, REFERENCES

### Fotoğraf
- CV'ye fotoğraf EKLEME — ATS parse edemez, bazı ülkelerde elenir

### E-posta
- Kurumsal e-posta (info@sirket.com) kişisel CV'de garip durur — tercihen Gmail/Outlook

---

## 11. POZİSYONA ÖZEL CV KURALLARI

Aynı içerikten farklı pozisyonlara özel CV türetirken:

### Değişenler
- **Başlık satırı:** Hedef pozisyon keyword'leri öne
- **Hakkımda:** Hedef pozisyona yönelik vurgu
- **Yetenekler sıralaması:** İlgili keyword'ler öne (hiçbiri çıkarılmaz!)

### Değişmeyenler
- İş deneyimi İÇERİĞİ kısaltılmaz — tüm bullet point'ler kalır
- Sertifikaların tamamı kalır (sadece sıralama değişebilir)
- Projeler, eğitim, ödüller, referanslar aynen kalır
- Tarih sıralaması (ters kronolojik) HİÇBİR ZAMAN bozulmaz

### SAP B1 CV Özel
- Başlık: SAP B1 Consultant | ERP Implementation Specialist
- Yetenekler: SAP, ERP, Crystal Reports, SQL, Blueprint öne
- Hakkımda: SAP ekosistemi deneyimi vurgusu

### AI CV Özel
- Başlık: Aspiring AI Engineer | Machine Learning | LLM | Generative AI
- Yetenekler: Python, AI, ML, LLM, Gemini API öne
- Hakkımda: AI projeleri ve teknolojiler vurgusu (mütevazı ton)

---

## 12. IK HEYETİ KONTROL LİSTESİ

CV tamamlandığında şu soruları sor:

- [ ] Her bullet point görev değil BAŞARI anlatıyor mu? (rakamlar var mı?)
- [ ] Kelime tekrarı var mı? ("uçtan uca", "aktif rol" vb.)
- [ ] Tüm bölümler ters kronolojik mi?
- [ ] Sayfa bölünmesi bir bölümü ortadan bölüyor mu?
- [ ] Telefon uluslararası formatta mı?
- [ ] LinkedIn/GitHub tıklanabilir mi?
- [ ] Başlıktaki unvan desteklenebilir mi? (AI Researcher = yayın var mı?)
- [ ] Eğitim geçişleri açıklanmış mı?
- [ ] 2 sayfaya sığıyor mu?
- [ ] Her iki sayfa dengeli dolulukta mı?

---

## 13. DOSYA YAPISI

```
CV/
├── templates/
│   ├── cv_tr.tex          # Türkçe genel CV
│   ├── cv_en.tex          # İngilizce genel CV
│   ├── cv_tr_sap.tex      # Türkçe SAP B1 odaklı CV
│   └── cv_tr_ai.tex       # Türkçe AI odaklı CV
├── output/
│   ├── cv_tr.pdf
│   ├── cv_en.pdf
│   ├── cv_tr_sap.pdf
│   └── cv_tr_ai.pdf
├── docs/                   # GitHub Pages
│   ├── index.html
│   └── *.pdf
└── portfolio/              # Next.js uygulama
    └── public/*.pdf
```

## 14. DERLEME KOMUTU

```bash
export PATH="/Library/TeX/texbin:$PATH"
xelatex -interaction=nonstopmode -output-directory=output templates/cv_tr.tex
xelatex -interaction=nonstopmode -output-directory=output templates/cv_en.tex
xelatex -interaction=nonstopmode -output-directory=output templates/cv_tr_sap.tex
xelatex -interaction=nonstopmode -output-directory=output templates/cv_tr_ai.tex
```
