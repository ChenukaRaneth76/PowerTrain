// Cart Management System

// Get cart count and update navbar
async function updateCartCount() {
    try {
        const response = await fetch('backend/cart.php?action=count');
        const data = await response.json();
        
        if (data.status === 'success') {
            const cartCountElements = document.querySelectorAll('.cart-count');
            cartCountElements.forEach(el => {
                el.textContent = data.count;
                el.style.display = data.count > 0 ? 'inline-block' : 'none';
            });
        }
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
}

// Add product to cart
async function addToCart(productData) {
    try {
        console.log('addToCart called with:', productData);
        
        const response = await fetch('backend/cart.php?action=add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });
        
        console.log('Response status:', response.status);
        
        // Get response as text first to debug
        const responseText = await response.text();
        console.log('Response text:', responseText);
        
        // Parse JSON
        let data;
        try {
            data = JSON.parse(responseText);
            console.log('Parsed data:', data);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            showNotification('Server response error', 'error');
            return false;
        }
        
        if (data.status === 'success') {
            console.log('Cart add successful!');
            // Show success notification
            showNotification('Added to cart successfully!', 'success');
            // Update cart count
            await updateCartCount();
            return true;
        } else {
            console.error('Cart add failed:', data.message);
            showNotification(data.message || 'Failed to add to cart', 'error');
            return false;
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('Error adding to cart: ' + error.message, 'error');
        return false;
    }
}

// Remove item from cart
async function removeFromCart(cartId) {
    try {
        const response = await fetch(`backend/cart.php?action=remove&id=${cartId}`);
        const data = await response.json();
        
        if (data.status === 'success') {
            showNotification('Item removed from cart', 'success');
            updateCartCount();
            return true;
        } else {
            showNotification('Failed to remove item', 'error');
            return false;
        }
    } catch (error) {
        console.error('Error removing from cart:', error);
        showNotification('Error removing item', 'error');
        return false;
    }
}

// Update cart item quantity
async function updateCartQuantity(cartId, quantity) {
    try {
        const response = await fetch('backend/cart.php?action=update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cart_id: cartId,
                quantity: quantity
            })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            updateCartCount();
            return true;
        } else {
            showNotification('Failed to update quantity', 'error');
            return false;
        }
    } catch (error) {
        console.error('Error updating cart:', error);
        showNotification('Error updating cart', 'error');
        return false;
    }
}

// Get all cart items
async function getCartItems() {
    try {
        const response = await fetch('backend/cart.php?action=get');
        const data = await response.json();
        
        if (data.status === 'success') {
            return data;
        } else {
            console.error('Failed to get cart items');
            return { items: [], total: 0, count: 0 };
        }
    } catch (error) {
        console.error('Error getting cart items:', error);
        return { items: [], total: 0, count: 0 };
    }
}

// Clear entire cart
async function clearCart() {
    try {
        const response = await fetch('backend/cart.php?action=clear');
        const data = await response.json();
        
        if (data.status === 'success') {
            showNotification('Cart cleared', 'success');
            updateCartCount();
            return true;
        } else {
            showNotification('Failed to clear cart', 'error');
            return false;
        }
    } catch (error) {
        console.error('Error clearing cart:', error);
        showNotification('Error clearing cart', 'error');
        return false;
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `cart-notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
});