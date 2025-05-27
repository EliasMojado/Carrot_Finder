// Grid settings
export const MIN_GRID_SIZE = 6;
export const MAX_GRID_SIZE = 30;

// Cell types
export const CELL_TYPES = {
    EMPTY: 0,
    OBSTACLE: 1,
    START: 2,
    END: 3,
    PATH: 4,
    VISITED: 5,
    TILLED_DIRT: 6,
    PLANT: 7
};

// Cell colors for different cell types
export const CELL_COLORS = {
    [CELL_TYPES.EMPTY]: '#ffffff',
    [CELL_TYPES.OBSTACLE]: '#333333',
    [CELL_TYPES.START]: '#4CAF50',
    [CELL_TYPES.END]: '#F44336',
    [CELL_TYPES.PATH]: '#08ccf7',
    [CELL_TYPES.VISITED]: '#c0ff63',
    [CELL_TYPES.TILLED_DIRT]: '#8B4513'
};

// Asset configuration
export const ASSETS = {
    GRASS_TILESET: 'assets/Grass.png',
    TILLED_DIRT_TILESET: 'assets/Tilled_Dirt.png',
    WATER_TILESET: 'assets/Water.png',
    BUNNY_SPRITE: 'assets/Bunny.png',
    CHEST_SPRITE: 'assets/Chest.png',
    CARROT: 'assets/Carrot.png',
    PLANTS_TILESET: 'assets/plants.png',
    TILE_SIZE: 16
};

export const ANIMATIONS = {
    BUNNY: {
        IDLE: {row: 0, frames: 2, frameTime: 500},
        DOWN: {row: 0, frames: 4, frameTime: 150},
        UP: {row: 1, frames: 4, frameTime: 150},
        LEFT: {row: 2, frames: 4, frameTime: 150},
        RIGHT: {row: 3, frames: 4, frameTime: 150}
    },
    CHEST: {
        CLOSED: {row: 0, col: 0},
        OPENING: {row: 0, frames: 4, frameTime: 200}
    }
}

// Transparency levels for overlays
export const TRANSPARENCY = {
    VISITED: 0.3,
    PATH: 0.6,
    OBSTACLE: 0.8,
    START_END: 0.8
};