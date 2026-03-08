/**
 * Represents the death animation for the Otter death. 
 */
class DeathFragment {
    static config = {
        velocityX: 100,
        velocityY: 150,
        lift: 20,
        minLifetime: 1.2,
        maxLifetime: 2.2
    };

    /**
    * @param {GameEngine} game - The game engine instance
    * @param {number} x - Initial x position of the fragment
    * @param {number} y - Initial y position of the fragment
    * @param {number} size - Size of the fragment
    * @param {Image} sprite - The sprite image for the fragment
    * @param {number} sourceX - Source x position on the sprite sheet
    * @param {number} sourceY - Source y position on the sprite sheet
    * @param {number} sourceW - Source width on the sprite sheet
    * @param {number} sourceH - Source height on the sprite sheet
     */
    constructor(game, x, y, size, sprite, sourceX, sourceY, sourceW, sourceH) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.size = size;
        this.sprite = sprite;
        this.sx = sourceX;
        this.sy = sourceY;
        this.sw = sourceW;
        this.sh = sourceH;

        // Setting the configuration to the animation. 
        const cfg = DeathFragment.config;

        // Initial velocity with a random upward and outward direction
        this.velocity = {
            x: (Math.random() - 0.5) * cfg.velocityX,
            y: (Math.random() - 1.5) * cfg.velocityY
        };

        // Fragments will fade out over time
        this.alpha = 1.0;
        // Randomize lifetime between 1.2 to 2.2 seconds
        this.lifeTime = cfg.minLifetime + Math.random();
    }

    update() {
        const cfg = DeathFragment.config;

        // Move the fragment based on its velocity
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;

        // Apply a simple upward acceleration to simulate a burst effect
        this.velocity.y -= cfg.lift * this.game.clockTick;
        this.alpha -= (1 / this.lifeTime) * this.game.clockTick;
    }

    draw(ctx) {
        // Don't draw if fully transparent or if sprite is missing
        if (this.alpha <= 0 || !this.sprite) {
            return;
        }
        
        ctx.save();
        
        // Set the alpha for fading effect
        ctx.globalAlpha = this.alpha;
        ctx.shadowBlur = 5;
        ctx.shadowColor = "orange";

        // Draw the fragment using the specified portion of the sprite sheet
        ctx.drawImage(
            this.sprite,
            this.sx, this.sy, this.sw, this.sh,
            this.x, this.y, this.size, this.size
        );
        
        ctx.restore();
    }
}