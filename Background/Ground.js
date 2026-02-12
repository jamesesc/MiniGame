/**
 * A class that represents the ground
 */
class Ground {
    constructor(game) {
        this.game = game;
        this.ground = {x: 0, y: 8, w: 72, h: 72};
        this.scale = 8;
        this.x = 0;
        this.y = 1165; 
        this.width = 100000; 
        this.height = this.ground.h * this.scale;
    }

    update() {
        this.BB = new BoundingBox(0, this.y, this.width, this.height);
    }

    draw(ctx) {
        const asset = ASSET_MANAGER.getAsset("./Assets/Ground/Ground-1.png");
        if (!asset) return; // Safety check

        const tileWidth = this.ground.w * this.scale;
        const tileHeight = this.ground.h * this.scale;
        const overlapAmount = 9 * this.scale; 
        const effectiveWidth = tileWidth - overlapAmount;
        const camera = this.game.camera || { x: 0, y: 0 };
        const camX = camera.x;
        
        const startTile = Math.floor(camX / effectiveWidth) - 1;
        const tilesNeeded = Math.ceil(ctx.canvas.width / effectiveWidth) + 2;

        for (let i = startTile; i < startTile + tilesNeeded; i++) {
            ctx.drawImage(
                asset,
                this.ground.x, this.ground.y,
                this.ground.w, this.ground.h,
                i * effectiveWidth, 1130, 
                tileWidth, tileHeight
            );
        }

        if (this.game.options.debugging && this.BB) {
            ctx.strokeStyle = "Blue";
            ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);
        }
    }
}