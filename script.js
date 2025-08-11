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
        loadData(); // Wczytanie zapisanych danych
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

// Generowanie PDF wyceny
function generatePDF(quoteId) {
    showNotification('Generowanie PDF - do implementacji w backend', 'info');
    // W przyszłości tutaj będzie integracja z backend do generowania PDF
}

// Pokazywanie modala dodawania leada
function showAddLeadModal() {
    document.getElementById('addLeadModal').style.display = 'block';
    // Reset formularza
    document.getElementById('addLeadForm').reset();
}

// Zamykanie modala dodawania leada
function closeAddLeadModal() {
    document.getElementById('addLeadModal').style.display = 'none';
}

// Pokazywanie modala dodawania wyceny
function showAddQuoteModal() {
    document.getElementById('addQuoteModal').style.display = 'block';
    // Reset formularza
    document.getElementById('addQuoteForm').reset();
    
    // Wypełnienie selecta z leadami
    populateLeadsSelect();
    
    // Reset usług
    resetQuoteServices();
}

// Zamykanie modala dodawania wyceny
function closeAddQuoteModal() {
    document.getElementById('addQuoteModal').style.display = 'none';
}

// Dodawanie nowego leada
function addNewLead(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const leadData = {
        id: Date.now(), // Tymczasowe ID
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone') || '',
        company: formData.get('company') || '',
        source: formData.get('source'),
        campaign: formData.get('campaign') || '',
        status: 'new',
        notes: formData.get('notes') || '',
        created_at: new Date().toISOString()
    };
    
    // Dodanie do listy
    leads.push(leadData);
    
    // Aktualizacja widoku
    renderLeads();
    updateStats();
    
    // Zamknięcie modala
    closeAddLeadModal();
    
    // Powiadomienie
    showNotification('Lead dodany pomyślnie!', 'success');
    
    // Zapisanie w localStorage
    saveData();
}

// Dodawanie nowej wyceny
function addNewQuote(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const services = getQuoteServices();
    
    if (services.length === 0) {
        showNotification('Dodaj przynajmniej jedną usługę!', 'error');
        return;
    }
    
    // Obliczanie ceny
    const pricing = calculateQuotePricing(services, parseFloat(formData.get('discount_percent') || 0));
    
    const quoteData = {
        id: Date.now(), // Tymczasowe ID
        lead_id: parseInt(formData.get('lead_id')),
        title: formData.get('title'),
        description: formData.get('description') || '',
        total_amount: pricing.total_amount,
        discount_percent: parseFloat(formData.get('discount_percent') || 0),
        discount_amount: pricing.discount_amount,
        final_amount: pricing.final_amount,
        status: 'draft',
        created_at: new Date().toISOString(),
        services: services
    };
    
    // Dodanie do listy
    quotes.push(quoteData);
    
    // Aktualizacja widoku
    renderQuotes();
    updateStats();
    
    // Zamknięcie modala
    closeAddQuoteModal();
    
    // Powiadomienie
    showNotification('Wycena utworzona pomyślnie!', 'success');
    
    // Zapisanie w localStorage
    saveData();
}

// Pobieranie usług z formularza wyceny
function getQuoteServices() {
    const services = [];
    const serviceItems = document.querySelectorAll('#quoteServices .service-item');
    
    serviceItems.forEach((item, index) => {
        const serviceType = item.querySelector('select[name*="[service_type]"]').value;
        const platform = item.querySelector('select[name*="[platform]"]').value;
        const packageType = item.querySelector('select[name*="[package_type]"]').value;
        const quantity = parseInt(item.querySelector('input[name*="[quantity]"]').value);
        
        if (serviceType && platform && packageType && quantity > 0) {
            const price = getServicePrice(serviceType, platform, packageType);
            services.push({
                service_type: serviceType,
                platform: platform,
                package_type: packageType,
                quantity: quantity,
                unit_price: price,
                total_price: price * quantity,
                description: `${getServiceText(serviceType)} - ${getPlatformText(platform)} (${getPackageText(packageType)})`
            });
        }
    });
    
    return services;
}

// Obliczanie ceny wyceny
function calculateQuotePricing(services, discountPercent) {
    let totalAmount = 0;
    
    services.forEach(service => {
        totalAmount += service.total_price;
    });
    
    // Rabat za pakiet (jeśli więcej niż 1 usługa)
    let packageDiscount = 0;
    if (services.length >= 2) {
        packageDiscount = 500; // 500 PLN za pakiet
    }
    
    // Rabat procentowy
    let discountAmount = 0;
    if (discountPercent > 0) {
        discountAmount = (totalAmount - packageDiscount) * (discountPercent / 100);
    }
    
    // Łączny rabat
    const totalDiscount = packageDiscount + discountAmount;
    
    // Cena końcowa
    const finalAmount = totalAmount - totalDiscount;
    
    return {
        total_amount: totalAmount,
        package_discount: packageDiscount,
        discount_percent: discountPercent,
        discount_amount: discountAmount,
        total_discount: totalDiscount,
        final_amount: finalAmount
    };
}

// Pobieranie ceny usługi
function getServicePrice(serviceType, platform, packageType) {
    const prices = {
        'amazon': {
            'implementation': { 'basic': 3000, 'standard': 5000, 'premium': 10000 },
            'ads_monthly': 1890,
            'complex_monthly': 1890
        },
        'ebay': {
            'implementation': { 'basic': 2500, 'standard': 3500, 'premium': 5000 },
            'ads_monthly': 1390,
            'complex_monthly': 1390
        },
        'emag': {
            'implementation': { 'basic': 3000, 'standard': 5000, 'premium': 10000 },
            'ads_monthly': 790,
            'complex_monthly': 1500
        },
        'kaufland': {
            'implementation': { 'basic': 2500, 'standard': 3500, 'premium': 4500 },
            'ads_monthly': 1390,
            'complex_monthly': 1390
        },
        'empik': {
            'implementation': { 'basic': 3000, 'standard': 5000, 'premium': 10000 },
            'ads_monthly': 790,
            'complex_monthly': 1190
        },
        'erli': {
            'implementation': { 'basic': 3000, 'standard': 5000, 'premium': 10000 },
            'ads_monthly': 790,
            'complex_monthly': 1190
        },
        'allegro_cz_sk_hu': {
            'ads_monthly': 300
        },
        'base_com': {
            'implementation': { 'basic': 3000, 'standard': 5000, 'premium': 10000 }
        }
    };
    
    if (serviceType === 'implementation') {
        return prices[platform]?.[serviceType]?.[packageType] || 0;
    } else {
        return prices[platform]?.[serviceType] || 0;
    }
}

// Teksty usług
function getServiceText(serviceType) {
    const texts = {
        'implementation': 'Wdrożenie',
        'ads_monthly': 'Obsługa ADS',
        'complex_monthly': 'Kompleks'
    };
    return texts[serviceType] || serviceType;
}

// Teksty platform
function getPlatformText(platform) {
    const texts = {
        'amazon': 'Amazon',
        'ebay': 'eBay',
        'emag': 'eMag',
        'kaufland': 'Kaufland',
        'empik': 'Empik',
        'erli': 'ERLI',
        'allegro_cz_sk_hu': 'Allegro CZ/SK/HU',
        'base_com': 'Base.com'
    };
    return texts[platform] || platform;
}

// Teksty pakietów
function getPackageText(packageType) {
    const texts = {
        'basic': 'Podstawowy',
        'standard': 'Standard',
        'premium': 'Premium'
    };
    return texts[packageType] || packageType;
}

// Wypełnienie selecta z leadami
function populateLeadsSelect() {
    const select = document.getElementById('quoteLead');
    select.innerHTML = '<option value="">Wybierz leada</option>';
    
    leads.forEach(lead => {
        const option = document.createElement('option');
        option.value = lead.id;
        option.textContent = `${lead.name} (${lead.company || lead.email})`;
        select.appendChild(option);
    });
}

// Reset usług w wycenie
function resetQuoteServices() {
    const servicesContainer = document.getElementById('quoteServices');
    servicesContainer.innerHTML = `
        <div class="service-item">
            <select name="services[0][service_type]" required>
                <option value="">Wybierz usługę</option>
                <option value="implementation">Wdrożenie</option>
                <option value="ads_monthly">Obsługa ADS</option>
                <option value="complex_monthly">Kompleks</option>
            </select>
            <select name="services[0][platform]" required>
                <option value="">Platforma</option>
                <option value="amazon">Amazon</option>
                <option value="ebay">eBay</option>
                <option value="emag">eMag</option>
                <option value="kaufland">Kaufland</option>
                <option value="empik">Empik</option>
                <option value="erli">ERLI</option>
                <option value="allegro_cz_sk_hu">Allegro CZ/SK/HU</option>
                <option value="base_com">Base.com</option>
            </select>
            <select name="services[0][package_type]" required>
                <option value="">Pakiet</option>
                <option value="basic">Podstawowy</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
            </select>
            <input type="number" name="services[0][quantity]" placeholder="Ilość" min="1" value="1" required>
        </div>
    `;
}

// Dodawanie nowej usługi do wyceny
function addServiceItem() {
    const servicesContainer = document.getElementById('quoteServices');
    const serviceCount = servicesContainer.children.length;
    
    const newService = document.createElement('div');
    newService.className = 'service-item';
    newService.innerHTML = `
        <select name="services[${serviceCount}][service_type]" required>
            <option value="">Wybierz usługę</option>
            <option value="implementation">Wdrożenie</option>
            <option value="ads_monthly">Obsługa ADS</option>
            <option value="complex_monthly">Kompleks</option>
        </select>
        <select name="services[${serviceCount}][platform]" required>
            <option value="">Platforma</option>
            <option value="amazon">Amazon</option>
            <option value="ebay">eBay</option>
            <option value="emag">eMag</option>
            <option value="kaufland">Kaufland</option>
            <option value="empik">Empik</option>
            <option value="erli">ERLI</option>
            <option value="allegro_cz_sk_hu">Allegro CZ/SK/HU</option>
            <option value="base_com">Base.com</option>
        </select>
        <select name="services[${serviceCount}][package_type]" required>
            <option value="">Pakiet</option>
            <option value="basic">Podstawowy</option>
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
        </select>
        <input type="number" name="services[${serviceCount}][quantity]" placeholder="Ilość" min="1" value="1" required>
        <button type="button" class="btn btn-secondary" onclick="removeServiceItem(this)" style="padding: 8px; font-size: 12px;">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    servicesContainer.appendChild(newService);
}

// Usuwanie usługi z wyceny
function removeServiceItem(button) {
    button.parentElement.remove();
}

// Zamykanie modali po kliknięciu poza nimi
window.onclick = function(event) {
    const addLeadModal = document.getElementById('addLeadModal');
    const addQuoteModal = document.getElementById('addQuoteModal');
    
    if (event.target === addLeadModal) {
        closeAddLeadModal();
    }
    if (event.target === addQuoteModal) {
        closeAddQuoteModal();
    }
}

// Zapisanie danych w localStorage
function saveData() {
    localStorage.setItem('qsell_leads', JSON.stringify(leads));
    localStorage.setItem('qsell_quotes', JSON.stringify(quotes));
}

// Wczytywanie danych z localStorage
function loadData() {
    const savedLeads = localStorage.getItem('qsell_leads');
    const savedQuotes = localStorage.getItem('qsell_quotes');
    
    if (savedLeads) {
        leads = JSON.parse(savedLeads);
    }
    if (savedQuotes) {
        quotes = JSON.parse(savedQuotes);
    }
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
