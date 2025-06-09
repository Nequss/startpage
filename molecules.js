/**
 * MOLECULAR BACKGROUND ANIMATION
 * 
 * This code creates an animated background with white dots (molecules) that:
 * - Move around randomly on a dark background
 * - Connect to nearby molecules with lines
 * - Run away from your mouse cursor
 * - Adjust their count based on screen size
 */

class MolecularBackground {
    /**
     * CONSTRUCTOR - This runs when we create a new MolecularBackground
     * It's like setting up all the basic settings and variables we'll need
     */
    constructor() {
        // Canvas is like a digital drawing board where we draw everything
        this.canvas = null;
        this.ctx = null; // ctx = "context" - the paintbrush for our canvas
        
        // Arrays to store our molecules and connections
        this.molecules = []; // List of all the moving dots
        this.connections = []; // List of all the lines between dots
        
        // Mouse tracking - where is the user's cursor?
        this.mouse = { 
            x: 0,           // Mouse X position
            y: 0,           // Mouse Y position  
            radius: 80      // How far around the mouse should molecules run away?
        };
        
        // Settings that change based on screen size
        this.numMolecules = 0;    // How many dots to show
        this.maxDistance = 0;     // How close do dots need to be to connect?
        this.mouseRepelForce = 150; // How strongly does mouse push dots away?
        
        // Timer for when user resizes window
        this.resizeTimeout = null;
        
        // Fixed settings that never change
        this.baseVelocity = 1.2;     // How fast dots move
        this.baseRadius = 2;         // How big dots are
        this.radiusVariation = 1.5;  // How much dot sizes can vary
        
        // Start everything up!
        this.init();
    }

    /**
     * CALCULATE HOW MANY MOLECULES TO SHOW
     * Bigger screen = more molecules, smaller screen = fewer molecules
     * Uses math to keep the density (dots per area) consistent
     */
    calculateMoleculeCount() {
        // Get current window size
        const width = window.innerWidth;   // How wide is the window?
        const height = window.innerHeight; // How tall is the window?
        const screenArea = width * height; // Total area of the screen
        
        // Base calculation: 8 molecules per 10,000 pixels
        const densityFactor = 20;
        const baseCount = Math.floor((screenArea / 10000) * densityFactor);
        
        // Adjust for different screen proportions
        // Compare to a "standard" 1920x1080 screen
        const widthFactor = Math.sqrt(width / 1920);
        const heightFactor = Math.sqrt(height / 1080);
        const resolutionMultiplier = (widthFactor + heightFactor) / 2;
        
        // Apply the adjustment
        const moleculeCount = Math.floor(baseCount * resolutionMultiplier);
        
        // Make sure we don't have too few (min 30) or too many (max 300)
        return Math.max(30, Math.min(300, moleculeCount));
    }

    /**
     * CALCULATE CONNECTION DISTANCE
     * How close do molecules need to be to draw a line between them?
     * Bigger screens = longer connection lines, smaller screens = shorter lines
     */
    calculateMaxDistance() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const avgDimension = (width + height) / 2; // Average of width and height
        
        // Start with a base distance of 120 pixels
        const baseDistance = 120;
        const referenceDimension = 1500; // Reference screen average size
        
        // Scale the distance based on screen size
        const scaleFactor = Math.sqrt(avgDimension / referenceDimension);
        
        // Keep it between 80 and 200 pixels
        return Math.max(80, Math.min(200, baseDistance * scaleFactor));
    }

    /**
     * CALCULATE MOUSE INTERACTION RADIUS
     * How far from the mouse should molecules start running away?
     */
    calculateMouseRadius() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const avgDimension = (width + height) / 2;
        
        const baseRadius = 80;
        const scaleFactor = avgDimension / 1500;
        
        // Keep it between 50 and 120 pixels
        return Math.max(50, Math.min(120, baseRadius * scaleFactor));
    }

    /**
     * INITIALIZE EVERYTHING
     * This sets up the canvas and starts the animation
     */
    init() {
        // Create a new canvas element (like adding a new drawing board to the webpage)
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'molecular-bg'; // Give it a name
        
        // Set the canvas style using CSS
        this.canvas.style.cssText = `
            position: fixed;        /* Stay in place when page scrolls */
            top: 0;                /* Start at the very top */
            left: 0;               /* Start at the very left */
            width: 100vw;          /* Take up full viewport width */
            height: 100vh;         /* Take up full viewport height */
            z-index: -1;           /* Put it behind everything else */
            pointer-events: none;  /* Don't block mouse clicks */
            background: #1A1A1A;   /* Dark background color */
        `;
        
        // Add the canvas to the webpage (put it at the very beginning)
        document.body.insertBefore(this.canvas, document.body.firstChild);
        
        // Get the drawing context (our "paintbrush")
        this.ctx = this.canvas.getContext('2d');
        
        // Set up everything for the current screen size
        this.updateParameters();  // Calculate molecules count, distances, etc.
        this.resize();           // Set canvas size
        this.createMolecules();  // Create all the moving dots
        this.setupEventListeners(); // Listen for mouse movement and window resize
        this.animate();          // Start the animation loop
    }

    /**
     * UPDATE PARAMETERS
     * Recalculate all the settings based on current screen size
     */
    updateParameters() {
        this.numMolecules = this.calculateMoleculeCount();
        this.maxDistance = this.calculateMaxDistance();
        this.mouse.radius = this.calculateMouseRadius();
        
        // Log the settings to browser console (for debugging)
        console.log(`Resolution: ${window.innerWidth}x${window.innerHeight}`);
        console.log(`Molecules: ${this.numMolecules}, Max Distance: ${this.maxDistance.toFixed(1)}, Mouse Radius: ${this.mouse.radius.toFixed(1)}`);
    }

    /**
     * RESIZE CANVAS
     * Make sure the canvas matches the window size
     */
    resize() {
        // Set the internal canvas size (for drawing)
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Set the display size (what user sees)
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
    }

    /**
     * HANDLE WINDOW RESIZE
     * When user resizes their browser window, recalculate everything
     */
    handleResize() {
        // If there's already a resize timer running, cancel it
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
        
        // Immediately resize the canvas
        this.resize();
        
        // Wait 150ms before doing the expensive recalculations
        // (In case user is still dragging the window edge)
        this.resizeTimeout = setTimeout(() => {
            // Recalculate all parameters for new window size
            this.updateParameters();
            
            // Create completely new set of molecules
            this.createMolecules();
            
            console.log(`Recreated ${this.numMolecules} molecules for new resolution`);
        }, 150);
    }

    /**
     * CREATE MOLECULES
     * Generate all the moving dots with random positions and speeds
     */
    createMolecules() {
        // Clear any existing molecules
        this.molecules = [];
        
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Create the right number of molecules for this screen size
        for (let i = 0; i < this.numMolecules; i++) {
            // Random velocity (speed and direction)
            // Math.random() gives 0 to 1, so (Math.random() - 0.5) gives -0.5 to 0.5
            const vx = (Math.random() - 0.5) * this.baseVelocity; // X speed
            const vy = (Math.random() - 0.5) * this.baseVelocity; // Y speed
            
            // Create a new molecule object with all its properties
            this.molecules.push({
                // Random starting position anywhere on screen
                x: Math.random() * width,
                y: Math.random() * height,
                
                // Current velocity (changes when mouse interacts)
                vx: vx,
                vy: vy,
                
                // Random size
                radius: Math.random() * this.radiusVariation + this.baseRadius,
                
                // Original velocity (to return to after mouse leaves)
                originalVx: vx,
                originalVy: vy,
                
                // Random transparency (0.6 to 1.0)
                opacity: Math.random() * 0.4 + 0.6
            });
        }
    }

    /**
     * SETUP EVENT LISTENERS
     * Tell the browser to call our functions when things happen
     */
    setupEventListeners() {
        // When window is resized, call our handleResize function
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // When mobile device is rotated, also handle resize
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleResize();
            }, 100); // Wait a bit for orientation to fully change
        });
        
        // When mouse moves, update our mouse position
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX; // Mouse X position
            this.mouse.y = e.clientY; // Mouse Y position
        });

        // When mouse leaves the window, move our tracked position far away
        document.addEventListener('mouseleave', () => {
            this.mouse.x = -1000; // Far off screen
            this.mouse.y = -1000;
        });
    }

    /**
     * UPDATE MOLECULES
     * Move all the molecules and handle mouse interaction
     * This runs every frame (about 60 times per second)
     */
    updateMolecules() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Update each molecule
        this.molecules.forEach(molecule => {
            // MOUSE INTERACTION
            // Calculate distance from mouse to this molecule
            const dx = this.mouse.x - molecule.x; // Horizontal distance
            const dy = this.mouse.y - molecule.y; // Vertical distance
            const distance = Math.sqrt(dx * dx + dy * dy); // Actual distance using Pythagorean theorem

            // If mouse is close enough to this molecule
            if (distance < this.mouse.radius && distance > 0) {
                // Calculate repulsion force (stronger when closer)
                const force = (this.mouse.radius - distance) / this.mouse.radius;
                
                // Calculate angle from mouse to molecule
                const angle = Math.atan2(dy, dx);
                
                // Push molecule away from mouse
                molecule.vx -= Math.cos(angle) * force * this.mouseRepelForce * 0.015;
                molecule.vy -= Math.sin(angle) * force * this.mouseRepelForce * 0.015;
            } else {
                // Mouse is far away, gradually return to original velocity
                molecule.vx += (molecule.originalVx - molecule.vx) * 0.02;
                molecule.vy += (molecule.originalVy - molecule.vy) * 0.02;
            }

            // MOVE THE MOLECULE
            // Update position based on current velocity
            molecule.x += molecule.vx;
            molecule.y += molecule.vy;

            // WRAP AROUND SCREEN EDGES
            // When molecule goes off one side, make it appear on the opposite side
            if (molecule.x < -10) molecule.x = width + 10;   // Left edge → right edge
            if (molecule.x > width + 10) molecule.x = -10;   // Right edge → left edge
            if (molecule.y < -10) molecule.y = height + 10;  // Top edge → bottom edge
            if (molecule.y > height + 10) molecule.y = -10;  // Bottom edge → top edge

            // ADD RANDOM MOVEMENT
            // Slight random changes to make movement more organic
            molecule.vx += (Math.random() - 0.5) * 0.025;
            molecule.vy += (Math.random() - 0.5) * 0.025;

            // LIMIT MAXIMUM SPEED
            // Don't let molecules go too fast
            const maxVel = 2.5;
            if (Math.abs(molecule.vx) > maxVel) molecule.vx = Math.sign(molecule.vx) * maxVel;
            if (Math.abs(molecule.vy) > maxVel) molecule.vy = Math.sign(molecule.vy) * maxVel;
        });
    }

    /**
     * FIND CONNECTIONS
     * Determine which molecules are close enough to draw lines between
     */
    findConnections() {
        // Clear previous connections
        this.connections = [];
        
        // Check every pair of molecules
        for (let i = 0; i < this.molecules.length; i++) {
            for (let j = i + 1; j < this.molecules.length; j++) {
                // Calculate distance between these two molecules
                const dx = this.molecules[i].x - this.molecules[j].x;
                const dy = this.molecules[i].y - this.molecules[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // If they're close enough, create a connection
                if (distance < this.maxDistance) {
                    // Make connection more transparent when molecules are farther apart
                    const baseOpacity = (1 - distance / this.maxDistance) * 0.5;
                    
                    this.connections.push({
                        from: this.molecules[i],  // First molecule
                        to: this.molecules[j],    // Second molecule
                        opacity: baseOpacity      // How visible the line should be
                    });
                }
            }
        }
    }

    /**
     * DRAW EVERYTHING
     * Paint the molecules and connections onto the canvas
     */
    draw() {
        // CLEAR THE CANVAS
        // Fill entire canvas with dark background color
        this.ctx.fillStyle = '#1A1A1A'; // Dark gray color
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // DRAW CONNECTION LINES
        this.connections.forEach(connection => {
            this.ctx.beginPath(); // Start a new line
            
            // Draw line from one molecule to another
            this.ctx.moveTo(connection.from.x, connection.from.y); // Start point
            this.ctx.lineTo(connection.to.x, connection.to.y);     // End point
            
            // Set line color (white with opacity)
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${connection.opacity})`;
            this.ctx.lineWidth = 1; // Line thickness
            this.ctx.stroke(); // Actually draw the line
        });

        // DRAW MOLECULES
        this.molecules.forEach(molecule => {
            // MAIN MOLECULE CIRCLE
            this.ctx.beginPath(); // Start a new shape
            
            // Draw circle at molecule position
            this.ctx.arc(molecule.x, molecule.y, molecule.radius, 0, Math.PI * 2);
            
            // Set fill color (white with molecule's opacity)
            this.ctx.fillStyle = `rgba(25, 25, 25, ${molecule.opacity})`;
            this.ctx.fill(); // Fill the circle
            
            // GLOW EFFECT
            this.ctx.beginPath(); // Start another circle
            
            // Draw slightly larger circle for glow
            this.ctx.arc(molecule.x, molecule.y, molecule.radius + 1.5, 0, Math.PI * 2);
            
            // Set glow color (white with lower opacity)
            this.ctx.fillStyle = `rgba(255, 255, 255, ${molecule.opacity * 0.1})`;
            this.ctx.fill(); // Fill the glow circle
        });
    }

    /**
     * ANIMATION LOOP
     * This function runs continuously to create smooth animation
     * It's called about 60 times per second
     */
    animate() {
        // Update all molecule positions and interactions
        this.updateMolecules();
        
        // Calculate which molecules should be connected
        this.findConnections();
        
        // Draw everything on the canvas
        this.draw();
        
        // Schedule this function to run again on the next frame
        // This creates the continuous animation loop
        requestAnimationFrame(() => this.animate());
    }
}

/**
 * INITIALIZATION
 * Start the molecular background when the webpage is ready
 */

// Check if the webpage is still loading
if (document.readyState === 'loading') {
    // If still loading, wait for it to finish
    document.addEventListener('DOMContentLoaded', () => {
        new MolecularBackground(); // Create and start the animation
    });
} else {
    // If already loaded, start immediately
    new MolecularBackground();
}

/**
 * HOW IT ALL WORKS TOGETHER:
 * 
 * 1. When the page loads, we create a new MolecularBackground
 * 2. It sets up a canvas (drawing area) that covers the entire screen
 * 3. It calculates how many molecules to show based on screen size
 * 4. It creates that many molecules with random positions and speeds
 * 5. It starts an animation loop that runs 60 times per second
 * 6. Each frame, it:
 *    - Updates molecule positions
 *    - Makes molecules run away from the mouse
 *    - Finds which molecules are close enough to connect
 *    - Draws everything on the screen
 * 7. When the window is resized, it recalculates everything and starts fresh
 * 
 */
