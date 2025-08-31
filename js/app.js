/**
 * Game of Life Application
 * Main application entry point and initialization
 */

// Application configuration
const CONFIG = {
    gridWidth: 80,
    gridHeight: 50
};

// Global application state
let game, renderer, controls;

/**
 * Initialize the Game of Life application
 */
function initializeApp() {
    try {
        // Get canvas element
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            throw new Error('Canvas element not found');
        }
        
        // Initialize game components
        game = new GameOfLife(CONFIG.gridWidth, CONFIG.gridHeight);
        renderer = new CanvasRenderer(canvas, game);
        controls = new GameControls(game, renderer);
        
        // Initial render
        renderer.render();
        
        // Randomize the board on first load
        game.randomize();
        renderer.render();
        controls.updateUI();
        
        // Setup help toggle
        setupHelpToggle();
        
        // Hide loading spinner after initialization
        setTimeout(() => {
            controls.hideLoading();
        }, 500);
        
        console.log('Game of Life initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize Game of Life:', error);
        showError('Failed to initialize the game. Please refresh the page.');
    }
}

/**
 * Load a sample pattern for demonstration
 */
function loadSamplePattern() {
    // Create a simple glider pattern in the center
    const centerX = Math.floor(CONFIG.gridWidth / 2);
    const centerY = Math.floor(CONFIG.gridHeight / 2);
    
    // Glider pattern
    game.setCell(centerX + 1, centerY, true);
    game.setCell(centerX + 2, centerY + 1, true);
    game.setCell(centerX, centerY + 2, true);
    game.setCell(centerX + 1, centerY + 2, true);
    game.setCell(centerX + 2, centerY + 2, true);
    
    // Add a blinker pattern nearby
    game.setCell(centerX - 10, centerY, true);
    game.setCell(centerX - 10, centerY + 1, true);
    game.setCell(centerX - 10, centerY + 2, true);
    
    // Add another interesting pattern
    game.setCell(centerX + 10, centerY - 5, true);
    game.setCell(centerX + 10, centerY - 4, true);
    game.setCell(centerX + 11, centerY - 5, true);
    game.setCell(centerX + 11, centerY - 4, true);
    
    renderer.render();
    controls.updateUI();
}

/**
 * Setup help panel toggle functionality
 */
function setupHelpToggle() {
    const helpToggle = document.getElementById('helpToggle');
    const helpPanel = document.getElementById('helpPanel');
    
    if (helpToggle && helpPanel) {
        helpToggle.addEventListener('click', () => {
            helpPanel.classList.toggle('hidden');
        });
        
        // Close help panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!helpPanel.contains(e.target) && !helpToggle.contains(e.target)) {
                helpPanel.classList.add('hidden');
            }
        });
    }
}

/**
 * Show error message to user
 */
function showError(message) {
    const container = document.querySelector('.container');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        background: #f44336;
        color: white;
        padding: 15px;
        border-radius: 8px;
        margin: 20px 0;
        text-align: center;
        font-weight: bold;
    `;
    errorDiv.textContent = message;
    container.insertBefore(errorDiv, container.firstChild);
}

/**
 * Handle application errors
 */
window.addEventListener('error', (event) => {
    console.error('Application error:', event.error);
    showError('An unexpected error occurred. Please refresh the page.');
});

/**
 * Handle unhandled promise rejections
 */
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    showError('An unexpected error occurred. Please refresh the page.');
});

/**
 * Initialize the application when the DOM is ready
 */
document.addEventListener('DOMContentLoaded', initializeApp);

/**
 * Export for potential external use
 */
window.GameOfLifeApp = {
    game,
    renderer,
    controls,
    CONFIG,
    loadSamplePattern,
    setupHelpToggle,
    initializeApp
};
