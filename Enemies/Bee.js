class Bee {
    constructor(game) {
        this.game = game;
        this.scale = 6;
        this.width = 60;
        this.height = 60;
        
        this.x = 2500; 
        this.y = 900;
        
        this.startY = this.y; 

        this.maxHealth = 100;
        this.health = 100; 

        this.damageCooldown = 0; 

        this.spritesheet = ASSET_MANAGER.getAsset("./Assets/Mobs/Bee/Bee-Fly.png");

        this.animation = new AnimatorFromOneImage(
            this.spritesheet, 
            0, 0, 
            this.width, this.height, 
            4,     
            0.1,    
            4 
        );
        
        this.animation.scale = this.scale;
        this.updateBB();
    }

    update() {
        if (this.damageCooldown > 0) {
            this.damageCooldown -= this.game.clockTick;
        }
        this.y = this.startY + Math.sin(this.game.timer.gameTime * 3) * 50;
        
        this.updateBB();
    }   

    draw(ctx) {
        if (this.spritesheet) {
            if (this.damageCooldown > 0) {
                ctx.globalAlpha = 0.5;
            }

            this.animation.drawFrame(
                this.game.clockTick, 
                ctx, 
                this.x, 
                this.y
            );
            
            ctx.globalAlpha = 1.0;
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
        this.BB = new BoundingBox(this.x + 150, this.y + 140, 125, 90); 
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
            
            const player = this.game.camera.otter;
            if (player) {
                const direction = this.x > player.x ? 1 : -1;
                this.x += direction * 50; 
            } else {
                this.x += 50; 
            }
        }
    }
}