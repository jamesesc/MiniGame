export class Decoration {
    constructor(game, spriteSheet, sx, sy, sw, sh, x, y, scale = 1) {
        this.game = game;
        this.removeFromWorld = false;

        this.image = new Image();
        this.image.src = spriteSheet;

        this.sx = sx;
        this.sy = sy;
        this.sw = sw;
        this.sh = sh;

        this.x = x;
        this.y = y;
        this.scale = scale;
        this.depth = 0;
    }

    update() {}

    draw(ctx) {
        ctx.drawImage(
            this.image,
            this.sx, this.sy, this.sw, this.sh,
            this.x, this.y, this.sw * this.scale, this.sh * this.scale
        );
    }
}