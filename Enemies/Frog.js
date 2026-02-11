class Frog {
    constructor(game) {
        this.game = game;
        this.scale = 6;
        this.width = 30;
        this.height = 31;
        
        this.x = 2000; 
        this.y = 1040;

        this.spritesheet = ASSET_MANAGER.getAsset("./Assets/Mobs/Frogs/Green-Frog.png");


        this.animation = new AnimatorFromOneImage(
            this.spritesheet, 
            35, 5, 
            this.width, this.height, 
            4,     
            .3,    
            1 
        );
        
        this.animation.scale = this.scale;

        this.updateBB();
    }

    update() {
        this.scale += Math.sin(this.game.timer.gameTime * 3) * 0.7;

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
        this.BB = new BoundingBox(this.x + 40, this.y + 50, 85, 70); 
    }
}