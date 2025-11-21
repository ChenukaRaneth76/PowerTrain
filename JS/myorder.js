 let autoRefreshInterval = null;
        
        // Start auto-refresh (every 30 seconds)
        function startAutoRefresh() {
            // Clear any existing interval
            if (autoRefreshInterval) {
                clearInterval(autoRefreshInterval);
            }
            // Refresh every 30 seconds
            autoRefreshInterval = setInterval(() => {
                console.log('Auto-refreshing orders...');
                loadMyOrders(true); // true = silent refresh
            }, 30000);
        }
        
        // Manual refresh function
        async function refreshOrders() {
            const btn = document.getElementById('refreshBtn');
            btn.classList.add('spinning');
            btn.disabled = true;
            
            await loadMyOrders();
            
            setTimeout(() => {
                btn.classList.remove('spinning');
                btn.disabled = false;
            }, 500);
        }
        
        async function loadMyOrders(silent = false) {
            try {
                const authStr = localStorage.getItem('auth');
                console.log('Auth from localStorage:', authStr);
                
                const auth = JSON.parse(authStr || '{}');
                console.log('Parsed auth object:', auth);
                
                const userEmail = auth.email || auth.user_email || localStorage.getItem('user_email');
                console.log('User email:', userEmail);
                
                if (!userEmail) {
                    console.error('No email found in auth!');
                    alert('Please login to view your orders. If you are already logged in, please logout and login again.');
                    window.location.href = 'index.html';
                    return;
                }
                
                console.log('Loading orders for:', userEmail);

                const response = await fetch(`backend/orders.php?action=user_orders&email=${userEmail}`);
                const data = await response.json();

                if (data.status === 'success' && data.orders.length > 0) {
                    displayOrders(data.orders);
                    // Show success notification on manual refresh
                    if (!silent) {
                        showRefreshNotification('Orders refreshed!', 'success');
                    }
                } else {
                    document.getElementById('emptyOrders').style.display = 'block';
                }
            } catch (error) {
                console.error('Error loading orders:', error);
            }
        }

        function displayOrders(orders) {
            const content = document.getElementById('ordersContent');
            content.innerHTML = orders.map(order => `
                <div class="order-card">
                    <div class="order-header">
                        <div>
                            <div class="order-number">Order #${order.order_number}</div>
                            <div class="order-date">${new Date(order.created_at).toLocaleDateString()}</div>
                        </div>
                        <span class="order-status status-${order.status}">${order.status.toUpperCase()}</span>
                    </div>
                    <div class="order-items" id="items-${order.id}">Loading items...</div>
                    <div class="order-total">Total: Rs.${parseFloat(order.total_amount).toFixed(2)}</div>
                    ${order.status === 'delivered' ? `
                        <div class="order-actions">
                            <button class="btn-confirm" onclick="confirmReceived(${order.id})">CONFIRM RECEIVED</button>
                        </div>
                    ` : ''}
                </div>
            `).join('');

            // Load items for each order
            orders.forEach(order => loadOrderItems(order.id));
        }

        async function loadOrderItems(orderId) {
            try {
                const response = await fetch(`backend/orders.php?action=get&id=${orderId}`);
                const data = await response.json();

                if (data.status === 'success') {
                    const itemsDiv = document.getElementById(`items-${orderId}`);
                    itemsDiv.innerHTML = data.order.items.map(item => {
                        // Fix image path
                        let imageSrc = item.product_image;
                        if (!imageSrc || imageSrc === '' || imageSrc === 'null' || imageSrc === '0') {
                            imageSrc = 'IMG/clo1.webp';
                        } else if (!imageSrc.startsWith('IMG/') && !imageSrc.startsWith('uploads/') && !imageSrc.startsWith('http')) {
                            imageSrc = 'IMG/' + imageSrc;
                        }
                        
                        return `
                            <div class="order-item">
                                <img src="${imageSrc}" class="item-image" onerror="this.src='IMG/clo1.webp';">
                                <div class="item-details">
                                    <div class="item-name">${item.product_name}</div>
                                    <div class="item-meta">
                                        Qty: ${item.quantity}
                                        ${item.size ? `| <strong>Size: ${item.size}</strong>` : ''}
                                        ${item.color ? `| <strong>Color: ${item.color}</strong>` : ''}
                                    </div>
                                    <div class="item-meta">Rs.${parseFloat(item.product_price).toFixed(2)} each</div>
                                </div>
                            </div>
                        `;
                    }).join('');
                }
            } catch (error) {
                console.error('Error loading order items:', error);
            }
        }

        async function confirmReceived(orderId) {
            if (!confirm('Confirm that you have received this order?')) return;

            try {
                const formData = new FormData();
                formData.append('order_id', orderId);
                formData.append('status', 'delivered');
                formData.append('notes', 'Customer confirmed receipt');

                const response = await fetch('backend/orders.php?action=update_status', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();
                if (data.status === 'success') {
                    alert('Thank you for confirming!');
                    loadMyOrders();
                }
            } catch (error) {
                console.error('Error confirming order:', error);
            }
        }

        // Simple notification for refresh
        function showRefreshNotification(message, type) {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'success' ? '#10b981' : '#3b82f6'};
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 600;
                z-index: 999999;
                animation: slideIn 0.3s ease;
            `;
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }, 2000);
        }
        
        // Load orders on page load and start auto-refresh
        document.addEventListener('DOMContentLoaded', () => {
            loadMyOrders();
            startAutoRefresh();
        });
        
        // Stop auto-refresh when user leaves page
        window.addEventListener('beforeunload', () => {
            if (autoRefreshInterval) {
                clearInterval(autoRefreshInterval);
            }
        });