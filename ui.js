// Управление пользовательским интерфейсом
class UI {
    constructor() {
        this.screens = {
            start: document.getElementById('start-screen'),
            instruction: document.getElementById('instruction-screen'),
            levelComplete: document.getElementById('level-complete-screen'),
            gameOver: document.getElementById('game-over-screen')
        };
        
        this.elements = {
            score: document.getElementById('score'),
            level: document.getElementById('level'),
            lives: document.getElementById('lives'),
            levelScore: document.getElementById('level-score'),
            finalScore: document.getElementById('final-score'),
            levelStory: document.getElementById('level-story')
        };
        
        this.levelManager = new LevelManager();
    }
    
    showStartScreen() {
        this.hideAllScreens();
        this.screens.start.style.display = 'flex';
    }
    
    showInstructionScreen() {
        this.hideAllScreens();
        this.screens.instruction.style.display = 'flex';
    }
    
    showLevelCompleteScreen(score, level) {
        this.hideAllScreens();
        this.elements.levelScore.textContent = score;
        this.elements.levelStory.innerHTML = this.levelManager.getLevelStory(level);
        this.screens.levelComplete.style.display = 'flex';
    }
    
    showGameOverScreen(score, isVictory = false) {
        this.hideAllScreens();
        this.elements.finalScore.textContent = score;
        
        if (isVictory) {
            this.screens.gameOver.querySelector('h2').textContent = 'Победа!';
            this.screens.gameOver.querySelector('p').textContent = 'Кот спасся от инопланетян!';
        } else {
            this.screens.gameOver.querySelector('h2').textContent = 'Кот пойман!';
            this.screens.gameOver.querySelector('p').textContent = 'Инопланетяне схватили нашего героя.';
        }
        
        this.screens.gameOver.style.display = 'flex';
    }
    
    hideAllScreens() {
        for (const screen in this.screens) {
            this.screens[screen].style.display = 'none';
        }
    }
    
    updateHUD(score, level, lives) {
        this.elements.score.textContent = score;
        this.elements.level.textContent = level;
        this.elements.lives.textContent = lives;
    }
}