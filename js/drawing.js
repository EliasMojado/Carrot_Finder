import { CELL_TYPES, CELL_COLORS, TRANSPARENCY } from './constants.js';
import assetLoader from './assetLoader.js';
// Update import to use CarrotGoal instead of TreasureChest
import { BunnyCharacter, CarrotGoal } from './characters.js';

class GridRenderer {
    constructor(canvas, grid) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        this.grid = grid;
        this.cellSize = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        
        // Character sprites - replace chest with carrot
        this.bunny = new BunnyCharacter(grid, this);
        this.carrot = new CarrotGoal(grid, this);
        
        // Animation properties
        this.animationFrame = 0;
        this.animationSpeed = 500;
        this.lastFrameTime = 0;
        this.animationFrameId = null;
        
        // Calculate initial dimensions
        this.calculateDimensions();
        
        // Start the animation loop
        this.startAnimationLoop();
    }

    // Calculate cell size and grid positioning
    calculateDimensions() {
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        
        // Calculate cell size to maintain square cells
        const maxCellWidthPossible = canvasWidth / this.grid.cols;
        const maxCellHeightPossible = canvasHeight / this.grid.rows;
        this.cellSize = Math.min(maxCellWidthPossible, maxCellHeightPossible);
        
        // Ensure cell size is at least 10 pixels
        this.cellSize = Math.max(this.cellSize, 10);
        
        // Center the grid on the canvas
        const actualGridWidth = this.cellSize * this.grid.cols;
        const actualGridHeight = this.cellSize * this.grid.rows;
        this.offsetX = (canvasWidth - actualGridWidth) / 2;
        this.offsetY = (canvasHeight - actualGridHeight) / 2;
    }

    // Draw the entire grid
    drawGrid() {
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Get tile variants
        const grassVariants = assetLoader.getTileVariants('normalGrass');
        const waterVariants = assetLoader.getTileVariants('waterTiles');
        const tilledDirtVariants = assetLoader.getTileVariants('tilledDirtTiles');
        const plantVariants = assetLoader.getTileVariants('plants');

        const grassTileset = assetLoader.getAsset('grassTileset');
        const waterTileset = assetLoader.getAsset('waterTileset');
        const tilledDirtTileset = assetLoader.getAsset('tilledDirtTileset');
        const plantsTileset = assetLoader.getAsset('plantsTileset');

        const grassTilesAvailable = grassVariants.length > 0 && grassTileset;
        const waterTilesAvailable = waterVariants.length > 0 && waterTileset;
        const tilledDirtTilesAvailable = tilledDirtVariants.length > 0 && tilledDirtTileset;
        const plantAvailable = plantVariants.length > 0 && plantsTileset;

        if (
            (!grassTilesAvailable && grassTileset) ||
            (!waterTilesAvailable && waterTileset) ||
            (!tilledDirtTilesAvailable && tilledDirtTileset) ||
            (plantVariants.length > 0 && !plantAvailable)
        ) {
            console.log('Some tiles not processed yet, waiting...');
            setTimeout(() => this.drawGrid(), 100);
            return;
        }

        // Draw each cell
        for (let i = 0; i < this.grid.rows; i++) {
            for (let j = 0; j < this.grid.cols; j++) {
                const cell = this.grid.getCell(i, j);
                const x = this.offsetX + j * this.cellSize;
                const y = this.offsetY + i * this.cellSize;

                try {
                    // Decide which tile to draw based on cell type
                    if (cell.type === CELL_TYPES.OBSTACLE && waterTilesAvailable) {
                        // Use animation frame instead of random variant for water
                        const variant = waterVariants[this.animationFrame % waterVariants.length];
                        
                        this.ctx.drawImage(
                            waterTileset,
                            variant.x, variant.y, 16, 16, // Source rectangle (16x16 tiles)
                            x, y, this.cellSize, this.cellSize // Destination rectangle
                        );
                    } else if (cell.type === CELL_TYPES.TILLED_DIRT && tilledDirtTilesAvailable) {
                        // Draw tilled dirt tiles for path
                        const variantIndex = cell.tilledDirtVariant % tilledDirtVariants.length || 0;
                        const variant = tilledDirtVariants[variantIndex];
                        
                        this.ctx.drawImage(
                            tilledDirtTileset,
                            variant.x, variant.y, 16, 16,
                            x, y, this.cellSize, this.cellSize
                        );
                    } else if (grassTilesAvailable) {
                        // Draw grass tile for non-obstacle cells
                        const variantIndex = cell.tileVariant % grassVariants.length;
                        const variant = grassVariants[variantIndex];
                        
                        this.ctx.drawImage(
                            grassTileset,
                            variant.x, variant.y, 16, 16, // Source rectangle (16x16 tiles)
                            x, y, this.cellSize, this.cellSize // Destination rectangle
                        );
                    }
                }catch (error) {
                    console.error(`Error drawing cell at (${i}, ${j}):`, error);
                }
                
                // Draw plant sprite above grass - PLANTS ARE PRESERVED!
                if (cell.type === CELL_TYPES.PLANT && plantAvailable) {
                    const variantIndex = cell.plantVariant % plantVariants.length;
                    const variant = plantVariants[variantIndex];
                    this.ctx.drawImage(
                        plantsTileset,
                        variant.x, variant.y, 16, 16,
                        x, y, this.cellSize, this.cellSize
                    );
                }

                // Show path indication for non-plant cells
                if (cell.type === CELL_TYPES.PATH) {
                    this.ctx.fillStyle = CELL_COLORS[CELL_TYPES.PATH];
                    this.ctx.globalAlpha = TRANSPARENCY.PATH;
                    this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
                    this.ctx.globalAlpha = 1.0;
                }

                // Show path indication for plants on the path with a subtle overlay
                if (cell.isOnPath && cell.type === CELL_TYPES.PLANT) {
                    this.ctx.fillStyle = CELL_COLORS[CELL_TYPES.PATH];
                    this.ctx.globalAlpha = 0.2; // More subtle for plants
                    this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
                    this.ctx.globalAlpha = 1.0;
                }

                // Standard thin borders for all cells
                this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(x, y, this.cellSize, this.cellSize);
            }
        }

        // Draw visited cell borders - now check the visited PROPERTY instead of cell type
        for (let i = 0; i < this.grid.rows; i++) {
            for (let j = 0; j < this.grid.cols; j++) {
                const cell = this.grid.getCell(i, j);
                // ↓ Check visited property instead of cell type!
                if (cell.visited && cell.type !== CELL_TYPES.START && cell.type !== CELL_TYPES.END) {
                    const x = this.offsetX + j * this.cellSize;
                    const y = this.offsetY + i * this.cellSize;
                    
                    // Draw a thicker, brighter border for visited cells
                    this.ctx.strokeStyle = CELL_COLORS[CELL_TYPES.VISITED]; // Use the visited color
                    this.ctx.lineWidth = 3; // Thicker line
                    this.ctx.strokeRect(x, y, this.cellSize, this.cellSize);
                    
                    // Reset line width for next drawings
                    this.ctx.lineWidth = 1;
                }
            }
        }
        
        // Draw character sprites
        this.bunny.draw(this.ctx);
        this.carrot.draw(this.ctx);
    }

    // Convert canvas coordinates to grid coordinates
    canvasToGridCoordinates(canvasX, canvasY) {
        // Check if click is within grid boundaries
        if (
            canvasX < this.offsetX || 
            canvasX > this.offsetX + this.grid.cols * this.cellSize || 
            canvasY < this.offsetY || 
            canvasY > this.offsetY + this.grid.rows * this.cellSize
        ) {
            return null;
        }
        
        // Convert to grid coordinates
        const gridCol = Math.floor((canvasX - this.offsetX) / this.cellSize);
        const gridRow = Math.floor((canvasY - this.offsetY) / this.cellSize);
        
        return { row: gridRow, col: gridCol };
    }
    
    // Update the startAnimationLoop method
    startAnimationLoop() {
        const animate = (timestamp) => {
            try {
                let shouldRedraw = false;

                if (timestamp - this.lastFrameTime > this.animationSpeed) {
                    this.lastFrameTime = timestamp;
                    this.animationFrame = (this.animationFrame + 1) % 4;
                    shouldRedraw = true;
                }

                // Update character animations
                this.bunny.update(timestamp);
                this.carrot.update(timestamp);
                
                // Check if bunny reached carrot
                if (this.bunny.currentPosition && this.carrot.position) {
                    this.carrot.checkBunnyCollision(this.bunny.currentPosition);
                }
                
                // Redraw if needed - always redraw for animations
                if (shouldRedraw || this.bunny.isFollowingPath() || this.carrot.position) {
                    this.drawGrid();
                }
            } catch (error) {
                console.error('Error in animation loop:', error);
            }
            
            this.animationFrameId = requestAnimationFrame(animate);
        };
        
        this.animationFrameId = requestAnimationFrame(animate);
    }
    
    // Modify the existing methods to properly handle character positions
    setStartCell(cell) {
        this.bunny.setPosition(cell);
        this.carrot.resetCarrot();
        this.drawGrid();
    }

    // Update the setEndCell method to use carrot instead of chest
    setEndCell(cell) {
        this.carrot.setPosition(cell);
        this.carrot.resetCarrot();
        this.drawGrid(); 
    }

    // Simplify visualizePath as we don't need chest animations anymore
    visualizePath(path) {
        this.carrot.resetCarrot();

        this.grid.setPathAsTilledDirt(path);

        // Set the bunny to follow the path
        this.bunny.setPath(path);
        
        // No need for chest opening animation anymore
        this.bunny.onPathCompleted(() => {
            // Bunny reached the carrot - could show a message if needed
        });
    }
}

export default GridRenderer;