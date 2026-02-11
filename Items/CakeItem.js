class CakeItem {
    constructor(game) {
        this.game = game;
        this.scale = 2;
        this.width = 100;
        this.height = 100;
        
        this.x = 1000; 
        this.y = 950;

        this.spritesheet = ASSET_MANAGER.getAsset("./Assets/Items/Strawberrycake.png");

        this.animation = new AnimatorFromOneImage(
            this.spritesheet, 
            0, 0,                   
            this.width, this.height, 
            1,                     
            .5,                      
            0                    
        );
        
        this.animation.scale = this.scale;

        this.updateBB();

    }

    update() {
        this.y += Math.sin(this.game.timer.gameTime * 3) * 0.7;

        this.updateBB();

    }   

    draw(ctx) {
      
        if (this.spritesheet) {
            this.animation.drawFrame(
                this.game.clockTick, 
                ctx, 
                this.x, 
                this.y
            );
        }


        if (this.game.options.debugging) {
            ctx.strokeStyle = "Red";
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);
        }
    }


    updateBB() {
        this.lastBB = this.BB;
        this.BB = new BoundingBox(this.x + 20, this.y + 35, 75, 45); 
    }
}