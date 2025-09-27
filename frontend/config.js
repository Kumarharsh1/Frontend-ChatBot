// Configuration for deployed environment
const CONFIG = {
    API_BASE_URL: window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : 'https://multi-ai-backend.onrender.com' // Replace with your actual Render URL
};

// Dynamic API URL resolver
function getApiBaseUrl() {
    return CONFIG.API_BASE_URL;
}

// Helper function to get full API URL
function getApiUrl(endpoint) {
    return `${getApiBaseUrl()}${endpoint}`;
}