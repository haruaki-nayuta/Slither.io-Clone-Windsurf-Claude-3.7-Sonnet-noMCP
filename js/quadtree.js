/**
 * QuadTree implementation for efficient collision detection
 */
class QuadTree {
    /**
     * Create a new QuadTree
     * @param {Object} bounds - Bounds of the quadtree (x, y, width, height)
     * @param {number} level - Current level of the quadtree
     */
    constructor(bounds, level = 0) {
        this.bounds = bounds;
        this.level = level;
        this.objects = [];
        this.nodes = [];
        this.maxObjects = CONFIG.QUADTREE.MAX_OBJECTS;
        this.maxLevels = CONFIG.QUADTREE.MAX_LEVELS;
    }
    
    /**
     * Clear the quadtree
     */
    clear() {
        this.objects = [];
        
        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i]) {
                this.nodes[i].clear();
            }
        }
        
        this.nodes = [];
    }
    
    /**
     * Split the quadtree into four quadrants
     */
    split() {
        const subWidth = this.bounds.width / 2;
        const subHeight = this.bounds.height / 2;
        const x = this.bounds.x;
        const y = this.bounds.y;
        
        // Top right
        this.nodes[0] = new QuadTree({
            x: x + subWidth,
            y: y,
            width: subWidth,
            height: subHeight
        }, this.level + 1);
        
        // Top left
        this.nodes[1] = new QuadTree({
            x: x,
            y: y,
            width: subWidth,
            height: subHeight
        }, this.level + 1);
        
        // Bottom left
        this.nodes[2] = new QuadTree({
            x: x,
            y: y + subHeight,
            width: subWidth,
            height: subHeight
        }, this.level + 1);
        
        // Bottom right
        this.nodes[3] = new QuadTree({
            x: x + subWidth,
            y: y + subHeight,
            width: subWidth,
            height: subHeight
        }, this.level + 1);
    }
    
    /**
     * Determine which node an object belongs to
     * @param {Object} rect - Object with position and size (x, y, width, height)
     * @returns {number} - Index of the node (-1 if object cannot completely fit in a node)
     */
    getIndex(rect) {
        let index = -1;
        const verticalMidpoint = this.bounds.x + (this.bounds.width / 2);
        const horizontalMidpoint = this.bounds.y + (this.bounds.height / 2);
        
        // Object can completely fit within the top quadrants
        const topQuadrant = (rect.y < horizontalMidpoint && rect.y + rect.height < horizontalMidpoint);
        // Object can completely fit within the bottom quadrants
        const bottomQuadrant = (rect.y > horizontalMidpoint);
        
        // Object can completely fit within the left quadrants
        if (rect.x < verticalMidpoint && rect.x + rect.width < verticalMidpoint) {
            if (topQuadrant) {
                index = 1;
            } else if (bottomQuadrant) {
                index = 2;
            }
        }
        // Object can completely fit within the right quadrants
        else if (rect.x > verticalMidpoint) {
            if (topQuadrant) {
                index = 0;
            } else if (bottomQuadrant) {
                index = 3;
            }
        }
        
        return index;
    }
    
    /**
     * Insert an object into the quadtree
     * @param {Object} obj - Object to insert
     */
    insert(obj) {
        // If we have subnodes, try to insert the object into them
        if (this.nodes.length) {
            const index = this.getIndex(obj);
            
            if (index !== -1) {
                this.nodes[index].insert(obj);
                return;
            }
        }
        
        // Otherwise, add the object to this node
        this.objects.push(obj);
        
        // Check if we need to split
        if (this.objects.length > this.maxObjects && this.level < this.maxLevels) {
            if (!this.nodes.length) {
                this.split();
            }
            
            // Redistribute existing objects
            let i = 0;
            while (i < this.objects.length) {
                const index = this.getIndex(this.objects[i]);
                
                if (index !== -1) {
                    const obj = this.objects.splice(i, 1)[0];
                    this.nodes[index].insert(obj);
                } else {
                    i++;
                }
            }
        }
    }
    
    /**
     * Return all objects that could collide with the given object
     * @param {Object} obj - Object to check for potential collisions
     * @returns {Array} - Array of objects that might collide with the given object
     */
    retrieve(obj) {
        let returnObjects = [];
        const index = this.getIndex(obj);
        
        // If we have subnodes and the object fits in one, retrieve from that node
        if (this.nodes.length) {
            if (index !== -1) {
                returnObjects = returnObjects.concat(this.nodes[index].retrieve(obj));
            } else {
                // If the object doesn't fit in one node, check all nodes
                for (let i = 0; i < this.nodes.length; i++) {
                    returnObjects = returnObjects.concat(this.nodes[i].retrieve(obj));
                }
            }
        }
        
        // Add all objects in this node
        returnObjects = returnObjects.concat(this.objects);
        
        return returnObjects;
    }
    
    /**
     * Get all objects in the quadtree
     * @returns {Array} - Array of all objects
     */
    getAllObjects() {
        let allObjects = [...this.objects];
        
        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i]) {
                allObjects = allObjects.concat(this.nodes[i].getAllObjects());
            }
        }
        
        return allObjects;
    }
    
    /**
     * Draw the quadtree for debugging
     * @param {CanvasRenderingContext2D} ctx - Canvas context to draw on
     * @param {Object} camera - Camera object with x and y coordinates
     */
    draw(ctx, camera) {
        const x = this.bounds.x - camera.x;
        const y = this.bounds.y - camera.y;
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.strokeRect(x, y, this.bounds.width, this.bounds.height);
        
        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i]) {
                this.nodes[i].draw(ctx, camera);
            }
        }
    }
}
