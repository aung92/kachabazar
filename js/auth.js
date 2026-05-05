/* ============================================ */
/* FILE: js/auth.js                             */
/* PURPOSE: Authentication functions            */
/* ============================================ */

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

// Get current user
function getCurrentUser() {
    return {
        name: localStorage.getItem('userName'),
        phone: localStorage.getItem('userPhone'),
        address: localStorage.getItem('userAddress')
    };
}

// Login function
function login(phone, callback) {
    // Demo login - In production, call API
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userPhone', phone);
    if (callback) callback(true);
}

// Logout function
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('userAddress');
    localStorage.removeItem('kacha_cart');
    window.location.href = '/';
}

// Register function
function register(userData, callback) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', userData.name);
    localStorage.setItem('userPhone', userData.phone);
    localStorage.setItem('userAddress', userData.address);
    if (callback) callback(true);
}

// Export functions
window.Auth = {
    isLoggedIn,
    getCurrentUser,
    login,
    logout,
    register
};