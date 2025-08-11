<?php
/**
 * QSell Lead Manager - Konfiguracja
 * Backend w PHP 8.3
 */

// Konfiguracja bazy danych
define('DB_HOST', 'localhost');
define('DB_NAME', 'qsell_lead_manager');
define('DB_USER', 'root');
define('DB_PASS', '');

// Konfiguracja Meta Ads Webhook
define('META_WEBHOOK_VERIFY_TOKEN', 'qsell_webhook_2024');
define('META_APP_SECRET', ''); // Do uzupełnienia przez admina

// Konfiguracja systemu logowania
define('ADMIN_USERNAME', 'admin');
define('ADMIN_PASSWORD_HASH', ''); // Hash hasła - do uzupełnienia

// Konfiguracja aplikacji
define('APP_NAME', 'QSell Lead Manager');
define('APP_VERSION', '1.0.0');
define('APP_URL', 'http://localhost');

// Konfiguracja sesji
define('SESSION_LIFETIME', 3600); // 1 godzina
define('SESSION_NAME', 'qsell_session');

// Konfiguracja logów
define('LOG_FILE', __DIR__ . '/../logs/app.log');
define('LOG_LEVEL', 'INFO'); // DEBUG, INFO, WARNING, ERROR

// Konfiguracja Meta Ads
define('META_LEAD_FIELDS', [
    'name' => 'full_name',
    'email' => 'email',
    'phone' => 'phone_number',
    'source' => 'ad_name',
    'campaign' => 'campaign_name'
]);

// Konfiguracja cenników
define('PRICING_CONFIG', [
    'amazon' => [
        'implementation' => ['min' => 4000, 'max' => 5000],
        'ads_monthly' => 1890
    ],
    'ebay' => [
        'implementation' => ['min' => 2500, 'max' => 3500],
        'ads_monthly' => 1390
    ],
    'emag' => [
        'implementation' => ['min' => 3000, 'max' => 10000],
        'ads_monthly' => 790,
        'complex_monthly' => 1500
    ],
    'kaufland' => [
        'implementation' => ['min' => 2500, 'max' => 4500],
        'ads_monthly' => 1390
    ],
    'empik' => [
        'implementation' => ['min' => 3000, 'max' => 10000],
        'ads_monthly' => 790,
        'complex_monthly' => 1190
    ],
    'erli' => [
        'implementation' => ['min' => 3000, 'max' => 10000],
        'ads_monthly' => 790,
        'complex_monthly' => 1190
    ],
    'allegro_cz_sk_hu' => [
        'ads_monthly' => 300
    ],
    'base_com' => [
        'implementation' => ['min' => 3000, 'max' => 10000]
    ]
]);

// Konfiguracja rabatów
define('DISCOUNT_CONFIG', [
    'package_discount' => 500, // PLN za pakiet
    'max_discount_percent' => 50, // Maksymalny rabat w %
    'min_package_items' => 2 // Minimalna liczba usług w pakiecie
];

// Konfiguracja PDF
define('PDF_CONFIG', [
    'logo_url' => 'https://docs.google.com/document/d/1BBozpaoB4sluTGAQbmb1W0qF3rBy-UMWW6RMtNQfYow/edit?tab=t.0#heading=h.lpt55wuxrgzt',
    'company_name' => 'QSell sp. z o.o.',
    'company_address' => 'ul. Michała Kleofasa Ogińskiego 2, 85-092 Bydgoszcz',
    'company_phone' => '+48 795 805 500',
    'company_email' => 'info@qsell.pl'
]);

// Konfiguracja maili
define('MAIL_CONFIG', [
    'smtp_host' => 'localhost',
    'smtp_port' => 587,
    'smtp_username' => '',
    'smtp_password' => '',
    'from_email' => 'noreply@qsell.pl',
    'from_name' => 'QSell Lead Manager'
]);

// Funkcja do logowania
function logMessage($level, $message, $context = []) {
    if (!is_dir(dirname(LOG_FILE))) {
        mkdir(dirname(LOG_FILE), 0755, true);
    }
    
    $timestamp = date('Y-m-d H:i:s');
    $logEntry = "[$timestamp] [$level] $message";
    
    if (!empty($context)) {
        $logEntry .= ' ' . json_encode($context);
    }
    
    $logEntry .= PHP_EOL;
    
    file_put_contents(LOG_FILE, $logEntry, FILE_APPEND | LOCK_EX);
}

// Funkcja do debugowania
function debug($data) {
    if (LOG_LEVEL === 'DEBUG') {
        logMessage('DEBUG', print_r($data, true));
    }
}

// Funkcja do sprawdzania czy jesteśmy w trybie produkcyjnym
function isProduction() {
    return APP_URL !== 'http://localhost';
}

// Funkcja do bezpiecznego wyjścia
function safeExit($message = '', $code = 0) {
    if ($message) {
        logMessage('INFO', $message);
    }
    exit($code);
}
?>
