class Frog {
    constructor(game, x, y) {
        this.game = game;
        this.scale = 6;
        this.width = 30;
        this.height = 31;
        
        this.x = x; 
        this.y = y;

        
        // Good: x, 2000, y 1040 TESTING
        // this.x = x || 2000; 
        // this.y = y || 1040;

        this.maxHealth = 100;
        this.health = 100; 
        
        this.damageCooldown = 0; 

        this.detectionRadius = 1500;
        this.detectionZone = new CircularDetectionZone(this.x, this.y, this.detectionRadius);

        this.attackRadius = 600;
        this.attackZone = new CircularDetectionZone(this.x, this.y, this.attackRadius);



        this.Idle = ASSET_MANAGER.getAsset("./Assets/Mobs/Frogs/BlueBlue/ToxicFrogBlueBlue_Idle.png");

        this.Hurt = ASSET_MANAGER.getAsset("./Assets/Mobs/Frogs/BlueBlue/ToxicFrogBlueBlue_Hurt.png");

        this.Hop = ASSET_MANAGER.getAsset("./Assets/Mobs/Frogs/BlueBlue/ToxicFrogBlueBlue_Hop.png");

        this.Explosion = ASSET_MANAGER.getAsset("./Assets/Mobs/Frogs/BlueBlue/ToxicFrogBlueBlue_Explosion.png");

        this.Attack = ASSET_MANAGER.getAsset("./Assets/Mobs/Frogs/BlueBlue/ToxicFrogBlueBlue_Attack.png");



        // DELETE THIS 
        this.spritesheet = ASSET_MANAGER.getAsset("./Assets/Mobs/Frogs/Green-Frog.png");
        this.animation = new AnimatorFromOneImage(
            this.spritesheet, 35, 5, this.width, this.height, 4, .3, 1 
        );

        
        this.IdleAnimation = new AnimatorFromOneImage(
            this.Idle,
            11, 16,
            48, 48,
            8, 
            .1,
            8, 
            true
        )

        this.HurtAnimation = new AnimatorFromOneImage(
            this.Hurt,
            11, 16,
            48, 48,
            4, 
            .1,
            4, 
            true
        )

        
        this.HopAnimation = new AnimatorFromOneImage(
            this.Hop,
            11, 16,
            47.6, 15,
            7, 
            .1,
            7, 
            true
        )

        
        this.ExplosionAnimation = new AnimatorFromOneImage(
            this.Explosion,
            11, 16,
            47, 48,
            9, 
            .1,
            9, 
            true
        )

                
        this.AttackAnimation = new AnimatorFromOneImage(
            this.Attack,
            11, 16,
            47.5, 48,
            6, 
            .1,
            6, 
            true
        )





        this.animation.scale = this.scale;
        this.IdleAnimation.scale = this.scale;
        this.HurtAnimation.scale = this.scale;
        this.HopAnimation.scale = this.scale;
        this.ExplosionAnimation.scale = this.scale;
        this.AttackAnimation.scale = this.scale;


        this.updateBB();
    }

    update() {
        if (this.damageCooldown > 0) {
            this.damageCooldown -= this.game.clockTick;
        }
        this.updateBB();
    }   

    draw(ctx) {
        if (this.Hop) {
            if (this.damageCooldown > 0) {
                ctx.globalAlpha = 0.5; 
            }
            
            this.HurtAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
            
            ctx.globalAlpha = 1.0; 
        }

                this.drawHealthBar(ctx);


        if (this.game.options.debugging) {
            // --- Draw Bounding Box (Existing) ---
            ctx.strokeStyle = "Red";
            ctx.lineWidth = 5;
            ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);

            // --- Draw Detection Zone (Large Circle) ---
            ctx.beginPath();
            ctx.setLineDash([5, 15]); // Optional: makes the line dashed
            ctx.strokeStyle = "Yellow";
            ctx.lineWidth = 2;
            // Assuming your CircularDetectionZone has x, y, and radius properties
            ctx.arc(this.x, this.y, this.detectionRadius, 0, Math.PI * 2);
            ctx.stroke();

            // --- Draw Attack Zone (Smaller Circle) ---
            ctx.beginPath();
            ctx.setLineDash([]); // Reset to solid line
            ctx.strokeStyle = "Orange";
            ctx.arc(this.x, this.y, this.attackRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }


    updateBB() {
        this.lastBB = this.BB;
        this.BB = new BoundingBox(this.x, this.y, 125, 100); 
    }

    drawHealthBar(ctx) {
        const ratio = this.health / this.maxHealth;
        const width = this.BB.width; 
        const height = 25;
        
        const xPos = this.BB.x;
        const yPos = this.BB.y - 86; 

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