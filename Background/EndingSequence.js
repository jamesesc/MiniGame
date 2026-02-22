export class EndingSequence {
    constructor(game, onMainMenu) {
        this.game = game;
        this.onMainMenu = onMainMenu;
        this.removeFromWorld = false;
        this.updateWhilePaused = true;

        this.game.endingActive = true;

        // Phases Setting
        this.phase = 'panUp';
        this.time = 0;
        this.phaseTime = 0;

        // Ending Pan up setting
        this.panUpDuration = 4.5;
        this.camStartX = null;
        this.camStartY = null;
        this.panUpDistY = 2500;
        this.worldFadeAlpha = 0;

        this.fadeToNightDuration = 2.5;
        this.nightAlpha = 0;

        // Space Setting
        this.stars = [];
        this.moon = null;
        this.starsBuilt = false;

        // Fireflires setting
        this.fireFlies = [];
        this.fireFlyTimer = 0;

        this.petals = [];
        this.petalTimer = 0;

        // Fireworks setting
        this.fireWorks = [];
        this.fireworkTimer = 0;

        // End Sign SEtting
        this.panelY = -700;
        this.panelTargetY = null;
        this.swayAngle = 0;

        // End Sign Text
        this.textLines = [
            { text: 'After a long journey through forest and danger,', alpha: 0 },
            { text: 'the brave otter finally found their way back...', alpha: 0 },
            { text: '...to the one who had been waiting all along.', alpha: 0, gold: true },
        ];
        this.textTimer = 0;
        this.textRevealDone = false;

        this._exitFade = 0;

        // Mouse Setting
        this.mouseX = -1;
        this.mouseY = -1;
        this.clicked = false;
        this.btnRect = null;

        this.mouseHandler = (e) => {
            const rect = this.game.ctx.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        };
        this.clickHandler = (e) => {
            if (this.phase !== 'idle') return;
            const rect = this.game.ctx.canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            if (this.btnRect) {
                const b = this.btnRect;
                if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h)
                    this.clicked = true;
            }
        };
        window.addEventListener('mousemove', this.mouseHandler);
        window.addEventListener('click', this.clickHandler);
    }

    destroy() {
        window.removeEventListener('mousemove', this.mouseHandler);
        window.removeEventListener('click', this.clickHandler);
        this.game.endingActive = false;
        this.removeFromWorld = true;
    }

    easeInOutQuad(t) { return t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2,2)/2; }
    easeOutQuart(t)  { return 1 - Math.pow(1-t, 4); }

    buildingTheStars(W, H) {
        this.stars = [];
        for (let i = 0; i < 180; i++) {
            this.stars.push({
                x: Math.random()*W, y: Math.random()*H*0.78,
                r: 0.5 + Math.random()*1.4,
                baseAlpha: 0.4 + Math.random()*0.6,
                twinkleSpeed: 0.6 + Math.random()*1.8,
                twinkleOffset: Math.random()*Math.PI*2,
                glow: false,
            });
        }
        for (let i = 0; i < 10; i++) {
            this.stars.push({
                x: Math.random()*W, y: Math.random()*H*0.62,
                r: 2.0 + Math.random()*1.8,
                baseAlpha: 0.7 + Math.random()*0.3,
                twinkleSpeed: 0.3 + Math.random()*0.8,
                twinkleOffset: Math.random()*Math.PI*2,
                glow: true,
            });
        }
        this.moon = { x: W*0.78, y: H*0.18, r: Math.min(W,H)*0.054 };
        this.starsBuilt = true;
    }

    drawNightSky(ctx, W, H, alpha) {
        const sky = ctx.createLinearGradient(0, 0, 0, H);
        sky.addColorStop(0,    `rgba(4,  6,  22, ${alpha})`);
        sky.addColorStop(0.45, `rgba(8,  14, 40, ${alpha})`);
        sky.addColorStop(0.78, `rgba(18, 28, 55, ${alpha})`);
        sky.addColorStop(1,    `rgba(30, 45, 35, ${alpha})`);
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, W, H);

        const neb = ctx.createRadialGradient(W*0.32, H*0.28, 0, W*0.32, H*0.28, W*0.48);
        neb.addColorStop(0,   `rgba(45, 18, 90, ${alpha*0.16})`);
        neb.addColorStop(0.6, `rgba(20, 8,  50, ${alpha*0.07})`);
        neb.addColorStop(1,   `rgba(0,0,0,0)`);
        ctx.fillStyle = neb;
        ctx.fillRect(0, 0, W, H);

        if (this.moon) {
            const { x, y, r } = this.moon;
            const mg = ctx.createRadialGradient(x, y, 0, x, y, r*5);
            mg.addColorStop(0,   `rgba(255,248,200,${alpha*0.20})`);
            mg.addColorStop(0.4, `rgba(220,210,170,${alpha*0.07})`);
            mg.addColorStop(1,   `rgba(180,180,140,0)`);
            ctx.fillStyle = mg;
            ctx.beginPath(); ctx.arc(x,y,r*5,0,Math.PI*2); ctx.fill();
            const md = ctx.createRadialGradient(x-r*0.18,y-r*0.18,0,x,y,r);
            md.addColorStop(0,   `rgba(255,253,232,${alpha})`);
            md.addColorStop(0.7, `rgba(242,237,205,${alpha})`);
            md.addColorStop(1,   `rgba(205,198,165,${alpha})`);
            ctx.fillStyle = md;
            ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
            ctx.fillStyle = `rgba(175,168,138,${alpha*0.14})`;
            ctx.beginPath(); ctx.ellipse(x+r*0.28, y+r*0.08,r*0.18,r*0.13,0.3,0,Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(x-r*0.22, y-r*0.28,r*0.11,r*0.09,-0.5,0,Math.PI*2); ctx.fill();
        }

        if (!this.starsBuilt) return;
        ctx.save();
        this.stars.forEach(s => {
            const twinkle = 0.5 + 0.5*Math.sin(this.time*s.twinkleSpeed+s.twinkleOffset);
            const a = s.baseAlpha*twinkle*alpha;
            if (a <= 0) return;
            if (s.glow) {
                const g = ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,s.r*4);
                g.addColorStop(0,   `rgba(215,228,255,${a})`);
                g.addColorStop(0.4, `rgba(185,205,255,${a*0.32})`);
                g.addColorStop(1,   `rgba(135,162,255,0)`);
                ctx.fillStyle = g;
                ctx.beginPath(); ctx.arc(s.x,s.y,s.r*4,0,Math.PI*2); ctx.fill();
            }
            ctx.fillStyle = `rgba(225,235,255,${a})`;
            ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill();
        });
        ctx.restore();
    }

    //  Fireflies
    spawningFirefly(W, H) {
        return {
            x: Math.random()*W,
            y: H*0.48 + Math.random()*H*0.46,
            vx: (Math.random()-0.5)*16,
            vy: (Math.random()-0.5)*10,
            wobble: Math.random()*Math.PI*2,
            wobbleSpeed: 0.9 + Math.random()*1.4,
            pulseOffset: Math.random()*Math.PI*2,
            pulseSpeed: 1.2 + Math.random()*2,
            r: 1.8 + Math.random()*2,
            life: 0, maxLife: 4 + Math.random()*5,
            color: Math.random() < 0.65 ? [170,255,110] : [255,230,110],
        };
    }

    updateFirefly(p, dt) {
        p.life += dt;
        p.wobble += p.wobbleSpeed*dt;
        p.x += (p.vx + Math.cos(p.wobble)*12)*dt;
        p.y += (p.vy + Math.sin(p.wobble)*7)*dt;
        p.vx *= 0.98; p.vy *= 0.98;
        return p.life < p.maxLife;
    }

    drawFirefly(ctx, p) {
        const t = p.life/p.maxLife;
        const fade = t < 0.2 ? t/0.2 : t > 0.75 ? 1-(t-0.75)/0.25 : 1;
        const pulse = 0.35 + 0.65*(0.5+0.5*Math.sin(this.time*p.pulseSpeed+p.pulseOffset));
        const a = fade*pulse*0.9;
        if (a <= 0) return;
        const [r,g,b] = p.color;
        ctx.save();
        const grd = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*5);
        grd.addColorStop(0,   `rgba(${r},${g},${b},${a})`);
        grd.addColorStop(0.5, `rgba(${r},${g},${b},${a*0.25})`);
        grd.addColorStop(1,   `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r*5,0,Math.PI*2); ctx.fill();
        ctx.fillStyle = `rgba(245,255,220,${a})`;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r*0.5,0,Math.PI*2); ctx.fill();
        ctx.restore();
    }

    //  Petals
    spawnPetal(W, H) {
        const colors = [[255,192,203],[255,218,185],[255,240,210],[220,200,255],[255,170,175]];
        const c = colors[Math.floor(Math.random()*colors.length)];
        return {
            x: Math.random()*W, y: -15,
            vx: (Math.random()-0.5)*28,
            vy: 26 + Math.random()*38,
            rot: Math.random()*Math.PI*2,
            rotSpeed: (Math.random()-0.5)*2.4,
            wobble: Math.random()*Math.PI*2,
            wobbleSpeed: 0.8 + Math.random()*1.5,
            r: 4 + Math.random()*5,
            alpha: 0.5 + Math.random()*0.38,
            color: c, life: 0, maxLife: 8 + Math.random()*5,
        };
    }

    updatePetal(p, dt, H) {
        p.life += dt;
        p.wobble += p.wobbleSpeed*dt;
        p.x += (p.vx + Math.cos(p.wobble)*20)*dt;
        p.y += p.vy*dt;
        p.rot += p.rotSpeed*dt;
        const t = p.life/p.maxLife;
        if (t > 0.8) p.alpha *= 0.975;
        return p.y < H+20 && p.life < p.maxLife;
    }

    drawPetal(ctx, p) {
        const [r,g,b] = p.color;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x,p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.beginPath();
        ctx.ellipse(0,0,p.r,p.r*0.5,0,0,Math.PI*2);
        ctx.fill();
        ctx.restore();
    }

    //  Fireworks
    spawnFirework(W, H) {
        // Burst on the left or right side, avoiding the centre panel area
        const side = Math.random() < 0.5 ? 'left' : 'right';
        const x = side === 'left'
            ? W * (0.04 + Math.random() * 0.18)
            : W * (0.78 + Math.random() * 0.18);
        const y = H * (0.08 + Math.random() * 0.45);

        const palettes = [
            [[255,220,50],[255,180,30],[255,140,20]],   // gold
            [[255,100,180],[255,60,120],[255,180,220]],  // pink
            [[80,220,255],[40,160,255],[200,240,255]],   // cyan
            [[140,255,100],[80,220,60],[200,255,160]],   // green
            [[255,140,60],[255,80,30],[255,200,100]],    // orange
            [[220,140,255],[180,80,255],[240,200,255]],  // purple
        ];
        const palette = palettes[Math.floor(Math.random()*palettes.length)];

        const particleCount = 38 + Math.floor(Math.random()*22);
        const particles = [];

        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2 + (Math.random()-0.5)*0.3;
            const speed = 55 + Math.random() * 110;
            const color = palette[Math.floor(Math.random()*palette.length)];
            particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                r: 1.5 + Math.random() * 2.2,
                alpha: 1,
                color,
                trail: [],
                gravity: 60 + Math.random()*40,
            });
        }

        // The sparkle streaks
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 20 + Math.random() * 40;
            particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                r: 0.8,
                alpha: 1,
                color: [255, 255, 220],
                trail: [],
                gravity: 20,
                sparkle: true,
            });
        }

        return {
            particles,
            life: 0,
            maxLife: 1.6 + Math.random() * 0.8,
            // launch flash
            flashX: x, flashY: y,
            flashAlpha: 1,
            color: palette[0],
        };
    }

    updateFireworks(fw, dt) {
        fw.life += dt;
        fw.flashAlpha = Math.max(0, 1 - fw.life / 0.25);
        fw.particles.forEach(p => {
            p.trail.push({ x: p.x, y: p.y });
            if (p.trail.length > 5) p.trail.shift();
            p.vx *= (1 - dt * 1.8);
            p.vy *= (1 - dt * 1.8);
            p.vy += p.gravity * dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            const t = fw.life / fw.maxLife;
            p.alpha = Math.max(0, 1 - Math.pow(t, 1.4));
        });
        return fw.life < fw.maxLife;
    }

    drawFirework(ctx, fw) {
        ctx.save();
        // Flash at burst point
        if (fw.flashAlpha > 0) {
            const [r,g,b] = fw.color;
            const fg = ctx.createRadialGradient(fw.flashX, fw.flashY, 0, fw.flashX, fw.flashY, 28);
            fg.addColorStop(0, `rgba(255,255,255,${fw.flashAlpha * 0.9})`);
            fg.addColorStop(0.3, `rgba(${r},${g},${b},${fw.flashAlpha * 0.5})`);
            fg.addColorStop(1, `rgba(${r},${g},${b},0)`);
            ctx.fillStyle = fg;
            ctx.beginPath(); ctx.arc(fw.flashX, fw.flashY, 28, 0, Math.PI*2); ctx.fill();
        }
        fw.particles.forEach(p => {
            if (p.alpha <= 0) return;
            const [r,g,b] = p.color;
            // Trail
            if (p.trail.length > 1) {
                ctx.beginPath();
                ctx.moveTo(p.trail[0].x, p.trail[0].y);
                p.trail.forEach(pt => ctx.lineTo(pt.x, pt.y));
                ctx.lineTo(p.x, p.y);
                ctx.strokeStyle = `rgba(${r},${g},${b},${p.alpha * 0.35})`;
                ctx.lineWidth = p.r * 0.7;
                ctx.stroke();
            }
            // Glow
            const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
            grd.addColorStop(0, `rgba(${r},${g},${b},${p.alpha})`);
            grd.addColorStop(0.5, `rgba(${r},${g},${b},${p.alpha * 0.2})`);
            grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
            ctx.fillStyle = grd;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI*2); ctx.fill();
            // Core dot
            ctx.fillStyle = p.sparkle
                ? `rgba(255,255,240,${p.alpha})`
                : `rgba(255,255,200,${p.alpha * 0.85})`;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
        });
        ctx.restore();
    }

    //  Update 
    update() {
        const dt = this.game.clockTick;
        this.time += dt;
        this.phaseTime += dt;

        const ctx = this.game.ctx;
        const W = ctx.canvas.width;
        const H = ctx.canvas.height;

        if (this.panelTargetY === null) this.panelTargetY = H*0.11;
        this.swayAngle = Math.sin(this.time*0.38)*0.7;

        this.fireFlies = this.fireFlies.filter(p => this.updateFirefly(p, dt));
        this.petals    = this.petals.filter(p    => this.updatePetal(p, dt, H));
        this.fireWorks = this.fireWorks.filter(fw => this.updateFireworks(fw, dt));

        if (this.phase === 'panUp') {
            if (this.camStartX === null) {
                this.camStartX = this.game.camera.x;
                this.camStartY = this.game.camera.y;
                this.buildingTheStars(W, H);
            }
            const progress = Math.min(this.phaseTime/this.panUpDuration, 1);
            const t = this.easeInOutQuad(progress);
            this.game.camera.x = this.camStartX;
            this.game.camera.y = this.camStartY - t*this.panUpDistY;
            if (progress > 0.6) this.worldFadeAlpha = (progress-0.6)/0.4;
            if (progress >= 1) { this.worldFadeAlpha = 1; this.settingPhaseState('fadeToNight'); }
            return;
        }

        if (this.phase === 'fadeToNight') {
            const progress = Math.min(this.phaseTime/this.fadeToNightDuration, 1);
            this.nightAlpha = this.easeOutQuart(progress);
            if (progress > 0.4) {
                this.fireFlyTimer -= dt;
                if (this.fireFlyTimer <= 0) {
                    this.fireFlyTimer = 0.55 + Math.random()*0.5;
                    if (this.fireFlies.length < 7) this.fireFlies.push(this.spawningFirefly(W, H));
                }
            }
            if (progress >= 1) { this.nightAlpha = 1; this.settingPhaseState('nightHold'); }
            return;
        }

        if (this.phase === 'nightHold') {
            this.fireFlyTimer -= dt;
            if (this.fireFlyTimer <= 0) {
                this.fireFlyTimer = 0.4 + Math.random()*0.4;
                if (this.fireFlies.length < 13) this.fireFlies.push(this.spawningFirefly(W, H));
            }
            this.petalTimer -= dt;
            if (this.petalTimer <= 0) {
                this.petalTimer = 0.55 + Math.random()*0.5;
                if (this.petals.length < 8) this.petals.push(this.spawnPetal(W, H));
            }
            if (this.phaseTime > 1.1) this.settingPhaseState('panelDrop');
            return;
        }

        if (this.phase === 'panelDrop') {
            this.fireFlyTimer -= dt;
            if (this.fireFlyTimer <= 0) {
                this.fireFlyTimer = 0.45 + Math.random()*0.35;
                if (this.fireFlies.length < 13) this.fireFlies.push(this.spawningFirefly(W, H));
            }
            this.petalTimer -= dt;
            if (this.petalTimer <= 0) {
                this.petalTimer = 0.3 + Math.random()*0.3;
                if (this.petals.length < 16) this.petals.push(this.spawnPetal(W, H));
            }
            this.panelY += (this.panelTargetY - this.panelY)*dt*5.5;
            if (Math.abs(this.panelY - this.panelTargetY) < 1) {
                this.panelY = this.panelTargetY;
                this.settingPhaseState('idle');
            }
            return;
        }

        if (this.phase === 'idle') {
            this.fireFlyTimer -= dt;
            if (this.fireFlyTimer <= 0) {
                this.fireFlyTimer = 0.7 + Math.random()*0.6;
                if (this.fireFlies.length < 13) this.fireFlies.push(this.spawningFirefly(W, H));
            }
            this.petalTimer -= dt;
            if (this.petalTimer <= 0) {
                this.petalTimer = 0.7 + Math.random()*0.6;
                if (this.petals.length < 14) this.petals.push(this.spawnPetal(W, H));
            }
            // Fireworks spawn (only on the left & right)
            this.fireworkTimer -= dt;
            if (this.fireworkTimer <= 0) {
                this.fireworkTimer = 1.2 + Math.random() * 1.8;
                if (this.fireWorks.length < 6) {
                    this.fireWorks.push(this.spawnFirework(W, H));
                    // Sometimes spawn a second one immediately on the opposite side
                    if (Math.random() < 0.45 && this.fireWorks.length < 6) {
                        this.fireWorks.push(this.spawnFirework(W, H));
                    }
                }
            }

            this.textTimer += dt;
            this.textLines.forEach((line, i) => {
                const start = i*1.2;
                if (this.textTimer >= start)
                    line.alpha = Math.min(1, (this.textTimer-start)/0.9);
            });
            if (this.textLines[this.textLines.length-1].alpha >= 1)
                this.textRevealDone = true;

            if (this.game.keys && (this.game.keys['Enter'] || this.game.keys[' '])) this.clicked = true;
            if (this.clicked) { this.clicked = false; this.settingPhaseState('exit'); }
            return;
        }

        if (this.phase === 'exit') {
            this._exitFade = Math.min(1, this._exitFade + dt*1.8);
            if (this._exitFade >= 1 && this.phaseTime > 0.6) {
                this.destroy();
                if (this.onMainMenu) this.onMainMenu();
            }
        }
    }

    settingPhaseState(name) {
        this.phase = name;
        this.phaseTime = 0;
        if (name === 'exit') this._exitFade = 0;
        if (name === 'idle') {
            this.textTimer = 0;
            this.textRevealDone = false;
            this.textLines.forEach(l => { l.alpha = 0; });
            // Kick off a firework burst immediately on panel arrival
            this.fireworkTimer = 0.3;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        const W = ctx.canvas.width;
        const H = ctx.canvas.height;

        if (this.phase === 'panUp') {
            if (this.worldFadeAlpha > 0) {
                ctx.fillStyle = `rgba(4,6,22,${this.worldFadeAlpha})`;
                ctx.fillRect(0, 0, W, H);
            }
            ctx.restore();
            return;
        }

        ctx.fillStyle = 'rgb(4,6,22)';
        ctx.fillRect(0, 0, W, H);

        this.drawNightSky(ctx, W, H, this.nightAlpha);

        // Fireworks drawn behind fireflies/petals for depth
        this.fireWorks.forEach(fw => this.drawFirework(ctx, fw));

        this.fireFlies.forEach(p => this.drawFirefly(ctx, p));
        this.petals.forEach(p    => this.drawPetal(ctx, p));

        if (this.phase === 'panelDrop' || this.phase === 'idle' || this.phase === 'exit') {
            this.drawPanel(ctx, W, H);
        }

        if (this.phase === 'exit' && this._exitFade > 0) {
            ctx.fillStyle = `rgba(2,4,14,${Math.min(this._exitFade, 1)})`;
            ctx.fillRect(0, 0, W, H);
        }

        ctx.restore();
    }

    //  Panel 
    drawPanel(ctx, W, H) {
        const panelW = W*0.50;
        const panelH = H*0.68;
        const panelX = W/2 - panelW/2;
        const panelY = this.panelY;
        const cx = panelX + panelW/2;
        const rope1X = panelX + panelW*0.22;
        const rope2X = panelX + panelW*0.78;

        ctx.save();
        ctx.translate(W/2, H*0.02);
        ctx.rotate(this.swayAngle*Math.PI/180);
        ctx.translate(-W/2, -H*0.02);

        // Ropes
        ctx.strokeStyle = '#7A5535'; ctx.lineWidth = 2.8;
        [rope1X, rope2X].forEach((rx, i) => {
            ctx.beginPath();
            ctx.moveTo(rx, 0);
            ctx.quadraticCurveTo(rx+(i===0?-6:6), panelY*0.5, rx, panelY);
            ctx.stroke();
        });
        ctx.fillStyle = '#8c8c8c';
        [rope1X, rope2X].forEach(rx => {
            ctx.beginPath(); ctx.arc(rx, 4, 4, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle='#555'; ctx.lineWidth=0.8; ctx.stroke();
        });

        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.42)';
        roundRect(ctx, panelX+8, panelY+12, panelW, panelH, 12); ctx.fill();

        // Parchment
        const parch = ctx.createLinearGradient(panelX, panelY, panelX+panelW*0.15, panelY+panelH);
        parch.addColorStop(0,   '#FFF9E4');
        parch.addColorStop(0.3, '#FDEDC4');
        parch.addColorStop(0.7, '#FAE09C');
        parch.addColorStop(1,   '#F5D272');
        ctx.fillStyle = parch;
        roundRect(ctx, panelX, panelY, panelW, panelH, 12); ctx.fill();

        // Edge vignette
        const vig = ctx.createRadialGradient(cx, panelY+panelH*0.5, panelH*0.15, cx, panelY+panelH*0.5, panelH*0.88);
        vig.addColorStop(0, 'rgba(160,100,20,0)');
        vig.addColorStop(1, 'rgba(100,55,10,0.18)');
        ctx.fillStyle = vig;
        roundRect(ctx, panelX, panelY, panelW, panelH, 12); ctx.fill();

        // Outer border
        ctx.strokeStyle = 'rgba(175,112,32,0.52)'; ctx.lineWidth = 2.2;
        roundRect(ctx, panelX+6, panelY+6, panelW-12, panelH-12, 9); ctx.stroke();
        // Inner border
        ctx.strokeStyle = 'rgba(210,150,55,0.28)'; ctx.lineWidth = 1;
        roundRect(ctx, panelX+12, panelY+12, panelW-24, panelH-24, 6); ctx.stroke();

        // Corner dots
        ctx.fillStyle = 'rgba(155,98,28,0.42)';
        [[panelX+18,panelY+18],[panelX+panelW-18,panelY+18],
         [panelX+18,panelY+panelH-18],[panelX+panelW-18,panelY+panelH-18]].forEach(([nx,ny])=>{
            ctx.beginPath(); ctx.arc(nx,ny,2.5,0,Math.PI*2); ctx.fill();
        });

        ctx.textAlign = 'center';

        // Title 
        ctx.font = `bold italic ${Math.round(H*0.125)}px Georgia, serif`;
        ctx.fillStyle = 'rgba(100,55,8,0.32)';
        ctx.fillText('Finally Home', cx+2, panelY+panelH*0.185+2);
        const tg = ctx.createLinearGradient(cx, panelY+panelH*0.13, cx, panelY+panelH*0.225);
        tg.addColorStop(0,   '#FFE566');
        tg.addColorStop(0.45,'#EFB618');
        tg.addColorStop(1,   '#C47E0C');
        ctx.fillStyle = tg;
        ctx.fillText('Finally Home', cx, panelY+panelH*0.185);

        // Divider
        this.drawDivider(ctx, panelX+panelW*0.1, panelY+panelH*0.30, panelW*0.8);

        // Story text 
        const lineY = [0.45, 0.55, 0.65];
        this.textLines.forEach((line, i) => {
            if (line.alpha <= 0) return;
            ctx.globalAlpha = line.alpha;
            ctx.fillStyle = line.gold ? '#7A4A10' : '#6B3E1A';
            ctx.font = line.gold
                ? `bold italic ${Math.round(H*0.050)}px Georgia, serif`
                : `italic ${Math.round(H*0.050)}px Georgia, serif`;
            ctx.fillText(line.text, cx, panelY+panelH*lineY[i]);
        });
        ctx.globalAlpha = 1;

        //  Thank you Message 
        const tyProgress = this.textRevealDone
            ? Math.min(1, this.textTimer-(this.textLines.length*1.2))
            : 0;
        if (tyProgress > 0) {
            ctx.globalAlpha = Math.max(0, tyProgress);
            ctx.fillStyle = 'rgba(115,72,18,0.62)';
            ctx.font = `${Math.round(H*0.05)}px Georgia, serif`;
            ctx.fillText('♥  Thank you for playing!  ♥', cx, panelY+panelH*0.75);
            ctx.globalAlpha = 1;
        }

        // Button 
        const btnW = panelW*0.58, btnH = H*0.085;
        const btnX = cx-btnW/2, btnY = panelY+panelH*0.80;
        this.btnRect = { x:btnX, y:btnY, w:btnW, h:btnH };

        const hov = this.phase === 'idle' &&
            this.mouseX>=btnX && this.mouseX<=btnX+btnW &&
            this.mouseY>=btnY && this.mouseY<=btnY+btnH;

        ctx.fillStyle='rgba(70,35,0,0.26)';
        roundRect(ctx,btnX+4,btnY+5,btnW,btnH,btnH/2); ctx.fill();

        const bg = ctx.createLinearGradient(btnX,btnY,btnX,btnY+btnH);
        if (hov) { bg.addColorStop(0,'#F5C030'); bg.addColorStop(0.5,'#D49010'); bg.addColorStop(1,'#AE6E08'); }
        else      { bg.addColorStop(0,'#E8B020'); bg.addColorStop(0.5,'#C48010'); bg.addColorStop(1,'#A06808'); }
        ctx.fillStyle = bg;
        roundRect(ctx,btnX,btnY,btnW,btnH,btnH/2); ctx.fill();

        const bhi = ctx.createLinearGradient(btnX,btnY,btnX,btnY+btnH*0.5);
        bhi.addColorStop(0,'rgba(255,255,200,0.26)'); bhi.addColorStop(1,'rgba(255,255,150,0)');
        ctx.fillStyle = bhi;
        roundRect(ctx,btnX+4,btnY+3,btnW-8,btnH*0.46,btnH/2); ctx.fill();

        ctx.strokeStyle = hov ? 'rgba(255,235,140,0.85)' : 'rgba(240,200,80,0.48)';
        ctx.lineWidth = hov ? 2 : 1.5;
        roundRect(ctx,btnX,btnY,btnW,btnH,btnH/2); ctx.stroke();

        const br=btnH*0.27, bx=btnX+btnH*0.56, by=btnY+btnH/2;
        ctx.fillStyle = hov ? '#fff' : 'rgba(255,255,215,0.88)';
        ctx.beginPath(); ctx.arc(bx,by,br,0,Math.PI*2); ctx.fill();
        ctx.fillStyle = '#7A4A00';
        ctx.font = `bold ${Math.round(btnH*0.42)}px Georgia, serif`;
        ctx.textAlign = 'center';
        ctx.fillText('⌂', bx, by+btnH*0.15);

        ctx.fillStyle = hov ? '#FFF8D0' : '#FFF0A0';
        ctx.font = `bold ${Math.round(btnH*0.42)}px Georgia, serif`;
        ctx.textAlign = 'left';
        ctx.fillText('Main Menu', btnX+btnH*0.98, btnY+btnH/2+btnH*0.15);

        ctx.fillStyle='rgba(135,88,18,0.48)';
        ctx.font=`italic ${Math.round(H*0.05)}px Georgia, serif`;
        ctx.textAlign='center';

        ctx.restore();
    }

    //  Divider 
    drawDivider(ctx, x, y, width) {
        const mid = x+width/2;
        const lg = ctx.createLinearGradient(x,y,mid-14,y);
        lg.addColorStop(0,'rgba(175,108,28,0)'); lg.addColorStop(1,'rgba(175,108,28,0.48)');
        ctx.strokeStyle=lg; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(mid-12,y); ctx.stroke();
        const rg = ctx.createLinearGradient(mid+14,y,x+width,y);
        rg.addColorStop(0,'rgba(175,108,28,0.48)'); rg.addColorStop(1,'rgba(175,108,28,0)');
        ctx.strokeStyle=rg;
        ctx.beginPath(); ctx.moveTo(mid+12,y); ctx.lineTo(x+width,y); ctx.stroke();
        ctx.fillStyle='rgba(195,138,38,0.68)';
        ctx.font=`${Math.round(width*0.034)}px Georgia, serif`;
        ctx.textAlign='center';
        ctx.fillText('✦', mid, y+4);
    }
}

function roundRect(ctx,x,y,w,h,r){
    ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y);
    ctx.quadraticCurveTo(x+w,y,x+w,y+r);
    ctx.lineTo(x+w,y+h-r);
    ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    ctx.lineTo(x+r,y+h);
    ctx.quadraticCurveTo(x,y+h,x,y+h-r);
    ctx.lineTo(x,y+r);
    ctx.quadraticCurveTo(x,y,x+r,y);
    ctx.closePath();
}