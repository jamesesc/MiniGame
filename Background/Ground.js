/**
 * A class that represents the ground
 */
class Ground {
    constructor(game) {
        this.game = game;
        // Getting the specific position the ground is in the image
        this.ground = {x: 0, y: 8, w: 72, h: 72};
        this.scale = 8;
    }

    update() {

    }

    draw(ctx) {
        // Getting the image 
        const asset = ASSET_MANAGER.getAsset("./Assets/Ground/Ground-1.png");
        
        // Getting the ground tile dimesions
        const tileWidth = this.ground.w * this.scale;
        const tileHeight = this.ground.h * this.scale;

        // Overlaping ground tiles logic
        const overlapAmount = 9 * this.scale; 
        const effectiveWidth = tileWidth - overlapAmount;

        // 1. Where is the camera?
        // Use 0 as a fallback if camera doesn't exist yet
        const camX = this.game.camera ? this.game.camera.x : 0;
        
        // Calculating which tile index we should be start drawing from 
        const startTile = Math.floor(camX / effectiveWidth) - 1;

        // Calculating how many tiles we need to filled the whole screen
        const tilesNeeded = Math.ceil(ctx.canvas.width / effectiveWidth) + 2;

        // Drawing only what is needed to display the whole screen
        for (let i = startTile; i < startTile + tilesNeeded; i++) {
            ctx.drawImage(
                asset,
                this.ground.x, this.ground.y, // Source X, Y
                this.ground.w, this.ground.h, // Source W, H
                i * effectiveWidth, 1130,     // Destination X, Y (World Space)
                tileWidth, tileHeight         // Destination W, H
            );
        }
    }
}