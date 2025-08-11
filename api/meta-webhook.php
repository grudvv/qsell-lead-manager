<?php
/**
 * QSell Lead Manager - Meta Ads Webhook
 * Backend w PHP 8.3
 * Automatyczne pobieranie leadów z Facebooka
 */

require_once '../backend/config.php';
require_once '../backend/database.php';

// Ustawienie nagłówków
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

// Sprawdzenie metody HTTP
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Weryfikacja webhook Meta (Facebook)
    handleWebhookVerification();
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Odbieranie leadów z Meta Ads
    handleLeadData();
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

/**
 * Weryfikacja webhook Meta (Facebook)
 */
function handleWebhookVerification() {
    $mode = $_GET['hub_mode'] ?? '';
    $token = $_GET['hub_verify_token'] ?? '';
    $challenge = $_GET['hub_challenge'] ?? '';
    
    if ($mode === 'subscribe' && $token === META_WEBHOOK_VERIFY_TOKEN) {
        logMessage('INFO', 'Webhook Meta zweryfikowany pomyślnie');
        echo $challenge;
        exit;
    } else {
        logMessage('WARNING', 'Nieudana weryfikacja webhook Meta', [
            'mode' => $mode,
            'token' => $token,
            'expected_token' => META_WEBHOOK_VERIFY_TOKEN
        ]);
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden']);
        exit;
    }
}

/**
 * Odbieranie leadów z Meta Ads
 */
function handleLeadData() {
    try {
        // Pobieranie surowych danych
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        
        if (!$data) {
            throw new Exception('Nieprawidłowe dane JSON');
        }
        
        logMessage('INFO', 'Otrzymano webhook Meta Ads', $data);
        
        // Sprawdzenie czy to lead
        if (isset($data['entry'][0]['changes'][0]['value'])) {
            $leadData = $data['entry'][0]['changes'][0]['value'];
            
            // Sprawdzenie czy to nowy lead
            if (isset($leadData['leadgen_id'])) {
                processLead($leadData);
            }
        }
        
        // Logowanie webhook
        logWebhookData($input);
        
        echo json_encode(['status' => 'success']);
        
    } catch (Exception $e) {
        logMessage('ERROR', 'Błąd przetwarzania webhook Meta: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Internal server error']);
    }
}

/**
 * Przetwarzanie leada z Meta Ads
 */
function processLead($leadData) {
    try {
        $db = getDB();
        $connection = $db->getConnection();
        
        // Mapowanie pól Meta na nasze pola
        $leadFields = mapMetaFields($leadData);
        
        // Sprawdzenie czy lead już istnieje
        $stmt = $connection->prepare("
            SELECT id FROM leads 
            WHERE email = ? AND source = 'meta_ads'
        ");
        $stmt->execute([$leadFields['email']]);
        
        if ($stmt->fetch()) {
            logMessage('INFO', 'Lead już istnieje w bazie', ['email' => $leadFields['email']]);
            return;
        }
        
        // Dodanie nowego leada
        $stmt = $connection->prepare("
            INSERT INTO leads (name, email, phone, company, source, campaign, status, notes) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $leadFields['name'],
            $leadFields['email'],
            $leadFields['phone'],
            $leadFields['company'],
            'meta_ads',
            $leadFields['campaign'],
            'new',
            'Lead automatycznie dodany z Meta Ads'
        ]);
        
        $leadId = $connection->lastInsertId();
        
        logMessage('INFO', 'Dodano nowego leada z Meta Ads', [
            'lead_id' => $leadId,
            'email' => $leadFields['email'],
            'campaign' => $leadFields['campaign']
        ]);
        
        // Aktualizacja logu webhook
        updateWebhookLog($leadId);
        
    } catch (Exception $e) {
        logMessage('ERROR', 'Błąd przetwarzania leada Meta: ' . $e->getMessage());
        throw $e;
    }
}

/**
 * Mapowanie pól Meta na nasze pola
 */
function mapMetaFields($leadData) {
    $fields = [
        'name' => '',
        'email' => '',
        'phone' => '',
        'company' => '',
        'campaign' => ''
    ];
    
    // Pobieranie danych z formularza
    if (isset($leadData['form_data'])) {
        foreach ($leadData['form_data'] as $field) {
            $fieldName = $field['name'] ?? '';
            $fieldValue = $field['value'] ?? '';
            
            switch ($fieldName) {
                case 'full_name':
                case 'name':
                    $fields['name'] = $fieldValue;
                    break;
                case 'email':
                    $fields['email'] = $fieldValue;
                    break;
                case 'phone_number':
                case 'phone':
                    $fields['phone'] = $fieldValue;
                    break;
                case 'company_name':
                case 'company':
                    $fields['company'] = $fieldValue;
                    break;
            }
        }
    }
    
    // Pobieranie informacji o kampanii
    if (isset($leadData['ad_name'])) {
        $fields['campaign'] = $leadData['ad_name'];
    } elseif (isset($leadData['campaign_name'])) {
        $fields['campaign'] = $leadData['campaign_name'];
    }
    
    // Walidacja wymaganych pól
    if (empty($fields['email'])) {
        throw new Exception('Brak wymaganego pola email');
    }
    
    if (empty($fields['name'])) {
        $fields['name'] = 'Brak imienia';
    }
    
    return $fields;
}

/**
 * Logowanie danych webhook
 */
function logWebhookData($rawData) {
    try {
        $db = getDB();
        $connection = $db->getConnection();
        
        $stmt = $connection->prepare("
            INSERT INTO meta_webhook_logs (webhook_data, processed) 
            VALUES (?, FALSE)
        ");
        
        $stmt->execute([$rawData]);
        
    } catch (Exception $e) {
        logMessage('ERROR', 'Błąd logowania webhook: ' . $e->getMessage());
    }
}

/**
 * Aktualizacja logu webhook po przetworzeniu
 */
function updateWebhookLog($leadId) {
    try {
        $db = getDB();
        $connection = $db->getConnection();
        
        $stmt = $connection->prepare("
            UPDATE meta_webhook_logs 
            SET processed = TRUE, lead_id = ? 
            WHERE id = (SELECT MAX(id) FROM meta_webhook_logs)
        ");
        
        $stmt->execute([$leadId]);
        
    } catch (Exception $e) {
        logMessage('ERROR', 'Błąd aktualizacji logu webhook: ' . $e->getMessage());
    }
}

/**
 * Funkcja do testowania webhook (tylko w trybie debug)
 */
function testWebhook() {
    if (!isProduction()) {
        $testData = [
            'entry' => [
                [
                    'changes' => [
                        [
                            'value' => [
                                'leadgen_id' => 'test_123',
                                'form_data' => [
                                    ['name' => 'full_name', 'value' => 'Jan Kowalski'],
                                    ['name' => 'email', 'value' => 'test@example.com'],
                                    ['name' => 'phone_number', 'value' => '+48123456789'],
                                    ['name' => 'company_name', 'value' => 'Test Company']
                                ],
                                'ad_name' => 'Test Campaign'
                            ]
                        ]
                    ]
                ]
            ]
        ];
        
        processLead($testData['entry'][0]['changes'][0]['value']);
        echo "Test webhook zakończony pomyślnie\n";
    }
}

// Test webhook w trybie debug
if (isset($_GET['test']) && !isProduction()) {
    testWebhook();
}
?>
