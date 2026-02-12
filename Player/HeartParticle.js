class HeartParticle {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.alpha = 1.0;
        this.velX = (Math.random() - 0.5) * 80; // Drift left/right
        this.velY = -120 - Math.random() * 50;  // Float up
    }

    update() {
        this.x += this.velX * this.game.clockTick;
        this.y += this.velY * this.game.clockTick;
        this.alpha -= this.game.clockTick * 0.8; // Fades out over ~1.2 seconds
        if (this.alpha <= 0) this.removeFromWorld = true;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.font = "30px Arial";
        // Use a heart emoji or a small pixelated heart
        ctx.fillText("❤️", this.x - this.game.camera.x, this.y - this.game.camera.y);
        ctx.restore();
    }
}