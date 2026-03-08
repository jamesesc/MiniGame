/**
 * Ground class represents the ground layer in the game. It handles drawing the ground tiles and updating its bounding box for collision detection.
 */
class Ground {
    // Ground Sprite Tile: X, Y, Width, Height, Scale (s)
    groundSprite = { x: 0, y: 8, w: 72, h: 72, s: 8 }; 

    constructor(game) {
        this.game = game;
        this.groundSpriteAsset = ASSET_MANAGER.getAsset("./Assets/Ground/Ground-1.png");
        this.groundY =  1130;  
        this.height = this.groundSprite.h * this.groundSprite.s;
    }

    update() {
    }

    draw(ctx) {
        // If the ground sprite asset isn't loaded yet, skip drawing (Safety checks)
        if (!this.groundSpriteAsset) {
            return; 
        }
        
        // Various calculation to cover the entire screen with ground tiles, with some overlap to prevent gaps
        const tileWidth = this.groundSprite.w * this.groundSprite.s;
        const tileHeight = this.groundSprite.h * this.groundSprite.s;
        const overlapAmount = 9 * this.groundSprite.s; 
        const effectiveWidth = tileWidth - overlapAmount;
        
        // Handle camera movement by calculating which tiles to draw based on the camera's X position 
        const camera = this.game.camera || { x: 0, y: 0 };
        const camX = camera.x;

        // Calculting the starting tile index and how many tiles are needed to fill the screen, with some extra for smooth scrolling
        const startTile = Math.floor(camX / effectiveWidth) - 1;
        const tilesNeeded = Math.ceil(ctx.canvas.width / effectiveWidth) + 2;

        // Drawing the ground tiles in a loop, starting from the calculated tile index and drawing enough tiles to cover the screen width
        for (let i = startTile; i < startTile + tilesNeeded; i++) {
            ctx.drawImage(
                this.groundSpriteAsset, 
                this.groundSprite.x, 
                this.groundSprite.y,
                this.groundSprite.w, 
                this.groundSprite.h,
                i * effectiveWidth, 
                this.groundY,
                tileWidth, 
                tileHeight
            );
        }
    }
}