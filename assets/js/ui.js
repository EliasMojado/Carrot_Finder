import Grid from './grid.js';
import GridRenderer from './drawing.js';
import PathfindingAlgorithm from './algorithms.js';
import { MIN_GRID_SIZE, MAX_GRID_SIZE, CELL_TYPES } from './constants.js';

class UI {
    constructor(canvas, grid, renderer) {
        this.canvas = canvas;
        this.grid = grid;
        this.renderer = renderer;
        this.currentTool = 'obstacle'; // Default tool: obstacle, start, end
        this.pathfinder = null;
        
        this.bindEvents();
        this.initializeControls();
    }

    // Bind UI event handlers
    bindEvents() {
        // Canvas click handler
        this.canvas.addEventListener('click', (event) => {
            this.handleCanvasClick(event);
        });
        
        // Reset button
        const resetBtn = document.getElementById('reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetGrid();
            });
        }
        
        // Resize button
        const resizeBtn = document.getElementById('resize-btn');
        if (resizeBtn) {
            resizeBtn.addEventListener('click', () => {
                this.resizeGrid();
            });
        }
        
        // Tool selection buttons
        const obstacleToolBtn = document.getElementById('obstacle-tool');
        const startToolBtn = document.getElementById('start-tool');
        const endToolBtn = document.getElementById('end-tool');
        
        if (obstacleToolBtn) {
            obstacleToolBtn.addEventListener('click', () => {
                this.currentTool = 'obstacle';
                this.updateToolUI();
            });
        }
        
        if (startToolBtn) {
            startToolBtn.addEventListener('click', () => {
                this.currentTool = 'start';
                this.updateToolUI();
            });
        }
        
        if (endToolBtn) {
            endToolBtn.addEventListener('click', () => {
                this.currentTool = 'end';
                this.updateToolUI();
            });
        }

        // Algorithm visualize button
        const visualizeBtn = document.getElementById('visualize-btn');
        if (visualizeBtn) {
            visualizeBtn.addEventListener('click', () => {
                this.runPathfinding();
            });
        }
    }

    // Run the selected pathfinding algorithm
    async runPathfinding() {
        // Stop any currently running algorithm
        if (this.pathfinder && this.pathfinder.isRunning) {
            this.pathfinder.stop();
            await new Promise(resolve => setTimeout(resolve, 100)); // Give it time to stop
        }

        // Clear previous path
        this.grid.resetPath();
        this.renderer.drawGrid();

        // Get algorithm selection
        const algoSelect = document.getElementById('algorithm-select');
        const algorithm = algoSelect ? algoSelect.value : 'astar';

        // Check if start and end points exist
        if (!this.grid.startCell || !this.grid.endCell) {
            alert('Please set both start and end points before running the algorithm.');
            return;
        }

        // Create pathfinder instance
        this.pathfinder = new PathfindingAlgorithm(
            this.grid, 
            // Callback when node is visited
            (cell) => {
                this.renderer.drawGrid();
            },
            // Callback when path is found
            (path) => {
                console.log(`Path found with ${path.length} steps`);
                // We've already visualized the path in the algorithm
            },
            // Delay (ms) between steps - adjust for visualization speed
            20
        );

        // Disable UI during pathfinding
        this.toggleControlsEnabled(false);

        // Run the selected algorithm
        let path = null;
        try {
            switch (algorithm) {
                case 'dijkstra':
                    path = await this.pathfinder.runDijkstra();
                    break;
                case 'astar':
                    path = await this.pathfinder.runAStar();
                    break;
                default:
                    path = await this.pathfinder.runAStar();
            }
        } catch (error) {
            console.error('Error during pathfinding:', error);
        }

        // Re-enable UI
        this.toggleControlsEnabled(true);

        // Show message if no path found
        if (!path) {
            alert('No path found! Try removing some obstacles.');
        }
    }

    // Enable/disable controls during algorithm execution
    toggleControlsEnabled(enabled) {
        const controls = [
            'reset-btn', 'resize-btn', 'rows-input', 'cols-input',
            'obstacle-tool', 'start-tool', 'end-tool', 'algorithm-select'
        ];
        
        controls.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.disabled = !enabled;
            }
        });
        
        // Also update visualize button text
        const visualizeBtn = document.getElementById('visualize-btn');
        if (visualizeBtn) {
            visualizeBtn.textContent = enabled ? 'Find Path' : 'Running...';
            visualizeBtn.disabled = !enabled;
        }
    }

    // Initialize UI controls
    initializeControls() {
        // Set initial values for form fields
        const rowsInput = document.getElementById('rows-input');
        const colsInput = document.getElementById('cols-input');
        
        if (rowsInput) rowsInput.value = this.grid.rows;
        if (colsInput) colsInput.value = this.grid.cols;
        
        // Update tool UI if applicable
        this.updateToolUI();
    }
    
    // Update the active tool UI
    updateToolUI() {
        const toolButtons = {
            'obstacle': document.getElementById('obstacle-tool'),
            'start': document.getElementById('start-tool'),
            'end': document.getElementById('end-tool')
        };
        
        // Remove active class from all tools
        for (const button of Object.values(toolButtons)) {
            if (button) button.classList.remove('active');
        }
        
        // Add active class to current tool
        if (toolButtons[this.currentTool]) {
            toolButtons[this.currentTool].classList.add('active');
        }
    }

    // Handle click on the canvas
    handleCanvasClick(event) {
        // Ignore clicks if algorithm is running
        if (this.pathfinder && this.pathfinder.isRunning) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const canvasX = event.clientX - rect.left;
        const canvasY = event.clientY - rect.top;
        
        const gridPos = this.renderer.canvasToGridCoordinates(canvasX, canvasY);
        if (!gridPos) return; // Click outside grid area
        
        const { row, col } = gridPos;
        
        // Clear any existing path when changing the grid
        this.grid.resetPath();
        
        // Apply the current tool
        switch (this.currentTool) {
            case 'obstacle':
                this.grid.toggleCellObstacle(row, col);
                break;
            case 'start':
                this.grid.setCellType(row, col, CELL_TYPES.START);
                break;
            case 'end':
                this.grid.setCellType(row, col, CELL_TYPES.END);
                break;
        }
        
        // Redraw the grid
        this.renderer.drawGrid();
    }

    // Reset the grid
    resetGrid() {
        // Stop any running algorithm
        if (this.pathfinder && this.pathfinder.isRunning) {
            this.pathfinder.stop();
        }
        this.grid.clear();
        this.renderer.drawGrid();
    }

    // Resize the grid
    resizeGrid() {
        const rowsInput = document.getElementById('rows-input');
        const colsInput = document.getElementById('cols-input');
        
        if (!rowsInput || !colsInput) return;
        
        let newRows = parseInt(rowsInput.value);
        let newCols = parseInt(colsInput.value);
        
        // Validate input
        if (isNaN(newRows) || isNaN(newCols)) {
            alert('Please enter valid numbers for rows and columns.');
            return;
        }
        
        // Enforce size limits
        newRows = Math.max(MIN_GRID_SIZE, Math.min(MAX_GRID_SIZE, newRows));
        newCols = Math.max(MIN_GRID_SIZE, Math.min(MAX_GRID_SIZE, newCols));
        
        // Update input fields with sanitized values
        rowsInput.value = newRows;
        colsInput.value = newCols;
        
        // Stop any running algorithm
        if (this.pathfinder && this.pathfinder.isRunning) {
            this.pathfinder.stop();
        }
        
        // Resize the grid
        this.grid.resize(newRows, newCols);
        
        // Recalculate dimensions and redraw
        this.renderer.calculateDimensions();
        this.renderer.drawGrid();
    }
}

export default UI;