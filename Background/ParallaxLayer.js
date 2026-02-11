/**
 * A class that handles the parallax layer logic and functionality base on the given arguments 
 */
class ParallaxLayer {
    constructor(game, imgPath, speedModifier, yOffset, scale) {
        this.game = game;
        // Setting up the layer base on the given inputs
        this.image = ASSET_MANAGER.getAsset(imgPath);
        this.speedModifier = speedModifier; 
        this.yOffset = yOffset; 
        this.scale = scale || 4; 
        
        // Safety check if image is loaded correctly 
        if (this.image) {
            this.width = this.image.width * this.scale;
            this.height = this.image.height * this.scale;
        }
    }

    update() {
    
    }

    draw(ctx) {
        if (!this.image) return;

        ctx.save();
        
        // Converting camera base on the realtive to the camera and not the world
        let camX = this.game.camera ? this.game.camera.x : 0;
        let camY = this.game.camera ? this.game.camera.y : 0;
        ctx.translate(camX, camY);

        // Calculating the camera speed 
        let xPosition = -camX * this.speedModifier;

        // Calculting the left edgge 
        let startX = xPosition % this.width;
        
        // Add on to draw slightly to the left of the screen 
        if (startX >= 0) startX -= this.width;

        // Continue filling the screen with images that fits in the view
        for (let i = startX; i < ctx.canvas.width; i += this.width) {
             ctx.drawImage(this.image, i, this.yOffset, this.width, this.height);
        }

        ctx.restore();
    }
}