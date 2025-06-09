/**
 * Handles search input field behaviors with overflow protection
 */

const searchInput = document.getElementById('search-input');

// Auto-focus the input when page loads
window.addEventListener('load', () => {
    searchInput.focus();
});

// Dynamically resize input based on content with overflow protection
function resizeInput() {
    const content = searchInput.value || '';
    const contentLength = content.length;
    
    // Calculate available space
    const containerWidth = window.innerWidth;
    const promptWidth = 8; // Approximate width of "> cd ~/" in ch units
    const maxAvailableWidth = Math.floor((containerWidth * 0.8) / 20); // Conservative estimate
    
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

// Handle search on Enter key
searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && searchInput.value.trim()) {
        const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(searchInput.value)}`;
        window.open(searchUrl, '_blank');
        searchInput.value = ''; // Clear after search
        resizeInput(); // Reset width after clearing
    }
});

// Re-focus when clicking anywhere on the page
document.addEventListener('click', (e) => {
    if (e.target !== searchInput && !e.target.closest('a')) {
        searchInput.focus();
    }
});

// Handle window resize to recalculate input width
window.addEventListener('resize', () => {
    resizeInput();
});

// Initialize proper width on load
resizeInput();
