/**
 * Represents the item dropping from a chest before it lands.
 * Handles physics, trajectory, and spawning the final collectible.
 */
class ChestDrop {

    /**
     * Constructor for the Chest Drop class.
     * 
     * @param {*} game is the game engine using.
     * @param {*} x is the x position to spawn at.
     * @param {*} y is the y position to spawn at.
     * @param {*} type is the type of item ("heart" or "cake").
     */
    constructor(game, x, y, type) {
        // Initialzing our paramaters 
        this.game = game;
        this.type = type;
        this.x = x;
        this.y = y;

        // Find ground reference for collision later
        this.ground = this.game.entities.find(e => e instanceof Ground);

        // Physics variables
        // Hearts throw right, Cakes throw left with random variance
        this.velX = (type === "heart" ? 1 : -1) * (200 + Math.random() * 100);
        this.velY = -(800 + Math.random() * 150); // Initial upward velocity
        this.gravity = 800;
        this.travelTime = 0;
        this.lifetime = 6; // Max time before auto-delete

        // Visual setup based on type
        if (this.type === "heart") {
            this.scale = 6;
            this.width = 19;
            this.height = 19;
            this.spritesheet = ASSET_MANAGER.getAsset("./Assets/Items/Hearts.png");
            this.animation = new AnimatorFromOneImage(this.spritesheet, 102, 0, this.width, this.height, 5, .2, 5, true);
        } else {
            this.scale = 2;
            this.width = 100;
            this.height = 100;
            
            // Pick a random cake type for the drop
            const types = CakeItem.cakeTypes;
            this.cakeType = types[Math.floor(Math.random() * types.length)];
            this.spritesheet = ASSET_MANAGER.getAsset(`./Assets/Items/Cakes/${this.cakeType}.png`);
            this.animation = new AnimatorFromOneImage(this.spritesheet, 0, 0, this.width, this.height, 1, .5, 0, true);
        }
        
        this.animation.scale = this.scale;
    }

    /**
     * Handles the logic of updating the drop physics and landing.
     */
    update() {
        const dt = this.game.clockTick;
        this.travelTime += dt;
        
        // Apply Physics
        this.velY += this.gravity * dt;
        this.x += this.velX * dt;
        this.y += this.velY * dt;
        this.velX *= 0.995; // Air resistance

        // Check for Ground Collision
        const ground = this.game.entities.find(e => e instanceof Ground);
        
        // Define how much empty space is at the bottom of the sprite for precise landing
        const verticalOffset = this.type === "heart" ? 60 : 140;

        // Detect landing: must be falling (velY > 0), past initial delay, and touching ground
        if (this.ground && ground.BB &&
            this.travelTime > 0.3 &&
            this.velY > 0 &&
            this.y + (this.height * this.scale) - verticalOffset >= ground.BB.y) {

            // 1. Calculate the final landing spot
            const finalY = ground.BB.y - (this.height * this.scale) + verticalOffset;
            
            // 2. Spawn the REAL item at this location
            if (this.type === "heart") {
                this.game.addEntity(new HeartItem(this.game, this.x, finalY));
            } else {
                this.game.addEntity(new CakeItem(this.game, this.x, finalY, this.cakeType));
            }

            // 3. Delete this Drop object immediately
            this.removeFromWorld = true; 
        }

        // Safety: remove if it falls forever without hitting ground
        if (this.travelTime >= this.lifetime) { 
            this.removeFromWorld = true; 
        }
    }

    /**
     * Represents the drawing of the falling item.
     * @param {*} ctx is the canvas.
     */
    draw(ctx) {
        // Just draw the falling sprite. No text. No hitboxes.
        if (this.spritesheet) {
            this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
        }
    }
}