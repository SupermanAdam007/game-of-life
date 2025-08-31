/**
 * Canvas Renderer for Game of Life
 * Handles all drawing operations and visual representation
 */
class CanvasRenderer {
    constructor(canvas, game) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.game = game;
        
        // Visual settings
        this.cellSize = 10;
        this.gridColor = '#e0e0e0';
        this.liveCellColor = '#2196F3';
        this.deadCellColor = '#ffffff';
        this.showGrid = true;
        
        // Calculate optimal cell size based on canvas and game dimensions
        this.calculateCellSize();
        
        // Set up high DPI support
        this.setupHighDPI();
    }
    
    /**
     * Calculate optimal cell size to fit the game grid in the canvas
     */
    calculateCellSize() {
        // Use full viewport dimensions - no reserved space
        const availableWidth = this.logicalWidth || window.innerWidth;
        const availableHeight = this.logicalHeight || window.innerHeight;
        
        const maxCellWidth = Math.floor(availableWidth / this.game.width);
        const maxCellHeight = Math.floor(availableHeight / this.game.height);
        this.cellSize = Math.min(maxCellWidth, maxCellHeight, 20); // Allow larger cells
        
        // Ensure minimum cell size for visibility
        if (this.cellSize < 4) {
            this.cellSize = 4;
            this.showGrid = false; // Hide grid for very small cells
        } else {
            this.showGrid = this.cellSize >= 6; // Show grid for larger cells
        }
        
        // Center the grid on the full canvas
        const gridWidth = this.game.width * this.cellSize;
        const gridHeight = this.game.height * this.cellSize;
        
        this.offsetX = Math.floor((availableWidth - gridWidth) / 2);
        this.offsetY = Math.floor((availableHeight - gridHeight) / 2);
    }
    
    /**
     * Setup full-screen canvas with high DPI support
     */
    setupHighDPI() {
        const dpr = window.devicePixelRatio || 1;
        
        // Get actual viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Set canvas internal dimensions for high DPI
        this.canvas.width = viewportWidth * dpr;
        this.canvas.height = viewportHeight * dpr;
        
        // Set canvas display size to match viewport exactly
        this.canvas.style.width = viewportWidth + 'px';
        this.canvas.style.height = viewportHeight + 'px';
        
        // Scale context for high DPI but use logical pixels for calculations
        this.ctx.scale(dpr, dpr);
        
        // Store logical dimensions for calculations
        this.logicalWidth = viewportWidth;
        this.logicalHeight = viewportHeight;
        
        // Initialize offsets
        this.offsetX = 0;
        this.offsetY = 0;
        
        // Recalculate cell size after DPI adjustment
        this.calculateCellSize();
    }
    
    /**
     * Convert canvas coordinates to grid coordinates
     */
    canvasToGrid(canvasX, canvasY) {
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((canvasX - rect.left - this.offsetX) / this.cellSize);
        const y = Math.floor((canvasY - rect.top - this.offsetY) / this.cellSize);
        
        return {
            x: Math.max(0, Math.min(x, this.game.width - 1)),
            y: Math.max(0, Math.min(y, this.game.height - 1))
        };
    }
    
    /**
     * Clear the entire canvas with dark background
     */
    clear() {
        // Use logical dimensions for clearing
        const width = this.logicalWidth || window.innerWidth;
        const height = this.logicalHeight || window.innerHeight;
        
        // Fill entire canvas with dark background
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, width, height);
        
        // Fill game area with slightly lighter background
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(
            this.offsetX, 
            this.offsetY, 
            this.game.width * this.cellSize, 
            this.game.height * this.cellSize
        );
    }
    
    /**
     * Draw the grid lines
     */
    drawGrid() {
        if (!this.showGrid || this.cellSize < 6) return;
        
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        
        // Vertical lines
        for (let x = 0; x <= this.game.width; x++) {
            const xPos = this.offsetX + x * this.cellSize + 0.5;
            this.ctx.moveTo(xPos, this.offsetY);
            this.ctx.lineTo(xPos, this.offsetY + this.game.height * this.cellSize);
        }
        
        // Horizontal lines
        for (let y = 0; y <= this.game.height; y++) {
            const yPos = this.offsetY + y * this.cellSize + 0.5;
            this.ctx.moveTo(this.offsetX, yPos);
            this.ctx.lineTo(this.offsetX + this.game.width * this.cellSize, yPos);
        }
        
        this.ctx.stroke();
    }
    
    /**
     * Draw all cells with modern styling
     */
    drawCells() {
        // Create gradient for live cells
        const height = this.logicalHeight || window.innerHeight;
        const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#00ff88');
        gradient.addColorStop(0.5, '#00cc66');
        gradient.addColorStop(1, '#009944');
        
        this.ctx.fillStyle = gradient;
        
        for (let y = 0; y < this.game.height; y++) {
            for (let x = 0; x < this.game.width; x++) {
                if (this.game.getCell(x, y)) {
                    const xPos = this.offsetX + x * this.cellSize;
                    const yPos = this.offsetY + y * this.cellSize;
                    
                    if (this.showGrid && this.cellSize > 6) {
                        // Leave 1px border for grid
                        this.ctx.fillRect(xPos + 1, yPos + 1, this.cellSize - 2, this.cellSize - 2);
                    } else {
                        // Fill entire cell - use simple rectangles for better performance
                        this.ctx.fillRect(xPos, yPos, this.cellSize, this.cellSize);
                    }
                }
            }
        }
    }
    
    /**
     * Render the complete game state
     */
    render() {
        // Clear canvas
        this.clear();
        
        // Draw grid if enabled
        this.drawGrid();
        
        // Draw all cells
        this.drawCells();
    }
    
    /**
     * Highlight a cell (for hover effects)
     */
    highlightCell(x, y, color = 'rgba(0, 255, 136, 0.4)') {
        if (x < 0 || x >= this.game.width || y < 0 || y >= this.game.height) return;
        
        const xPos = this.offsetX + x * this.cellSize;
        const yPos = this.offsetY + y * this.cellSize;
        
        this.ctx.fillStyle = color;
        
        if (this.cellSize >= 4) {
            this.ctx.beginPath();
            this.ctx.roundRect(xPos, yPos, this.cellSize, this.cellSize, Math.min(2, this.cellSize / 4));
            this.ctx.fill();
        } else {
            this.ctx.fillRect(xPos, yPos, this.cellSize, this.cellSize);
        }
    }
    
    /**
     * Update visual settings
     */
    updateSettings(settings) {
        if (settings.cellSize !== undefined) {
            this.cellSize = Math.max(1, Math.min(settings.cellSize, 50));
        }
        if (settings.liveCellColor) {
            this.liveCellColor = settings.liveCellColor;
        }
        if (settings.deadCellColor) {
            this.deadCellColor = settings.deadCellColor;
        }
        if (settings.gridColor) {
            this.gridColor = settings.gridColor;
        }
        if (settings.showGrid !== undefined) {
            this.showGrid = settings.showGrid;
        }
    }
    
    /**
     * Resize canvas and recalculate cell size
     */
    resize() {
        // Force a complete recalculation
        this.setupHighDPI();
        
        // Small delay to ensure DOM has updated
        setTimeout(() => {
            this.render();
        }, 10);
    }
}
