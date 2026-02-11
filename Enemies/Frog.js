class Frog {
    constructor(game) {
        this.game = game;
        this.scale = 6;
        this.width = 30;
        this.height = 31;
        
        this.x = 2000; 
        this.y = 1040;

        this.maxHealth = 100;
        this.health = 100; 
        
        this.damageCooldown = 0; 

        this.spritesheet = ASSET_MANAGER.getAsset("./Assets/Mobs/Frogs/Green-Frog.png");

        this.animation = new AnimatorFromOneImage(
            this.spritesheet, 35, 5, this.width, this.height, 4, .3, 1 
        );
        this.animation.scale = this.scale;
        this.updateBB();
    }

    update() {
        if (this.damageCooldown > 0) {
            this.damageCooldown -= this.game.clockTick;
        }
        this.updateBB();
    }   

    draw(ctx) {
        if (this.spritesheet) {
            if (this.damageCooldown > 0) {
                ctx.globalAlpha = 0.5; 
            }
            
            this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
            
            ctx.globalAlpha = 1.0; 
        }

                this.drawHealthBar(ctx);


        if (this.game.options.debugging) {
            ctx.strokeStyle = "Red";
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);
        }
    }


    updateBB() {
        this.lastBB = this.BB;
        this.BB = new BoundingBox(this.x + 40, this.y + 50, 85, 70); 
    }

    drawHealthBar(ctx) {
        const ratio = this.health / this.maxHealth;
        const width = this.BB.width; 
        const height = 25;
        
        const xPos = this.BB.x;
        const yPos = this.BB.y - 45; 

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
            this.x += 50; 
        }
    }
}