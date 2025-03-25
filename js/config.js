/**
 * Game Configuration
 * Contains all the settings and constants for the game
 */
const CONFIG = {
    // Game world settings
    WORLD: {
        WIDTH: 5000,
        HEIGHT: 5000,
        BACKGROUND_COLOR: '#111',
        GRID_SIZE: 50,
        GRID_COLOR: '#222',
        BORDER_COLOR: '#444'
    },
    
    // Player settings
    PLAYER: {
        INITIAL_SIZE: 10,
        SPEED: 3,
        BOOST_SPEED: 5,
        BOOST_CONSUMPTION: 0.05,
        TURN_SPEED: 0.15,
        MIN_SEGMENTS_FOR_BOOST: 5,
        COLOR: '#4a90e2',
        HEAD_COLOR: '#357abd',
        SEGMENT_SPACING: 5,
        SEGMENT_RADIUS: 10
    },
    
    // NPC settings
    NPC: {
        TYPES: {
            NORMAL: {
                COLOR: '#4ae24a',
                HEAD_COLOR: '#35bd35',
                EXPLORE_CHANCE: 0.7,
                ATTACK_CHANCE: 0.2,
                FLEE_CHANCE: 0.1,
                DECISION_RATE: 30 // frames between decisions
            },
            AGGRESSIVE: {
                COLOR: '#e24a4a',
                HEAD_COLOR: '#bd3535',
                EXPLORE_CHANCE: 0.3,
                ATTACK_CHANCE: 0.6,
                FLEE_CHANCE: 0.1,
                DECISION_RATE: 20 // frames between decisions
            },
            COWARD: {
                COLOR: '#e2e24a',
                HEAD_COLOR: '#bdbd35',
                EXPLORE_CHANCE: 0.8,
                ATTACK_CHANCE: 0.05,
                FLEE_CHANCE: 0.15,
                DECISION_RATE: 40 // frames between decisions
            }
        },
        SPEED_MULTIPLIER: {
            EASY: 0.7,
            NORMAL: 1.0,
            HARD: 1.2
        },
        SIZE_LIMIT: {
            EASY: 5, // multiplier of player initial size
            NORMAL: 10,
            HARD: 15
        },
        INITIAL_SIZE: {
            EASY: { MIN: 5, MAX: 15 },
            NORMAL: { MIN: 10, MAX: 30 },
            HARD: { MIN: 20, MAX: 50 }
        },
        COUNT: {
            EASY: 20,
            NORMAL: 40,
            HARD: 60
        },
        TYPE_DISTRIBUTION: {
            EASY: {
                NORMAL: 0.7,
                AGGRESSIVE: 0.1,
                COWARD: 0.2
            },
            NORMAL: {
                NORMAL: 0.4,
                AGGRESSIVE: 0.3,
                COWARD: 0.3
            },
            HARD: {
                NORMAL: 0.3,
                AGGRESSIVE: 0.4,
                COWARD: 0.3
            }
        },
        SEGMENT_SPACING: 5,
        VISION_RANGE: 500,
        DETECTION_RANGE: 300,
        ATTACK_RANGE: 200
    },
    
    // Food settings
    FOOD: {
        SIZE: 5,
        VALUE: 1,
        COLORS: ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'],
        COUNT: {
            EASY: 500,
            NORMAL: 400,
            HARD: 300
        },
        SPAWN_RATE: {
            EASY: 5,
            NORMAL: 3,
            HARD: 2
        }
    },
    
    // Death food settings
    DEATH_FOOD: {
        SIZE: 5,
        VALUE: 1,
        SPREAD_RADIUS: 100,
        MIN_COUNT: 10,
        MAX_COUNT: 50
    },
    
    // Quadtree settings
    QUADTREE: {
        MAX_OBJECTS: 10,
        MAX_LEVELS: 5
    },
    
    // Rendering settings
    RENDER: {
        FPS: 60,
        VIEWPORT_PADDING: 200
    },
    
    // UI settings
    UI: {
        LEADERBOARD_SIZE: 10,
        HIGHSCORE_COUNT: 5
    }
};
