/**
 * Search Input Handler - Performance Optimized
 */

class SearchHandler {
    constructor() {
        this.searchEngines = {
            google: 'https://www.google.com/search?q=',
            duckduckgo: 'https://duckduckgo.com/?q=',
            bing: 'https://www.bing.com/search?q=',
            startpage: 'https://www.startpage.com/sp/search?query=',
            brave: 'https://search.brave.com/search?q=',
            yandex: 'https://yandex.com/search/?text='
        };

        this.searchInput = document.getElementById('search-input');
        this.resizeTimeout = null;
        this.focusTimeout = null;
        
        this.init();
    }

    init() {
        if (!this.searchInput) {
            console.error('Search input element not found');
            return;
        }

        this.setupEventListeners();
        this.autoFocus();
        this.resizeInput();
    }

    getCurrentSearchEngine() {
        try {
            const stored = localStorage.getItem('theme-settings');
            if (stored) {
                const settings = JSON.parse(stored);
                return settings.searchEngine || 'duckduckgo';
            }
        } catch (e) {
            console.error('Error loading search engine setting:', e);
        }
        return 'duckduckgo';
    }

    getSearchUrl(query) {
        const engine = this.getCurrentSearchEngine();
        const baseUrl = this.searchEngines[engine] || this.searchEngines.duckduckgo;
        return baseUrl + encodeURIComponent(query);
    }

    autoFocus() {
        // Auto-focus with delay to ensure page is ready
        setTimeout(() => {
            if (this.searchInput && document.activeElement !== this.searchInput) {
                this.searchInput.focus();
            }
        }, 100);
    }

    calculateMaxWidth() {
        const containerWidth = window.innerWidth;
        const promptWidth = 8; // Approximate width of "> cd ~/" in ch units
        const padding = 4; // Extra padding for safety
        
        let maxAvailableWidth;
        if (containerWidth < 768) {
            maxAvailableWidth = Math.floor((containerWidth * 0.7) / 12);
        } else if (containerWidth < 1200) {
            maxAvailableWidth = Math.floor((containerWidth * 0.6) / 14);
        } else {
            maxAvailableWidth = Math.floor((containerWidth * 0.5) / 16);
        }
        
        return Math.max(10, maxAvailableWidth - promptWidth - padding);
    }

    resizeInput() {
        if (!this.searchInput) return;

        const content = this.searchInput.value || '';
        const contentLength = content.length;
        const maxAvailableWidth = this.calculateMaxWidth();
        
        const targetWidth = Math.max(1, contentLength + 1);
        const finalWidth = Math.min(targetWidth, maxAvailableWidth);
        
        this.searchInput.style.width = finalWidth + 'ch';
        
        // Scroll to end if content overflows
        if (contentLength > maxAvailableWidth - 2) {
            this.searchInput.scrollLeft = this.searchInput.scrollWidth;
        }
    }

    handleSearch(query) {
        const trimmedQuery = query.trim();
        if (!trimmedQuery) return;

        // Simple URL detection
        if (this.isUrl(trimmedQuery)) {
            let url = trimmedQuery;
            if (!trimmedQuery.startsWith('http')) {
                url = 'https://' + trimmedQuery;
            }
            window.open(url, '_blank');
        } else {
            const searchUrl = this.getSearchUrl(trimmedQuery);
            window.open(searchUrl, '_blank');
        }
        
        this.searchInput.value = '';
        this.resizeInput();
    }

    isUrl(text) {
        return text.includes('.') && 
               !text.includes(' ') && 
               (text.startsWith('http') || 
                text.match(/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/));
    }

    setupEventListeners() {
        // Input changes
        this.searchInput.addEventListener('input', () => {
            this.resizeInput();
        });

        // Enter key for search
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this.searchInput.value.trim()) {
                this.handleSearch(this.searchInput.value);
            }
            
            // Keyboard shortcuts
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.searchInput.value = '';
                this.resizeInput();
            }
            
            if (e.key === 'Escape') {
                this.searchInput.value = '';
                this.resizeInput();
            }
        });

        // Window resize with debouncing
        window.addEventListener('resize', () => {
            if (this.resizeTimeout) {
                clearTimeout(this.resizeTimeout);
            }
            
            this.resizeTimeout = setTimeout(() => {
                this.resizeInput();
            }, 100);
        });

        // Re-focus on page clicks (excluding interactive elements)
        document.addEventListener('click', (e) => {
            const shouldRefocus = !e.target.closest('a, button, input, select, .settings-modal, .settings-icon');
            
            if (shouldRefocus && e.target !== this.searchInput) {
                if (this.focusTimeout) {
                    clearTimeout(this.focusTimeout);
                }
                
                this.focusTimeout = setTimeout(() => {
                    if (document.activeElement !== this.searchInput) {
                        this.searchInput.focus();
                    }
                }, 10);
            }
        });

        // Listen for search engine changes
        window.addEventListener('storage', (e) => {
            if (e.key === 'theme-settings') {
                // Search engine setting might have changed
                // No additional action needed as getSearchUrl reads from localStorage
            }
        });

        // Page load focus
        window.addEventListener('load', () => {
            this.autoFocus();
        });
    }

    // Cleanup method for memory management
    destroy() {
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
        
        if (this.focusTimeout) {
            clearTimeout(this.focusTimeout);
        }
    }
}

// Initialize search handler
let searchHandler = null;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        searchHandler = new SearchHandler();
        window.searchHandler = searchHandler;
    });
} else {
    searchHandler = new SearchHandler();
    window.searchHandler = searchHandler;
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (searchHandler) {
        searchHandler.destroy();
    }
});

// Export utilities for backward compatibility
window.searchUtils = {
    getCurrentSearchEngine: () => searchHandler?.getCurrentSearchEngine() || 'duckduckgo',
    getSearchUrl: (query) => searchHandler?.getSearchUrl(query) || `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
    searchEngines: {
        google: 'https://www.google.com/search?q=',
        duckduckgo: 'https://duckduckgo.com/?q=',
        bing: 'https://www.bing.com/search?q=',
        startpage: 'https://www.startpage.com/sp/search?query=',
        brave: 'https://search.brave.com/search?q=',
        yandex: 'https://yandex.com/search/?text='
    }
};
