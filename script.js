// Canvas and grid settings
const canvas = document.getElementById('grid-canvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// Default grid dimensions
let gridRows = 10; // Default number of rows
let gridCols = 10; // Default number of columns
let cellSize; // Will be calculated to ensure square cells

// Grid size limits
const MIN_GRID_SIZE = 5;
const MAX_GRID_SIZE = 50;

// Grid state
let grid = [];

// Cell types
const CELL_TYPES = {
    EMPTY: 0,
    OBSTACLE: 1,
    START: 2,
    END: 3,
    PATH: 4,
    VISITED: 5
};

// Cell colors
const CELL_COLORS = {
    [CELL_TYPES.EMPTY]: '#ffffff',
    [CELL_TYPES.OBSTACLE]: '#333333',
    [CELL_TYPES.START]: '#4CAF50',
    [CELL_TYPES.END]: '#F44336',
    [CELL_TYPES.PATH]: '#2196F3',
    [CELL_TYPES.VISITED]: '#FFC107'
};

// Add these variables at the top with your other globals
const grassTileset = new Image();
let tilesetLoaded = false;
const tileSize = 16; // Default tile size in the tileset (pixels)
let tileVariants = []; // Will store positions of different tile variants

// Calculate cell size to maintain square cells
function calculateCellSize() {
    // Get the smaller dimension to ensure cells fit within canvas
    const maxCellWidthPossible = canvasWidth / gridCols;
    const maxCellHeightPossible = canvasHeight / gridRows;
    
    // Use the smaller of the two to ensure square cells
    cellSize = Math.min(maxCellWidthPossible, maxCellHeightPossible);
    
    // Calculate actual drawing dimensions (might not use full canvas)
    const actualGridWidth = cellSize * gridCols;
    const actualGridHeight = cellSize * gridRows;
    
    // Center the grid on the canvas
    gridOffsetX = (canvasWidth - actualGridWidth) / 2;
    gridOffsetY = (canvasHeight - actualGridHeight) / 2;
}

// Grid offset for centering
let gridOffsetX = 0;
let gridOffsetY = 0;

// Initialize the grid
function initializeGrid() {
    grid = [];
    for (let i = 0; i < gridRows; i++) {
        grid[i] = [];
        for (let j = 0; j < gridCols; j++) {
            // Store both the cell type and a random tile variant index
            grid[i][j] = {
                type: CELL_TYPES.EMPTY,
                tileVariant: Math.floor(Math.random() * tileVariants.length)
            };
        }
    }
    
    // Calculate cell size and offsets
    calculateCellSize();
}

// Draw the grid
function drawGrid() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw a background for the usable canvas area
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw cells based on their state
    for (let i = 0; i < gridRows; i++) {
        for (let j = 0; j < gridCols; j++) {
            const cell = grid[i][j];
            const cellType = cell.type;
            const x = gridOffsetX + j * cellSize;
            const y = gridOffsetY + i * cellSize;
            
            // Draw background tile if tileset is loaded
            if (tilesetLoaded && tileVariants.length > 0) {
                const variantIndex = cell.tileVariant; // Use the stored variant index
                const variant = tileVariants[variantIndex];
                
                ctx.drawImage(
                    grassTileset,
                    variant.x, variant.y, tileSize, tileSize, // Source rectangle
                    x, y, cellSize, cellSize // Destination rectangle
                );
            }
            
            // If cell is not empty, draw the cell type overlay
            if (cellType !== CELL_TYPES.EMPTY) {
                ctx.fillStyle = CELL_COLORS[cellType];
                
                // Use semi-transparent fill to let the tileset show through
                if (cellType === CELL_TYPES.VISITED) {
                    ctx.globalAlpha = 0.3; // More transparent for visited cells
                } else if (cellType === CELL_TYPES.PATH) {
                    ctx.globalAlpha = 0.6;
                } else {
                    ctx.globalAlpha = 0.8;
                }
                
                ctx.fillRect(x, y, cellSize, cellSize);
                ctx.globalAlpha = 1.0; // Reset transparency
            }
            
            // Draw cell border
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.strokeRect(x, y, cellSize, cellSize);
        }
    }
}

// Handle mouse click on the grid
function handleCanvasClick(event) {
    // Get mouse position relative to canvas
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Check if click is within the grid area
    if (
        x < gridOffsetX || 
        x > gridOffsetX + gridCols * cellSize || 
        y < gridOffsetY || 
        y > gridOffsetY + gridRows * cellSize
    ) {
        return; // Click outside the grid area
    }
    
    // Convert to grid coordinates
    const gridY = Math.floor((x - gridOffsetX) / cellSize);
    const gridX = Math.floor((y - gridOffsetY) / cellSize);
    
    // Make sure we're within bounds
    if (gridX >= 0 && gridX < gridRows && gridY >= 0 && gridY < gridCols) {
        // Toggle between empty and obstacle
        if (grid[gridX][gridY].type === CELL_TYPES.EMPTY) {
            grid[gridX][gridY].type = CELL_TYPES.OBSTACLE;
        } else {
            grid[gridX][gridY].type = CELL_TYPES.EMPTY;
        }
        
        // Redraw the grid
        drawGrid();
    }
}

// Reset the grid
function resetGrid() {
    initializeGrid();
    drawGrid();
}

// Resize the grid
function resizeGrid() {
    const rowsInput = document.getElementById('rows-input');
    const colsInput = document.getElementById('cols-input');
    
    let newRows = parseInt(rowsInput.value);
    let newCols = parseInt(colsInput.value);
    
    // Validate input values
    if (isNaN(newRows) || isNaN(newCols)) {
        alert('Please enter valid numbers for rows and columns.');
        return;
    }
    
    // Enforce size limits
    newRows = Math.max(MIN_GRID_SIZE, Math.min(MAX_GRID_SIZE, newRows));
    newCols = Math.max(MIN_GRID_SIZE, Math.min(MAX_GRID_SIZE, newCols));
    
    // Update input fields with the sanitized values
    rowsInput.value = newRows;
    colsInput.value = newCols;
    
    // Update grid dimensions
    gridRows = newRows;
    gridCols = newCols;
    
    // Initialize and redraw the grid
    initializeGrid();
    drawGrid();
}

// Add event listeners
canvas.addEventListener('click', handleCanvasClick);
document.getElementById('reset-btn').addEventListener('click', resetGrid);
document.getElementById('resize-btn').addEventListener('click', resizeGrid);

// Initialize form fields with default values
document.getElementById('rows-input').value = gridRows;
document.getElementById('cols-input').value = gridCols;

// Initialize and draw the grid when the page loads
window.onload = function() {
    initializeGrid();
    drawGrid();
};

// Add this function to analyze the tileset
function analyzeTileset() {
    // Determine available tiles in the tileset
    const tilesAcross = Math.floor(grassTileset.width / tileSize);
    console.log(`Tiles across: ${tilesAcross}`);
    const tilesDown = Math.floor(grassTileset.height / tileSize);
    console.log(`Tiles down: ${tilesDown}`);
    
    // Store positions of each tile variant
    tileVariants = [];
    for (let y = 5; y <= 6; y++) {
        for (let x = 0; x <= 5; x++) {
            tileVariants.push({
                x: x * tileSize,
                y: y * tileSize
            });
        }
    }
    
    console.log(`Loaded tileset with ${tileVariants.length} variants`);
}

// Initialize the tileset with error handling
grassTileset.onload = function() {
    analyzeTileset();
    tilesetLoaded = true;
    
    // Only redraw if we actually have tile variants
    if (tileVariants.length > 0) {
        drawGrid(); // Redraw the grid once the tileset is loaded
    } else {
        console.warn("Tileset loaded but no variants were detected");
        drawGrid(); // Still redraw, but will use default rendering
    }
};

grassTileset.onerror = function() {
    console.error("Failed to load tileset image at path: " + grassTileset.src);
    tilesetLoaded = false;
    drawGrid(); // Draw without tileset
};

grassTileset.src = 'assets/Grass.png'; // Set the source path to your image