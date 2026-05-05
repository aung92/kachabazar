/* ============================================ */
/* FILE: js/main.js                             */
/* PURPOSE: Main JavaScript for KachaBazar      */
/* Based on index.html functionality            */
/* ============================================ */

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    
    // ============================================
    // INITIALIZE AOS
    // ============================================
    AOS.init({
        duration: 1000,
        once: true,
        offset: 100
    });
    
    // ============================================
    // HEADER SCROLL EFFECT
    // ============================================
    const header = document.getElementById('header');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // ============================================
    // MOBILE MENU TOGGLE
    // ============================================
    const mobileToggle = document.getElementById('mobileToggle');
    const mobileNav = document.getElementById('mobileNav');
    
    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener('click', function() {
            mobileNav.classList.toggle('active');
            document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
        });
        
        // Close on link click
        document.querySelectorAll('.mobile-nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }
    
    // ============================================
    // SEARCH FUNCTIONALITY
    // ============================================
    const searchBtn = document.getElementById('searchBtn');
    const searchOverlay = document.getElementById('searchOverlay');
    const closeSearch = document.getElementById('closeSearch');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const voiceSearchBtn = document.getElementById('voiceSearchBtn');
    
    if (searchBtn && searchOverlay) {
        searchBtn.addEventListener('click', () => {
            searchOverlay.classList.add('active');
            if (searchInput) searchInput.focus();
            document.body.style.overflow = 'hidden';
        });
        
        const closeSearchOverlay = () => {
            searchOverlay.classList.remove('active');
            if (searchResults) searchResults.innerHTML = '';
            if (searchInput) searchInput.value = '';
            document.body.style.overflow = '';
        };
        
        if (closeSearch) closeSearch.addEventListener('click', closeSearchOverlay);
        searchOverlay.addEventListener('click', (e) => {
            if (e.target === searchOverlay) closeSearchOverlay();
        });
    }
    
    // Live search simulation
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.trim();
            if (searchResults) {
                if (query.length < 2) {
                    searchResults.innerHTML = '';
                    return;
                }
                searchResults.innerHTML = `
                    <div class="text-center py-4">
                        <p class="font-hind text-gray-500">খুঁজে পাওয়া গেছে: "${query}"</p>
                        <p class="text-sm text-gray-400 mt-2">পণ্য লোড হচ্ছে...</p>
                    </div>
                `;
            }
        });
    }
    
    // Voice search
    if (voiceSearchBtn && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'bn-BD';
        recognition.continuous = false;
        
        voiceSearchBtn.addEventListener('click', () => {
            recognition.start();
            voiceSearchBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
        });
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if (searchInput) {
                searchInput.value = transcript;
                searchInput.dispatchEvent(new Event('input'));
            }
            voiceSearchBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        };
        
        recognition.onerror = () => {
            voiceSearchBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        };
        
        recognition.onend = () => {
            voiceSearchBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        };
    } else if (voiceSearchBtn) {
        voiceSearchBtn.style.display = 'none';
    }
    
    // ============================================
    // TRENDING SEARCH TAGS
    // ============================================
    document.querySelectorAll('.trending-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = tag.textContent;
                searchInput.dispatchEvent(new Event('input'));
            }
        });
    });
    
    // ============================================
    // TAB BUTTONS
    // ============================================
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.dataset.tab;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            switchProductsTab(tab);
        });
    });
    
    function switchProductsTab(tab) {
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) return;
        
        // Sample product data for each tab
        const products = {
            vegetables: [
                { name: 'পটল', price: '৪০', icon: '🥬', color: '#16a34a' },
                { name: 'বেগুন', price: '৬০', icon: '🍆', color: '#8b5cf6' },
                { name: 'করলা', price: '৫০', icon: '🥒', color: '#f59e0b' },
                { name: 'ঢেঁড়স', price: '৪৫', icon: '🌿', color: '#16a34a' }
            ],
            fish: [
                { name: 'ইলিশ', price: '১২০০', icon: '🐟', color: '#3b82f6' },
                { name: 'লইট্টা', price: '৪০০', icon: '🐠', color: '#3b82f6' },
                { name: 'কোরাল', price: '৮০০', icon: '🐟', color: '#3b82f6' },
                { name: 'রূপচাঁদা', price: '৬০০', icon: '🐠', color: '#3b82f6' }
            ],
            fruits: [
                { name: 'আম', price: '১২০', icon: '🥭', color: '#f59e0b' },
                { name: 'কাঁঠাল', price: '৮০', icon: '🍈', color: '#f59e0b' },
                { name: 'লিচু', price: '১৫০', icon: '🍒', color: '#f59e0b' },
                { name: 'জাম', price: '১০০', icon: '🍇', color: '#8b5cf6' }
            ]
        };
        
        const currentProducts = products[tab] || products.vegetables;
        
        productsGrid.innerHTML = currentProducts.map(product => `
            <div class="product-card" data-aos="fade-up">
                <div class="product-image">
                    <svg width="100%" height="200" viewBox="0 0 200 200">
                        <rect width="200" height="200" fill="${product.color}" rx="10"/>
                        <text x="100" y="110" font-size="70" fill="white" text-anchor="middle">${product.icon}</text>
                        <text x="100" y="155" font-size="18" fill="white" text-anchor="middle" font-family="Hind Siliguri, sans-serif" font-weight="bold">${product.name}</text>
                    </svg>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">৳${product.price} <span class="text-sm font-normal text-gray-500">/ কেজি</span></p>
                    <button class="add-to-cart">কার্টে যোগ করুন</button>
                </div>
            </div>
        `).join('');
        
        // Re-attach cart handlers
        attachCartHandlers();
    }
    
    // ============================================
    // CATEGORY CARDS
    // ============================================
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            if (category === 'custom') {
                showNotification('কাস্টম অর্ডার ফিচার শীঘ্রই আসছে!', 'info');
            } else {
                const tabBtn = document.querySelector(`.tab-btn[data-tab="${category}"]`);
                if (tabBtn) {
                    tabBtn.click();
                    document.getElementById('featured-products')?.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
    
    // ============================================
    // BUTTON HANDLERS
    // ============================================
    const orderNowBtn = document.getElementById('orderNowBtn');
    const howItWorksBtn = document.getElementById('howItWorksBtn');
    const viewAllBtn = document.getElementById('viewAllBtn');
    const continueShopping = document.getElementById('continueShopping');
    
    if (orderNowBtn) {
        orderNowBtn.addEventListener('click', () => {
            document.getElementById('featured-products')?.scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    if (howItWorksBtn) {
        howItWorksBtn.addEventListener('click', () => {
            document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', () => {
            showNotification('সকল পণ্য দেখার ফিচার শীঘ্রই আসছে!', 'info');
        });
    }
    
    if (continueShopping) {
        continueShopping.addEventListener('click', () => {
            closeCartSidebar();
        });
    }
    
    // ============================================
    // CART FUNCTIONALITY
    // ============================================
    let cart = [];
    const cartBtn = document.getElementById('cartBtn');
    const cartSidebar = document.getElementById('cartSidebar');
    const closeCart = document.getElementById('closeCart');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const cartFooter = document.getElementById('cartFooter');
    const cartCount = document.getElementById('cartCount');
    
    // Load cart from localStorage
    function loadCart() {
        const saved = localStorage.getItem('kachabazar_cart');
        if (saved) {
            cart = JSON.parse(saved);
            updateCartUI();
        }
    }
    
    // Save cart to localStorage
    function saveCart() {
        localStorage.setItem('kachabazar_cart', JSON.stringify(cart));
        updateCartUI();
    }
    
    // Add to cart
    function addToCart(product) {
        const existing = cart.find(item => item.name === product.name);
        if (existing) {
            existing.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        saveCart();
        showNotification(`${product.name} কার্টে যোগ হয়েছে`, 'success');
    }
    
    // Remove from cart
    function removeFromCart(index) {
        cart.splice(index, 1);
        saveCart();
        showNotification('পণ্য সরানো হয়েছে', 'info');
    }
    
    // Update quantity
    function updateQuantity(index, delta) {
        const item = cart[index];
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) {
                removeFromCart(index);
            } else {
                saveCart();
            }
        }
    }
    
    // Get cart total
    function getCartTotal() {
        return cart.reduce((total, item) => total + (parseInt(item.price) * item.quantity), 0);
    }
    
    // Get cart count
    function getCartCount() {
        return cart.reduce((count, item) => count + item.quantity, 0);
    }
    
    // Update cart UI
    function updateCartUI() {
        const count = getCartCount();
        if (cartCount) {
            cartCount.textContent = count;
            cartCount.style.display = count > 0 ? 'flex' : 'none';
        }
        
        if (cartItems) {
            if (cart.length === 0) {
                cartItems.innerHTML = `
                    <div class="empty-cart text-center py-8">
                        <i class="fas fa-shopping-basket text-5xl text-gray-400 mb-3"></i>
                        <p class="font-hind text-gray-500">আপনার কার্ট খালি</p>
                        <button class="btn-primary mt-3 font-hind text-sm" id="continueShoppingBtn">শপিং চালিয়ে যান</button>
                    </div>
                `;
                if (cartFooter) cartFooter.classList.add('hidden');
                const continueBtn = document.getElementById('continueShoppingBtn');
                if (continueBtn) {
                    continueBtn.addEventListener('click', closeCartSidebar);
                }
            } else {
                cartItems.innerHTML = cart.map((item, idx) => `
                    <div class="cart-item flex gap-3 p-3 border-b items-center">
                        <svg width="50" height="50" viewBox="0 0 50 50">
                            <rect width="50" height="50" fill="#16a34a" rx="8"/>
                            <text x="25" y="32" font-size="22" fill="white" text-anchor="middle">${item.icon || '🥬'}</text>
                        </svg>
                        <div class="flex-1">
                            <h4 class="font-semibold">${item.name}</h4>
                            <p class="text-green-600 font-bold">৳${item.price}/কেজি</p>
                        </div>
                        <div class="flex items-center gap-2">
                            <button class="qty-minus w-8 h-8 border rounded" data-index="${idx}">-</button>
                            <span class="w-8 text-center">${item.quantity}</span>
                            <button class="qty-plus w-8 h-8 border rounded" data-index="${idx}">+</button>
                            <button class="remove-item text-red-500 ml-2" data-index="${idx}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                        <div class="w-20 text-right font-bold text-green-600">
                            ৳${parseInt(item.price) * item.quantity}
                        </div>
                    </div>
                `).join('');
                
                if (cartFooter) cartFooter.classList.remove('hidden');
                if (cartTotal) cartTotal.textContent = `৳${getCartTotal()}`;
                
                // Attach event handlers
                document.querySelectorAll('.qty-minus').forEach(btn => {
                    btn.addEventListener('click', () => updateQuantity(parseInt(btn.dataset.index), -1));
                });
                document.querySelectorAll('.qty-plus').forEach(btn => {
                    btn.addEventListener('click', () => updateQuantity(parseInt(btn.dataset.index), 1));
                });
                document.querySelectorAll('.remove-item').forEach(btn => {
                    btn.addEventListener('click', () => removeFromCart(parseInt(btn.dataset.index)));
                });
            }
        }
    }
    
    // Open cart sidebar
    function openCartSidebar() {
        if (cartSidebar) {
            cartSidebar.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    // Close cart sidebar
    function closeCartSidebar() {
        if (cartSidebar) {
            cartSidebar.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    // Cart button click
    if (cartBtn) {
        cartBtn.addEventListener('click', openCartSidebar);
    }
    
    if (closeCart) {
        closeCart.addEventListener('click', closeCartSidebar);
    }
    
    // Attach cart handlers to add-to-cart buttons
    function attachCartHandlers() {
        document.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.removeEventListener('click', handleAddToCart);
            btn.addEventListener('click', handleAddToCart);
        });
    }
    
    function handleAddToCart(e) {
        e.stopPropagation();
        const card = this.closest('.product-card');
        if (card) {
            const name = card.querySelector('.product-name')?.innerText || 'পণ্য';
            const priceText = card.querySelector('.product-price')?.innerText || '৳০';
            const price = priceText.replace('৳', '').replace('/কেজি', '').trim();
            const icon = card.querySelector('.product-image svg text')?.textContent || '🥬';
            addToCart({ name, price, icon });
        }
    }
    
    // Checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showNotification('কার্ট খালি! দয়া করে পণ্য যোগ করুন', 'error');
            } else {
                showNotification('চেকআউট পেজ শীঘ্রই আসছে!', 'info');
            }
        });
    }
    
    // Close cart on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCartSidebar();
        }
    });
    
    // ============================================
    // NOTIFICATION FUNCTION
    // ============================================
    function showNotification(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg text-white shadow-lg transition-all duration-300 ${
            type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        } animate-slide-in`;
        toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'} mr-2"></i>${message}`;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    // ============================================
    // BACK TO TOP
    // ============================================
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            backToTop.classList.toggle('active', window.scrollY > 300);
        });
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // ============================================
    // PWA INSTALL
    // ============================================
    let deferredPrompt;
    const installBtn = document.getElementById('installAppBtn');
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (installBtn) {
            installBtn.style.display = 'flex';
        }
    });
    
    if (installBtn) {
        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    installBtn.style.display = 'none';
                }
                deferredPrompt = null;
            }
        });
    }
    
    // ============================================
    // INITIALIZE
    // ============================================
    loadCart();
    attachCartHandlers();
    switchProductsTab('vegetables');
    
    // Initialize Swiper
    if (typeof Swiper !== 'undefined') {
        new Swiper('.testimonials-slider', {
            loop: true,
            autoplay: { delay: 5000, disableOnInteraction: false },
            pagination: { el: '.swiper-pagination', clickable: true },
            breakpoints: {
                640: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 }
            }
        });
    }
    
    console.log('✅ কাঁচাবাজার ওয়েবসাইট লোড হয়েছে!');
});

// Add animation CSS
const style = document.createElement('style');
style.textContent = `
    .animate-slide-in {
        animation: slideInRight 0.3s ease forwards;
    }
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
`;
document.head.appendChild(style);