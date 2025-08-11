<?php
/**
 * QSell Lead Manager - System logowania
 * Backend w PHP 8.3
 */

require_once '../backend/config.php';
require_once '../backend/database.php';

// Ustawienie nagłówków
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Sprawdzenie metody HTTP
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Sprawdzenie czy sesja już istnieje
session_start();
if (isset($_SESSION['user_id']) && isset($_SESSION['username'])) {
    echo json_encode([
        'status' => 'success',
        'message' => 'Już zalogowany',
        'user' => [
            'id' => $_SESSION['user_id'],
            'username' => $_SESSION['username'],
            'role' => $_SESSION['role']
        ]
    ]);
    exit;
}

try {
    // Pobieranie danych z formularza
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data) {
        throw new Exception('Nieprawidłowe dane JSON');
    }
    
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';
    
    // Walidacja danych
    if (empty($username) || empty($password)) {
        throw new Exception('Nazwa użytkownika i hasło są wymagane');
    }
    
    // Sprawdzenie logowania
    $user = authenticateUser($username, $password);
    
    if ($user) {
        // Ustawienie sesji
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['login_time'] = time();
        
        logMessage('INFO', 'Użytkownik zalogowany', [
            'username' => $username,
            'ip' => $_SERVER['REMOTE_ADDR']
        ]);
        
        echo json_encode([
            'status' => 'success',
            'message' => 'Zalogowano pomyślnie',
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'role' => $user['role']
            ]
        ]);
    } else {
        throw new Exception('Nieprawidłowa nazwa użytkownika lub hasło');
    }
    
} catch (Exception $e) {
    logMessage('WARNING', 'Nieudana próba logowania', [
        'username' => $username ?? 'unknown',
        'ip' => $_SERVER['REMOTE_ADDR'],
        'error' => $e->getMessage()
    ]);
    
    http_response_code(401);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}

/**
 * Uwierzytelnianie użytkownika
 */
function authenticateUser($username, $password) {
    try {
        $db = getDB();
        $connection = $db->getConnection();
        
        $stmt = $connection->prepare("
            SELECT id, username, password_hash, role 
            FROM users 
            WHERE username = ? AND is_active = 1
        ");
        
        $stmt->execute([$username]);
        $user = $stmt->fetch();
        
        if ($user && password_verify($password, $user['password_hash'])) {
            return $user;
        }
        
        return false;
        
    } catch (Exception $e) {
        logMessage('ERROR', 'Błąd uwierzytelniania: ' . $e->getMessage());
        return false;
    }
}

/**
 * Funkcja do testowania logowania (tylko w trybie debug)
 */
function testLogin() {
    if (!isProduction()) {
        echo "Test logowania:\n";
        echo "Domyślny admin: " . ADMIN_USERNAME . " / admin123\n";
        
        $testUser = authenticateUser(ADMIN_USERNAME, 'admin123');
        if ($testUser) {
            echo "Test logowania zakończony pomyślnie\n";
        } else {
            echo "Test logowania nieudany\n";
        }
    }
}

// Test logowania w trybie debug
if (isset($_GET['test']) && !isProduction()) {
    testLogin();
}
?>
