/**
 * Utility functions for the game
 */
const Utils = {
    /**
     * Calculate distance between two points
     * @param {Object} point1 - First point with x and y coordinates
     * @param {Object} point2 - Second point with x and y coordinates
     * @returns {number} - Distance between the points
     */
    distance(point1, point2) {
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        return Math.sqrt(dx * dx + dy * dy);
    },
    
    /**
     * Calculate angle between two points in radians
     * @param {Object} point1 - First point with x and y coordinates
     * @param {Object} point2 - Second point with x and y coordinates
     * @returns {number} - Angle in radians
     */
    angle(point1, point2) {
        return Math.atan2(point2.y - point1.y, point2.x - point1.x);
    },
    
    /**
     * Get a random number between min and max (inclusive)
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} - Random number
     */
    random(min, max) {
        return Math.random() * (max - min) + min;
    },
    
    /**
     * Get a random integer between min and max (inclusive)
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} - Random integer
     */
    randomInt(min, max) {
        return Math.floor(this.random(min, max + 1));
    },
    
    /**
     * Get a random item from an array
     * @param {Array} array - Array to pick from
     * @returns {*} - Random item from the array
     */
    randomItem(array) {
        return array[this.randomInt(0, array.length - 1)];
    },
    
    /**
     * Get a random color
     * @returns {string} - Random hex color
     */
    randomColor() {
        return this.randomItem(CONFIG.FOOD.COLORS);
    },
    
    /**
     * Normalize an angle to be between 0 and 2π
     * @param {number} angle - Angle in radians
     * @returns {number} - Normalized angle
     */
    normalizeAngle(angle) {
        while (angle < 0) angle += Math.PI * 2;
        while (angle >= Math.PI * 2) angle -= Math.PI * 2;
        return angle;
    },
    
    /**
     * Get the shortest angle difference between two angles
     * @param {number} angle1 - First angle in radians
     * @param {number} angle2 - Second angle in radians
     * @returns {number} - Angle difference in radians
     */
    angleDifference(angle1, angle2) {
        const a1 = this.normalizeAngle(angle1);
        const a2 = this.normalizeAngle(angle2);
        let diff = a2 - a1;
        
        if (diff > Math.PI) diff -= Math.PI * 2;
        if (diff < -Math.PI) diff += Math.PI * 2;
        
        return diff;
    },
    
    /**
     * Check if a point is inside the game world
     * @param {Object} point - Point with x and y coordinates
     * @returns {boolean} - True if inside the world
     */
    isInsideWorld(point) {
        return point.x >= 0 && point.x < CONFIG.WORLD.WIDTH && 
               point.y >= 0 && point.y < CONFIG.WORLD.HEIGHT;
    },
    
    /**
     * Wrap a point around the game world (for toroidal world)
     * @param {Object} point - Point with x and y coordinates
     * @returns {Object} - Wrapped point
     */
    wrapPoint(point) {
        let x = point.x;
        let y = point.y;
        
        if (x < 0) x += CONFIG.WORLD.WIDTH;
        if (x >= CONFIG.WORLD.WIDTH) x -= CONFIG.WORLD.WIDTH;
        if (y < 0) y += CONFIG.WORLD.HEIGHT;
        if (y >= CONFIG.WORLD.HEIGHT) y -= CONFIG.WORLD.HEIGHT;
        
        return { x, y };
    },
    
    /**
     * Format time in MM:SS format
     * @param {number} seconds - Time in seconds
     * @returns {string} - Formatted time
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },
    
    /**
     * Check if two circles are colliding
     * @param {Object} circle1 - First circle with x, y and radius
     * @param {Object} circle2 - Second circle with x, y and radius
     * @returns {boolean} - True if colliding
     */
    circleCollision(circle1, circle2) {
        const distance = this.distance(circle1, circle2);
        return distance < circle1.radius + circle2.radius;
    },
    
    /**
     * Calculate the weighted probability for NPC decision making
     * @param {Object} weights - Object with weights for each option
     * @returns {string} - Selected option
     */
    weightedRandom(weights) {
        let total = 0;
        for (const option in weights) {
            total += weights[option];
        }
        
        const random = Math.random() * total;
        let current = 0;
        
        for (const option in weights) {
            current += weights[option];
            if (random <= current) {
                return option;
            }
        }
        
        // Fallback (should never reach here)
        return Object.keys(weights)[0];
    },
    
    /**
     * Lerp (linear interpolation) between two values
     * @param {number} a - First value
     * @param {number} b - Second value
     * @param {number} t - Interpolation factor (0-1)
     * @returns {number} - Interpolated value
     */
    lerp(a, b, t) {
        return a + (b - a) * t;
    },
    
    /**
     * Get a point at a specific distance and angle from another point
     * @param {Object} point - Starting point with x and y coordinates
     * @param {number} angle - Angle in radians
     * @param {number} distance - Distance
     * @returns {Object} - New point
     */
    pointFromAngle(point, angle, distance) {
        return {
            x: point.x + Math.cos(angle) * distance,
            y: point.y + Math.sin(angle) * distance
        };
    },
    
    /**
     * Get a unique ID
     * @returns {string} - Unique ID
     */
    generateId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }
};
