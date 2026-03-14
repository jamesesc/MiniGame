class Ground {
    groundSprite = { x: 0, y: 8, w: 72, h: 72, s: 8 };

    constructor(game) {
        this.game = game;
        this.groundSpriteAsset = ASSET_MANAGER.getAsset("./Assets/Ground/Ground-1.png");
        this.groundY = 1130;
        this.height = this.groundSprite.h * this.groundSprite.s;
        this.width = 100000;

        // Initialize BB immediately so other entities can use it right away
        this.BB = new BoundingBox(0, this.groundY, this.width, this.height);
    }

    update() {
        this.BB = new BoundingBox(0, this.groundY, this.width, this.height);
    }

    draw(ctx) {
        if (!this.groundSpriteAsset) return;

        const tileWidth = this.groundSprite.w * this.groundSprite.s;
        const tileHeight = this.groundSprite.h * this.groundSprite.s;
        const overlapAmount = 9 * this.groundSprite.s;
        const effectiveWidth = tileWidth - overlapAmount;

        const camera = this.game.camera || { x: 0, y: 0 };
        const camX = camera.x;

        const startTile = Math.floor(camX / effectiveWidth) - 1;
        const tilesNeeded = Math.ceil(ctx.canvas.width / effectiveWidth) + 2;

        for (let i = startTile; i < startTile + tilesNeeded; i++) {
            ctx.drawImage(
                this.groundSpriteAsset,
                this.groundSprite.x, this.groundSprite.y,
                this.groundSprite.w, this.groundSprite.h,
                i * effectiveWidth, this.groundY,
                tileWidth, tileHeight
            );
        }

        if (this.game.options.debugging && this.BB) {
            ctx.strokeStyle = "Blue";
            ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);
        }
    }
}