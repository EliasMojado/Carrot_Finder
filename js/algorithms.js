import { CELL_TYPES } from './constants.js';

// Utility class for pathfinding algorithms
class PathfindingAlgorithm {
    constructor(grid, onNodeVisited, onPathFound, delay = 20) {
        this.grid = grid;
        this.onNodeVisited = onNodeVisited; // Callback when node is visited
        this.onPathFound = onPathFound; // Callback when path is found
        this.delay = delay; // Delay between steps (ms)
        this.isRunning = false;
        this.shouldStop = false;
    }

    // Stop algorithm execution
    stop() {
        this.shouldStop = true;
    }

    // Utility function to get neighbors of a cell
    getNeighbors(cell) {
        const neighbors = [];
        const { row, col } = cell;
        const directions = [
            { row: -1, col: 0 }, // Up
            { row: 1, col: 0 },  // Down
            { row: 0, col: -1 }, // Left
            { row: 0, col: 1 },  // Right
        ];

        for (const dir of directions) {
            const newRow = row + dir.row;
            const newCol = col + dir.col;
            const neighbor = this.grid.getCell(newRow, newCol);
            
            if (neighbor && neighbor.type !== CELL_TYPES.OBSTACLE) {
                neighbors.push(neighbor);
            }
        }

        return neighbors;
    }

    // Reconstruct path from goal to start
    async reconstructPath(endCell) {
        const path = [];
        let current = endCell;
        
        while (current && current.parent) {
            path.unshift(current);
            current = current.parent;
        }
        
        // Update UI to show the path
        for (const cell of path) {
            if (this.shouldStop) break;
            if (cell.type !== CELL_TYPES.START && cell.type !== CELL_TYPES.END) {
                cell.type = CELL_TYPES.PATH;
                await this.delayExecution(this.delay);
                this.onNodeVisited(cell);
            }
        }

        return path;
    }

    // Helper to delay execution (for visualization)
    delayExecution(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Calculate manhattan distance heuristic (for A*)
    calculateHeuristic(cellA, cellB) {
        return Math.abs(cellA.row - cellB.row) + Math.abs(cellA.col - cellB.col);
    }

    // Dijkstra's Algorithm
    async runDijkstra() {
        if (!this.grid.startCell || !this.grid.endCell) {
            console.error('Start or end cell not defined');
            return null;
        }

        this.isRunning = true;
        this.shouldStop = false;
        
        // Priority queue (simple array implementation)
        const openSet = [this.grid.startCell];
        const closedSet = new Set();
        
        // Initialize distances
        for (let i = 0; i < this.grid.rows; i++) {
            for (let j = 0; j < this.grid.cols; j++) {
                const cell = this.grid.getCell(i, j);
                cell.g = Infinity; // Distance from start
                cell.parent = null; // Parent cell for path reconstruction
            }
        }
        
        this.grid.startCell.g = 0;
        
        while (openSet.length > 0 && !this.shouldStop) {
            // Sort by distance (smallest first)
            openSet.sort((a, b) => a.g - b.g);
            
            // Get the node with smallest distance
            const current = openSet.shift();
            
            // If we reached the end
            if (current === this.grid.endCell) {
                const path = await this.reconstructPath(current);
                this.isRunning = false;
                if (this.onPathFound) this.onPathFound(path);
                return path;
            }
            
            // Add to closed set
            closedSet.add(current);
            
            // Mark as visited for visualization
            if (current !== this.grid.startCell && current !== this.grid.endCell) {
                current.type = CELL_TYPES.VISITED;
                await this.delayExecution(this.delay);
                this.onNodeVisited(current);
            }
            
            // Check all neighbors
            const neighbors = this.getNeighbors(current);
            
            for (const neighbor of neighbors) {
                if (closedSet.has(neighbor)) continue;
                
                // Distance from start to neighbor through current
                const tentativeG = current.g + 1;
                
                // Check if new path to neighbor is shorter or neighbor is not in open set
                if (tentativeG < neighbor.g || !openSet.includes(neighbor)) {
                    // Update neighbor
                    neighbor.g = tentativeG;
                    neighbor.parent = current;
                    
                    if (!openSet.includes(neighbor)) {
                        openSet.push(neighbor);
                    }
                }
            }
        }
        
        // No path found
        this.isRunning = false;
        return null;
    }
    
    // A* Search Algorithm
    async runAStar() {
        if (!this.grid.startCell || !this.grid.endCell) {
            console.error('Start or end cell not defined');
            return null;
        }

        this.isRunning = true;
        this.shouldStop = false;
        
        // Priority queue (simple array implementation)
        const openSet = [this.grid.startCell];
        const closedSet = new Set();
        
        // Initialize cells
        for (let i = 0; i < this.grid.rows; i++) {
            for (let j = 0; j < this.grid.cols; j++) {
                const cell = this.grid.getCell(i, j);
                cell.g = Infinity; // Distance from start
                cell.h = 0; // Heuristic (estimated distance to goal)
                cell.f = Infinity; // g + h
                cell.parent = null; // Parent cell for path reconstruction
            }
        }
        
        // Set start values
        this.grid.startCell.g = 0;
        this.grid.startCell.h = this.calculateHeuristic(this.grid.startCell, this.grid.endCell);
        this.grid.startCell.f = this.grid.startCell.h;
        
        while (openSet.length > 0 && !this.shouldStop) {
            // Sort by f score (smallest first)
            openSet.sort((a, b) => a.f - b.f);
            
            // Get the node with smallest f score
            const current = openSet.shift();
            
            // If we reached the end
            if (current === this.grid.endCell) {
                const path = await this.reconstructPath(current);
                this.isRunning = false;
                if (this.onPathFound) this.onPathFound(path);
                return path;
            }
            
            // Add to closed set
            closedSet.add(current);
            
            // Mark as visited for visualization
            if (current !== this.grid.startCell && current !== this.grid.endCell) {
                current.type = CELL_TYPES.VISITED;
                await this.delayExecution(this.delay);
                this.onNodeVisited(current);
            }
            
            // Check all neighbors
            const neighbors = this.getNeighbors(current);
            
            for (const neighbor of neighbors) {
                if (closedSet.has(neighbor)) continue;
                
                // Distance from start to neighbor through current
                const tentativeG = current.g + 1;
                
                // Check if new path to neighbor is shorter or neighbor is not in open set
                if (tentativeG < neighbor.g || !openSet.includes(neighbor)) {
                    // Update neighbor
                    neighbor.g = tentativeG;
                    neighbor.h = this.calculateHeuristic(neighbor, this.grid.endCell);
                    neighbor.f = neighbor.g + neighbor.h;
                    neighbor.parent = current;
                    
                    if (!openSet.includes(neighbor)) {
                        openSet.push(neighbor);
                    }
                }
            }
        }
        
        // No path found
        this.isRunning = false;
        return null;
    }
}

export default PathfindingAlgorithm;