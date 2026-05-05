/* ============================================ */
/* FILE: api.js                                 */
/* PURPOSE: API Configuration & Functions       */
/* Handles all backend communication            */
/* AUTHOR: KachaBazar Team                      */
/* VERSION: 1.0.0                               */
/* LAST UPDATED: 2026-05-05                     */
/* ============================================ */

// ============================================
// API CONFIGURATION
// ============================================

/* 
 * Supabase Configuration
 * Replace these with your actual Supabase credentials
 * These should come from environment variables in production
 */
const SUPABASE_URL = 'YOUR_SUPABASE_URL';        // Your Supabase project URL
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';  // Your Supabase anonymous key

/* Initialize Supabase client for database operations */
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// API OBJECT - Contains all API methods
// ============================================

const API = {
    
    // ========================================
    // PRODUCTS ENDPOINTS
    // ========================================
    
    /**
     * Get products from database
     * @param {string} category - Optional category filter ('vegetables', 'fish', 'fruits')
     * @param {number} limit - Maximum number of products to return (default: 12)
     * @returns {Promise<Array>} Array of product objects
     */
    async getProducts(category = null, limit = 12) {
        /* Start building query */
        let query = supabase
            .from('products')           // From products table
            .select('*')                // Select all columns
            .eq('is_active', true)      // Only active products
            .limit(limit);              // Limit results
        
        /* Add category filter if provided and not 'all' */
        if (category && category !== 'all') {
            query = query.eq('category', category);
        }
        
        /* Execute query */
        const { data, error } = await query;
        
        /* Handle errors */
        if (error) throw error;
        
        /* Return product data */
        return data;
    },
    
    /**
     * Get single product by ID
     * @param {string} id - Product UUID
     * @returns {Promise<Object>} Product object
     */
    async getProductById(id) {
        /* Query for specific product */
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();                  // Expect only one result
        
        if (error) throw error;
        return data;
    },
    
    /**
     * Search products by name
     * @param {string} query - Search query string
     * @returns {Promise<Array>} Array of matching products
     */
    async searchProducts(query) {
        /* Case-insensitive search using ilike */
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .ilike('name', `%${query}%`)    // Contains query string
            .eq('is_active', true)
            .limit(20);                      // Max 20 results
            
        if (error) throw error;
        return data;
    },
    
    // ========================================
    // CATEGORIES ENDPOINTS
    // ========================================
    
    /**
     * Get all active categories
     * @returns {Promise<Array>} Array of category objects
     */
    async getCategories() {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('is_active', true);
            
        if (error) throw error;
        return data;
    },
    
    // ========================================
    // ORDERS ENDPOINTS
    // ========================================
    
    /**
     * Create a new order
     * @param {Object} orderData - Order information
     * @returns {Promise<Object>} Created order object
     */
    async createOrder(orderData) {
        /* Insert new order into database */
        const { data, error } = await supabase
            .from('orders')
            .insert([orderData])
            .select();                   // Return the inserted data
            
        if (error) throw error;
        return data[0];                  // Return first (and only) order
    },
    
    /**
     * Get all orders for a specific customer
     * @param {string} customerId - Customer UUID
     * @returns {Promise<Array>} Array of customer's orders
     */
    async getCustomerOrders(customerId) {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('customer_id', customerId)
            .order('created_at', { ascending: false });  // Newest first
            
        if (error) throw error;
        return data;
    },
    
    /**
     * Update order status
     * @param {string} orderId - Order UUID
     * @param {string} status - New status ('pending', 'confirmed', 'delivered', etc.)
     * @returns {Promise<Object>} Updated order
     */
    async updateOrderStatus(orderId, status) {
        const { data, error } = await supabase
            .from('orders')
            .update({ 
                status: status,
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId)
            .select();
            
        if (error) throw error;
        return data[0];
    },
    
    // ========================================
    // AUTHENTICATION ENDPOINTS
    // ========================================
    
    /**
     * Send OTP to user's phone
     * @param {string} phone - Phone number (+880XXXXXXXXX format)
     * @returns {Promise<Object>} OTP response
     */
    async sendOTP(phone) {
        /* Supabase phone OTP authentication */
        const { data, error } = await supabase.auth.signInWithOtp({
            phone: phone,
        });
        
        if (error) throw error;
        return data;
    },
    
    /**
     * Verify OTP and sign in
     * @param {string} phone - Phone number
     * @param {string} token - 6-digit OTP code
     * @returns {Promise<Object>} Session data
     */
    async verifyOTP(phone, token) {
        const { data, error } = await supabase.auth.verifyOtp({
            phone: phone,
            token: token,
            type: 'sms'
        });
        
        if (error) throw error;
        return data;
    },
    
    /**
     * Get currently logged in user
     * @returns {Promise<Object|null>} User object or null
     */
    async getCurrentUser() {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },
    
    /**
     * Sign out current user
     * @returns {Promise<void>}
     */
    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },
    
    // ========================================
    // PICKUP LOCATIONS ENDPOINTS
    // ========================================
    
    /**
     * Get all active pickup locations
     * @returns {Promise<Array>} Array of pickup locations
     */
    async getPickupLocations() {
        const { data, error } = await supabase
            .from('pickup_locations')
            .select('*')
            .eq('is_active', true);
            
        if (error) throw error;
        return data;
    },
    
    /**
     * Get pickup locations within radius of coordinates
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     * @param {number} radius - Search radius in km (default: 5)
     * @returns {Promise<Array>} Array of locations with distances
     */
    async getNearbyPickupLocations(lat, lng, radius = 5) {
        /* Get all active locations first */
        const { data, error } = await supabase
            .from('pickup_locations')
            .select('*')
            .eq('is_active', true);
            
        if (error) throw error;
        
        /* Calculate distance for each location */
        const locationsWithDistance = data.map(loc => ({
            ...loc,
            distance: this.calculateDistance(lat, lng, loc.latitude, loc.longitude)
        }));
        
        /* Filter by radius and sort by distance */
        return locationsWithDistance
            .filter(loc => loc.distance <= radius)
            .sort((a, b) => a.distance - b.distance);
    },
    
    // ========================================
    // OFFERS ENDPOINTS
    // ========================================
    
    /**
     * Get all active offers
     * @returns {Promise<Array>} Array of active offers
     */
    async getActiveOffers() {
        const { data, error } = await supabase
            .from('offers')
            .select('*')
            .eq('is_active', true)
            .gte('valid_until', new Date().toISOString());  // Not expired
            
        if (error) throw error;
        return data;
    },
    
    // ========================================
    // REVIEWS ENDPOINTS
    // ========================================
    
    /**
     * Get reviews for a product
     * @param {string} productId - Product UUID
     * @returns {Promise<Array>} Array of reviews with customer info
     */
    async getProductReviews(productId) {
        const { data, error } = await supabase
            .from('reviews')
            .select('*, customers(name, avatar_url)')  // Join with customers table
            .eq('product_id', productId)
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        return data;
    },
    
    /**
     * Add a review for a product
     * @param {Object} reviewData - Review information
     * @returns {Promise<Object>} Created review
     */
    async addReview(reviewData) {
        const { data, error } = await supabase
            .from('reviews')
            .insert([reviewData])
            .select();
            
        if (error) throw error;
        return data[0];
    },
    
    // ========================================
    // IMAGE UPLOAD
    // ========================================
    
    /**
     * Upload an image to Supabase Storage
     * @param {File} file - Image file to upload
     * @param {string} bucket - Storage bucket name (default: 'product-images')
     * @returns {Promise<string>} Public URL of uploaded image
     */
    async uploadImage(file, bucket = 'product-images') {
        /* Generate unique filename */
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2)}.${fileExt}`;
        const filePath = `products/${fileName}`;
        
        /* Upload to Supabase Storage */
        const { error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file);
        
        if (error) throw error;
        
        /* Get public URL of uploaded image */
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);
        
        return publicUrl;
    },
    
    // ========================================
    // HELPER FUNCTIONS
    // ========================================
    
    /**
     * Calculate distance between two coordinates (Haversine formula)
     * @param {number} lat1 - First latitude
     * @param {number} lon1 - First longitude
     * @param {number} lat2 - Second latitude
     * @param {number} lon2 - Second longitude
     * @returns {number} Distance in kilometers
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        /* Earth's radius in kilometers */
        const R = 6371;
        
        /* Convert to radians */
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        
        /* Haversine formula */
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        
        /* Return distance in km */
        return R * c;
    }
};

/* ============================================ */
/* EXPORT API OBJECT                            */
/* Make API available globally in browser       */
/* ============================================ */
window.API = API;