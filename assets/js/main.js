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
    
    // Wait for assets to load
    try {
        await initAssets();
        console.log('Assets loaded successfully');
    } catch (error) {
        console.error('Failed to load assets:', error);
    }
    
    // Initialize the canvas with proper size
    const canvas = document.getElementById('grid-canvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    
    // Set initial canvas size
    resizeCanvas();
    
    // Create grid and renderer
    const grid = new Grid(10, 10); // Default 10x10 grid
    const renderer = new GridRenderer(canvas, grid);
    
    // Initialize UI
    const ui = new UI(canvas, grid, renderer);
    
    // Draw the initial grid
    renderer.drawGrid();
    
    // Add window resize event listener
    window.addEventListener('resize', () => {
        // Update canvas size
        resizeCanvas();
        // Recalculate rendering dimensions
        renderer.calculateDimensions();
        // Redraw the grid
        renderer.drawGrid();
    });
    
    console.log('Application initialized');
}

// Start the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);