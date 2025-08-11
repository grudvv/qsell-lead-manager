<?php
/**
 * QSell Lead Manager - System wycen
 * Backend w PHP 8.3
 * Automatyczne obliczanie cen, rabaty w %, generowanie PDF
 */

require_once 'config.php';
require_once 'database.php';

class QuoteSystem {
    private $db;
    
    public function __construct() {
        $this->db = getDB();
    }
    
    /**
     * Tworzenie nowej wyceny
     */
    public function createQuote($leadId, $title, $description, $items, $discountPercent = 0) {
        try {
            $connection = $this->db->getConnection();
            
            // Obliczanie cen
            $pricing = $this->calculatePricing($items, $discountPercent);
            
            // Rozpoczęcie transakcji
            $connection->beginTransaction();
            
            // Dodanie wyceny
            $stmt = $connection->prepare("
                INSERT INTO quotes (lead_id, title, description, total_amount, discount_percent, discount_amount, final_amount, created_by) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $leadId,
                $title,
                $description,
                $pricing['total_amount'],
                $discountPercent,
                $pricing['discount_amount'],
                $pricing['final_amount'],
                $_SESSION['user_id'] ?? 1
            ]);
            
            $quoteId = $connection->lastInsertId();
            
            // Dodanie pozycji wyceny
            foreach ($items as $item) {
                $this->addQuoteItem($quoteId, $item);
            }
            
            // Zatwierdzenie transakcji
            $connection->commit();
            
            logMessage('INFO', 'Utworzono nową wycenę', [
                'quote_id' => $quoteId,
                'lead_id' => $leadId,
                'total_amount' => $pricing['total_amount'],
                'discount_percent' => $discountPercent
            ]);
            
            return [
                'id' => $quoteId,
                'pricing' => $pricing
            ];
            
        } catch (Exception $e) {
            if (isset($connection)) {
                $connection->rollBack();
            }
            logMessage('ERROR', 'Błąd tworzenia wyceny: ' . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Obliczanie cen z rabatami
     */
    public function calculatePricing($items, $discountPercent = 0) {
        $totalAmount = 0;
        $itemCount = count($items);
        
        // Obliczanie sumy za wszystkie pozycje
        foreach ($items as $item) {
            $totalAmount += $item['total_price'];
        }
        
        // Rabat za pakiet (jeśli więcej niż 1 usługa)
        $packageDiscount = 0;
        if ($itemCount >= DISCOUNT_CONFIG['min_package_items']) {
            $packageDiscount = DISCOUNT_CONFIG['package_discount'];
        }
        
        // Rabat procentowy
        $discountAmount = 0;
        if ($discountPercent > 0) {
            $discountAmount = ($totalAmount - $packageDiscount) * ($discountPercent / 100);
        }
        
        // Łączny rabat
        $totalDiscount = $packageDiscount + $discountAmount;
        
        // Cena końcowa
        $finalAmount = $totalAmount - $totalDiscount;
        
        return [
            'total_amount' => $totalAmount,
            'package_discount' => $packageDiscount,
            'discount_percent' => $discountPercent,
            'discount_amount' => $discountAmount,
            'total_discount' => $totalDiscount,
            'final_amount' => $finalAmount,
            'item_count' => $itemCount
        ];
    }
    
    /**
     * Dodawanie pozycji wyceny
     */
    private function addQuoteItem($quoteId, $item) {
        $connection = $this->db->getConnection();
        
        $stmt = $connection->prepare("
            INSERT INTO quote_items (quote_id, service_type, platform, package_type, quantity, unit_price, total_price, description) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $quoteId,
            $item['service_type'],
            $item['platform'],
            $item['package_type'],
            $item['quantity'],
            $item['unit_price'],
            $item['total_price'],
            $item['description']
        ]);
    }
    
    /**
     * Generowanie wyceny w PDF
     */
    public function generatePDF($quoteId) {
        try {
            $quote = $this->getQuote($quoteId);
            $items = $this->getQuoteItems($quoteId);
            
            // Generowanie HTML dla PDF
            $html = $this->generateHTML($quote, $items);
            
            // Konwersja HTML do PDF (wymaga biblioteki wkhtmltopdf lub podobnej)
            $pdfPath = $this->convertHTMLToPDF($html, $quoteId);
            
            logMessage('INFO', 'Wygenerowano PDF wyceny', [
                'quote_id' => $quoteId,
                'pdf_path' => $pdfPath
            ]);
            
            return $pdfPath;
            
        } catch (Exception $e) {
            logMessage('ERROR', 'Błąd generowania PDF: ' . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Generowanie HTML dla PDF
     */
    private function generateHTML($quote, $items) {
        $html = '
        <!DOCTYPE html>
        <html lang="pl">
        <head>
            <meta charset="UTF-8">
            <title>Wycena QSell - ' . htmlspecialchars($quote['title']) . '</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .header { text-align: center; margin-bottom: 30px; }
                .logo { max-width: 200px; margin-bottom: 20px; }
                .company-info { margin-bottom: 30px; }
                .quote-details { margin-bottom: 30px; }
                .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                .items-table th { background-color: #f2f2f2; }
                .total-section { text-align: right; margin-top: 30px; }
                .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="header">
                <img src="' . PDF_CONFIG['logo_url'] . '" alt="QSell Logo" class="logo">
                <h1>Wycena usług QSell</h1>
            </div>
            
            <div class="company-info">
                <h3>Dane firmy:</h3>
                <p><strong>' . PDF_CONFIG['company_name'] . '</strong></p>
                <p>' . PDF_CONFIG['company_address'] . '</p>
                <p>Tel: ' . PDF_CONFIG['company_phone'] . '</p>
                <p>Email: ' . PDF_CONFIG['company_email'] . '</p>
            </div>
            
            <div class="quote-details">
                <h3>Szczegóły wyceny:</h3>
                <p><strong>Tytuł:</strong> ' . htmlspecialchars($quote['title']) . '</p>
                <p><strong>Data:</strong> ' . date('d.m.Y', strtotime($quote['created_at'])) . '</p>
                <p><strong>Opis:</strong> ' . htmlspecialchars($quote['description']) . '</p>
            </div>
            
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Usługa</th>
                        <th>Platforma</th>
                        <th>Pakiet</th>
                        <th>Ilość</th>
                        <th>Cena jednostkowa</th>
                        <th>Cena łącznie</th>
                    </tr>
                </thead>
                <tbody>';
        
        foreach ($items as $item) {
            $html .= '
                    <tr>
                        <td>' . htmlspecialchars($item['service_type']) . '</td>
                        <td>' . htmlspecialchars($item['platform']) . '</td>
                        <td>' . htmlspecialchars($item['package_type']) . '</td>
                        <td>' . $item['quantity'] . '</td>
                        <td>' . number_format($item['unit_price'], 2) . ' PLN</td>
                        <td>' . number_format($item['total_price'], 2) . ' PLN</td>
                    </tr>';
        }
        
        $html .= '
                </tbody>
            </table>
            
            <div class="total-section">
                <h3>Podsumowanie:</h3>
                <p><strong>Wartość brutto:</strong> ' . number_format($quote['total_amount'], 2) . ' PLN</p>';
        
        if ($quote['discount_percent'] > 0) {
            $html .= '<p><strong>Rabat procentowy:</strong> ' . $quote['discount_percent'] . '%</p>';
        }
        
        if ($quote['discount_amount'] > 0) {
            $html .= '<p><strong>Rabat kwotowy:</strong> ' . number_format($quote['discount_amount'], 2) . ' PLN</p>';
        }
        
        $html .= '
                <p><strong>Do zapłaty:</strong> ' . number_format($quote['final_amount'], 2) . ' PLN</p>
            </div>
            
            <div class="footer">
                <p>Wycena ważna do: ' . date('d.m.Y', strtotime('+30 days')) . '</p>
                <p>Wszystkie ceny podane w PLN netto</p>
            </div>
        </body>
        </html>';
        
        return $html;
    }
    
    /**
     * Konwersja HTML do PDF
     */
    private function convertHTMLToPDF($html, $quoteId) {
        // Tutaj możesz użyć różnych bibliotek do konwersji HTML do PDF
        // Przykład z wkhtmltopdf (wymaga zainstalowania na serwerze)
        
        $tempHtmlFile = sys_get_temp_dir() . '/quote_' . $quoteId . '.html';
        $pdfFile = 'quotes/quote_' . $quoteId . '.pdf';
        
        // Tworzenie katalogu na PDF
        if (!is_dir('quotes')) {
            mkdir('quotes', 0755, true);
        }
        
        // Zapisanie HTML do pliku tymczasowego
        file_put_contents($tempHtmlFile, $html);
        
        // Konwersja HTML do PDF (wymaga wkhtmltopdf)
        $command = "wkhtmltopdf --encoding utf-8 --page-size A4 --margin-top 20 --margin-right 20 --margin-bottom 20 --margin-left 20 " . 
                   escapeshellarg($tempHtmlFile) . " " . escapeshellarg($pdfFile);
        
        exec($command, $output, $returnCode);
        
        // Usunięcie pliku tymczasowego
        unlink($tempHtmlFile);
        
        if ($returnCode !== 0) {
            throw new Exception('Błąd konwersji HTML do PDF');
        }
        
        return $pdfFile;
    }
    
    /**
     * Pobieranie wyceny
     */
    public function getQuote($quoteId) {
        $connection = $this->db->getConnection();
        
        $stmt = $connection->prepare("
            SELECT q.*, l.name as lead_name, l.email as lead_email, l.company as lead_company
            FROM quotes q
            JOIN leads l ON q.lead_id = l.id
            WHERE q.id = ?
        ");
        
        $stmt->execute([$quoteId]);
        return $stmt->fetch();
    }
    
    /**
     * Pobieranie pozycji wyceny
     */
    public function getQuoteItems($quoteId) {
        $connection = $this->db->getConnection();
        
        $stmt = $connection->prepare("
            SELECT * FROM quote_items WHERE quote_id = ?
        ");
        
        $stmt->execute([$quoteId]);
        return $stmt->fetchAll();
    }
    
    /**
     * Lista wszystkich wycen
     */
    public function getAllQuotes($limit = 100, $offset = 0) {
        $connection = $this->db->getConnection();
        
        $stmt = $connection->prepare("
            SELECT q.*, l.name as lead_name, l.email as lead_email
            FROM quotes q
            JOIN leads l ON q.lead_id = l.id
            ORDER BY q.created_at DESC
            LIMIT ? OFFSET ?
        ");
        
        $stmt->execute([$limit, $offset]);
        return $stmt->fetchAll();
    }
    
    /**
     * Aktualizacja wyceny
     */
    public function updateQuote($quoteId, $data) {
        try {
            $connection = $this->db->getConnection();
            
            // Obliczanie nowych cen
            if (isset($data['items']) && isset($data['discount_percent'])) {
                $pricing = $this->calculatePricing($data['items'], $data['discount_percent']);
                
                $stmt = $connection->prepare("
                    UPDATE quotes 
                    SET title = ?, description = ?, total_amount = ?, discount_percent = ?, 
                        discount_amount = ?, final_amount = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                ");
                
                $stmt->execute([
                    $data['title'] ?? '',
                    $data['description'] ?? '',
                    $pricing['total_amount'],
                    $data['discount_percent'],
                    $pricing['discount_amount'],
                    $pricing['final_amount'],
                    $quoteId
                ]);
                
                // Aktualizacja pozycji
                if (isset($data['items'])) {
                    $this->updateQuoteItems($quoteId, $data['items']);
                }
            }
            
            logMessage('INFO', 'Zaktualizowano wycenę', ['quote_id' => $quoteId]);
            return true;
            
        } catch (Exception $e) {
            logMessage('ERROR', 'Błąd aktualizacji wyceny: ' . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Aktualizacja pozycji wyceny
     */
    private function updateQuoteItems($quoteId, $items) {
        $connection = $this->db->getConnection();
        
        // Usunięcie starych pozycji
        $stmt = $connection->prepare("DELETE FROM quote_items WHERE quote_id = ?");
        $stmt->execute([$quoteId]);
        
        // Dodanie nowych pozycji
        foreach ($items as $item) {
            $this->addQuoteItem($quoteId, $item);
        }
    }
}

// Funkcja pomocnicza do pobierania instancji systemu wycen
function getQuoteSystem() {
    return new QuoteSystem();
}
?>
