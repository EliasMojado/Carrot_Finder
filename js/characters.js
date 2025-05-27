import SpriteAnimation from './animation.js';
import { ANIMATIONS } from './constants.js';
import assetLoader from './assetLoader.js';

export class BunnyCharacter {
    constructor(grid, renderer) {
        this.grid = grid;
        this.renderer = renderer;
        this.animation = new SpriteAnimation();
        
        // Initialize animations
        this.animation
            .createAnimation('idle', 'bunnySprite', ANIMATIONS.BUNNY.IDLE)
            .createAnimation('walk_down', 'bunnySprite', ANIMATIONS.BUNNY.DOWN)
            .createAnimation('walk_up', 'bunnySprite', ANIMATIONS.BUNNY.UP)
            .createAnimation('walk_left', 'bunnySprite', ANIMATIONS.BUNNY.LEFT)
            .createAnimation('walk_right', 'bunnySprite', ANIMATIONS.BUNNY.RIGHT);

        // Start with idle animation
        this.animation.play('idle', true);
        
        // Position
        this.currentPosition = null;
        this.targetPosition = null;
        this.path = [];
        this.isMoving = false;
        this.moveSpeed = 0.05; // Movement progress per frame (0-1)
        this.moveProgress = 0;
        this.facingDirection = 'down';

        grid.setOnBunnyPositionReset((position) => {
            this.setPosition({ row: position.row, col: position.col });
            // Return a promise that resolves in the next frame to ensure visuals update
            return new Promise(resolve => setTimeout(resolve, 50));
        });
    }

    // Set the bunny's position to the start cell
    setPosition(cell) {
        this.currentPosition = { row: cell.row, col: cell.col };
        this.targetPosition = null;
        this.moveProgress = 0;
        this.isMoving = false;
        this.path = [];
    }

    // Set path for the bunny to follow
    setPath(path) {
        // Clone the path
        this.path = [...path];
        
        // If we already have a position, remove the first node (start position)
        if (this.currentPosition && this.path.length > 0) {
            this.path.shift();
        }
        
        // Start moving if we have a path
        if (this.path.length > 0) {
            this.targetPosition = { row: this.path[0].row, col: this.path[0].col };
            this.moveProgress = 0;
            this.isMoving = true;
            this._updateMoveAnimation();
        }
    }

    // Update animation based on movement direction
    _updateMoveAnimation() {
        if (!this.currentPosition || !this.targetPosition) {
            this.animation.play('idle', true);
            return;
        }

        // Determine direction
        const dx = this.targetPosition.col - this.currentPosition.col;
        const dy = this.targetPosition.row - this.currentPosition.row;
        
        if (dx > 0) {
            this.animation.play('walk_right');
        } else if (dx < 0) {
            this.animation.play('walk_left');
        } else if (dy > 0) {
            this.animation.play('walk_down');
        } else if (dy < 0) {
            this.animation.play('walk_up');
        }
    }

    // Update bunny animation state and position
    update(timestamp) {
        // Update the animation
        this.animation.update(timestamp);

        // Update position if moving
        if (this.isMoving && this.targetPosition) {
            this.moveProgress += this.moveSpeed;
            
            // Reached target position
            if (this.moveProgress >= 1) {
                this.currentPosition = { ...this.targetPosition };
                this.path.shift();
                
                // If there are more points in the path, set the next target
                if (this.path.length > 0) {
                    this.targetPosition = { row: this.path[0].row, col: this.path[0].col };
                    this.moveProgress = 0;
                    this._updateMoveAnimation();
                } else {
                    // Path complete
                    this.targetPosition = null;
                    this.isMoving = false;
                    this.animation.play('idle', true);
                    this.onPathComplete && this.onPathComplete();
                }
            }
        }
    }

    // Draw the bunny at its current position
    draw(ctx) {
        if (!this.currentPosition) return;

        // Check if animation is ready
        if (!this.animation || !this.animation.animations[this.animation.currentAnimation]) {
            console.log("Bunny animation not ready yet");
            return;
        }
        
        let drawX, drawY;
        
        if (this.isMoving && this.targetPosition) {
            // Interpolate position
            const startX = this.renderer.offsetX + this.currentPosition.col * this.renderer.cellSize;
            const startY = this.renderer.offsetY + this.currentPosition.row * this.renderer.cellSize;
            const endX = this.renderer.offsetX + this.targetPosition.col * this.renderer.cellSize;
            const endY = this.renderer.offsetY + this.targetPosition.row * this.renderer.cellSize;
            
            drawX = startX + (endX - startX) * this.moveProgress;
            drawY = startY + (endY - startY) * this.moveProgress;
        } else {
            drawX = this.renderer.offsetX + this.currentPosition.col * this.renderer.cellSize;
            drawY = this.renderer.offsetY + this.currentPosition.row * this.renderer.cellSize;
        }
        
        // Draw the bunny
        this.animation.draw(ctx, drawX, drawY, this.renderer.cellSize, this.renderer.cellSize);
    }

    // Set callback for path completion
    onPathCompleted(callback) {
        this.onPathComplete = callback;
    }

    // Check if the bunny is still moving along a path
    isFollowingPath() {
        return this.isMoving && this.path.length > 0;
    }
}

export class CarrotGoal {
    constructor(grid, renderer) {
        this.grid = grid;
        this.renderer = renderer;
        this.position = null;
        this.carrotImg = assetLoader.getAsset('carrot');
        
        // Animation properties for bouncing effect
        this.bounceHeight = 10;  // Max height in pixels for bounce
        this.bounceSpeed = 0.02; // Speed of bounce animation
        this.bounceProgress = 0; // Current position in bounce cycle
        this.bounceDirection = 1; // 1 for up, -1 for down
        
        // Shrink animation properties
        this.normalSize = 0.7;  // Normal size multiplier
        this.shrinkSize = 0.3;  // Size when being "eaten"
        this.currentSize = this.normalSize;  // Current size
        this.shrinking = false;  // Whether carrot is shrinking
        this.bunnyReached = false;  // Whether bunny has reached the carrot
    }

    // Set the carrot's position
    setPosition(cell) {
        this.position = { row: cell.row, col: cell.col };
        this.resetCarrot();
    }

    resetCarrot() {
        this.currentSize = this.normalSize;
        this.bunnyReached = false;
        this.shrinking = false;
    }
    
    // Check if bunny has reached the carrot
    checkBunnyCollision(bunnyPosition) {
        if (!this.position || !bunnyPosition) return false;
        
        if (bunnyPosition.row === this.position.row && 
            bunnyPosition.col === this.position.col) {
            // Bunny has reached the carrot
            if (!this.bunnyReached) {
                this.bunnyReached = true;
                this.shrinking = true;
            }
            return true;
        }
        return false;
    }

    // Add update method for bouncing and shrinking animations
    update(timestamp) {
        const effectiveBounceSpeed = this.bunnyReached ? 0.05 : this.bounceSpeed;

        // Update bounce animation (reduce bounce when bunny reaches)
        const effectiveBounceHeight = this.bunnyReached ? 1 : this.bounceHeight;
        
        this.bounceProgress += effectiveBounceSpeed * this.bounceDirection;
        
        // Reverse direction at the top and bottom of bounce
        if (this.bounceProgress >= 1) {
            this.bounceProgress = 1;
            this.bounceDirection = -1;
        } else if (this.bounceProgress <= 0) {
            this.bounceProgress = 0;
            this.bounceDirection = 1;
        }
        
        // Update shrink animation
        if (this.shrinking) {
            // Gradually shrink the carrot
            this.currentSize = Math.max(this.shrinkSize, this.currentSize - 0.01);
            
            // Stop shrinking once we reach the target size
            if (this.currentSize <= this.shrinkSize) {
                this.shrinking = false;
            }
        }
    }

    // Draw the carrot with bounce animation
    // Update the draw method in CarrotGoal class

    draw(ctx) {
        if (!this.position || !this.carrotImg) return;
        
        // Calculate base position
        const drawX = this.renderer.offsetX + this.position.col * this.renderer.cellSize;
        const drawY = this.renderer.offsetY + this.position.row * this.renderer.cellSize;
        
        // Size the carrot based on current size state
        const carrotWidth = this.renderer.cellSize * this.currentSize;
        const carrotHeight = this.renderer.cellSize * this.currentSize;
        
        // Center horizontally in the cell
        const centerX = drawX + (this.renderer.cellSize - carrotWidth) / 2;
        
        // Calculate how much the carrot has shrunk as a percentage
        const shrinkPercentage = 1 - ((this.currentSize - this.shrinkSize) / (this.normalSize - this.shrinkSize));
        
        // Apply additional downward offset when shrunk - max 10px when fully shrunk
        const shrinkOffset = this.bunnyReached ? (5 * shrinkPercentage) : 0;
        
        // Apply bouncing effect - use a sine wave for smooth bouncing
        const effectiveBounceHeight = this.bunnyReached ? 2 : this.bounceHeight;
        const bounceOffset = Math.sin(this.bounceProgress * Math.PI) * effectiveBounceHeight;
        
        // Calculate final vertical position with both bouncing and shrinking effects
        const centerY = drawY + (this.renderer.cellSize - carrotHeight) / 2 - bounceOffset + shrinkOffset;
        
        // Save context state to restore later
        ctx.save();
        
        // Disable image smoothing to keep pixel art crisp
        ctx.imageSmoothingEnabled = false;
        
        // Draw the carrot with improved rendering
        ctx.drawImage(this.carrotImg, 
                    Math.round(centerX), Math.round(centerY), 
                    Math.round(carrotWidth), Math.round(carrotHeight));
        
        // Restore context state
        ctx.restore();
    }
}