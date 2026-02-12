class Bee {
    constructor(game, x, y) {
        this.game = game;
        this.scale = 6;
        this.width = 60;
        this.height = 60;
        
        this.x = x ; 
        this.y = y ;

        // Good: x, 2500, y 400 TESTING
        // this.x = x || 2500 ; 
        // this.y = y || 400;
        
        this.startY = this.y; 

        this.maxHealth = 100;
        this.health = 100; 

        this.damageCooldown = 0; 

        this.detectionRadius = 1200;
        this.detectionZone = new CircularDetectionZone(this.x, this.y, this.detectionRadius);

        this.attackRadius = 600;
        this.attackZone = new CircularDetectionZone(this.x, this.y, this.attackRadius);

        this.charging = false; 
        this.chargeDirection = { x: 0, y: 0 };
        this.groundY = 1500; 

        this.aggro = false; 
        this.attack = false;

        this.stuck = false;
        this.stuckTimer = 0;
        this.attackCooldown = 0;

        this.BeeFly = ASSET_MANAGER.getAsset("./Assets/Mobs/Bee/Bee-Fly.png");
        this.BeeAttack = ASSET_MANAGER.getAsset("./Assets/Mobs/Bee/Bee-Attack.png");
        this.BeeHit = ASSET_MANAGER.getAsset("./Assets/Mobs/Bee/Bee-Hit.png");


        this.animationFly = new AnimatorFromOneImage(
            this.BeeFly, 
            14, 0, 
            this.width, this.height, 
            4,     
            .1,    
            4, true
        );

        
        this.animationAttack = new AnimatorFromOneImage(
            this.BeeAttack, 
            14, 0, 
            this.width, this.height, 
            4,     
            1,    
            4, false
        );

        
        this.animationHit = new AnimatorFromOneImage(
            this.BeeHit, 
            14, 0, 
            this.width, this.height, 
            4,     
            1,    
            4, false
        );




        this.animationAttack.scale = this.scale;
        this.animationHit.scale = this.scale;
        this.animationFly.scale = this.scale;
        this.updateBB();
    }

    update() {
        const centerX = this.x + (this.width * this.scale) / 2;
        const centerY = this.y + (this.height * this.scale) / 2;
        this.detectionZone.x = centerX;
        this.detectionZone.y = centerY;
        this.attackZone.x = centerX;
        this.attackZone.y = centerY;

        const player = this.game.camera.otter;

        // 1. Timers
        if (this.stuckTimer > 0) {
            this.stuckTimer -= this.game.clockTick;
            if (this.stuckTimer <= 0) {
                this.stuck = false;
                this.attackCooldown = 2; 
            }
        }

        if (this.attackCooldown > 0) this.attackCooldown -= this.game.clockTick;
        if (this.damageCooldown > 0) this.damageCooldown -= this.game.clockTick;

        if (this.stuck) {

        } 
        else if (this.charging) {
            this.x += this.chargeDirection.x * 1200 * this.game.clockTick;
            this.y += this.chargeDirection.y * 1200 * this.game.clockTick;

            this.updateBB();

            if (player && player.BB && this.BB.collide(player.BB)) {
                if (typeof player.takeDamage === 'function') {
                    player.takeDamage(50); // Adjust damage amount as needed
                }
                
                this.charging = false;
                this.stuck = false;      
                this.attackCooldown = 2; 
            } 
            else {
                this.game.entities.forEach(entity => {
                    if (entity instanceof Ground && this.BB.collide(entity.BB)) {
                        this.charging = false;
                        this.stuck = true;
                        this.stuckTimer = 3; 
                        this.y = entity.BB.y - this.BB.height - 140; 
                    }
                });
            }

            if (this.y > 2000 || this.x < 0 || this.x > 10000) { 
                this.charging = false;
                this.attackCooldown = 1;
            }
        } 
        else if (this.aggro && player && player.BB) {
            if (this.attackCooldown <= 0 && this.attackZone.collide(player.BB)) {
                this.charging = true;
                this.animationAttack.elapsedTime = 0; 
                
                const playerCenterX = player.BB.x + (player.BB.width / 2);
                const playerBottomY = player.BB.y + player.BB.height;

                let dx = playerCenterX - centerX;
                let dy = playerBottomY - centerY;
                let dist = Math.hypot(dx, dy);

                if (dist > 0) {
                    this.chargeDirection.x = dx / dist;
                    this.chargeDirection.y = dy / dist;
                }
            } else {
                const direction = player.x < this.x ? -1 : 1;
                this.x += direction * 400 * this.game.clockTick;
                
                const bob = Math.sin(this.game.timer.gameTime * 3) * 50;
                const targetY = this.startY + bob;
                this.y += (targetY - this.y) * 3 * this.game.clockTick;
                
                if (!this.detectionZone.collide(player.BB)) {
                    this.aggro = false;
                }
            }
        } 
        else {
            const bob = Math.sin(this.game.timer.gameTime * 3) * 50;
            const targetY = this.startY + bob;
            this.y += (targetY - this.y) * 3 * this.game.clockTick;
            
            if (player && player.BB && this.detectionZone.collide(player.BB)) {
                this.aggro = true;
            }
        }

        this.updateBB();
    }

    draw(ctx) {
        if (this.BeeFly && this.BeeAttack && this.BeeHit) {        
            if (this.damageCooldown > 0) {
                ctx.globalAlpha = 0.5;
                this.animationHit.drawFrame(this.game.clockTick, ctx, this.x, this.y);
                ctx.globalAlpha = 1.0;
            } 
            else if (this.charging) {
                this.animationAttack.drawFrame(this.game.clockTick, ctx, this.x, this.y);
            } 
            else if (this.stuck) {
                this.animationFly.drawFrame(this.game.clockTick * 2, ctx, this.x, this.y);
            } 
            else {
                this.animationFly.drawFrame(this.game.clockTick, ctx, this.x, this.y);
            }
        }

        this.drawHealthBar(ctx);

        if (this.game.options.debugging) {
            ctx.strokeStyle = "Red";
            ctx.lineWidth = 5;
            ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);

            this.detectionZone.draw(ctx);
            this.attackZone.draw(ctx);
            
            if (this.charging) {
                const player = this.game.camera.otter;
                if (player && player.BB) {
                    ctx.strokeStyle = "red";
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(this.BB.x + this.BB.width/2, this.BB.y + this.BB.height/2);
                    ctx.lineTo(player.BB.x + player.BB.width/2, player.BB.y + player.BB.height);    
                    ctx.stroke();
                }
            }
        }
    }

    updateBB() {
        this.lastBB = this.BB;
        this.BB = new BoundingBox(this.x + 100, this.y + 140, 125, 90); 
    }

    drawHealthBar(ctx) {
        const ratio = this.health / this.maxHealth;
        const width = this.BB.width; 
        const height = 25;
        const xPos = this.BB.x;
        const yPos = this.BB.y - 30; 

        ctx.fillStyle = "black";
        ctx.fillRect(xPos - 3, yPos - 3, width + 3, height + 3); 

        if (ratio > 0.5) ctx.fillStyle = "green";
        else if (ratio > 0.25) ctx.fillStyle = "orange";
        else ctx.fillStyle = "red";
        
        ctx.fillRect(xPos, yPos, Math.max(0, width * ratio), height);
    }

    takeDamage(amount) {
        if (this.damageCooldown <= 0) {
            this.health -= amount;
            this.damageCooldown = 0.5; 
            this.animationHit.elapsedTime = 0; 
            
            const player = this.game.camera.otter;
            if (player) {
                const direction = this.x > player.x ? 1 : -1;
                this.x += direction * 50;
            }
        }
    }
}