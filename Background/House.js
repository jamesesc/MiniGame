export class House {
    constructor(game, x, y, imagePath, scale = 1) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.imagePath = imagePath;
        this.scale = scale;
        this.image = null;
        this.removeFromWorld = false;
        this.BB = null; // set once image loads

        const img = new Image();
        img.src = imagePath;
        img.onload = () => {
            this.image = img;

            const fullWidth = this.image.width * this.scale;
            const fullHeight = this.image.height * this.scale;

            // Just the door: narrow strip in the lower-center of the house
            const doorWidth = fullWidth * 0.25;
            const doorHeight = fullHeight * 0.5;

            this.BB = new BoundingBox(
                this.x + (fullWidth / 2) - (doorWidth / 2), // centered horizontally
                this.y + fullHeight - doorHeight,            // bottom half
                doorWidth,
                doorHeight
            );
        };
    }

    update() {}

    draw(ctx) {
    if (!this.image) return;
    ctx.drawImage(this.image, this.x, this.y,
        this.image.width * this.scale,
        this.image.height * this.scale);

    // Debug: visualize the bounding box
    if (this.game.options.debugging && this.BB) {
        ctx.strokeStyle = 'lime';
        ctx.lineWidth = 3;
        ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);
    }
}
}