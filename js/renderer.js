/**
 * Renderer class to handle drawing the game
 */
class Renderer {
    /**
     * Create a new renderer
     * @param {HTMLCanvasElement} canvas - Main game canvas
     * @param {HTMLCanvasElement} minimapCanvas - Minimap canvas
     */
    constructor(canvas, minimapCanvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.minimapCanvas = minimapCanvas;
        this.minimapCtx = minimapCanvas.getContext('2d');
        this.camera = { x: 0, y: 0 };
        this.viewport = { width: 0, height: 0 };
        
        // Resize canvases
        this.resize();
        
        // Set up resize event listener
        window.addEventListener('resize', () => this.resize());
    }
    
    /**
     * Resize the canvases
     */
    resize() {
        // Resize main canvas
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Update viewport size
        this.viewport = {
            width: this.canvas.width,
            height: this.canvas.height
        };
        
        // Resize minimap canvas (maintain aspect ratio)
        const minimapSize = Math.min(150, Math.min(window.innerWidth, window.innerHeight) * 0.15);
        this.minimapCanvas.width = minimapSize;
        this.minimapCanvas.height = minimapSize;
    }
    
    /**
     * Update the camera position to follow the player
     * @param {Player} player - Player to follow
     */
    updateCamera(player) {
        // Center camera on player
        this.camera.x = player.x - this.canvas.width / 2;
        this.camera.y = player.y - this.canvas.height / 2;
    }
    
    /**
     * Draw the game
     * @param {GameMap} gameMap - Game map
     * @param {Array} entities - All game entities
     * @param {Player} player - Player entity
     * @param {boolean} drawQuadtree - Whether to draw the quadtree (for debugging)
     * @param {QuadTree} quadtree - Quadtree for efficient collision detection
     */
    draw(gameMap, entities, player, drawQuadtree = false, quadtree = null) {
        // Update camera to follow player
        this.updateCamera(player);
        
        // Draw game map
        gameMap.draw(this.ctx, this.camera);
        
        // Draw entities
        this.drawEntities(entities);
        
        // Draw quadtree for debugging
        if (drawQuadtree && quadtree) {
            quadtree.draw(this.ctx, this.camera);
        }
        
        // Draw minimap
        gameMap.drawMinimap(this.minimapCtx, entities, this.camera, this.viewport);
    }
    
    /**
     * Draw all entities
     * @param {Array} entities - All game entities
     */
    drawEntities(entities) {
        // Create extended viewport for culling
        const extendedViewport = {
            x: this.camera.x - CONFIG.RENDER.VIEWPORT_PADDING,
            y: this.camera.y - CONFIG.RENDER.VIEWPORT_PADDING,
            width: this.viewport.width + CONFIG.RENDER.VIEWPORT_PADDING * 2,
            height: this.viewport.height + CONFIG.RENDER.VIEWPORT_PADDING * 2
        };
        
        // Sort entities by type for proper layering
        // Draw in this order: food, death food, NPCs, player
        const sortedEntities = [...entities].sort((a, b) => {
            const typeOrder = { food: 0, deathFood: 1, npc: 2, player: 3 };
            return (typeOrder[a.type] || 0) - (typeOrder[b.type] || 0);
        });
        
        // Draw only entities visible in the viewport
        for (const entity of sortedEntities) {
            if (entity.isVisibleInViewport(extendedViewport)) {
                entity.draw(this.ctx, this.camera);
            }
        }
    }
    
    /**
     * Draw text with an outline
     * @param {string} text - Text to draw
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {string} fillStyle - Fill style
     * @param {string} strokeStyle - Stroke style
     * @param {string} font - Font
     * @param {string} align - Text alignment
     */
    drawTextWithOutline(text, x, y, fillStyle = '#ffffff', strokeStyle = '#000000', font = '20px Arial', align = 'center') {
        this.ctx.font = font;
        this.ctx.textAlign = align;
        
        // Draw outline
        this.ctx.strokeStyle = strokeStyle;
        this.ctx.lineWidth = 3;
        this.ctx.strokeText(text, x, y);
        
        // Draw text
        this.ctx.fillStyle = fillStyle;
        this.ctx.fillText(text, x, y);
    }
}
