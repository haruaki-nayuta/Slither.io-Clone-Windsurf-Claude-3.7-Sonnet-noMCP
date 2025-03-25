/**
 * NPC class for AI-controlled snakes
 */
class NPC extends Snake {
    /**
     * Create a new NPC
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} size - Initial size of the NPC
     * @param {string} type - Type of NPC (NORMAL, AGGRESSIVE, COWARD)
     * @param {string} difficulty - Game difficulty (EASY, NORMAL, HARD)
     */
    constructor(x, y, size, type, difficulty) {
        // Get NPC type configuration
        const npcConfig = CONFIG.NPC.TYPES[type];
        
        super(x, y, size, npcConfig.COLOR, npcConfig.HEAD_COLOR);
        
        this.type = 'npc';
        this.npcType = type;
        this.difficulty = difficulty;
        this.targetAngle = this.angle;
        this.turnSpeed = CONFIG.PLAYER.TURN_SPEED * CONFIG.NPC.SPEED_MULTIPLIER[difficulty];
        this.speed = CONFIG.PLAYER.SPEED * CONFIG.NPC.SPEED_MULTIPLIER[difficulty];
        
        // AI behavior properties
        this.state = 'explore';
        this.target = null;
        this.targetTimeout = 0;
        this.decisionRate = npcConfig.DECISION_RATE;
        this.decisionCounter = Utils.randomInt(0, this.decisionRate); // Randomize initial counter to distribute processing
        this.visionRange = CONFIG.NPC.VISION_RANGE;
        this.detectionRange = CONFIG.NPC.DETECTION_RANGE;
        this.attackRange = CONFIG.NPC.ATTACK_RANGE;
        
        // Behavior weights
        this.exploreChance = npcConfig.EXPLORE_CHANCE;
        this.attackChance = npcConfig.ATTACK_CHANCE;
        this.fleeChance = npcConfig.FLEE_CHANCE;
    }
    
    /**
     * Update the NPC
     * @param {Array} entities - All game entities
     * @param {QuadTree} quadtree - Quadtree for efficient collision detection
     * @returns {Food|null} - Food dropped when boosting or null
     */
    update(entities, quadtree) {
        // Increment decision counter
        this.decisionCounter++;
        
        // Make a new decision when counter reaches decision rate
        if (this.decisionCounter >= this.decisionRate) {
            this.makeDecision(entities, quadtree);
            this.decisionCounter = 0;
        }
        
        // Update target angle based on current state and target
        this.updateTargetAngle(entities);
        
        // Smoothly rotate towards target angle
        const angleDiff = Utils.angleDifference(this.angle, this.targetAngle);
        this.angle += angleDiff * this.turnSpeed;
        
        // Handle boosting
        this.handleBoosting();
        
        // Decrease target timeout
        if (this.targetTimeout > 0) {
            this.targetTimeout--;
            
            // Clear target if timeout reached
            if (this.targetTimeout === 0) {
                this.target = null;
            }
        }
        
        // Call parent update method
        return super.update();
    }
    
    /**
     * Make a decision about what to do next
     * @param {Array} entities - All game entities
     * @param {QuadTree} quadtree - Quadtree for efficient collision detection
     */
    makeDecision(entities, quadtree) {
        // Get nearby entities using quadtree
        const searchArea = {
            x: this.x - this.visionRange,
            y: this.y - this.visionRange,
            width: this.visionRange * 2,
            height: this.visionRange * 2
        };
        
        const nearbyEntities = quadtree.retrieve(searchArea);
        
        // Find nearby food, snakes, and threats
        const nearbyFood = [];
        const nearbySnakes = [];
        const threats = [];
        
        for (const entity of nearbyEntities) {
            // Skip self
            if (entity === this) continue;
            
            const distance = Utils.distance(this, entity);
            
            // Check if entity is within vision range
            if (distance <= this.visionRange) {
                if (entity.type === 'food' || entity.type === 'deathFood') {
                    nearbyFood.push({ entity, distance });
                } else if (entity.type === 'snake' || entity.type === 'player' || entity.type === 'npc') {
                    nearbySnakes.push({ entity, distance });
                    
                    // Check if entity is a threat
                    if (entity.size > this.size * 1.2) {
                        threats.push({ entity, distance });
                    }
                }
            }
        }
        
        // Determine state based on surroundings and NPC type
        if (threats.length > 0 && Math.random() < this.fleeChance) {
            // Flee from the closest threat
            threats.sort((a, b) => a.distance - b.distance);
            this.state = 'flee';
            this.target = threats[0].entity;
            this.targetTimeout = 60; // 1 second at 60 FPS
            this.boosting = true;
        } else if (nearbySnakes.length > 0 && Math.random() < this.attackChance) {
            // Find potential prey (smaller snakes)
            const prey = nearbySnakes.filter(s => s.entity.size < this.size * 0.8);
            
            if (prey.length > 0) {
                // Attack the closest prey
                prey.sort((a, b) => a.distance - b.distance);
                this.state = 'attack';
                this.target = prey[0].entity;
                this.targetTimeout = 120; // 2 seconds at 60 FPS
            } else {
                // No prey, go back to exploring
                this.chooseExploreTarget(nearbyFood);
            }
        } else if (Math.random() < this.exploreChance) {
            // Explore and find food
            this.chooseExploreTarget(nearbyFood);
        } else {
            // Random wandering
            this.state = 'wander';
            this.target = null;
            this.targetAngle = Utils.random(0, Math.PI * 2);
            this.targetTimeout = 60; // 1 second at 60 FPS
        }
    }
    
    /**
     * Choose a target for exploration
     * @param {Array} nearbyFood - Nearby food entities
     */
    chooseExploreTarget(nearbyFood) {
        if (nearbyFood.length > 0) {
            // Find food to target
            nearbyFood.sort((a, b) => a.distance - b.distance);
            
            // Prefer death food (higher value)
            const deathFood = nearbyFood.filter(f => f.entity.type === 'deathFood');
            
            if (deathFood.length > 0 && deathFood[0].distance < this.visionRange * 0.7) {
                this.state = 'collect';
                this.target = deathFood[0].entity;
                this.targetTimeout = 60; // 1 second at 60 FPS
            } else {
                this.state = 'collect';
                this.target = nearbyFood[0].entity;
                this.targetTimeout = 60; // 1 second at 60 FPS
            }
        } else {
            // No food nearby, wander randomly
            this.state = 'explore';
            this.target = {
                x: Utils.random(0, CONFIG.WORLD.WIDTH),
                y: Utils.random(0, CONFIG.WORLD.HEIGHT)
            };
            this.targetTimeout = 180; // 3 seconds at 60 FPS
        }
    }
    
    /**
     * Update the target angle based on current state and target
     * @param {Array} entities - All game entities
     */
    updateTargetAngle(entities) {
        switch (this.state) {
            case 'explore':
            case 'collect':
                if (this.target) {
                    this.targetAngle = Utils.angle(this, this.target);
                }
                break;
                
            case 'attack':
                if (this.target && !this.target.markedForDeletion) {
                    this.targetAngle = Utils.angle(this, this.target);
                    
                    // Boost when close to target
                    const distance = Utils.distance(this, this.target);
                    this.boosting = distance < this.attackRange && this.size > CONFIG.PLAYER.MIN_SEGMENTS_FOR_BOOST;
                } else {
                    // Target is gone, go back to exploring
                    this.state = 'explore';
                    this.target = null;
                    this.boosting = false;
                }
                break;
                
            case 'flee':
                if (this.target && !this.target.markedForDeletion) {
                    // Flee in the opposite direction
                    const fleeAngle = Utils.angle(this, this.target);
                    this.targetAngle = fleeAngle + Math.PI;
                    
                    // Boost when close to threat
                    const distance = Utils.distance(this, this.target);
                    this.boosting = distance < this.detectionRange && this.size > CONFIG.PLAYER.MIN_SEGMENTS_FOR_BOOST;
                } else {
                    // Threat is gone, stop fleeing
                    this.state = 'explore';
                    this.target = null;
                    this.boosting = false;
                }
                break;
                
            case 'wander':
                // Keep current target angle
                break;
                
            default:
                // Default to random angle
                this.targetAngle = Utils.random(0, Math.PI * 2);
                break;
        }
        
        // Add some randomness to movement for more natural behavior
        if (Math.random() < 0.05) {
            this.targetAngle += Utils.random(-0.3, 0.3);
        }
        
        // Implement obstacle avoidance
        this.avoidObstacles(entities);
    }
    
    /**
     * Handle boosting behavior
     */
    handleBoosting() {
        // Stop boosting if size is too small
        if (this.size <= CONFIG.PLAYER.MIN_SEGMENTS_FOR_BOOST) {
            this.boosting = false;
        }
        
        // Randomly stop boosting to conserve size
        if (this.boosting && Math.random() < 0.02) {
            this.boosting = false;
        }
    }
    
    /**
     * Avoid obstacles (other snakes)
     * @param {Array} entities - All game entities
     */
    avoidObstacles(entities) {
        // Look ahead in the direction of movement
        const lookAheadDistance = this.speed * 10;
        const lookAheadPoint = {
            x: this.x + Math.cos(this.targetAngle) * lookAheadDistance,
            y: this.y + Math.sin(this.targetAngle) * lookAheadDistance
        };
        
        // Check for potential collisions
        let potentialCollision = false;
        let collisionPoint = null;
        
        for (const entity of entities) {
            // Skip self and non-snake entities
            if (entity === this || (entity.type !== 'snake' && entity.type !== 'player' && entity.type !== 'npc')) {
                continue;
            }
            
            // Check if any segment of the other snake is near our look-ahead point
            for (const segment of entity.segments) {
                const distance = Utils.distance(lookAheadPoint, segment);
                
                if (distance < segment.radius + this.radius * 2) {
                    potentialCollision = true;
                    collisionPoint = segment;
                    break;
                }
            }
            
            if (potentialCollision) break;
        }
        
        // Adjust angle to avoid collision
        if (potentialCollision && collisionPoint) {
            // Calculate angle to collision point
            const collisionAngle = Utils.angle(this, collisionPoint);
            
            // Determine which way to turn to avoid collision
            const angleToTarget = Utils.angleDifference(this.angle, this.targetAngle);
            const angleToCollision = Utils.angleDifference(this.angle, collisionAngle);
            
            // Turn away from collision
            if (angleToCollision > 0) {
                this.targetAngle = this.angle - Math.PI / 4;
            } else {
                this.targetAngle = this.angle + Math.PI / 4;
            }
        }
    }
    
    /**
     * Draw the NPC
     * @param {CanvasRenderingContext2D} ctx - Canvas context to draw on
     * @param {Object} camera - Camera object with x and y coordinates
     */
    draw(ctx, camera) {
        // Call parent draw method
        super.draw(ctx, camera);
        
        // Draw state indicator (for debugging)
        if (false) { // Set to true for debugging
            const screenX = this.x - camera.x;
            const screenY = this.y - camera.y;
            
            ctx.font = '12px Arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.fillText(this.state, screenX, screenY - this.radius - 10);
        }
    }
}
