// Grid settings
export const MIN_GRID_SIZE = 5;
export const MAX_GRID_SIZE = 50;

// Cell types
export const CELL_TYPES = {
    EMPTY: 0,
    OBSTACLE: 1,
    START: 2,
    END: 3,
    PATH: 4,
    VISITED: 5
};

// Cell colors for different cell types
export const CELL_COLORS = {
    [CELL_TYPES.EMPTY]: '#ffffff',
    [CELL_TYPES.OBSTACLE]: '#333333',
    [CELL_TYPES.START]: '#4CAF50',
    [CELL_TYPES.END]: '#F44336',
    [CELL_TYPES.PATH]: '#2196F3',
    [CELL_TYPES.VISITED]: '#FFC107'
};

// Asset configuration
export const ASSETS = {
    GRASS_TILESET: 'assets/Grass.png',
    WATER_TILESET: 'assets/Water.png',
    TILE_SIZE: 16
};

// Transparency levels for overlays
export const TRANSPARENCY = {
    VISITED: 0.3,
    PATH: 0.6,
    OBSTACLE: 0.8,
    START_END: 0.8
};