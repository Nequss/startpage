/**
 * MOLECULAR BACKGROUND ANIMATION - PERFORMANCE OPTIMIZED VERSION
 */

class MolecularBackground {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.molecules = [];
        this.connections = [];
        this.animationId = null;
        
        this.mouse = { x: -1000, y: -1000, radius: 100 };
        
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
        this.colorUpdateTimeout = null;
        
        // Performance optimizations
        this.baseRadius = 0.1;
        this.radiusVariation = 1;
        this.currentColors = null;
        this.lastFrameTime = 0;
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;
        
        // Cleanup tracking
        this.eventListeners = [];
        this.observers = [];
        
        this.loadSettings();
        this.init();
    }

    getThemeColors() {
        const style = getComputedStyle(document.documentElement);
        document.documentElement.offsetHeight; // Force recalculation
        
        return {
            background: style.getPropertyValue('--molecule-bg').trim() || '#1A1A1A',
            molecule: style.getPropertyValue('--molecule-color').trim() || 'rgba(143, 145, 145, 0.8)',
            connection: style.getPropertyValue('--molecule-connection').trim() || 'rgba(143, 145, 145, 0.6)',
            glow: style.getPropertyValue('--molecule-glow').trim() || 'rgba(143, 145, 145, 0.1)'
        };
    }

    loadSettings() {
        try {
            const stored = localStorage.getItem('molecule-settings');
            if (stored) {
                this.settings = { ...this.defaultSettings, ...JSON.parse(stored) };
            }
        } catch (e) {
            console.error('Error loading molecule settings:', e);
            this.settings = { ...this.defaultSettings };
        }
    }

    saveSettings() {
        localStorage.setItem('molecule-settings', JSON.stringify(this.settings));
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
        
        // Handle specific setting updates
        if (newSettings.numMolecules && newSettings.numMolecules !== this.molecules.length) {
            this.createMolecules();
        }
        
        if (newSettings.baseVelocity !== undefined) {
            this.updateMoleculeVelocities();
        }
    }

    updateMoleculeVelocities() {
        // Update existing molecules' original velocities when speed setting changes
        for (let i = 0; i < this.molecules.length; i++) {
            const molecule = this.molecules[i];
            
            // Generate new base velocities with updated speed
            const vx = (Math.random() - 0.5) * this.settings.baseVelocity;
            const vy = (Math.random() - 0.5) * this.settings.baseVelocity;
            
            // Update original velocities (what molecules return to)
            molecule.originalVx = vx;
            molecule.originalVy = vy;
            
            // Gradually adjust current velocities towards new base
            const currentSpeed = Math.sqrt(molecule.vx * molecule.vx + molecule.vy * molecule.vy);
            const targetSpeed = this.settings.baseVelocity;
            
            if (currentSpeed > 0) {
                const ratio = targetSpeed / currentSpeed;
                molecule.vx *= ratio;
                molecule.vy *= ratio;
            } else {
                molecule.vx = vx;
                molecule.vy = vy;
            }
        }
    }

    updateThemeColors() {
        // Clear previous timeout to prevent multiple updates
        if (this.colorUpdateTimeout) {
            clearTimeout(this.colorUpdateTimeout);
        }
        
        this.colorUpdateTimeout = setTimeout(() => {
            const colors = this.getThemeColors();
            this.currentColors = colors;
            
            if (this.canvas) {
                this.canvas.style.backgroundColor = colors.background;
            }
        }, 200);
    }

    forceColorUpdate() {
        const colors = this.getThemeColors();
        this.currentColors = colors;
        
        if (this.canvas) {
            this.canvas.style.backgroundColor = colors.background;
        }
    }

    init() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'molecular-bg';
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
        
        setTimeout(() => this.updateThemeColors(), 200);
        this.startAnimation();
        this.observeThemeChanges();
    }

    observeThemeChanges() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                    setTimeout(() => this.updateThemeColors(), 200);
                }
            });
        });
        
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
        
        this.observers.push(observer);
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    handleResize() {
        if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
        
        this.resize();
        this.resizeTimeout = setTimeout(() => {
            const currentCount = this.molecules.length;
            if (Math.abs(this.settings.numMolecules - currentCount) > 10) {
                this.createMolecules();
            }
        }, 500);
    }

    createMolecules() {
        // Clear existing molecules to prevent memory leak
        this.molecules.length = 0;
        this.connections.length = 0;
        
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
        const resizeHandler = () => this.handleResize();
        const mouseMoveHandler = (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        };
        const mouseLeaveHandler = () => {
            this.mouse.x = -1000;
            this.mouse.y = -1000;
        };

        window.addEventListener('resize', resizeHandler);
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseleave', mouseLeaveHandler);

        // Track listeners for cleanup
        this.eventListeners.push(
            { element: window, event: 'resize', handler: resizeHandler },
            { element: document, event: 'mousemove', handler: mouseMoveHandler },
            { element: document, event: 'mouseleave', handler: mouseLeaveHandler }
        );
    }

    updateMolecules() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const mouseRadius = this.mouse.radius;
        const repelForce = this.settings.mouseRepelForce * 0.015;
        
        for (let i = 0; i < this.molecules.length; i++) {
            const molecule = this.molecules[i];
            const dx = this.mouse.x - molecule.x;
            const dy = this.mouse.y - molecule.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouseRadius && distance > 0) {
                const force = (mouseRadius - distance) / mouseRadius;
                const angle = Math.atan2(dy, dx);
                
                molecule.vx -= Math.cos(angle) * force * repelForce;
                molecule.vy -= Math.sin(angle) * force * repelForce;
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

            // Random movement with limits
            molecule.vx += (Math.random() - 0.5) * 0.025;
            molecule.vy += (Math.random() - 0.5) * 0.025;

            const maxVel = 2.5;
            if (Math.abs(molecule.vx) > maxVel) molecule.vx = Math.sign(molecule.vx) * maxVel;
            if (Math.abs(molecule.vy) > maxVel) molecule.vy = Math.sign(molecule.vy) * maxVel;
        }
    }

    findConnections() {
        this.connections.length = 0; // Clear without creating new array
        const maxDistance = this.settings.maxDistance;
        const connectionOpacity = this.settings.connectionOpacity;
        
        for (let i = 0; i < this.molecules.length; i++) {
            for (let j = i + 1; j < this.molecules.length; j++) {
                const dx = this.molecules[i].x - this.molecules[j].x;
                const dy = this.molecules[i].y - this.molecules[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxDistance) {
                    const opacity = (1 - distance / maxDistance) * connectionOpacity;
                    this.connections.push({
                        from: this.molecules[i],
                        to: this.molecules[j],
                        opacity: opacity
                    });
                }
            }
        }
    }

    parseColor(colorString) {
        if (colorString.includes('rgba(')) {
            const match = colorString.match(/rgba\(([^)]+)\)/);
            if (match) {
                const values = match[1].split(',').map(v => parseFloat(v.trim()));
                return { r: values[0] || 143, g: values[1] || 145, b: values[2] || 145, a: values[3] || 0.8 };
            }
        } else if (colorString.includes('rgb(')) {
            const match = colorString.match(/rgb\(([^)]+)\)/);
            if (match) {
                const values = match[1].split(',').map(v => parseFloat(v.trim()));
                return { r: values[0] || 143, g: values[1] || 145, b: values[2] || 145, a: 1 };
            }
        }
        return { r: 143, g: 145, b: 145, a: 0.8 };
    }

    draw() {
        const colors = this.currentColors || this.getThemeColors();
        
        // Clear canvas
        this.ctx.fillStyle = colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw connections
        this.ctx.lineWidth = this.settings.connectionThickness;
        const connectionColor = this.parseColor(colors.connection);
        
        for (let i = 0; i < this.connections.length; i++) {
            const connection = this.connections[i];
            this.ctx.beginPath();
            this.ctx.moveTo(connection.from.x, connection.from.y);
            this.ctx.lineTo(connection.to.x, connection.to.y);
            this.ctx.strokeStyle = `rgba(${connectionColor.r}, ${connectionColor.g}, ${connectionColor.b}, ${connection.opacity})`;
            this.ctx.stroke();
        }

        // Draw molecules
        const moleculeColor = this.parseColor(colors.molecule);
        const glowColor = this.parseColor(colors.glow);
        
        for (let i = 0; i < this.molecules.length; i++) {
            const molecule = this.molecules[i];
            
            // Main molecule
            this.ctx.beginPath();
            this.ctx.arc(molecule.x, molecule.y, molecule.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${moleculeColor.r}, ${moleculeColor.g}, ${moleculeColor.b}, ${molecule.opacity * 0.8})`;
            this.ctx.fill();
            
            // Glow effect
            this.ctx.beginPath();
            this.ctx.arc(molecule.x, molecule.y, molecule.radius + 1.5, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${glowColor.r}, ${glowColor.g}, ${glowColor.b}, ${molecule.opacity * 0.1})`;
            this.ctx.fill();
        }
    }

    startAnimation() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        this.lastFrameTime = performance.now();
        this.animate();
    }

    animate() {
        if (!this.isAnimating) return;
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastFrameTime;
        
        // Throttle to target FPS
        if (deltaTime >= this.frameInterval) {
            this.updateMolecules();
            this.findConnections();
            this.draw();
            this.lastFrameTime = currentTime;
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    destroy() {
        this.isAnimating = false;
        
        // Cancel animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Clear timeouts
        if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
        if (this.colorUpdateTimeout) clearTimeout(this.colorUpdateTimeout);
        
        // Remove event listeners
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        
        // Disconnect observers
        this.observers.forEach(observer => observer.disconnect());
        
        // Remove canvas
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        
        // Clear arrays
        this.molecules.length = 0;
        this.connections.length = 0;
        this.eventListeners.length = 0;
        this.observers.length = 0;
    }
}

// Global instance
let molecularBG = null;

// Initialize with proper cleanup on page unload
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        molecularBG = new MolecularBackground();
        window.molecularBG = molecularBG;
    });
} else {
    molecularBG = new MolecularBackground();
    window.molecularBG = molecularBG;
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (molecularBG) {
        molecularBG.destroy();
    }
});
