class DayNightCycle {
    constructor(game, sceneManager) {
        this.game = game;
        this.sceneManager = sceneManager;
        this.time = .75; // 0 = midnight, 0.25 = sunrise, 0.5 = noon, 0.75 = sunset
        this.duration = 120; // Full cycle duration in seconds
        this.speed = 5; // Multiplier for testing (set higher for faster cycles)
        
        // Firefly system
        this.fireflies = [];
        
        // Stars
        this.stars = [];
        this.initStars();
    }

    initStars() {
        // Create starfield for night sky
        for (let i = 0; i < 120; i++) {
            this.stars.push({
                x: Math.random() * 2000,
                y: Math.random() * 400,
                size: Math.random() * 1.5 + 0.5,
                twinkle: Math.random() * Math.PI * 2,
                twinkleSpeed: Math.random() * 0.03 + 0.01,
                parallax: Math.random() * 0.3 + 0.1
            });
        }
    }

    update() {
        this.time += (this.game.clockTick * this.speed) / this.duration;
        if (this.time > 1) this.time -= 1;
        
        // Update fireflies at night
        const nightIntensity = this.getNightIntensity();
        if (nightIntensity > 0.3) {
            this.updateFireflies();
        } else {
            this.fireflies = [];
        }
        
        // Update star twinkle
        this.stars.forEach(star => {
            star.twinkle += star.twinkleSpeed;
        });
    }

    updateFireflies() {
        const cam = this.sceneManager;
        
        // Spawn new fireflies
        if (this.fireflies.length < 25 && Math.random() < 0.08) {
            this.fireflies.push({
                x: cam.x + Math.random() * 1400 - 200,
                y: cam.y + 150 + Math.random() * 400,
                vx: (Math.random() - 0.5) * 25,
                vy: (Math.random() - 0.5) * 15,
                life: 1,
                fadeRate: Math.random() * 0.0015 + 0.0008,
                glowPhase: Math.random() * Math.PI * 2,
                glowSpeed: Math.random() * 0.06 + 0.03
            });
        }
        
        // Update existing fireflies
        this.fireflies = this.fireflies.filter(fly => {
            fly.x += fly.vx * this.game.clockTick;
            fly.y += fly.vy * this.game.clockTick;
            fly.glowPhase += fly.glowSpeed;
            fly.life -= fly.fadeRate;
            
            // Gentle sine wave floating
            fly.vy += Math.sin(fly.glowPhase) * 0.4;
            fly.vx += Math.cos(fly.glowPhase * 0.7) * 0.2;
            
            // Keep reasonable speeds
            const maxSpeed = 30;
            const speed = Math.sqrt(fly.vx * fly.vx + fly.vy * fly.vy);
            if (speed > maxSpeed) {
                fly.vx = (fly.vx / speed) * maxSpeed;
                fly.vy = (fly.vy / speed) * maxSpeed;
            }
            
            return fly.life > 0;
        });
    }

    getNightIntensity() {
        // Returns 0 (day) to 1 (deepest night)
        const sunPos = Math.sin(this.time * Math.PI * 2);
        return Math.max(0, -sunPos);
    }

    getSunsetIntensity() {
        // Returns intensity of golden hour (0 to 1)
        const sunPos = Math.sin(this.time * Math.PI * 2);
        if (sunPos > -0.15 && sunPos < 0.35) {
            return 1 - Math.abs(sunPos - 0.1) / 0.45;
        }
        return 0;
    }

    getTimeOfDay() {
        if (this.time < 0.2 || this.time > 0.8) return 'night';
        if (this.time >= 0.2 && this.time < 0.3) return 'sunrise';
        if (this.time >= 0.3 && this.time < 0.7) return 'day';
        return 'sunset';
    }

    draw(ctx) {
        const x = this.sceneManager.x;
        const y = this.sceneManager.y;
        const w = ctx.canvas.width;
        const h = ctx.canvas.height;

        ctx.save();

        // 1. DRAW STARS (behind everything, at night only)
        const nightIntensity = this.getNightIntensity();
        if (nightIntensity > 0.1) {
            this.drawStars(ctx, x, y, w, h, nightIntensity);
        }

        // 2. DRAW CELESTIAL BODIES (sun/moon as decoration)
        this.drawCelestialBodies(ctx, x, y, w, h);

        // 3. APPLY ATMOSPHERIC COLOR GRADING (the main overlay effect)
        this.applyAtmosphericOverlay(ctx, x, y, w, h);

        // 4. DRAW FIREFLIES (in front of everything except UI)
        if (nightIntensity > 0.3) {
            this.drawFireflies(ctx);
        }

        // 5. CHARACTER GLOW (so player can see at night)
        if (nightIntensity > 0.4) {
            this.drawCharacterGlow(ctx);
        }

        ctx.restore();
    }

    drawStars(ctx, x, y, w, h, intensity) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        
        this.stars.forEach(star => {
            // Parallax - stars move slower than camera
            const sx = star.x - (x * star.parallax);
            const sy = star.y + (y * 0.05);
            
            // Only draw visible stars
            if (sx < x - 50 || sx > x + w + 50 || sy < y - 50 || sy > y + h + 50) return;
            
            // Twinkle effect
            const twinkle = (Math.sin(star.twinkle) + 1) / 2;
            const alpha = twinkle * intensity * 0.85;
            
            // Draw star
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Larger stars get a subtle glow
            if (star.size > 1.2) {
                const glowSize = star.size * 4;
                const glowGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowSize);
                glowGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.25})`);
                glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.fillStyle = glowGrad;
                ctx.fillRect(sx - glowSize, sy - glowSize, glowSize * 2, glowSize * 2);
            }
        });
        
        ctx.restore();
    }

    drawCelestialBodies(ctx, x, y, w, h) {
        const sunPos = Math.sin(this.time * Math.PI * 2);
        const bodyY = y + h * 0.25 - sunPos * h * 0.35;
        const bodyX = x + w * 0.75;
        
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        
        if (sunPos > -0.25) {
            // DRAW SUN
            const sunSize = 50;
            
            // Sun outer glow
            const outerGlow = ctx.createRadialGradient(bodyX, bodyY, 0, bodyX, bodyY, sunSize * 4);
            outerGlow.addColorStop(0, 'rgba(255, 250, 220, 0.3)');
            outerGlow.addColorStop(0.4, 'rgba(255, 220, 100, 0.15)');
            outerGlow.addColorStop(1, 'rgba(255, 180, 50, 0)');
            ctx.fillStyle = outerGlow;
            ctx.fillRect(bodyX - sunSize * 4, bodyY - sunSize * 4, sunSize * 8, sunSize * 8);
            
            // Sun body
            ctx.fillStyle = 'rgba(255, 255, 240, 0.95)';
            ctx.beginPath();
            ctx.arc(bodyX, bodyY, sunSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Sun core glow
            const coreGlow = ctx.createRadialGradient(bodyX, bodyY, 0, bodyX, bodyY, sunSize * 0.6);
            coreGlow.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            coreGlow.addColorStop(1, 'rgba(255, 255, 240, 0)');
            ctx.fillStyle = coreGlow;
            ctx.beginPath();
            ctx.arc(bodyX, bodyY, sunSize * 0.6, 0, Math.PI * 2);
            ctx.fill();
            
        } else {
            // DRAW MOON
            const moonSize = 45;
            const nightIntensity = this.getNightIntensity();
            
            // Moon glow
            const moonGlow = ctx.createRadialGradient(bodyX, bodyY, 0, bodyX, bodyY, moonSize * 3);
            moonGlow.addColorStop(0, `rgba(220, 230, 255, ${nightIntensity * 0.35})`);
            moonGlow.addColorStop(0.5, `rgba(200, 220, 255, ${nightIntensity * 0.15})`);
            moonGlow.addColorStop(1, 'rgba(180, 200, 255, 0)');
            ctx.fillStyle = moonGlow;
            ctx.fillRect(bodyX - moonSize * 3, bodyY - moonSize * 3, moonSize * 6, moonSize * 6);
            
            // Moon body
            ctx.fillStyle = `rgba(240, 245, 255, ${nightIntensity * 0.9})`;
            ctx.beginPath();
            ctx.arc(bodyX, bodyY, moonSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Moon craters
            ctx.fillStyle = `rgba(200, 210, 230, ${nightIntensity * 0.4})`;
            ctx.beginPath();
            ctx.arc(bodyX - 12, bodyY - 8, 8, 0, Math.PI * 2);
            ctx.arc(bodyX + 10, bodyY + 6, 6, 0, Math.PI * 2);
            ctx.arc(bodyX + 5, bodyY - 15, 5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }

    applyAtmosphericOverlay(ctx, x, y, w, h) {
        const nightIntensity = this.getNightIntensity();
        const sunsetIntensity = this.getSunsetIntensity();
        
        ctx.save();
        
        // === SUNSET/GOLDEN HOUR OVERLAY ===
        if (sunsetIntensity > 0.1) {
            ctx.globalCompositeOperation = "overlay";
            
            // Warm gradient from top to bottom
            const sunsetGrad = ctx.createLinearGradient(0, y, 0, y + h);
            sunsetGrad.addColorStop(0, `rgba(255, 180, 100, ${sunsetIntensity * 0.25})`);
            sunsetGrad.addColorStop(0.5, `rgba(255, 140, 60, ${sunsetIntensity * 0.45})`);
            sunsetGrad.addColorStop(1, `rgba(255, 100, 50, ${sunsetIntensity * 0.35})`);
            
            ctx.fillStyle = sunsetGrad;
            ctx.fillRect(x, y, w, h);
            
            // Extra warm glow near horizon
            ctx.globalCompositeOperation = "screen";
            const horizonGlow = ctx.createLinearGradient(0, y + h * 0.6, 0, y + h);
            horizonGlow.addColorStop(0, 'rgba(255, 200, 150, 0)');
            horizonGlow.addColorStop(0.5, `rgba(255, 150, 80, ${sunsetIntensity * 0.3})`);
            horizonGlow.addColorStop(1, `rgba(255, 120, 50, ${sunsetIntensity * 0.2})`);
            
            ctx.fillStyle = horizonGlow;
            ctx.fillRect(x, y + h * 0.6, w, h * 0.4);
        }
        
        // === NIGHT OVERLAY ===
        if (nightIntensity > 0.15) {
            ctx.globalCompositeOperation = "multiply";
            
            // Cool blue night filter
            const nightGrad = ctx.createLinearGradient(0, y, 0, y + h);
            const topIntensity = nightIntensity * 0.75;
            const bottomIntensity = nightIntensity * 0.55;
            
            nightGrad.addColorStop(0, `rgba(80, 100, 150, ${topIntensity})`);
            nightGrad.addColorStop(0.5, `rgba(90, 110, 160, ${nightIntensity * 0.65})`);
            nightGrad.addColorStop(1, `rgba(100, 120, 170, ${bottomIntensity})`);
            
            ctx.fillStyle = nightGrad;
            ctx.fillRect(x, y, w, h);
            
            // Darken further for deep night
            if (nightIntensity > 0.6) {
                ctx.globalCompositeOperation = "multiply";
                const darkOverlay = nightIntensity - 0.6; // 0 to 0.4
                ctx.fillStyle = `rgba(40, 50, 80, ${darkOverlay * 0.5})`;
                ctx.fillRect(x, y, w, h);
            }
        }
        
        // === GROUND FOG/MIST ===
        ctx.globalCompositeOperation = "source-over";
        const fogIntensity = nightIntensity > 0.5 ? 0.12 : 0.06;
        const fogGrad = ctx.createLinearGradient(0, y + h * 0.8, 0, y + h);
        fogGrad.addColorStop(0, 'rgba(150, 170, 200, 0)');
        fogGrad.addColorStop(1, `rgba(140, 160, 190, ${fogIntensity})`);
        
        ctx.fillStyle = fogGrad;
        ctx.fillRect(x, y + h * 0.8, w, h * 0.2);
        
        ctx.restore();
    }

    drawFireflies(ctx) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        
        this.fireflies.forEach(fly => {
            const glow = (Math.sin(fly.glowPhase) + 1) / 2; // 0 to 1
            const alpha = fly.life * glow * 0.9;
            
            // Main bright core
            ctx.fillStyle = `rgba(255, 255, 180, ${alpha})`;
            ctx.beginPath();
            ctx.arc(fly.x, fly.y, 2.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Inner glow halo
            const innerGlow = ctx.createRadialGradient(fly.x, fly.y, 0, fly.x, fly.y, 15);
            innerGlow.addColorStop(0, `rgba(255, 255, 200, ${alpha * 0.7})`);
            innerGlow.addColorStop(0.5, `rgba(220, 255, 180, ${alpha * 0.4})`);
            innerGlow.addColorStop(1, 'rgba(200, 255, 150, 0)');
            ctx.fillStyle = innerGlow;
            ctx.beginPath();
            ctx.arc(fly.x, fly.y, 15, 0, Math.PI * 2);
            ctx.fill();
            
            // Outer glow halo
            const outerGlow = ctx.createRadialGradient(fly.x, fly.y, 0, fly.x, fly.y, 30);
            outerGlow.addColorStop(0, `rgba(200, 255, 150, ${alpha * 0.3})`);
            outerGlow.addColorStop(0.6, `rgba(180, 255, 120, ${alpha * 0.15})`);
            outerGlow.addColorStop(1, 'rgba(160, 240, 100, 0)');
            ctx.fillStyle = outerGlow;
            ctx.beginPath();
            ctx.arc(fly.x, fly.y, 30, 0, Math.PI * 2);
            ctx.fill();
            
            // Motion trail for fast-moving fireflies
            const speed = Math.sqrt(fly.vx * fly.vx + fly.vy * fly.vy);
            if (speed > 15) {
                ctx.strokeStyle = `rgba(255, 255, 180, ${alpha * 0.25})`;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(fly.x, fly.y);
                ctx.lineTo(fly.x - fly.vx * 0.08, fly.y - fly.vy * 0.08);
                ctx.stroke();
            }
        });
        
        ctx.restore();
    }

    drawCharacterGlow(ctx) {
        const otter = this.sceneManager.otter;
        if (!otter || otter.x === undefined) return;
        
        const nightIntensity = this.getNightIntensity();
        
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        
        const centerX = otter.x + (otter.width || 64) / 2;
        const centerY = otter.y + (otter.height || 64) / 2;
        
        // Warm glow so player can navigate at night
        const glowGrad = ctx.createRadialGradient(
            centerX, centerY, 5,
            centerX, centerY, 100
        );
        const intensity = (nightIntensity - 0.4) * 0.6; // 0 to 0.36
        glowGrad.addColorStop(0, `rgba(255, 240, 200, ${intensity})`);
        glowGrad.addColorStop(0.5, `rgba(255, 230, 180, ${intensity * 0.5})`);
        glowGrad.addColorStop(1, 'rgba(255, 220, 150, 0)');
        
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 100, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    // Optional: Call this in draw for debugging
    drawDebugInfo(ctx) {
        ctx.save();
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.font = '14px monospace';
        
        const x = this.sceneManager.x + 10;
        let yPos = this.sceneManager.y + 25;
        
        const lines = [
            `Time: ${this.time.toFixed(3)} | ${this.getTimeOfDay()}`,
            `Night: ${this.getNightIntensity().toFixed(2)} | Sunset: ${this.getSunsetIntensity().toFixed(2)}`,
            `Fireflies: ${this.fireflies.length}`
        ];
        
        lines.forEach(line => {
            ctx.strokeText(line, x, yPos);
            ctx.fillText(line, x, yPos);
            yPos += 20;
        });
        
        ctx.restore();
    }
}