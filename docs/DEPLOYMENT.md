# QSell Lead Manager - Instrukcje Deployment

## 🚀 **Wymagania Serwera**

### **System Operacyjny:**
- **Ubuntu 20.04 LTS** lub nowszy
- **PHP 8.3** (wymagane!)
- **MySQL 8.0** lub **PostgreSQL 13+**
- **Nginx** lub **Apache**

### **Minimalne Specyfikacje:**
- **RAM:** 2GB (zalecane 4GB)
- **CPU:** 2 vCPU
- **Dysk:** 20GB SSD
- **Porty:** 80 (HTTP), 443 (HTTPS), 22 (SSH)

## 📦 **Instalacja**

### **1. Aktualizacja Systemu:**
```bash
sudo apt update && sudo apt upgrade -y
```

### **2. Instalacja PHP 8.3:**
```bash
# Dodanie repozytorium PHP 8.3
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update

# Instalacja PHP 8.3 i rozszerzeń
sudo apt install php8.3 php8.3-fpm php8.3-mysql php8.3-json php8.3-curl php8.3-mbstring php8.3-xml php8.3-zip php8.3-gd php8.3-bcmath -y

# Sprawdzenie wersji
php -v
```

### **3. Instalacja MySQL:**
```bash
sudo apt install mysql-server -y
sudo mysql_secure_installation

# Utworzenie bazy danych
sudo mysql -u root -p
CREATE DATABASE qsell_lead_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'qsell_user'@'localhost' IDENTIFIED BY 'twoje_haslo_123';
GRANT ALL PRIVILEGES ON qsell_lead_manager.* TO 'qsell_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### **4. Instalacja Nginx:**
```bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

### **5. Instalacja wkhtmltopdf (dla generowania PDF):**
```bash
# Pobranie i instalacja wkhtmltopdf
wget https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6-1/wkhtmltox_0.12.6-1.focal_amd64.deb
sudo dpkg -i wkhtmltox_0.12.6-1.focal_amd64.deb
sudo apt-get install -f -y

# Sprawdzenie instalacji
wkhtmltopdf --version
```

## 🔧 **Konfiguracja**

### **1. Konfiguracja PHP:**
```bash
# Edycja php.ini
sudo nano /etc/php/8.3/fpm/php.ini

# Ustawienia do zmiany:
upload_max_filesize = 10M
post_max_size = 10M
memory_limit = 256M
max_execution_time = 300
date.timezone = Europe/Warsaw

# Restart PHP-FPM
sudo systemctl restart php8.3-fpm
```

### **2. Konfiguracja Nginx:**
```bash
sudo nano /etc/nginx/sites-available/qsell-lead-manager

# Konfiguracja:
server {
    listen 80;
    server_name twoja-domena.pl;
    root /var/www/qsell-lead-manager;
    index index.html index.php;

    # Główna aplikacja
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend PHP
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # API endpoints
    location /api/ {
        try_files $uri $uri/ /api/index.php;
    }

    # Backend
    location /backend/ {
        try_files $uri $uri/ /backend/index.php;
    }

    # Auth
    location /auth/ {
        try_files $uri $uri/ /auth/index.php;
    }

    # Statyczne pliki
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Aktywacja strony
sudo ln -s /etc/nginx/sites-available/qsell-lead-manager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### **3. Konfiguracja Bazy Danych:**
```bash
# Edycja pliku config.php
sudo nano /var/www/qsell-lead-manager/backend/config.php

# Zmiana ustawień:
define('DB_HOST', 'localhost');
define('DB_NAME', 'qsell_lead_manager');
define('DB_USER', 'qsell_user');
define('DB_PASS', 'twoje_haslo_123');
define('APP_URL', 'https://twoja-domena.pl');
```

## 📁 **Deployment Plików**

### **1. Pobranie z Git:**
```bash
cd /var/www
sudo git clone https://github.com/grudvv/qsell-lead-manager.git
sudo chown -R www-data:www-data qsell-lead-manager
sudo chmod -R 755 qsell-lead-manager
```

### **2. Inicjalizacja Bazy Danych:**
```bash
cd /var/www/qsell-lead-manager
sudo php -f backend/database.php
```

### **3. Tworzenie Katalogów:**
```bash
sudo mkdir -p /var/www/qsell-lead-manager/logs
sudo mkdir -p /var/www/qsell-lead-manager/quotes
sudo chown -R www-data:www-data /var/www/qsell-lead-manager/logs
sudo chown -R www-data:www-data /var/www/qsell-lead-manager/quotes
```

## 🔐 **SSL/HTTPS**

### **Instalacja Certbot (Let's Encrypt):**
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d twoja-domena.pl
```

## 🧪 **Testowanie**

### **1. Test PHP:**
```bash
# Test PHP-FPM
sudo systemctl status php8.3-fpm

# Test PHP
php -v
php -m | grep -E "(mysql|json|curl|mbstring|xml|zip|gd|bcmath)"
```

### **2. Test Bazy Danych:**
```bash
# Test połączenia MySQL
mysql -u qsell_user -p qsell_lead_manager -e "SHOW TABLES;"
```

### **3. Test Webhook Meta Ads:**
```bash
# Test weryfikacji webhook
curl "https://twoja-domena.pl/api/meta-webhook.php?hub_mode=subscribe&hub_verify_token=qsell_webhook_2024&hub_challenge=test123"

# Test webhook (tylko w trybie debug)
curl "https://twoja-domena.pl/api/meta-webhook.php?test=1"
```

### **4. Test Logowania:**
```bash
# Test logowania (tylko w trybie debug)
curl "https://twoja-domena.pl/auth/login.php?test=1"
```

## 📱 **Konfiguracja Meta Ads**

### **1. Facebook Developer:**
- Idź na [developers.facebook.com](https://developers.facebook.com)
- Zaloguj się swoim Facebookiem
- Kliknij "Create App"
- Wybierz "Business" → "Lead Ads"
- Nazwij app (np. "QSell Lead Manager")

### **2. Meta Ads Manager:**
- Otwórz [business.facebook.com](https://business.facebook.com)
- Idź do Lead Ad (który już masz)
- Dodaj webhook URL: `https://twoja-domena.pl/api/meta-webhook.php`
- Token weryfikacji: `qsell_webhook_2024`
- Zapisz zmiany

## 🔑 **Domyślne Dane Logowania**

### **Admin Panel:**
- **URL:** `https://twoja-domena.pl/auth/login.php`
- **Login:** `admin`
- **Hasło:** `admin123`

**⚠️ ZMIEŃ HASŁO NA PRODUKCJI!**

## 📊 **Monitoring**

### **1. Logi Aplikacji:**
```bash
sudo tail -f /var/www/qsell-lead-manager/logs/app.log
```

### **2. Logi Nginx:**
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### **3. Logi PHP:**
```bash
sudo tail -f /var/log/php8.3-fpm.log
```

## 🚨 **Bezpieczeństwo**

### **1. Firewall:**
```bash
sudo ufw enable
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw status
```

### **2. Aktualizacje:**
```bash
# Automatyczne aktualizacje bezpieczeństwa
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 📞 **Wsparcie**

### **W przypadku problemów:**
1. Sprawdź logi aplikacji
2. Sprawdź logi serwera
3. Sprawdź status usług
4. Sprawdź uprawnienia plików

### **Polecane narzędzia:**
- **htop** - monitoring systemu
- **iotop** - monitoring dysku
- **nethogs** - monitoring sieci

---

**🎯 QSell Lead Manager jest gotowy do użycia!**
