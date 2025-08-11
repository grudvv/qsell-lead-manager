<?php
/**
 * QSell Lead Manager - Baza danych
 * Backend w PHP 8.3
 */

require_once 'config.php';

class Database {
    private $connection;
    private static $instance = null;
    
    private function __construct() {
        try {
            $this->connection = new PDO(
                "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
                DB_USER,
                DB_PASS,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]
            );
            logMessage('INFO', 'Połączono z bazą danych MySQL');
        } catch (PDOException $e) {
            logMessage('ERROR', 'Błąd połączenia z bazą danych: ' . $e->getMessage());
            throw new Exception('Nie można połączyć się z bazą danych');
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->connection;
    }
    
    // Tworzenie tabel w bazie danych
    public function createTables() {
        $queries = [
            // Tabela użytkowników
            "CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                role ENUM('admin', 'user') DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )",
            
            // Tabela leadów
            "CREATE TABLE IF NOT EXISTS leads (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL,
                phone VARCHAR(20),
                company VARCHAR(100),
                source VARCHAR(50) DEFAULT 'manual',
                campaign VARCHAR(100),
                status ENUM('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost') DEFAULT 'new',
                notes TEXT,
                assigned_to INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
            )",
            
            // Tabela wycen
            "CREATE TABLE IF NOT EXISTS quotes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                lead_id INT NOT NULL,
                title VARCHAR(200) NOT NULL,
                description TEXT,
                total_amount DECIMAL(10,2) NOT NULL,
                discount_percent DECIMAL(5,2) DEFAULT 0,
                discount_amount DECIMAL(10,2) DEFAULT 0,
                final_amount DECIMAL(10,2) NOT NULL,
                status ENUM('draft', 'sent', 'accepted', 'rejected') DEFAULT 'draft',
                valid_until DATE,
                created_by INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
                FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
            )",
            
            // Tabela pozycji wyceny
            "CREATE TABLE IF NOT EXISTS quote_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                quote_id INT NOT NULL,
                service_type VARCHAR(50) NOT NULL,
                platform VARCHAR(50) NOT NULL,
                package_type VARCHAR(50) NOT NULL,
                quantity INT DEFAULT 1,
                unit_price DECIMAL(10,2) NOT NULL,
                total_price DECIMAL(10,2) NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
            )",
            
            // Tabela szablonów maili
            "CREATE TABLE IF NOT EXISTS email_templates (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                subject VARCHAR(200) NOT NULL,
                body TEXT NOT NULL,
                variables JSON,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )",
            
            // Tabela wysłanych maili
            "CREATE TABLE IF NOT EXISTS sent_emails (
                id INT AUTO_INCREMENT PRIMARY KEY,
                lead_id INT,
                quote_id INT,
                template_id INT,
                recipient_email VARCHAR(100) NOT NULL,
                subject VARCHAR(200) NOT NULL,
                body TEXT NOT NULL,
                sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status ENUM('sent', 'delivered', 'failed') DEFAULT 'sent',
                FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
                FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE SET NULL,
                FOREIGN KEY (template_id) REFERENCES email_templates(id) ON DELETE SET NULL
            )",
            
            // Tabela logów Meta Ads webhook
            "CREATE TABLE IF NOT EXISTS meta_webhook_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                webhook_data JSON NOT NULL,
                processed BOOLEAN DEFAULT FALSE,
                lead_id INT,
                error_message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL
            )"
        ];
        
        foreach ($queries as $query) {
            try {
                $this->connection->exec($query);
            } catch (PDOException $e) {
                logMessage('ERROR', 'Błąd tworzenia tabeli: ' . $e->getMessage());
                throw new Exception('Nie można utworzyć tabel w bazie danych');
            }
        }
        
        logMessage('INFO', 'Utworzono wszystkie tabele w bazie danych');
        
        // Dodaj domyślnego admina jeśli nie istnieje
        $this->createDefaultAdmin();
        
        // Dodaj domyślne szablony maili
        $this->createDefaultEmailTemplates();
    }
    
    // Tworzenie domyślnego admina
    private function createDefaultAdmin() {
        $stmt = $this->connection->prepare("SELECT COUNT(*) FROM users WHERE role = 'admin'");
        $stmt->execute();
        
        if ($stmt->fetchColumn() == 0) {
            $defaultPassword = 'admin123'; // Zmień na produkcji!
            $passwordHash = password_hash($defaultPassword, PASSWORD_DEFAULT);
            
            $stmt = $this->connection->prepare("
                INSERT INTO users (username, password_hash, email, role) 
                VALUES (?, ?, ?, 'admin')
            ");
            $stmt->execute([ADMIN_USERNAME, $passwordHash, 'admin@qsell.pl']);
            
            logMessage('INFO', 'Utworzono domyślnego admina: ' . ADMIN_USERNAME . ' / ' . $defaultPassword);
        }
    }
    
    // Tworzenie domyślnych szablonów maili
    private function createDefaultEmailTemplates() {
        $templates = [
            [
                'name' => 'Wycena - Nowa oferta',
                'subject' => 'Wycena usług QSell - {company_name}',
                'body' => "Dzień dobry {name},\n\nDziękujemy za zainteresowanie naszymi usługami.\n\nW załączeniu znajdziesz szczegółową wycenę dla Twojej firmy.\n\nPozdrawiamy,\nZespół QSell",
                'variables' => json_encode(['name', 'company_name'])
            ],
            [
                'name' => 'Przypomnienie o wycenie',
                'subject' => 'Przypomnienie - Wycena QSell',
                'body' => "Dzień dobry {name},\n\nPrzypominamy o naszej wycenie, która jest ważna do {valid_until}.\n\nCzy masz pytania?\n\nPozdrawiamy,\nZespół QSell",
                'variables' => json_encode(['name', 'valid_until'])
            ]
        ];
        
        foreach ($templates as $template) {
            $stmt = $this->connection->prepare("
                INSERT IGNORE INTO email_templates (name, subject, body, variables) 
                VALUES (?, ?, ?, ?)
            ");
            $stmt->execute([$template['name'], $template['subject'], $template['body'], $template['variables']]);
        }
        
        logMessage('INFO', 'Utworzono domyślne szablony maili');
    }
    
    // Funkcja do zamykania połączenia
    public function close() {
        $this->connection = null;
    }
    
    // Destruktor
    public function __destruct() {
        $this->close();
    }
}

// Funkcja pomocnicza do pobierania instancji bazy danych
function getDB() {
    return Database::getInstance();
}

// Funkcja do inicjalizacji bazy danych
function initDatabase() {
    try {
        $db = getDB();
        $db->createTables();
        return true;
    } catch (Exception $e) {
        logMessage('ERROR', 'Błąd inicjalizacji bazy danych: ' . $e->getMessage());
        return false;
    }
}
?>
