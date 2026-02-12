class Otter {
    constructor(game) {
        this.game = game;
        this.x = 500;
        this.y = 680;
        this.w = 600; 
        this.h = 600;

        this.faceDirection = "Right";
        this.action = "idle"; 

        this.maxHealth = 100;
        this.health = 100; 
        this.damageCooldown = 0; 

        this.animations = {}; 
        this.createAnimations();

        this.updateBB();

        this.dead = false;
        this.fragments = [];

        this.maxStamina = 100;
        this.stamina = 100;
        this.staminaDrain = 30; 
        this.staminaRegen = 20; 
        this.staminaSpinCost = 30;

        this.moveHoldTimer = 0;
    }

    loadSequence(path, prefix, count) {
        let frames = [];
        for (let i = 1; i <= count; i++) {
            let fileName = `${path}${prefix}${i}.png`;
            let asset = ASSET_MANAGER.getAsset(fileName);
            if (!asset) console.log("ERROR: Otter.js wanted to find: " + fileName);
            frames.push(asset);
        }
        return frames;
    }

    createAnimations() {
        const basePath = "./Assets/Otter/";
        const states = [
            { name: "idle", count: 4 },
            { name: "run", count: 3 },
            { name: "sleep", count: 6},
            { name: "spin", count: 3}
        ];

        states.forEach(state => {
            let folder = state.name.charAt(0).toUpperCase() + state.name.slice(1);
            let prefix = `otter_${state.name}_`; 
            let path = `${basePath}${folder}/`;
            this.animations[state.name] = new AnimatorFromMultipleImages(this.loadSequence(path, prefix, state.count), 0.15);
        });
    }

    update() {
        if (this.dead) {
            this.fragments.forEach(f => f.update());
            this.fragments = this.fragments.filter(f => f.alpha > 0);
            return; 
        }

        if (this.damageCooldown > 0) {
            this.damageCooldown -= this.game.clockTick;
        }

        this.action = "idle";
        const WALK_SPEED = 150;
        const RUN_SPEED = 3000;
        const HOLD_THRESHOLD = 0.15; 

        const isA = this.game.keys["a"];
        const isD = this.game.keys["d"];
        const isHoldingShift = this.game.keys["Shift"];
        const isPressingSpin = this.game.keys["e"];

        if (isA) this.faceDirection = "Left";
        if (isD) this.faceDirection = "Right";

        if (isA || isD) {
            this.moveHoldTimer += this.game.clockTick;
        } else {
            this.moveHoldTimer = 0; 
        }

        const isHoldingMove = this.moveHoldTimer > HOLD_THRESHOLD;

        const isSpinning = isPressingSpin && this.stamina > 0;
        const isRunning = isHoldingMove && isHoldingShift && this.stamina > 0 && !isSpinning;

        if (isSpinning) {
            this.stamina -= this.staminaSpinCost * this.game.clockTick;
        } else if (isRunning) {
            this.stamina -= this.staminaDrain * this.game.clockTick;
        } else {
            if (this.stamina <= 0 && (isHoldingShift || isPressingSpin)) {

            } else {
                this.stamina += this.staminaRegen * this.game.clockTick;
            }
        }

        if (this.stamina < 0) this.stamina = 0;
        if (this.stamina > this.maxStamina) this.stamina = this.maxStamina;

        
        if (this.game.keys["e"]) {
            this.action = "spin";
        } else if (this.game.keys["s"]) {
            this.faceDirection = "Right";
            this.action = "sleep";
        } else if (isA) {
            if (isHoldingMove) {
                this.action = "run";
                this.x -= (isRunning ? RUN_SPEED : WALK_SPEED) * this.game.clockTick;
            }
        } else if (isD) {
            if (isHoldingMove) {
                this.action = "run";
                this.x += (isRunning ? RUN_SPEED : WALK_SPEED) * this.game.clockTick;
            }
        } 
        
        this.updateBB();
    }

    draw(ctx) {
        if (this.dead) {
            this.fragments.forEach(f => f.draw(ctx));
            return;
        }

        let currentAnim = this.animations[this.action] || this.animations["idle"];

        const { xOffset, width } = this.getBBData();
        const pivotX = xOffset + (width / 2);
        
         if (this.faceDirection === "Right") {
            currentAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y);
        } else {
            ctx.save();
            // 1. Move to the horizontal center of the otter's body
            ctx.translate(this.x + pivotX, this.y); 
            // 2. Flip only the X axis
            ctx.scale(-1, 1);
            // 3. Draw relative to that center point
            currentAnim.drawFrame(this.game.clockTick, ctx, -pivotX, 0);
            ctx.restore();
        }

        if (this.game.options.debugging) {
            ctx.strokeStyle = "Red";
            ctx.lineWidth = 5;
            ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);
        }
    }

    updateBB() {
        const { width, height, xOffset, yOffset } = this.getBBData();
        this.BB = new BoundingBox(this.x + xOffset, this.y + yOffset, width, height);
    }

    takeDamage(amount) {
        if (this.dead) return; 

        if (this.damageCooldown <= 0 && this.health > 0) {
            this.health -= amount;
            this.damageCooldown = 0.5; 
            console.log("Otter took damage! Health: " + this.health);
            
            if (this.health <= 0) {
                this.health = 0;
                this.die(); // This triggers the fragments
            }
        }
    }

    die() {
        this.dead = true;
        this.createDissolveEffect();
        console.log("Otter Dissolving!");
    }

    createDissolveEffect() {
        let currentAnim = this.animations[this.action] || this.animations["idle"];
        
        let frameArray = currentAnim.imageArray;

        if (!frameArray || frameArray.length === 0) {
            console.error("Could not find imageArray in Animator!");
            return;
        }

        let frameIndex = Math.floor(currentAnim.elapsedTime / currentAnim.frameDuration) % frameArray.length;
        let sprite = frameArray[frameIndex];

        const scale = currentAnim.scale || 3;
        const fragmentSize = 8; 

        for (let i = 0; i < sprite.width; i += fragmentSize) {
            for (let j = 0; j < sprite.height; j += fragmentSize) {
                
                this.fragments.push(new DeathFragment(
                    this.game,
                    this.x + (i * scale), 
                    this.y + (j * scale), 
                    fragmentSize * scale,
                    sprite,
                    i, j, 
                    fragmentSize, fragmentSize
                ));
            }
        }
    }

     getBBData() {
        let width, height, xOffset, yOffset;
        if (this.action === "spin") {
            width = 500; height = 60; xOffset = 60; yOffset = 400; 
        } else if (this.action === "run") {
            width = 500; height = 60; xOffset = 60; yOffset = 400; 
        } else if (this.action === "sleep") { 
            width = 315; height = 60; xOffset = 130; yOffset = 400;         
        } else {
            width = 100; height = 250; xOffset = 305; yOffset = 235;
        }
        return { width, height, xOffset, yOffset };
    }
}