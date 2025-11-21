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
const sizeFilter = document.getElementById('sizeFilter');
const categoryFilterMobile = document.getElementById('categoryFilterMobile');
const priceFilterMobile = document.getElementById('priceFilterMobile');
const sizeFilterMobile = document.getElementById('sizeFilterMobile');
const filterTags = document.querySelectorAll('.filter-tag');
const sortBy = document.getElementById('sortBy');
const productsGrid = document.getElementById('productsGrid');
const loadingProducts = document.getElementById('loadingProducts');

let currentFilters = {
    category: 'all',
    price: 'all',
    size: 'all',
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

if (sizeFilter && sizeFilterMobile) {
    sizeFilter.addEventListener('change', () => syncFilters(sizeFilter, sizeFilterMobile));
    sizeFilterMobile.addEventListener('change', () => syncFilters(sizeFilterMobile, sizeFilter));
}

// Load products from database
async function loadProducts() {
    try {
        const response = await fetch('backend/get_products.php?type=clothing');
        const data = await response.json();
        
        if (data.status === 'success') {
            allProducts = data.products;
            filteredProducts = [...allProducts];
            
            // Show/hide sections based on product availability
            const comingSoonSection = document.getElementById('comingSoonSection');
            const productsGridSection = document.getElementById('productsGrid');
            
            if (allProducts.length === 0) {
                // No products - show coming soon
                comingSoonSection.style.display = 'flex';
                productsGridSection.style.display = 'none';
            } else {
                // Products exist - show products grid
                comingSoonSection.style.display = 'none';
                productsGridSection.style.display = 'grid';
                displayProducts(filteredProducts);
                updateProductCount(filteredProducts.length);
            }
        } else {
            showError('Failed to load products');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Error loading products');
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
                <h3>No products found</h3>
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
                    window.location.href = `product.html?id=${productId}&type=clothing`;
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
                        product_type: 'clothing',
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
        'tshirt': 'T-Shirts',
        'shorts': 'Shorts',
        'hoodie': 'Hoodies',
        'joggers': 'Joggers',
        'tank': 'Tank Tops'
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
            if (currentFilters.price === 'low' && price >= 30) return false;
            if (currentFilters.price === 'mid' && (price < 30 || price > 60)) return false;
            if (currentFilters.price === 'high' && price <= 60) return false;
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