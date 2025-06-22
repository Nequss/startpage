/**
 * Handles search input field behaviors with overflow protection and configurable search engines
 */

// Search engine configurations
const searchEngines = {
    google: 'https://www.google.com/search?q=',
    duckduckgo: 'https://duckduckgo.com/?q=',
    bing: 'https://www.bing.com/search?q=',
    startpage: 'https://www.startpage.com/sp/search?query=',
    brave: 'https://search.brave.com/search?q=',
    yandex: 'https://yandex.com/search/?text='
};

const searchInput = document.getElementById('search-input');

// Get current search engine from settings
function getCurrentSearchEngine() {
    const stored = localStorage.getItem('theme-settings');
    if (stored) {
        try {
            const settings = JSON.parse(stored);
            return settings.searchEngine || 'duckduckgo';
        } catch (e) {
            return 'duckduckgo';
        }
    }
    return 'duckduckgo';
}

// Get search URL for current engine
function getSearchUrl(query) {
    const engine = getCurrentSearchEngine();
    const baseUrl = searchEngines[engine] || searchEngines.duckduckgo;
    return baseUrl + encodeURIComponent(query);
}

// Auto-focus the input when page loads
window.addEventListener('load', () => {
    searchInput.focus();
});

// Dynamically resize input based on content with overflow protection
function resizeInput() {
    const content = searchInput.value || '';
    const contentLength = content.length;
    
    // Calculate available space more accurately
    const containerWidth = window.innerWidth;
    const promptWidth = 8; // Approximate width of "> cd ~/" in ch units
    const blinkingWidth = 1; // Width of the blinking cursor
    const padding = 4; // Extra padding for safety
    
    // Calculate max width based on screen size
    let maxAvailableWidth;
    if (containerWidth < 768) {
        // Mobile devices
        maxAvailableWidth = Math.floor((containerWidth * 0.7) / 12); // Smaller char width estimate
    } else if (containerWidth < 1200) {
        // Tablets and small desktops
        maxAvailableWidth = Math.floor((containerWidth * 0.6) / 14);
    } else {
        // Large screens
        maxAvailableWidth = Math.floor((containerWidth * 0.5) / 16);
    }
    
    // Subtract prompt and cursor width
    maxAvailableWidth = Math.max(10, maxAvailableWidth - promptWidth - blinkingWidth - padding);
    
    // Set width with limits
    const targetWidth = Math.max(1, contentLength + 1);
    const finalWidth = Math.min(targetWidth, maxAvailableWidth);
    
    searchInput.style.width = finalWidth + 'ch';
    
    // If content is too long, scroll to end
    if (contentLength > maxAvailableWidth - 2) {
        searchInput.scrollLeft = searchInput.scrollWidth;
    }
}

// Handle input changes to resize the field
searchInput.addEventListener('input', resizeInput);

// Handle search on Enter key with configurable search engine
searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && searchInput.value.trim()) {
        const query = searchInput.value.trim();
        
        // Check if it's a URL (simple check)
        if (query.includes('.') && !query.includes(' ') && 
            (query.startsWith('http') || query.includes('.'))) {
            // Treat as URL
            let url = query;
            if (!query.startsWith('http')) {
                url = 'https://' + query;
            }
            window.open(url, '_blank');
        } else {
            // Treat as search query
            const searchUrl = getSearchUrl(query);
            window.open(searchUrl, '_blank');
        }
        
        searchInput.value = ''; // Clear after search
        resizeInput(); // Reset width after clearing
    }
});

// Re-focus when clicking anywhere on the page (but not on settings or links)
document.addEventListener('click', (e) => {
    // Don't refocus if clicking on:
    // - The search input itself
    // - Any link
    // - Settings modal or its contents
    // - Any button or interactive element
    if (e.target !== searchInput && 
        !e.target.closest('a') && 
        !e.target.closest('.settings-modal') &&
        !e.target.closest('.settings-icon') &&
        !e.target.closest('button') &&
        !e.target.closest('input') &&
        !e.target.closest('select')) {
        
        // Small delay to ensure other click handlers execute first
        setTimeout(() => {
            searchInput.focus();
        }, 10);
    }
});

// Handle window resize to recalculate input width
window.addEventListener('resize', () => {
    // Debounce resize events
    clearTimeout(window.resizeTimeout);
    window.resizeTimeout = setTimeout(() => {
        resizeInput();
    }, 100);
});

// Listen for search engine changes from settings
window.addEventListener('storage', (e) => {
    if (e.key === 'theme-settings') {
        // Search engine might have changed, but no action needed here
        // The getSearchUrl function will automatically use the new setting
    }
});

// Keyboard shortcuts
searchInput.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to clear input
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.value = '';
        resizeInput();
    }
    
    // Escape to clear input
    if (e.key === 'Escape') {
        searchInput.value = '';
        resizeInput();
    }
});

// Initialize proper width on load
document.addEventListener('DOMContentLoaded', () => {
    resizeInput();
});

// Fallback initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', resizeInput);
} else {
    resizeInput();
}

// Export for use in other modules if needed
window.searchUtils = {
    getCurrentSearchEngine,
    getSearchUrl,
    searchEngines
};
