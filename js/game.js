/**
 * Game class to coordinate all game components
 */
class Game {
    /**
     * Create a new game
     */
    constructor() {
        // Get canvas elements
        this.canvas = document.getElementById('game-canvas');
        this.minimapCanvas = document.getElementById('minimap');
        
        // Create renderer
        this.renderer = new Renderer(this.canvas, this.minimapCanvas);
        
        // Create game state
        this.gameState = new GameState();
        
        // Create UI
        this.ui = new UI();
        
        // Game loop variables
        this.lastTime = 0;
        this.accumulator = 0;
        this.timeStep = 1000 / CONFIG.RENDER.FPS;
        
        // Debug flags
        this.debugQuadtree = false;
        
        // Set up event listeners
        this.setupEventListeners();
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Game start event
        document.addEventListener('game:start', (e) => {
            this.startGame(e.detail.difficulty);
        });
        
        // Game over event
        document.addEventListener('game:over', (e) => {
            this.gameOver(e.detail);
        });
        
        // Debug key events
        window.addEventListener('keydown', (e) => {
            // Toggle quadtree visualization with Q key
            if (e.key === 'q') {
                this.debugQuadtree = !this.debugQuadtree;
            }
        });
    }
    
    /**
     * Start the game
     * @param {string} difficulty - Game difficulty
     */
    startGame(difficulty) {
        // Hide menu screen
        this.ui.hideMenuScreen();
        
        // Reset game state
        this.gameState.reset();
        
        // Initialize game state with selected difficulty
        this.gameState.init(difficulty);
        
        // Start game loop if not already running
        if (!this.lastTime) {
            this.lastTime = performance.now();
            requestAnimationFrame(this.gameLoop.bind(this));
        }
    }
    
    /**
     * Game over
     * @param {Object} stats - Player stats
     */
    gameOver(stats) {
        // Show game over screen
        this.ui.showGameOverScreen(stats);
    }
    
    /**
     * Game loop
     * @param {number} currentTime - Current time from requestAnimationFrame
     */
    gameLoop(currentTime) {
        // Calculate delta time
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Add to accumulator
        this.accumulator += deltaTime;
        
        // Update game state at fixed time step
        while (this.accumulator >= this.timeStep) {
            this.update();
            this.accumulator -= this.timeStep;
        }
        
        // Render game
        this.render();
        
        // Request next frame
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    /**
     * Update game state
     */
    update() {
        // Update game state
        this.gameState.update();
        
        // Update UI
        if (this.gameState.getIsRunning()) {
            const player = this.gameState.getPlayer();
            const entities = this.gameState.getEntities();
            
            this.ui.updateScore(player.score);
            this.ui.updateLeaderboard(entities, player);
        }
    }
    
    /**
     * Render game
     */
    render() {
        // Only render if game is running
        if (this.gameState.getIsRunning()) {
            const gameMap = this.gameState.getGameMap();
            const entities = this.gameState.getEntities();
            const player = this.gameState.getPlayer();
            const quadtree = this.gameState.getCollisionSystem().getQuadtree();
            
            this.renderer.draw(gameMap, entities, player, this.debugQuadtree, quadtree);
        }
    }
}
