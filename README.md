# QSell Lead Manager

## 🚀 **Zaawansowany System Zarządzania Leadami z Meta Ads Webhook**

**QSell Lead Manager** to potężne narzędzie firmowe do zarządzania leadami, systemu wycen i integracji z Meta Ads. Aplikacja automatycznie pobiera leady z Facebooka i umożliwia kompleksowe zarządzanie procesem sprzedaży.

## ✨ **Główne Funkcje**

### 🔐 **System Bezpieczeństwa**
- **Logowanie z hasłem** - ochrona dostępu do aplikacji
- **Sesje użytkownika** - bezpieczne zarządzanie dostępem
- **Role użytkowników** - admin i user

### 📱 **Meta Ads Integration**
- **Automatyczne webhook** - leady z Facebooka trafiają automatycznie
- **Mapowanie pól** - inteligentne dopasowanie danych Meta do Lead Manager
- **Logowanie webhook** - pełna historia integracji
- **Weryfikacja Meta** - bezpieczne połączenie z Facebookiem

### 💰 **System Wycen**
- **Automatyczne obliczanie** cen za pakiety usług
- **Rabaty procentowe** - ręczne ustawianie rabatów w %
- **Rabaty za pakiety** - automatyczne 500 PLN za minimum 2 usługi
- **Generowanie PDF** - profesjonalne wyceny z logo QSell

### 📊 **Zarządzanie Leadami**
- **Statusy leadów** - nowy, skontaktowany, kwalifikowany, propozycja, negocjacje, wygrany, przegrany
- **Źródła leadów** - Meta Ads, ręczny, strona WWW, polecenie
- **Historia kontaktów** - pełne śledzenie procesu sprzedaży
- **Przypisanie użytkowników** - delegowanie leadów do zespołu

### 🎯 **Cenniki Usług QSell**
- **Amazon** - wdrożenie 4000-5000 PLN, obsługa ADS 1890 PLN/mies.
- **eBay** - wdrożenie 2500-3500 PLN, obsługa ADS 1390 PLN/mies.
- **eMag** - wdrożenie 3000-10000 PLN, obsługa ADS 790 PLN/mies., kompleks 1500 PLN/mies.
- **Kaufland** - wdrożenie 2500-4500 PLN, obsługa ADS 1390 PLN/mies.
- **Empik** - wdrożenie 3000-10000 PLN, obsługa ADS 790 PLN/mies., kompleks 1190 PLN/mies.
- **ERLI** - wdrożenie 3000-10000 PLN, standard 790 PLN/mies., kompleks 1190 PLN/mies.
- **Allegro CZ/SK/HU** - 300 PLN/mies./rynek
- **Base.com** - wdrożenie 3000-10000 PLN

## 🛠️ **Technologie**

### **Frontend**
- **HTML5** - semantyczna struktura
- **CSS3** - nowoczesny design z zieleniami, beżami i pomarańczami
- **JavaScript (ES6+)** - interaktywna logika aplikacji
- **Font Awesome** - ikony
- **Inter Font** - nowoczesna typografia

### **Backend**
- **PHP 8.3** - najnowsza wersja PHP
- **MySQL 8.0** - baza danych
- **PDO** - bezpieczne połączenia z bazą
- **Sesje PHP** - zarządzanie użytkownikami

### **Integracje**
- **Meta Ads Webhook** - automatyczne leady z Facebooka
- **wkhtmltopdf** - generowanie PDF wycen
- **REST API** - endpointy dla integracji

## 📁 **Struktura Projektu**

```
qsell-lead-manager/
├── index.html              # Główna aplikacja
├── styles.css              # Style CSS
├── script.js               # Logika JavaScript
├── backend/                # Backend PHP
│   ├── config.php          # Konfiguracja
│   ├── database.php        # Baza danych
│   └── quotes.php          # System wycen
├── api/                    # API endpoints
│   └── meta-webhook.php    # Meta Ads webhook
├── auth/                   # System logowania
│   └── login.php           # Logowanie
├── docs/                   # Dokumentacja
│   └── DEPLOYMENT.md       # Instrukcje deployment
├── .htaccess               # Konfiguracja Apache
├── composer.json           # Zależności PHP
└── README.md               # Ten plik
```

## 🚀 **Szybki Start**

### **1. Pobranie Projektu**
```bash
git clone https://github.com/grudvv/qsell-lead-manager.git
cd qsell-lead-manager
```

### **2. Konfiguracja Backend (PHP 8.3)**
```bash
# Edycja konfiguracji
nano backend/config.php

# Uruchomienie bazy danych
php -f backend/database.php
```

### **3. Konfiguracja Meta Ads**
- **Facebook Developer** → Create App → Business → Lead Ads
- **Meta Ads Manager** → Lead Ad → Webhook URL
- **Token weryfikacji**: `qsell_webhook_2024`

### **4. Uruchomienie**
```bash
# Serwer lokalny
php -S localhost:8000

# Lub przez hosting (OVH, Hostinger, etc.)
```

## 🔑 **Domyślne Dane Logowania**

- **URL**: `/auth/login.php`
- **Login**: `admin`
- **Hasło**: `admin123`

**⚠️ ZMIEŃ HASŁO NA PRODUKCJI!**

## 📱 **Meta Ads Webhook**

### **URL Webhook**
```
https://twoja-domena.pl/api/meta-webhook.php
```

### **Token Weryfikacji**
```
qsell_webhook_2024
```

### **Pola Meta → Lead Manager**
- `full_name` → `name`
- `email` → `email`
- `phone_number` → `phone`
- `company_name` → `company`
- `ad_name` → `campaign`

## 💰 **System Wycen**

### **Automatyczne Rabaty**
- **500 PLN** za pakiet z minimum 2 usługami
- **Rabat procentowy** - ustawiany ręcznie przez admina
- **Kalkulacja końcowa** - automatyczne przeliczanie

### **Przykład Wyceny**
```
Amazon + eBay + eMag:
- Wdrożenie: 4000 + 2500 + 3000 = 9500 PLN
- Rabat pakietowy: -500 PLN
- Rabat 15%: -1350 PLN
- Do zapłaty: 7650 PLN
```

## 🎨 **Design System**

### **Kolory QSell**
- **Zielenie**: #2e7d32, #4caf50, #81c784
- **Beże**: #f5f5dc, #e8e8d0
- **Pomarańcze**: #ff9800, #ffb74d
- **Akcenty**: #f44336 (czerwony tylko dla odrzuconych)

### **Motyw**
- **Light Mode** - domyślny
- **Dark Mode** - przełączany
- **Responsywny** - mobile-first design

## 📊 **Baza Danych**

### **Tabele**
- **users** - użytkownicy systemu
- **leads** - leady i kontakty
- **quotes** - wyceny
- **quote_items** - pozycje wycen
- **email_templates** - szablony maili
- **sent_emails** - wysłane maile
- **meta_webhook_logs** - logi Meta Ads

## 🔧 **Konfiguracja**

### **Wymagania Serwera**
- **PHP 8.3+** (wymagane!)
- **MySQL 8.0+** lub PostgreSQL 13+
- **Nginx** lub Apache
- **wkhtmltopdf** (dla generowania PDF)

### **Rozszerzenia PHP**
- PDO MySQL
- JSON
- cURL
- mbstring
- XML
- ZIP
- GD
- bcmath

## 📚 **Dokumentacja**

- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - szczegółowe instrukcje deployment
- **Konfiguracja Meta Ads** - krok po kroku
- **System wycen** - przykłady i kalkulacje
- **API Reference** - endpointy i parametry

## 🤝 **Wsparcie**

### **Kontakt**
- **Email**: info@qsell.pl
- **Telefon**: +48 795 805 500
- **Strona**: https://qsell.pl

### **Wsparcie Techniczne**
- **GitHub Issues** - zgłaszanie błędów
- **Dokumentacja** - szczegółowe instrukcje
- **Przykłady** - gotowe implementacje

## 📄 **Licencja**

**MIT License** - darmowe użytkowanie komercyjne i niekomercyjne.

## 🙏 **Podziękowania**

- **QSell Team** - za pomysły i wymagania
- **Meta/Facebook** - za API Lead Ads
- **Społeczność PHP** - za biblioteki i narzędzia

---

**🎯 QSell Lead Manager - Profesjonalne zarządzanie leadami dla Twojej firmy!**
