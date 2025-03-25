/**
 * CollisionSystem class to handle collision detection and resolution
 */
class CollisionSystem {
    /**
     * Create a new collision system
     */
    constructor() {
        this.quadtree = null;
    }
    
    /**
     * Initialize the quadtree
     * @param {number} width - Width of the game world
     * @param {number} height - Height of the game world
     */
    initQuadtree(width, height) {
        this.quadtree = new QuadTree({
            x: 0,
            y: 0,
            width: width,
            height: height
        });
    }
    
    /**
     * Update the quadtree with current entities
     * @param {Array} entities - All game entities
     */
    updateQuadtree(entities) {
        // Clear the quadtree
        this.quadtree.clear();
        
        // Insert all entities into the quadtree
        for (const entity of entities) {
            this.quadtree.insert(entity.getBounds());
        }
    }
    
    /**
     * Check for collisions between entities
     * @param {Array} entities - All game entities
     * @param {Player} player - Player entity
     * @returns {Array} - Array of new entities (e.g., food from dead snakes)
     */
    checkCollisions(entities, player) {
        const newEntities = [];
        
        // Check player collisions with food
        this.checkPlayerFoodCollisions(player, entities, newEntities);
        
        // Check player collisions with other snakes
        this.checkPlayerSnakeCollisions(player, entities, newEntities);
        
        // Check NPC collisions
        this.checkNPCCollisions(entities, newEntities);
        
        return newEntities;
    }
    
    /**
     * Check for collisions between player and food
     * @param {Player} player - Player entity
     * @param {Array} entities - All game entities
     * @param {Array} newEntities - Array to add new entities to
     */
    checkPlayerFoodCollisions(player, entities, newEntities) {
        // Get potential collisions using quadtree
        const potentialCollisions = this.quadtree.retrieve(player.getBounds());
        
        for (const entity of entities) {
            // Skip non-food entities and deleted entities
            if ((entity.type !== 'food' && entity.type !== 'deathFood') || entity.markedForDeletion) {
                continue;
            }
            
            // Check if player's head is colliding with food
            const playerHead = player.segments[0];
            
            if (Utils.circleCollision(playerHead, entity)) {
                // Player eats food
                player.eatFood(entity);
                entity.destroy();
            }
        }
    }
    
    /**
     * Check for collisions between player and other snakes
     * @param {Player} player - Player entity
     * @param {Array} entities - All game entities
     * @param {Array} newEntities - Array to add new entities to
     */
    checkPlayerSnakeCollisions(player, entities, newEntities) {
        // Skip if player is already dead
        if (player.markedForDeletion) return;
        
        for (const entity of entities) {
            // Skip non-snake entities, player itself, and deleted entities
            if ((entity.type !== 'snake' && entity.type !== 'npc') || entity === player || entity.markedForDeletion) {
                continue;
            }
            
            // Check if player's head is colliding with another snake's body
            if (player.isCollidingWithSnake(entity)) {
                // Player dies
                const foodItems = player.die();
                newEntities.push(...foodItems);
                return; // Exit early since player is dead
            }
            
            // Check if another snake's head is colliding with player's body
            if (entity.isCollidingWithSnake(player)) {
                // Other snake dies
                const foodItems = entity.die();
                newEntities.push(...foodItems);
                
                // Increment player's killed NPCs counter
                player.killedNPCs++;
            }
            
            // Check head-to-head collision
            if (player.isHeadCollidingWithHead(entity)) {
                // Smaller snake dies, or both if same size
                if (player.size < entity.size) {
                    const foodItems = player.die();
                    newEntities.push(...foodItems);
                    return; // Exit early since player is dead
                } else {
                    const foodItems = entity.die();
                    newEntities.push(...foodItems);
                    
                    // Increment player's killed NPCs counter
                    player.killedNPCs++;
                }
            }
        }
    }
    
    /**
     * Check for collisions between NPCs
     * @param {Array} entities - All game entities
     * @param {Array} newEntities - Array to add new entities to
     */
    checkNPCCollisions(entities, newEntities) {
        const npcs = entities.filter(e => (e.type === 'npc' || e.type === 'snake') && e.type !== 'player' && !e.markedForDeletion);
        
        // Check NPC-food collisions
        for (const npc of npcs) {
            for (const entity of entities) {
                // Skip non-food entities and deleted entities
                if ((entity.type !== 'food' && entity.type !== 'deathFood') || entity.markedForDeletion) {
                    continue;
                }
                
                // Check if NPC's head is colliding with food
                const npcHead = npc.segments[0];
                
                if (Utils.circleCollision(npcHead, entity)) {
                    // NPC eats food
                    npc.eatFood(entity);
                    entity.destroy();
                }
            }
        }
        
        // Check NPC-NPC collisions
        for (let i = 0; i < npcs.length; i++) {
            const npc1 = npcs[i];
            
            // Skip deleted NPCs
            if (npc1.markedForDeletion) continue;
            
            for (let j = i + 1; j < npcs.length; j++) {
                const npc2 = npcs[j];
                
                // Skip deleted NPCs
                if (npc2.markedForDeletion) continue;
                
                // Check if NPC1's head is colliding with NPC2's body
                if (npc1.isCollidingWithSnake(npc2)) {
                    // NPC1 dies
                    const foodItems = npc1.die();
                    newEntities.push(...foodItems);
                    break; // Exit inner loop since NPC1 is dead
                }
                
                // Check if NPC2's head is colliding with NPC1's body
                if (npc2.isCollidingWithSnake(npc1)) {
                    // NPC2 dies
                    const foodItems = npc2.die();
                    newEntities.push(...foodItems);
                    continue; // Skip to next NPC2 since this one is dead
                }
                
                // Check head-to-head collision
                if (npc1.isHeadCollidingWithHead(npc2)) {
                    // Smaller snake dies, or both if same size
                    if (npc1.size < npc2.size) {
                        const foodItems = npc1.die();
                        newEntities.push(...foodItems);
                        break; // Exit inner loop since NPC1 is dead
                    } else if (npc2.size < npc1.size) {
                        const foodItems = npc2.die();
                        newEntities.push(...foodItems);
                        continue; // Skip to next NPC2 since this one is dead
                    } else {
                        // Both die if same size
                        const foodItems1 = npc1.die();
                        const foodItems2 = npc2.die();
                        newEntities.push(...foodItems1, ...foodItems2);
                        break; // Exit inner loop since NPC1 is dead
                    }
                }
            }
        }
    }
    
    /**
     * Get the quadtree for debugging
     * @returns {QuadTree} - The quadtree
     */
    getQuadtree() {
        return this.quadtree;
    }
}
