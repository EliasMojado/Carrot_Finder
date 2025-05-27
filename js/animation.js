import assetLoader from './assetLoader.js';
import { ANIMATIONS, ASSETS } from './constants.js';

class SpriteAnimation {
    constructor() {
        this.animations = {};
        this.currentFrame = 0;
        this.lastFrameTime = 0;
        this.isPlaying = false;
    }

    // Create a new animation
    createAnimation(name, spritesheetKey, animConfig) {
        const spritesheet = assetLoader.getAsset(spritesheetKey);
        if (!spritesheet) {
            console.error(`Spritesheet not found: ${spritesheetKey}`);
            return this;
        }

        this.animations[name] = {
            spritesheet,
            row: animConfig.row || 0,
            frames: animConfig.frames || 1,
            frameTime: animConfig.frameTime || 200,
            col: animConfig.col || 0, // For static sprites
            isStatic: !animConfig.frames // If frames is not specified, it's a static sprite
        };

        return this;
    }

    // Start playing an animation
    play(name, loop = true) {
        const animation = this.animations[name];
        if (!animation) {
            console.error(`Animation not found: ${name}`);
            return this;
        }

        this.currentAnimation = name;
        this.currentFrame = 0;
        this.isPlaying = true;
        this.isLooping = loop;
        this.lastFrameTime = performance.now();

        return this;
    }

    // Stop the current animation
    stop() {
        this.isPlaying = false;
        return this;
    }

    // Update the animation
    update(timestamp) {
        if (!this.isPlaying) return;

        const animation = this.animations[this.currentAnimation];
        if (!animation || animation.isStatic) return;

        if (timestamp - this.lastFrameTime > animation.frameTime) {
            this.currentFrame = (this.currentFrame + 1) % animation.frames;
            this.lastFrameTime = timestamp;

            if (this.currentFrame === 0 && !this.isLooping) {
                this.isPlaying = false;
                this.onAnimationComplete && this.onAnimationComplete(this.currentAnimation);
            }
        }
    }

    // Draw the current animation frame
    draw(ctx, x, y, width, height) {
        if (!this.currentAnimation) {
            console.log("No current animation set");
            return;
        }

        const animation = this.animations[this.currentAnimation];
        if (!animation) {
            console.log(`Animation not found: ${this.currentAnimation}`);
            return;
        }

        const spritesheet = animation.spritesheet;
        if (!spritesheet || !spritesheet.complete) {
            console.log(`Spritesheet not ready: ${this.currentAnimation}`);
            return;
        }

        // Draw a red border so we can see where we're trying to draw
        // ctx.strokeStyle = 'red';
        // ctx.strokeRect(x, y, width, height);

        try {
            const frameCol = animation.isStatic ? animation.col : this.currentFrame;
            const frameRow = animation.row;
            const tileSize = spritesheet.width / 4; // Assuming 4 frames per row
            
            ctx.drawImage(
                spritesheet,
                frameCol * tileSize,
                frameRow * tileSize,
                tileSize,
                tileSize,
                x,
                y,
                width,
                height
            );
        } catch (error) {
            console.error('Error drawing sprite:', error);
        }
    }

    // Set a callback for when an animation completes
    onComplete(callback) {
        this.onAnimationComplete = callback;
        return this;
    }
}

export default SpriteAnimation;