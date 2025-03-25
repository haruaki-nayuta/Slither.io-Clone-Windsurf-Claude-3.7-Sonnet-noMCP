/**
 * Base Entity class for all game objects
 */
class Entity {
    /**
     * Create a new entity
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} radius - Radius of the entity
     */
    constructor(x, y, radius) {
        this.id = Utils.generateId();
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.markedForDeletion = false;
    }
    
    /**
     * Update the entity
     */
    update() {
        // Base update method, to be overridden by subclasses
    }
    
    /**
     * Draw the entity
     * @param {CanvasRenderingContext2D} ctx - Canvas context to draw on
     * @param {Object} camera - Camera object with x and y coordinates
     */
    draw(ctx, camera) {
        // Base draw method, to be overridden by subclasses
    }
    
    /**
     * Get the bounds of the entity for quadtree
     * @returns {Object} - Bounds object with x, y, width, and height
     */
    getBounds() {
        return {
            x: this.x - this.radius,
            y: this.y - this.radius,
            width: this.radius * 2,
            height: this.radius * 2
        };
    }
    
    /**
     * Check if this entity is colliding with another entity
     * @param {Entity} other - Other entity to check collision with
     * @returns {boolean} - True if colliding
     */
    isCollidingWith(other) {
        return Utils.circleCollision(this, other);
    }
    
    /**
     * Handle collision with another entity
     * @param {Entity} other - Other entity that collided with this one
     */
    onCollision(other) {
        // Base collision handler, to be overridden by subclasses
    }
    
    /**
     * Mark this entity for deletion
     */
    destroy() {
        this.markedForDeletion = true;
    }
    
    /**
     * Check if the entity is visible in the viewport
     * @param {Object} viewport - Viewport with x, y, width, and height
     * @returns {boolean} - True if visible
     */
    isVisibleInViewport(viewport) {
        return (
            this.x + this.radius >= viewport.x &&
            this.x - this.radius <= viewport.x + viewport.width &&
            this.y + this.radius >= viewport.y &&
            this.y - this.radius <= viewport.y + viewport.height
        );
    }
}
