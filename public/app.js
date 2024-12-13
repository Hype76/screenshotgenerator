// DOM Elements
const form = document.getElementById('screenshotForm');
const loadingElement = document.getElementById('loading');
const resultElement = document.getElementById('result');
const errorElement = document.getElementById('error');
const errorMessage = document.getElementById('errorMessage');
const screenshotImg = document.getElementById('screenshot');
const downloadBtn = document.getElementById('downloadBtn');
const newCaptureBtn = document.getElementById('newCaptureBtn');
const historyList = document.getElementById('historyList');

// Constants
const MAX_HISTORY_ITEMS = 6;
const STORAGE_KEY = 'screenshot_history';

// Load history from localStorage
let screenshotHistory = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

// Initialize history display
updateHistoryDisplay();

// Form submission handler
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const url = form.url.value;
    const width = form.width.value;
    const height = form.height.value;

    // Show loading state
    showLoading();
    hideError();
    hideResult();

    try {
        // Validate URL
        if (!isValidUrl(url)) {
            throw new Error('Please enter a valid URL');
        }

        // Make API request
        const response = await fetch(`/api/screenshot?url=${encodeURIComponent(url)}&width=${width}&height=${height}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to capture screenshot');
        }

        // Display the screenshot
        displayScreenshot(data.image, url);

        // Add to history
        addToHistory({
            url,
            timestamp: new Date().toISOString(),
            image: data.image
        });

    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
});

// Download button handler
downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `screenshot-${new Date().getTime()}.png`;
    link.href = screenshotImg.src;
    link.click();
});

// New capture button handler
newCaptureBtn.addEventListener('click', () => {
    hideResult();
    form.reset();
});

// Helper functions
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function showLoading() {
    loadingElement.classList.remove('hidden');
}

function hideLoading() {
    loadingElement.classList.add('hidden');
}

function showError(message) {
    errorElement.classList.remove('hidden');
    errorMessage.textContent = message;
    errorElement.classList.add('error-shake');
    setTimeout(() => {
        errorElement.classList.remove('error-shake');
    }, 500);
}

function hideError() {
    errorElement.classList.add('hidden');
}

function showResult() {
    resultElement.classList.remove('hidden');
}

function hideResult() {
    resultElement.classList.add('hidden');
}

function displayScreenshot(base64Image, url) {
    screenshotImg.src = `data:image/png;base64,${base64Image}`;
    screenshotImg.alt = `Screenshot of ${url}`;
    showResult();
}

function addToHistory(item) {
    // Add new item to the beginning of the array
    screenshotHistory.unshift(item);
    
    // Keep only the latest MAX_HISTORY_ITEMS
    if (screenshotHistory.length > MAX_HISTORY_ITEMS) {
        screenshotHistory = screenshotHistory.slice(0, MAX_HISTORY_ITEMS);
    }
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(screenshotHistory));
    
    // Update the display
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    historyList.innerHTML = '';
    
    screenshotHistory.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item bg-white rounded-lg shadow-md p-4';
        
        const timestamp = new Date(item.timestamp).toLocaleString();
        
        historyItem.innerHTML = `
            <img src="data:image/png;base64,${item.image}" 
                 alt="Screenshot history" 
                 class="w-full h-32 object-cover rounded-lg mb-2 screenshot-preview">
            <div class="text-sm text-gray-600 truncate">${item.url}</div>
            <div class="text-xs text-gray-500">${timestamp}</div>
        `;
        
        historyItem.addEventListener('click', () => {
            form.url.value = item.url;
            displayScreenshot(item.image, item.url);
        });
        
        historyList.appendChild(historyItem);
    });
}

// Error boundary for unhandled errors
window.addEventListener('unhandledrejection', (event) => {
    showError('An unexpected error occurred. Please try again.');
    console.error('Unhandled promise rejection:', event.reason);
}); 