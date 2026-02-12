class DeathFragment {
    constructor(game, x, y, size, sprite, sx, sy, sw, sh) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.size = size;
        this.sprite = sprite;
        this.sx = sx;
        this.sy = sy;
        this.sw = sw;
        this.sh = sh;

        this.velocity = {
            x: (Math.random() - 0.5) * 100,
            y: (Math.random() - 1.5) * 150 
        };
        
        this.alpha = 1.0;
        this.lifeTime = 1.2 + Math.random(); 
    }

    update() {
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
        
        this.velocity.y -= 20 * this.game.clockTick;
        this.alpha -= (1 / this.lifeTime) * this.game.clockTick;
    }

    draw(ctx) {
        if (this.alpha <= 0 || !this.sprite) return;
        
        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        ctx.shadowBlur = 5;
        ctx.shadowColor = "orange";

        ctx.drawImage(
            this.sprite,
            this.sx, this.sy, this.sw, this.sh,
            this.x, this.y, this.size, this.size
        );
        
        ctx.restore();
    }
}