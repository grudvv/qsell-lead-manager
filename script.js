// QSell Lead Manager - JavaScript
// System zarządzania leadami z Meta Ads webhook

// Dane logowania (w produkcji powinny być w backend)
const VALID_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// Stan aplikacji
let isLoggedIn = false;
let currentUser = null;
let leads = [];
let quotes = [];

// Inicjalizacja aplikacji
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    setupEventListeners();
});

// Sprawdzanie statusu logowania
function checkLoginStatus() {
    const savedUser = localStorage.getItem('qsell_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        isLoggedIn = true;
        showMainApp();
        loadSampleData();
    } else {
        showLoginModal();
    }
}

// Pokazywanie głównej aplikacji
function showMainApp() {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    updateStats();
}

// Pokazywanie modala logowania
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
}

// Zamykanie modala logowania
function closeLoginModal() {
    // Nie pozwalamy zamknąć modala bez logowania
    if (!isLoggedIn) {
        return;
    }
}

// Obsługa logowania
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('loginError');
    
    // Sprawdzanie danych logowania
    if (username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password) {
        // Logowanie udane
        currentUser = { username, role: 'admin' };
        isLoggedIn = true;
        
        // Zapisanie w localStorage
        localStorage.setItem('qsell_user', JSON.stringify(currentUser));
        
        // Ukrycie błędu
        errorElement.style.display = 'none';
        
        // Pokazanie głównej aplikacji
        showMainApp();
        
        // Wyświetlenie powitania
        showNotification('Zalogowano pomyślnie!', 'success');
        
    } else {
        // Błąd logowania
        errorElement.textContent = 'Nieprawidłowa nazwa użytkownika lub hasło';
        errorElement.style.display = 'block';
        
        // Czyszczenie hasła
        document.getElementById('password').value = '';
    }
}

// Wylogowanie
function logout() {
    isLoggedIn = false;
    currentUser = null;
    localStorage.removeItem('qsell_user');
    
    // Czyszczenie danych
    leads = [];
    quotes = [];
    
    // Pokazanie modala logowania
    showLoginModal();
    
    // Czyszczenie formularza
    document.getElementById('loginForm').reset();
    document.getElementById('loginError').style.display = 'none';
    
    showNotification('Wylogowano pomyślnie!', 'info');
}

// Przełączanie zakładek
function showTab(tabName) {
    // Ukrycie wszystkich zakładek
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));
    
    // Usunięcie aktywnej klasy z wszystkich przycisków
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Pokazanie wybranej zakładki
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // Aktywacja przycisku
    event.target.classList.add('active');
}

// Przełączanie motywu
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('qsell_theme', isDark ? 'dark' : 'light');
    
    const icon = event.target.querySelector('i');
    if (isDark) {
        icon.className = 'fas fa-sun';
        event.target.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
    } else {
        icon.className = 'fas fa-moon';
        event.target.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
    }
}

// Ładowanie przykładowych danych
function loadSampleData() {
    // Przykładowe leady
    leads = [
        {
            id: 1,
            name: 'Jan Kowalski',
            email: 'jan.kowalski@example.com',
            phone: '+48123456789',
            company: 'TechCorp Sp. z o.o.',
            source: 'meta_ads',
            campaign: 'Facebook Lead Ad - Amazon',
            status: 'new',
            created_at: '2024-01-15'
        },
        {
            id: 2,
            name: 'Anna Nowak',
            email: 'anna.nowak@example.com',
            phone: '+48987654321',
            company: 'E-commerce Solutions',
            source: 'manual',
            campaign: 'Kontakt telefoniczny',
            status: 'contacted',
            created_at: '2024-01-14'
        },
        {
            id: 3,
            name: 'Piotr Wiśniewski',
            email: 'piotr.wisniewski@example.com',
            phone: '+48555123456',
            company: 'Digital Marketing Pro',
            source: 'meta_ads',
            campaign: 'Instagram Lead Ad - eBay',
            status: 'qualified',
            created_at: '2024-01-13'
        }
    ];
    
    // Przykładowe wyceny
    quotes = [
        {
            id: 1,
            lead_id: 1,
            title: 'Wycena - Amazon + eBay + eMag',
            total_amount: 12000,
            discount_percent: 15,
            final_amount: 10200,
            status: 'sent',
            created_at: '2024-01-15'
        },
        {
            id: 2,
            lead_id: 2,
            title: 'Wycena - Kaufland + Empik',
            total_amount: 8000,
            discount_percent: 10,
            final_amount: 7200,
            status: 'draft',
            created_at: '2024-01-14'
        }
    ];
    
    updateStats();
    renderLeads();
    renderQuotes();
}

// Aktualizacja statystyk
function updateStats() {
    const totalLeads = leads.length;
    const newLeads = leads.filter(lead => lead.status === 'new').length;
    const totalQuotes = quotes.length;
    const metaLeads = leads.filter(lead => lead.source === 'meta_ads').length;
    
    document.getElementById('totalLeads').textContent = totalLeads;
    document.getElementById('newLeads').textContent = newLeads;
    document.getElementById('totalQuotes').textContent = totalQuotes;
    document.getElementById('metaLeads').textContent = metaLeads;
}

// Renderowanie leadów
function renderLeads() {
    const leadsList = document.getElementById('leadsList');
    leadsList.innerHTML = '';
    
    leads.forEach(lead => {
        const leadCard = createLeadCard(lead);
        leadsList.appendChild(leadCard);
    });
}

// Tworzenie karty leada
function createLeadCard(lead) {
    const card = document.createElement('div');
    card.className = 'lead-card';
    card.innerHTML = `
        <div class="lead-header">
            <h3>${lead.name}</h3>
            <span class="status-badge ${lead.status}">${getStatusText(lead.status)}</span>
        </div>
        <div class="lead-details">
            <p><strong>Email:</strong> ${lead.email}</p>
            <p><strong>Telefon:</strong> ${lead.phone}</p>
            <p><strong>Firma:</strong> ${lead.company}</p>
            <p><strong>Źródło:</strong> ${getSourceText(lead.source)}</p>
            <p><strong>Kampania:</strong> ${lead.campaign}</p>
            <p><strong>Data:</strong> ${formatDate(lead.created_at)}</p>
        </div>
        <div class="lead-actions">
            <button class="btn btn-primary" onclick="editLead(${lead.id})">
                <i class="fas fa-edit"></i> Edytuj
            </button>
            <button class="btn btn-secondary" onclick="changeLeadStatus(${lead.id})">
                <i class="fas fa-exchange-alt"></i> Zmień Status
            </button>
        </div>
    `;
    
    return card;
}

// Renderowanie wycen
function renderQuotes() {
    const quotesList = document.getElementById('quotesList');
    quotesList.innerHTML = '';
    
    quotes.forEach(quote => {
        const quoteCard = createQuoteCard(quote);
        quotesList.appendChild(quoteCard);
    });
}

// Tworzenie karty wyceny
function createQuoteCard(quote) {
    const lead = leads.find(l => l.id === quote.lead_id);
    const card = document.createElement('div');
    card.className = 'quote-card';
    card.innerHTML = `
        <div class="quote-header">
            <h3>${quote.title}</h3>
            <span class="status-badge ${quote.status}">${getQuoteStatusText(quote.status)}</span>
        </div>
        <div class="quote-details">
            <p><strong>Klient:</strong> ${lead ? lead.name : 'Nieznany'}</p>
            <p><strong>Wartość brutto:</strong> ${formatCurrency(quote.total_amount)}</p>
            <p><strong>Rabat:</strong> ${quote.discount_percent}%</p>
            <p><strong>Do zapłaty:</strong> ${formatCurrency(quote.final_amount)}</p>
            <p><strong>Data:</strong> ${formatDate(quote.created_at)}</p>
        </div>
        <div class="quote-actions">
            <button class="btn btn-primary" onclick="editQuote(${quote.id})">
                <i class="fas fa-edit"></i> Edytuj
            </button>
            <button class="btn btn-secondary" onclick="generatePDF(${quote.id})">
                <i class="fas fa-file-pdf"></i> Generuj PDF
            </button>
        </div>
    `;
    
    return card;
}

// Funkcje pomocnicze
function getStatusText(status) {
    const statuses = {
        'new': 'Nowy',
        'contacted': 'Skontaktowany',
        'qualified': 'Kwalifikowany',
        'proposal': 'Propozycja',
        'negotiation': 'Negocjacje',
        'won': 'Wygrany',
        'lost': 'Przegrany'
    };
    return statuses[status] || status;
}

function getSourceText(source) {
    const sources = {
        'meta_ads': 'Meta Ads',
        'manual': 'Ręczny',
        'website': 'Strona WWW',
        'referral': 'Polecenie'
    };
    return sources[source] || source;
}

function getQuoteStatusText(status) {
    const statuses = {
        'draft': 'Szkic',
        'sent': 'Wysłana',
        'accepted': 'Zaakceptowana',
        'rejected': 'Odrzucona'
    };
    return statuses[status] || status;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL');
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: 'PLN'
    }).format(amount);
}

// Funkcje akcji (do implementacji)
function editLead(leadId) {
    showNotification('Funkcja edycji leada - do implementacji', 'info');
}

function changeLeadStatus(leadId) {
    showNotification('Funkcja zmiany statusu - do implementacji', 'info');
}

function editQuote(quoteId) {
    showNotification('Funkcja edycji wyceny - do implementacji', 'info');
}

function generatePDF(quoteId) {
    showNotification('Generowanie PDF - do implementacji', 'info');
}

function showAddLeadModal() {
    showNotification('Funkcja dodawania leada - do implementacji', 'info');
}

function showAddQuoteModal() {
    showNotification('Funkcja dodawania wyceny - do implementacji', 'info');
}

// System powiadomień
function showNotification(message, type = 'info') {
    // Tworzenie powiadomienia
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Dodanie stylów
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 300px;
        animation: slideInRight 0.3s ease;
    `;
    
    // Dodanie do body
    document.body.appendChild(notification);
    
    // Automatyczne usunięcie po 5 sekundach
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function getNotificationColor(type) {
    const colors = {
        'success': '#4caf50',
        'error': '#f44336',
        'warning': '#ff9800',
        'info': '#2196f3'
    };
    return colors[type] || '#2196f3';
}

// Animacje CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .lead-card, .quote-card {
        background: white;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 16px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        border-left: 4px solid var(--primary-green);
    }
    
    .lead-header, .quote-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
    }
    
    .lead-header h3, .quote-header h3 {
        color: var(--dark-gray);
        font-size: 1.2rem;
    }
    
    .lead-details, .quote-details {
        margin-bottom: 16px;
    }
    
    .lead-details p, .quote-details p {
        margin-bottom: 8px;
        color: var(--gray);
    }
    
    .lead-actions, .quote-actions {
        display: flex;
        gap: 12px;
    }
    
    .status-badge {
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.9rem;
        font-weight: 500;
        text-transform: uppercase;
    }
    
    .status-badge.new {
        background: var(--primary-orange);
        color: white;
    }
    
    .status-badge.contacted {
        background: #2196f3;
        color: white;
    }
    
    .status-badge.qualified {
        background: var(--primary-green);
        color: white;
    }
    
    .status-badge.proposal {
        background: #9c27b0;
        color: white;
    }
    
    .status-badge.negotiation {
        background: #ff9800;
        color: white;
    }
    
    .status-badge.won {
        background: var(--primary-green);
        color: white;
    }
    
    .status-badge.lost {
        background: var(--accent-red);
        color: white;
    }
    
    .status-badge.draft {
        background: var(--gray);
        color: white;
    }
    
    .status-badge.sent {
        background: #2196f3;
        color: white;
    }
    
    .status-badge.accepted {
        background: var(--primary-green);
        color: white;
    }
    
    .status-badge.rejected {
        background: var(--accent-red);
        color: white;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: background 0.3s ease;
    }
    
    .notification-close:hover {
        background: rgba(255,255,255,0.2);
    }
`;
document.head.appendChild(style);

// Ustawienie event listenerów
function setupEventListeners() {
    // Sprawdzenie zapisanego motywu
    const savedTheme = localStorage.getItem('qsell_theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        const themeBtn = document.querySelector('.btn-secondary');
        if (themeBtn) {
            themeBtn.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
        }
    }
    
    // Obsługa klawisza Escape w modalu logowania
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && !isLoggedIn) {
            // Nie pozwalamy zamknąć modala bez logowania
            event.preventDefault();
        }
    });
} 
