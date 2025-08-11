// Amazon FBA/FBM Calculator Pro - Advanced Calculation Engine

class AmazonCalculator {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupTabs();
        this.loadSavedData();
    }

    setupEventListeners() {
        // Product category change
        document.getElementById('productCategory').addEventListener('change', () => {
            this.updateReferralFee();
            this.updateStats();
        });

        // Real-time calculation triggers
        const inputs = document.querySelectorAll('input[type="number"], input[type="text"], select');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.updateStats());
            input.addEventListener('change', () => this.updateStats());
        });

        // FBA size tier change
        document.getElementById('fbaSizeTier').addEventListener('change', () => {
            this.updateFBAFees();
            this.updateStats();
        });

        // FBM shipping method change
        document.getElementById('fbmShippingMethod').addEventListener('change', () => {
            this.updateFBMShipping();
            this.updateStats();
        });
    }

    setupTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-tab');
                
                // Remove active class from all tabs and contents
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding content
                btn.classList.add('active');
                document.getElementById(targetTab).classList.add('active');
            });
        });
    }

    updateReferralFee() {
        const category = document.getElementById('productCategory').value;
        const referralFeeInput = document.getElementById('referralFee');
        
        const referralRates = {
            'electronics': 8,
            'clothing': 17,
            'home': 15,
            'books': 15,
            'sports': 15,
            'toys': 15,
            'beauty': 15,
            'automotive': 12,
            'health': 15,
            'other': 15
        };

        if (category && referralRates[category]) {
            referralFeeInput.value = referralRates[category];
        } else {
            referralFeeInput.value = 15; // Default rate
        }
    }

    updateFBAFees() {
        const sizeTier = document.getElementById('fbaSizeTier').value;
        const weight = parseFloat(document.getElementById('productWeight').value) || 0;
        const fulfillmentFeeInput = document.getElementById('fbaFulfillmentFee');

        // FBA fulfillment fees based on size and weight
        let fee = 0;
        if (sizeTier === 'small') {
            if (weight <= 0.5) fee = 3.50;
            else fee = 4.50;
        } else if (sizeTier === 'large') {
            if (weight <= 0.5) fee = 4.50;
            else if (weight <= 1) fee = 5.50;
            else if (weight <= 2) fee = 6.50;
            else if (weight <= 5) fee = 8.50;
            else fee = 10.50;
        } else if (sizeTier === 'oversize') {
            if (weight <= 5) fee = 12.50;
            else if (weight <= 10) fee = 15.50;
            else fee = 18.50;
        }

        fulfillmentFeeInput.value = fee.toFixed(2);
    }

    updateFBMShipping() {
        const method = document.getElementById('fbmShippingMethod').value;
        const weight = parseFloat(document.getElementById('productWeight').value) || 0;
        const shippingCostInput = document.getElementById('fbmShippingCost');

        let cost = 0;
        if (method === 'inpost') {
            cost = weight <= 1 ? 8 : 12;
        } else if (method === 'poczta') {
            cost = weight <= 1 ? 10 : 15;
        } else if (method === 'dpd') {
            cost = weight <= 1 ? 12 : 18;
        }

        shippingCostInput.value = cost.toFixed(2);
    }

    updateStats() {
        const data = this.getFormData();
        const results = this.calculateAll(data);
        this.updateQuickStats(results);
        this.displayResults(results);
    }

    getFormData() {
        return {
            // Basic Info
            productName: document.getElementById('productName').value,
            productCategory: document.getElementById('productCategory').value,
            sellingPrice: parseFloat(document.getElementById('sellingPrice').value) || 0,
            productCost: parseFloat(document.getElementById('productCost').value) || 0,
            productWeight: parseFloat(document.getElementById('productWeight').value) || 0,
            productLength: parseFloat(document.getElementById('productLength').value) || 0,
            productWidth: parseFloat(document.getElementById('productWidth').value) || 0,
            productHeight: parseFloat(document.getElementById('productHeight').value) || 0,
            monthlySales: parseInt(document.getElementById('monthlySales').value) || 0,
            inventoryMonths: parseInt(document.getElementById('inventoryMonths').value) || 3,

            // FBA Fees
            fbaSizeTier: document.getElementById('fbaSizeTier').value,
            fbaFulfillmentFee: parseFloat(document.getElementById('fbaFulfillmentFee').value) || 0,
            fbaStorageFee: parseFloat(document.getElementById('fbaStorageFee').value) || 0.75,
            fbaLongTermStorage: parseFloat(document.getElementById('fbaLongTermStorage').value) || 6.90,
            fbaInboundShipping: parseFloat(document.getElementById('fbaInboundShipping').value) || 0,
            fbaPrepFee: parseFloat(document.getElementById('fbaPrepFee').value) || 0,

            // FBM Costs
            fbmShippingMethod: document.getElementById('fbmShippingMethod').value,
            fbmShippingCost: parseFloat(document.getElementById('fbmShippingCost').value) || 0,
            fbmPackagingCost: parseFloat(document.getElementById('fbmPackagingCost').value) || 2.00,
            fbmPackagingTime: parseFloat(document.getElementById('fbmPackagingTime').value) || 5,
            fbmHourlyRate: parseFloat(document.getElementById('fbmHourlyRate').value) || 25.00,
            fbmOverheadCost: parseFloat(document.getElementById('fbmOverheadCost').value) || 1.50,

            // Advanced
            referralFee: parseFloat(document.getElementById('referralFee').value) || 15,
            variableClosingFee: parseFloat(document.getElementById('variableClosingFee').value) || 0,
            cpc: parseFloat(document.getElementById('cpc').value) || 1.50,
            conversionRate: parseFloat(document.getElementById('conversionRate').value) || 10,
            returnRate: parseFloat(document.getElementById('returnRate').value) || 5,
            returnCost: parseFloat(document.getElementById('returnCost').value) || 15.00
        };
    }

    calculateAll(data) {
        // Monthly revenue
        const monthlyRevenue = data.sellingPrice * data.monthlySales;
        
        // Product costs
        const monthlyProductCost = data.productCost * data.monthlySales;
        
        // Referral fees
        const monthlyReferralFee = (monthlyRevenue * data.referralFee / 100) + (data.variableClosingFee * data.monthlySales);

        // Calculate FBA and FBM specific costs
        const fbaFees = this.calculateFBAFees(data);
        const fbmFees = this.calculateFBMFees(data);

        // Advertising costs
        const monthlyClicks = (data.monthlySales / (data.conversionRate / 100));
        const monthlyAdvertisingCost = monthlyClicks * data.cpc;

        // Return costs
        const monthlyReturns = data.monthlySales * (data.returnRate / 100);
        const monthlyReturnCost = monthlyReturns * data.returnCost;

        // FBA Calculations
        const fbaTotalCosts = monthlyProductCost + fbaFees.total + monthlyReferralFee + monthlyAdvertisingCost + monthlyReturnCost;
        const fbaProfit = monthlyRevenue - fbaTotalCosts;
        const fbaROI = ((fbaProfit / fbaTotalCosts) * 100) || 0;
        const fbaMargin = ((fbaProfit / monthlyRevenue) * 100) || 0;

        // FBM Calculations
        const fbmTotalCosts = monthlyProductCost + fbmFees.total + monthlyReferralFee + monthlyAdvertisingCost + monthlyReturnCost;
        const fbmProfit = monthlyRevenue - fbmTotalCosts;
        const fbmROI = ((fbmProfit / fbmTotalCosts) * 100) || 0;
        const fbmMargin = ((fbmProfit / monthlyRevenue) * 100) || 0;

        // Determine recommendation
        let recommendation = 'FBA';
        if (fbmProfit > fbaProfit) {
            recommendation = 'FBM';
        } else if (Math.abs(fbaProfit - fbmProfit) < 100) {
            recommendation = 'Mixed';
        }

        return {
            monthlyRevenue,
            monthlyProductCost,
            monthlyReferralFee,
            monthlyAdvertisingCost,
            monthlyReturnCost,
            fba: {
                profit: fbaProfit,
                roi: fbaROI,
                margin: fbaMargin,
                costs: fbaFees,
                totalCosts: fbaTotalCosts
            },
            fbm: {
                profit: fbmProfit,
                roi: fbmROI,
                margin: fbmMargin,
                costs: fbmFees,
                totalCosts: fbmTotalCosts
            },
            recommendation,
            profitDifference: fbaProfit - fbmProfit
        };
    }

    calculateFBAFees(data) {
        // Fulfillment fees
        const fulfillmentFees = data.fbaFulfillmentFee * data.monthlySales;

        // Storage fees (monthly)
        const productVolume = (data.productLength * data.productWidth * data.productHeight) / 1000000; // m³
        const monthlyStorageFee = productVolume * data.fbaStorageFee * data.inventoryMonths;
        
        // Long-term storage (if inventory > 12 months)
        const longTermStorageFee = data.inventoryMonths > 12 ? 
            productVolume * data.fbaLongTermStorage * (data.inventoryMonths - 12) : 0;

        // Inbound shipping
        const inboundShippingCost = data.fbaInboundShipping * data.monthlySales;

        // Prep fees
        const prepFees = data.fbaPrepFee * data.monthlySales;

        return {
            fulfillment: fulfillmentFees,
            storage: monthlyStorageFee + longTermStorageFee,
            inbound: inboundShippingCost,
            prep: prepFees,
            total: fulfillmentFees + monthlyStorageFee + longTermStorageFee + inboundShippingCost + prepFees
        };
    }

    calculateFBMFees(data) {
        // Shipping costs
        const shippingCosts = data.fbmShippingCost * data.monthlySales;

        // Packaging costs
        const packagingCosts = data.fbmPackagingCost * data.monthlySales;

        // Labor costs
        const packagingHours = (data.fbmPackagingTime / 60) * data.monthlySales;
        const laborCosts = packagingHours * data.fbmHourlyRate;

        // Overhead costs
        const overheadCosts = data.fbmOverheadCost * data.monthlySales;

        return {
            shipping: shippingCosts,
            packaging: packagingCosts,
            labor: laborCosts,
            overhead: overheadCosts,
            total: shippingCosts + packagingCosts + laborCosts + overheadCosts
        };
    }

    displayResults(results) {
        // Update FBA results
        document.getElementById('fbaProfitDisplay').textContent = `${results.fba.profit.toFixed(2)} zł`;
        document.getElementById('fbaRevenue').textContent = `${results.monthlyRevenue.toFixed(2)} zł`;
        document.getElementById('fbaProductCost').textContent = `${results.monthlyProductCost.toFixed(2)} zł`;
        document.getElementById('fbaFulfillmentFees').textContent = `${results.fba.costs.fulfillment.toFixed(2)} zł`;
        document.getElementById('fbaStorageFees').textContent = `${results.fba.costs.storage.toFixed(2)} zł`;
        document.getElementById('fbaReferralFee').textContent = `${results.monthlyReferralFee.toFixed(2)} zł`;
        document.getElementById('fbaInboundCost').textContent = `${results.fba.costs.inbound.toFixed(2)} zł`;
        document.getElementById('fbaAdvertisingCost').textContent = `${results.monthlyAdvertisingCost.toFixed(2)} zł`;
        document.getElementById('fbaNetProfit').innerHTML = `<strong>${results.fba.profit.toFixed(2)} zł</strong>`;

        // Update FBM results
        document.getElementById('fbmProfitDisplay').textContent = `${results.fbm.profit.toFixed(2)} zł`;
        document.getElementById('fbmRevenue').textContent = `${results.monthlyRevenue.toFixed(2)} zł`;
        document.getElementById('fbmProductCost').textContent = `${results.monthlyProductCost.toFixed(2)} zł`;
        document.getElementById('fbmShippingCosts').textContent = `${results.fbm.costs.shipping.toFixed(2)} zł`;
        document.getElementById('fbmPackagingCosts').textContent = `${results.fbm.costs.packaging.toFixed(2)} zł`;
        document.getElementById('fbmLaborCosts').textContent = `${results.fbm.costs.labor.toFixed(2)} zł`;
        document.getElementById('fbmReferralFee').textContent = `${results.monthlyReferralFee.toFixed(2)} zł`;
        document.getElementById('fbmAdvertisingCost').textContent = `${results.monthlyAdvertisingCost.toFixed(2)} zł`;
        document.getElementById('fbmNetProfit').innerHTML = `<strong>${results.fbm.profit.toFixed(2)} zł</strong>`;

        // Update comparison
        document.getElementById('profitDifference').textContent = `${results.profitDifference.toFixed(2)} zł`;
        document.getElementById('fbaROI').textContent = `${results.fba.roi.toFixed(1)}%`;
        document.getElementById('fbmROI').textContent = `${results.fbm.roi.toFixed(1)}%`;
        document.getElementById('fbaMargin').textContent = `${results.fba.margin.toFixed(1)}%`;
        document.getElementById('fbmMargin').textContent = `${results.fbm.margin.toFixed(1)}%`;

        // Generate insights
        this.generateInsights(results);

        // Show results section
        document.getElementById('resultsSection').style.display = 'block';
    }

    updateQuickStats(results) {
        document.getElementById('fbaProfit').textContent = `${results.fba.profit.toFixed(2)} zł`;
        document.getElementById('fbmProfit').textContent = `${results.fbm.profit.toFixed(2)} zł`;
        document.getElementById('roiValue').textContent = `${Math.max(results.fba.roi, results.fbm.roi).toFixed(1)}%`;
        document.getElementById('marginValue').textContent = `${Math.max(results.fba.margin, results.fbm.margin).toFixed(1)}%`;
        document.getElementById('recommendation').textContent = results.recommendation;
    }

    generateInsights(results) {
        const insightsGrid = document.getElementById('insightsGrid');
        insightsGrid.innerHTML = '';

        // Price optimization insights
        const priceInsights = this.getPriceOptimizationInsights(results);
        if (priceInsights) {
            this.addInsightCard(insightsGrid, '💰 Optymalizacja Cen', priceInsights, 'success');
        }

        // FBA strategy insights
        const fbaInsights = this.getFBAStrategyInsights(results);
        if (fbaInsights) {
            this.addInsightCard(insightsGrid, '📦 Strategia FBA', fbaInsights, 'info');
        }

        // FBM strategy insights
        const fbmInsights = this.getFBMStrategyInsights(results);
        if (fbmInsights) {
            this.addInsightCard(insightsGrid, '🚚 Strategia FBM', fbmInsights, 'warning');
        }

        // General recommendations
        const generalInsights = this.getGeneralInsights(results);
        if (generalInsights) {
            this.addInsightCard(insightsGrid, '💡 Ogólne Rekomendacje', generalInsights, 'primary');
        }
    }

    getPriceOptimizationInsights(results) {
        const insights = [];
        
        if (results.fba.margin < 20) {
            insights.push('Marża FBA jest niska (< 20%). Rozważ podniesienie ceny lub obniżenie kosztów.');
        }
        
        if (results.fbm.margin < 15) {
            insights.push('Marża FBM jest bardzo niska (< 15%). Sprawdź koszty wysyłki i opakowania.');
        }

        if (results.monthlyRevenue > 0 && results.monthlyAdvertisingCost / results.monthlyRevenue > 0.15) {
            insights.push('Koszty reklamy są wysokie (> 15% przychodów). Zoptymalizuj kampanie PPC.');
        }

        return insights.length > 0 ? insights.join(' ') : null;
    }

    getFBAStrategyInsights(results) {
        const insights = [];
        
        if (results.fba.costs.storage > results.fba.profit * 0.1) {
            insights.push('Opłaty magazynowe FBA są wysokie. Rozważ szybszą rotację zapasów.');
        }

        if (results.fba.costs.inbound > 0 && results.fba.costs.inbound > results.fba.profit * 0.2) {
            insights.push('Koszty inbound shipping są znaczące. Negocjuj lepsze stawki z przewoźnikami.');
        }

        if (results.fba.profit > results.fbm.profit && results.profitDifference > 500) {
            insights.push('FBA jest znacznie bardziej opłacalne. Skup się na optymalizacji procesów FBA.');
        }

        return insights.length > 0 ? insights.join(' ') : null;
    }

    getFBMStrategyInsights(results) {
        const insights = [];
        
        if (results.fbm.costs.labor > results.fbm.profit * 0.3) {
            insights.push('Koszty pracy FBM są wysokie. Automatyzuj procesy pakowania.');
        }

        if (results.fbm.costs.shipping > results.fbm.profit * 0.25) {
            insights.push('Koszty wysyłki FBM są znaczące. Rozważ negocjacje z przewoźnikami.');
        }

        if (results.fbm.profit > results.fba.profit && results.profitDifference < -300) {
            insights.push('FBM jest bardziej opłacalne. Rozważ przejście na FBM dla tego produktu.');
        }

        return insights.length > 0 ? insights.join(' ') : null;
    }

    getGeneralInsights(results) {
        const insights = [];
        
        if (results.recommendation === 'FBA') {
            insights.push('Rekomendacja: FBA - lepsza opłacalność i mniej pracy operacyjnej.');
        } else if (results.recommendation === 'FBM') {
            insights.push('Rekomendacja: FBM - wyższy zysk i kontrola nad procesami.');
        } else {
            insights.push('Rekomendacja: Mixed - rozważ hybrydowe podejście FBA/FBM.');
        }

        if (results.fba.roi > 50) {
            insights.push('ROI FBA jest bardzo dobry (> 50%). Produkt ma duży potencjał.');
        }

        if (results.fbm.roi > 40) {
            insights.push('ROI FBM jest dobry (> 40%). Warto rozważyć FBM dla większej kontroli.');
        }

        return insights.join(' ');
    }

    addInsightCard(container, title, content, type) {
        const card = document.createElement('div');
        card.className = 'insight-card';
        card.innerHTML = `
            <h4>${title}</h4>
            <p>${content}</p>
        `;
        container.appendChild(card);
    }

    loadSavedData() {
        const savedData = localStorage.getItem('amazonCalculatorData');
        if (savedData) {
            const data = JSON.parse(savedData);
            Object.keys(data).forEach(key => {
                const element = document.getElementById(key);
                if (element) {
                    element.value = data[key];
                }
            });
            this.updateStats();
        }
    }

    saveData() {
        const data = this.getFormData();
        localStorage.setItem('amazonCalculatorData', JSON.stringify(data));
    }
}

// Global functions
function calculateAll() {
    calculator.updateStats();
    calculator.saveData();
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    
    const btn = document.querySelector('.btn-secondary');
    if (isDark) {
        btn.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
    } else {
        btn.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
    }
}

function exportResults() {
    const data = calculator.getFormData();
    const results = calculator.calculateAll(data);
    
    // Create CSV content
    const csvContent = [
        ['Amazon FBA/FBM Calculator Results'],
        [''],
        ['Product Information'],
        ['Product Name', data.productName],
        ['Category', data.productCategory],
        ['Selling Price', `${data.sellingPrice} PLN`],
        ['Product Cost', `${data.productCost} PLN`],
        ['Monthly Sales', data.monthlySales],
        [''],
        ['FBA Results'],
        ['Monthly Revenue', `${results.monthlyRevenue.toFixed(2)} PLN`],
        ['FBA Profit', `${results.fba.profit.toFixed(2)} PLN`],
        ['FBA ROI', `${results.fba.roi.toFixed(1)}%`],
        ['FBA Margin', `${results.fba.margin.toFixed(1)}%`],
        [''],
        ['FBM Results'],
        ['FBM Profit', `${results.fbm.profit.toFixed(2)} PLN`],
        ['FBM ROI', `${results.fbm.roi.toFixed(1)}%`],
        ['FBM Margin', `${results.fbm.margin.toFixed(1)}%`],
        [''],
        ['Comparison'],
        ['Profit Difference (FBA - FBM)', `${results.profitDifference.toFixed(2)} PLN`],
        ['Recommendation', results.recommendation],
        [''],
        ['Generated on', new Date().toLocaleString('pl-PL')]
    ].map(row => row.join(',')).join('\n');

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `amazon-calculator-results-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Initialize calculator when DOM is loaded
let calculator;
document.addEventListener('DOMContentLoaded', () => {
    calculator = new AmazonCalculator();
    
    // Load dark mode preference
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.body.classList.add('dark-mode');
        const btn = document.querySelector('.btn-secondary');
        btn.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
    }
}); 
