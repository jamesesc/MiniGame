export class House {
    constructor(game, x, y, imagePath, scale = 1) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.imagePath = imagePath;
        this.scale = scale;
        this.image = null;
        this.removeFromWorld = false;

        // Load the image
        const img = new Image();
        img.src = imagePath;
        img.onload = () => {
            this.image = img;
        };
    }

    update() {
        
    }

    draw(ctx) {
        if (!this.image) return;

         ctx.drawImage(
        this.image,
        this.x,
        this.y,
        this.image.width * this.scale,
        this.image.height * this.scale
    );
    }
}