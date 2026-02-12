class Mushroom {
    constructor(game, x, y) {
        this.game = game;
        this.scale = 6;
        this.width = 80;
        this.height = 40;
        
        this.x = x ; 
        this.y = y ;

        // Good: x, 1700, y 950 TESTING
        // this.x = x || 1700; 
        // this.y = y || 950;


        this.maxHealth = 100;
        this.health = 100; 

        this.damageCooldown = 0; 

        this.spritesheet = ASSET_MANAGER.getAsset("./Assets/Mobs/Mushroom/Mushroom-Idle.png");
        this.spritesheetDiveAttack = ASSET_MANAGER.getAsset("./Assets/Mobs/Mushroom/Mushroom-Attack.png");

        this.idleAnimation = new AnimatorFromOneImage(
            this.spritesheet, 25, 30, this.width, this.height, 3, .2, 4
        );
        
        this.attackAnimation = new AnimatorFromOneImage(
            this.spritesheetDiveAttack, 1, 32, 36, this.height, 7, .15, 4    
        );
        
        this.idleAnimation.scale = this.scale;
        this.attackAnimation.scale = this.scale;

        this.updateBB();

        this.state = 'idle';          
        this.stateTimer = 0;
        this.attackCooldown = 0;
        this.jumpVelocity = 0;
        this.targetX = 0;
    }

    update() {
        this.updateBB();

        if (this.damageCooldown > 0) {
            this.damageCooldown -= this.game.clockTick;
        }

        if (this.attackCooldown > 0) {
            this.attackCooldown -= this.game.clockTick;
        }

        const player = this.game.camera?.otter;

        if (player && Math.abs(player.x - this.x) < 300 && this.state === 'idle' && this.attackCooldown <= 0) {
            this.state = 'lean-back';
            this.stateTimer = 0;
            this.attackAnimation.elapsedTime = 0;
        }

        switch (this.state) {
            case 'idle':
                break;

            case 'lean-back':
                this.stateTimer += this.game.clockTick;
                if (this.stateTimer >= 0.5) {
                    this.state = 'jump-dive';
                    this.stateTimer = 0;
                    this.jumpVelocity = -8;
                    this.targetX = player.x;
                }
                break;

            case 'jump-dive':
                this.stateTimer += this.game.clockTick;
                this.y += this.jumpVelocity;
                this.jumpVelocity += 0.5;

                const dx = this.targetX - this.x;
                this.x += Math.sign(dx) * 4;

                if (this.y >= 950) { 
                    this.y = 950;
                    this.jumpVelocity = 0;
                    this.state = 'recovery';
                    this.stateTimer = 0;
                }
                break;

            case 'recovery':
                this.stateTimer += this.game.clockTick;
                if (this.stateTimer >= 0.8) {
                    this.state = 'idle';
                    this.attackCooldown = 3; 
                }
                break;
        }
    }

    draw(ctx) {
        let animationToUse = this.idleAnimation;
        
        if (this.state === 'lean-back' || this.state === 'jump-dive' || this.state === 'recovery') {
            animationToUse = this.attackAnimation;
        }

        if (animationToUse) {
            if (this.damageCooldown > 0) {
                ctx.save();
                ctx.globalAlpha = 0.5;
            }

            animationToUse.drawFrame(
                this.game.clockTick, 
                ctx, 
                this.x, 
                this.y
            );

            if (this.damageCooldown > 0) {
                ctx.restore(); 
            }
        }

        this.drawHealthBar(ctx);

        if (this.game.options.debugging) {
            ctx.strokeStyle = "Red";
            ctx.lineWidth = 5;
            ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);
        }
    }

    updateBB() {
        this.lastBB = this.BB;
        this.BB = new BoundingBox(this.x + 35, this.y + 85, 95, 90); 
    }

    drawHealthBar(ctx) {
        const ratio = this.health / this.maxHealth;
        const width = this.BB.width; 
        const height = 25;
        
        const xPos = this.BB.x + 10;
        const yPos = this.BB.y - 125; 

        ctx.fillStyle = "black";
        ctx.fillRect(xPos - 3, yPos - 3, width + 3, height + 3); 

        if (ratio > 0.5) {
            ctx.fillStyle = "green";
        } else if (ratio > 0.25) {
            ctx.fillStyle = "orange";
        } else {
            ctx.fillStyle = "red";
        }
        
        ctx.fillRect(xPos, yPos, Math.max(0, width * ratio), height);
    }

    takeDamage(amount) {
        if (this.damageCooldown <= 0) {
            this.health -= amount;
            this.damageCooldown = 0.5; 
            
            const player = this.game.camera.otter;
            if (player) {
                const direction = this.x > player.x ? 1 : -1;
                this.x += direction * 50; 
            } else {
                this.x += 50; 
            }
        }
    }

    triggerAttackManually() {
        if (this.state === 'idle' && this.attackCooldown <= 0) {
            this.state = 'lean-back';
            this.stateTimer = 0;
            this.attackCooldown = 3;
            console.log("Manual attack triggered!");
        }
    }
}