/**
 * UI class to handle user interface elements
 */
class UI {
    /**
     * Create a new UI
     */
    constructor() {
        // Get UI elements
        this.scoreContainer = document.getElementById('player-score');
        this.leaderboardList = document.getElementById('leaderboard-list');
        this.menuScreen = document.getElementById('menu-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.finalScore = document.getElementById('final-score');
        this.playTime = document.getElementById('play-time');
        this.killedNPCs = document.getElementById('killed-npcs');
        this.maxSize = document.getElementById('max-size');
        this.restartBtn = document.getElementById('restart-btn');
        this.difficultyBtns = document.querySelectorAll('.difficulty-btn');
        this.highScoreList = document.getElementById('high-score-list');
        
        // Initialize high scores
        this.highScores = this.loadHighScores();
        
        // Set up event listeners
        this.setupEventListeners();
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Difficulty buttons
        this.difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const difficulty = btn.getAttribute('data-difficulty');
                document.dispatchEvent(new CustomEvent('game:start', { detail: { difficulty } }));
            });
        });
        
        // Restart button
        this.restartBtn.addEventListener('click', () => {
            this.hideGameOverScreen();
            this.showMenuScreen();
        });
    }
    
    /**
     * Update the player score display
     * @param {number} score - Player's current score
     */
    updateScore(score) {
        this.scoreContainer.textContent = `スコア: ${Math.floor(score)}`;
    }
    
    /**
     * Update the leaderboard
     * @param {Array} entities - All game entities
     * @param {Player} player - Player entity
     */
    updateLeaderboard(entities, player) {
        // Get all snakes (player and NPCs)
        const snakes = entities.filter(e => e.type === 'player' || e.type === 'npc');
        
        // Sort by score
        snakes.sort((a, b) => b.score - a.score);
        
        // Take top 10
        const topSnakes = snakes.slice(0, CONFIG.UI.LEADERBOARD_SIZE);
        
        // Clear leaderboard
        this.leaderboardList.innerHTML = '';
        
        // Add entries
        for (let i = 0; i < topSnakes.length; i++) {
            const snake = topSnakes[i];
            const isPlayer = snake === player;
            
            const li = document.createElement('li');
            li.innerHTML = `<span>${i + 1}. ${isPlayer ? 'あなた' : `NPC ${snake.id.substring(0, 4)}`}</span><span>${Math.floor(snake.score)}</span>`;
            
            if (isPlayer) {
                li.style.color = '#ffff00';
                li.style.fontWeight = 'bold';
            }
            
            this.leaderboardList.appendChild(li);
        }
    }
    
    /**
     * Show the menu screen
     */
    showMenuScreen() {
        this.menuScreen.classList.remove('hidden');
        this.updateHighScores();
    }
    
    /**
     * Hide the menu screen
     */
    hideMenuScreen() {
        this.menuScreen.classList.add('hidden');
    }
    
    /**
     * Show the game over screen
     * @param {Object} stats - Player stats
     */
    showGameOverScreen(stats) {
        this.finalScore.textContent = Math.floor(stats.score);
        this.playTime.textContent = Utils.formatTime(stats.playTime);
        this.killedNPCs.textContent = stats.killedNPCs;
        this.maxSize.textContent = Math.floor(stats.maxSize);
        
        this.gameOverScreen.classList.remove('hidden');
        
        // Add to high scores if eligible
        this.addHighScore(stats.score, stats.playTime, stats.killedNPCs);
    }
    
    /**
     * Hide the game over screen
     */
    hideGameOverScreen() {
        this.gameOverScreen.classList.add('hidden');
    }
    
    /**
     * Load high scores from local storage
     * @returns {Array} - Array of high scores
     */
    loadHighScores() {
        const highScores = localStorage.getItem('slitherHighScores');
        return highScores ? JSON.parse(highScores) : [];
    }
    
    /**
     * Save high scores to local storage
     */
    saveHighScores() {
        localStorage.setItem('slitherHighScores', JSON.stringify(this.highScores));
    }
    
    /**
     * Add a high score
     * @param {number} score - Player's score
     * @param {number} playTime - Play time in seconds
     * @param {number} killedNPCs - Number of NPCs killed
     */
    addHighScore(score, playTime, killedNPCs) {
        // Create high score object
        const highScore = {
            score: Math.floor(score),
            playTime,
            killedNPCs,
            date: new Date().toLocaleDateString()
        };
        
        // Add to high scores
        this.highScores.push(highScore);
        
        // Sort high scores
        this.highScores.sort((a, b) => b.score - a.score);
        
        // Keep only top scores
        this.highScores = this.highScores.slice(0, CONFIG.UI.HIGHSCORE_COUNT);
        
        // Save high scores
        this.saveHighScores();
        
        // Update high scores display
        this.updateHighScores();
    }
    
    /**
     * Update high scores display
     */
    updateHighScores() {
        // Clear high scores list
        this.highScoreList.innerHTML = '';
        
        // Add entries
        for (let i = 0; i < this.highScores.length; i++) {
            const highScore = this.highScores[i];
            
            const li = document.createElement('li');
            li.innerHTML = `<span>${i + 1}. ${highScore.score}</span><span>${Utils.formatTime(highScore.playTime)}</span>`;
            
            this.highScoreList.appendChild(li);
        }
        
        // Add placeholder if no high scores
        if (this.highScores.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'まだハイスコアはありません';
            this.highScoreList.appendChild(li);
        }
    }
}
