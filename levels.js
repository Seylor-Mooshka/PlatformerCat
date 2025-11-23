// Управление уровнями и генерацией контента
class LevelManager {
    constructor() {
        this.levelStories = [
            "Уровень 1: Побег с крыши<br>Кот пытается сбежать с крыши дома, где его держали инопланетяне. Нужно перепрыгнуть через вентиляционные трубы и антенны!",
            "Уровень 2: Путь через небоскребы<br>Кот бежит по крышам высоток, пытаясь найти укрытие. Но инопланетяне уже начали преследование!",
            "Уровень 3: Финальный рывок<br>Впереди виден космический корабль, который может унести кота к безопасности. Осталось преодолеть последние препятствия!"
        ];
    }
    
    initLevel(gameState, canvas) {
        gameState.platforms = [];
        gameState.obstacles = [];
        gameState.collectibles = [];
        gameState.aliens = [];
        gameState.chasingAlien = null;
        
        // Настройка параметров уровня
        this.setLevelParameters(gameState);
        
        // Создаем начальную платформу
        gameState.platforms.push({
            x: 0,
            y: canvas.height - 50,
            width: canvas.width,
            height: 50,
            color: '#533483',
            id: 0
        });
        
        // Генерация платформ
        this.generatePlatforms(gameState, canvas);
        
        // Генерация препятствий
        this.generateObstacles(gameState);
        
        // Генерация коллекционных предметов
        this.generateCollectibles(gameState);
        
        // Генерация инопланетян
        this.generateAliens(gameState);
        
        // Генерация преследующего инопланетянина (только на уровнях 2 и 3)
        this.generateChasingAlien(gameState, canvas);
        
        // Устанавливаем начальную позицию игрока
        gameState.player.x = 100;
        gameState.player.y = gameState.platforms[0].y - gameState.player.height;
        gameState.player.velocityY = 0;
        gameState.player.jumping = false;
        gameState.player.slowed = false;
        gameState.player.slowTimer = 0;
    }
    
    setLevelParameters(gameState) {
        switch(gameState.level) {
            case 1:
                gameState.baseSpeed = 2.8; // Медленная скорость для первого уровня
                gameState.currentSpeed = 2.8;
                gameState.gravity = 0.3;   // Очень легкая гравитация
                gameState.jumpStrength = 16; // Очень сильный прыжок
                break;
            case 2:
                gameState.baseSpeed = 3.2;
                gameState.currentSpeed = 3.2;
                gameState.gravity = 0.35;
                gameState.jumpStrength = 15;
                break;
            case 3:
                gameState.baseSpeed = 3.6;
                gameState.currentSpeed = 3.6;
                gameState.gravity = 0.4;
                gameState.jumpStrength = 14;
                break;
        }
    }
    
    generatePlatforms(gameState, canvas) {
        const platformCount = 6 + gameState.level;
        
        // Настройки в зависимости от уровня
        let minGap, maxGap, minWidth, maxWidth, heightPattern;
        
        if (gameState.level === 1) {
            // Очень легкие настройки для первого уровня
            minGap = 200;
            maxGap = 280;
            minWidth = 180;
            maxWidth = 350;
            heightPattern = [0, -40, 0, -30, 0, -50, 0, -20]; // Минимальные перепады высот
        } else if (gameState.level === 2) {
            minGap = 180;
            maxGap = 250;
            minWidth = 160;
            maxWidth = 300;
            heightPattern = [0, -60, 0, -40, 0, -70, 0, -30];
        } else {
            minGap = 160;
            maxGap = 230;
            minWidth = 140;
            maxWidth = 280;
            heightPattern = [0, -80, 0, -50, 0, -90, 0, -40];
        }
        
        let lastX = canvas.width;
        let platformId = 1;
        
        for (let i = 0; i < platformCount; i++) {
            const width = minWidth + Math.random() * (maxWidth - minWidth);
            const gap = minGap + Math.random() * (maxGap - minGap);
            
            // Определяем высоту платформы по паттерну
            let y = canvas.height - 50 + (heightPattern[i % heightPattern.length] || 0);
            
            // Ограничиваем высоту разумными пределами
            y = Math.max(canvas.height - 180, Math.min(canvas.height - 50, y));
            
            gameState.platforms.push({
                x: lastX + gap,
                y: y,
                width: width,
                height: 30,
                color: '#533483',
                id: platformId++
            });
            
            lastX = lastX + gap + width;
        }
        
        gameState.lastPlatformIndex = platformId - 1;
    }
    
    generateObstacles(gameState) {
        // Очень мало препятствий на первом уровне
        let obstacleCount;
        let safeZoneMultiplier;
        
        switch(gameState.level) {
            case 1:
                obstacleCount = 1; // Всего 1 препятствие на первом уровне
                safeZoneMultiplier = 0.35; // 35% безопасная зона
                break;
            case 2:
                obstacleCount = 3;
                safeZoneMultiplier = 0.3;
                break;
            case 3:
                obstacleCount = 5;
                safeZoneMultiplier = 0.25;
                break;
        }
        
        for (let i = 0; i < obstacleCount; i++) {
            // Для первого уровня выбираем только одну конкретную платформу
            let platformIndex;
            if (gameState.level === 1) {
                platformIndex = 4; // Только на 4-й платформе (после стартовой)
            } else {
                // Для других уровней равномерное распределение
                platformIndex = 2 + Math.floor(i * (gameState.platforms.length - 4) / obstacleCount);
            }
            
            // Проверяем, что индекс в пределах массива
            if (platformIndex >= gameState.platforms.length) continue;
            
            const platform = gameState.platforms[platformIndex];
            
            // Увеличиваем отступы от краев платформы
            const safeZone = platform.width * safeZoneMultiplier;
            
            // Размещаем препятствия в безопасной зоне
            const maxX = platform.x + platform.width - safeZone - 20;
            const minX = platform.x + safeZone;
            
            if (maxX > minX) {
                // Для первого уровня размещаем препятствие по центру
                let xPos;
                if (gameState.level === 1) {
                    xPos = platform.x + platform.width / 2 - 10; // Ровно по центру
                } else {
                    xPos = minX + Math.random() * (maxX - minX);
                }
                
                gameState.obstacles.push({
                    x: xPos,
                    y: platform.y - 30,
                    width: 20,
                    height: 30,
                    color: '#e94560',
                    platformId: platform.id
                });
            }
        }
    }
    
    generateCollectibles(gameState) {
        const collectibleCount = 8 + gameState.level * 2;
        
        for (let i = 0; i < collectibleCount; i++) {
            // Выбираем случайную платформу
            const platformIndex = Math.floor(Math.random() * gameState.platforms.length);
            const platform = gameState.platforms[platformIndex];
            
            // Размещаем коллекционный предмет в безопасной зоне
            const safeZone = 50; // Увеличили безопасную зону
            const xPos = platform.x + safeZone + Math.random() * (platform.width - 2 * safeZone);
            
            gameState.collectibles.push({
                x: xPos,
                y: platform.y - 20,
                width: 15,
                height: 10,
                color: '#4cc9f0',
                collected: false,
                platformId: platform.id
            });
        }
    }
    
    generateAliens(gameState) {
        // Инопланетяне появляются только на 2 и 3 уровнях
        if (gameState.level < 2) return;
        
        const alienCount = gameState.level; // 2 на 2 уровне, 3 на 3 уровне
        
        for (let i = 0; i < alienCount; i++) {
            // Выбираем платформу в конце уровня
            const platformIndex = Math.floor(gameState.platforms.length * 0.7) + 
                                 Math.floor(Math.random() * (gameState.platforms.length * 0.3));
            const platform = gameState.platforms[platformIndex];
            
            gameState.aliens.push({
                x: platform.x + platform.width + 200 + Math.random() * 200,
                y: platform.y - 40,
                width: 30,
                height: 40,
                color: '#00ff9d',
                speed: 0.4 + gameState.level * 0.15, // Еще медленнее
                platformId: platform.id
            });
        }
    }
    
    generateChasingAlien(gameState, canvas) {
        // Преследующий инопланетянин появляется только на уровнях 2 и 3
        if (gameState.level < 2) return;
        
        gameState.chasingAlien = {
            x: -300, // Начинает еще дальше за экраном
            y: canvas.height - 100,
            width: 40,
            height: 50,
            color: '#ff3e6d',
            speed: gameState.baseSpeed * 0.3, // Еще медленнее
            active: false,
            activationTimer: 240, // Активируется через 4 секунды
            acceleration: 0.001 // Меньшее ускорение
        };
    }
    
    updatePlatformObjects(platform, gameState) {
        // Обновляем препятствия на перемещенной платформе
        for (const obstacle of gameState.obstacles) {
            if (obstacle.platformId === platform.id) {
                // Пересчитываем позицию с учетом безопасных расстояний
                let safeZoneMultiplier;
                switch(gameState.level) {
                    case 1: safeZoneMultiplier = 0.35; break;
                    case 2: safeZoneMultiplier = 0.3; break;
                    case 3: safeZoneMultiplier = 0.25; break;
                }
                
                const safeZone = platform.width * safeZoneMultiplier;
                const maxX = platform.x + platform.width - safeZone - 20;
                const minX = platform.x + safeZone;
                
                if (maxX > minX) {
                    // Для первого уровня сохраняем центральное положение
                    if (gameState.level === 1) {
                        obstacle.x = platform.x + platform.width / 2 - 10;
                    } else {
                        obstacle.x = minX + Math.random() * (maxX - minX);
                    }
                }
            }
        }
        
        // Обновляем коллекционные предметы на перемещенной платформе
        for (const collectible of gameState.collectibles) {
            if (collectible.platformId === platform.id && !collectible.collected) {
                const safeZone = 50;
                collectible.x = platform.x + safeZone + Math.random() * (platform.width - 2 * safeZone);
            }
        }
        
        // Обновляем инопланетян на перемещенной платформе
        for (const alien of gameState.aliens) {
            if (alien.platformId === platform.id) {
                alien.x = platform.x + platform.width + 200 + Math.random() * 200;
            }
        }
    }
    
    getLevelStory(level) {
        return this.levelStories[level - 1] || "";
    }
}