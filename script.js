/**
 * Handles search input field behaviors:
 * - Auto-focuses the input on page load.
 * - Dynamically resizes the input width based on its content.
 * - Executes a DuckDuckGo search in a new tab when Enter is pressed.
 * - Clears and resizes the input after search.
 * - Re-focuses the input when clicking anywhere except links or the input itself.
 */

const searchInput = document.getElementById('search-input');

// Auto-focus the input when page loads
window.addEventListener('load', () => {
    searchInput.focus();
});

// Dynamically resize input based on content
function resizeInput() {
    const content = searchInput.value || '';
    // Minimum width of 1ch for the cursor, plus content length
    searchInput.style.width = Math.max(1, content.length + 1) + 'ch';
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

// Initialize proper width on load
resizeInput();
