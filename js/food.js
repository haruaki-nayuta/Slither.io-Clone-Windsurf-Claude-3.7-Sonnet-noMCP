/**
 * Food class for food items in the game
 */
class Food extends Entity {
    /**
     * Create a new food item
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} value - Nutritional value of the food
     * @param {string} color - Color of the food
     */
    constructor(x, y, value = CONFIG.FOOD.VALUE, color = null) {
        super(x, y, CONFIG.FOOD.SIZE);
        this.value = value;
        this.color = color || Utils.randomColor();
        this.type = 'food';
        this.pulseDirection = 1;
        this.pulseAmount = 0;
        this.pulseSpeed = 0.05;
    }
    
    /**
     * Update the food item
     */
    update() {
        // Add a pulsing effect
        this.pulseAmount += this.pulseSpeed * this.pulseDirection;
        
        if (this.pulseAmount >= 1) {
            this.pulseDirection = -1;
        } else if (this.pulseAmount <= 0) {
            this.pulseDirection = 1;
        }
    }
    
    /**
     * Draw the food item
     * @param {CanvasRenderingContext2D} ctx - Canvas context to draw on
     * @param {Object} camera - Camera object with x and y coordinates
     */
    draw(ctx, camera) {
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        const pulseRadius = this.radius * (1 + this.pulseAmount * 0.2);
        
        ctx.beginPath();
        ctx.arc(screenX, screenY, pulseRadius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // Add a subtle glow effect
        ctx.beginPath();
        ctx.arc(screenX, screenY, pulseRadius * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `${this.color}33`; // Add 33 for 20% opacity
        ctx.fill();
    }
}

/**
 * DeathFood class for food items dropped when a snake dies
 */
class DeathFood extends Food {
    /**
     * Create a new death food item
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {string} color - Color of the food
     */
    constructor(x, y, color) {
        super(x, y, CONFIG.DEATH_FOOD.VALUE, color);
        this.type = 'deathFood';
        this.lifespan = 600; // 10 seconds at 60 FPS
        this.pulseSpeed = 0.1; // Faster pulse for death food
    }
    
    /**
     * Update the death food item
     */
    update() {
        super.update();
        
        // Decrease lifespan
        this.lifespan--;
        
        if (this.lifespan <= 0) {
            this.destroy();
        }
    }
    
    /**
     * Draw the death food item
     * @param {CanvasRenderingContext2D} ctx - Canvas context to draw on
     * @param {Object} camera - Camera object with x and y coordinates
     */
    draw(ctx, camera) {
        // Add a fading effect as lifespan decreases
        const opacity = Math.min(1, this.lifespan / 100);
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        const pulseRadius = this.radius * (1 + this.pulseAmount * 0.3);
        
        ctx.beginPath();
        ctx.arc(screenX, screenY, pulseRadius, 0, Math.PI * 2);
        ctx.fillStyle = this.color + Math.floor(opacity * 255).toString(16).padStart(2, '0');
        ctx.fill();
        
        // Add a subtle glow effect
        ctx.beginPath();
        ctx.arc(screenX, screenY, pulseRadius * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `${this.color}${Math.floor(opacity * 51).toString(16).padStart(2, '0')}`; // Add opacity
        ctx.fill();
    }
}
