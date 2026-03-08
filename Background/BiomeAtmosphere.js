import { WorldManager } from './WorldManager.js';

export class BiomeAtmosphere {
    constructor(game) {
        this.game = game;
        this.removeFromWorld = false;
        this.depth = 10; // draws on top of everything except UI

        // Current tint state
        this.currentTint = null;
        this.targetTint = null;
        this.tintAlpha = 0;
        this.targetAlpha = 0;

        this.rainDrops = [];
this.maxRain = 300;

        // Spores
        this.spores = [];
        this.maxSpores = 60;

        // Per-biome config
        this.biomeEffects = {
'Mushroom Grove': {
    tint: '180, 100, 255',
    alpha: 0.08,
    spores: true,
    glowColor: 'rgba(200, 100, 255, 0.15)',
    particleColor: '200, 150, 255',  
    particleStyle: 'spore',         
    fireflies: true
},
'Frog Pond': {
    tint: '20, 40, 80',       
    alpha: 0.25,             
    spores: true,
    glowColor: 'rgba(30, 60, 120, 0.20)',
    particleColor: '150, 180, 220',       
    particleStyle: 'bubble',
    rain: true
},
            'Bee Hive': {
    tint: '160, 100, 0',         // warm amber
    alpha: 0.09,
    spores: true,                 // reuse for pollen
    glowColor: 'rgba(255, 200, 0, 0.10)',
    particleColor: '255, 220, 50',   // pollen yellow
    particleStyle: 'pollen'
},
            'Delight Forest': null,
            'Peaceful Meadow': null
        };

        this.currentBiome = null;
        this.activeEffect = null;

        // Transition
        this.fadeSpeed = 0.8; // alpha units per second
        this.lerpAlpha = 0;
    }

    spawnSpore(playerX) {
    const style = this.activeEffect?.particleStyle || 'spore';
    const spread = 1200;

    this.spores.push({
        x: playerX - spread / 2 + Math.random() * spread,
        y: style === 'pollen' 
            ? 200 + Math.random() * 600   // pollen anywhere in air
            : 900 + Math.random() * 200,  // bubbles/spores from ground
        size: style === 'bubble' ? 3 + Math.random() * 5 : 1.5 + Math.random() * 3,
        speedY: style === 'pollen'
            ? -5 + Math.random() * 10     // pollen drifts sideways mostly
            : -(20 + Math.random() * 40), // bubbles/spores go up
        speedX: style === 'pollen'
            ? 20 + Math.random() * 40     // pollen blows rightward
            : -8 + Math.random() * 16,
        alpha: 0.4 + Math.random() * 0.6,
        life: 1.0,
        decay: style === 'pollen' ? 0.004 + Math.random() * 0.004 : 0.003 + Math.random() * 0.005,
        style
    });
}

    update() {
        const player = this.game.camera?.otter;
        if (!player) return;

        const dt = this.game.clockTick;

        // Check current biome from worldManager
        const worldManager = this.game.entities.find(e => e instanceof WorldManager);
        if (worldManager) {
            const area = worldManager.worldGen.getAreaAtPosition(player.x);
if (area.name !== this.currentBiome) {
    this.currentBiome = area.name;
    this.activeEffect = this.biomeEffects[area.name] || null;
    if (!this.activeEffect?.spores) this.spores = [];
    
    if (this.activeEffect?.rain) {
        this.lerpAlpha = this.activeEffect.alpha;
    }
}
        }

        // Lerp tint alpha in/out
        const targetAlpha = this.activeEffect ? this.activeEffect.alpha : 0;
        this.lerpAlpha += (targetAlpha - this.lerpAlpha) * dt * this.fadeSpeed;

        // Update spores
        if (this.activeEffect?.spores) {
            // Spawn new spores
            if (this.spores.length < this.maxSpores && Math.random() < 0.3) {
                this.spawnSpore(player.x);
            }

            // Update existing spores
            this.spores.forEach(spore => {
                spore.x += spore.speedX * dt;
                spore.y += spore.speedY * dt;
                spore.life -= spore.decay;
                // Gentle sway
                spore.speedX += (-0.5 + Math.random()) * 0.5;
                spore.speedX = Math.max(-15, Math.min(15, spore.speedX));
            });

            // Remove dead spores
            this.spores = this.spores.filter(s => s.life > 0 && s.y > -100);
        }



        if (this.activeEffect?.rain) {
    // Fade in rain based on lerpAlpha
const rainCount = this.maxRain;
    if (this.rainDrops.length < rainCount && Math.random() < 0.8) {
        this.spawnRainDrop();
    }

    this.rainDrops.forEach(drop => {
    drop.x += drop.speedX * dt;  // screen space, no cam offset
    drop.y += drop.speedY * dt;
});

// Remove drops that exit the screen
this.rainDrops = this.rainDrops.filter(d => {
    const camX = this.game.camera?.x ?? 0;
    const camY = this.game.camera?.y ?? 0;
    const canvasW = this.ctx?.canvas.width ?? 1500;
    const canvasH = this.ctx?.canvas.height ?? 800;
    return d.y < camY + canvasH + 50 
        && d.x > camX - 200 
        && d.x < camX + canvasW + 200;
});} else {
    // Gradually clear rain when leaving biome
    this.rainDrops = this.rainDrops.filter(d => d.y < 800);
}
    }

    draw(ctx) {
    this.ctx = ctx; // 👈 store it so spawnRainDrop can use it
    const canvasW = ctx.canvas.width;
    const canvasH = ctx.canvas.height;

        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0); // screen space, ignores camera

        // Tint overlay
        if (this.lerpAlpha > 0.001 && this.activeEffect) {
            ctx.fillStyle = `rgba(${this.activeEffect.tint}, ${this.lerpAlpha})`;
            ctx.fillRect(0, 0, canvasW, canvasH);
        }





        

        // Glow at bottom (ground level atmosphere)
        if (this.activeEffect?.glowColor) {
            const grad = ctx.createLinearGradient(0, canvasH * 0.6, 0, canvasH);
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(1, this.activeEffect.glowColor.replace('0.08', `${this.lerpAlpha * 0.6}`));
            ctx.fillStyle = grad;
            ctx.fillRect(0, canvasH * 0.6, canvasW, canvasH * 0.4);
        }
        // Spores
if (this.spores.length > 0) {
    const camX = this.game.camera.x;  
    const camY = this.game.camera.y;

    this.spores.forEach(spore => {
        const screenX = spore.x - camX;
        const screenY = spore.y - camY;
        const color = this.activeEffect.particleColor || '200, 150, 255';

        if (spore.style === 'bubble') {
            ctx.beginPath();
            ctx.arc(screenX, screenY, spore.size, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${color}, ${spore.life * spore.alpha})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(screenX - spore.size * 0.3, screenY - spore.size * 0.3, spore.size * 0.25, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${spore.life * 0.4})`;
            ctx.fill();

        } else if (spore.style === 'pollen') {
            ctx.beginPath();
            ctx.arc(screenX, screenY, spore.size * 0.8, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${color}, ${spore.life * spore.alpha})`;
            ctx.fill();

        } else {
            const glow = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, spore.size * 3);
            glow.addColorStop(0, `rgba(${color}, ${spore.life * spore.alpha})`);
            glow.addColorStop(1, `rgba(${color}, 0)`);
            ctx.beginPath();
            ctx.arc(screenX, screenY, spore.size * 3, 0, Math.PI * 2);
            ctx.fillStyle = glow;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(screenX, screenY, spore.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 220, 255, ${spore.life * spore.alpha})`;
            ctx.fill();
        }
    });
}



if (this.rainDrops.length > 0) {
    const camX = this.game.camera.x;
    const camY = this.game.camera.y;

    this.rainDrops.forEach(drop => {
        const screenX = drop.x - camX;   
        const screenY = drop.y - camY;

        ctx.beginPath();
        ctx.moveTo(screenX, screenY);
        ctx.lineTo(screenX + drop.speedX * 0.015, screenY + drop.length);
        ctx.strokeStyle = `rgba(180, 220, 255, ${drop.alpha})`;
        ctx.lineWidth = drop.width;
        ctx.stroke();
    });
}


        ctx.restore();
    }




spawnRainDrop() {
    const camX = this.game.camera?.x ?? 0;
    const canvasW = this.ctx?.canvas.width ?? 1500;

    this.rainDrops.push({
        x: camX + Math.random() * (canvasW + 400) - 200,
        y: this.game.camera?.y + (-20),
        length: 20 + Math.random() * 35,       
        speedY: 900 + Math.random() * 400,     
        speedX: -120 + Math.random() * 40,    
        alpha: 0.35 + Math.random() * 0.3,     
        width: 0.8 + Math.random() * 1.2
    });
}
}