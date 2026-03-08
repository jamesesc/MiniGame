/**
 * Represents the Cake item in the game. 
 */
class CakeItem {

    /** Cake Sprite Format Setting */
    static spriteConfig = {
        scale: 2,
        width: 100,
        height: 100
    };

    /** Floating animation configuration */
    static bobConfig = {
        speed: 3,
        amplitude: 5
    };

    /** List of all available cake types for random selection */
    static cakeTypes = [
        'blackforest', 'blueberrycheesecake', 'carrotcake', 'cherry',
        'Chocolatecake', 'funcake', 'honey', 'icecreamcake', 'kiwi', 'LemonCake',
        'pistachiocake', 'redvelvet', 'strawberrycake', 'cakeyy',
        'upsidedown', 'vanilacake'
    ];

    /**
     * Constructor for the Cake item class. 
     * 
     * @param {*} game is the game engine using. 
     * @param {*} x is the x position in the world coordiantes.  
     * @param {*} y is the y position in the world coordiantes. 
     * @param {*} cakeType optional specific type; if omitted, a random one is chosen.
     */
    constructor(game, x, y, cakeType) {
        // Initialzing our paramaters 
        this.game = game;

        // Assigning our Sprite Config to the object
        const cfg = CakeItem.spriteConfig;
        this.scale = cfg.scale;
        this.width = cfg.width;
        this.height = cfg.height;

        this.x = x !== undefined ? x : 1000;
        this.y = y !== undefined ? y : 950;
        this.baseY = this.y;

        // Cake Status
        this.nearOtter = false;
        this.collected = false;

        // Pick a random cake type and format its display name
        const types = CakeItem.cakeTypes;
        this.cakeType = cakeType ?? types[Math.floor(Math.random() * types.length)];
        
        // Convert camelCase or lowercase strings into readable Title Case (e.g., "redVelvet" -> "Red Velvet")
        this.cakeName = this.cakeType
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
            .toLowerCase()
            .replace(/\b\w/g, c => c.toUpperCase());

        // Setting up animation and BB
        this.spritesheet = ASSET_MANAGER.getAsset(`./Assets/Items/Cakes/${this.cakeType}.png`);
        this.animation = new AnimatorFromOneImage(
            this.spritesheet, 
            0, 0, 
            this.width, this.height, 
            1, .5, 0
        );
        this.animation.scale = this.scale;

        this.updateBB();
    }

    /**
     * Handles the logic of updating the cake itself
     */
    update() {
        // If collected, stop updating logic (entity removed by engine)
        if (this.collected) return;

        // Apply floating motion relative to base position
        const bob = CakeItem.bobConfig;
        this.y = this.baseY + Math.sin(this.game.timer.gameTime * bob.speed) * bob.amplitude;
        
        this.updateBB();

        // Interaction Logic 
        const otter = this.game.camera?.otter;
        if (otter && otter.BB && this.BB && otter.BB.collide(this.BB)) {
            this.nearOtter = true;
            
            // Check Input
            if (this.game.keys["KeyQ"]) {
                this.collected = true;
                otter.activateCakePower();
                this.removeFromWorld = true;
            }
        } else {
            this.nearOtter = false;
        }
    }

    /**
     * Represents the drawing of the Cake Item. 
     * @param {*} ctx is the canvas. 
     */
    draw(ctx) {
        // Checking if such sprite image has loaded
        if (this.spritesheet) {
            this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
        }

        // Draw notification when otter is nearby
        if (this.nearOtter) {
            ctx.save();
            ctx.imageSmoothingEnabled = true;  
            
            // Common settings for both lines of text
            ctx.strokeStyle = "black";
            ctx.lineWidth = 4;
            ctx.textAlign = "center";

            // Calculate center based on the collision box for perfect alignment
            const promptX = this.BB.x + this.BB.width / 2;
            const basePromptY = this.BB.y - 15; 

            // Line 1: "[Q] Pick up"
            ctx.font = "bold 40px Arial";
            ctx.fillStyle = "white";
            ctx.strokeText("[Q] Pick up", promptX, basePromptY);
            ctx.fillText("[Q] Pick up", promptX, basePromptY);
            
            // Line 2: Cake Name
            ctx.font = "bold 30px Arial";
            
            // Position the name below the prompt
            const nameY = basePromptY + 105; 
            
            ctx.strokeText(this.cakeName, promptX, nameY);
            ctx.fillText(this.cakeName, promptX, nameY);
            
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
     * Handles the bound box for the cake
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