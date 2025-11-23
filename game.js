// Основной игровой файл
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Игровые переменные
        this.state = {
            running: false,
            score: 0,
            level: 1,
            lives: 5,
            baseSpeed: 2.8,
            currentSpeed: 2.8,
            gravity: 0.3,
            jumpStrength: 16,
            platforms: [],
            obstacles: [],
            collectibles: [],
            aliens: [],
            chasingAlien: null,
            player: {
                x: 100,
                y: 0,
                width: 40,
                height: 40,
                velocityY: 0,
                jumping: false,
                facingRight: true,
                slowed: false,
                slowTimer: 0
            },
            keys: {},
            lastPlatformIndex: 0,
            invulnerable: false,
            invulnerableTimer: 0,
            cameraOffset: 0
        };
        
        // Эффекты
        this.jumpParticles = [];
        this.collectionEffects = [];
        this.damageEffects = [];
        this.slowEffects = [];
        
        // Инициализация
        this.resizeCanvas();
        this.setupEventListeners();
        this.ui = new UI();
        this.graphics = new Graphics(this.ctx);
        this.levelManager = new LevelManager();
        
        // Запуск игрового цикла
        this.gameLoop();
    }
    
    resizeCanvas() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());
        
        document.addEventListener('keydown', (e) => {
            this.state.keys[e.code] = true;
            
            if ((e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') && this.state.running) {
                e.preventDefault();
                if (!this.state.player.jumping && !this.state.player.slowed) {
                    this.jump();
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.state.keys[e.code] = false;
        });
        
        // Добавляем обработчик клика/тапа для прыжка
        this.canvas.addEventListener('click', () => {
            if (this.state.running && !this.state.player.jumping && !this.state.player.slowed) {
                this.jump();
            }
        });
        
        // Обработчики кнопок UI
        document.getElementById('start-btn').addEventListener('click', () => this.ui.showInstructionScreen());
        document.getElementById('continue-btn').addEventListener('click', () => this.startGame());
        document.getElementById('next-level-btn').addEventListener('click', () => this.nextLevel());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
    }
    
    jump() {
        this.state.player.velocityY = -this.state.jumpStrength;
        this.state.player.jumping = true;
        this.createJumpEffect();
    }
    
    createJumpEffect() {
        // Создаем частицы для эффекта прыжка
        for (let i = 0; i < 5; i++) {
            this.jumpParticles.push({
                x: this.state.player.x + this.state.player.width / 2,
                y: this.state.player.y + this.state.player.height,
                size: 2 + Math.random() * 3,
                speedX: -2 + Math.random() * 4,
                speedY: 1 + Math.random() * 3,
                life: 20 + Math.random() * 10,
                color: '#ff9a00'
            });
        }
    }
    
    updateJumpParticles() {
        for (let i = this.jumpParticles.length - 1; i >= 0; i--) {
            const particle = this.jumpParticles[i];
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            particle.life--;
            
            if (particle.life <= 0) {
                this.jumpParticles.splice(i, 1);
            }
        }
    }
    
    drawJumpParticles() {
        this.jumpParticles.forEach(particle => {
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.life / 30;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        this.ctx.globalAlpha = 1;
    }
    
    startGame() {
        this.state.running = true;
        this.state.score = 0;
        this.state.level = 1;
        this.state.lives = 5;
        this.state.cameraOffset = 0;
        this.state.currentSpeed = this.state.baseSpeed;
        this.ui.updateHUD(this.state.score, this.state.level, this.state.lives);
        this.levelManager.initLevel(this.state, this.canvas);
        this.ui.hideAllScreens();
    }
    
    nextLevel() {
        this.state.level++;
        
        if (this.state.level > 3) {
            // Если прошли все уровни
            this.ui.showGameOverScreen(this.state.score, true);
            return;
        }
        
        this.ui.updateHUD(this.state.score, this.state.level, this.state.lives);
        this.state.running = true;
        this.state.cameraOffset = 0;
        this.state.currentSpeed = this.state.baseSpeed;
        this.levelManager.initLevel(this.state, this.canvas);
        this.ui.hideAllScreens();
    }
    
    restartGame() {
        this.state.running = true;
        this.state.score = 0;
        this.state.level = 1;
        this.state.lives = 5;
        this.state.cameraOffset = 0;
        this.state.currentSpeed = this.state.baseSpeed;
        this.ui.updateHUD(this.state.score, this.state.level, this.state.lives);
        this.levelManager.initLevel(this.state, this.canvas);
        this.ui.hideAllScreens();
    }
    
    gameLoop() {
        if (this.state.running) {
            this.update();
            this.render();
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        // Обновление игрока
        this.state.player.velocityY += this.state.gravity;
        this.state.player.y += this.state.player.velocityY;
        
        // Обновление частиц прыжка
        this.updateJumpParticles();
        
        // Обновление эффектов замедления
        this.updateSlowEffects();
        
        // Обновление состояния замедления
        if (this.state.player.slowed) {
            this.state.player.slowTimer--;
            if (this.state.player.slowTimer <= 0) {
                this.state.player.slowed = false;
                this.state.currentSpeed = this.state.baseSpeed;
            }
        }
        
        // Проверка столкновений с платформами
        let onPlatform = false;
        for (const platform of this.state.platforms) {
            if (this.checkPlatformCollision(this.state.player, platform)) {
                this.state.player.y = platform.y - this.state.player.height;
                this.state.player.velocityY = 0;
                this.state.player.jumping = false;
                onPlatform = true;
                
                // Автоматическое продвижение вперед при приземлении
                if (this.state.level === 1) {
                    this.state.player.x += this.state.currentSpeed * 0.3;
                }
            }
        }
        
        // Если игрок падает за пределы экрана - потеря жизни
        if (this.state.player.y > this.canvas.height) {
            this.loseLife();
            return;
        }
        
        // Обновление неуязвимости
        if (this.state.invulnerable) {
            this.state.invulnerableTimer--;
            if (this.state.invulnerableTimer <= 0) {
                this.state.invulnerable = false;
            }
        }
        
        // Проверка столкновений с препятствиями
        if (!this.state.invulnerable) {
            for (let i = this.state.obstacles.length - 1; i >= 0; i--) {
                const obstacle = this.state.obstacles[i];
                if (this.checkCollision(this.state.player, obstacle)) {
                    this.slowPlayer();
                    break; // Замедляем только один раз за кадр
                }
            }
            
            // Проверка столкновений с инопланетянами
            for (let i = this.state.aliens.length - 1; i >= 0; i--) {
                const alien = this.state.aliens[i];
                if (this.checkCollision(this.state.player, alien)) {
                    this.loseLife();
                    return;
                }
                
                // Движение инопланетян
                alien.x -= alien.speed;
                
                // Если инопланетянин ушел за экран, перемещаем его вперед
                if (alien.x + alien.width < 0) {
                    const platform = this.state.platforms[Math.floor(Math.random() * this.state.platforms.length)];
                    alien.x = platform.x + platform.width + 200 + Math.random() * 300;
                }
            }
        }
        
        // Обновление преследующего инопланетянина
        if (this.state.chasingAlien) {
            this.updateChasingAlien();
        }
        
        // Проверка коллекционных предметов
        for (let i = this.state.collectibles.length - 1; i >= 0; i--) {
            const collectible = this.state.collectibles[i];
            if (!collectible.collected && this.checkCollision(this.state.player, collectible)) {
                collectible.collected = true;
                this.state.score += 100;
                this.ui.updateHUD(this.state.score, this.state.level, this.state.lives);
                
                // Создаем эффект сбора предмета
                this.createCollectionEffect(collectible.x, collectible.y);
            }
        }
        
        // Движение платформ и препятствий (создание иллюзии бега)
        this.updateGameObjects();
        
        // Обновление камеры (следование за игроком)
        this.updateCamera();
        
        // Проверка завершения уровня (игрок достиг правого края последней платформы)
        const lastPlatform = this.state.platforms[this.state.platforms.length - 1];
        if (this.state.player.x > lastPlatform.x + lastPlatform.width - 50) {
            this.completeLevel();
            return;
        }
    }
    
    updateChasingAlien() {
        const chasingAlien = this.state.chasingAlien;
        
        // Если инопланетянин еще не активен, отсчитываем время до активации
        if (!chasingAlien.active) {
            chasingAlien.activationTimer--;
            if (chasingAlien.activationTimer <= 0) {
                chasingAlien.active = true;
            }
            return;
        }
        
        // Преследующий инопланетянин движется вправо, чтобы догнать кота
        chasingAlien.x += chasingAlien.speed;
        
        // Постепенное ускорение инопланетянина
        chasingAlien.speed += chasingAlien.acceleration;
        
        // Ограничиваем максимальную скорость инопланетянина
        const maxSpeed = this.state.baseSpeed * 0.6; // Максимум 60% от скорости игры
        if (chasingAlien.speed > maxSpeed) {
            chasingAlien.speed = maxSpeed;
        }
        
        // Если инопланетянин догнал кота - потеря жизни
        if (this.checkCollision(this.state.player, chasingAlien)) {
            this.loseLife();
            return;
        }
        
        // Если инопланетянин ушел далеко за экран, деактивируем его
        if (chasingAlien.x > this.canvas.width + 500) {
            chasingAlien.active = false;
        }
    }
    
    slowPlayer() {
        // Активируем замедление
        this.state.player.slowed = true;
        this.state.player.slowTimer = 45; // Уменьшили время замедления до 0.75 секунд
        this.state.currentSpeed = this.state.baseSpeed * 0.6; // Уменьшаем скорость на 40% (вместо 50%)
        
        // Создаем эффект замедления
        this.createSlowEffect();
    }
    
    createSlowEffect() {
        // Создаем эффект замедления вокруг игрока
        for (let i = 0; i < 15; i++) {
            this.slowEffects.push({
                x: this.state.player.x + this.state.player.width / 2,
                y: this.state.player.y + this.state.player.height / 2,
                size: 3 + Math.random() * 4,
                speedX: -4 + Math.random() * 8,
                speedY: -4 + Math.random() * 8,
                life: 25 + Math.random() * 20,
                color: '#8a2be2' // Фиолетовый цвет для эффекта замедления
            });
        }
    }
    
    updateSlowEffects() {
        for (let i = this.slowEffects.length - 1; i >= 0; i--) {
            const effect = this.slowEffects[i];
            effect.x += effect.speedX;
            effect.y += effect.speedY;
            effect.life--;
            
            if (effect.life <= 0) {
                this.slowEffects.splice(i, 1);
            }
        }
    }
    
    drawSlowEffects() {
        this.slowEffects.forEach(effect => {
            this.ctx.fillStyle = effect.color;
            this.ctx.globalAlpha = effect.life / 45;
            this.ctx.beginPath();
            this.ctx.arc(effect.x, effect.y, effect.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        this.ctx.globalAlpha = 1;
    }
    
    createCollectionEffect(x, y) {
        // Создаем эффект сбора коллекционного предмета
        for (let i = 0; i < 8; i++) {
            this.collectionEffects.push({
                x: x,
                y: y,
                size: 2 + Math.random() * 3,
                speedX: -3 + Math.random() * 6,
                speedY: -3 + Math.random() * 6,
                life: 15 + Math.random() * 10,
                color: '#4cc9f0'
            });
        }
    }
    
    updateCollectionEffects() {
        for (let i = this.collectionEffects.length - 1; i >= 0; i--) {
            const effect = this.collectionEffects[i];
            effect.x += effect.speedX;
            effect.y += effect.speedY;
            effect.life--;
            
            if (effect.life <= 0) {
                this.collectionEffects.splice(i, 1);
            }
        }
    }
    
    drawCollectionEffects() {
        this.collectionEffects.forEach(effect => {
            this.ctx.fillStyle = effect.color;
            this.ctx.globalAlpha = effect.life / 25;
            this.ctx.beginPath();
            this.ctx.arc(effect.x, effect.y, effect.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        this.ctx.globalAlpha = 1;
    }
    
    updateCamera() {
        // Камера следует за игроком, когда он проходит середину экрана
        const cameraThreshold = this.canvas.width * 0.6;
        
        if (this.state.player.x > cameraThreshold) {
            this.state.cameraOffset = this.state.player.x - cameraThreshold;
        } else {
            this.state.cameraOffset = 0;
        }
    }
    
    updateGameObjects() {
        // Движение платформ (используем текущую скорость, которая может быть уменьшена)
        for (const platform of this.state.platforms) {
            platform.x -= this.state.currentSpeed;
            
            // Если платформа ушла за экран, перемещаем ее вперед
            if (platform.x + platform.width < 0) {
                const lastPlatform = this.state.platforms[this.state.platforms.length - 1];
                
                // Разное расстояние для разных уровней
                let minGap, maxGap;
                if (this.state.level === 1) {
                    minGap = 200;
                    maxGap = 280;
                } else if (this.state.level === 2) {
                    minGap = 180;
                    maxGap = 250;
                } else {
                    minGap = 160;
                    maxGap = 230;
                }
                
                platform.x = lastPlatform.x + lastPlatform.width + minGap + Math.random() * (maxGap - minGap);
                
                // Обновляем препятствия и коллекционные предметы на перемещенной платформе
                this.levelManager.updatePlatformObjects(platform, this.state);
            }
        }
        
        // Движение препятствий
        for (const obstacle of this.state.obstacles) {
            obstacle.x -= this.state.currentSpeed;
        }
        
        // Движение коллекционных предметов
        for (const collectible of this.state.collectibles) {
            if (!collectible.collected) {
                collectible.x -= this.state.currentSpeed;
            }
        }
        
        // Движение инопланетян
        for (const alien of this.state.aliens) {
            alien.x -= this.state.currentSpeed;
        }
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    checkPlatformCollision(player, platform) {
        // Очень мягкая проверка столкновения с платформами
        const isAbovePlatform = player.y + player.height > platform.y - 15;
        const isBelowPlatform = player.y + player.height < platform.y + platform.height + 20;
        const isHorizontallyAligned = player.x + player.width > platform.x && player.x < platform.x + platform.width;
        const isFalling = player.velocityY > 0;
        
        return isAbovePlatform && isBelowPlatform && isHorizontallyAligned && isFalling;
    }
    
    loseLife() {
        this.state.lives--;
        this.ui.updateHUD(this.state.score, this.state.level, this.state.lives);
        
        if (this.state.lives <= 0) {
            this.state.running = false;
            this.ui.showGameOverScreen(this.state.score, false);
        } else {
            // Перезапуск уровня с неуязвимостью
            this.state.invulnerable = true;
            this.state.invulnerableTimer = 150; // Увеличили время неуязвимости
            
            // Сброс позиции игрока
            this.state.player.x = 100;
            this.state.player.y = this.state.platforms[0].y - this.state.player.height;
            this.state.player.velocityY = 0;
            this.state.player.jumping = false;
            this.state.player.slowed = false;
            this.state.player.slowTimer = 0;
            this.state.cameraOffset = 0;
            this.state.currentSpeed = this.state.baseSpeed;
            
            // Сбрасываем преследующего инопланетянина
            if (this.state.chasingAlien) {
                this.state.chasingAlien.x = -300;
                this.state.chasingAlien.speed = this.state.baseSpeed * 0.3;
                this.state.chasingAlien.active = false;
                this.state.chasingAlien.activationTimer = 240;
            }
            
            // Создаем эффект потери жизни
            this.createDamageEffect();
        }
    }
    
    createDamageEffect() {
        // Создаем эффект повреждения
        for (let i = 0; i < 12; i++) {
            this.damageEffects.push({
                x: this.state.player.x + this.state.player.width / 2,
                y: this.state.player.y + this.state.player.height / 2,
                size: 3 + Math.random() * 4,
                speedX: -5 + Math.random() * 10,
                speedY: -5 + Math.random() * 10,
                life: 20 + Math.random() * 15,
                color: '#e94560'
            });
        }
    }
    
    updateDamageEffects() {
        for (let i = this.damageEffects.length - 1; i >= 0; i--) {
            const effect = this.damageEffects[i];
            effect.x += effect.speedX;
            effect.y += effect.speedY;
            effect.life--;
            
            if (effect.life <= 0) {
                this.damageEffects.splice(i, 1);
            }
        }
    }
    
    drawDamageEffects() {
        this.damageEffects.forEach(effect => {
            this.ctx.fillStyle = effect.color;
            this.ctx.globalAlpha = effect.life / 35;
            this.ctx.beginPath();
            this.ctx.arc(effect.x, effect.y, effect.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        this.ctx.globalAlpha = 1;
    }
    
    completeLevel() {
        this.state.running = false;
        this.ui.showLevelCompleteScreen(this.state.score, this.state.level);
    }
    
    applyCameraTransform() {
        // Применяем смещение камеры ко всем объектам
        this.ctx.save();
        this.ctx.translate(-this.state.cameraOffset, 0);
    }
    
    resetCameraTransform() {
        // Сбрасываем трансформацию камеры
        this.ctx.restore();
    }
    
    render() {
        // Очистка canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Применяем трансформацию камеры
        this.applyCameraTransform();
        
        // Отрисовка фона
        this.graphics.drawBackground(this.canvas.width, this.canvas.height, this.state.cameraOffset);
        
        // Отрисовка игровых объектов
        this.graphics.drawPlatforms(this.state.platforms, this.state.cameraOffset);
        this.graphics.drawObstacles(this.state.obstacles, this.state.cameraOffset);
        this.graphics.drawCollectibles(this.state.collectibles, this.state.cameraOffset);
        this.graphics.drawAliens(this.state.aliens, this.state.cameraOffset);
        
        // Отрисовка преследующего инопланетянина
        if (this.state.chasingAlien && this.state.chasingAlien.active) {
            this.graphics.drawChasingAlien(this.state.chasingAlien, this.state.cameraOffset);
        }
        
        // Отрисовка эффектов
        this.drawJumpParticles();
        this.drawCollectionEffects();
        this.drawDamageEffects();
        this.drawSlowEffects();
        
        // Отрисовка игрока (с мерцанием если неуязвим)
        if (!this.state.invulnerable || Math.floor(this.state.invulnerableTimer / 5) % 2 === 0) {
            this.graphics.drawPlayer(this.state.player, this.state.cameraOffset);
        }
        
        // Сбрасываем трансформацию камеры
        this.resetCameraTransform();
        
        // Обновление эффектов
        this.updateDamageEffects();
        this.updateCollectionEffects();
    }
}

// Запуск игры при загрузке страницы
window.addEventListener('load', () => {
    new Game();
});