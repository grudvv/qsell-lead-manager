# QSell Lead Manager 🚀

**Profesjonalny System Zarządzania Leadami dla QSell**

![QSell Lead Manager](https://img.shields.io/badge/QSell-Lead%20Manager-red?style=for-the-badge&logo=shopping-cart)

## 🎯 O Aplikacji

QSell Lead Manager to zaawansowany system do zarządzania leadami, zaprojektowany specjalnie dla firmy QSell. Aplikacja umożliwia efektywne śledzenie, kategoryzowanie i zarządzanie potencjalnymi klientami z różnych marketplace'ów.

## ✨ Funkcjonalności

### 🎨 **Design QSell**
- **Kolory firmowe**: Czerwony (#ff0000) i czarny (#000000)
- **Logo QSell** w nagłówku
- **Profesjonalny gradient** czerwono-czarny
- **Glassmorphism** efekty

### 📊 **Zarządzanie Leadami**
- ✅ **Dodawanie leadów** z pełnymi danymi
- ✅ **Edycja** istniejących leadów
- ✅ **Usuwanie** leadów
- ✅ **Zmiana statusów** w czasie rzeczywistym
- ✅ **Kategorie leadów** (Sprzedaż, Wsparcie, Integracja, Konsultacja)
- ✅ **Priorytety** (Niski, Średni, Wysoki)
- ✅ **Szacowana wartość** leadu

### 🏪 **Marketplace'y QSell**
- **eBay** - Międzynarodowy marketplace
- **Amazon** - Globalny gigant e-commerce
- **Allegro** - Polski lider sprzedaży online
- **Kaufland** - Niemiecki marketplace
- **Erli** - Platforma sprzedażowa
- **Empik** - Polski sklep internetowy
- **eMAG** - Rumuński marketplace
- **Integracja Basellinker** - System zarządzania sprzedażą
- **Strona internetowa** - Własne kanały sprzedaży
- **Inne** - Dodatkowe platformy

### 📈 **Statusy Leadów**
1. **NOWY LEAD** - Nowo dodany lead
2. **W OBSŁUDZE** - Lead w trakcie obsługi
3. **NEGATYW** - Klient nie zainteresowany
4. **POZYTYW** - Klient zainteresowany
5. **ZAMKNIĘTE** - Umowa podpisana / projekt zrealizowany

### 🔍 **Zaawansowane Filtry**
- **Filtrowanie po statusie**
- **Filtrowanie po marketplace**
- **Filtrowanie po priorytecie**
- **Filtrowanie po kategorii**
- **Filtrowanie po wartości** (zakres min-max)
- **Filtrowanie po dacie** (od-do)
- **Wyszukiwanie tekstowe** (imię, firma, telefon, email, notatki)

### 📊 **Dashboard i Statystyki**
- **Statystyki w czasie rzeczywistym**
- **Liczba leadów w każdym statusie**
- **Całkowita wartość leadów**
- **Dashboard z wykresami** (w przygotowaniu)
- **Top marketplace'y**
- **Wskaźniki konwersji**

### 🛠️ **Dodatkowe Funkcje**
- **Eksport do Excel** (CSV)
- **Szablony wiadomości** - gotowe teksty do kopiowania
- **Przypomnienia** - lista następnych akcji
- **Historia kontaktów**
- **Responsywny design** - działa na wszystkich urządzeniach
- **Zapisywanie w localStorage** - dane nie giną po odświeżeniu

## 🚀 Jak Uruchomić

### Lokalnie
1. **Pobierz pliki** do folderu
2. **Otwórz `index.html`** w przeglądarce
3. **Gotowe!** 🎉

### Alternatywnie (serwer lokalny)
```bash
# W folderze z plikami
python3 -m http.server 8000
# Otwórz http://localhost:8000
```

## 📁 Struktura Plików

```
lead-manager/
├── index.html          # Główny plik HTML
├── styles.css          # Style CSS z kolorami QSell
├── script.js           # Logika JavaScript
└── README.md           # Ten plik
```

## 🎯 Jak Używać

### 1. **Dodawanie Leadu**
- Kliknij **"Nowy Lead"**
- Wypełnij dane (imię, telefon, marketplace - wymagane)
- Dodaj opcjonalne informacje (firma, email, kategoria, priorytet, wartość)
- Kliknij **"Zapisz Lead"**

### 2. **Zarządzanie Statusami**
- Kliknij **"Zmień Status"** na karcie leada
- Wybierz nowy status
- Status zostanie zaktualizowany automatycznie

### 3. **Filtrowanie i Wyszukiwanie**
- Użyj **filtrów zaawansowanych** (rozwiń sekcję)
- Wpisz tekst w **wyszukiwarce**
- Filtry działają w czasie rzeczywistym

### 4. **Eksport Danych**
- Kliknij **"Eksport Excel"**
- Plik CSV zostanie pobrany automatycznie

### 5. **Szablony Wiadomości**
- Kliknij **"Szablony"**
- Wybierz gotowy tekst
- Kliknij **"Kopiuj"**

## 🎨 Design

### **Kolory QSell**
- **Czerwony**: #ff0000 (główny kolor)
- **Ciemny czerwony**: #cc0000 (gradient)
- **Czarny**: #000000 (tło)
- **Biały**: #ffffff (tekst)

### **Elementy UI**
- **Glassmorphism** - przezroczyste karty z efektem blur
- **Gradient tła** - czerwono-czarny
- **Animacje** - płynne przejścia i hover efekty
- **Responsywność** - dostosowuje się do wszystkich urządzeń

## 💾 Przechowywanie Danych

**Obecnie**: `localStorage` (dane w przeglądarce)
- ✅ Dane nie giną po odświeżeniu
- ✅ Działa offline
- ✅ Szybki dostęp

**Planowane**: Baza danych
- 🔄 SQLite / PostgreSQL
- 🔄 Supabase / Firebase
- 🔄 Własny backend (Node.js/PHP/Python)

## 🚀 Hosting i Deployment

### **Opcje Hostingowe**
1. **GitHub Pages** - Darmowy hosting
2. **Vercel** - Szybki deployment
3. **Netlify** - Automatyczne wdrożenia
4. **VPS** - Pełna kontrola

### **Jak Wdrożyć na GitHub Pages**
1. Utwórz repozytorium na GitHub
2. Wgraj pliki do repozytorium
3. Włącz GitHub Pages w ustawieniach
4. Aplikacja będzie dostępna pod adresem: `https://username.github.io/repository-name`

## 🔮 Planowane Funkcje

### **Krótkoterminowe**
- [ ] **Wykresy w Dashboard** (Chart.js)
- [ ] **Powiadomienia email**
- [ ] **Kalendarz spotkań**
- [ ] **Import z Excel**

### **Długoterminowe**
- [ ] **Baza danych** (SQLite/PostgreSQL)
- [ ] **Autentykacja użytkowników**
- [ ] **API REST**
- [ ] **Integracja z CRM**
- [ ] **Automatyczne przypomnienia**
- [ ] **Raporty PDF**

## 🛠️ Technologie

- **HTML5** - Struktura
- **CSS3** - Stylowanie (Flexbox, Grid, Animacje)
- **JavaScript (ES6+)** - Logika aplikacji
- **Font Awesome** - Ikony
- **Inter Font** - Typografia
- **localStorage** - Przechowywanie danych

## 📞 Wsparcie

**QSell Lead Manager** - Profesjonalne zarządzanie leadami dla Twojej firmy!

---

*Wykonane specjalnie dla QSell - e-commerce bez tajemnic* 🚀 
