class Bee {
    constructor(game) {
        this.game = game;
        this.scale = 6;
        this.width = 60;
        this.height = 60;
        
        this.x = 2000; 
        this.y = 680;

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
        this.BB = new BoundingBox(this.x + 150, this.y + 140, 125, 90); 
    }
}