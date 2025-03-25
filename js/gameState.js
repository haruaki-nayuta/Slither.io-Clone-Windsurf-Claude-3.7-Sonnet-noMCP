/**
 * GameState class to manage the game state
 */
class GameState {
    /**
     * Create a new game state
     */
    constructor() {
        this.entities = [];
        this.player = null;
        this.gameMap = null;
        this.collisionSystem = null;
        this.difficulty = 'normal';
        this.isRunning = false;
        this.frameCount = 0;
        this.spawnCounter = 0;
    }
    
    /**
     * Initialize the game state
     * @param {string} difficulty - Game difficulty
     */
    init(difficulty) {
        // Set difficulty
        this.difficulty = difficulty.toUpperCase();
        
        // Create game map
        this.gameMap = new GameMap();
        
        // Create collision system
        this.collisionSystem = new CollisionSystem();
        this.collisionSystem.initQuadtree(CONFIG.WORLD.WIDTH, CONFIG.WORLD.HEIGHT);
        
        // Create player
        const playerPos = this.gameMap.getRandomPosition();
        this.player = new Player(playerPos.x, playerPos.y);
        this.entities.push(this.player);
        
        // Create NPCs
        this.createNPCs();
        
        // Create initial food
        this.createInitialFood();
        
        // Start game
        this.isRunning = true;
        this.frameCount = 0;
    }
    
    /**
     * Create NPCs based on difficulty
     */
    createNPCs() {
        const npcCount = CONFIG.NPC.COUNT[this.difficulty];
        const distribution = CONFIG.NPC.TYPE_DISTRIBUTION[this.difficulty];
        
        for (let i = 0; i < npcCount; i++) {
            // Determine NPC type based on distribution
            const typeRoll = Math.random();
            let npcType;
            
            if (typeRoll < distribution.NORMAL) {
                npcType = 'NORMAL';
            } else if (typeRoll < distribution.NORMAL + distribution.AGGRESSIVE) {
                npcType = 'AGGRESSIVE';
            } else {
                npcType = 'COWARD';
            }
            
            // Determine NPC size based on difficulty
            const sizeConfig = CONFIG.NPC.INITIAL_SIZE[this.difficulty];
            const size = Utils.random(sizeConfig.MIN, sizeConfig.MAX);
            
            // Create NPC away from player
            const npcPos = this.gameMap.getRandomPositionAwayFromEntities(
                [this.player],
                200,
                100,
                10
            );
            
            const npc = new NPC(npcPos.x, npcPos.y, size, npcType, this.difficulty);
            this.entities.push(npc);
        }
    }
    
    /**
     * Create initial food
     */
    createInitialFood() {
        const foodCount = CONFIG.FOOD.COUNT[this.difficulty];
        
        for (let i = 0; i < foodCount; i++) {
            const foodPos = this.gameMap.getRandomPosition();
            const food = new Food(foodPos.x, foodPos.y);
            this.entities.push(food);
        }
    }
    
    /**
     * Spawn new food
     */
    spawnFood() {
        const spawnRate = CONFIG.FOOD.SPAWN_RATE[this.difficulty];
        
        // Increment spawn counter
        this.spawnCounter++;
        
        // Spawn food based on spawn rate
        if (this.spawnCounter >= spawnRate) {
            const foodPos = this.gameMap.getRandomPosition();
            const food = new Food(foodPos.x, foodPos.y);
            this.entities.push(food);
            
            this.spawnCounter = 0;
        }
    }
    
    /**
     * Update the game state
     */
    update() {
        if (!this.isRunning) return;
        
        // Increment frame count
        this.frameCount++;
        
        // Update collision system
        this.collisionSystem.updateQuadtree(this.entities);
        
        // Update player
        const droppedFood = this.player.update();
        if (droppedFood) this.entities.push(droppedFood);
        
        // Update NPCs
        for (const entity of this.entities) {
            if (entity.type === 'npc' && !entity.markedForDeletion) {
                const droppedFood = entity.update(this.entities, this.collisionSystem.getQuadtree());
                if (droppedFood) this.entities.push(droppedFood);
            } else if (entity.type === 'food' || entity.type === 'deathFood') {
                entity.update();
            }
        }
        
        // Check collisions
        const newEntities = this.collisionSystem.checkCollisions(this.entities, this.player);
        this.entities.push(...newEntities);
        
        // Remove deleted entities
        this.entities = this.entities.filter(entity => !entity.markedForDeletion);
        
        // Spawn new food
        this.spawnFood();
        
        // Check if player is dead
        if (this.player.markedForDeletion) {
            this.isRunning = false;
            document.dispatchEvent(new CustomEvent('game:over', { detail: this.player.getStats() }));
        }
        
        // Ensure NPC count is maintained
        this.maintainNPCCount();
    }
    
    /**
     * Maintain NPC count
     */
    maintainNPCCount() {
        // Count current NPCs
        const npcCount = this.entities.filter(e => e.type === 'npc').length;
        const targetCount = CONFIG.NPC.COUNT[this.difficulty];
        
        // Spawn new NPCs if needed
        if (npcCount < targetCount) {
            const numToSpawn = targetCount - npcCount;
            
            for (let i = 0; i < numToSpawn; i++) {
                // Determine NPC type based on distribution
                const distribution = CONFIG.NPC.TYPE_DISTRIBUTION[this.difficulty];
                const typeRoll = Math.random();
                let npcType;
                
                if (typeRoll < distribution.NORMAL) {
                    npcType = 'NORMAL';
                } else if (typeRoll < distribution.NORMAL + distribution.AGGRESSIVE) {
                    npcType = 'AGGRESSIVE';
                } else {
                    npcType = 'COWARD';
                }
                
                // Determine NPC size based on difficulty and game progress
                const sizeConfig = CONFIG.NPC.INITIAL_SIZE[this.difficulty];
                let minSize = sizeConfig.MIN;
                let maxSize = sizeConfig.MAX;
                
                // Increase size based on game progress (every 30 seconds)
                const gameTimeMinutes = this.frameCount / (60 * 60); // Frames to minutes
                minSize += Math.min(50, gameTimeMinutes * 5);
                maxSize += Math.min(100, gameTimeMinutes * 10);
                
                const size = Utils.random(minSize, maxSize);
                
                // Create NPC away from player
                const npcPos = this.gameMap.getRandomPositionAwayFromEntities(
                    [this.player],
                    300,
                    100,
                    10
                );
                
                const npc = new NPC(npcPos.x, npcPos.y, size, npcType, this.difficulty);
                this.entities.push(npc);
            }
        }
    }
    
    /**
     * Reset the game state
     */
    reset() {
        this.entities = [];
        this.player = null;
        this.isRunning = false;
        this.frameCount = 0;
        this.spawnCounter = 0;
    }
    
    /**
     * Get all entities
     * @returns {Array} - All game entities
     */
    getEntities() {
        return this.entities;
    }
    
    /**
     * Get the player
     * @returns {Player} - Player entity
     */
    getPlayer() {
        return this.player;
    }
    
    /**
     * Get the game map
     * @returns {GameMap} - Game map
     */
    getGameMap() {
        return this.gameMap;
    }
    
    /**
     * Get the collision system
     * @returns {CollisionSystem} - Collision system
     */
    getCollisionSystem() {
        return this.collisionSystem;
    }
    
    /**
     * Check if the game is running
     * @returns {boolean} - True if the game is running
     */
    getIsRunning() {
        return this.isRunning;
    }
}
