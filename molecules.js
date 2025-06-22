/**
 * MOLECULAR BACKGROUND ANIMATION - THEME-AWARE VERSION WITH FIXED BACKGROUND
 */

class MolecularBackground {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.molecules = [];
        this.connections = [];
        
        this.mouse = { 
            x: -1000,
            y: -1000,
            radius: 100
        };
        
        // Default settings
        this.defaultSettings = {
            numMolecules: 120,
            maxDistance: 140,
            mouseRepelForce: 120,
            baseVelocity: 1.5,
            connectionThickness: 2,
            connectionOpacity: 0.3
        };
        
        this.settings = { ...this.defaultSettings };
        
        this.isAnimating = false;
        this.resizeTimeout = null;
        
        // Fixed movement parameters
        this.baseRadius = 0.1;
        this.radiusVariation = 1;
        
        // Store current colors for immediate access
        this.currentColors = null;
        
        this.loadSettings();
        this.init();
    }

    // FIXED: Get current theme colors with better fallback handling
    getThemeColors() {
        const style = getComputedStyle(document.documentElement);
        
        // Force style recalculation
        document.documentElement.offsetHeight;
        
        const moleculeBg = style.getPropertyValue('--molecule-bg').trim();
        const moleculeColor = style.getPropertyValue('--molecule-color').trim();
        const moleculeConnection = style.getPropertyValue('--molecule-connection').trim();
        const moleculeGlow = style.getPropertyValue('--molecule-glow').trim();
        
        return {
            background: moleculeBg || '#1A1A1A',
            molecule: moleculeColor || 'rgba(143, 145, 145, 0.8)',
            connection: moleculeConnection || 'rgba(143, 145, 145, 0.6)',
            glow: moleculeGlow || 'rgba(143, 145, 145, 0.1)'
        };
    }

    loadSettings() {
        const stored = localStorage.getItem('molecule-settings');
        if (stored) {
            try {
                this.settings = { ...this.defaultSettings, ...JSON.parse(stored) };
            } catch (e) {
                console.error('Error loading molecule settings:', e);
                this.settings = { ...this.defaultSettings };
            }
        }
    }

    saveSettings() {
        localStorage.setItem('molecule-settings', JSON.stringify(this.settings));
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
        
        // Only recreate molecules if count changed
        if (newSettings.numMolecules && newSettings.numMolecules !== this.molecules.length) {
            this.createMolecules();
        }
    }

    // FIXED: Update colors when theme changes - COMPLETELY REWRITTEN
    updateThemeColors() {
        // Force multiple style recalculations
        document.documentElement.offsetHeight;
        getComputedStyle(document.documentElement).getPropertyValue('--molecule-bg');
        
        // Use requestAnimationFrame for better timing
        requestAnimationFrame(() => {
            setTimeout(() => {
                const colors = this.getThemeColors();
                
                // Store colors for immediate use in draw()
                this.currentColors = colors;
                
                // Update canvas background immediately
                if (this.canvas) {
                    this.canvas.style.backgroundColor = colors.background;
                    this.canvas.style.background = colors.background;
                }
                
                console.log('Theme colors updated:', colors);
            }, 150); // Increased delay for better CSS synchronization
        });
    }

    // NEW: Force immediate color update
    forceColorUpdate() {
        // Get fresh colors
        const colors = this.getThemeColors();
        
        // Store colors for immediate use in draw()
        this.currentColors = colors;
        
        // Update canvas background immediately
        if (this.canvas) {
            this.canvas.style.backgroundColor = colors.background;
        }
        
        console.log('Forced color update:', colors);
    }

    // NEW: Debug method to check CSS variables
    debugThemeColors() {
        const style = getComputedStyle(document.documentElement);
        console.log('Current theme attribute:', document.body.getAttribute('data-theme'));
        console.log('CSS Variables:', {
            bg: style.getPropertyValue('--molecule-bg'),
            color: style.getPropertyValue('--molecule-color'),
            connection: style.getPropertyValue('--molecule-connection'),
            glow: style.getPropertyValue('--molecule-glow')
        });
    }

    init() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'molecular-bg';
        
        // FIXED: Remove background from initial style - let updateThemeColors handle it
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 0;
            pointer-events: none;
        `;
        
        document.body.insertBefore(this.canvas, document.body.firstChild);
        this.ctx = this.canvas.getContext('2d');
        
        this.resize();
        this.createMolecules();
        this.setupEventListeners();
        
        // FIXED: Apply initial theme colors after a longer delay
        setTimeout(() => {
            this.updateThemeColors();
        }, 200);
        
        this.startAnimation();
        
        // Listen for theme changes
        this.observeThemeChanges();
    }

    // FIXED: Better theme change observer
    observeThemeChanges() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                    // Add longer delay for CSS to fully update
                    setTimeout(() => {
                        this.updateThemeColors();
                    }, 200);
                }
            });
        });
        
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
        
        // Also observe document.documentElement for theme changes
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    handleResize() {
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }

        this.resize();
        
        this.resizeTimeout = setTimeout(() => {
            const currentCount = this.molecules.length;
            if (Math.abs(this.settings.numMolecules - currentCount) > 10) {
                this.createMolecules();
            }
        }, 500);
    }

    createMolecules() {
        this.molecules = [];
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        for (let i = 0; i < this.settings.numMolecules; i++) {
            const vx = (Math.random() - 0.5) * this.settings.baseVelocity;
            const vy = (Math.random() - 0.5) * this.settings.baseVelocity;
            
            this.molecules.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: vx,
                vy: vy,
                radius: Math.random() * this.radiusVariation + this.baseRadius,
                originalVx: vx,
                originalVy: vy,
                opacity: Math.random() * 0.4 + 0.6
            });
        }
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        document.addEventListener('mouseleave', () => {
            this.mouse.x = -1000;
            this.mouse.y = -1000;
        });
    }

    updateMolecules() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        for (let i = 0; i < this.molecules.length; i++) {
            const molecule = this.molecules[i];
            const dx = this.mouse.x - molecule.x;
            const dy = this.mouse.y - molecule.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.mouse.radius && distance > 0) {
                const force = (this.mouse.radius - distance) / this.mouse.radius;
                const angle = Math.atan2(dy, dx);
                
                molecule.vx -= Math.cos(angle) * force * this.settings.mouseRepelForce * 0.015;
                molecule.vy -= Math.sin(angle) * force * this.settings.mouseRepelForce * 0.015;
            } else {
                molecule.vx += (molecule.originalVx - molecule.vx) * 0.02;
                molecule.vy += (molecule.originalVy - molecule.vy) * 0.02;
            }

            molecule.x += molecule.vx;
            molecule.y += molecule.vy;

            // Wrap around screen
            if (molecule.x < -10) molecule.x = width + 10;
            if (molecule.x > width + 10) molecule.x = -10;
            if (molecule.y < -10) molecule.y = height + 10;
            if (molecule.y > height + 10) molecule.y = -10;

            // Random movement
            molecule.vx += (Math.random() - 0.5) * 0.025;
            molecule.vy += (Math.random() - 0.5) * 0.025;

            // Speed limit
            const maxVel = 2.5;
            if (Math.abs(molecule.vx) > maxVel) molecule.vx = Math.sign(molecule.vx) * maxVel;
            if (Math.abs(molecule.vy) > maxVel) molecule.vy = Math.sign(molecule.vy) * maxVel;
        }
    }

    findConnections() {
        this.connections = [];
        
        for (let i = 0; i < this.molecules.length; i++) {
            for (let j = i + 1; j < this.molecules.length; j++) {
                const dx = this.molecules[i].x - this.molecules[j].x;
                const dy = this.molecules[i].y - this.molecules[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.settings.maxDistance) {
                    const opacity = (1 - distance / this.settings.maxDistance) * this.settings.connectionOpacity;
                    
                    this.connections.push({
                        from: this.molecules[i],
                        to: this.molecules[j],
                        opacity: opacity
                    });
                }
            }
        }
    }

    // Helper function to parse rgba/rgb values - IMPROVED
    parseColor(colorString) {
        if (colorString.includes('rgba(')) {
            const match = colorString.match(/rgba\(([^)]+)\)/);
            if (match) {
                const values = match[1].split(',').map(v => parseFloat(v.trim()));
                return {
                    r: values[0] || 143,
                    g: values[1] || 145,
                    b: values[2] || 145,
                    a: values[3] || 0.8
                };
            }
        } else if (colorString.includes('rgb(')) {
            const match = colorString.match(/rgb\(([^)]+)\)/);
            if (match) {
                const values = match[1].split(',').map(v => parseFloat(v.trim()));
                return {
                    r: values[0] || 143,
                    g: values[1] || 145,
                    b: values[2] || 145,
                    a: 1
                };
            }
        }
        return { r: 143, g: 145, b: 145, a: 0.8 }; // fallback
    }

    draw() {
        // Use stored colors if available, otherwise get fresh ones
        const colors = this.currentColors || this.getThemeColors();
        
        // Clear with background - ALWAYS use the theme background
        this.ctx.fillStyle = colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw connections with theme colors
        this.ctx.lineWidth = this.settings.connectionThickness;
        for (let i = 0; i < this.connections.length; i++) {
            const connection = this.connections[i];
            this.ctx.beginPath();
            this.ctx.moveTo(connection.from.x, connection.from.y);
            this.ctx.lineTo(connection.to.x, connection.to.y);
            
            // Parse connection color and apply opacity
            const connectionColor = this.parseColor(colors.connection);
            this.ctx.strokeStyle = `rgba(${connectionColor.r}, ${connectionColor.g}, ${connectionColor.b}, ${connection.opacity})`;
            
            this.ctx.stroke();
        }

        // Draw molecules with theme colors
        for (let i = 0; i < this.molecules.length; i++) {
            const molecule = this.molecules[i];
            
            // Main molecule
            this.ctx.beginPath();
            this.ctx.arc(molecule.x, molecule.y, molecule.radius, 0, Math.PI * 2);
            
            // Parse molecule color and apply opacity
            const moleculeColor = this.parseColor(colors.molecule);
            this.ctx.fillStyle = `rgba(${moleculeColor.r}, ${moleculeColor.g}, ${moleculeColor.b}, ${molecule.opacity * 0.8})`;
            
            this.ctx.fill();
            
            // Glow effect
            this.ctx.beginPath();
            this.ctx.arc(molecule.x, molecule.y, molecule.radius + 1.5, 0, Math.PI * 2);
            
            // Parse glow color and apply opacity
            const glowColor = this.parseColor(colors.glow);
            this.ctx.fillStyle = `rgba(${glowColor.r}, ${glowColor.g}, ${glowColor.b}, ${molecule.opacity * 0.1})`;
            
            this.ctx.fill();
        }
    }

    startAnimation() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        this.animate();
    }

    animate() {
        if (!this.isAnimating) return;
        
        this.updateMolecules();
        this.findConnections();
        this.draw();
        
        requestAnimationFrame(() => this.animate());
    }

    destroy() {
        this.isAnimating = false;
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// Global instance for settings access
let molecularBG = null;

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        molecularBG = new MolecularBackground();
        window.molecularBG = molecularBG; // Make it globally accessible
    });
} else {
    molecularBG = new MolecularBackground();
    window.molecularBG = molecularBG; // Make it globally accessible
}
