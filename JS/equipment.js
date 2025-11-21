// Modern popup notification function
function showModernPopup(message, type = 'info') {
    const existingPopup = document.getElementById('modernPopup');
    if (existingPopup) existingPopup.remove();
    
    const overlay = document.createElement('div');
    overlay.id = 'modernPopup';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:999999;animation:fadeIn 0.3s ease';
    
    const colors = {success:'#10b981',error:'#ef4444',warning:'#f59e0b',info:'#3b82f6'};
    const icons = {success:'✓',error:'✕',warning:'⚠',info:'ℹ'};
    
    const popup = document.createElement('div');
    popup.style.cssText = 'background:white;border-radius:20px;padding:40px;max-width:400px;width:90%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.3);animation:slideUp 0.3s ease';
    popup.innerHTML = `<div style="width:80px;height:80px;margin:0 auto 20px;background:${colors[type]};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:40px;color:white;font-weight:bold">${icons[type]}</div><h2 style="font-size:24px;margin-bottom:15px;color:#1f2937">${type==='error'?'Oops!':type==='success'?'Success!':'Notice'}</h2><p style="font-size:16px;color:#6b7280;margin-bottom:30px;line-height:1.6">${message}</p><button onclick="document.getElementById('modernPopup').remove()" style="background:${colors[type]};color:white;border:none;padding:15px 50px;border-radius:10px;font-size:16px;font-weight:600;cursor:pointer;transition:all 0.3s ease;box-shadow:0 4px 15px ${colors[type]}40" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">OK</button>`;
    
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    const style = document.createElement('style');
    style.textContent = '@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{transform:translateY(50px);opacity:0}to{transform:translateY(0);opacity:1}}';
    if (!document.getElementById('popupAnimations')) {
        style.id = 'popupAnimations';
        document.head.appendChild(style);
    }
    
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    if (type === 'success') setTimeout(() => { if (document.getElementById('modernPopup')) overlay.remove(); }, 5000);
}

// Mobile Filter Toggle
const mobileFilterToggle = document.getElementById('mobileFilterToggle');
const filterPanelMobile = document.getElementById('filterPanelMobile');

if (mobileFilterToggle && filterPanelMobile) {
    mobileFilterToggle.addEventListener('click', function() {
        this.classList.toggle('active');
        filterPanelMobile.classList.toggle('active');
    });
}

// Global variables
let allProducts = [];
let filteredProducts = [];
const categoryFilter = document.getElementById('categoryFilter');
const priceFilter = document.getElementById('priceFilter');
const materialFilter = document.getElementById('materialFilter');
const categoryFilterMobile = document.getElementById('categoryFilterMobile');
const priceFilterMobile = document.getElementById('priceFilterMobile');
const materialFilterMobile = document.getElementById('materialFilterMobile');
const filterTags = document.querySelectorAll('.filter-tag');
const sortBy = document.getElementById('sortBy');
const productsGrid = document.getElementById('productsGrid');
const loadingProducts = document.getElementById('loadingProducts');

let currentFilters = {
    category: 'all',
    price: 'all',
    material: 'all',
    status: 'all'
};

// Sync mobile and desktop filters
function syncFilters(source, target) {
    if (source && target) {
        target.value = source.value;
    }
}

// Add sync listeners
if (categoryFilter && categoryFilterMobile) {
    categoryFilter.addEventListener('change', () => syncFilters(categoryFilter, categoryFilterMobile));
    categoryFilterMobile.addEventListener('change', () => syncFilters(categoryFilterMobile, categoryFilter));
}

if (priceFilter && priceFilterMobile) {
    priceFilter.addEventListener('change', () => syncFilters(priceFilter, priceFilterMobile));
    priceFilterMobile.addEventListener('change', () => syncFilters(priceFilterMobile, priceFilter));
}

if (materialFilter && materialFilterMobile) {
    materialFilter.addEventListener('change', () => syncFilters(materialFilter, materialFilterMobile));
    materialFilterMobile.addEventListener('change', () => syncFilters(materialFilterMobile, materialFilter));
}

// Load products from database
async function loadProducts() {
    try {
        const response = await fetch('backend/get_products.php?type=equipment');
        const data = await response.json();
        
        if (data.status === 'success') {
            allProducts = data.products;
            filteredProducts = [...allProducts];
            displayProducts(filteredProducts);
            updateProductCount(filteredProducts.length);
        } else {
            showError('Failed to load equipment');
        }
    } catch (error) {
        console.error('Error loading equipment:', error);
        showError('Error loading equipment');
    } finally {
        loadingProducts.style.display = 'none';
    }
}

// Display products
function displayProducts(products) {
    const productCards = products.map(product => createProductCard(product)).join('');
    
    // Remove loading spinner and existing products
    const existingProducts = productsGrid.querySelectorAll('.product-card-shop');
    existingProducts.forEach(card => card.remove());
    
    if (products.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-products">
                <i class="fas fa-search"></i>
                <h3>No equipment found</h3>
                <p>Try adjusting your filters</p>
            </div>
        `;
    } else {
        productsGrid.innerHTML = productCards;
        
        // Add click handlers for product cards
        productsGrid.querySelectorAll('.product-card-shop').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('add-to-cart')) {
                    const productId = card.dataset.productId;
                    window.location.href = `product.html?id=${productId}&type=equipment`;
                }
            });
        });
        
        // Add click handlers for add to cart buttons
        productsGrid.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                
                // Check if user is logged in
                const authData = localStorage.getItem('auth');
                if (!authData) {
                    showModernPopup('Please login to add items to your cart!', 'warning');
                    setTimeout(() => {
                        const authModal = document.querySelector('.auth-modal');
                        if (authModal) authModal.classList.add('show');
                    }, 1500);
                    return;
                }
                
                const card = btn.closest('.product-card-shop');
                const productId = card.dataset.productId;
                
                // Find product data
                const product = allProducts.find(p => p.id == productId);
                
                if (product) {
                    // Get proper image path
                    let productImage = product.image || product.image1 || '';
                    if (product.images && product.images.length > 0) {
                        productImage = product.images[0];
                    }
                    // Ensure image has proper path
                    if (productImage && !productImage.startsWith('IMG/') && !productImage.startsWith('uploads/') && !productImage.startsWith('http')) {
                        productImage = 'IMG/' + productImage;
                    }
                    
                    const success = await addToCart({
                        product_id: product.id,
                        product_type: 'equipment',
                        product_name: product.name,
                        product_price: product.price,
                        product_image: productImage || 'IMG/placeholder.png',
                        quantity: 1
                    });
                    
                    if (success) {
                        btn.textContent = 'ADDED ✓';
                        btn.style.background = '#10b981';
                        setTimeout(() => {
                            btn.textContent = 'ADD TO CART';
                            btn.style.background = '#000';
                        }, 2000);
                    }
                }
            });
        });
    }
}

// Create product card HTML
function createProductCard(product) {
    const badgeHtml = product.status && product.status !== 'normal' 
        ? `<span class="product-badge ${product.status}">${product.status.toUpperCase()}</span>`
        : '';
    
    const imageUrl = product.image || 'IMG/placeholder.png';
    const categoryName = getCategoryDisplayName(product.category);
    
    return `
        <div class="product-card-shop" 
             data-category="${product.category}" 
             data-price="${product.price}" 
             data-material="${product.material || ''}"
             data-status="${product.status || 'normal'}"
             data-product-id="${product.id}">
            <div class="product-img-shop" style="background-image: url('${imageUrl}')">
                ${badgeHtml}
            </div>
            <div class="product-details-shop">
                <div class="product-category">${categoryName}</div>
                <h3 class="product-title">${product.name}</h3>
                <div class="product-rating">
                    <div class="stars">★★★★★</div>
                    <span class="rating-count">(${Math.floor(Math.random() * 200) + 50})</span>
                </div>
                <div class="product-price">Rs.${parseFloat(product.price).toFixed(2)}</div>
                <button class="add-to-cart">ADD TO CART</button>
            </div>
        </div>
    `;
}

// Get display name for category
function getCategoryDisplayName(category) {
    const categoryMap = {
        'weights': 'Weights',
        'resistance': 'Resistance Bands',
        'mat': 'Exercise Mats',
        'gym equipments': 'Gym Equipments',
        'Parallettes': 'Parallettes',
        'pull-up bar': 'Pull-Up Bars',
        'dip-bars': 'Dip-Bars',
        'dip belt': 'Dip Belt',
        'protective gear': 'Protective Gear',
    };
    return categoryMap[category] || category;
}

// Show error message
function showError(message) {
    productsGrid.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Error</h3>
            <p>${message}</p>
            <button onclick="loadProducts()" class="retry-btn">Retry</button>
        </div>
    `;
}

// Update product count
function updateProductCount(count) {
    document.getElementById('productCount').textContent = count;
}

// Filter products
function filterProducts() {
    filteredProducts = allProducts.filter(product => {
        // Category filter
        if (currentFilters.category !== 'all' && product.category !== currentFilters.category) {
            return false;
        }
        
        // Price filter
        const price = parseFloat(product.price);
        if (currentFilters.price !== 'all') {
            if (currentFilters.price === 'low' && price >= 50) return false;
            if (currentFilters.price === 'mid' && (price < 50 || price > 100)) return false;
            if (currentFilters.price === 'high' && price <= 100) return false;
        }
        
        // Material filter
        if (currentFilters.material !== 'all' && (product.material || '').toLowerCase() !== currentFilters.material.toLowerCase()) {
            return false;
        }
        
        // Status filter
        if (currentFilters.status !== 'all' && (product.status || 'normal') !== currentFilters.status) {
            return false;
        }
        
        return true;
    });
    
    displayProducts(filteredProducts);
    updateProductCount(filteredProducts.length);
}

// Event listeners
categoryFilter.addEventListener('change', (e) => {
    currentFilters.category = e.target.value;
    filterProducts();
});

priceFilter.addEventListener('change', (e) => {
    currentFilters.price = e.target.value;
    filterProducts();
});

materialFilter.addEventListener('change', (e) => {
    currentFilters.material = e.target.value;
    filterProducts();
});

filterTags.forEach(tag => {
    tag.addEventListener('click', () => {
        filterTags.forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        currentFilters.status = tag.dataset.filter;
        filterProducts();
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});