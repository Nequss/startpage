/**
 * Settings Management System - Performance Optimized
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
        try {
            const stored = localStorage.getItem('theme-settings');
            if (stored) {
                this.themeSettings = { ...this.defaultThemeSettings, ...JSON.parse(stored) };
            } else {
                this.themeSettings = { ...this.defaultThemeSettings };
            }
        } catch (e) {
            console.error('Error loading theme settings:', e);
            this.themeSettings = { ...this.defaultThemeSettings };
        }
    }

    saveThemeSettings() {
        localStorage.setItem('theme-settings', JSON.stringify(this.themeSettings));
    }

    applyTheme() {
        document.body.setAttribute('data-theme', this.themeSettings.theme);
        document.documentElement.setAttribute('data-theme', this.themeSettings.theme);
        
        getComputedStyle(document.documentElement).getPropertyValue('--molecule-bg');
        
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

    setupEventListeners() {
        const settingsIcon = document.getElementById('settings-icon');
        if (settingsIcon) {
            settingsIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openSettings();
            });
        }

        const closeBtn = document.getElementById('close-settings');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeSettings());
        }

        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === e.currentTarget) {
                    this.closeSettings();
                }
            });
        }

        const saveBtn = document.getElementById('save-settings');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveSettings());
        }

        const resetBtn = document.getElementById('reset-settings');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset all settings to default?')) {
                    this.resetSettings();
                }
            });
        }

        const addCategoryBtn = document.getElementById('add-category');
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', () => this.addCategory());
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('settings-modal').classList.contains('active')) {
                this.closeSettings();
            }
        });
    }

    setupThemeControls() {
        const showImageToggle = document.getElementById('show-image');
        if (showImageToggle) {
            showImageToggle.checked = this.themeSettings.showImage;
            
            showImageToggle.addEventListener('change', (e) => {
                this.themeSettings.showImage = e.target.checked;
                this.saveThemeSettings();
                this.toggleImage();
            });
        }

        // Theme selection
        document.querySelectorAll('.theme-option').forEach(option => {
            const theme = option.getAttribute('data-theme');
            
            option.classList.remove('active');
            if (theme === this.themeSettings.theme) {
                option.classList.add('active');
            }
            
            option.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                document.querySelectorAll('.theme-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                
                option.classList.add('active');
                
                this.themeSettings.theme = theme;
                this.saveThemeSettings();
                this.applyTheme();
                
                setTimeout(() => {
                    if (window.molecularBG) {
                        window.molecularBG.forceColorUpdate();
                    }
                }, 300);
            });
        });

        // Search engine selection
        document.querySelectorAll('.search-option').forEach(option => {
            const engine = option.getAttribute('data-engine');
            
            option.classList.remove('active');
            if (engine === this.themeSettings.searchEngine) {
                option.classList.add('active');
            }
            
            option.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                document.querySelectorAll('.search-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                
                option.classList.add('active');
                
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
                
                document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                
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
                
                display.textContent = control.value + suffix;
                
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

        const resetMoleculesBtn = document.getElementById('reset-molecules');
        if (resetMoleculesBtn) {
            resetMoleculesBtn.addEventListener('click', () => {
                if (confirm('Reset molecule settings to default?')) {
                    if (window.molecularBG) {
                        window.molecularBG.settings = { ...window.molecularBG.defaultSettings };
                        window.molecularBG.saveSettings();
                        window.molecularBG.createMolecules();
                        
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
        try {
            const stored = localStorage.getItem('startpage-settings');
            if (stored) {
                this.data = JSON.parse(stored);
            } else {
                this.data = JSON.parse(JSON.stringify(this.defaultData));
            }
        } catch (e) {
            console.error('Error loading settings:', e);
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

        const headerDiv = document.createElement('div');
        headerDiv.className = 'category-header';

        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.className = 'category-title-input';
        titleInput.value = category.title;
        titleInput.addEventListener('input', (e) => {
            this.data.categories[categoryIndex].title = e.target.value;
        });

        const removeCategoryBtn = document.createElement('button');
        removeCategoryBtn.className = 'remove-category-btn';
        removeCategoryBtn.textContent = 'Remove Category';
        removeCategoryBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to remove this category?')) {
                this.data.categories.splice(categoryIndex, 1);
                this.renderSettingsModal();
            }
        });

        headerDiv.appendChild(titleInput);
        headerDiv.appendChild(removeCategoryBtn);

        const linksDiv = document.createElement('div');
        linksDiv.className = 'links-editor';

        category.links.forEach((link, linkIndex) => {
            const linkEditor = this.createLinkEditor(link, categoryIndex, linkIndex);
            linksDiv.appendChild(linkEditor);
        });

        const addLinkBtn = document.createElement('button');
        addLinkBtn.className = 'add-link-btn';
        addLinkBtn.textContent = 'Add Link';
        addLinkBtn.addEventListener('click', () => {
            this.data.categories[categoryIndex].links.push({ text: '', url: '' });
            this.renderSettingsModal();
        });

        linksDiv.appendChild(addLinkBtn);

        categoryDiv.appendChild(headerDiv);
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

        const removeLinkBtn = document.createElement('button');
        removeLinkBtn.className = 'remove-link-btn';
        removeLinkBtn.textContent = 'Remove';
        removeLinkBtn.addEventListener('click', () => {
            this.data.categories[categoryIndex].links.splice(linkIndex, 1);
            this.renderSettingsModal();
        });

        linkDiv.appendChild(textInput);
        linkDiv.appendChild(urlInput);
        linkDiv.appendChild(removeLinkBtn);

        return linkDiv;
    }

    addCategory() {
        this.data.categories.push({
            title: '~/new',
            links: [{ text: 'example', url: 'https://example.com' }]
        });
        this.renderSettingsModal();
    }

    saveSettings() {
        this.saveToStorage();
        this.renderBookmarks();
        this.closeSettings();
        
        // Show success feedback
        const saveBtn = document.getElementById('save-settings');
        const originalText = saveBtn.textContent;
        saveBtn.textContent = 'Saved!';
        saveBtn.style.background = 'var(--color-success)';
        
        setTimeout(() => {
            saveBtn.textContent = originalText;
            saveBtn.style.background = '';
        }, 1500);
    }

    resetSettings() {
        this.data = JSON.parse(JSON.stringify(this.defaultData));
        this.themeSettings = { ...this.defaultThemeSettings };
        
        this.saveToStorage();
        this.saveThemeSettings();
        
        this.renderBookmarks();
        this.renderSettingsModal();
        this.applyTheme();
        this.toggleImage();
        
        // Reset molecule settings if available
        if (window.molecularBG) {
            window.molecularBG.settings = { ...window.molecularBG.defaultSettings };
            window.molecularBG.saveSettings();
            window.molecularBG.createMolecules();
            this.setupMoleculeControls();
        }
        
        this.setupThemeControls();
    }
}

// Initialize settings when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.settingsManager = new SettingsManager();
    });
} else {
    window.settingsManager = new SettingsManager();
}
