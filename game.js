// Game Constants
const CANVAS = document.getElementById('gameCanvas');
const CTX = CANVAS.getContext('2d');

// Game State
let gameState = {
    running: false,
    player: null,
    bullets: [],
    enemies: [],
    particles: [],
    wave: 1,
    score: 0,
    points: 0,
    gameTime: 0, // seconds
    lastTime: 0
};

// Player Class
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 20;
        this.color = '#00bcd4';
        this.angle = 0;
        this.speed = 3; // Base speed
        this.maxHealth = 100;
        this.health = 100;
        
        // Upgrades
        this.damage = 10;
        this.fireRate = 500; // ms between shots
        this.lastShot = 0;
        this.bulletSpeed = 7;
    }

    draw() {
        CTX.save();
        CTX.translate(this.x, this.y);
        CTX.rotate(this.angle);
        
        // Body (Square)
        CTX.fillStyle = this.color;
        CTX.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        
        // Turret
        CTX.fillStyle = '#fff';
        CTX.fillRect(0, -5, 25, 10);
        
        CTX.restore();
        
        // Health Bar
        CTX.fillStyle = 'red';
        CTX.fillRect(this.x - 20, this.y - 30, 40, 5);
        CTX.fillStyle = 'lime';
        CTX.fillRect(this.x - 20, this.y - 30, 40 * (this.health / this.maxHealth), 5);
    }

    update(dt) {
        // Mouse look
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        this.angle = Math.atan2(dy, dx);

        // Movement
        if (keys['w'] || keys['W']) this.y -= this.speed;
        if (keys['s'] || keys['S']) this.y += this.speed;
        if (keys['a'] || keys['A']) this.x -= this.speed;
        if (keys['d'] || keys['D']) this.x += this.speed;

        // Bounds
        this.x = Math.max(this.size, Math.min(CANVAS.width - this.size, this.x));
        this.y = Math.max(this.size, Math.min(CANVAS.height - this.size, this.y));

        // Shooting
        if (mouse.down && Date.now() - this.lastShot > this.fireRate) {
            this.shoot();
            this.lastShot = Date.now();
        }
    }

    shoot() {
        const vx = Math.cos(this.angle) * this.bulletSpeed;
        const vy = Math.sin(this.angle) * this.bulletSpeed;
        gameState.bullets.push(new Bullet(this.x, this.y, vx, vy, this.damage));
    }
}

// Bullet Class
class Bullet {
    constructor(x, y, vx, vy, damage) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = 5;
        this.damage = damage;
        this.life = 100; // frames
    }

    draw() {
        CTX.beginPath();
        CTX.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        CTX.fillStyle = '#ffeb3b';
        CTX.fill();
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
    }
}

// Enemy Class
class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // 0: Triangle (Fast, Low HP), 1: Square (Med, Med), 2: Pentagon (Slow, Tank)
        
        if (type === 0) {
            this.size = 15;
            this.speed = 2 + (gameState.wave * 0.1);
            this.health = 20 + (gameState.wave * 5);
            this.color = '#ff5722'; // Orange
            this.sides = 3;
            this.scoreValue = 10;
        } else if (type === 1) {
            this.size = 20;
            this.speed = 1.5 + (gameState.wave * 0.05);
            this.health = 50 + (gameState.wave * 10);
            this.color = '#e91e63'; // Pink
            this.sides = 4;
            this.scoreValue = 20;
        } else {
            this.size = 30;
            this.speed = 1 + (gameState.wave * 0.02);
            this.health = 150 + (gameState.wave * 20);
            this.color = '#9c27b0'; // Purple
            this.sides = 5;
            this.scoreValue = 50;
        }
    }

    draw() {
        CTX.save();
        CTX.translate(this.x, this.y);
        CTX.rotate(gameState.gameTime); // Spin effect
        
        CTX.beginPath();
        CTX.moveTo(this.size * Math.cos(0), this.size * Math.sin(0));
        for (let i = 1; i <= this.sides; i++) {
            CTX.lineTo(this.size * Math.cos(i * 2 * Math.PI / this.sides), this.size * Math.sin(i * 2 * Math.PI / this.sides));
        }
        CTX.closePath();
        CTX.fillStyle = this.color;
        CTX.fill();
        
        CTX.restore();
    }

    update() {
        // Move towards player
        const dx = gameState.player.x - this.x;
        const dy = gameState.player.y - this.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        this.x += (dx / dist) * this.speed;
        this.y += (dy / dist) * this.speed;
    }
}

// Input Handling
const keys = {};
const mouse = { x: 0, y: 0, down: false };

window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);
window.addEventListener('mousemove', e => {
    const rect = CANVAS.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});
window.addEventListener('mousedown', () => mouse.down = true);
window.addEventListener('mouseup', () => mouse.down = false);

// Game Loop
function gameLoop(timestamp) {
    if (!gameState.running) return;

    const dt = timestamp - gameState.lastTime;
    gameState.lastTime = timestamp;
    gameState.gameTime += dt / 1000;

    // Clear Canvas
    CTX.fillStyle = '#222';
    CTX.fillRect(0, 0, CANVAS.width, CANVAS.height);

    // Spawn Enemies (Wave Logic)
    if (Math.random() < 0.01 + (gameState.wave * 0.002)) {
        spawnEnemy();
    }
    
    // Wave Progression
    if (gameState.score > gameState.wave * 500) {
        gameState.wave++;
        document.getElementById('wave-display').innerText = gameState.wave;
        // Heal player slightly on wave clear
        gameState.player.health = Math.min(gameState.player.maxHealth, gameState.player.health + 20);
    }

    // Update & Draw Player
    gameState.player.update(dt);
    gameState.player.draw();

    // Update Bullets
    for (let i = gameState.bullets.length - 1; i >= 0; i--) {
        const b = gameState.bullets[i];
        b.update();
        b.draw();
        
        // Remove if out of bounds or life over
        if (b.x < 0 || b.x > CANVAS.width || b.y < 0 || b.y > CANVAS.height || b.life <= 0) {
            gameState.bullets.splice(i, 1);
        }
    }

    // Update Enemies & Collision
    for (let i = gameState.enemies.length - 1; i >= 0; i--) {
        const e = gameState.enemies[i];
        e.update();
        e.draw();

        // Player Collision
        const dx = e.x - gameState.player.x;
        const dy = e.y - gameState.player.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < e.size + gameState.player.size) {
            gameState.player.health -= 10;
            gameState.enemies.splice(i, 1);
            if (gameState.player.health <= 0) gameOver();
            continue;
        }

        // Bullet Collision
        for (let j = gameState.bullets.length - 1; j >= 0; j--) {
            const b = gameState.bullets[j];
            const bdx = e.x - b.x;
            const bdy = e.y - b.y;
            const bdist = Math.sqrt(bdx*bdx + bdy*bdy);
            
            if (bdist < e.size + b.size) {
                e.health -= b.damage;
                gameState.bullets.splice(j, 1); // Remove bullet
                if (e.health <= 0) {
                    gameState.score += e.scoreValue;
                    gameState.points += e.scoreValue;
                    gameState.enemies.splice(i, 1); // Remove enemy
                }
                break; // One bullet hits one enemy
            }
        }
    }
    
    // Update UI
    document.getElementById('score-display').innerText = gameState.score;
    document.getElementById('health-display').innerText = Math.floor(gameState.player.health);
    document.getElementById('points-display').innerText = gameState.points;

    requestAnimationFrame(gameLoop);
}

function spawnEnemy() {
    const side = Math.floor(Math.random() * 4);
    let x, y;
    if (side === 0) { x = Math.random() * CANVAS.width; y = -50; } // Top
    else if (side === 1) { x = CANVAS.width + 50; y = Math.random() * CANVAS.height; } // Right
    else if (side === 2) { x = Math.random() * CANVAS.width; y = CANVAS.height + 50; } // Bottom
    else { x = -50; y = Math.random() * CANVAS.height; } // Left
    
    // Type based on wave
    let type = 0;
    if (gameState.wave > 3 && Math.random() > 0.7) type = 1;
    if (gameState.wave > 6 && Math.random() > 0.8) type = 2;
    
    gameState.enemies.push(new Enemy(x, y, type));
}

function startGame() {
    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;
    
    gameState.player = new Player(CANVAS.width / 2, CANVAS.height / 2);
    gameState.bullets = [];
    gameState.enemies = [];
    gameState.wave = 1;
    gameState.score = 0;
    gameState.points = 0;
    gameState.running = true;
    gameState.lastTime = performance.now();
    
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    
    requestAnimationFrame(gameLoop);
}

function gameOver() {
    gameState.running = false;
    document.getElementById('game-over-modal').style.display = 'block';
    document.getElementById('final-wave').innerText = gameState.wave;
    
    // Send stats to backend
    fetch('/api/stats', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({
            wave: gameState.wave,
            kills: gameState.score / 10, // Approx
            time: Math.floor(gameState.gameTime)
        })
    });
}

// Upgrades System
const upgrades = {
    damage: { cost: 100, inc: 5, el: 'cost-damage' },
    firerate: { cost: 150, inc: 0.9, el: 'cost-firerate' }, // Multiplier (smaller is faster)
    speed: { cost: 120, inc: 1.05, el: 'cost-speed' },
    health: { cost: 80, inc: 20, el: 'cost-health' }
};

document.getElementById('upgrade-damage').onclick = () => buyUpgrade('damage');
document.getElementById('upgrade-firerate').onclick = () => buyUpgrade('firerate');
document.getElementById('upgrade-speed').onclick = () => buyUpgrade('speed');
document.getElementById('upgrade-health').onclick = () => buyUpgrade('health');

function buyUpgrade(type) {
    const u = upgrades[type];
    if (gameState.points >= u.cost) {
        gameState.points -= u.cost;
        
        if (type === 'damage') gameState.player.damage += u.inc;
        else if (type === 'firerate') gameState.player.fireRate *= u.inc;
        else if (type === 'speed') gameState.player.speed *= u.inc;
        else if (type === 'health') gameState.player.health = Math.min(gameState.player.maxHealth, gameState.player.health + u.inc);
        
        // Increase cost
        u.cost = Math.floor(u.cost * 1.5);
        document.getElementById(u.el).innerText = u.cost;
    }
}

// Auth System
const API_URL = '/api';

async function login(username, password) {
    try {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('token', data.token);
            startGame();
        } else {
            document.getElementById('auth-message').innerText = data.error || 'Login failed';
        }
    } catch (e) {
        document.getElementById('auth-message').innerText = 'Connection error. Is server running?';
        console.error(e);
    }
}

async function register(username, password) {
    try {
        const res = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
            document.getElementById('auth-message').innerText = 'Registered! Please login.';
        } else {
            document.getElementById('auth-message').innerText = data.error || 'Registration failed';
        }
    } catch (e) {
        document.getElementById('auth-message').innerText = 'Connection error. Is server running?';
        console.error(e);
    }
}

async function loadLeaderboard() {
    try {
        const res = await fetch(`${API_URL}/leaderboard`);
        if (!res.ok) {
             document.getElementById('leaderboard-list').innerText = 'Failed to load';
             return;
        }
        const data = await res.json();
        const list = document.getElementById('leaderboard-list');
        list.innerHTML = data.map(u => `<div class="leaderboard-entry"><span>${u.username}</span><span>Wave ${u.highScore}</span></div>`).join('');
    } catch (e) {
        document.getElementById('leaderboard-list').innerText = 'Offline';
    }
}

// Event Listeners for Auth
document.getElementById('login-btn').onclick = () => {
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    if(u && p) login(u, p);
};

document.getElementById('register-btn').onclick = () => {
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    if(u && p) register(u, p);
};

// Initial Load
loadLeaderboard();
