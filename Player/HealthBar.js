class HealthBar {
    constructor(game, health) {
        this.game = game;
        this.health = health;
        
        this.game = game;
        this.scale = 10;
        this.width = 54;
        this.height = 11;
        
        this.x = -450; 
        this.y = 350;
        
        this.spritesheet = ASSET_MANAGER.getAsset("./Assets/Items/HealthBar.png");
        
        this.animation = new AnimatorFromOneImage(
            this.spritesheet, 
            14, 212,                   
            this.width, this.height, 
            1,                     
            .5,                      
            0                    
        );
        
        this.animation.scale = this.scale;
    }

    update() {

    }
    
 draw(ctx) {
        // Save the current canvas state (including camera transformation)
        ctx.save();
        
        // Reset transformation to identity (removes camera offset/scale)
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        
        // Draw at fixed screen coordinates
        if (this.spritesheet) {
            this.animation.drawFrame(
                this.game.clockTick, 
                ctx, 
                10,  // Fixed X on screen
                10   // Fixed Y on screen
            );
        }
        
        // Restore the previous canvas state (re-applies camera transformation)
        ctx.restore();
    }
}