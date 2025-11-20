// Product page functionality
let currentProduct = null;

// Modern popup notification function
function showModernPopup(message, type = 'info') {
    // Remove existing popup if any
    const existingPopup = document.getElementById('modernPopup');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    // Create popup overlay
    const overlay = document.createElement('div');
    overlay.id = 'modernPopup';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        animation: fadeIn 0.3s ease;
    `;
    
    // Create popup box
    const popup = document.createElement('div');
    popup.style.cssText = `
        background: white;
        border-radius: 20px;
        padding: 40px;
        max-width: 400px;
        width: 90%;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: slideUp 0.3s ease;
    `;
    
    // Icon based on type
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    
    popup.innerHTML = `
        <div style="
            width: 80px;
            height: 80px;
            margin: 0 auto 20px;
            background: ${colors[type]};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            color: white;
            font-weight: bold;
        ">${icons[type]}</div>
        <h2 style="
            font-size: 24px;
            margin-bottom: 15px;
            color: #1f2937;
        ">${type === 'error' ? 'Oops!' : type === 'success' ? 'Success!' : 'Notice'}</h2>
        <p style="
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 30px;
            line-height: 1.6;
        ">${message}</p>
        <button onclick="document.getElementById('modernPopup').remove()" style="
            background: ${colors[type]};
            color: white;
            border: none;
            padding: 15px 50px;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px ${colors[type]}40;
        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px ${colors[type]}60'" 
           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px ${colors[type]}40'">OK</button>
    `;
    
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    // Add animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUp {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    if (!document.getElementById('popupAnimations')) {
        style.id = 'popupAnimations';
        document.head.appendChild(style);
    }
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
    
    // Auto close after 5 seconds for success messages
    if (type === 'success') {
        setTimeout(() => {
            if (document.getElementById('modernPopup')) {
                overlay.remove();
            }
        }, 5000);
    }
}

// Get product ID from URL parameters
function getProductId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Get product type from URL parameters
function getProductType() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('type') || 'clothing';
}

// Load product data
async function loadProduct() {
    const productId = getProductId();
    const productType = getProductType();
    
    console.log('Loading product - ID:', productId, 'Type:', productType);
    
    if (!productId) {
        console.log('No product ID found in URL');
        showProductNotFound();
        return;
    }
    
    try {
        const url = `backend/admin/products.php?action=get&type=${productType}&id=${productId}`;
        console.log('Fetching from URL:', url);
        
        const response = await fetch(url);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.status === 'success' && data.product) {
            currentProduct = data.product;
            console.log('Product loaded successfully:', data.product);
            displayProduct(data.product, productType);
            loadRelatedProducts(productType, productId);
        } else {
            console.log('Product not found or error:', data.message);
            showProductNotFound();
        }
    } catch (error) {
        console.error('Error loading product:', error);
        showProductNotFound();
    }
}

// Display product information
function displayProduct(product, type) {
    console.log('Displaying product:', product, 'Type:', type);
    
    // Hide loading spinner and show product
    const loadingSpinner = document.getElementById('loadingSpinner');
    const productMain = document.getElementById('productMain');
    
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    if (productMain) productMain.style.display = 'block';
    
    // Update page title
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.textContent = `${product.name} - Powertain.Fitness`;
    document.title = `${product.name} - Powertain.Fitness`;
    
    // Update product images
    const mainImage = document.getElementById('mainImage');
    const thumbnails = document.querySelectorAll('.thumbnail');
    
    if (mainImage && product.images && product.images.length > 0) {
        // Set main image to first available image
        mainImage.src = product.images[0];
        mainImage.alt = product.name;
        
        // Set thumbnails to available images
        thumbnails.forEach((thumb, index) => {
            if (product.images[index]) {
                thumb.src = product.images[index];
                thumb.alt = product.name;
                thumb.style.display = 'block';
            } else {
                thumb.style.display = 'none';
            }
        });
    } else if (mainImage && product.image) {
        // Fallback to single image
        mainImage.src = product.image;
        mainImage.alt = product.name;
        // Add class for proper image fitting
        mainImage.classList.remove('equipment', 'clothing');
        mainImage.classList.add(type);
        
        thumbnails.forEach((thumb, index) => {
            if (index === 0) {
                thumb.src = product.image;
                thumb.alt = product.name;
                thumb.style.display = 'block';
            } else {
                thumb.style.display = 'none';
            }
        });
    }
    
    // Update product title and price
    const productTitle = document.getElementById('productTitle');
    const productPrice = document.getElementById('productPrice');
    
    if (productTitle) productTitle.textContent = product.name.toUpperCase();
    if (productPrice) productPrice.textContent = `Rs.${parseFloat(product.price).toFixed(2)}`;
    
    // Update description - convert line breaks to bullet points
    const description = product.description || 'Premium quality product perfect for your fitness journey.';
    const productDescription = document.getElementById('productDescription');
    if (productDescription) {
        // Check if description has line breaks or bullet points
        if (description.includes('\n') || description.includes('•')) {
            // Convert line breaks to bullet points
            const lines = description.split('\n').filter(line => line.trim());
            productDescription.innerHTML = '<ul style="list-style: none; padding-left: 0; margin: 0;">' + 
                lines.map(line => `<li style="margin-bottom: 8px;">• ${line.trim()}</li>`).join('') + 
                '</ul>';
        } else {
            productDescription.textContent = description;
        }
    }
    
    // Show/hide color and size sections based on product type
    const colorSection = document.querySelector('.color-section');
    const sizeSection = document.querySelector('.size-section');
    
    if (type === 'equipment') {
        // Hide color and size sections for equipment
        if (colorSection) colorSection.style.display = 'none';
        if (sizeSection) sizeSection.style.display = 'none';
    } else {
        // Show for clothing
        if (colorSection) colorSection.style.display = 'block';
        if (sizeSection) sizeSection.style.display = 'block';
        
        // Handle colors for clothing
        if (product.colors) {
            const colors = product.colors.split(',').map(c => c.trim().toLowerCase());
            const colorOptions = document.querySelectorAll('.color-option');
            
            // Show/hide color options based on available colors
            colorOptions.forEach(option => {
                const colorName = option.dataset.color;
                if (colors.includes(colorName)) {
                    option.style.display = 'block';
                } else {
                    option.style.display = 'none';
                }
            });
        }
    }
    
    // Handle size options for clothing with stock information
    if (type === 'clothing' && product.sizes) {
        const sizeOptions = document.getElementById('sizeOptions');
        const sizes = product.sizes.split(',').map(s => s.trim());
        
        sizeOptions.innerHTML = sizes.map(size => {
            const stock = product.size_stock && product.size_stock[size] ? product.size_stock[size] : 0;
            const isOutOfStock = stock === 0;
            const isLowStock = stock > 0 && stock <= 5;
            
            return `<div class=\"size-option ${isOutOfStock ? 'out-of-stock' : ''}\" 
                         data-size=\"${size}\" 
                         data-stock=\"${stock}\"
                         ${isOutOfStock ? 'disabled' : ''}>
                        ${size}
                        ${isLowStock ? '<span class="low-stock">!</span>' : ''}
                    </div>`;
        }).join('');
        
        // Add click handlers for size options
        sizeOptions.querySelectorAll('.size-option:not(.out-of-stock)').forEach(option => {
            option.addEventListener('click', () => {
                sizeOptions.querySelectorAll('.size-option').forEach(o => o.classList.remove('active'));
                option.classList.add('active');
                
                // Update stock display for selected size
                const selectedStock = option.dataset.stock;
                updateStockDisplay(selectedStock);
            });
        });
        
        // Select first available size by default
        const firstAvailable = sizeOptions.querySelector('.size-option:not(.out-of-stock)');
        if (firstAvailable) {
            firstAvailable.classList.add('active');
            updateStockDisplay(firstAvailable.dataset.stock);
        }
    }
    
    // Display overall stock status for clothing
    if (type === 'clothing') {
        displayStockStatus(product.stock_status, product.total_stock);
    } else if (type === 'equipment') {
        displayStockStatus(product.stock_status, product.stock);
        
        // Update detail sections for equipment products
        const fitSection = document.querySelector('.detail-section:nth-child(2)');
        if (fitSection) {
            const fitHeader = fitSection.querySelector('.detail-header span');
            const fitContent = fitSection.querySelector('.detail-content');
            
            if (fitHeader) fitHeader.textContent = 'SPECIFICATIONS';
            
            if (fitContent) {
                const specs = [];
                if (product.material) specs.push(`Material: ${product.material}`);
                if (product.stock) specs.push(`Stock Available: ${product.stock} units`);
                if (product.category) specs.push(`Category: ${product.category}`);
                
                fitContent.innerHTML = specs.length > 0 
                    ? specs.map(spec => `• ${spec}`).join('<br>') 
                    : '• Premium quality fitness equipment';
            }
        }
        
        // Update materials section for equipment
        const materialsSection = document.querySelector('.detail-section:nth-child(3)');
        if (materialsSection) {
            const materialsHeader = materialsSection.querySelector('.detail-header span');
            const materialsContent = materialsSection.querySelector('.detail-content');
            
            if (materialsHeader) materialsHeader.textContent = 'CARE INSTRUCTIONS';
            
            if (materialsContent) {
                materialsContent.innerHTML = 
                    '• Wipe clean with damp cloth<br>' +
                    '• Store in dry place<br>' +
                    '• Avoid exposure to extreme temperatures<br>' +
                    '• Check for wear before each use';
            }
        }
    }
    
    // Initialize interactive features
    initImageGallery();
    initColorSelection();
    initDetailSections();
}

// Show product not found
function showProductNotFound() {
    document.getElementById('loadingSpinner').style.display = 'none';
    document.getElementById('productNotFound').style.display = 'block';
}

// Load related products
async function loadRelatedProducts(type, currentId) {
    try {
        const response = await fetch(`backend/admin/products.php?action=list&type=${type}`);
        const data = await response.json();
        
        if (data.status === 'success' && data.products.length > 0) {
            // Filter out current product and get random 4 products
            const relatedProducts = data.products
                .filter(p => p.id != currentId)
                .sort(() => Math.random() - 0.5)
                .slice(0, 4);
            
            if (relatedProducts.length > 0) {
                displayRelatedProducts(relatedProducts, type);
            }
        }
    } catch (error) {
        console.error('Error loading related products:', error);
    }
}

// Display related products using home page card style
function displayRelatedProducts(products, type) {
    const relatedSection = document.getElementById('relatedProducts');
    const relatedGrid = document.getElementById('relatedProductsGrid');
    
    relatedGrid.innerHTML = products.map(product => `
        <div class="product-card-shop" onclick="viewProduct(${product.id}, '${type}')">
            <div class="product-img-shop" style="background-image: url('${product.image || 'IMG/placeholder.png'}')">
                ${product.status && product.status !== 'normal' ? 
                    `<span class="product-badge ${product.status}">${product.status.toUpperCase()}</span>` : ''}
            </div>
            <div class="product-details-shop">
                <div class="product-category">${getCategoryDisplayName(product.category)}</div>
                <h3 class="product-title">${product.name}</h3>
                <div class="product-rating">
                    <div class="stars">★★★★★</div>
                    <span class="rating-count">(${Math.floor(Math.random() * 200) + 50})</span>
                </div>
                <div class="product-price">Rs.${parseFloat(product.price).toFixed(2)}</div>
                <button class="add-to-cart" onclick="event.stopPropagation(); quickAddToCart(${product.id}, '${type}')">ADD TO CART</button>
            </div>
        </div>
    `).join('');
    
    relatedSection.style.display = 'block';
}

// Helper function for category display names
function getCategoryDisplayName(category) {
    const categoryMap = {
        'hoodie': 'Hoodies',
        'tshirt': 'T-Shirts', 
        'shorts': 'Shorts',
        'dumbbell': 'Dumbbells',
        'barbell': 'Barbells',
        'kettlebell': 'Kettlebells',
        'resistance': 'Resistance Bands',
        'mat': 'Exercise Mats',
        'bench': 'Benches'
    };
    return categoryMap[category] || category;
}

// Quick add to cart for related products
function quickAddToCart(productId, type) {
    // Simple add to cart without size selection
    console.log(`Added product ${productId} (${type}) to cart`);
    
    // You can implement a simple notification here
    const notification = document.createElement('div');
    notification.textContent = 'Added to cart!';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 1000;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        document.body.removeChild(notification);
    }, 2000);
}

// Update stock display for selected size
function updateStockDisplay(stock) {
    // You can add a stock display element if needed
    console.log(`Selected size has ${stock} items in stock`);
}

// Display overall stock status
function displayStockStatus(status, stockCount) {
    // Find or create stock status element
    let stockElement = document.querySelector('.stock-status-display');
    if (!stockElement) {
        const priceSection = document.querySelector('.price-container');
        if (priceSection) {
            stockElement = document.createElement('div');
            stockElement.className = 'stock-status-display';
            priceSection.appendChild(stockElement);
        }
    }
    
    if (stockElement) {
        let statusText = '';
        let statusClass = '';
        
        switch (status) {
            case 'out':
                statusText = 'Out of Stock';
                statusClass = 'stock-out';
                break;
            case 'low':
                statusText = `Only ${stockCount} left!`;
                statusClass = 'stock-low';
                break;
            case 'in':
                statusText = 'In Stock';
                statusClass = 'stock-in';
                break;
        }
        
        stockElement.innerHTML = `<span class="stock-indicator ${statusClass}">${statusText}</span>`;
        
        // Disable add to cart if out of stock
        const addToCartBtn = document.getElementById('addToCartBtn');
        if (addToCartBtn) {
            if (status === 'out') {
                addToCartBtn.disabled = true;
                addToCartBtn.textContent = 'OUT OF STOCK';
                addToCartBtn.style.background = '#6b7280';
            } else {
                addToCartBtn.disabled = false;
                addToCartBtn.textContent = 'ADD TO CART';
                addToCartBtn.style.background = '#000';
            }
        }
    }
}

// Initialize image gallery
function initImageGallery() {
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.getElementById('mainImage');
    
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', () => {
            // Remove active class from all thumbnails
            thumbnails.forEach(t => t.classList.remove('active'));
            // Add active class to clicked thumbnail
            thumbnail.classList.add('active');
            // Update main image
            if (mainImage && thumbnail.src) {
                mainImage.src = thumbnail.src;
            }
        });
    });
}

// Initialize color selection
function initColorSelection() {
    const colorOptions = document.querySelectorAll('.color-option');
    const selectedColorSpan = document.getElementById('selectedColor');
    
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove active class from all options
            colorOptions.forEach(o => o.classList.remove('active'));
            // Add active class to clicked option
            option.classList.add('active');
            // Update selected color text
            const colorName = option.dataset.color;
            if (selectedColorSpan) {
                selectedColorSpan.textContent = colorName.charAt(0).toUpperCase() + colorName.slice(1);
            }
        });
    });
}

// Initialize detail sections (accordion)
function initDetailSections() {
    const detailHeaders = document.querySelectorAll('.detail-header');
    
    detailHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const section = header.parentElement;
            const content = section.querySelector('.detail-content');
            const icon = header.querySelector('i');
            
            // Toggle content visibility
            if (content.style.display === 'none' || !content.style.display) {
                content.style.display = 'block';
                icon.classList.remove('fa-plus');
                icon.classList.add('fa-minus');
            } else {
                content.style.display = 'none';
                icon.classList.remove('fa-minus');
                icon.classList.add('fa-plus');
            }
        });
    });
}

// Navigate to product page
function viewProduct(id, type) {
    window.location.href = `product.html?id=${id}&type=${type}`;
}

// Removed old localStorage cart functions - using backend API now

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadProduct();
    
    // Add to cart button handler
    const addToCartBtn = document.getElementById('addToCartBtn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', async () => {
            // Check if user is logged in
            const authData = localStorage.getItem('auth');
            if (!authData) {
                showModernPopup('Please login to add items to your cart!', 'warning');
                // Open login modal after a short delay
                setTimeout(() => {
                    const authModal = document.querySelector('.auth-modal');
                    if (authModal) {
                        authModal.classList.add('show');
                    }
                }, 1500);
                return;
            }
            
            if (!currentProduct) {
                showModernPopup('Product not loaded. Please wait...', 'info');
                return;
            }
            
            // Get selected size from .size-option.active (not radio buttons)
            const selectedSizeElement = document.querySelector('.size-option.active');
            const size = selectedSizeElement ? selectedSizeElement.dataset.size : '';
            
            // Get selected color (use .active not .selected)
            const selectedColorElement = document.querySelector('.color-option.active');
            const color = selectedColorElement ? selectedColorElement.dataset.color : '';
            
            // Get product type from URL
            const productType = getProductType();
            
            // For clothing products, size is required
            if (productType === 'clothing' && !size) {
                showModernPopup('Please select a size!', 'warning');
                return;
            }
            
            console.log('Adding to cart:', currentProduct);
            console.log('Product type:', productType);
            console.log('Selected size:', size);
            console.log('Selected color:', color);
            
            // Get proper image path from the ACTUAL displayed image
            const mainImageElement = document.getElementById('mainImage');
            let productImage = '';
            
            if (mainImageElement && mainImageElement.src) {
                // Extract relative path from full URL
                const fullUrl = mainImageElement.src;
                console.log('Full image URL from page:', fullUrl);
                
                // Get everything after the domain
                const urlParts = fullUrl.split('/GYM/');
                if (urlParts.length > 1) {
                    productImage = urlParts[1];
                } else {
                    // Try another method
                    const url = new URL(fullUrl);
                    productImage = url.pathname.replace('/GYM/', '');
                }
                
                console.log('Extracted relative path:', productImage);
            }
            
            // Fallback to currentProduct data if main image is not available
            if (!productImage) {
                console.log('No image from page, using product data');
                productImage = currentProduct.image || currentProduct.image1 || '';
                if (currentProduct.images && currentProduct.images.length > 0) {
                    productImage = currentProduct.images[0];
                }
                // Ensure image has proper path
                if (productImage && !productImage.startsWith('IMG/') && !productImage.startsWith('uploads/') && !productImage.startsWith('http')) {
                    productImage = 'IMG/' + productImage;
                }
                console.log('Using fallback image:', productImage);
            }
            
            // Disable button during processing
            addToCartBtn.disabled = true;
            const originalText = addToCartBtn.textContent;
            addToCartBtn.textContent = 'ADDING...';
            
            try {
                console.log('Product image being sent to cart:', productImage);
                console.log('Product type being sent:', productType);
                
                const success = await addToCart({
                    product_id: currentProduct.id,
                    product_type: productType, // Use productType from URL
                    product_name: currentProduct.name,
                    product_price: currentProduct.price,
                    product_image: productImage,
                    quantity: 1,
                    size: size || '',
                    color: color || ''
                });
                
                if (success) {
                    addToCartBtn.textContent = 'ADDED TO CART ✓';
                    addToCartBtn.style.background = '#10b981';
                    setTimeout(() => {
                        addToCartBtn.textContent = originalText;
                        addToCartBtn.style.background = '';
                        addToCartBtn.disabled = false;
                    }, 2000);
                } else {
                    addToCartBtn.textContent = originalText;
                    addToCartBtn.disabled = false;
                    alert('Failed to add to cart. Please try again.');
                }
            } catch (error) {
                console.error('Error adding to cart:', error);
                addToCartBtn.textContent = originalText;
                addToCartBtn.disabled = false;
                alert('Error adding to cart: ' + error.message);
            }
        });
    }
});

// Handle browser back/forward
window.addEventListener('popstate', () => {
    loadProduct();
});