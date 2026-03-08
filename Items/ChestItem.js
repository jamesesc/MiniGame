/**
 * Represents the Chest item in the game. 
 */
class ChestItem {

    /** Chest Sprite Format Setting */
    static spriteConfig = {
        scale: 15,
        width: 32,
        height: 32
    };

    /** List of possible loot */
    static lootTable = ["heart", "cake"];

    /** Particle burst config — tweak these to taste */
    static particleConfig = {
        count: 50,
        speed: 6,
        gravity: 0.25,
        lifetime: 45,
        size: 12,
        colors: ["#f7c948", "#e8503a", "#5fcf65", "#4db8e8", "#ffffff", "#f4a259"]
    };


    /**
     * Constructor for the Chest item class. 
     * 
     * @param {*} game is the game engine using. 
     * @param {*} x is the x position in the world coordiantes.  
     * @param {*} y is the y position in the world coordiantes. 
     */
    constructor(game, x, y) {
        // Initialzing our paramaters 
        this.game = game;
        this.x = x !== undefined ? x : 1200;
        this.y = y !== undefined ? y : 950;

        // Assigning our Sprite Config to the object
        const cfg = ChestItem.spriteConfig;
        this.scale = cfg.scale;
        this.width = cfg.width;
        this.height = cfg.height;
        
        // Chest Status
        this.isOpen = false;
        this.animFinished = false;
        this.particles = [];

        // Setting up animation and BB
        this.setChestAnimation();
        this.updateBB();
    }

    /**
     * Handles in setting up all the animation for the chest
     */
    setChestAnimation() {
        this.spritesheet = ASSET_MANAGER.getAsset("./Assets/Items/TreasureChest.png");
        this.animationClosed = new AnimatorFromOneImage(this.spritesheet, 1, 5, 36, 18, 4, .3, 0, true);
        this.animationOpen = new AnimatorFromOneImage(this.spritesheet, 145, 2, 36, 21, 4, .09, 0, false);
        this.animationClosed.scale = this.scale;
        this.animationOpen.scale = this.scale;
    }

    /**
     * Hanldes the logic for the open of the chest
     */
    open() {
        // If not open, then do nothing
        if (!this.isOpen) {
            // Setting the open animation setting
            this.isOpen = true;
            this.animationOpen.elapsedTime = 0;

            // Finding the center of the chest
            const centerX = this.BB.x + this.BB.width / 2;
            const centerY = this.BB.y;

            // Randomly drawing which types of loot and then adding it
            const types = ChestItem.lootTable;
            const type = types[Math.floor(Math.random() * types.length)];
            
            try {
                this.game.addEntity(new ChestDrop(this.game, centerX, centerY, type));
            } catch (e) {
                console.warn("ChestItem: failed to spawn loot —", e);
            }

            // Changing the spawn location of the particles
            const offsetX = 0; 
            const offsetY = 120; 
            const finalX = centerX + offsetX;
            const finalY = centerY + offsetY;

            // Spawn confetti burst
            this.spawningParticles(finalX, finalY);
            
            // Rebuild BB once (no need for the closed variant anymore)
            this.updateBB();
        }
    }

    /**
     * Method to spawn the particles when opening the chest. 
     * @param {*} cx is the center x of the chest. 
     * @param {*} cy is the center y of the chest. 
     */
    spawningParticles(cx, cy) {
        const cfg = ChestItem.particleConfig;

        for (let i = 0; i < cfg.count; i++) {
            const angle = (Math.PI * 2 * i) / cfg.count + (Math.random() - 0.5) * 0.6;
            const spd = cfg.speed * (0.4 + Math.random() * 0.6);

            this.particles.push({
                x: cx, y: cy,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd - cfg.speed * 0.5,
                life: cfg.lifetime,
                maxLife: cfg.lifetime,
                color: cfg.colors[Math.floor(Math.random() * cfg.colors.length)],
                size: cfg.size * (0.7 + Math.random() * 0.6)
            });
        }
    }

    /**
     * Handles in updating the particles movment. 
     */
    updateParticles() {
        const gravity = 0.25;
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += gravity;
            p.vx *= 0.97;
            p.life--;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    /**
     * Helper method to draw the particles.
     * 
     * @param {*} ctx is the canvas.
     * @returns only if the partiles length is 0.  
     */
    drawParticles(ctx) {
        if (this.particles.length === 0) return;
        for (const p of this.particles) {
            ctx.globalAlpha = p.life / p.maxLife;
            ctx.fillStyle = p.color;
            ctx.fillRect(
                Math.round(p.x - p.size / 2),
                Math.round(p.y - p.size / 2),
                Math.round(p.size),
                Math.round(p.size)
            );
        }
        ctx.globalAlpha = 1;
    }

    /**
     * Handles the logic of updating the chest iteslf
     */
    update() {
        // Checking if the chest is ever open
        if (!this.isOpen) {            
            //  Interaction Logic 
            const otter = this.game.camera?.otter;
            if (otter && otter.BB && this.BB && otter.BB.collide(this.BB)) {
                // Check if otter is doing the specific action needed to open chest
                if (otter.action === "spin") {
                    this.open();
                }
            }
        } else {
            // Advance particles every tick
            if (this.particles.length > 0) {
                this.updateParticles();
            }

            // Detect when the open animation finishes
            if (!this.animFinished) {
                const anim = this.animationOpen;
                const totalFrames = anim.frameCount ?? 4;
                const frameDur = anim.frameDuration ?? .09;
                if (anim.elapsedTime >= totalFrames * frameDur) {
                    this.animFinished = true;
                }
            }
        }
        
        // BB only needs an update on the frame we open
        if (!this.isOpen) this.updateBB();
    }

    /**
     * Represents the drawing of the Chest Item. 
     * @param {*} ctx is the canvas. 
     */
    draw(ctx) {
        // Checking if such sprite imag has loaded, and choosing what animation base on that
        if (this.spritesheet) {
            if (this.isOpen) {
                if (!this.animFinished) {
                    this.animationOpen.drawFrame(this.game.clockTick, ctx, this.x, this.y);
                } else {
                    this.animationOpen.drawFrame(0, ctx, this.x, this.y);
                }
            } else {
                this.animationClosed.drawFrame(this.game.clockTick, ctx, this.x, this.y);
            }
        }

        // Draw particles on top
        this.drawParticles(ctx);

        // For debugging purpose only 
        if (this.BB && this.game.options.debugging) {
            ctx.strokeStyle = this.isOpen ? "#00ff88" : "Orange";
            ctx.lineWidth = 4;
            ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);
        }
    }

    /**
     * Handles the bound box for the chest, base on its state
     */
    updateBB() {
        this.lastBB = this.BB;

        if (this.isOpen) {
            // No hitbox at all once chest is open
            this.BB = null; 
        } else {
            // Standard closed hitbox
            this.BB = new BoundingBox(
                this.x + 65,
                this.y,
                this.width * this.scale - 180,
                this.height * this.scale - 10
            );
        }
    }
}