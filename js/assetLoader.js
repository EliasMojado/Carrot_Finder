import { ASSETS } from './constants.js';

class AssetLoader {
    constructor() {
        this.assets = new Map();
        this.tilesets = new Map();
        this.tileVariants = new Map();
        this.loadingPromises = [];
    }

    // Load a single image
    loadImage(key, path) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.assets.set(key, img);
                console.log(`Loaded image: ${key}`);
                resolve(img);
            };
            img.onerror = (e) => {
                console.error(`Failed to load image: ${path}`, e);
                reject(new Error(`Failed to load image: ${path}`));
            };
            img.src = path;
        });
    }

    // Load multiple images
    loadImages(imageMap) {
        const promises = [];
        for (const [key, path] of Object.entries(imageMap)) {
            promises.push(this.loadImage(key, path));
        }
        this.loadingPromises.push(...promises);
        return Promise.all(promises);
    }

    // Process a tileset and extract specified tiles
    processTileset(key, tileSize, selections) {
        return new Promise((resolve, reject) => {
            const tileset = this.assets.get(key);
            if (!tileset) {
                const error = new Error(`Tileset not found: ${key}`);
                console.error(error);
                reject(error);
                return;
            }

            const variants = [];
            
            // Extract specified tile variants from the tileset
            for (const selection of selections) {
                const { startRow, endRow, startCol, endCol, name } = selection;
                const selectionVariants = [];
                
                for (let y = startRow; y <= endRow; y++) {
                    for (let x = startCol; x <= endCol; x++) {
                        if (x * tileSize < tileset.width && y * tileSize < tileset.height) {
                            selectionVariants.push({
                                x: x * tileSize,
                                y: y * tileSize
                            });
                        }
                    }
                }
                
                // Store the extracted variants
                this.tileVariants.set(name, selectionVariants);
                console.log(`Processed ${selectionVariants.length} variants for ${name}`);
            }

            resolve(variants);
        });
    }

    // Wait for all assets to load
    waitForLoad() {
        return Promise.all(this.loadingPromises);
    }

    // Get a loaded asset
    getAsset(key) {
        return this.assets.get(key);
    }

    // Get tile variants by name
    getTileVariants(name) {
        return this.tileVariants.get(name) || [];
    }
}

// Create and export singleton instance
const assetLoader = new AssetLoader();

// Set up initial assets
export function initAssets() {
    // Create a combined promise that waits for both loading AND processing
    return new Promise((resolve, reject) => {
        // Load initial images
        assetLoader.loadImages({
            'grassTileset': ASSETS.GRASS_TILESET,
            'waterTileset': ASSETS.WATER_TILESET,
            'bunnySprite': ASSETS.BUNNY_SPRITE,
            'chestSprite': ASSETS.CHEST_SPRITE,
            'tilledDirtTileset': ASSETS.TILLED_DIRT_TILESET,
            'carrot': ASSETS.CARROT,
            'plantsTileset': ASSETS.PLANTS_TILESET
        })
        .then(() => {
            // Process the grass tileset
            return assetLoader.processTileset('grassTileset', ASSETS.TILE_SIZE, [
                { 
                    startRow: 5, 
                    endRow: 6, 
                    startCol: 0, 
                    endCol: 5, 
                    name: 'normalGrass' 
                }
            ]);
        })
        .then(() => {
            return assetLoader.processTileset('tilledDirtTileset', ASSETS.TILE_SIZE, [
                { 
                    startRow: 5, 
                    endRow: 6, 
                    startCol: 0, 
                    endCol: 2, 
                    name: 'tilledDirtTiles' 
                }
            ]);
        })
        .then(()=>{
            // Process the water tileset
            return assetLoader.processTileset('waterTileset', ASSETS.TILE_SIZE, [
                { 
                    startRow: 0, 
                    endRow: 0, 
                    startCol: 0, 
                    endCol: 3, 
                    name: 'waterTiles' 
                }
            ]);
        })
        .then(()=>{
            return assetLoader.processTileset('bunnySprite', ASSETS.TILE_SIZE, [
                { 
                    startRow: 0, 
                    endRow: 0, 
                    startCol: 0, 
                    endCol: 3, 
                    name: 'bunnyDown' 
                },
                { 
                    startRow: 1, 
                    endRow: 1, 
                    startCol: 0, 
                    endCol: 3, 
                    name: 'bunnyUp' 
                },
                { 
                    startRow: 2, 
                    endRow: 2, 
                    startCol: 0, 
                    endCol: 3, 
                    name: 'bunnyLeft' 
                },
                { 
                    startRow: 3, 
                    endRow: 3, 
                    startCol: 0, 
                    endCol: 3, 
                    name: 'bunnyRight' 
                }
            ]);
        })
        .then(()=>{
            return assetLoader.processTileset('chestSprite', ASSETS.TILE_SIZE, [
                { 
                    startRow: 0, 
                    endRow: 0, 
                    startCol: 0, 
                    endCol: 4, 
                    name: 'chestOpening' 
                }
            ]);
        })
        .then(() => {
            return assetLoader.processTileset('plantsTileset', ASSETS.TILE_SIZE, [
                {
                    startRow: 3,
                    endRow: 3,
                    startCol: 0,
                    endCol: 1,
                    name: 'plants'
                }
            ]);
        })
        .then(() => {
            console.log('All assets loaded and processed');
            resolve(); // Only resolve when BOTH steps are complete
        })
        .catch(error => {
            console.error('Error loading or processing assets:', error);
            reject(error);
        });
    });
}

export default assetLoader;