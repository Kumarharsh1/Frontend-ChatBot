// Configuration for deployed environment
const CONFIG = {
    API_BASE_URL: window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : 'https://backend-multi9090.vercel.app'  // your deployed backend URL
};

// Dynamic API URL resolver
function getApiBaseUrl() {
    return CONFIG.API_BASE_URL;
}

// Helper function to get full API URL
function getApiUrl(endpoint) {
    return `${getApiBaseUrl()}${endpoint}`;
}

// Export so other files can use it
export { getApiUrl };
