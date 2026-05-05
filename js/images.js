/* ============================================ */
/* FILE: js/images.js                           */
/* PURPOSE: Image helper functions - No errors  */
/* Handles image loading, fallbacks, placeholders */
/* AUTHOR: KachaBazar Team                      */
/* VERSION: 1.0.0                               */
/* LAST UPDATED: 2026-05-05                     */
/* ============================================ */

// ============================================
// IMAGE PLACEHOLDER PATHS
// These images don't exist - uses fallback
// ============================================

const IMAGE_PATHS = {
    /* Brand Images */
    LOGO: '/assets/images/logo.svg',
    HERO: '/assets/images/hero-illustration.svg',
    
    /* Offer Images */
    OFFER_1: '/assets/images/offer-1.png',
    OFFER_2: '/assets/images/offer-2.png',
    
    /* App Images */
    APP_MOCKUP: '/assets/images/app-mockup.png',
    
    /* Avatar Images */
    AVATAR_1: '/assets/images/avatar-1.png',
    AVATAR_2: '/assets/images/avatar-2.png',
    AVATAR_3: '/assets/images/avatar-3.png',
    
    /* Payment Method Images */
    BKASH: '/assets/images/bkash.png',
    NAGAD: '/assets/images/nagad.png',
    COD: '/assets/images/cod.png',
    
    /* Placeholder Images */
    PLACEHOLDER_PRODUCT: '/assets/images/placeholder-product.png',
    PLACEHOLDER_AVATAR: '/assets/images/placeholder-avatar.png',
    NO_IMAGE: '/assets/images/no-image.png'
};

// ============================================
// FALLBACK IMAGE (DataURL - doesn't need file)
// Base64 encoded 1x1 transparent pixel + colored background
// ============================================

/* Green gradient placeholder for products */
const PRODUCT_PLACEHOLDER_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%2316a34a'/%3E%3Ctext x='100' y='110' font-size='16' fill='white' text-anchor='middle' font-family='Arial'%3Eতাজা পণ্য%3C/text%3E%3C/svg%3E`;

/* Blue gradient placeholder for avatars */
const AVATAR_PLACEHOLDER_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%233b82f6'/%3E%3Ctext x='50' y='65' font-size='40' fill='white' text-anchor='middle' font-family='Arial'%3E👤%3C/text%3E%3C/svg%3E`;

/* Orange gradient placeholder for offers */
const OFFER_PLACEHOLDER_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23f59e0b'/%3E%3Ctext x='150' y='110' font-size='24' fill='white' text-anchor='middle' font-family='Arial'%3Eবিশেষ অফার%3C/text%3E%3C/svg%3E`;

/* Gray placeholder for general use */
const GRAY_PLACEHOLDER_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%239ca3af'/%3E%3Ctext x='100' y='110' font-size='14' fill='white' text-anchor='middle' font-family='Arial'%3Eচিত্র নাই%3C/text%3E%3C/svg%3E`;

// ============================================
// IMAGE HELPER FUNCTIONS
// ============================================

/**
 * Get safe image URL with fallback
 * @param {string} url - Original image URL
 * @param {string} type - Type of image ('product', 'avatar', 'offer', 'default')
 * @returns {string} Safe URL that will never 404
 */
function getSafeImageUrl(url, type = 'default') {
    /* If URL exists and is not empty, try it */
    if (url && url !== '' && url !== 'null' && url !== 'undefined') {
        return url;
    }
    
    /* Return appropriate placeholder based on type */
    switch(type) {
        case 'product':
            return PRODUCT_PLACEHOLDER_SVG;
        case 'avatar':
            return AVATAR_PLACEHOLDER_SVG;
        case 'offer':
            return OFFER_PLACEHOLDER_SVG;
        default:
            return GRAY_PLACEHOLDER_SVG;
    }
}

/**
 * Handle image loading error - replaces broken images with placeholder
 * @param {HTMLElement} imgElement - The image element that failed to load
 * @param {string} type - Type of image
 */
function handleImageError(imgElement, type = 'product') {
    /* Check if already tried fallback to prevent loops */
    if (imgElement.dataset.fallbackAttempted === 'true') {
        return;
    }
    
    /* Mark that fallback was attempted */
    imgElement.dataset.fallbackAttempted = 'true';
    
    /* Set appropriate placeholder based on type */
    switch(type) {
        case 'product':
            imgElement.src = PRODUCT_PLACEHOLDER_SVG;
            break;
        case 'avatar':
            imgElement.src = AVATAR_PLACEHOLDER_SVG;
            break;
        case 'offer':
            imgElement.src = OFFER_PLACEHOLDER_SVG;
            break;
        default:
            imgElement.src = GRAY_PLACEHOLDER_SVG;
    }
    
    /* Remove error handler to prevent infinite loop */
    imgElement.onerror = null;
}

/**
 * Create an image element with automatic error handling
 * @param {string} src - Image source URL
 * @param {string} alt - Alt text
 * @param {string} type - Type of image
 * @param {string} className - CSS classes
 * @returns {HTMLImageElement} Image element with error handling
 */
function createSafeImage(src, alt, type = 'product', className = '') {
    const img = document.createElement('img');
    img.src = getSafeImageUrl(src, type);
    img.alt = alt || 'কাঁচাবাজার ইমেজ';
    img.className = className;
    img.onerror = () => handleImageError(img, type);
    return img;
}

/**
 * Update image src safely with error handling
 * @param {HTMLElement} imgElement - The image element to update
 * @param {string} newSrc - New image source
 * @param {string} type - Type of image
 */
function updateImageSafe(imgElement, newSrc, type = 'product') {
    if (!imgElement) return;
    
    imgElement.src = getSafeImageUrl(newSrc, type);
    imgElement.onerror = () => handleImageError(imgElement, type);
}

// ============================================
// PRODUCT IMAGE GENERATORS (Dynamic)
// These use SVG - no external files needed
// ============================================

/**
 * Generate dynamic product image based on name and category
 * @param {string} productName - Name of the product
 * @param {string} category - Category ('vegetables', 'fish', 'fruits')
 * @returns {string} Data URL of generated image
 */
function generateProductImage(productName, category = 'vegetables') {
    /* Category color mapping */
    const colors = {
        vegetables: '#16a34a',  /* Green */
        fish: '#3b82f6',        /* Blue */
        fruits: '#f59e0b',      /* Orange */
        default: '#8b5cf6'      /* Purple */
    };
    
    /* Category icon mapping */
    const icons = {
        vegetables: '🥬',
        fish: '🐟',
        fruits: '🍎',
        default: '🛒'
    };
    
    const bgColor = colors[category] || colors.default;
    const icon = icons[category] || icons.default;
    
    /* Shorten product name if too long */
    let displayName = productName || 'তাজা পণ্য';
    if (displayName.length > 15) {
        displayName = displayName.substring(0, 12) + '...';
    }
    
    /* Generate SVG image */
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='200' viewBox='0 0 250 200'%3E%3Crect width='250' height='200' fill='${bgColor.replace('#', '%23')}'/%3E%3Ctext x='125' y='80' font-size='50' fill='white' text-anchor='middle'%3E${encodeURIComponent(icon)}%3C/text%3E%3Ctext x='125' y='130' font-size='16' fill='white' text-anchor='middle'%3E${encodeURIComponent(displayName)}%3C/text%3E%3Ctext x='125' y='155' font-size='12' fill='rgba(255,255,255,0.7)' text-anchor='middle'%3Eকাঁচাবাজার%3C/text%3E%3C/svg%3E`;
}

// ============================================
// LOAD TEST - Check which images exist
// ============================================

/**
 * Test if an image exists
 * @param {string} url - Image URL to test
 * @returns {Promise<boolean>} True if image exists
 */
function imageExists(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

/**
 * Preload critical images
 * @param {Array} urls - Array of image URLs to preload
 * @returns {Promise} Resolves when all images are loaded or failed
 */
function preloadImages(urls) {
    const promises = urls.map(url => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(url);
            img.onerror = () => resolve(null);
            img.src = url;
        });
    });
    return Promise.all(promises);
}

/* Export for use in other files */
window.ImageHelper = {
    getSafeImageUrl,
    handleImageError,
    createSafeImage,
    updateImageSafe,
    generateProductImage,
    imageExists,
    preloadImages,
    PLACEHOLDERS: {
        PRODUCT: PRODUCT_PLACEHOLDER_SVG,
        AVATAR: AVATAR_PLACEHOLDER_SVG,
        OFFER: OFFER_PLACEHOLDER_SVG,
        GRAY: GRAY_PLACEHOLDER_SVG
    }
};