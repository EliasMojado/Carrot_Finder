import { CELL_TYPES } from './constants.js';
import assetLoader from './assetLoader.js';

class Grid {
    constructor(rows = 10, cols = 10) {
        this.rows = rows;
        this.cols = cols;
        this.cells = [];
        this.startCell = null;
        this.endCell = null;
        this.pathCells = [];
        this.bunnyPosition = null;
        this.initialize();
    }

    // Initialize the grid
    initialize() {
        this.cells = [];
        const grassVariants = assetLoader.getTileVariants('normalGrass');
        const waterVariants = assetLoader.getTileVariants('waterTiles');
        const tilledDirtVariants = assetLoader.getTileVariants('tilledDirtTiles');
        const grassVariantCount = grassVariants.length || 1;
        const waterVariantCount = waterVariants.length || 1;
        const tilledDirtVariantCount = tilledDirtVariants.length || 1;
        
        for (let i = 0; i < this.rows; i++) {
            this.cells[i] = [];
            for (let j = 0; j < this.cols; j++) {
                this.cells[i][j] = {
                    type: CELL_TYPES.EMPTY,
                    tileVariant: Math.floor(Math.random() * grassVariantCount),
                    waterVariant: Math.floor(Math.random() * waterVariantCount),
                    tilledDirtVariant: Math.floor(Math.random() * tilledDirtVariantCount),
                    row: i,
                    col: j,
                    f: 0, // For A* algorithm
                    g: 0, // For A* algorithm
                    h: 0, // For A* algorithm
                    parent: null, // For pathfinding
                };
            }
        }
    }

    // Add a method to convert path cells to tilled dirt
    setPathAsTilledDirt(path) {
        if (!path || path.length === 0) return;

        this.resetBunnyPosition();
        
        // Clear any previous path cells
        this.resetPath();
        
        // Store the new path cells (excluding start and end points)
        for (let i = 0; i < path.length - 1; i++) {
            const cell = path[i];
            if (this.isValidCell(cell.row, cell.col)) {
                this.cells[cell.row][cell.col].type = CELL_TYPES.TILLED_DIRT;
                this.pathCells.push({row: cell.row, col: cell.col});
            }
        }
    }

    isValidCell(row, col) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }

    resetBunnyPosition() {
        if (this.startCell) {
            this.bunnyPosition = {
                row: this.startCell.row,
                col: this.startCell.col
            };
            
            // Notify any listeners that bunny position has been reset
            if (this.onBunnyPositionReset) {
                this.onBunnyPositionReset(this.bunnyPosition);
            }
        }

        return Promise.resolve();
    }

    updateBunnyPosition(row, col) {
        this.bunnyPosition = { row, col };
        
        if (this.onBunnyPositionUpdated) {
            this.onBunnyPositionUpdated(this.bunnyPosition);
        }
    }

    // Add callback for bunny position updates
    setOnBunnyPositionUpdated(callback) {
        this.onBunnyPositionUpdated = callback;
    }
    
    // Add callback for bunny position resets
    setOnBunnyPositionReset(callback) {
        this.onBunnyPositionReset = callback;
    }

    // Clear the path cells
    resetPath() {
        // Reset any cells marked as path or visited
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const cell = this.cells[i][j];
                if (cell.type === CELL_TYPES.PATH || 
                    cell.type === CELL_TYPES.VISITED || 
                    cell.type === CELL_TYPES.TILLED_DIRT) {
                    cell.type = CELL_TYPES.EMPTY;
                }
                // Reset pathfinding properties
                cell.f = 0;
                cell.g = 0;
                cell.h = 0;
                cell.parent = null;
            }
        }
        
        this.pathCells = []; // Clear path cells array
    }

    clear() {
        this.startCell = null;
        this.endCell = null;
        this.pathCells = []; // Clear path cells array
        this.initialize();

        this.randomizeStartAndEnd(); // Randomize start and end points
    }

    randomizeStartAndEnd() {
        // Clear any existing start/end points
        if (this.startCell) this.startCell.type = CELL_TYPES.EMPTY;
        if (this.endCell) this.endCell.type = CELL_TYPES.EMPTY;
        this.startCell = null;
        this.endCell = null;
        
        // Find positions for start and end that aren't obstacles and aren't too close
        let startRow, startCol, endRow, endCol;
        let validPositions = false;
        
        while (!validPositions) {
            // Pick random start position
            startRow = Math.floor(Math.random() * this.rows);
            startCol = Math.floor(Math.random() * this.cols);
            
            // Pick random end position
            endRow = Math.floor(Math.random() * this.rows);
            endCol = Math.floor(Math.random() * this.cols);
            
            // Check if they're valid (not obstacles and not too close)
            const startCell = this.getCell(startRow, startCol);
            const endCell = this.getCell(endRow, endCol);
            const distance = Math.abs(startRow - endRow) + Math.abs(startCol - endCol);
            
            // Positions are valid if neither is an obstacle and they're at least 5 cells apart
            if (startCell && endCell && 
                startCell.type !== CELL_TYPES.OBSTACLE && 
                endCell.type !== CELL_TYPES.OBSTACLE &&
                distance >= 5) {
                validPositions = true;
            }
        }
        
        // Set the start and end cells
        this.setCellType(startRow, startCol, CELL_TYPES.START);
        this.setCellType(endRow, endCol, CELL_TYPES.END);

        // Initialize bunny position
        this.bunnyPosition = {
            row: startRow,
            col: startCol
        };
    }

    // Resize the grid
    resize(newRows, newCols) {
        this.rows = newRows;
        this.cols = newCols;
        this.initialize();
    }

    // Get a cell at a specific position
    getCell(row, col) {
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            return this.cells[row][col];
        }
        return null;
    }

    // Set cell type
    setCellType(row, col, type) {
        const cell = this.getCell(row, col);
        if (cell) {
            // Handle special cases for start/end points
            if (type === CELL_TYPES.START) {
                // If there's already a start cell, reset its type
                if (this.startCell && this.startCell !== cell) {
                    this.startCell.type = CELL_TYPES.EMPTY;
                } 

                this.resetPath();

                // Set the new start cell
                cell.type = type;
                this.startCell = cell;

                this.bunnyPosition = {
                    row: cell.row,
                    col: cell.col
                }

                // Notify the renderer
                if (this.onStartCellSet) {
                    this.onStartCellSet(cell);
                }
            } else if (type === CELL_TYPES.END) {
                // If there's already an end cell, reset its type
                if (this.endCell && this.endCell !== cell) {
                    this.endCell.type = CELL_TYPES.EMPTY;
                }

                this.resetPath();

                // Set the new end cell
                cell.type = type;
                this.endCell = cell;
                
                // Notify the renderer
                if (this.onEndCellSet) {
                    this.onEndCellSet(cell);
                }
            } else {
                cell.type = type;
            }
            return true;
        }
        return false;
    }

    // Add methods to register callbacks
    setOnStartCellSet(callback) {
        this.onStartCellSet = callback;
    }

    setOnEndCellSet(callback) {
        this.onEndCellSet = callback;
    }

    // Toggle a cell between empty and obstacle
    toggleCellObstacle(row, col) {
        const cell = this.getCell(row, col);
        if (cell) {
            if (cell.type === CELL_TYPES.EMPTY) {
                cell.type = CELL_TYPES.OBSTACLE;
            } else if (cell.type === CELL_TYPES.OBSTACLE) {
                cell.type = CELL_TYPES.EMPTY;
            }
            return true;
        }
        return false;
    }

}

export default Grid;