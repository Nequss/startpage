/**
 * Settings Management System
 * Handles the settings modal, bookmark customization, molecules, and themes
 */

class SettingsManager {
    constructor() {
        this.defaultData = {
            categories: [
                {
                    title: "~/util",
                    links: [
                        { text: "weather", url: "https://www.timeanddate.com/worldclock/poland/warsaw" },
                        { text: "sheets", url: "https://workspace.google.com/products/sheets/" },
                        { text: "notes", url: "https://hackmd.io/login" },
                        { text: "translate", url: "https://translate.google.com/" }
                    ]
                },
                {
                    title: "~/mail",
                    links: [
                        { text: "gmail", url: "https://gmail.com" },
                        { text: "protonmail", url: "https://mail.proton.me/" },
                        { text: "tempmail", url: "https://temp-mail.org/" },
                        { text: "tutanota", url: "https://tutanota.com/" }
                    ]
                },
                {
                    title: "~/ai",
                    links: [
                        { text: "perplexity", url: "https://www.perplexity.ai/" },
                        { text: "chatgpt", url: "https://chat.openai.com/" },
                        { text: "claude", url: "https://claude.ai/" },
                        { text: "gemini", url: "https://gemini.google.com/" }
                    ]
                },
                {
                    title: "~/music",
                    links: [
                        { text: "soundcloud", url: "https://soundcloud.com/" },
                        { text: "yt music", url: "https://music.youtube.com/" },
                        { text: "spotify", url: "https://open.spotify.com/" },
                        { text: "bandcamp", url: "https://bandcamp.com/" }
                    ]
                }
            ]
        };

        this.defaultThemeSettings = {
            theme: 'default',
            showImage: true,
            searchEngine: 'duckduckgo'
        };
        
        this.init();
    }

    init() {
        this.loadSettings();
        this.loadThemeSettings();
        this.renderBookmarks();
        this.setupEventListeners();
        this.applyTheme();
        this.toggleImage();
        
        setTimeout(() => {
            this.setupMoleculeControls();
            this.setupThemeControls();
        }, 100);
    }

    loadThemeSettings() {
        const stored = localStorage.getItem('theme-settings');
        if (stored) {
            try {
                this.themeSettings = { ...this.defaultThemeSettings, ...JSON.parse(stored) };
            } catch (e) {
                console.error('Error loading theme settings:', e);
                this.themeSettings = { ...this.defaultThemeSettings };
            }
        } else {
            this.themeSettings = { ...this.defaultThemeSettings };
        }
    }

    saveThemeSettings() {
        localStorage.setItem('theme-settings', JSON.stringify(this.themeSettings));
    }

    // FIXED: Improved theme application with better molecule color updates
    applyTheme() {
        document.body.setAttribute('data-theme', this.themeSettings.theme);
        document.documentElement.setAttribute('data-theme', this.themeSettings.theme);
        
        // Force style recalculation
        getComputedStyle(document.documentElement).getPropertyValue('--molecule-bg');
        
        // Update molecule colors with proper delay
        if (window.molecularBG) {
            setTimeout(() => {
                window.molecularBG.updateThemeColors();
            }, 250);
        }
    }

    toggleImage() {
        const leftContainer = document.getElementById('left-container');
        const mainContainer = document.getElementById('main-container');
        
        if (this.themeSettings.showImage) {
            leftContainer.classList.remove('hidden');
            mainContainer.classList.remove('no-image');
        } else {
            leftContainer.classList.add('hidden');
            mainContainer.classList.add('no-image');
        }
    }

    // FIXED: Settings panel opening issue
    setupEventListeners() {
        // Settings icon click - FIXED to handle SVG interference
        const settingsIcon = document.getElementById('settings-icon');
        if (settingsIcon) {
            settingsIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openSettings();
            });
        }

        // Close settings
        const closeBtn = document.getElementById('close-settings');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeSettings();
            });
        }

        // Modal backdrop click
        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === e.currentTarget) {
                    this.closeSettings();
                }
            });
        }

        // Save settings
        const saveBtn = document.getElementById('save-settings');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveSettings();
            });
        }

        // Reset settings
        const resetBtn = document.getElementById('reset-settings');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset all settings to default?')) {
                    this.resetSettings();
                }
            });
        }

        // Add category
        const addCategoryBtn = document.getElementById('add-category');
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', () => {
                this.addCategory();
            });
        }

        // ESC key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('settings-modal').classList.contains('active')) {
                this.closeSettings();
            }
        });
    }

    // FIXED: Multiple selection issue for themes and search engines
    setupThemeControls() {
        // Image toggle
        const showImageToggle = document.getElementById('show-image');
        if (showImageToggle) {
            showImageToggle.checked = this.themeSettings.showImage;
            
            showImageToggle.addEventListener('change', (e) => {
                this.themeSettings.showImage = e.target.checked;
                this.saveThemeSettings();
                this.toggleImage();
            });
        }

        // FIXED: Theme selection - prevent multiple selections
        document.querySelectorAll('.theme-option').forEach(option => {
            const theme = option.getAttribute('data-theme');
            
            // Set initial active state - clear all first, then set correct one
            option.classList.remove('active');
            if (theme === this.themeSettings.theme) {
                option.classList.add('active');
            }
            
            option.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // FIXED: Always remove active from ALL options first
                document.querySelectorAll('.theme-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                
                // Add active to clicked option
                option.classList.add('active');
                
                // Save and apply theme
                this.themeSettings.theme = theme;
                this.saveThemeSettings();
                this.applyTheme();
                
                // Debug and force update after theme change
                setTimeout(() => {
                    if (window.molecularBG) {
                        window.molecularBG.debugThemeColors();
                        window.molecularBG.forceColorUpdate();
                    }
                }, 300);
            });
        });

        // FIXED: Search engine selection - prevent multiple selections
        document.querySelectorAll('.search-option').forEach(option => {
            const engine = option.getAttribute('data-engine');
            
            // Set initial active state - clear all first, then set correct one
            option.classList.remove('active');
            if (engine === this.themeSettings.searchEngine) {
                option.classList.add('active');
            }
            
            option.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // FIXED: Always remove active from ALL options first
                document.querySelectorAll('.search-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                
                // Add active to clicked option
                option.classList.add('active');
                
                // Save search engine
                this.themeSettings.searchEngine = engine;
                this.saveThemeSettings();
            });
        });
    }

    setupMoleculeControls() {
        // Tab switching
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const targetTab = e.target.dataset.tab;
                
                // Update tab buttons
                document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                
                // Update tab content
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(`${targetTab}-tab`).classList.add('active');
            });
        });

        // Molecule settings controls
        const controls = {
            'molecule-count': { display: 'molecule-count-display', suffix: '' },
            'connection-distance': { display: 'connection-distance-display', suffix: 'px' },
            'movement-speed': { display: 'movement-speed-display', suffix: '' },
            'mouse-force': { display: 'mouse-force-display', suffix: '' },
            'connection-thickness': { display: 'connection-thickness-display', suffix: 'px' },
            'connection-opacity': { display: 'connection-opacity-display', suffix: '' }
        };

        Object.keys(controls).forEach(controlId => {
            const control = document.getElementById(controlId);
            const display = document.getElementById(controls[controlId].display);
            const suffix = controls[controlId].suffix;
            
            if (control && display) {
                // Load saved values
                if (window.molecularBG) {
                    const settingsMap = {
                        'molecule-count': 'numMolecules',
                        'connection-distance': 'maxDistance',
                        'movement-speed': 'baseVelocity',
                        'mouse-force': 'mouseRepelForce',
                        'connection-thickness': 'connectionThickness',
                        'connection-opacity': 'connectionOpacity'
                    };
                    
                    const settingKey = settingsMap[controlId];
                    if (settingKey && window.molecularBG.settings[settingKey] !== undefined) {
                        control.value = window.molecularBG.settings[settingKey];
                    }
                }
                
                // Update display
                display.textContent = control.value + suffix;
                
                // Handle changes
                control.addEventListener('input', (e) => {
                    const value = parseFloat(e.target.value);
                    display.textContent = value + suffix;
                    
                    if (window.molecularBG) {
                        const settingsMap = {
                            'molecule-count': 'numMolecules',
                            'connection-distance': 'maxDistance',
                            'movement-speed': 'baseVelocity',
                            'mouse-force': 'mouseRepelForce',
                            'connection-thickness': 'connectionThickness',
                            'connection-opacity': 'connectionOpacity'
                        };
                        
                        const settingKey = settingsMap[controlId];
                        if (settingKey) {
                            window.molecularBG.updateSettings({ [settingKey]: value });
                        }
                    }
                });
            }
        });

        // Fixed Reset molecules button
        const resetMoleculesBtn = document.getElementById('reset-molecules');
        if (resetMoleculesBtn) {
            resetMoleculesBtn.addEventListener('click', () => {
                if (confirm('Reset molecule settings to default?')) {
                    if (window.molecularBG) {
                        // Reset to default settings
                        window.molecularBG.settings = { ...window.molecularBG.defaultSettings };
                        window.molecularBG.saveSettings();
                        window.molecularBG.createMolecules();
                        
                        // Update UI controls
                        Object.keys(controls).forEach(controlId => {
                            const control = document.getElementById(controlId);
                            const display = document.getElementById(controls[controlId].display);
                            const suffix = controls[controlId].suffix;
                            
                            if (control && display) {
                                const settingsMap = {
                                    'molecule-count': 'numMolecules',
                                    'connection-distance': 'maxDistance',
                                    'movement-speed': 'baseVelocity',
                                    'mouse-force': 'mouseRepelForce',
                                    'connection-thickness': 'connectionThickness',
                                    'connection-opacity': 'connectionOpacity'
                                };
                                
                                const settingKey = settingsMap[controlId];
                                if (settingKey && window.molecularBG.defaultSettings[settingKey] !== undefined) {
                                    control.value = window.molecularBG.defaultSettings[settingKey];
                                    display.textContent = window.molecularBG.defaultSettings[settingKey] + suffix;
                                }
                            }
                        });
                    }
                }
            });
        }
    }

    loadSettings() {
        const stored = localStorage.getItem('startpage-settings');
        if (stored) {
            try {
                this.data = JSON.parse(stored);
            } catch (e) {
                console.error('Error loading settings:', e);
                this.data = JSON.parse(JSON.stringify(this.defaultData));
            }
        } else {
            this.data = JSON.parse(JSON.stringify(this.defaultData));
        }
    }

    saveToStorage() {
        localStorage.setItem('startpage-settings', JSON.stringify(this.data));
    }

    renderBookmarks() {
        const container = document.getElementById('bookmarks-container');
        container.innerHTML = '';

        this.data.categories.forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'category';
            
            const linksDiv = document.createElement('div');
            linksDiv.className = 'links';
            
            const titleLi = document.createElement('li');
            titleLi.className = 'title';
            titleLi.textContent = category.title;
            linksDiv.appendChild(titleLi);
            
            category.links.forEach(link => {
                const linkLi = document.createElement('li');
                const linkA = document.createElement('a');
                linkA.href = link.url;
                linkA.textContent = link.text;
                linkA.rel = 'noopener noreferrer';
                linkLi.appendChild(linkA);
                linksDiv.appendChild(linkLi);
            });
            
            categoryDiv.appendChild(linksDiv);
            container.appendChild(categoryDiv);
        });
    }

    openSettings() {
        this.renderSettingsModal();
        document.getElementById('settings-modal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeSettings() {
        document.getElementById('settings-modal').classList.remove('active');
        document.body.style.overflow = '';
    }

    renderSettingsModal() {
        const container = document.getElementById('categories-container');
        container.innerHTML = '';

        this.data.categories.forEach((category, categoryIndex) => {
            const categoryEditor = this.createCategoryEditor(category, categoryIndex);
            container.appendChild(categoryEditor);
        });
    }

    createCategoryEditor(category, categoryIndex) {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category-editor';

        // Category header
        const headerDiv = document.createElement('div');
        headerDiv.className = 'category-header';

        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.className = 'category-title-input';
        titleInput.value = category.title;
        titleInput.addEventListener('input', (e) => {
            this.data.categories[categoryIndex].title = e.target.value;
        });

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-category-btn';
        removeBtn.textContent = 'Remove Category';
        removeBtn.addEventListener('click', () => {
            this.removeCategory(categoryIndex);
        });

        headerDiv.appendChild(titleInput);
        headerDiv.appendChild(removeBtn);
        categoryDiv.appendChild(headerDiv);

        // Links editor
        const linksDiv = document.createElement('div');
        linksDiv.className = 'links-editor';

        category.links.forEach((link, linkIndex) => {
            const linkEditor = this.createLinkEditor(link, categoryIndex, linkIndex);
            linksDiv.appendChild(linkEditor);
        });

        const addLinkBtn = document.createElement('button');
        addLinkBtn.className = 'add-link-btn';
        addLinkBtn.textContent = '+ Add Link';
        addLinkBtn.addEventListener('click', () => {
            this.addLink(categoryIndex);
        });

        linksDiv.appendChild(addLinkBtn);
        categoryDiv.appendChild(linksDiv);

        return categoryDiv;
    }

    createLinkEditor(link, categoryIndex, linkIndex) {
        const linkDiv = document.createElement('div');
        linkDiv.className = 'link-editor';

        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.className = 'link-text-input';
        textInput.placeholder = 'Link text';
        textInput.value = link.text;
        textInput.addEventListener('input', (e) => {
            this.data.categories[categoryIndex].links[linkIndex].text = e.target.value;
        });

        const urlInput = document.createElement('input');
        urlInput.type = 'url';
        urlInput.className = 'link-url-input';
        urlInput.placeholder = 'https://example.com';
        urlInput.value = link.url;
        urlInput.addEventListener('input', (e) => {
            this.data.categories[categoryIndex].links[linkIndex].url = e.target.value;
        });

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-link-btn';
        removeBtn.textContent = '×';
        removeBtn.addEventListener('click', () => {
            this.removeLink(categoryIndex, linkIndex);
        });

        linkDiv.appendChild(textInput);
        linkDiv.appendChild(urlInput);
        linkDiv.appendChild(removeBtn);

        return linkDiv;
    }

    addCategory() {
        this.data.categories.push({
            title: "~/new",
            links: [
                { text: "example", url: "https://example.com" }
            ]
        });
        this.renderSettingsModal();
    }

    removeCategory(categoryIndex) {
        if (this.data.categories.length > 1) {
            this.data.categories.splice(categoryIndex, 1);
            this.renderSettingsModal();
        } else {
            alert('You must have at least one category!');
        }
    }

    addLink(categoryIndex) {
        this.data.categories[categoryIndex].links.push({
            text: "new link",
            url: "https://example.com"
        });
        this.renderSettingsModal();
    }

    removeLink(categoryIndex, linkIndex) {
        if (this.data.categories[categoryIndex].links.length > 1) {
            this.data.categories[categoryIndex].links.splice(linkIndex, 1);
            this.renderSettingsModal();
        } else {
            alert('Each category must have at least one link!');
        }
    }

    saveSettings() {
        this.saveToStorage();
        this.saveThemeSettings();
        this.renderBookmarks();
        this.closeSettings();
        
        // Show success message
        const originalText = document.getElementById('save-settings').textContent;
        document.getElementById('save-settings').textContent = 'Saved!';
        setTimeout(() => {
            document.getElementById('save-settings').textContent = originalText;
        }, 1000);
    }

    resetSettings() {
        this.data = JSON.parse(JSON.stringify(this.defaultData));
        this.themeSettings = { ...this.defaultThemeSettings };
        this.saveToStorage();
        this.saveThemeSettings();
        this.renderBookmarks();
        this.renderSettingsModal();
        
        // Reset molecules
        if (window.molecularBG) {
            window.molecularBG.settings = { ...window.molecularBG.defaultSettings };
            window.molecularBG.saveSettings();
            window.molecularBG.createMolecules();
        }
        
        // Apply default theme and image settings
        this.applyTheme();
        this.toggleImage();
        
        // Update UI - FIXED: Clear all selections first
        document.getElementById('show-image').checked = this.themeSettings.showImage;
        
        // Reset theme options
        document.querySelectorAll('.theme-option').forEach(opt => {
            opt.classList.remove('active');
            if (opt.getAttribute('data-theme') === this.themeSettings.theme) {
                opt.classList.add('active');
            }
        });
        
        // Reset search engine options
        document.querySelectorAll('.search-option').forEach(opt => {
            opt.classList.remove('active');
            if (opt.getAttribute('data-engine') === this.themeSettings.searchEngine) {
                opt.classList.add('active');
            }
        });
    }
}

// Initialize settings when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new SettingsManager();
    });
} else {
    new SettingsManager();
}
