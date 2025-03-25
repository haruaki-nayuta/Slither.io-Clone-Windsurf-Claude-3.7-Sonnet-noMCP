/**
 * Player class for the player-controlled snake
 */
class Player extends Snake {
    /**
     * Create a new player
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} size - Initial size of the player
     */
    constructor(x, y, size = CONFIG.PLAYER.INITIAL_SIZE) {
        super(x, y, size, CONFIG.PLAYER.COLOR, CONFIG.PLAYER.HEAD_COLOR);
        this.type = 'player';
        this.targetAngle = this.angle;
        this.turnSpeed = CONFIG.PLAYER.TURN_SPEED;
        this.lastMousePosition = { x: 0, y: 0 };
        this.startTime = Date.now();
        this.playTime = 0;
        
        // Set up mouse event listeners
        this.setupEventListeners();
    }
    
    /**
     * Set up event listeners for player control
     */
    setupEventListeners() {
        // Mouse move event for direction control
        window.addEventListener('mousemove', (e) => {
            this.lastMousePosition = { x: e.clientX, y: e.clientY };
        });
        
        // Mouse down event for boost
        window.addEventListener('mousedown', () => {
            if (this.size > CONFIG.PLAYER.MIN_SEGMENTS_FOR_BOOST) {
                this.boosting = true;
            }
        });
        
        // Mouse up event to stop boost
        window.addEventListener('mouseup', () => {
            this.boosting = false;
        });
    }
    
    /**
     * Update the player
     * @param {Object} camera - Camera object with x and y coordinates
     * @returns {Food|null} - Food dropped when boosting or null
     */
    update(camera) {
        // Calculate target angle based on mouse position
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        this.targetAngle = Math.atan2(
            this.lastMousePosition.y - centerY,
            this.lastMousePosition.x - centerX
        );
        
        // Smoothly rotate towards target angle
        const angleDiff = Utils.angleDifference(this.angle, this.targetAngle);
        this.angle += angleDiff * this.turnSpeed;
        
        // Update play time
        this.playTime = (Date.now() - this.startTime) / 1000;
        
        // Call parent update method
        return super.update();
    }
    
    /**
     * Reset the player for a new game
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} size - Initial size of the player
     */
    reset(x, y, size = CONFIG.PLAYER.INITIAL_SIZE) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.angle = 0;
        this.targetAngle = 0;
        this.boosting = false;
        this.killedNPCs = 0;
        this.maxScore = size;
        this.startTime = Date.now();
        this.playTime = 0;
        this.markedForDeletion = false;
        
        // Reinitialize segments
        this.initSegments();
    }
    
    /**
     * Get the player's stats
     * @returns {Object} - Player stats
     */
    getStats() {
        return {
            score: Math.floor(this.score),
            maxSize: Math.floor(this.maxScore),
            playTime: this.playTime,
            killedNPCs: this.killedNPCs
        };
    }
}
