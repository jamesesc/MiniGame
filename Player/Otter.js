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

        this.maxStamina = 300;
        this.stamina = 300;
        this.staminaDrain = 30; 
        this.staminaRegen = 20; 
        this.staminaSpinCost = 30;

        this.moveHoldTimer = 0;

        this.velocity = { x: 0, y: 0 };
        this.gravity = 1500;      // How fast the otter falls
        this.jumpStrength = -800; // How high the otter leaps
        this.groundY = 680;      // The Y coordinate where the ground is
        this.landTimer = 0;      // Timer to hold the landing pose

        this.shiftLock = false;
        this.ctrlHeld = false;

        this.cakeTimer = 0;
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
            { name: "spin", count: 3},
            { name: "jump", count: 4}, 
            { name: "land", count: 3}  
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

        const tick = this.game.clockTick; 
        
        if (this.cakeTimer > 0) {
            this.cakeTimer -= tick;
            this.stamina = this.maxStamina; // Keep stamina full while powerful
        } else {
            this.cakeTimer = 0;
        }

        const WALK_SPEED = 150;
        const RUN_SPEED = 1000;
        const HOLD_THRESHOLD = 0.15; 

        const isA = this.game.keys["a"] || this.game.keys["A"];
        const isD = this.game.keys["d"] || this.game.keys["D"];
        const isW = this.game.keys["w"] || this.game.keys["W"];
        const isS = this.game.keys["s"] || this.game.keys["S"];
        const isE = this.game.keys["e"] || this.game.keys["E"];
        const isCtrl = this.game.keys["Control"]; 
        const isHoldingShift = this.game.keys["Shift"];

        if (isCtrl && !this.ctrlHeld) {
            this.shiftLock = !this.shiftLock;
            this.ctrlHeld = true;
            console.log("Shift Lock: " + (this.shiftLock ? "ON" : "OFF"));
        }
        if (!isCtrl) {
            this.ctrlHeld = false;
        }

        if (!this.shiftLock) {
            if (isA) this.faceDirection = "Left";
            if (isD) this.faceDirection = "Right";
        }


        if (isA || isD) {
            this.moveHoldTimer += tick;
        } else {
            this.moveHoldTimer = 0; 
        }

        const isHoldingMove = this.moveHoldTimer > HOLD_THRESHOLD;
        const canSprint = isHoldingShift && this.stamina > 0 && isHoldingMove;
        const isSpinning = isE && this.stamina > 0; 

        if (isW && this.y >= this.groundY && (this.stamina >= 15 || this.cakeTimer > 0)) {
            let currentJumpStrength = this.jumpStrength;

            if (canSprint) {
                currentJumpStrength *= 1.4; 
            }


            this.velocity.y = currentJumpStrength;
             if (this.cakeTimer <= 0) {
                this.stamina -= 15;
             }
            
            this.landTimer = 0;
        }

        if (this.y < this.groundY || this.velocity.y < 0) {
            this.velocity.y += this.gravity * tick;
            this.y += this.velocity.y * tick;
        }

        if (this.y < this.groundY) {
            this.action = "jump";
        } else {
            if (this.action === "jump") {
                this.action = "land";
                this.landTimer = 0.2;
            }
            this.y = this.groundY;
            this.velocity.y = 0;

            if (this.landTimer > 0) {
                this.action = "land";
                this.landTimer -= tick;
            } else if (isSpinning) {
                this.action = "spin";
            } else if (isHoldingMove) {
                this.action = "run";
            } else if (isS) {
                this.action = "sleep";
            } else {
                this.action = "idle";
            }
        }

        if (this.action === "spin") {
            if (this.cakeTimer <= 0) this.stamina -= this.staminaSpinCost * tick;
        } else if (canSprint) {
            if (this.cakeTimer <= 0) this.stamina -= this.staminaDrain * tick;
        } else {
            if (!(isHoldingShift && isHoldingMove) && !isE) {
                this.stamina = Math.min(this.maxStamina, this.stamina + this.staminaRegen * tick);
            }
        }
        this.stamina = Math.max(0, this.stamina);

        if (isHoldingMove) {
            let currentSpeed = canSprint ? RUN_SPEED : WALK_SPEED;
            if (isA) this.x -= currentSpeed * tick;
            if (isD) this.x += currentSpeed * tick;
        }

        if (this.damageCooldown > 0) this.damageCooldown -= tick;
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

        if (this.cakeTimer > 0) {
            ctx.save();
            ctx.shadowBlur = 25;
            ctx.shadowColor = "rgb(255, 192, 203)"; 
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;        
            ctx.globalAlpha = .85; 
            ctx.shadowBlur = 15;
        }
        
         if (this.faceDirection === "Right") {
            currentAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y);
        } else {
            ctx.save();
            ctx.translate(this.x + pivotX, this.y); 
            ctx.scale(-1, 1);
            currentAnim.drawFrame(this.game.clockTick, ctx, -pivotX, 0);
            ctx.restore();
        }

        if (this.game.options.debugging) {
            ctx.strokeStyle = "Red";
            ctx.lineWidth = 5;
            ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);
        }

        if (this.cakeTimer > 0) ctx.restore(); 

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
        if (this.action === "spin" || this.action === "run") {
            width = 500; height = 60; xOffset = 60; yOffset = 400; 
        } else if (this.action === "sleep") { 
            width = 315; height = 60; xOffset = 130; yOffset = 400;         
        } else if (this.action === "jump" || this.action === "land") {
            width = 200; height = 200; xOffset = 200; yOffset = 250; 
        } else {
            width = 100; height = 250; xOffset = 305; yOffset = 235;
        }
        return { width, height, xOffset, yOffset };
    }

    activateCakePower() {
        this.cakeTimer = 5; // 5 seconds of pink infinite stamina
        console.log("CAKE POWER ACTIVATED!");
    }
}