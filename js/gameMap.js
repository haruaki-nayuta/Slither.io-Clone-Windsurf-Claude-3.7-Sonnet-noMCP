/**
 * GameMap class to handle the game world
 */
class GameMap {
    /**
     * Create a new game map
     */
    constructor() {
        this.width = CONFIG.WORLD.WIDTH;
        this.height = CONFIG.WORLD.HEIGHT;
        this.gridSize = CONFIG.WORLD.GRID_SIZE;
    }
    
    /**
     * Draw the game map
     * @param {CanvasRenderingContext2D} ctx - Canvas context to draw on
     * @param {Object} camera - Camera object with x and y coordinates
     */
    draw(ctx, camera) {
        // Draw background
        ctx.fillStyle = CONFIG.WORLD.BACKGROUND_COLOR;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Calculate visible grid cells
        const startX = Math.floor(camera.x / this.gridSize) * this.gridSize;
        const startY = Math.floor(camera.y / this.gridSize) * this.gridSize;
        const endX = Math.ceil((camera.x + ctx.canvas.width) / this.gridSize) * this.gridSize;
        const endY = Math.ceil((camera.y + ctx.canvas.height) / this.gridSize) * this.gridSize;
        
        // Draw grid
        ctx.strokeStyle = CONFIG.WORLD.GRID_COLOR;
        ctx.lineWidth = 1;
        
        // Draw vertical grid lines
        for (let x = startX; x <= endX; x += this.gridSize) {
            const screenX = x - camera.x;
            ctx.beginPath();
            ctx.moveTo(screenX, 0);
            ctx.lineTo(screenX, ctx.canvas.height);
            ctx.stroke();
        }
        
        // Draw horizontal grid lines
        for (let y = startY; y <= endY; y += this.gridSize) {
            const screenY = y - camera.y;
            ctx.beginPath();
            ctx.moveTo(0, screenY);
            ctx.lineTo(ctx.canvas.width, screenY);
            ctx.stroke();
        }
        
        // Draw world border
        ctx.strokeStyle = CONFIG.WORLD.BORDER_COLOR;
        ctx.lineWidth = 5;
        ctx.strokeRect(-camera.x, -camera.y, this.width, this.height);
    }
    
    /**
     * Draw the minimap
     * @param {CanvasRenderingContext2D} minimapCtx - Minimap canvas context
     * @param {Array} entities - All game entities
     * @param {Object} camera - Camera object with x and y coordinates
     * @param {Object} viewport - Viewport with width and height
     */
    drawMinimap(minimapCtx, entities, camera, viewport) {
        const canvas = minimapCtx.canvas;
        const mapRatio = canvas.width / this.width;
        
        // Clear minimap
        minimapCtx.fillStyle = CONFIG.WORLD.BACKGROUND_COLOR;
        minimapCtx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw border
        minimapCtx.strokeStyle = CONFIG.WORLD.BORDER_COLOR;
        minimapCtx.lineWidth = 1;
        minimapCtx.strokeRect(0, 0, canvas.width, canvas.height);
        
        // Draw entities
        for (const entity of entities) {
            if (entity.type === 'snake' || entity.type === 'player' || entity.type === 'npc') {
                // Draw snakes as dots on the minimap
                const minimapX = entity.x * mapRatio;
                const minimapY = entity.y * mapRatio;
                
                minimapCtx.beginPath();
                minimapCtx.arc(minimapX, minimapY, 2, 0, Math.PI * 2);
                minimapCtx.fillStyle = entity.type === 'player' ? '#ffffff' : entity.color;
                minimapCtx.fill();
            }
        }
        
        // Draw viewport rectangle
        const viewportX = camera.x * mapRatio;
        const viewportY = camera.y * mapRatio;
        const viewportWidth = viewport.width * mapRatio;
        const viewportHeight = viewport.height * mapRatio;
        
        minimapCtx.strokeStyle = '#ffffff';
        minimapCtx.lineWidth = 1;
        minimapCtx.strokeRect(viewportX, viewportY, viewportWidth, viewportHeight);
    }
    
    /**
     * Get a random position within the map
     * @param {number} padding - Padding from the edges
     * @returns {Object} - Random position with x and y coordinates
     */
    getRandomPosition(padding = 100) {
        return {
            x: Utils.random(padding, this.width - padding),
            y: Utils.random(padding, this.height - padding)
        };
    }
    
    /**
     * Get a random position away from other entities
     * @param {Array} entities - All game entities
     * @param {number} minDistance - Minimum distance from other entities
     * @param {number} padding - Padding from the edges
     * @param {number} maxAttempts - Maximum number of attempts to find a position
     * @returns {Object} - Random position with x and y coordinates
     */
    getRandomPositionAwayFromEntities(entities, minDistance = 100, padding = 100, maxAttempts = 20) {
        let attempts = 0;
        let position;
        let valid = false;
        
        while (!valid && attempts < maxAttempts) {
            position = this.getRandomPosition(padding);
            valid = true;
            
            // Check distance from other entities
            for (const entity of entities) {
                if (Utils.distance(position, entity) < minDistance) {
                    valid = false;
                    break;
                }
            }
            
            attempts++;
        }
        
        // If no valid position found after max attempts, just return a random position
        return position || this.getRandomPosition(padding);
    }
}
