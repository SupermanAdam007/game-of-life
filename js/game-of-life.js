/**
 * Conway's Game of Life - Core Logic
 * Implements the cellular automaton rules and grid management
 */
class GameOfLife {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.generation = 0;
        
        // Use flat array for better performance
        // Access pattern: index = y * width + x
        this.currentGrid = new Array(width * height).fill(false);
        this.nextGrid = new Array(width * height).fill(false);
    }
    
    /**
     * Convert 2D coordinates to flat array index
     */
    getIndex(x, y) {
        return y * this.width + x;
    }
    
    /**
     * Get cell state at coordinates
     */
    getCell(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return false; // Dead cells outside boundaries
        }
        return this.currentGrid[this.getIndex(x, y)];
    }
    
    /**
     * Set cell state at coordinates
     */
    setCell(x, y, alive) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.currentGrid[this.getIndex(x, y)] = alive;
        }
    }
    
    /**
     * Toggle cell state at coordinates
     */
    toggleCell(x, y) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            const index = this.getIndex(x, y);
            this.currentGrid[index] = !this.currentGrid[index];
        }
    }
    
    /**
     * Count live neighbors around a cell
     */
    countNeighbors(x, y) {
        let count = 0;
        
        // Check all 8 neighboring cells
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue; // Skip the cell itself
                
                if (this.getCell(x + dx, y + dy)) {
                    count++;
                }
            }
        }
        
        return count;
    }
    
    /**
     * Apply Conway's Game of Life rules to advance one generation
     */
    step() {
        // Calculate next generation
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const neighbors = this.countNeighbors(x, y);
                const currentlyAlive = this.getCell(x, y);
                const index = this.getIndex(x, y);
                
                // Apply Conway's rules:
                // 1. Live cell with 2-3 neighbors survives
                // 2. Dead cell with exactly 3 neighbors becomes alive
                // 3. All other cells die or remain dead
                if (currentlyAlive) {
                    this.nextGrid[index] = neighbors === 2 || neighbors === 3;
                } else {
                    this.nextGrid[index] = neighbors === 3;
                }
            }
        }
        
        // Swap grids for next iteration
        [this.currentGrid, this.nextGrid] = [this.nextGrid, this.currentGrid];
        this.generation++;
    }
    
    /**
     * Clear all cells (set to dead)
     */
    clear() {
        this.currentGrid.fill(false);
        this.generation = 0;
    }
    
    /**
     * Randomize the grid with approximately 30% live cells
     */
    randomize() {
        for (let i = 0; i < this.currentGrid.length; i++) {
            this.currentGrid[i] = Math.random() < 0.3;
        }
        this.generation = 0;
    }
    
    /**
     * Get current population count
     */
    getPopulation() {
        return this.currentGrid.reduce((count, cell) => count + (cell ? 1 : 0), 0);
    }
    
    /**
     * Get current generation number
     */
    getGeneration() {
        return this.generation;
    }
    
    /**
     * Get a copy of the current grid state
     */
    getGridState() {
        return [...this.currentGrid];
    }
    
    /**
     * Load common patterns for testing
     */
    loadPattern(pattern, startX = 0, startY = 0) {
        this.clear();
        
        const patterns = {
            glider: [
                [0, 1, 0],
                [0, 0, 1],
                [1, 1, 1]
            ],
            blinker: [
                [1, 1, 1]
            ],
            toad: [
                [0, 1, 1, 1],
                [1, 1, 1, 0]
            ],
            beacon: [
                [1, 1, 0, 0],
                [1, 1, 0, 0],
                [0, 0, 1, 1],
                [0, 0, 1, 1]
            ]
        };
        
        const patternData = patterns[pattern];
        if (!patternData) return;
        
        for (let y = 0; y < patternData.length; y++) {
            for (let x = 0; x < patternData[y].length; x++) {
                if (patternData[y][x] === 1) {
                    this.setCell(startX + x, startY + y, true);
                }
            }
        }
    }
}
