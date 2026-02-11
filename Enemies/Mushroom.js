class Mushroom {
    constructor(game) {
        this.game = game;
        this.scale = 6;
        this.width = 80;
        this.height = 40;
        
        this.x = 1700; 
        this.y = 950;

        this.spritesheet = ASSET_MANAGER.getAsset("./Assets/Mobs/Mushroom/Mushroom-Idle.png");
        this.spritesheetDiveAttack = ASSET_MANAGER.getAsset("./Assets/Mobs/Mushroom/Mushroom-Attack.png");

        this.idleAnimation = new AnimatorFromOneImage(
            this.spritesheet, 
            25, 30, 
            this.width, this.height, 
            3,     
            .2,    
            4
        );
        
        this.attackAnimation = new AnimatorFromOneImage(
            this.spritesheetDiveAttack, 
            1, 32, 
            36, this.height, 
            7,     
            .15, 
            4    
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
            animationToUse.drawFrame(
                this.game.clockTick, 
                ctx, 
                this.x, 
                this.y
            );
        }

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


    triggerAttackManually() {
        if (this.state === 'idle' && this.attackCooldown <= 0) {
            this.state = 'lean-back';
            this.stateTimer = 0;
            this.attackCooldown = 3;
            console.log("Manual attack triggered!");
        }
    }
}