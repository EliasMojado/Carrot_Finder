import { initAssets } from './assetLoader.js';
import Grid from './grid.js';
import GridRenderer from './drawing.js';
import UI from './ui.js';

// Add this function to resize the canvas
function resizeCanvas() {
    const canvas = document.getElementById('grid-canvas');
    const container = document.querySelector('.main-content');
    
    // Get container dimensions with padding taken into account
    const containerStyles = window.getComputedStyle(container);
    const paddingX = parseFloat(containerStyles.paddingLeft) + parseFloat(containerStyles.paddingRight);
    const paddingY = parseFloat(containerStyles.paddingTop) + parseFloat(containerStyles.paddingBottom);
    
    // Set canvas size to container size minus padding
    const containerWidth = container.clientWidth - paddingX;
    const containerHeight = container.clientHeight - paddingY;
    
    // Maintain a reasonable size - not too large for performance
    const maxSize = 1200;
    canvas.width = Math.min(containerWidth, maxSize);
    canvas.height = Math.min(containerHeight, maxSize);
    
    return { width: canvas.width, height: canvas.height };
}

// Main application initialization
async function initApp() {
    console.log('Initializing application...');
    
    // Set initial canvas size
    const canvasSize = resizeCanvas();
    const canvas = document.getElementById('grid-canvas');
    
    // Show loading message
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000000';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Loading assets...', canvas.width/2, canvas.height/2);
    
    try {
        // Wait for all assets to load
        await initAssets();
        console.log('Assets loaded successfully');
        
        // Now create grid and renderer
        const grid = new Grid(10, 10);
        const renderer = new GridRenderer(canvas, grid);
        
        // Initialize UI
        const ui = new UI(canvas, grid, renderer);
        grid.randomizeStartAndEnd();
        
        // Draw the initial grid
        renderer.drawGrid();
        
        // Add window resize handler...
    } catch (error) {
        console.error('Failed to load assets:', error);
        // Show error on canvas
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ff0000';
        ctx.fillText('Error loading assets!', canvas.width/2, canvas.height/2);
    }
}

// Start the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);