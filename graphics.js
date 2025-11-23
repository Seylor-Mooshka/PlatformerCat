// Векторная графика для игры
class Graphics {
    constructor(ctx) {
        this.ctx = ctx;
    }
    
    drawBackground(width, height, cameraOffset) {
        // Градиентный фон
        const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#0f3460');
        gradient.addColorStop(1, '#1a1a2e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, width, height);
        
        // Звезды
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 50; i++) {
            const x = (i * 37) % width;
            const y = (i * 23) % height;
            const size = 1 + Math.random() * 2;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Луна
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.beginPath();
        this.ctx.arc(width - 80, 80, 50, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.beginPath();
        this.ctx.arc(width - 100, 70, 20, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawPlatforms(platforms, cameraOffset) {
        platforms.forEach(platform => {
            // Основная платформа
            this.ctx.fillStyle = platform.color;
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // Текстура крыши
            this.ctx.fillStyle = '#3d235a';
            for (let i = 0; i < platform.width; i += 20) {
                this.ctx.fillRect(platform.x + i, platform.y, 10, 5);
            }
            
            // Боковые стороны
            this.ctx.fillStyle = '#3d235a';
            this.ctx.fillRect(platform.x, platform.y + platform.height, platform.width, 5);
            
            // Окна на небоскребах
            if (platform.width > 80) {
                this.ctx.fillStyle = '#f9a826';
                for (let i = 10; i < platform.width - 10; i += 25) {
                    for (let j = 10; j < platform.height - 5; j += 15) {
                        this.ctx.fillRect(platform.x + i, platform.y + j, 15, 10);
                    }
                }
            }
        });
    }
    
    drawObstacles(obstacles, cameraOffset) {
        obstacles.forEach(obstacle => {
            // Основное тело препятствия
            this.ctx.fillStyle = obstacle.color;
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            
            // Детали препятствия
            this.ctx.fillStyle = '#b32c45';
            this.ctx.fillRect(obstacle.x + 5, obstacle.y + 5, obstacle.width - 10, 5);
            
            // Верхняя часть
            this.ctx.fillStyle = '#ff6b8b';
            this.ctx.beginPath();
            this.ctx.moveTo(obstacle.x, obstacle.y);
            this.ctx.lineTo(obstacle.x + obstacle.width, obstacle.y);
            this.ctx.lineTo(obstacle.x + obstacle.width - 5, obstacle.y - 5);
            this.ctx.lineTo(obstacle.x + 5, obstacle.y - 5);
            this.ctx.closePath();
            this.ctx.fill();
        });
    }
    
    drawCollectibles(collectibles, cameraOffset) {
        collectibles.forEach(collectible => {
            if (!collectible.collected) {
                // Тело рыбы
                this.ctx.fillStyle = collectible.color;
                this.ctx.beginPath();
                this.ctx.moveTo(collectible.x, collectible.y + collectible.height / 2);
                this.ctx.lineTo(collectible.x + collectible.width, collectible.y);
                this.ctx.lineTo(collectible.x + collectible.width, collectible.y + collectible.height);
                this.ctx.lineTo(collectible.x, collectible.y + collectible.height / 2);
                this.ctx.closePath();
                this.ctx.fill();
                
                // Глаз рыбы
                this.ctx.fillStyle = '#000';
                this.ctx.beginPath();
                this.ctx.arc(collectible.x + 3, collectible.y + collectible.height / 2, 2, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Хвост рыбы
                this.ctx.strokeStyle = collectible.color;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(collectible.x + collectible.width, collectible.y + collectible.height / 2);
                this.ctx.lineTo(collectible.x + collectible.width + 5, collectible.y + collectible.height / 2 - 5);
                this.ctx.moveTo(collectible.x + collectible.width, collectible.y + collectible.height / 2);
                this.ctx.lineTo(collectible.x + collectible.width + 5, collectible.y + collectible.height / 2 + 5);
                this.ctx.stroke();
            }
        });
    }
    
    drawAliens(aliens, cameraOffset) {
        aliens.forEach(alien => {
            // Тело инопланетянина
            this.ctx.fillStyle = alien.color;
            this.ctx.fillRect(alien.x, alien.y, alien.width, alien.height);
            
            // Голова
            this.ctx.fillStyle = '#00cc7e';
            this.ctx.beginPath();
            this.ctx.arc(alien.x + alien.width / 2, alien.y - 10, 15, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Глаза
            this.ctx.fillStyle = '#000';
            this.ctx.beginPath();
            this.ctx.arc(alien.x + alien.width / 2 - 5, alien.y - 12, 3, 0, Math.PI * 2);
            this.ctx.arc(alien.x + alien.width / 2 + 5, alien.y - 12, 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Антенна
            this.ctx.strokeStyle = '#00cc7e';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(alien.x + alien.width / 2, alien.y - 25);
            this.ctx.lineTo(alien.x + alien.width / 2, alien.y - 35);
            this.ctx.stroke();
            
            this.ctx.fillStyle = '#ff3e6d';
            this.ctx.beginPath();
            this.ctx.arc(alien.x + alien.width / 2, alien.y - 35, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    drawChasingAlien(alien, cameraOffset) {
        // Тело инопланетянина
        this.ctx.fillStyle = alien.color;
        this.ctx.fillRect(alien.x, alien.y, alien.width, alien.height);
        
        // Голова
        this.ctx.fillStyle = '#ff6b8b';
        this.ctx.beginPath();
        this.ctx.arc(alien.x + alien.width / 2, alien.y - 15, 20, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Глаза
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(alien.x + alien.width / 2 - 8, alien.y - 18, 4, 0, Math.PI * 2);
        this.ctx.arc(alien.x + alien.width / 2 + 8, alien.y - 18, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Рот
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(alien.x + alien.width / 2, alien.y - 10, 8, 0, Math.PI);
        this.ctx.stroke();
        
        // Щупальца
        this.ctx.strokeStyle = '#ff6b8b';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(alien.x + alien.width / 2 - 10, alien.y - 35);
        this.ctx.lineTo(alien.x + alien.width / 2 - 15, alien.y - 45);
        this.ctx.moveTo(alien.x + alien.width / 2, alien.y - 35);
        this.ctx.lineTo(alien.x + alien.width / 2, alien.y - 50);
        this.ctx.moveTo(alien.x + alien.width / 2 + 10, alien.y - 35);
        this.ctx.lineTo(alien.x + alien.width / 2 + 15, alien.y - 45);
        this.ctx.stroke();
    }
    
    drawPlayer(player, cameraOffset) {
        // Тело кота
        this.ctx.fillStyle = '#ff9a00';
        this.ctx.fillRect(player.x, player.y, player.width, player.height);
        
        // Голова
        this.ctx.fillStyle = '#ff9a00';
        this.ctx.beginPath();
        this.ctx.arc(player.x + player.width / 2, player.y - 10, 15, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Уши
        this.ctx.fillStyle = '#ff9a00';
        this.ctx.beginPath();
        this.ctx.moveTo(player.x + player.width / 2 - 10, player.y - 20);
        this.ctx.lineTo(player.x + player.width / 2 - 5, player.y - 30);
        this.ctx.lineTo(player.x + player.width / 2, player.y - 20);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.moveTo(player.x + player.width / 2 + 10, player.y - 20);
        this.ctx.lineTo(player.x + player.width / 2 + 5, player.y - 30);
        this.ctx.lineTo(player.x + player.width / 2, player.y - 20);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Внутренняя часть ушей
        this.ctx.fillStyle = '#ff6b00';
        this.ctx.beginPath();
        this.ctx.moveTo(player.x + player.width / 2 - 8, player.y - 20);
        this.ctx.lineTo(player.x + player.width / 2 - 4, player.y - 27);
        this.ctx.lineTo(player.x + player.width / 2 - 1, player.y - 20);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.moveTo(player.x + player.width / 2 + 8, player.y - 20);
        this.ctx.lineTo(player.x + player.width / 2 + 4, player.y - 27);
        this.ctx.lineTo(player.x + player.width / 2 + 1, player.y - 20);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Глаза
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(player.x + player.width / 2 - 5, player.y - 12, 3, 0, Math.PI * 2);
        this.ctx.arc(player.x + player.width / 2 + 5, player.y - 12, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Нос
        this.ctx.fillStyle = '#ff6b00';
        this.ctx.beginPath();
        this.ctx.arc(player.x + player.width / 2, player.y - 8, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Усы
        this.ctx.strokeStyle = '#ff9a00';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(player.x + player.width / 2, player.y - 8);
        this.ctx.lineTo(player.x + player.width / 2 - 10, player.y - 10);
        this.ctx.moveTo(player.x + player.width / 2, player.y - 8);
        this.ctx.lineTo(player.x + player.width / 2 - 10, player.y - 6);
        this.ctx.moveTo(player.x + player.width / 2, player.y - 8);
        this.ctx.lineTo(player.x + player.width / 2 + 10, player.y - 10);
        this.ctx.moveTo(player.x + player.width / 2, player.y - 8);
        this.ctx.lineTo(player.x + player.width / 2 + 10, player.y - 6);
        this.ctx.stroke();
        
        // Хвост
        this.ctx.strokeStyle = '#ff9a00';
        this.ctx.lineWidth = 8;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(player.x, player.y + player.height / 2);
        this.ctx.lineTo(player.x - 20, player.y + player.height / 2 - 10);
        this.ctx.stroke();
    }
}