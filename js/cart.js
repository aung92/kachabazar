// ============================================
// CART MANAGEMENT SYSTEM
// ============================================

let cart = [];

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('kachaBazarCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    updateCartUI();
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('kachaBazarCart', JSON.stringify(cart));
    updateCartUI();
}

// Add item to cart
function addToCart(product, quantity = 1) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            image: product.image_url,
            unit: product.unit
        });
    }
    
    saveCart();
    showNotification(`${product.name} কার্টে যোগ হয়েছে`, 'success');
    openCartSidebar();
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    showNotification('পণ্য সরানো হয়েছে', 'info');
}

// Update item quantity
function updateQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            saveCart();
        }
    }
}

// Get cart total
function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Get cart item count
function getCartCount() {
    return cart.reduce((count, item) => count + item.quantity, 0);
}

// Update cart UI
function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const cartFooter = document.getElementById('cartFooter');
    
    // Update badge
    const count = getCartCount();
    if (cartCount) {
        cartCount.textContent = count;
        cartCount.style.display = count > 0 ? 'flex' : 'none';
    }
    
    // Update cart sidebar content
    if (cartItems) {
        if (cart.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-basket"></i>
                    <p>আপনার কার্ট খালি</p>
                    <button class="btn-primary" id="continueShopping">শপিং চালিয়ে যান</button>
                </div>
            `;
            if (cartFooter) cartFooter.style.display = 'none';
            
            const continueBtn = document.getElementById('continueShopping');
            if (continueBtn) {
                continueBtn.addEventListener('click', () => {
                    closeCartSidebar();
                });
            }
        } else {
            cartItems.innerHTML = cart.map(item => `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${item.image || '/assets/images/placeholder.png'}" alt="${item.name}">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>৳${item.price} / ${item.unit}</p>
                        <div class="cart-item-actions">
                            <button class="qty-btn minus" data-id="${item.id}">-</button>
                            <span class="qty">${item.quantity}</span>
                            <button class="qty-btn plus" data-id="${item.id}">+</button>
                            <button class="remove-btn" data-id="${item.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="cart-item-total">
                        ৳${(item.price * item.quantity).toFixed(2)}
                    </div>
                </div>
            `).join('');
            
            if (cartFooter) cartFooter.style.display = 'block';
            if (cartTotal) cartTotal.textContent = `৳${getCartTotal().toFixed(2)}`;
            
            // Add event listeners for cart actions
            document.querySelectorAll('.qty-btn.minus').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.dataset.id;
                    const item = cart.find(i => i.id === id);
                    if (item) {
                        updateQuantity(id, item.quantity - 1);
                    }
                });
            });
            
            document.querySelectorAll('.qty-btn.plus').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.dataset.id;
                    const item = cart.find(i => i.id === id);
                    if (item) {
                        updateQuantity(id, item.quantity + 1);
                    }
                });
            });
            
            document.querySelectorAll('.remove-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.dataset.id;
                    removeFromCart(id);
                });
            });
        }
    }
}

// Cart sidebar functions
function openCartSidebar() {
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar) {
        cartSidebar.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeCartSidebar() {
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar) {
        cartSidebar.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Checkout
function checkout() {
    if (cart.length === 0) {
        showNotification('কার্ট খালি! দয়া করে পণ্য যোগ করুন', 'error');
        return;
    }
    
    // Save cart to session storage for checkout page
    sessionStorage.setItem('checkoutCart', JSON.stringify(cart));
    window.location.href = '/checkout.html';
}

// Initialize cart
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    
    // Cart button listeners
    const cartBtn = document.getElementById('cartBtn');
    const closeCart = document.getElementById('closeCart');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (cartBtn) {
        cartBtn.addEventListener('click', openCartSidebar);
    }
    
    if (closeCart) {
        closeCart.addEventListener('click', closeCartSidebar);
    }
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', checkout);
    }
    
    // Close cart on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCartSidebar();
        }
    });
});

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: white;
        padding: 12px 24px;
        border-radius: 50px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    }
    
    .notification-success {
        background: #16a34a;
        color: white;
    }
    
    .notification-info {
        background: #3b82f6;
        color: white;
    }
    
    .notification-error {
        background: #ef4444;
        color: white;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .fade-out {
        animation: fadeOut 0.3s ease forwards;
    }
    
    @keyframes fadeOut {
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
    
    .cart-item {
        display: flex;
        gap: 15px;
        padding: 15px;
        border-bottom: 1px solid #e5e7eb;
    }
    
    .cart-item img {
        width: 60px;
        height: 60px;
        object-fit: cover;
        border-radius: 8px;
    }
    
    .cart-item-info {
        flex: 1;
    }
    
    .cart-item-info h4 {
        font-size: 0.9rem;
        margin-bottom: 5px;
    }
    
    .cart-item-info p {
        font-size: 0.8rem;
        color: #16a34a;
        font-weight: bold;
    }
    
    .cart-item-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 8px;
    }
    
    .qty-btn {
        width: 25px;
        height: 25px;
        border: 1px solid #e5e7eb;
        background: white;
        border-radius: 4px;
        cursor: pointer;
    }
    
    .qty {
        min-width: 30px;
        text-align: center;
    }
    
    .remove-btn {
        background: none;
        border: none;
        color: #ef4444;
        cursor: pointer;
        margin-left: 10px;
    }
    
    .cart-item-total {
        font-weight: bold;
        color: #16a34a;
    }
`;
document.head.appendChild(style);

// Export cart functions for global use
window.addToCart = addToCart;
window.openCartSidebar = openCartSidebar;