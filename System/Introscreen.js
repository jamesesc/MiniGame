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

        this._titleTime = 0;
        this._phase = 'menu';
        this._zoomTime = 0;
        this._zoomDuration = 1.2;
        this._zoomScale = 1.0;
        this._onPlayFired = false;

        this._panY = 0;
        this._panYTarget = -100;

        //  Firefly pools 
        this._fireflies = [];
        this._idleSpawnTimer = 0;
        this._zoomSpawnTimer = 0;
        this._bullet = null;
        this._flashAlpha = 0;

        // The Sign sway'
        this._swayAngle = 0;

        this._layers = [
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

        this._mouseX = -1;
        this._mouseY = -1;
        this._mouseHandler = (e) => {
            const rect = this.game.ctx.canvas.getBoundingClientRect();
            this._mouseX = e.clientX - rect.left;
            this._mouseY = e.clientY - rect.top;
        };
        this._clickHandler = (e) => {
            if (this._phase !== 'menu') return;
            const rect = this.game.ctx.canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            this._handleMenuClick(mx, my, this.game.ctx.canvas.width, this.game.ctx.canvas.height);
        };
        window.addEventListener('mousemove', this._mouseHandler);
        window.addEventListener('click', this._clickHandler);
    }

    destroy() {
        window.removeEventListener('mousemove', this._mouseHandler);
        window.removeEventListener('click', this._clickHandler);
        this.removeFromWorld = true;
    }

    //  Button layout — compact centered planks 
    _getButtonRects(W, H) {
        const btnW = Math.round(W * 0.15);
        const btnH = Math.round(H * 0.13);
        const btnX = W / 2 - btnW / 2;
        const startY = H * .5;
        const gap = btnH + 10;
        return this.menuItems.map((_, i) => ({
            x: btnX, y: startY + i * gap - btnH / 2, w: btnW, h: btnH
        }));
    }

    _isHovered(r) {
        return this._mouseX >= r.x && this._mouseX <= r.x + r.w &&
            this._mouseY >= r.y && this._mouseY <= r.y + r.h;
    }

    _handleMenuClick(mx, my, W, H) {
        if (this.showInfo || this.showSettings) {
            this.showInfo = false;
            this.showSettings = false;
            return;
        }
        const rects = this._getButtonRects(W, H);
        rects.forEach((r, i) => {
            if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
                this.selectedIndex = i;
                this._activateMenuItem(i);
            }
        });
    }

    _activateMenuItem(i) {
        if (i === 0) {
            this._phase = 'zoom';
            this._zoomTime = 0;
            this._zoomScale = 1.0;
            this._flashAlpha = 0;
            this._onPlayFired = false;
            this._panY = 0;
            this._zoomSpawnTimer = 0;
            this._bullet = null;
        } else if (i === 1) {
            this.showSettings = true;
        } else if (i === 2) {
            this.showInfo = true;
        }
    }

    //  Firefly spawners 
    _spawnIdleFirefly(W, H) {
        const col = this._randColor();
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

    _spawnZoomFirefly(W, H) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 50 + Math.random() * 100;
        const col = this._randColor();
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

    _spawnBullet(W, H) {
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
            ...this._randColor(),
            isBullet: true,
        };
    }

    _randColor() {
        const palettes = [
            { r2: 180, g2: 255, b2: 120 },
            { r2: 160, g2: 230, b2: 255 },
            { r2: 120, g2: 255, b2: 200 },
            { r2: 240, g2: 255, b2: 160 },
        ];
        return palettes[Math.floor(Math.random() * palettes.length)];
    }

    _updateFirefly(f, dt) {
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
        this._titleTime += this.game.clockTick;
        const dt = this.game.clockTick;
        const W = this.game.ctx.canvas.width;
        const H = this.game.ctx.canvas.height;

        this._swayAngle = Math.sin(this._titleTime * 0.5) * 1.2;

        if (this._phase === 'menu') {
            this._layers.forEach(l => { if (l.img) l.offset += l.speed * dt; });

            this._idleSpawnTimer -= dt;
            if (this._idleSpawnTimer <= 0) {
                this._idleSpawnTimer = 1.0 + Math.random() * 0.8;
                if (this._fireflies.length < 8)
                    this._fireflies.push(this._spawnIdleFirefly(W, H));
            }
            this._fireflies.forEach(f => this._updateFirefly(f, dt));
            this._fireflies = this._fireflies.filter(f => f.life < f.maxLife);

            const up    = this.game.keys['ArrowUp']   || this.game.keys['w'];
            const down  = this.game.keys['ArrowDown'] || this.game.keys['s'];
            const enter = this.game.keys['Enter']     || this.game.keys[' '];

            if (up && !this.menuKeyPressed) { this.selectedIndex = (this.selectedIndex - 1 + this.menuItems.length) % this.menuItems.length; this.menuKeyPressed = true; }
            else if (down && !this.menuKeyPressed) { this.selectedIndex = (this.selectedIndex + 1) % this.menuItems.length; this.menuKeyPressed = true; }
            else if (enter && !this.menuKeyPressed) { this.menuKeyPressed = true; this._activateMenuItem(this.selectedIndex); }
            if (!up && !down && !enter) this.menuKeyPressed = false;
            return;
        }

        if (this._phase === 'zoom') {
            this._zoomTime += dt;
            const progress = Math.min(this._zoomTime / this._zoomDuration, 1);
            const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            this._zoomScale = 1.0 + eased * 0.4;
            this._panY = eased * this._panYTarget;
            this._layers.forEach(l => { if (l.img) l.offset += l.speed * dt; });

            this._zoomSpawnTimer -= dt;
            if (this._zoomSpawnTimer <= 0) {
                this._zoomSpawnTimer = 0.09 + Math.random() * 0.07;
                this._fireflies.push(this._spawnZoomFirefly(W, H));
            }
            this._fireflies.forEach(f => this._updateFirefly(f, dt));
            this._fireflies = this._fireflies.filter(f => f.life < f.maxLife);

            if (progress >= 1) { this._phase = 'bullet'; this._bullet = this._spawnBullet(W, H); }
            return;
        }

        if (this._phase === 'bullet') {
            this._fireflies.forEach(f => this._updateFirefly(f, dt));
            this._fireflies = this._fireflies.filter(f => f.life < f.maxLife);
            this._updateFirefly(this._bullet, dt);
            if (this._bullet.life >= this._bullet.maxLife) { this._phase = 'flash'; this._flashAlpha = 0; this._bullet = null; }
            return;
        }

        if (this._phase === 'flash') {
            this._flashAlpha += dt * 5.0;
            if (this._flashAlpha >= 1) {
                this._flashAlpha = 1;
                if (!this._onPlayFired) { this._onPlayFired = true; this.onPlay(); }
                this._phase = 'fadeout';
            }
            return;
        }

        if (this._phase === 'fadeout') {
            this._flashAlpha -= dt * 0.9;
            if (this._flashAlpha <= 0) { this._flashAlpha = 0; this.destroy(); }
            return;
        }
    }

    //  Draw 
    draw(ctx) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        const W = ctx.canvas.width, H = ctx.canvas.height;

        this._drawParallaxBackground(ctx, W, H);

        if (this._phase === 'menu') {
            this._drawOtterSilhouette(ctx, W, H);
            this._drawHangingSign(ctx, W, H);
            this._drawMenuButtons(ctx, W, H);

            ctx.fillStyle = 'rgba(200,220,255,0.4)';
            ctx.font = 'italic 12px Georgia, serif';
            ctx.textAlign = 'left';
            ctx.fillText('version 1.0', W * 0.03, H - 12);

            if (this.showInfo) this._drawOverlay(ctx, W, H, 'Info', [
                'THE WACKY TACKY OTTER CRAZY ADVENTURE',
                '',
                'Battle through the forest as a brave otter!',
                'Defeat mushrooms, frogs, and bees.',
                'Collect hearts and cakes to restore health.',
                '',
                'Arrow Keys / WASD — Move & Navigate Menu',
                'Space / Enter — Jump, Attack, Confirm',
                '',
                'Click anywhere to close.',
            ]);
            if (this.showSettings) this._drawOverlay(ctx, W, H, 'Settings', [
                'Settings', '', '(Coming soon!)', '', 'Click anywhere to close.',
            ]);
        }

        // Fireflies clipped to background zone
        if (this._fireflies.length > 0) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, 0, W, H * 0.52);
            ctx.clip();
            this._fireflies.forEach(f => this._drawFirefly(ctx, f));
            ctx.restore();
        }

        if (this._bullet) {
            ctx.save();
            this._bullet.trail.forEach((p, i) => {
                const ta = (i / this._bullet.trail.length) * p.a * 0.5;
                const tr = this._bullet.r * (i / this._bullet.trail.length) * 2.5;
                if (tr <= 0) return;
                const tg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, tr);
                tg.addColorStop(0, `rgba(${this._bullet.r2},${this._bullet.g2},${this._bullet.b2},${ta})`);
                tg.addColorStop(1, `rgba(${this._bullet.r2},${this._bullet.g2},${this._bullet.b2},0)`);
                ctx.fillStyle = tg;
                ctx.beginPath();
                ctx.arc(p.x, p.y, tr, 0, Math.PI * 2);
                ctx.fill();
            });
            this._drawFirefly(ctx, this._bullet);
            ctx.restore();
        }

        if (this._flashAlpha > 0) {
            ctx.save();
            const a = this._flashAlpha;
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
    _drawOtterSilhouette(ctx, W, H) {
        // Sits at the right rope of the sign
        const signW = W * 0.52;
        const signX = W / 2 - signW / 2;
        const signY = H * 0.06;
        const ropeX = signX + signW * 0.82;
        const otterX = ropeX + 8;
        const otterY = signY - 2;

        ctx.save();
        ctx.fillStyle = 'rgba(20, 15, 10, 0.88)';

        // Body — rounded chunky silhouette
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

        // Feet dangling off the sign edge
        ctx.beginPath();
        ctx.ellipse(otterX - 5, otterY + 1, 5, 3, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(otterX + 5, otterY + 3, 5, 3, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Tiny glowing eye — matches firefly palette
        ctx.fillStyle = 'rgba(140, 255, 180, 0.9)';
        ctx.beginPath();
        ctx.arc(otterX + 7, otterY - 27, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    //  Narrower hanging sign with ropes 
    _drawHangingSign(ctx, W, H) {
        const sw = W * 0.45;   // narrower than before
        const sh = H * 0.18;
        const sx = W / 2 - sw / 2;
        const sy = H * 0.1;

        // Rope anchor points at top of canvas
        const rope1X = sx + sw * 0.22;
        const rope2X = sx + sw * 0.82;

        ctx.save();

        // Sway pivot around top-center
        ctx.translate(W / 2, H * 0.04);
        ctx.rotate(this._swayAngle * Math.PI / 180);
        ctx.translate(-W / 2, -H * 0.04);

        // Rope left — catenary curve
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

        // Rope nail hooks at top
        ctx.fillStyle = '#888';
        [rope1X, rope2X].forEach(rx => {
            ctx.beginPath();
            ctx.arc(rx, 4, 3.5, 0, Math.PI * 2);
            ctx.fill();
        });

        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.28)';
        _roundRect(ctx, sx + 6, sy + 8, sw, sh, 6);
        ctx.fill();

        // Wood body gradient
        const woodGrad = ctx.createLinearGradient(sx, sy, sx, sy + sh);
        woodGrad.addColorStop(0,   '#7a4e1e');
        woodGrad.addColorStop(0.4, '#5c3a12');
        woodGrad.addColorStop(1,   '#3e2508');
        ctx.fillStyle = woodGrad;
        _roundRect(ctx, sx, sy, sw, sh, 6);
        ctx.fill();

        // Plank lines — 2 horizontal splits
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

        // Carved border (inset double line)
        ctx.strokeStyle = '#a06828';
        ctx.lineWidth = 2.5;
        _roundRect(ctx, sx + 4, sy + 4, sw - 8, sh - 8, 4);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1;
        _roundRect(ctx, sx + 7, sy + 7, sw - 14, sh - 14, 3);
        ctx.stroke();

        // Nail heads at 4 corners
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

        // Title text — carved look with shadow + highlight
        const cx = sx + sw / 2;
        ctx.textAlign = 'center';

        // Shadow layer
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.font = `bold ${Math.round(H * 0.062)}px Georgia, serif`;
        ctx.fillText('THE WACKY TACKY', cx + 1, sy + sh * 0.38 + 1);
        ctx.font = `bold ${Math.round(H * 0.054)}px Georgia, serif`;
        ctx.fillText('OTTER CRAZY ADVENTURE', cx + 1, sy + sh * 0.72 + 1);

        // Highlight top
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

    //  Compact wood-plank buttons 
    _drawMenuButtons(ctx, W, H) {
        const rects = this._getButtonRects(W, H);
        const icons = ['▶', '⚙', 'ℹ'];
        const labels = ['Play', 'Settings', 'Info'];

        rects.forEach((r, i) => {
            const hovered = this._isHovered(r) || i === this.selectedIndex;
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

            // Selected: mossy green inset glow
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

            // Icon badge — small circle
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
        ctx.font = `italic ${Math.round(H * 0.02)}px Georgia, serif`;
        ctx.textAlign = 'center';
        const lastR = rects[rects.length - 1];
        ctx.fillText('↑ ↓ or W S to navigate  •  Enter or Click to select',
            W / 2, lastR.y + lastR.h + Math.round(H * 0.032));
    }

    //  Draw a single firefly 
    _drawFirefly(ctx, f) {
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
    _drawParallaxBackground(ctx, W, H) {
        const isZooming = this._phase === 'zoom' || this._phase === 'bullet'
                       || this._phase === 'flash' || this._phase === 'fadeout';

        if (isZooming && this._zoomScale > 1.0) {
            ctx.save();
            const progress = Math.min(this._zoomTime / this._zoomDuration, 1);
            const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            const ox = W * 0.5;
            const oy = H * (0.45 + eased * 0.02);
            ctx.translate(ox, oy);
            ctx.scale(this._zoomScale, this._zoomScale);
            ctx.translate(-ox, -oy);
        }

        this._layers.forEach(l => {
            if (!l.img) return;
            let scale = H / l.img.height;
            if (l.customScale) scale *= l.customScale;
            const iw = l.img.width * scale;
            const ih = l.img.height * scale;
            const depthFactor = l.speed === 0 ? 0.1 : Math.min(l.speed / 35, 1);
            const yOffset = (H - ih) - this._panY * depthFactor;
            const offset = l.offset % iw;
            let startX = -offset;
            while (startX > 0) startX -= iw;
            for (let x = startX; x < W; x += iw) ctx.drawImage(l.img, x, yOffset, iw, ih);
        });

        if (isZooming && this._zoomScale > 1.0) ctx.restore();
    }

    //  Overlay panel 
    _drawOverlay(ctx, W, H, title, lines) {
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
        ctx.font = `bold ${Math.round(H * 0.042)}px Georgia, serif`;
        ctx.fillText(title, ox + ow / 2, oy + H * 0.07);
        ctx.font = `${Math.round(H * 0.026)}px Georgia, serif`;
        ctx.fillStyle = '#ddc880';
        lines.forEach((line, i) => ctx.fillText(line, ox + ow / 2, oy + H * 0.12 + i * H * 0.045));
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