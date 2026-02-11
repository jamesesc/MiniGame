class Mushroom {
    constructor(game) {
        this.game = game;
        this.scale = 6;
        this.width = 80;
        this.height = 40;
        
        this.x = 1700; 
        this.y = 950;

        this.spritesheet = ASSET_MANAGER.getAsset("./Assets/Mobs/Mushroom/Mushroom-Idle.png");


        this.animation = new AnimatorFromOneImage(
            this.spritesheet, 
            25, 30, 
            this.width, this.height, 
            3,     
            .2,    
            4
        );
        
        this.animation.scale = this.scale;

                this.updateBB();

    }

    update() {
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
        this.BB = new BoundingBox(this.x + 35, this.y + 85, 95, 90); 
    }
}