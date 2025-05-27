import { CELL_TYPES } from './constants.js';
import assetLoader from './assetLoader.js';

class Grid {
    constructor(rows = 10, cols = 10) {
        this.rows = rows;
        this.cols = cols;
        this.cells = [];
        this.startCell = null;
        this.endCell = null;
        this.initialize();
    }

    // Initialize the grid
    initialize() {
        this.cells = [];
        const grassVariants = assetLoader.getTileVariants('normalGrass');
        const waterVariants = assetLoader.getTileVariants('waterTiles');
        const grassVariantCount = grassVariants.length || 1;
        const waterVariantCount = waterVariants.length || 1;
        
        
        for (let i = 0; i < this.rows; i++) {
            this.cells[i] = [];
            for (let j = 0; j < this.cols; j++) {
                this.cells[i][j] = {
                    type: CELL_TYPES.EMPTY,
                    tileVariant: Math.floor(Math.random() * grassVariantCount),
                    waterVaraint: Math.floor(Math.random() * waterVariantCount),
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
                if (this.startCell) {
                    this.startCell.type = CELL_TYPES.EMPTY;
                }
                this.startCell = cell;
            } else if (type === CELL_TYPES.END) {
                if (this.endCell) {
                    this.endCell.type = CELL_TYPES.EMPTY;
                }
                this.endCell = cell;
            }
            
            cell.type = type;
            return true;
        }
        return false;
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

    // Reset all path and visited markers
    resetPath() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const cell = this.cells[i][j];
                if (cell.type === CELL_TYPES.PATH || cell.type === CELL_TYPES.VISITED) {
                    cell.type = CELL_TYPES.EMPTY;
                }
                // Reset pathfinding properties
                cell.f = 0;
                cell.g = 0;
                cell.h = 0;
                cell.parent = null;
            }
        }
    }

    // Clear the entire grid
    clear() {
        this.startCell = null;
        this.endCell = null;
        this.initialize();
    }
}

export default Grid;