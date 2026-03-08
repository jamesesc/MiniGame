/**
 * Represents the Heart item in the game. 
 */
class HeartItem {

    /** Heart Sprite Format Setting */
    static spriteConfig = {
        scale: 6,
        width: 19,
        height: 19
    };

    /** Healing and effect configuration */
    static healConfig = {
        amount: 20,
        maxHealth: 120,
        particleCount: 5,
        bobSpeed: 5,
        bobAmplitude: 0.9
    };

    /**
     * Constructor for the Heart item class. 
     * 
     * @param {*} game is the game engine using. 
     * @param {*} x is the x position in the world coordiantes.  
     * @param {*} y is the y position in the world coordiantes. 
     */
    constructor(game, x, y) {
        // Initialzing our paramaters 
        this.game = game;

        // Assigning our Sprite Config to the object
        const cfg = HeartItem.spriteConfig;
        this.scale = cfg.scale;
        this.width = cfg.width;
        this.height = cfg.height;

        this.x = x !== undefined ? x : 1200;
        this.y = y !== undefined ? y : 950;
        this.baseY = this.y;

        // Heart Status
        this.nearOtter = false;
        this.collected = false;

        // Setting up animation and BB
        this.spritesheet = ASSET_MANAGER.getAsset("./Assets/Items/Hearts.png");
        this.animation = new AnimatorFromOneImage(this.spritesheet, 102, 0, this.width, this.height, 5, .2, 5);
        this.animation.scale = this.scale;

        this.updateBB();
    }

    /**
     * Handles the logic of updating the heart itself
     */
    update() {
        // If collected, stop updating logic (entity removed by engine)
        if (this.collected) return;

        // Apply bobbing motion
        const cfg = HeartItem.healConfig;
        this.y = this.baseY + Math.sin(this.game.timer.gameTime * cfg.bobSpeed) * cfg.bobAmplitude;
        
        this.updateBB();

        // Interaction Logic 
        const otter = this.game.camera?.otter;
        if (otter && otter.BB && this.BB && otter.BB.collide(this.BB)) {
            this.nearOtter = true;
            
            // Check if player presses Q to collect
            if (this.game.keys["KeyQ"]) {
                this.collected = true;

                // Heal Otter
                if (otter.health < cfg.maxHealth) {
                    otter.health = Math.min(cfg.maxHealth, otter.health + cfg.amount);
                }
                otter.healFlash = 0.7;

                // Spawn Particles
                for (let i = 0; i < cfg.particleCount; i++) {
                    this.game.addEntity(new HeartParticle(
                        this.game,
                        otter.BB.x + otter.BB.width / 2,
                        otter.BB.y
                    ));
                }

                this.removeFromWorld = true;
            }
        } else {
            this.nearOtter = false;
        }
    }

    /**
     * Represents the drawing of the Heart Item. 
     * @param {*} ctx is the canvas. 
     */
    draw(ctx) {
        // Checking if such sprite image has loaded
        if (this.spritesheet) {
            this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
        }

        // Draw prompt when otter is nearby
        if (this.nearOtter) {
            ctx.save();
            ctx.font = "bold 40px Arial";
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 4;
            ctx.textAlign = "center";
            
            const promptX = this.x + (this.width * this.scale) / 2;
            const promptY = this.y - 15;
            
            ctx.strokeText("[Q] Pick up", promptX, promptY);
            ctx.fillText("[Q] Pick up", promptX, promptY);
            ctx.restore();
        }

        // For debugging purpose only 
        if (this.BB && this.game.options.debugging) {
            ctx.strokeStyle = "Red";
            ctx.lineWidth = 5;
            ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);
        }
    }

    /**
     * Handles the bound box for the heart
     */
    updateBB() {
        this.lastBB = this.BB;
        this.BB = new BoundingBox(
            this.x + 20, 
            this.y + 35, 
            75, 
            45
        );
    }
}