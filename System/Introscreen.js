export class IntroScreen {
    constructor(game, onPlay, onSettings, onInfo) {
        this.game = game;
        this.removeFromWorld = false;

        this.onPlay = onPlay;
        this.onSettings = onSettings;
        this.onInfo = onInfo;

        this.menuItems = ['Play', 'Settings', 'Info'];
        this.selectedIndex = 0;
        this.menuKeyPressed = false;

        this.showInfo = false;
        this.showSettings = false;

        this.overlayTab = 0;
this.overlayScroll = 0;
this.overlayMaxScroll = 0;

        this.titleTime = 0;
        this.phase = 'menu';
        this.zoomTime = 0;
        this.zoomDuration = 1.2;
        this.zoomScale = 1.0;
        this.onPlayFired = false;

        this.panY = 0;
        this.panYTarget = -100;

        //  Firefly pools 
        this.fireflies = [];
        this.idleSpawnTimer = 0;
        this.zoomSpawnTimer = 0;
        this.bullet = null;
        this.flashAlpha = 0;

        // The Sign sway'
        this.signSwayAngle = 0;

        // Background layer
        this.backgroundLayers = [
            { path: './Assets/Background/5-SkyBackground.png', speed: 0, customScale: 3 },
            { path: './Assets/IntroBackground/3.png',          speed: 6    },
            { path: './Assets/IntroBackground/4.png',          speed: 10   },
            { path: './Assets/IntroBackground/5.png',          speed: 14   },
            { path: './Assets/IntroBackground/6.png',          speed: 18   },
            { path: './Assets/IntroBackground/7.png',          speed: 22   },
            { path: './Assets/IntroBackground/8.png',          speed: 28   },
            { path: './Assets/IntroBackground/Foreground.png', speed: 35   },
        ].map(l => ({
            ...l,
            img: ASSET_MANAGER.getAsset(l.path),
            offset: 0,
        }));

        this.mouseX = -1;
        this.mouseY = -1;
        this.mouseHandler = (e) => {
            const rect = this.game.ctx.canvas.getBoundingClientRect();
        const scaleX = this.game.ctx.canvas.width  / rect.width;
        const scaleY = this.game.ctx.canvas.height / rect.height;
        this.mouseX = (e.clientX - rect.left) * scaleX;
        this.mouseY = (e.clientY - rect.top)  * scaleY;
        };
        this.clickHandler = (e) => {
        const rect = this.game.ctx.canvas.getBoundingClientRect();
        const scaleX = this.game.ctx.canvas.width  / rect.width;
        const scaleY = this.game.ctx.canvas.height / rect.height;
        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top)  * scaleY;

            // If overlay open, check tab clicks first
            if (this.showInfo || this.showSettings) {
                const W = this.game.ctx.canvas.width;
                const H = this.game.ctx.canvas.height;
                const ow = W * 0.62, oh = H * 0.75;
                const ox = (W - ow) / 2, oy = (H - oh) / 2;
                const tabs = this.showInfo ? ['Enemies', 'Cakes', 'Controls'] : ['Settings'];
                const tabW = ow / tabs.length;
                const tabH = H * 0.065;
                for (let t = 0; t < tabs.length; t++) {
                    const tx = ox + t * tabW, ty = oy;
                    if (mx >= tx && mx <= tx + tabW && my >= ty && my <= ty + tabH) {
                        this.overlayTab = t;
                        this.overlayScroll = 0;
                        return;
                    }
                }
                // Click outside = close
                if (mx < ox || mx > ox + ow || my < oy || my > oy + oh) {
                    this.showInfo = false;
                    this.showSettings = false;
                }
                return;
            }

            if (this.phase !== 'menu') return;
            this.handleMenuClick(mx, my, this.game.ctx.canvas.width, this.game.ctx.canvas.height);
        };
        window.addEventListener('mousemove', this.mouseHandler);
        window.addEventListener('click', this.clickHandler);

        this.wheelHandler = (e) => {
            if (!this.showInfo && !this.showSettings) return;
            this.overlayScroll = Math.max(0,
                Math.min(this.overlayMaxScroll, this.overlayScroll + e.deltaY * 0.4));
        };
        window.addEventListener('wheel', this.wheelHandler);




    }

    destroy() {
        window.removeEventListener('wheel', this.wheelHandler);
        window.removeEventListener('mousemove', this.mouseHandler);
        window.removeEventListener('click', this.clickHandler);
        this.removeFromWorld = true;
    }

    //  Button layout
    buttonRects(W, H) {
        const btnW = Math.round(W * 0.15);
        const btnH = Math.round(H * 0.13);
        const btnX = W / 2 - btnW / 2;
        const startY = H * .5;
        const gap = btnH + 10;
        return this.menuItems.map((_, i) => ({
            x: btnX, y: startY + i * gap - btnH / 2, w: btnW, h: btnH
        }));
    }

    isHovered(r) {
        return this.mouseX >= r.x && this.mouseX <= r.x + r.w &&
            this.mouseY >= r.y && this.mouseY <= r.y + r.h;
    }

    handleMenuClick(mx, my, W, H) {

        const rects = this.buttonRects(W, H);
        rects.forEach((r, i) => {
            if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
                this.selectedIndex = i;
                this.actiateMenuItem(i);
            }
        });
    }

    actiateMenuItem(i) {
        if (i === 0) {
            this.phase = 'zoom';
            this.zoomTime = 0;
            this.zoomScale = 1.0;
            this.flashAlpha = 0;
            this.onPlayFired = false;
            this.panY = 0;
            this.zoomSpawnTimer = 0;
            this.bullet = null;
        } else if (i === 1) {
            this.showSettings = true;
            this.overlayTab = 0;
            this.overlayScroll = 0;
        } else if (i === 2) {
            this.showInfo = true;
            this.overlayTab = 0;
            this.overlayScroll = 0;
        }
    }

    //  Firefly spawners 
    spawnIdleFirefly(W, H) {
        const col = this.randomColor();
        return {
            x: W * 0.2 + Math.random() * W * 0.6,
            y: H * 0.1 + Math.random() * H * 0.38,
            vx: (Math.random() - 0.5) * 18,
            vy: (Math.random() - 0.5) * 10 - 5,
            r: 1.5 + Math.random() * 1.5,
            alpha: 0, life: 0,
            maxLife: 2.5 + Math.random() * 2.0,
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: 1.5 + Math.random() * 2,
            ...col,
        };
    }

    spawnZooomFireFly(W, H) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 50 + Math.random() * 100;
        const col = this.randomColor();
        return {
            x: W * 0.5 + (Math.random() - 0.5) * W * 0.35,
            y: H * 0.15 + Math.random() * H * 0.32,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 25,
            r: 2 + Math.random() * 2.5,
            alpha: 0, life: 0,
            maxLife: 1.8 + Math.random() * 1.2,
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: 2 + Math.random() * 3,
            ...col,
        };
    }

    spawnBullet(W, H) {
        const startX = W * 0.5 + (Math.random() - 0.5) * W * 0.2;
        const startY = H * 0.65 + Math.random() * H * 0.1;
        const tx = W * 0.5, ty = H * 0.5;
        const dx = tx - startX, dy = ty - startY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const speed = 900;
        return {
            x: startX, y: startY,
            vx: (dx / dist) * speed,
            vy: (dy / dist) * speed,
            r: 3.5, alpha: 0, life: 0,
            maxLife: dist / speed + 0.05,
            wobble: 0, wobbleSpeed: 0,
            trail: [],
            ...this.randomColor(),
            isBullet: true,
        };
    }

    randomColor() {
        const palettes = [
            { r2: 180, g2: 255, b2: 120 },
            { r2: 160, g2: 230, b2: 255 },
            { r2: 120, g2: 255, b2: 200 },
            { r2: 240, g2: 255, b2: 160 },
        ];
        return palettes[Math.floor(Math.random() * palettes.length)];
    }

    updateFireFly(f, dt) {
        f.life += dt;
        const t = f.life / f.maxLife;
        if (f.isBullet) {
            f.alpha = Math.min(f.life / 0.08, 1);
        } else {
            if (t < 0.2)       f.alpha = t / 0.2;
            else if (t < 0.65) f.alpha = 1;
            else               f.alpha = 1 - (t - 0.65) / 0.35;
        }
        f.alpha = Math.max(0, Math.min(1, f.alpha));
        if (f.isBullet) {
            f.trail.push({ x: f.x, y: f.y, a: f.alpha });
            if (f.trail.length > 18) f.trail.shift();
        }
        f.wobble += f.wobbleSpeed * dt;
        f.x += (f.vx + Math.cos(f.wobble) * (f.isBullet ? 0 : 12)) * dt;
        f.y += (f.vy + Math.sin(f.wobble) * (f.isBullet ? 0 : 6)) * dt;
        f.vx *= f.isBullet ? 1.0 : 0.98;
        f.vy *= f.isBullet ? 1.0 : 0.98;
    }

    //  Update 
    update() {
        this.titleTime += this.game.clockTick;
        const dt = this.game.clockTick;
        const W = this.game.ctx.canvas.width;
        const H = this.game.ctx.canvas.height;

        this.signSwayAngle = Math.sin(this.titleTime * 0.5) * 1.2;

        if (this.phase === 'menu') {
            this.backgroundLayers.forEach(l => { if (l.img) l.offset += l.speed * dt; });

            this.idleSpawnTimer -= dt;
            if (this.idleSpawnTimer <= 0) {
                this.idleSpawnTimer = 1.0 + Math.random() * 0.8;
                if (this.fireflies.length < 8)
                    this.fireflies.push(this.spawnIdleFirefly(W, H));
            }
            this.fireflies.forEach(f => this.updateFireFly(f, dt));
            this.fireflies = this.fireflies.filter(f => f.life < f.maxLife);

            if (this.showInfo || this.showSettings) {
                const up   = this.game.keys['ArrowUp']   || this.game.keys['w'];
                const down = this.game.keys['ArrowDown'] || this.game.keys['s'];
                if (up && !this.menuKeyPressed) {
                    this.overlayScroll = Math.max(0, this.overlayScroll - 60);
                    this.menuKeyPressed = true;
                } else if (down && !this.menuKeyPressed) {
                    this.overlayScroll = Math.min(this.overlayMaxScroll, this.overlayScroll + 60);
                    this.menuKeyPressed = true;
                }
            if (!up && !down) this.menuKeyPressed = false;
            return;
            }

            const up    = this.game.keys['ArrowUp']   || this.game.keys['w'];
            const down  = this.game.keys['ArrowDown'] || this.game.keys['s'];
            const enter = this.game.keys['Enter']     || this.game.keys[' '];

            if (up && !this.menuKeyPressed) { this.selectedIndex = (this.selectedIndex - 1 + this.menuItems.length) % this.menuItems.length; this.menuKeyPressed = true; }
            else if (down && !this.menuKeyPressed) { this.selectedIndex = (this.selectedIndex + 1) % this.menuItems.length; this.menuKeyPressed = true; }
            else if (enter && !this.menuKeyPressed) { this.menuKeyPressed = true; this.actiateMenuItem(this.selectedIndex); }
            if (!up && !down && !enter) this.menuKeyPressed = false;
            return;
        }

        if (this.phase === 'zoom') {
            this.zoomTime += dt;
            const progress = Math.min(this.zoomTime / this.zoomDuration, 1);
            const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            this.zoomScale = 1.0 + eased * 0.4;
            this.panY = eased * this.panYTarget;
            this.backgroundLayers.forEach(l => { if (l.img) l.offset += l.speed * dt; });

            this.zoomSpawnTimer -= dt;
            if (this.zoomSpawnTimer <= 0) {
                this.zoomSpawnTimer = 0.09 + Math.random() * 0.07;
                this.fireflies.push(this.spawnZooomFireFly(W, H));
            }
            this.fireflies.forEach(f => this.updateFireFly(f, dt));
            this.fireflies = this.fireflies.filter(f => f.life < f.maxLife);

            if (progress >= 1) { this.phase = 'bullet'; this.bullet = this.spawnBullet(W, H); }
            return;
        }

        if (this.phase === 'bullet') {
            this.fireflies.forEach(f => this.updateFireFly(f, dt));
            this.fireflies = this.fireflies.filter(f => f.life < f.maxLife);
            this.updateFireFly(this.bullet, dt);
            if (this.bullet.life >= this.bullet.maxLife) { this.phase = 'flash'; this.flashAlpha = 0; this.bullet = null; }
            return;
        }

        if (this.phase === 'flash') {
            this.flashAlpha += dt * 5.0;
            if (this.flashAlpha >= 1) {
                this.flashAlpha = 1;
                if (!this.onPlayFired) { this.onPlayFired = true; this.onPlay(); }
                this.phase = 'fadeout';
            }
            return;
        }

        if (this.phase === 'fadeout') {
            this.flashAlpha -= dt * 0.9;
            if (this.flashAlpha <= 0) { this.flashAlpha = 0; this.destroy(); }
            return;
        }
    }

    //  Draw 
    draw(ctx) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        const W = ctx.canvas.width, H = ctx.canvas.height;

        this.drawParallasxBackground(ctx, W, H);

        if (this.phase === 'menu') {
            this.drawOtterSilhouette(ctx, W, H);
            this.drawHangingSigns(ctx, W, H);
            this.drawMenuButtons(ctx, W, H);

            ctx.fillStyle = 'rgba(200,220,255,0.4)';
            ctx.font = 'italic 12px Georgia, serif';
            ctx.textAlign = 'left';
            ctx.fillText('version 1.0', W * 0.03, H - 12);

            if (this.showInfo)     this.drawTabOverlay(ctx, W, H, 'info');
            if (this.showSettings) this.drawTabOverlay(ctx, W, H, 'settings');
        }

        // Fireflies clipped to background zone
        if (this.fireflies.length > 0) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, 0, W, H * 0.52);
            ctx.clip();
            this.fireflies.forEach(f => this.drawFireFly(ctx, f));
            ctx.restore();
        }

        if (this.bullet) {
            ctx.save();
            this.bullet.trail.forEach((p, i) => {
                const ta = (i / this.bullet.trail.length) * p.a * 0.5;
                const tr = this.bullet.r * (i / this.bullet.trail.length) * 2.5;
                if (tr <= 0) return;
                const tg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, tr);
                tg.addColorStop(0, `rgba(${this.bullet.r2},${this.bullet.g2},${this.bullet.b2},${ta})`);
                tg.addColorStop(1, `rgba(${this.bullet.r2},${this.bullet.g2},${this.bullet.b2},0)`);
                ctx.fillStyle = tg;
                ctx.beginPath();
                ctx.arc(p.x, p.y, tr, 0, Math.PI * 2);
                ctx.fill();
            });
            this.drawFireFly(ctx, this.bullet);
            ctx.restore();
        }

        if (this.flashAlpha > 0) {
            ctx.save();
            const a = this.flashAlpha;
            const cx = W * 0.5, cy = H * 0.38;
            const ambient = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 1.1);
            ambient.addColorStop(0,   `rgba(140,200,255,0)`);
            ambient.addColorStop(0.5, `rgba(60,120,210,${a * 0.35})`);
            ambient.addColorStop(1,   `rgba(10,30,90,${a * 0.55})`);
            ctx.fillStyle = ambient;
            ctx.fillRect(0, 0, W, H);
            const orb = ctx.createRadialGradient(cx, cy, 0, cx, cy, H * 0.55);
            orb.addColorStop(0,    `rgba(240,252,255,${a})`);
            orb.addColorStop(0.08, `rgba(200,235,255,${a * 0.95})`);
            orb.addColorStop(0.25, `rgba(100,180,255,${a * 0.75})`);
            orb.addColorStop(0.55, `rgba(40,90,200,${a * 0.4})`);
            orb.addColorStop(1,    `rgba(10,20,80,0)`);
            ctx.fillStyle = orb;
            ctx.fillRect(0, 0, W, H);
            if (a > 0.15) {
                const sa = (a - 0.15) / 0.85;
                const streak = ctx.createLinearGradient(0, cy - H * 0.025, 0, cy + H * 0.025);
                streak.addColorStop(0,   `rgba(180,225,255,0)`);
                streak.addColorStop(0.5, `rgba(210,240,255,${sa * 0.5})`);
                streak.addColorStop(1,   `rgba(180,225,255,0)`);
                ctx.fillStyle = streak;
                ctx.fillRect(0, cy - H * 0.025, W, H * 0.05);
            }
            ctx.restore();
        }

        ctx.restore();
    }

    //  Otter silhouette sitting on sign 
    drawOtterSilhouette(ctx, W, H) {
        // Sits at the right rope of the sign
        const signW = W * 0.52;
        const signX = W / 2 - signW / 2;
        const signY = H * 0.06;
        const ropeX = signX + signW * 0.82;
        const otterX = ropeX + 8;
        const otterY = signY - 2;

        ctx.save();
        ctx.fillStyle = 'rgba(20, 15, 10, 0.88)';

        // Body 
        ctx.beginPath();
        ctx.ellipse(otterX, otterY - 14, 13, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.beginPath();
        ctx.ellipse(otterX + 4, otterY - 26, 9, 8, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Ear left
        ctx.beginPath();
        ctx.ellipse(otterX - 1, otterY - 33, 3, 3.5, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Ear right
        ctx.beginPath();
        ctx.ellipse(otterX + 8, otterY - 34, 3, 3.5, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Tail curving right
        ctx.beginPath();
        ctx.moveTo(otterX + 10, otterY - 10);
        ctx.quadraticCurveTo(otterX + 30, otterY - 5, otterX + 26, otterY + 4);
        ctx.quadraticCurveTo(otterX + 20, otterY + 8, otterX + 12, otterY - 2);
        ctx.fill();

        // Feet
        ctx.beginPath();
        ctx.ellipse(otterX - 5, otterY + 1, 5, 3, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(otterX + 5, otterY + 3, 5, 3, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // A glowing eye detail
        ctx.fillStyle = 'rgba(140, 255, 180, 0.9)';
        ctx.beginPath();
        ctx.arc(otterX + 7, otterY - 27, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    
    drawHangingSigns(ctx, W, H) {
        const sw = W * 0.45;   
        const sh = H * 0.18;
        const sx = W / 2 - sw / 2;
        const sy = H * 0.1;

        // Rope anchor points at top of canvas
        const rope1X = sx + sw * 0.22;
        const rope2X = sx + sw * 0.82;

        ctx.save();

        // Sway pivot 
        ctx.translate(W / 2, H * 0.04);
        ctx.rotate(this.signSwayAngle * Math.PI / 180);
        ctx.translate(-W / 2, -H * 0.04);

        // Rope left
        ctx.strokeStyle = '#6b4c2a';
        ctx.lineWidth = 25;
        ctx.beginPath();
        ctx.moveTo(rope1X, 0);
        ctx.quadraticCurveTo(rope1X - 4, sy * 0.5, rope1X, sy);
        ctx.stroke();

        // Rope right
        ctx.beginPath();
        ctx.moveTo(rope2X, 0);
        ctx.quadraticCurveTo(rope2X + 4, sy * 0.5, rope2X, sy);
        ctx.stroke();

        // Rope nail 
        ctx.fillStyle = '#888';
        [rope1X, rope2X].forEach(rx => {
            ctx.beginPath();
            ctx.arc(rx, 4, 3.5, 0, Math.PI * 2);
            ctx.fill();
        });

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.28)';
        _roundRect(ctx, sx + 6, sy + 8, sw, sh, 6);
        ctx.fill();

        // Wood body
        const woodGrad = ctx.createLinearGradient(sx, sy, sx, sy + sh);
        woodGrad.addColorStop(0,   '#7a4e1e');
        woodGrad.addColorStop(0.4, '#5c3a12');
        woodGrad.addColorStop(1,   '#3e2508');
        ctx.fillStyle = woodGrad;
        _roundRect(ctx, sx, sy, sw, sh, 6);
        ctx.fill();

        // Plank lines
        ctx.strokeStyle = 'rgba(0,0,0,0.22)';
        ctx.lineWidth = 1.5;
        for (let p = 1; p < 3; p++) {
            const py = sy + (p / 3) * sh;
            ctx.beginPath();
            ctx.moveTo(sx + 6, py);
            ctx.lineTo(sx + sw - 6, py);
            ctx.stroke();
        }

        // Wood grain lines
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 1;
        for (let g = 0; g < 5; g++) {
            const gy = sy + 8 + g * (sh / 5.5);
            ctx.beginPath();
            ctx.moveTo(sx + 10, gy);
            ctx.lineTo(sx + sw - 10, gy + (g % 2 === 0 ? 3 : -2));
            ctx.stroke();
        }

        // Carved border
        ctx.strokeStyle = '#a06828';
        ctx.lineWidth = 2.5;
        _roundRect(ctx, sx + 4, sy + 4, sw - 8, sh - 8, 4);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1;
        _roundRect(ctx, sx + 7, sy + 7, sw - 14, sh - 14, 3);
        ctx.stroke();

        // Nail heads 
        ctx.fillStyle = '#7a6040';
        [[sx + 14, sy + 10], [sx + sw - 14, sy + 10],
         [sx + 14, sy + sh - 10], [sx + sw - 14, sy + sh - 10]].forEach(([nx, ny]) => {
            ctx.beginPath();
            ctx.arc(nx, ny, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#555';
            ctx.lineWidth = 0.8;
            ctx.stroke();
        });

        // Title text 
        const cx = sx + sw / 2;
        ctx.textAlign = 'center';

        // Shadow layer
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.font = `bold ${Math.round(H * 0.062)}px Georgia, serif`;
        ctx.fillText('THE WACKY TACKY', cx + 1, sy + sh * 0.38 + 1);
        ctx.font = `bold ${Math.round(H * 0.054)}px Georgia, serif`;
        ctx.fillText('OTTER CRAZY ADVENTURE', cx + 1, sy + sh * 0.72 + 1);

        // Highlight 
        ctx.fillStyle = 'rgba(255,240,180,0.25)';
        ctx.font = `bold ${Math.round(H * 0.062)}px Georgia, serif`;
        ctx.fillText('THE WACKY TACKY', cx - 1, sy + sh * 0.38 - 1);

        // Main gold text
        const textGrad = ctx.createLinearGradient(cx, sy + sh * 0.25, cx, sy + sh * 0.8);
        textGrad.addColorStop(0, '#ffe98a');
        textGrad.addColorStop(0.5, '#d4a820');
        textGrad.addColorStop(1, '#f5d060');
        ctx.fillStyle = textGrad;
        ctx.font = `bold ${Math.round(H * 0.062)}px Georgia, serif`;
        ctx.fillText('THE WACKY TACKY', cx, sy + sh * 0.38);
        ctx.font = `bold ${Math.round(H * 0.054)}px Georgia, serif`;
        ctx.fillText('OTTER CRAZY ADVENTURE', cx, sy + sh * 0.72);

        ctx.restore();
    }

    //  Wood-plank buttons 
    drawMenuButtons(ctx, W, H) {
        const rects = this.buttonRects(W, H);
        const icons = ['▶', '⚙', 'ℹ'];
        const labels = ['Play', 'Settings', 'Info'];

        rects.forEach((r, i) => {
            const hovered = this.isHovered(r) || i === this.selectedIndex;
            const selected = i === this.selectedIndex;

            // Drop shadow
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            _roundRect(ctx, r.x + 3, r.y + 4, r.w, r.h, 5);
            ctx.fill();

            // Plank body
            const bg = ctx.createLinearGradient(r.x, r.y, r.x, r.y + r.h);
            if (selected) {
                bg.addColorStop(0, '#6a4a18');
                bg.addColorStop(0.5, '#4a3010');
                bg.addColorStop(1, '#3a2208');
            } else if (hovered) {
                bg.addColorStop(0, '#7a5520');
                bg.addColorStop(1, '#4a3212');
            } else {
                bg.addColorStop(0, '#5e3e14');
                bg.addColorStop(1, '#3a2508');
            }
            ctx.fillStyle = bg;
            _roundRect(ctx, r.x, r.y, r.w, r.h, 5);
            ctx.fill();

            // Single wood grain line through center
            ctx.strokeStyle = 'rgba(0,0,0,0.15)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(r.x + 8, r.y + r.h / 2 + 1);
            ctx.lineTo(r.x + r.w - 8, r.y + r.h / 2 - 1);
            ctx.stroke();

            // Mossy green inset glow
            if (selected) {
                const moss = ctx.createLinearGradient(r.x + 5, r.y + 4, r.x + 5, r.y + r.h - 4);
                moss.addColorStop(0, 'rgba(60,140,40,0.7)');
                moss.addColorStop(1, 'rgba(25,80,15,0.7)');
                ctx.fillStyle = moss;
                _roundRect(ctx, r.x + 5, r.y + 4, r.w - 10, r.h - 8, 3);
                ctx.fill();
            }

            // Border
            ctx.strokeStyle = hovered ? '#c08830' : '#7a5222';
            ctx.lineWidth = selected ? 2 : 1.5;
            _roundRect(ctx, r.x, r.y, r.w, r.h, 5);
            ctx.stroke();

            // Icon badge
            const badgeR = r.h * 0.28;
            const badgeX = r.x + r.h * 0.55;
            const badgeY = r.y + r.h / 2;
            ctx.fillStyle = selected ? '#ffcc44' : hovered ? 'rgba(255,200,80,0.7)' : 'rgba(255,180,60,0.4)';
            ctx.beginPath();
            ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#2a1500';
            ctx.font = `bold ${Math.round(r.h * 0.42)}px Georgia, serif`;
            ctx.textAlign = 'center';
            ctx.fillText(icons[i], badgeX, badgeY + r.h * 0.14);

            // Label
            ctx.fillStyle = selected ? '#fff8d0' : hovered ? '#e8d488' : '#c8b060';
            ctx.font = `bold ${Math.round(r.h * 0.46)}px Georgia, serif`;
            ctx.textAlign = 'left';
            ctx.fillText(labels[i], r.x + r.h * 1.0, r.y + r.h / 2 + r.h * 0.16);

            // Nail heads left + right
            ctx.fillStyle = '#6a5030';
            [[r.x + 6, r.y + r.h / 2], [r.x + r.w - 6, r.y + r.h / 2]].forEach(([nx, ny]) => {
                ctx.beginPath();
                ctx.arc(nx, ny, 2.5, 0, Math.PI * 2);
                ctx.fill();
            });
        });

        // Hint text below buttons
        ctx.fillStyle = 'rgba(200,220,255,0.45)';
        ctx.font = `italic ${Math.round(H * 0.05)}px Georgia, serif`;
        ctx.textAlign = 'center';
        const lastR = rects[rects.length - 1];
        ctx.fillText('↑ ↓ or W/S to navigate  •  Enter or Click to select',
            W / 2, lastR.y + lastR.h + Math.round(H * 0.08));
    }

    //  Draw a single firefly 
    drawFireFly(ctx, f) {
        if (f.alpha <= 0) return;
        const glow = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * (f.isBullet ? 6 : 4));
        glow.addColorStop(0,   `rgba(${f.r2},${f.g2},${f.b2},${f.alpha * 0.85})`);
        glow.addColorStop(0.5, `rgba(${f.r2},${f.g2},${f.b2},${f.alpha * 0.3})`);
        glow.addColorStop(1,   `rgba(${f.r2},${f.g2},${f.b2},0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r * (f.isBullet ? 6 : 4), 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255,255,230,${f.alpha})`;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r * 0.55, 0, Math.PI * 2);
        ctx.fill();
    }

    //  Parallax background 
    drawParallasxBackground(ctx, W, H) {
        const isZooming = this.phase === 'zoom' || this.phase === 'bullet'
                       || this.phase === 'flash' || this.phase === 'fadeout';

        if (isZooming && this.zoomScale > 1.0) {
            ctx.save();
            const progress = Math.min(this.zoomTime / this.zoomDuration, 1);
            const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            const ox = W * 0.5;
            const oy = H * (0.45 + eased * 0.02);
            ctx.translate(ox, oy);
            ctx.scale(this.zoomScale, this.zoomScale);
            ctx.translate(-ox, -oy);
        }

        this.backgroundLayers.forEach(l => {
            if (!l.img) return;
            let scale = H / l.img.height;
            if (l.customScale) scale *= l.customScale;
            const iw = l.img.width * scale;
            const ih = l.img.height * scale;
            const depthFactor = l.speed === 0 ? 0.1 : Math.min(l.speed / 35, 1);
            const yOffset = (H - ih) - this.panY * depthFactor;
            const offset = l.offset % iw;
            let startX = -offset;
            while (startX > 0) startX -= iw;
            for (let x = startX; x < W; x += iw) ctx.drawImage(l.img, x, yOffset, iw, ih);
        });

        if (isZooming && this.zoomScale > 1.0) ctx.restore();
    }

    //  Overlay panel 
    drawOverlay(ctx, W, H, title, lines) {
        ctx.fillStyle = 'rgba(0,0,0,0.72)';
        ctx.fillRect(0, 0, W, H);
        const ow = W * 0.5, oh = H * 0.6;
        const ox = (W - ow) / 2, oy = (H - oh) / 2;
        const woodGrad = ctx.createLinearGradient(ox, oy, ox, oy + oh);
        woodGrad.addColorStop(0, '#7a4e1a');
        woodGrad.addColorStop(1, '#3a2008');
        ctx.fillStyle = woodGrad;
        _roundRect(ctx, ox, oy, ow, oh, 10);
        ctx.fill();
        ctx.strokeStyle = '#a06828';
        ctx.lineWidth = 2.5;
        _roundRect(ctx, ox + 4, oy + 4, ow - 8, oh - 8, 8);
        ctx.stroke();
        ctx.textAlign = 'center';
        ctx.fillStyle = '#f5e5a0';
        ctx.font = `bold ${Math.round(H * 0.06)}px Georgia, serif`;
        ctx.fillText(title, ox + ow / 2, oy + H * 0.07);
        ctx.font = `${Math.round(H * 0.045)}px Georgia, serif`;
        ctx.fillStyle = '#ddc880';
        lines.forEach((line, i) => ctx.fillText(line, ox + ow / 2, oy + H * 0.12 + i * H * 0.045));
    }
    drawTabOverlay(ctx, W, H, mode) {
        // Dim background
        ctx.fillStyle = 'rgba(0,0,0,0.72)';
        ctx.fillRect(0, 0, W, H);

        const ow = W * 0.62, oh = H * 0.75;
        const ox = (W - ow) / 2, oy = (H - oh) / 2;

        const tabs = mode === 'info'
            ? ['⚔ Enemies', '🍰 Cakes', '🎮 Controls']
            : ['⚙ Settings'];

        const tabH = H * 0.065;
        const tabW = ow / tabs.length;

        // Draw tabs
        tabs.forEach((label, t) => {
            const tx = ox + t * tabW, ty = oy;
            const active = t === this.overlayTab;
            const tabGrad = ctx.createLinearGradient(tx, ty, tx, ty + tabH);
            if (active) {
                tabGrad.addColorStop(0, '#8a5a20');
                tabGrad.addColorStop(1, '#5c3a10');
            } else {
                tabGrad.addColorStop(0, '#4a3010');
                tabGrad.addColorStop(1, '#2e1c06');
            }
            ctx.fillStyle = tabGrad;
            // Rounded top only for active
            ctx.beginPath();
            const r = 8;
            ctx.moveTo(tx + r, ty);
            ctx.lineTo(tx + tabW - r, ty);
            ctx.quadraticCurveTo(tx + tabW, ty, tx + tabW, ty + r);
            ctx.lineTo(tx + tabW, ty + tabH);
            ctx.lineTo(tx, ty + tabH);
            ctx.lineTo(tx, ty + r);
            ctx.quadraticCurveTo(tx, ty, tx + r, ty);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = active ? '#c08830' : '#5a3a10';
            ctx.lineWidth = active ? 2 : 1;
            ctx.stroke();

            ctx.fillStyle = active ? '#ffe98a' : '#9a7840';
            ctx.font = `bold ${Math.round(H * 0.038)}px Georgia, serif`;
            ctx.textAlign = 'center';
            ctx.fillText(label, tx + tabW / 2, ty + tabH * 0.65);
        });

        // Main panel body
        const panelY = oy + tabH;
        const panelH = oh - tabH;
        const woodGrad = ctx.createLinearGradient(ox, panelY, ox, panelY + panelH);
        woodGrad.addColorStop(0, '#7a4e1a');
        woodGrad.addColorStop(1, '#3a2008');
        ctx.fillStyle = woodGrad;
        _roundRect(ctx, ox, panelY, ow, panelH, 10);
        ctx.fill();
        ctx.strokeStyle = '#a06828';
        ctx.lineWidth = 2.5;
        _roundRect(ctx, ox + 4, panelY + 4, ow - 8, panelH - 8, 8);
        ctx.stroke();

        // Wood grain
        ctx.strokeStyle = 'rgba(0,0,0,0.07)';
        ctx.lineWidth = 1;
        for (let g = 0; g < 8; g++) {
            const gy = panelY + 10 + g * (panelH / 8.5);
            ctx.beginPath();
            ctx.moveTo(ox + 12, gy);
            ctx.lineTo(ox + ow - 12, gy + (g % 2 === 0 ? 4 : -3));
            ctx.stroke();
        }

        // Clip content area
        const padX = 28, padTop = 18, padBot = 24;
        const contentX = ox + padX;
        const contentY = panelY + padTop;
        const contentW = ow - padX * 2 - 18; // leave room for scrollbar
        const contentH = panelH - padTop - padBot;

        ctx.save();
        ctx.beginPath();
        ctx.rect(contentX, contentY, contentW, contentH);
        ctx.clip();

        // Render tab content
        const scrollY = contentY - this.overlayScroll;
        let totalH = 0;

        if (mode === 'settings') {
            totalH = this._drawSettingsContent(ctx, contentX, scrollY, contentW, H);
        } else if (this.overlayTab === 0) {
            totalH = this._drawEnemiesContent(ctx, contentX, scrollY, contentW, H);
        } else if (this.overlayTab === 1) {
            totalH = this._drawCakesContent(ctx, contentX, scrollY, contentW, H);
        } else if (this.overlayTab === 2) {
            totalH = this._drawControlsContent(ctx, contentX, scrollY, contentW, H);
        }

        this.overlayMaxScroll = Math.max(0, totalH - contentH);
        ctx.restore();

        // Scrollbar
        if (this.overlayMaxScroll > 0) {
            const sbX = ox + ow - 16;
            const sbY = contentY;
            const sbH = contentH;
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            _roundRect(ctx, sbX, sbY, 8, sbH, 4);
            ctx.fill();
            const thumbH = Math.max(30, sbH * (contentH / (contentH + this.overlayMaxScroll)));
            const thumbY = sbY + (this.overlayScroll / this.overlayMaxScroll) * (sbH - thumbH);
            ctx.fillStyle = '#c08830';
            _roundRect(ctx, sbX, thumbY, 8, thumbH, 4);
            ctx.fill();
        }

        // Scroll hint
        if (this.overlayMaxScroll > 0 && this.overlayScroll < 10) {
            ctx.fillStyle = 'rgba(200,180,100,0.5)';
            ctx.font = `italic ${Math.round(H * 0.03)}px Georgia, serif`;
            ctx.textAlign = 'center';
            ctx.fillText('▼ scroll for more', ox + ow / 2, panelY + panelH - 8);
        }

        // Close hint
        ctx.fillStyle = 'rgba(180,160,80,0.45)';
        ctx.font = `italic ${Math.round(H * 0.028)}px Georgia, serif`;
        ctx.textAlign = 'center';
        ctx.fillText('Click outside to close', ox + ow / 2, oy + oh + H * 0.03);
    }

    _drawSectionTitle(ctx, x, y, text, W, H) {
        const grad = ctx.createLinearGradient(x, y, x, y + H * 0.055);
        grad.addColorStop(0, '#ffe98a');
        grad.addColorStop(1, '#d4a820');
        ctx.fillStyle = grad;
        ctx.font = `bold ${Math.round(H * 0.048)}px Georgia, serif`;
        ctx.textAlign = 'left';
        ctx.fillText(text, x, y + H * 0.04);
        // Underline
        ctx.strokeStyle = '#c08030';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, y + H * 0.05);
        ctx.lineTo(x + W * 0.55, y + H * 0.05);
        ctx.stroke();
        return H * 0.065;
    }

    _drawBodyText(ctx, x, y, text, color, H, wrap, maxW) {
        ctx.fillStyle = color || '#ddc880';
        ctx.font = `${Math.round(H * 0.036)}px Georgia, serif`;
        ctx.textAlign = 'left';
        if (!wrap) {
            ctx.fillText(text, x, y + H * 0.032);
            return H * 0.044;
        }
        // Word wrap
        const words = text.split(' ');
        let line = '', lineH = H * 0.042, totalH = 0, cy = y;
        for (const word of words) {
            const test = line ? line + ' ' + word : word;
            if (ctx.measureText(test).width > maxW && line) {
                ctx.fillText(line, x, cy + H * 0.032);
                cy += lineH; totalH += lineH;
                line = word;
            } else { line = test; }
        }
        if (line) { ctx.fillText(line, x, cy + H * 0.032); totalH += lineH; }
        return totalH;
    }

    _drawEnemiesContent(ctx, x, y, w, H) {
        const enemies = [
            {
                name: 'Mushroom',
                emoji: '🍄',
                color: '#e87060',
                hp: '❤❤',
                dmg: '1 heart',
                behavior: 'Walks back and forth. Turns around at edges and walls. Harmless unless touched.',
                drops: 'Nothing',
            },
            {
                name: 'Frog',
                emoji: '🐸',
                color: '#60c860',
                hp: '❤❤❤',
                dmg: '1 heart',
                behavior: 'Jumps periodically toward the player. Hard to dodge mid-air. Higher health than mushroom.',
                drops: 'Nothing',
            },
            {
                name: 'Bee',
                emoji: '🐝',
                color: '#f0c030',
                hp: '❤',
                dmg: '1 heart',
                behavior: 'Flies in a sine-wave pattern. Moves faster than ground enemies. Low health but tricky to hit.',
                drops: 'Nothing',
            },
        ];

        let cy = y;
        const lineH = H * 0.044;
        const cardH = H * 0.19;
        const cardPad = 14;

        cy += H * 0.01;

        enemies.forEach(e => {
            // Card background
            ctx.fillStyle = 'rgba(0,0,0,0.28)';
            _roundRect(ctx, x, cy + 3, w, cardH, 6);
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.04)';
            _roundRect(ctx, x, cy, w, cardH, 6);
            ctx.fill();
            ctx.strokeStyle = 'rgba(180,120,30,0.4)';
            ctx.lineWidth = 1.5;
            _roundRect(ctx, x, cy, w, cardH, 6);
            ctx.stroke();

            // Emoji icon
            ctx.font = `${Math.round(H * 0.09)}px serif`;
            ctx.textAlign = 'center';
            ctx.fillText(e.emoji, x + cardPad + H * 0.048, cy + cardH * 0.52);

            // Name
            const tx = x + cardPad + H * 0.1 + 8;
            ctx.fillStyle = e.color;
            ctx.font = `bold ${Math.round(H * 0.048)}px Georgia, serif`;
            ctx.textAlign = 'left';
            ctx.fillText(e.name, tx, cy + H * 0.055);

            // Stats row
            ctx.fillStyle = '#b0d0ff';
            ctx.font = `${Math.round(H * 0.033)}px Georgia, serif`;
            ctx.fillText(`HP: ${e.hp}   DMG: ${e.dmg}`, tx, cy + H * 0.098);

            // Behavior
            ctx.fillStyle = '#ddc880';
            ctx.font = `${Math.round(H * 0.032)}px Georgia, serif`;
            // Simple wrap
            const words = e.behavior.split(' ');
            let line = '', lx = tx, bY = cy + H * 0.135, bMaxW = w - (tx - x) - cardPad;
            for (const word of words) {
                const test = line ? line + ' ' + word : word;
                if (ctx.measureText(test).width > bMaxW && line) {
                    ctx.fillText(line, lx, bY);
                    bY += H * 0.038;
                    line = word;
                } else line = test;
            }
            if (line) ctx.fillText(line, lx, bY);

            cy += cardH + 12;
        });

        return cy - y + 10;
    }

    _drawCakesContent(ctx, x, y, w, H) {
        const cakes = [
            { file: 'blackforest',      name: 'Black Forest',       heal: '+2 HP', desc: 'A rich dark cake. Rare find.' },
            { file: 'blueberrycheesecake', name: 'Blueberry Cheesecake', heal: '+1 HP', desc: 'Creamy with a berry topping.' },
            { file: 'carrotcake',       name: 'Carrot Cake',        heal: '+1 HP', desc: 'Earthy and sweet.' },
            { file: 'cherry', name: 'Cherry Cheesecake',  heal: '+2 HP', desc: 'A tart cherry burst.' },
            { file: 'Chocolatecake',    name: 'Chocolate Cake',     heal: '+1 HP', desc: 'Classic and delicious.' },
            { file: 'funcake',          name: 'Fun Cake',           heal: '+3 HP', desc: 'Sprinkles everywhere! Best heal.' },
            { file: 'honey',            name: 'Honey Cake',         heal: '+1 HP', desc: 'Golden and sticky sweet.' },
            { file: 'icecreamcake',     name: 'Ice Cream Cake',     heal: '+2 HP', desc: 'Cold and refreshing.' },
            { file: 'kiwi',             name: 'Kiwi Cake',          heal: '+1 HP', desc: 'Tropical and bright green.' },
            { file: 'LemonCake',        name: 'Lemon Cake',         heal: '+1 HP', desc: 'Zesty and tangy.' },
            { file: 'pistachiocake',    name: 'Pistachio Cake',     heal: '+2 HP', desc: 'Nutty with a green hue.' },
            { file: 'redvelvet',        name: 'Red Velvet',         heal: '+2 HP', desc: 'Velvet smooth, cream frosted.' },
            { file: 'strawberrycake',   name: 'Strawberry Cake',    heal: '+1 HP', desc: 'Fresh summer berry flavor.' },
            { file: 'cakeyy',  name: 'Strawberry Cake',   heal: '+1 HP', desc: 'Light and fluffy.' },
            { file: 'upsidedown',       name: 'Upside Down Cake',   heal: '+2 HP', desc: 'Caramelized pineapple top.' },
            { file: 'vanilacake',       name: 'Vanilla Cake',       heal: '+1 HP', desc: 'Simple, classic, reliable.' },
        ];

        const cols = 2;
        const cardW = (w - 12) / cols;
        const cardH = H * 0.12;
        const imgSize = H * 0.075;
        let cy = y + H * 0.01;

        for (let i = 0; i < cakes.length; i++) {
            const col = i % cols;
            const cx2 = x + col * (cardW + 12);
            if (col === 0 && i > 0) cy += cardH + 10;

            const c = cakes[i];
            const imgPath = `./Assets/Items/Cakes/${c.file}.png`;

            const img = ASSET_MANAGER.getAsset(imgPath);

            // Card bg
            ctx.fillStyle = 'rgba(0,0,0,0.25)';
            _roundRect(ctx, cx2, cy + 2, cardW, cardH, 5);
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,200,0.04)';
            _roundRect(ctx, cx2, cy, cardW, cardH, 5);
            ctx.fill();
            ctx.strokeStyle = 'rgba(200,160,50,0.35)';
            ctx.lineWidth = 1;
            _roundRect(ctx, cx2, cy, cardW, cardH, 5);
            ctx.stroke();

            // Cake sprite or emoji fallback
            const imgX = cx2 + 10;
            const imgY = cy + (cardH - imgSize) / 2;
            if (img) {
                ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
            } else {
                ctx.font = `${Math.round(imgSize * 0.8)}px serif`;
                ctx.textAlign = 'center';
                ctx.fillText('🍰', imgX + imgSize / 2, imgY + imgSize * 0.8);
            }

            // Text
            const tx = cx2 + imgSize + 18;
            ctx.textAlign = 'left';
            ctx.fillStyle = '#ffe98a';
            ctx.font = `bold ${Math.round(H * 0.036)}px Georgia, serif`;
            ctx.fillText(c.name, tx, cy + H * 0.042);

            ctx.fillStyle = '#90ee90';
            ctx.font = `bold ${Math.round(H * 0.03)}px Georgia, serif`;
            ctx.fillText(c.heal, tx, cy + H * 0.072);

            ctx.fillStyle = '#c8b878';
            ctx.font = `${Math.round(H * 0.028)}px Georgia, serif`;
            ctx.fillText(c.desc, tx, cy + H * 0.098);
        }

        const rows = Math.ceil(cakes.length / cols);
        return rows * (cardH + 10) + H * 0.02;
    }

    _drawControlsContent(ctx, x, y, w, H) {
        const groups = [
            {
                title: 'Movement',
                items: [
                    ['Arrow Left / A', 'Move left'],
                    ['Arrow Right / D', 'Move right'],
                    ['W / Space', 'Jump'],
                    ['W / Space (again)', 'Double jump (if unlocked)'],
                ]
            },
            {
                title: 'Combat',
                items: [
                    ['E', 'Attack — swing your weapon'],
                    ['Walk into enemy', 'You take damage, avoid contact!'],
                ]
            },
            {
                title: 'Tips',
                items: [
                    ['Cakes', 'Restore health — collect them!'],
                    ['Hearts', 'Also restore health'],
                    ['Reach the end', 'Complete the level to win'],
                    ['Defeat enemies', 'Stomp or attack to clear path'],
                ]
            },
        ];

        let cy = y + H * 0.01;

        groups.forEach(g => {
            // Section title
            const grad = ctx.createLinearGradient(x, cy, x, cy + H * 0.05);
            grad.addColorStop(0, '#ffe98a');
            grad.addColorStop(1, '#d4a820');
            ctx.fillStyle = grad;
            ctx.font = `bold ${Math.round(H * 0.046)}px Georgia, serif`;
            ctx.textAlign = 'left';
            ctx.fillText(g.title, x, cy + H * 0.038);
            ctx.strokeStyle = '#c08030';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(x, cy + H * 0.048);
            ctx.lineTo(x + w * 0.5, cy + H * 0.048);
            ctx.stroke();
            cy += H * 0.062;

            g.items.forEach(([key, desc]) => {
                // Key badge
                const badgeW = w * 0.38;
                ctx.fillStyle = 'rgba(0,0,0,0.35)';
                _roundRect(ctx, x, cy, badgeW, H * 0.044, 4);
                ctx.fill();
                ctx.strokeStyle = '#8a6020';
                ctx.lineWidth = 1;
                _roundRect(ctx, x, cy, badgeW, H * 0.044, 4);
                ctx.stroke();
                ctx.fillStyle = '#ffe060';
                ctx.font = `bold ${Math.round(H * 0.032)}px Georgia, serif`;
                ctx.textAlign = 'center';
                ctx.fillText(key, x + badgeW / 2, cy + H * 0.031);

                // Description
                ctx.fillStyle = '#ddc880';
                ctx.font = `${Math.round(H * 0.032)}px Georgia, serif`;
                ctx.textAlign = 'left';
                ctx.fillText(desc, x + badgeW + 14, cy + H * 0.031);

                cy += H * 0.055;
            });
            cy += H * 0.02;
        });

        return cy - y;
    }

    _drawSettingsContent(ctx, x, y, w, H) {
        ctx.fillStyle = '#ddc880';
        ctx.font = `italic ${Math.round(H * 0.042)}px Georgia, serif`;
        ctx.textAlign = 'center';
        ctx.fillText('Settings coming soon!', x + w / 2, y + H * 0.12);
        ctx.font = `${Math.round(H * 0.032)}px Georgia, serif`;
        ctx.fillStyle = '#a08840';
        ctx.fillText('Volume, keybinds, and more will appear here.', x + w / 2, y + H * 0.18);
        return H * 0.3;
    }
}

    function _roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    