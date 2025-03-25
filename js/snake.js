/**
 * Snake class for both player and NPC snakes
 */
class Snake extends Entity {
    /**
     * Create a new snake
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} size - Initial size of the snake
     * @param {string} color - Body color of the snake
     * @param {string} headColor - Head color of the snake
     */
    constructor(x, y, size, color, headColor) {
        super(x, y, CONFIG.PLAYER.SEGMENT_RADIUS);
        this.size = size;
        this.color = color;
        this.headColor = headColor;
        this.angle = 0;
        this.speed = CONFIG.PLAYER.SPEED;
        this.segments = [];
        this.segmentSpacing = CONFIG.PLAYER.SEGMENT_SPACING;
        this.type = 'snake';
        this.score = size;
        this.maxScore = size;
        this.boosting = false;
        this.killedNPCs = 0;
        
        // Initialize segments
        this.initSegments();
    }
    
    /**
     * Initialize the snake segments
     */
    initSegments() {
        this.segments = [];
        
        // Add head segment
        this.segments.push({ x: this.x, y: this.y, radius: this.radius });
        
        // Add body segments
        const segmentCount = Math.max(5, Math.floor(this.size / 2));
        
        for (let i = 1; i < segmentCount; i++) {
            const prevSegment = this.segments[i - 1];
            const angle = this.angle - Math.PI; // Opposite direction
            
            this.segments.push({
                x: prevSegment.x + Math.cos(angle) * this.segmentSpacing,
                y: prevSegment.y + Math.sin(angle) * this.segmentSpacing,
                radius: this.radius * (1 - i / (segmentCount * 2)) // Gradually decrease radius
            });
        }
    }
    
    /**
     * Update the snake
     */
    update() {
        // Move the head
        const speed = this.boosting ? CONFIG.PLAYER.BOOST_SPEED : this.speed;
        const dx = Math.cos(this.angle) * speed;
        const dy = Math.sin(this.angle) * speed;
        
        this.x += dx;
        this.y += dy;
        
        // Wrap around the world boundaries
        this.x = (this.x + CONFIG.WORLD.WIDTH) % CONFIG.WORLD.WIDTH;
        this.y = (this.y + CONFIG.WORLD.HEIGHT) % CONFIG.WORLD.HEIGHT;
        
        // Update head segment
        this.segments[0].x = this.x;
        this.segments[0].y = this.y;
        
        // Update body segments
        for (let i = this.segments.length - 1; i > 0; i--) {
            const segment = this.segments[i];
            const prevSegment = this.segments[i - 1];
            
            // Calculate direction to previous segment
            const angle = Utils.angle(segment, prevSegment);
            
            // Calculate ideal distance
            const idealDistance = this.segmentSpacing;
            
            // Calculate actual distance
            const distance = Utils.distance(segment, prevSegment);
            
            // Move segment towards ideal position if too far
            if (distance > idealDistance) {
                const moveAmount = (distance - idealDistance) * 0.5; // Smooth following
                segment.x += Math.cos(angle) * moveAmount;
                segment.y += Math.sin(angle) * moveAmount;
            }
        }
        
        // Handle boosting
        if (this.boosting && this.size > CONFIG.PLAYER.MIN_SEGMENTS_FOR_BOOST) {
            this.size -= CONFIG.PLAYER.BOOST_CONSUMPTION;
            
            // Drop food when boosting
            if (Math.random() < 0.1) {
                const lastSegment = this.segments[this.segments.length - 1];
                return new DeathFood(lastSegment.x, lastSegment.y, this.color);
            }
        }
        
        // Update segment count based on size
        this.updateSegments();
        
        // Update score
        this.score = this.size;
        this.maxScore = Math.max(this.maxScore, this.score);
        
        return null; // No food dropped
    }
    
    /**
     * Update the number of segments based on the snake's size
     */
    updateSegments() {
        const idealSegmentCount = Math.max(5, Math.floor(this.size / 2));
        
        // Add segments if needed
        while (this.segments.length < idealSegmentCount) {
            const lastSegment = this.segments[this.segments.length - 1];
            const secondLastSegment = this.segments[this.segments.length - 2] || lastSegment;
            
            // Calculate angle from second last to last segment
            const angle = Utils.angle(secondLastSegment, lastSegment);
            
            // Add new segment behind the last one
            this.segments.push({
                x: lastSegment.x + Math.cos(angle) * this.segmentSpacing,
                y: lastSegment.y + Math.sin(angle) * this.segmentSpacing,
                radius: this.radius * (1 - this.segments.length / (idealSegmentCount * 2))
            });
        }
        
        // Remove segments if needed
        while (this.segments.length > idealSegmentCount) {
            this.segments.pop();
        }
    }
    
    /**
     * Draw the snake
     * @param {CanvasRenderingContext2D} ctx - Canvas context to draw on
     * @param {Object} camera - Camera object with x and y coordinates
     */
    draw(ctx, camera) {
        // Draw body segments (in reverse order to ensure head is drawn on top)
        for (let i = this.segments.length - 1; i >= 0; i--) {
            const segment = this.segments[i];
            const screenX = segment.x - camera.x;
            const screenY = segment.y - camera.y;
            
            // Draw segment
            ctx.beginPath();
            ctx.arc(screenX, screenY, segment.radius, 0, Math.PI * 2);
            
            // Head has different color
            if (i === 0) {
                ctx.fillStyle = this.headColor;
            } else {
                ctx.fillStyle = this.color;
            }
            
            ctx.fill();
            
            // Add eyes to head
            if (i === 0) {
                // Left eye
                const leftEyeAngle = this.angle + Math.PI / 4;
                const leftEyeX = screenX + Math.cos(leftEyeAngle) * (segment.radius * 0.6);
                const leftEyeY = screenY + Math.sin(leftEyeAngle) * (segment.radius * 0.6);
                
                ctx.beginPath();
                ctx.arc(leftEyeX, leftEyeY, segment.radius * 0.3, 0, Math.PI * 2);
                ctx.fillStyle = 'white';
                ctx.fill();
                
                // Left pupil
                const leftPupilX = leftEyeX + Math.cos(this.angle) * (segment.radius * 0.15);
                const leftPupilY = leftEyeY + Math.sin(this.angle) * (segment.radius * 0.15);
                
                ctx.beginPath();
                ctx.arc(leftPupilX, leftPupilY, segment.radius * 0.15, 0, Math.PI * 2);
                ctx.fillStyle = 'black';
                ctx.fill();
                
                // Right eye
                const rightEyeAngle = this.angle - Math.PI / 4;
                const rightEyeX = screenX + Math.cos(rightEyeAngle) * (segment.radius * 0.6);
                const rightEyeY = screenY + Math.sin(rightEyeAngle) * (segment.radius * 0.6);
                
                ctx.beginPath();
                ctx.arc(rightEyeX, rightEyeY, segment.radius * 0.3, 0, Math.PI * 2);
                ctx.fillStyle = 'white';
                ctx.fill();
                
                // Right pupil
                const rightPupilX = rightEyeX + Math.cos(this.angle) * (segment.radius * 0.15);
                const rightPupilY = rightEyeY + Math.sin(this.angle) * (segment.radius * 0.15);
                
                ctx.beginPath();
                ctx.arc(rightPupilX, rightPupilY, segment.radius * 0.15, 0, Math.PI * 2);
                ctx.fillStyle = 'black';
                ctx.fill();
            }
        }
        
        // Draw boost effect if boosting
        if (this.boosting) {
            const lastSegment = this.segments[this.segments.length - 1];
            const secondLastSegment = this.segments[this.segments.length - 2] || lastSegment;
            
            // Calculate angle from second last to last segment
            const angle = Utils.angle(secondLastSegment, lastSegment);
            
            // Draw boost particles
            const screenX = lastSegment.x - camera.x;
            const screenY = lastSegment.y - camera.y;
            
            for (let i = 0; i < 3; i++) {
                const particleAngle = angle + Utils.random(-0.5, 0.5);
                const particleDistance = Utils.random(5, 15);
                const particleX = screenX + Math.cos(particleAngle) * particleDistance;
                const particleY = screenY + Math.sin(particleAngle) * particleDistance;
                const particleRadius = Utils.random(1, 3);
                
                ctx.beginPath();
                ctx.arc(particleX, particleY, particleRadius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${Utils.random(0.3, 0.7)})`;
                ctx.fill();
            }
        }
    }
    
    /**
     * Handle collision with food
     * @param {Food} food - Food that collided with the snake
     */
    eatFood(food) {
        this.size += food.value;
    }
    
    /**
     * Check if the snake's head is colliding with another snake's body
     * @param {Snake} other - Other snake to check collision with
     * @returns {boolean} - True if colliding
     */
    isCollidingWithSnake(other) {
        // Skip self-collision
        if (this === other) return false;
        
        // Check if head is colliding with any segment of the other snake
        const head = this.segments[0];
        
        for (let i = 0; i < other.segments.length; i++) {
            const segment = other.segments[i];
            
            // Skip head collision (handled separately)
            if (i === 0) continue;
            
            // Check collision
            if (Utils.circleCollision(head, segment)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Check if the snake's head is colliding with another snake's head
     * @param {Snake} other - Other snake to check head collision with
     * @returns {boolean} - True if heads are colliding
     */
    isHeadCollidingWithHead(other) {
        // Skip self-collision
        if (this === other) return false;
        
        // Check head-to-head collision
        return Utils.circleCollision(this.segments[0], other.segments[0]);
    }
    
    /**
     * Handle death of the snake
     * @returns {Array} - Array of food items dropped
     */
    die() {
        const foodItems = [];
        const foodCount = Utils.randomInt(
            CONFIG.DEATH_FOOD.MIN_COUNT,
            Math.min(CONFIG.DEATH_FOOD.MAX_COUNT, this.size)
        );
        
        // Create food items at each segment position
        for (let i = 0; i < foodCount; i++) {
            const segmentIndex = Math.floor(i * this.segments.length / foodCount);
            const segment = this.segments[segmentIndex];
            
            // Add some randomness to food position
            const angle = Utils.random(0, Math.PI * 2);
            const distance = Utils.random(0, CONFIG.DEATH_FOOD.SPREAD_RADIUS);
            const foodX = segment.x + Math.cos(angle) * distance;
            const foodY = segment.y + Math.sin(angle) * distance;
            
            // Create food item
            foodItems.push(new DeathFood(foodX, foodY, this.color));
        }
        
        // Mark snake for deletion
        this.destroy();
        
        return foodItems;
    }
    
    /**
     * Get the bounds of the snake for quadtree
     * @returns {Object} - Bounds object with x, y, width, and height
     */
    getBounds() {
        // Calculate bounds that encompass all segments
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        
        for (const segment of this.segments) {
            minX = Math.min(minX, segment.x - segment.radius);
            minY = Math.min(minY, segment.y - segment.radius);
            maxX = Math.max(maxX, segment.x + segment.radius);
            maxY = Math.max(maxY, segment.y + segment.radius);
        }
        
        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }
    
    /**
     * Check if the snake is visible in the viewport
     * @param {Object} viewport - Viewport with x, y, width, and height
     * @returns {boolean} - True if any segment is visible
     */
    isVisibleInViewport(viewport) {
        for (const segment of this.segments) {
            if (
                segment.x + segment.radius >= viewport.x &&
                segment.x - segment.radius <= viewport.x + viewport.width &&
                segment.y + segment.radius >= viewport.y &&
                segment.y - segment.radius <= viewport.y + viewport.height
            ) {
                return true;
            }
        }
        
        return false;
    }
}
