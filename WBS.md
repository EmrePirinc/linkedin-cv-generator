# WBS — Akıllı Fotoğraf-CV Parse Sistemi
**Versiyon:** v1.0 | **Tarih:** 08 Nisan 2026
**Kaynak:** /bb + /bap çıktıları
**Kural:** Quality Gate geçilmeden sonraki bölüme geçilemez ⛔

---

## WBS AĞACI

```
1.0 AKILLI FOTOĞRAF-CV PARSE SİSTEMİ
├── 1.1 FAZ 1: MVP — Core Pipeline
│   ├── 1.1.1 Onboarding & Upload UI
│   │   ├── 1.1.1.1 Bölüm checklist ekranı (7 bölüm rehberi)
│   │   │   ├── 1.1.1.1.1 Zorunlu/isteğe bağlı bölüm listesini config'den oku
│   │   │   └── 1.1.1.1.2 Her bölüm için örnek ekran görüntüsü göster
│   │   ├── 1.1.1.2 Sürükle-bırak upload alanı
│   │   │   ├── 1.1.1.2.1 Çoklu dosya seçimi (PNG/JPG filtresi)
│   │   │   └── 1.1.1.2.2 Thumbnail önizleme + silme butonu
│   │   └── 1.1.1.3 Upload validasyonu
│   │       ├── 1.1.1.3.1 Format kontrolü (PNG/JPG hata mesajı)
│   │       └── 1.1.1.3.2 Dosya boyutu kontrolü (>5MB → sıkıştır)
│   │
│   ├── ── 🔬 QG-1.1.1 UNIT — Upload UI
│   │
│   ├── 1.1.2 Bölüm Tespit Motoru
│   │   ├── 1.1.2.1 Gemini Vision entegrasyonu
│   │   │   ├── 1.1.2.1.1 API istek yapısı (base64 + bölüm tespit prompt)
│   │   │   └── 1.1.2.1.2 Yanıt parse (bölüm etiketi + güven skoru)
│   │   ├── 1.1.2.2 Paralel analiz pipeline
│   │   │   ├── 1.1.2.2.1 Promise.all ile çoklu fotoğraf paralel gönderimi
│   │   │   └── 1.1.2.2.2 Rate limit yönetimi (60 req/dk Gemini free tier)
│   │   ├── 1.1.2.3 Güven eşiği yönetimi
│   │   │   ├── 1.1.2.3.1 Güven < %60 → manuel seçim dropdown
│   │   │   └── 1.1.2.3.2 Güven >= %60 → otomatik etiket
│   │   └── 1.1.2.4 Retry mekanizması
│   │       ├── 1.1.2.4.1 API timeout → max 2 retry
│   │       └── 1.1.2.4.2 2 retry sonrası başarısız → kısmi hata durumu
│   │
│   ├── ── 🔬 QG-1.1.2 UNIT — Bölüm Tespit
│   │
│   ├── 1.1.3 Veri Çıkarım & Birleştirme
│   │   ├── 1.1.3.1 Yapılandırılmış veri çıkarımı
│   │   │   ├── 1.1.3.1.1 Her bölüm için alan şeması (JSON veri modeli)
│   │   │   └── 1.1.3.1.2 LinkedIn metni birebir koru (değiştirme/düzeltme yok)
│   │   ├── 1.1.3.2 Çakışan bölüm birleştirme
│   │   │   ├── 1.1.3.2.1 Aynı bölüm etiketli fotoğrafları tespit et
│   │   │   ├── 1.1.3.2.2 İçerikleri birleştir (concat + dedup)
│   │   │   └── 1.1.3.2.3 Ters kronolojik sıralama uygula
│   │   └── 1.1.3.3 Tarih format normalizasyonu
│   │       ├── 1.1.3.3.1 "Oca 2023 - Halen" → standart format
│   │       └── 1.1.3.3.2 Eksik tarih → boş bırak, uyarı ver
│   │
│   ├── ── 🔬 QG-1.1.3 UNIT — Veri Çıkarım
│   │
│   ├── 1.1.4 Eksik Bölüm Yönetimi
│   │   ├── 1.1.4.1 Zorunlu bölüm kontrol servisi
│   │   │   ├── 1.1.4.1.1 Config'den zorunlu liste oku (hardcode yok)
│   │   │   └── 1.1.4.1.2 Eksik zorunlu bölüm listesi üret
│   │   ├── 1.1.4.2 Eksik bölüm UI
│   │   │   ├── 1.1.4.2.1 Eksik zorunlu → kırmızı uyarı kartı + buton devre dışı
│   │   │   └── 1.1.4.2.2 Eksik isteğe bağlı → sarı bilgi kartı + devam et
│   │   └── 1.1.4.3 Kısmi başarısızlık akışı
│   │       ├── 1.1.4.3.1 Başarısız fotoğraf badge + "Tekrar Dene/Manuel/Atla"
│   │       └── 1.1.4.3.2 Manuel giriş text alanı
│   │
│   ├── ── 🔗 QG-1.1.4 INTEGRATION — Upload→Tespit→Eksik Yönetim
│   │
│   ├── 1.1.5 Veri Onay UI
│   │   ├── 1.1.5.1 Kategorik veri gösterimi
│   │   │   ├── 1.1.5.1.1 Her bölüm ayrı başlıkla accordion UI
│   │   │   └── 1.1.5.1.2 Alan bazlı düzenlenebilir input'lar
│   │   ├── 1.1.5.2 Onay mekanizması
│   │   │   ├── 1.1.5.2.1 "Onayla" butonu → CV Oluştur aktif
│   │   │   └── 1.1.5.2.2 Değişen alan sarı highlight
│   │   └── 1.1.5.3 Gizlilik toggle'ları (Faz 2 için hazırlık — skeleton)
│   │       └── 1.1.5.3.1 Toggle UI bileşeni (devre dışı, placeholder)
│   │
│   ├── ── 🔬 QG-1.1.5 UNIT — Veri Onay UI
│   │
│   ├── 1.1.6 LaTeX CV Üretimi
│   │   ├── 1.1.6.1 Veri → LaTeX şablon doldurma
│   │   │   ├── 1.1.6.1.1 Profil verisi → cv_tr.tex değişkenlerine map
│   │   │   ├── 1.1.6.1.2 Profil verisi → cv_en.tex değişkenlerine map
│   │   │   └── 1.1.6.1.3 Boş alan kontrolü (eksik alan → bölümü atla)
│   │   ├── 1.1.6.2 XeLaTeX derleme servisi
│   │   │   ├── 1.1.6.2.1 bash ile .tex dosyası yaz (UTF-8, Türkçe karakter)
│   │   │   ├── 1.1.6.2.2 xelatex -interaction=nonstopmode komutu çalıştır
│   │   │   └── 1.1.6.2.3 Derleme hatası yakalama + kullanıcıya bildirme
│   │   └── 1.1.6.3 PDF çıktı yönetimi
│   │       ├── 1.1.6.3.1 output/ dizinine kopyala
│   │       └── 1.1.6.3.2 docs/ dizinine kopyala (GitHub Pages güncelle)
│   │
│   ├── ── 🔬 QG-1.1.6 UNIT — LaTeX Üretim
│   │
│   ├── 1.1.7 İndirme & ATS Skor UI
│   │   ├── 1.1.7.1 İndirme butonları
│   │   │   ├── 1.1.7.1.1 "Türkçe İndir" → cv_tr.pdf
│   │   │   └── 1.1.7.1.2 "İngilizce İndir" → cv_en.pdf
│   │   └── 1.1.7.2 ATS skor gösterimi
│   │       ├── 1.1.7.2.1 ATS kural kontrolü (metin tabanlı, grafik yok, font)
│   │       ├── 1.1.7.2.2 0-100 puan hesaplama
│   │       └── 1.1.7.2.3 En az 3 iyileştirme önerisi gösterme
│   │
│   ├── ── 🎯 QG-1.1 E2E — Faz 1 Tam Akış (PS-001)
│   └── ── 🛡️ QG-1.1 REGRESSION — QG-1.1.1 → QG-1.1.6 tekrar çalıştır
│
├── 1.2 FAZ 2: BÜYÜME — Gizlilik & Varyant
│   ├── 1.2.1 Gizlilik Kontrol Paneli
│   │   ├── 1.2.1.1 Toggle bileşenlerini aktifleştir (Faz 1 skeleton → gerçek)
│   │   │   ├── 1.2.1.1.1 Telefon toggle → LaTeX'te alanı hariç tut
│   │   │   ├── 1.2.1.1.2 E-posta toggle → LaTeX'te alanı hariç tut
│   │   │   └── 1.2.1.1.3 Konum toggle → LaTeX'te alanı hariç tut
│   │   └── 1.2.1.2 Gizlilik durumu LaTeX'e yansıtma
│   │       └── 1.2.1.2.1 Hariç tutulan alanlar şablona geçilmez
│   │
│   ├── ── 🔬 QG-1.2.1 UNIT — Gizlilik Toggle
│   │
│   ├── 1.2.2 CV Varyant Seçici
│   │   ├── 1.2.2.1 Varyant seçim UI
│   │   │   ├── 1.2.2.1.1 "Genel / SAP B1 / AI Engineer" dropdown/kart seçimi
│   │   │   └── 1.2.2.1.2 Seçime göre şablon dosyası belirleme
│   │   └── 1.2.2.2 Şablon yönlendirme
│   │       ├── 1.2.2.2.1 SAP → cv_tr_sap.tex + cv_en_sap.tex
│   │       └── 1.2.2.2.2 AI → cv_tr_ai.tex + cv_en_ai.tex
│   │
│   ├── ── 🔬 QG-1.2.2 UNIT — Varyant Seçici
│   │
│   ├── 1.2.3 Çoklu Dil Paralel Üretim
│   │   ├── 1.2.3.1 TR + EN eş zamanlı derleme
│   │   │   └── 1.2.3.1.1 İki xelatex komutu paralel çalıştır
│   │   └── 1.2.3.2 Dil bazlı indirme butonları güncelle
│   │       └── 1.2.3.2.1 Varyant + dil kombinasyonu → doğru dosya
│   │
│   ├── ── 🔗 QG-1.2 INTEGRATION — Gizlilik+Varyant+Dil birlikte çalışıyor
│   ├── ── 🎯 QG-1.2 E2E — Faz 2 Tam Akış (SAP varyantı + tel gizli)
│   └── ── 🛡️ QG-1.2 REGRESSION — Faz 1 tüm QG'leri tekrar çalıştır
│
└── 1.3 FAZ 3: VİZYON — Lokal API & Yönetim
    ├── 1.3.1 Lokal API Key Desteği
    │   ├── 1.3.1.1 API key input UI
    │   │   ├── 1.3.1.1.1 localStorage'a şifreli kaydet
    │   │   └── 1.3.1.1.2 Key maskeleme (***KEY***)
    │   └── 1.3.1.2 Client-side API çağrısı
    │       └── 1.3.1.2.1 Fotoğraf doğrudan Google API'ye (sunucu bypass)
    │
    ├── ── 🔬 QG-1.3.1 UNIT — Lokal API Key
    │
    ├── 1.3.2 CV Profil Yöneticisi
    │   ├── 1.3.2.1 Geçmiş CV kaydetme
    │   │   ├── 1.3.2.1.1 localStorage'a profil verisi kaydet
    │   │   └── 1.3.2.1.2 Kayıtlı profiller listesi UI
    │   └── 1.3.2.2 Profil yükle/sil
    │       └── 1.3.2.2.1 Seçilen profil → onay ekranını doldur
    │
    ├── ── 🔬 QG-1.3.2 UNIT — Profil Yöneticisi
    │
    ├── 1.3.3 Periyodik Hatırlatıcı
    │   ├── 1.3.3.1 Hatırlatıcı tercihi kaydet
    │   │   └── 1.3.3.1.1 "30/60/90 günde bir hatırlat" toggle
    │   └── 1.3.3.2 Browser notification
    │       └── 1.3.3.2.1 Notification API izni + zamanlanmış bildirim
    │
    ├── ── 🔬 QG-1.3.3 UNIT — Hatırlatıcı
    ├── ── 🎯 QG-1.3 E2E — Faz 3 Tam Akış (lokal API + kayıtlı profil)
    └── ── 🛡️ QG-1.3 REGRESSION — Faz 1+2+3 tüm QG'leri tekrar çalıştır
```

---

## QUALITY GATES DETAYI

### 🔬 QG-1.1.1 UNIT — Upload UI
```
Test: Upload alanı ve önizleme doğru çalışıyor
☐ PNG ve JPG dosyaları kabul ediliyor
☐ Geçersiz format yüklenince hata mesajı gösteriliyor (teknik terim yok)
☐ Birden fazla dosya aynı anda seçilebiliyor
☐ Thumbnail önizlemeler yükleniyor
☐ "X" butonu ile fotoğraf listeden kaldırılıyor
⛔ GECEMEZSEN: Upload UI hataları QG-1.1.2'ye geçişi engeller
```

### 🔬 QG-1.1.2 UNIT — Bölüm Tespit
```
Test: Gemini Vision entegrasyonu ve etiketleme doğruluğu
☐ Standart LinkedIn Deneyim ekranı → "Deneyim" etiketi (%85+ güven)
☐ Güven < %60 olan fotoğraf → manuel dropdown gösteriliyor
☐ API timeout olduğunda retry 2 kez deneniyor
☐ 2 retry başarısız → kısmi hata badge gösteriliyor (pipeline durmuyor)
☐ 6 fotoğraf 30 saniye içinde tamamlanıyor (NFR-PERF-002)
⛔ GECEMEZSEN: Tespit doğruluğu %85 altında → Gemini prompt'u revize et
```

### 🔬 QG-1.1.3 UNIT — Veri Çıkarım
```
Test: Yapılandırılmış veri eksiksiz ve bozulmadan çıkarılıyor
☐ Deneyim: şirket, unvan, tarih, açıklama 4 ayrı alan olarak doluyor
☐ LinkedIn metni değiştirilmeden birebir aktarılıyor (BR-004)
☐ 2 Deneyim fotoğrafı → tüm pozisyonlar tek listede, duplikat yok
☐ Ters kronolojik sıralama uygulandı
☐ Tarih eksikse boş bırakıldı, hata üretmedi
⛔ GECEMEZSEN: Veri kayıpları veya metin değişikliği → çıkarım mantığını düzelt
```

### 🔗 QG-1.1.4 INTEGRATION — Upload→Tespit→Eksik Yönetim
```
Test: 3 bileşen birlikte doğru çalışıyor
☐ 4 zorunlu fotoğraf yüklendi → "CV Oluştur" butonu aktif
☐ Hakkında eksik → kırmızı uyarı kartı + buton devre dışı (FR-004)
☐ Projeler eksik → sarı bilgi kartı + devam et butonu aktif (FR-005)
☐ Başarısız 1 fotoğraf → diğerleri parse edildi, kısmi hata badge var
☐ Manuel giriş tamamlandı → ilerleme devam ediyor
⛔ GECEMEZSEN: Zorunlu bölüm uyarısı çalışmıyorsa eksik bölümle CV üretilebilir
```

### 🔬 QG-1.1.5 UNIT — Veri Onay UI
```
Test: Onay ekranı doğru çalışıyor
☐ Tüm bölümler ayrı başlıklarla accordion'da görünüyor
☐ Her alan düzenlenebilir input olarak açılıyor
☐ Alan değiştirilince sarı highlight uygulanıyor
☐ "Onayla" basılmadan "CV Oluştur" butonu devre dışı (FR-007)
☐ "Onayla" sonrası "CV Oluştur" aktif oluyor
⛔ GECEMEZSEN: Onay olmadan CV üretilebiliyorsa kritik akış hatası
```

### 🔬 QG-1.1.6 UNIT — LaTeX Üretim
```
Test: PDF doğru ve ATS uyumlu üretiliyor
☐ XeLaTeX 15 saniye içinde derlemeyi tamamlıyor (NFR-PERF-003)
☐ Türkçe karakterler (ş,ğ,ı,ç,ö,ü) PDF'de bozulmamış (NFR-COMP-002)
☐ PDF'de metin kopyalanabilir (text-based, raster değil)
☐ Grafik, tablo, sütun yok
☐ output/ ve docs/ dizinlerine kopyalandı
⛔ GECEMEZSEN: Türkçe karakter bozulması veya ATS uyumsuzluğu → şablon düzelt
```

### 🎯 QG-1.1 E2E — Faz 1 Tam Akış
```
Test: PS-001 senaryosu uçtan uca çalışıyor
☐ TC-UAT-001: Deneyim fotoğrafı doğru etiketlendi
☐ TC-UAT-002: 6 fotoğraf 30sn altında tamamlandı
☐ TC-UAT-004: Eksik zorunlu bölüm butonu devre dışı bıraktı
☐ TC-UAT-007: Onay olmadan CV üretilmedi
☐ TC-UAT-008: PDF ATS skoru ≥ 85/100
☐ TC-UAT-009: TR ve EN PDF ikisi de indirilebilir
☐ TC-UAT-010: ATS skoru + 3 öneri gösterildi
☐ Toplam akış 5 dakika altında tamamlandı (NFR-USE-001)
⛔ GECEMEZSEN: Faz 2'ye geçiş yok — kritik bug'ları düzelt, regression çalıştır
```

### 🛡️ QG-1.1 REGRESSION — Faz 1 Tam Regresyon
```
Test: Faz 1 sonunda tüm unit testler tekrar çalışıyor
☐ QG-1.1.1 tekrar geçti (Upload UI)
☐ QG-1.1.2 tekrar geçti (Bölüm Tespit)
☐ QG-1.1.3 tekrar geçti (Veri Çıkarım)
☐ QG-1.1.4 tekrar geçti (Integration)
☐ QG-1.1.5 tekrar geçti (Onay UI)
☐ QG-1.1.6 tekrar geçti (LaTeX)
⛔ GECEMEZSEN: Regresyon hatası var — hangi değişiklik bozdu? Düzelt
```

### 🔬 QG-1.2.1 UNIT — Gizlilik Toggle
```
Test: Hariç tutulan alanlar PDF'de görünmüyor
☐ Telefon toggle kapalı → PDF'de telefon numarası yok (TC-UAT-012)
☐ E-posta toggle kapalı → PDF'de e-posta yok
☐ Toggle açık → alan PDF'de görünüyor
☐ Toggle durumu LaTeX şablonuna doğru yansıdı
⛔ GECEMEZSEN: Gizlenmesi gereken kişisel veri PDF'de görünüyorsa KVKK riski
```

### 🔬 QG-1.2.2 UNIT — Varyant Seçici
```
Test: Doğru şablon seçiliyor
☐ "SAP B1" seçildi → cv_tr_sap.tex kullanıldı (TC-UAT-011)
☐ SAP PDF'de SAP Business One, HANA kelimeleri öne çıkmış
☐ "AI Engineer" seçildi → cv_tr_ai.tex kullanıldı
☐ "Genel" seçildi → cv_tr.tex kullanıldı
⛔ GECEMEZSEN: Yanlış şablon seçimi → şablon yönlendirme mantığını düzelt
```

### 🔗 QG-1.2 INTEGRATION — Faz 2 Entegrasyon
```
Test: Gizlilik + Varyant + Çoklu Dil birlikte çalışıyor
☐ SAP varyantı + tel gizli → SAP PDF'de telefon yok
☐ TR + EN paralel üretildi, her ikisi doğru varyant
☐ Tüm kombinasyonlar (3 varyant × 2 dil = 6 PDF) üretilebilir
⛔ GECEMEZSEN: Kombinasyon hatası → her kombinasyonu ayrı ayrı test et
```

### 🎯 QG-1.2 E2E — Faz 2 Tam Akış
```
Test: SAP CV + gizlilik korumalı tam senaryo
☐ TC-UAT-011: SAP varyantı doğru üretildi
☐ TC-UAT-012: Telefon gizlendi, PDF'de görünmüyor
☐ TC-UAT-009: TR ve EN versiyonları mevcut
☐ Faz 1 E2E hâlâ çalışıyor (regression)
⛔ GECEMEZSEN: Faz 3'e geçiş yok
```

### 🛡️ QG-1.2 REGRESSION — Faz 1+2 Tam Regresyon
```
Test: Faz 1 tüm QG'ler + Faz 2 QG'ler
☐ Faz 1 tüm 7 QG tekrar geçti
☐ QG-1.2.1 tekrar geçti
☐ QG-1.2.2 tekrar geçti
☐ QG-1.2 Integration tekrar geçti
⛔ GECEMEZSEN: Faz 2 değişiklikleri Faz 1'i bozdu — git bisect ile tespit et
```

### 🔬 QG-1.3.1 UNIT — Lokal API Key
```
Test: API key güvenli saklanıyor ve doğru kullanılıyor
☐ API key network tab'da plain text görünmüyor (NFR-SEC-001)
☐ Konsol/log çıktısında maskeleniyor (***KEY***)
☐ İstek doğrudan Google API'ye gidiyor (TC-UAT-013)
☐ Geçersiz key → anlaşılır hata mesajı
⛔ GECEMEZSEN: API key sızıntısı kritik güvenlik açığı
```

### 🔬 QG-1.3.2 UNIT — Profil Yöneticisi
```
Test: Profil kaydet/yükle/sil çalışıyor
☐ Profil kaydedildi → localStorage'da mevcut
☐ Kayıtlı profil yüklendi → onay ekranı doldu
☐ Profil silindi → listeden kalktı, localStorage'dan temizlendi
☐ Fotoğraf verisi sunucuda saklanmıyor (NFR-SEC-002)
⛔ GECEMEZSEN: Veri kalıcılığı hatası → localStorage API'yi kontrol et
```

### 🎯 QG-1.3 E2E + 🛡️ FINAL REGRESSION
```
Test: TÜM /bap TC senaryoları + tüm QG'ler
☐ TC-UAT-001 → TC-UAT-013 hepsi geçti
☐ PS-001 (Mutlu Yol) uçtan uca çalışıyor
☐ PS-002 (Düşük Güven) kullanıcı manuel seçti, devam etti
☐ PS-003 (API Hatası) 1 hata pipeline'ı durdurmadı
☐ NFR-PERF-001: Tekil analiz ≤ 8sn ✓
☐ NFR-PERF-002: 6 fotoğraf ≤ 30sn ✓
☐ NFR-PERF-003: PDF üretim ≤ 15sn ✓
☐ NFR-REL-001: Tespit doğruluğu ≥ %85 ✓
☐ NFR-COMP-001: ATS ≥ 85/100 ✓
☐ NFR-COMP-002: Türkçe karakter bütünlüğü ✓
☐ Faz 1+2+3 tüm 13 QG tekrar geçti
⛔ GECEMEZSEN: Deployment yapılamaz — tüm red item'ları listele, önceliklendir
```

---

## AI İLE KODLAMA STRATEJİSİ

```
Yaklaşım: Vertical Slicing + Spec-Driven Development

Her görev için AI prompt yapısı:
1. Dosya yolunu belirt (örn: portfolio/src/app/api/parse/route.ts)
2. Bağımlı dosyaları referans göster (cv_generator/template_engine.py)
3. Fonksiyon/sınıf imzasını ver
4. Giriş/çıkış formatını açıkla (JSON şeması)
5. Kabul kriterini belirt (Given/When/Then — TC-UAT-XXX'ten)

Optimum görev boyutu:
- Tek dosya, 100-500 satır kod
- 4-8 saat iş (8/80 kuralı)
- Tek sorumluluk (FR-XXX bazında)
- Test edilebilir (TC-UAT-XXX bağlantılı)

Kritik varsayım doğrulama sırası (sprint 1 öncesi):
1. A-001: 20 ekran görüntüsü pilot testi → %85 doğruluk var mı?
2. A-002: XeLaTeX Next.js API route'tan çalışıyor mu?
3. A-003: LinkedIn ToS incelemesi tamamlandı mı?
```

---

## FAZ BAZLI UYGULAMA SIRASI

| Faz | Bölüm | Görev | QG | Öncelik |
|-----|-------|-------|----|---------|
| 1 | 1.1.1 | Onboarding & Upload UI | QG-1.1.1 | Sprint 1 |
| 1 | 1.1.2 | Bölüm Tespit Motoru | QG-1.1.2 | Sprint 1 |
| 1 | 1.1.3 | Veri Çıkarım | QG-1.1.3 | Sprint 1 |
| 1 | 1.1.4 | Eksik Bölüm Yönetimi | QG-1.1.4 | Sprint 2 |
| 1 | 1.1.5 | Veri Onay UI | QG-1.1.5 | Sprint 2 |
| 1 | 1.1.6 | LaTeX CV Üretimi | QG-1.1.6 | Sprint 2 |
| 1 | 1.1.7 | İndirme & ATS UI | QG-1.1 E2E | Sprint 3 |
| 2 | 1.2.1 | Gizlilik Paneli | QG-1.2.1 | Sprint 4 |
| 2 | 1.2.2 | CV Varyant Seçici | QG-1.2.2 | Sprint 4 |
| 2 | 1.2.3 | Çoklu Dil Üretim | QG-1.2 E2E | Sprint 5 |
| 3 | 1.3.1 | Lokal API Key | QG-1.3.1 | Sprint 6 |
| 3 | 1.3.2 | CV Profil Yöneticisi | QG-1.3.2 | Sprint 6 |
| 3 | 1.3.3 | Hatırlatıcı | QG-1.3 E2E | Sprint 7 |

**Toplam:** 3 Faz | 13 Bölüm | 47 Atomik Görev | 13 Quality Gate | 7 Sprint
