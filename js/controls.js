/**
 * Game Controls
 * Handles UI interactions and game state management
 */
class GameControls {
    constructor(game, renderer) {
        this.game = game;
        this.renderer = renderer;
        this.isRunning = false;
        this.animationId = null;
        this.animationSpeed = 50; // milliseconds between generations
        this.lastStepTime = 0;
        
        // Get DOM elements
        this.elements = {
            playBtn: document.getElementById('playBtn'),
            pauseBtn: document.getElementById('pauseBtn'),
            stepBtn: document.getElementById('stepBtn'),
            clearBtn: document.getElementById('clearBtn'),
            randomBtn: document.getElementById('randomBtn'),
            speedSlider: document.getElementById('speedSlider'),
            speedValue: document.getElementById('speedValue'),
            generation: document.getElementById('generation'),
            population: document.getElementById('population'),
            density: document.getElementById('density'),
            canvas: this.renderer.canvas,
            canvasOverlay: document.getElementById('canvasOverlay'),
            loadingSpinner: document.getElementById('loadingSpinner'),
            helpToggle: document.getElementById('helpToggle'),
            helpPanel: document.getElementById('helpPanel')
        };
        
        // Bind event handlers
        this.setupEventListeners();
        
        // Initial UI update
        this.updateUI();
    }
    
    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Control buttons
        this.elements.playBtn.addEventListener('click', () => this.play());
        this.elements.pauseBtn.addEventListener('click', () => this.pause());
        this.elements.stepBtn.addEventListener('click', () => this.step());
        this.elements.clearBtn.addEventListener('click', () => this.clear());
        this.elements.randomBtn.addEventListener('click', () => this.randomize());
        
        // Speed control
        this.elements.speedSlider.addEventListener('input', (e) => this.handleSpeedChange(e));
        this.elements.speedSlider.addEventListener('change', (e) => this.handleSpeedChange(e));
        
        // Canvas interactions - mouse events
        this.elements.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.elements.canvas.addEventListener('mousemove', (e) => this.handleCanvasHover(e));
        this.elements.canvas.addEventListener('mouseleave', () => this.clearHover());
        
        // Canvas interactions - touch events for mobile
        this.elements.canvas.addEventListener('touchstart', (e) => this.handleCanvasTouch(e));
        this.elements.canvas.addEventListener('touchmove', (e) => this.handleCanvasTouchMove(e));
        this.elements.canvas.addEventListener('touchend', (e) => this.handleCanvasTouchEnd(e));
        
        // Make canvas focusable for keyboard navigation
        this.elements.canvas.tabIndex = 0;
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Window resize
        window.addEventListener('resize', () => this.handleResize());
    }
    
    /**
     * Handle canvas click to toggle cells
     */
    handleCanvasClick(event) {
        event.preventDefault();
        const coords = this.renderer.canvasToGrid(event.clientX, event.clientY);
        this.toggleCellWithFeedback(coords.x, coords.y);
    }
    
    /**
     * Handle touch events for mobile devices
     */
    handleCanvasTouch(event) {
        event.preventDefault();
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            const coords = this.renderer.canvasToGrid(touch.clientX, touch.clientY);
            this.toggleCellWithFeedback(coords.x, coords.y);
        }
    }
    
    /**
     * Handle touch move events
     */
    handleCanvasTouchMove(event) {
        event.preventDefault();
        // Optional: Could implement drag-to-paint functionality here
    }
    
    /**
     * Handle touch end events
     */
    handleCanvasTouchEnd(event) {
        event.preventDefault();
        this.clearHover();
    }
    
    /**
     * Toggle cell with visual feedback
     */
    toggleCellWithFeedback(x, y) {
        this.game.toggleCell(x, y);
        this.renderer.render();
        this.updateUIWithAnimation();
        
        // Brief highlight effect
        setTimeout(() => {
            this.renderer.highlightCell(x, y, 'rgba(76, 175, 80, 0.5)');
        }, 50);
    }
    
    /**
     * Handle canvas hover for cell highlighting
     */
    handleCanvasHover(event) {
        if (this.isRunning) return; // Don't show hover during animation
        
        const coords = this.renderer.canvasToGrid(event.clientX, event.clientY);
        
        // Re-render and highlight hovered cell
        this.renderer.render();
        this.renderer.highlightCell(coords.x, coords.y);
    }
    
    /**
     * Clear hover effect
     */
    clearHover() {
        if (!this.isRunning) {
            this.renderer.render();
        }
    }
    
    /**
     * Handle keyboard shortcuts
     */
    handleKeyboard(event) {
        // Don't trigger shortcuts when typing in input fields
        if (event.target.tagName === 'INPUT') return;
        
        switch (event.code) {
            case 'Space':
                event.preventDefault();
                this.isRunning ? this.pause() : this.play();
                break;
            case 'KeyS':
                event.preventDefault();
                if (!this.isRunning) {
                    this.step();
                }
                break;
            case 'KeyC':
                event.preventDefault();
                this.clear();
                break;
            case 'KeyR':
                event.preventDefault();
                this.randomize();
                break;
            case 'ArrowUp':
                event.preventDefault();
                this.adjustSpeed(-50);
                break;
            case 'ArrowDown':
                event.preventDefault();
                this.adjustSpeed(50);
                break;
        }
    }
    
    /**
     * Handle speed slider changes
     */
    handleSpeedChange(event) {
        const speed = parseInt(event.target.value);
        this.setSpeed(speed);
        this.elements.speedValue.textContent = speed + 'ms';
        
        // Add visual feedback
        this.elements.speedValue.classList.add('updated');
        setTimeout(() => {
            this.elements.speedValue.classList.remove('updated');
        }, 300);
    }
    
    /**
     * Adjust speed by increment
     */
    adjustSpeed(increment) {
        const currentSpeed = parseInt(this.elements.speedSlider.value);
        const newSpeed = Math.max(50, Math.min(currentSpeed + increment, 1000));
        this.elements.speedSlider.value = newSpeed;
        this.handleSpeedChange({ target: { value: newSpeed } });
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
        // Debounce resize events
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.renderer.resize();
        }, 250);
    }
    
    /**
     * Start the animation
     */
    play() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.updateButtonStates();
        this.animate();
    }
    
    /**
     * Pause the animation
     */
    pause() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.updateButtonStates();
    }
    
    /**
     * Step through one generation
     */
    step() {
        this.game.step();
        this.renderer.render();
        this.updateUIWithAnimation();
    }
    
    /**
     * Clear the grid
     */
    clear() {
        this.pause();
        this.showLoading('Clearing...');
        
        setTimeout(() => {
            this.game.clear();
            this.renderer.render();
            this.updateUIWithAnimation();
            this.hideLoading();
        }, 100);
    }
    
    /**
     * Randomize the grid
     */
    randomize() {
        this.pause();
        this.showLoading('Randomizing...');
        
        setTimeout(() => {
            this.game.randomize();
            this.renderer.render();
            this.updateUIWithAnimation();
            this.hideLoading();
        }, 50);
    }
    
    /**
     * Animation loop using requestAnimationFrame
     */
    animate(currentTime = 0) {
        if (!this.isRunning) return;
        
        // Control animation speed
        if (currentTime - this.lastStepTime >= this.animationSpeed) {
            this.game.step();
            this.renderer.render();
            this.updateUIWithAnimation();
            this.lastStepTime = currentTime;
        }
        
        this.animationId = requestAnimationFrame((time) => this.animate(time));
    }
    
    /**
     * Update button states based on game state
     */
    updateButtonStates() {
        this.elements.playBtn.disabled = this.isRunning;
        this.elements.pauseBtn.disabled = !this.isRunning;
        this.elements.stepBtn.disabled = this.isRunning;
    }
    
    /**
     * Update UI display (generation, population, density)
     */
    updateUI() {
        this.elements.generation.textContent = this.game.getGeneration();
        this.elements.population.textContent = this.game.getPopulation();
        
        // Calculate and display population density
        const totalCells = this.game.width * this.game.height;
        const density = Math.round((this.game.getPopulation() / totalCells) * 100);
        this.elements.density.textContent = density + '%';
        
        this.updateButtonStates();
    }
    
    /**
     * Update UI with animation effects
     */
    updateUIWithAnimation() {
        const oldGeneration = this.elements.generation.textContent;
        const oldPopulation = this.elements.population.textContent;
        
        this.updateUI();
        
        // Add animation class if values changed
        if (oldGeneration !== this.elements.generation.textContent) {
            this.elements.generation.classList.add('updated');
            setTimeout(() => this.elements.generation.classList.remove('updated'), 300);
        }
        
        if (oldPopulation !== this.elements.population.textContent) {
            this.elements.population.classList.add('updated');
            setTimeout(() => this.elements.population.classList.remove('updated'), 300);
        }
        
        // Always animate density as it's derived from population
        this.elements.density.classList.add('updated');
        setTimeout(() => this.elements.density.classList.remove('updated'), 300);
    }
    
    /**
     * Set animation speed
     */
    setSpeed(speed) {
        this.animationSpeed = Math.max(50, Math.min(speed, 2000)); // 50ms to 2s
    }
    
    /**
     * Load a predefined pattern
     */
    loadPattern(pattern) {
        this.pause();
        this.showLoading(`Loading ${pattern}...`);
        
        setTimeout(() => {
            const centerX = Math.floor(this.game.width / 2);
            const centerY = Math.floor(this.game.height / 2);
            this.game.loadPattern(pattern, centerX - 2, centerY - 2);
            this.renderer.render();
            this.updateUIWithAnimation();
            this.hideLoading();
        }, 150);
    }
    
    /**
     * Show loading overlay
     */
    showLoading(message = 'Loading...') {
        if (this.elements.loadingSpinner && this.elements.canvasOverlay) {
            this.elements.loadingSpinner.querySelector('span').textContent = message;
            this.elements.canvasOverlay.classList.add('visible');
        }
    }
    
    /**
     * Hide loading overlay
     */
    hideLoading() {
        if (this.elements.canvasOverlay) {
            this.elements.canvasOverlay.classList.remove('visible');
        }
    }
    
    /**
     * Get current statistics
     */
    getStats() {
        const totalCells = this.game.width * this.game.height;
        const population = this.game.getPopulation();
        const density = (population / totalCells) * 100;
        
        return {
            generation: this.game.getGeneration(),
            population: population,
            density: density.toFixed(1),
            totalCells: totalCells,
            isRunning: this.isRunning,
            animationSpeed: this.animationSpeed
        };
    }
}
