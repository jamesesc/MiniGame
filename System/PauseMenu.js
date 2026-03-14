export class PauseMenu {
    constructor(game, onContinue, onRestart) {
        this.game = game;
        this.onContinue = onContinue;
        this.onRestart = onRestart;
        this.removeFromWorld = false;
        this.updateWhilePaused = true;

        this.btnX      = 0;
        this.btnW      = 0;
        this.btnH      = 0;
        this.continueY = 0;
        this.restartY  = 0;

        this.hoverBtn   = null;
        this.pressedBtn = null;

        this._onMouseMove = this.mouseMovementLogic.bind(this);
        this._onMouseDown = this.mouseDown.bind(this);
        this._onMouseUp   = this.mouseUp.bind(this);

        const canvas = this.game.ctx ? this.game.ctx.canvas : document.querySelector('canvas');
        if (canvas) {
            canvas.addEventListener('mousemove', this._onMouseMove);
            canvas.addEventListener('mousedown', this._onMouseDown);
            canvas.addEventListener('mouseup',   this._onMouseUp);
        }
        this._canvas = canvas;
    }

    theBtn(mx, my, btnY) {
        return mx >= this.btnX && mx <= this.btnX + this.btnW &&
               my >= btnY      && my <= btnY + this.btnH;
    }

    canvasPosition(e) {
        if (!this._canvas) {
            return { x: e.clientX, y: e.clientY };
        }
        const r = this._canvas.getBoundingClientRect();
        return {
            x: (e.clientX - r.left) * (this._canvas.width  / r.width),
            y: (e.clientY - r.top)  * (this._canvas.height / r.height),
        };
    }

mouseMovementLogic(e) {
    if (this.game.endingActive) return;
    const { x, y } = this.canvasPosition(e);
    if (this.theBtn(x, y, this.continueY))      this.hoverBtn = 'continue';
    else if (this.theBtn(x, y, this.restartY))  this.hoverBtn = 'restart';
    else this.hoverBtn = null;
}

mouseDown(e) {
    const { x, y } = this.canvasPosition(e);
    if (this.theBtn(x, y, this.continueY))      this.pressedBtn = 'continue';
    else if (this.theBtn(x, y, this.restartY))  this.pressedBtn = 'restart';
}

mouseUp(e) {
    const { x, y } = this.canvasPosition(e);
    const wasPressed = this.pressedBtn;
    this.pressedBtn = null;
    if (wasPressed === 'continue' && this.theBtn(x, y, this.continueY)) {
        this.cleanUp(); this.removeFromWorld = true;
        if (this.onContinue) this.onContinue();
    } else if (wasPressed === 'restart' && this.theBtn(x, y, this.restartY)) {
        this.cleanUp(); this.removeFromWorld = true;
        if (this.onRestart) this.onRestart();
    }
}

    cleanUp() {
        if (this._canvas) {
            this._canvas.removeEventListener('mousemove', this._onMouseMove);
            this._canvas.removeEventListener('mousedown', this._onMouseDown);
            this._canvas.removeEventListener('mouseup',   this._onMouseUp);
        }
    }

    update() {}

    draw(ctx) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        const W = ctx.canvas.width;
        const H = ctx.canvas.height;

        // Pause Layout Setup
        const pw = Math.round(W * 0.30);   // panel width
        const ph = Math.round(H * 0.44);   // panel height
        const px = Math.round((W - pw) / 2);
        const py = Math.round((H - ph) / 2);

        const border  = Math.round(pw * 0.06);
        const btnW    = Math.round(pw * 0.78);
        const btnH    = Math.round(H  * 0.11);
        const btnX    = px + Math.round((pw - btnW) / 2);

        // Sign above panel 
        const tabW    = Math.round(pw * 0.44);
        const tabH    = Math.round(H  * 0.055);
        const tabX    = px + Math.round((pw - tabW) / 2);
        const tabY    = py - tabH + 4;

        // Button Position setting
        const parchTop = py + border;
        const parchH = ph - border * 2;
        const gap = Math.round(H * 0.018);
        const totalBtn = btnH * 2 + gap;
        const btnStartY = parchTop + Math.round((parchH - totalBtn) / 2);

        // Button 
        this.btnX = btnX;
        this.btnW = btnW;
        this.btnH = btnH;
        this.continueY = btnStartY;
        this.restartY  = btnStartY + btnH + gap;

        // An dim background
        ctx.fillStyle = 'rgba(0,0,0,0.62)';
        ctx.fillRect(0, 0, W, H);

        // Drawing all the components 

        // the tab
        this.drawingTabs(ctx, tabX, tabY, tabW, tabH, H);

        // The main anel
        this.drawingPanels(ctx, px, py, pw, ph, border);

        // The buttons
        this.drawingButton(ctx, 'CONTINUE', btnX, this.continueY, btnW, btnH, H,
                         this.hoverBtn === 'continue', this.pressedBtn === 'continue');
        this.drawingButton(ctx, 'RESTART',  btnX, this.restartY,  btnW, btnH, H,
                         this.hoverBtn === 'restart',  this.pressedBtn === 'restart');

        ctx.restore();
    }

    // The Tab labels 
    drawingTabs(ctx, x, y, w, h, H) {
        const wood = '#6b4423';

        // Wood details 
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        this.drawingRectangle(ctx, x + 3, y + 4, w, h);
        ctx.fillStyle = wood;
        this.drawingRectangle(ctx, x, y, w, h);
        ctx.fillStyle = 'rgba(255,210,140,0.18)';
        this.drawingRectangle(ctx, x + 2, y + 2, w - 4, 2);
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        this.drawingRectangle(ctx, x + 2, y + h - 2, w - 4, 2);

        // Nail dots 
        this.nailsOnPanel(ctx, x + 8, y + h / 2);
        this.nailsOnPanel(ctx, x + w - 8, y + h / 2);

        // Text
        const fs = Math.round(H * 0.032);
        ctx.font = `bold ${fs}px Georgia, serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.letterSpacing = '4px';

        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillText('PAUSE', x + w / 2 + 1, y + h / 2 + 1);

        // Gold text
        const tg = ctx.createLinearGradient(x, y, x, y + h);
        tg.addColorStop(0,   '#ffe090');
        tg.addColorStop(0.5, '#c8860a');
        tg.addColorStop(1,   '#f0c050');
        ctx.fillStyle = tg;
        ctx.fillText('PAUSE', x + w / 2, y + h / 2);
    }

    // The wood panel and parchment 
    drawingPanels(ctx, x, y, w, h, border) {
        const wood = '#6b4423';   

        // Wood Details 
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        this.drawingRectangle(ctx, x + 5, y + 6, w, h);
        ctx.fillStyle = wood;
        this.drawingRectangle(ctx, x, y, w, h);

        // Wood grains 
        ctx.strokeStyle = 'rgba(0,0,0,0.12)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            const gy = y + border + i * ((h - border * 2) / 5);
            ctx.beginPath();
            ctx.moveTo(x + border, gy);
            ctx.lineTo(x + w - border, gy + (i % 2 === 0 ? 2 : -1));
            ctx.stroke();
        }

        // Plank divider
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1.5;
        const thirdH = h / 3;
        for (let p = 1; p < 3; p++) {
            const ly = y + p * thirdH;
            ctx.beginPath(); ctx.moveTo(x + 2, ly); ctx.lineTo(x + border - 2, ly); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x + w - border + 2, ly); ctx.lineTo(x + w - 2, ly); ctx.stroke();
        }

        // Inside Panel
        ctx.strokeStyle = 'rgba(255,190,80,0.22)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x + border - 3, y + border - 3, w - (border - 3) * 2, h - (border - 3) * 2);
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + border - 2, y + border - 2, w - (border - 2) * 2, h - (border - 2) * 2);

        // Corner nails
        const no = Math.round(border * 0.7);
        [[x + no, y + no], [x + w - no - 5, y + no],
         [x + no, y + h - no - 5], [x + w - no - 5, y + h - no - 5]]
            .forEach(([nx, ny]) => this.nailsOnPanel(ctx, nx, ny));

        // The parchment 
        const pi = border;
        const parchX = x + pi, parchY = y + pi;
        const parchW = w - pi * 2, parchH = h - pi * 2;

        // Parcmeent base
        const pg = ctx.createLinearGradient(parchX, parchY, parchX, parchY + parchH);
        pg.addColorStop(0,   '#e8d9a8');
        pg.addColorStop(0.5, '#ddd09e');
        pg.addColorStop(1,   '#cfc292');
        ctx.fillStyle = pg;
        this.drawingRectangle(ctx, parchX, parchY, parchW, parchH);

        // Parchment details
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        this.drawingRectangle(ctx, parchX, parchY, parchW, 3);
        this.drawingRectangle(ctx, parchX, parchY, 3, parchH);
        this.drawingRectangle(ctx, parchX, parchY + parchH - 3, parchW, 3);
        this.drawingRectangle(ctx, parchX + parchW - 3, parchY, 3, parchH);
        ctx.fillStyle = 'rgba(255,248,220,0.28)';
        this.drawingRectangle(ctx, parchX + 10, parchY + 10, parchW - 20, parchH - 20);
    }

    // Button
    drawingButton(ctx, label, x, y, w, h, H, hover, pressed) {
        const offsetY = pressed ? 2 : 0;

        // Shadow
        if (!pressed) {
            ctx.fillStyle = 'rgba(0,0,0,0.28)';
            this.drawingRectangle(ctx, x + 2, y + 3, w, h);
        }

        // Face
        const bg = ctx.createLinearGradient(x, y + offsetY, x, y + offsetY + h);
        if (pressed) {
            bg.addColorStop(0, '#c8ae6a');
            bg.addColorStop(1, '#b89a50');
        } else if (hover) {
            bg.addColorStop(0, '#f5e8a8');
            bg.addColorStop(1, '#e0cc80');
        } else {
            bg.addColorStop(0, '#e8d890');
            bg.addColorStop(1, '#d4bf70');
        }

        // Extra details highlights
        ctx.fillStyle = bg;
        this.drawingRectangle(ctx, x, y + offsetY, w, h);
        ctx.fillStyle = pressed ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,200,0.55)';
        this.drawingRectangle(ctx, x + 2, y + offsetY + 2, w - 4, 2);
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        this.drawingRectangle(ctx, x + 2, y + offsetY + h - 3, w - 4, 2);

        // Border
        ctx.strokeStyle = hover ? '#9a7030' : '#7a5520';
        ctx.lineWidth = pressed ? 1 : 1.5;
        ctx.strokeRect(x + 0.5, y + offsetY + 0.5, w - 1, h - 1);

        // Small nails
        this.nailsOnPanel(ctx, x + 7, y + offsetY + h / 2);
        this.nailsOnPanel(ctx, x + w - 7, y + offsetY + h / 2);

        // Text 
        const fs = Math.round(H * 0.038);
        ctx.font = `bold ${fs}px Georgia, serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.letterSpacing = '3px';

        // Carved shadow
        ctx.fillStyle = 'rgba(60,30,0,0.35)';
        ctx.fillText(label, x + w / 2 + 1, y + offsetY + h / 2 + 1);

        // Main carved text
        const tg = ctx.createLinearGradient(x, y + offsetY, x, y + offsetY + h);
        tg.addColorStop(0,   '#6b3a0a');
        tg.addColorStop(0.5, '#4a2508');
        tg.addColorStop(1,   '#7a4810');
        ctx.fillStyle = tg;
        ctx.fillText(label, x + w / 2, y + offsetY + h / 2);
    }

    nailsOnPanel(ctx, x, y) {
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath(); ctx.arc(x + 0.5, y + 0.5, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#8a6830';
        ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,220,120,0.5)';
        ctx.beginPath(); ctx.arc(x - 1, y - 1, 1.5, 0, Math.PI * 2); ctx.fill();
    }

    drawingRectangle(ctx, x, y, w, h) {
        ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
    }
}