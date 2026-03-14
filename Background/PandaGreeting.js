export class PandaGreeting {
    constructor(game) {
        this.game = game;
        this.removeFromWorld = false;
        this.updateWhilePaused = false;

        this.phase = 'idle';
        this.phaseTimer = 0;

        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.startX = 0;

        this.bounceY = 0;
        this.bobTimer = 0;
        this.triggered = false;

        // Speech bubble
        this.bubbleLines = ["Ahh Welcome Back!"];
        this.displayedText = "";
        this.currentLineIndex = 0;
        this.charTimer = 0;
        this.charInterval = 0.045;
        this.bubbleAlpha = 0;
        this.linePause = 0;

        // Load sprites
        const walkSheet = ASSET_MANAGER.getAsset('./Assets/Panda/Walk.png');
        const idleSheet = ASSET_MANAGER.getAsset('./Assets/Panda/Idle.png');

        this.walkAnimation = new AnimatorFromOneImage(
            walkSheet,
            21, 26,
            63, 25,
            4, .4, 7,
            true
        );

        this.idleAnimation = new AnimatorFromOneImage(
            idleSheet,
            23, 25,
            64, 32,
            4, .25, 5,
            true
        );

        // Set scale separately just like Bird does
        this.walkAnimation.scale = 11;
        this.idleAnimation.scale = 11;
    }

    trigger(houseX, groundY) {
        if (this.triggered) return;
        this.triggered = true;

        // Freeze the player
        const player = this.game.camera?.otter;
        if (player) {
            player.frozen = true;
            player.velocity = { x: 0, y: 0 };
            player.action = 'idle';
        }

        // Freeze the camera at its current position
        this.frozenCamX = this.game.camera.x;
        this.frozenCamY = this.game.camera.y;

        // Start panda from right edge of the FROZEN camera view
        this.startX = this.frozenCamX + 5000;
        this.targetX = houseX + 300;
        this.x = this.startX;
        this.y = 915;

        this.phase = 'rolling';
        this.phaseTimer = 0;
    }


    update() {
    const dt = this.game.clockTick;
    this.phaseTimer += dt;

    if (this.phase === 'idle') return;

    // Keep camera frozen the whole time
    if (this.frozenCamX !== undefined) {
        this.game.camera.x = this.frozenCamX;
        this.game.camera.y = this.frozenCamY;
    }

    if (this.phase === 'rolling') {
        const walkSpeed = 550; // pixels per second, adjust to taste
        const dt = this.game.clockTick;
        
        this.x -= walkSpeed * dt; // just walk left at constant speed
        
        if (this.x <= this.targetX) {
            this.x = this.targetX;
            this.phase = 'settling';
            this.phaseTimer = 0;
        }
        return;
    }

    if (this.phase === 'settling') {
        const t = this.phaseTimer / 0.4;
        this.bounceY = Math.sin(t * Math.PI) * -25;
        if (this.phaseTimer >= 0.4) {
            this.bounceY = 0;
            this.phase = 'talking';
            this.phaseTimer = 0;
        }
        return;
    }

    if (this.phase === 'talking') {
        this.bobTimer += dt;
        this.bounceY = Math.sin(this.bobTimer * 3) * 4;
        this.bubbleAlpha = Math.min(1, this.bubbleAlpha + dt * 3);

        if (this.linePause > 0) { this.linePause -= dt; return; }

        const fullLine = this.bubbleLines[this.currentLineIndex];
        if (this.displayedText.length < fullLine.length) {
            this.charTimer += dt;
            while (this.charTimer >= this.charInterval &&
                   this.displayedText.length < fullLine.length) {
                this.displayedText += fullLine[this.displayedText.length];
                this.charTimer -= this.charInterval;
            }
        } else if (this.currentLineIndex < this.bubbleLines.length - 1) {
            this.linePause = 1.2;
            this.currentLineIndex++;
            this.displayedText = "";
        } else {
            // Both lines done — unfreeze player
            const player = this.game.camera?.otter;
            if (player) player.frozen = false;
            this.frozenCamX = undefined; // release camera
            this.game.pandaActive = false; 
        }
    }
}

    draw(ctx) {
        if (this.phase === 'idle') return;

        // World coordinates — just like Bird, no camera subtraction
        const drawX = this.x;
        const drawY = this.y + this.bounceY;

        const frameW = 63; // walk frame width
        const scale  = this.walkAnimation.scale;

        if (this.phase === 'rolling') {
            ctx.save();
            ctx.translate(drawX + frameW * scale, drawY);
            ctx.scale(-1, 1); // faces left ✓
            this.walkAnimation.drawFrame(this.game.clockTick, ctx, 0, 0);
            ctx.restore();
            return;
        }

        if (this.phase === 'settling' || this.phase === 'talking') {
            ctx.save();
            ctx.translate(drawX + (64 * this.idleAnimation.scale), drawY);
            ctx.scale(-1, 1);
            this.idleAnimation.drawFrame(this.game.clockTick, ctx, 0, 0);
            ctx.restore();  // restore panda transform FIRST

            // Draw bubble separately in screen space AFTER panda is drawn
            if (this.phase === 'talking' && this.bubbleAlpha > 0 && this.displayedText.length > 0) {
                const idleFrameW = 64;
                const idleFrameH = 32;
                const idleScale = this.idleAnimation.scale;

                const screenX = this.x - this.game.camera.x + 250;
                const screenY = (this.y + this.bounceY) - this.game.camera.y + 50;

                const bubbleAnchorX = screenX + (idleFrameW * idleScale / 2);
                const bubbleAnchorY = screenY - 30;

                ctx.save();
                ctx.setTransform(1, 0, 0, 1, 0, 0); // screen space for bubble only
                this.drawSpeechBubble(ctx, bubbleAnchorX, bubbleAnchorY);
                ctx.restore();
            }
        }
    }

    drawSpeechBubble(ctx, anchorX, anchorY) {
        ctx.save();
        ctx.globalAlpha = this.bubbleAlpha;

        const padding  = 18;
        const fontSize = 60;
        ctx.font = `bold ${fontSize}px Georgia, serif`;

        const allLines = [
            ...this.bubbleLines.slice(0, this.currentLineIndex),
            this.displayedText
        ];
        const maxW   = Math.max(...allLines.map(l => ctx.measureText(l).width));
        const lineH  = fontSize + 8;
        const bubbleW = maxW + padding * 2;
        const bubbleH = allLines.length * lineH + padding * 2;
        const bx = anchorX - bubbleW / 2;
        const by = anchorY - bubbleH - 30;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        this.roundRect(ctx, bx + 3, by + 3, bubbleW, bubbleH, 12);
        ctx.fill();

        // Background
        ctx.fillStyle = '#fffef2';
        this.roundRect(ctx, bx, by, bubbleW, bubbleH, 12);
        ctx.fill();

        // Border
        ctx.strokeStyle = '#c8a05a';
        ctx.lineWidth = 2.5;
        this.roundRect(ctx, bx, by, bubbleW, bubbleH, 12);
        ctx.stroke();

        // Tail
        ctx.fillStyle = '#fffef2';
        ctx.beginPath();
        ctx.moveTo(anchorX - 10, by + bubbleH);
        ctx.lineTo(anchorX + 10, by + bubbleH);
        ctx.lineTo(anchorX, by + bubbleH + 18);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#c8a05a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(anchorX - 10, by + bubbleH);
        ctx.lineTo(anchorX, by + bubbleH + 18);
        ctx.lineTo(anchorX + 10, by + bubbleH);
        ctx.stroke();

        // Text
        ctx.fillStyle = '#5a3a1a';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        allLines.forEach((line, i) => {
            ctx.fillText(line, anchorX, by + padding + i * lineH);
        });

        ctx.restore();
    }

    roundRect(ctx, x, y, w, h, r) {
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
}