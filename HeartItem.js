class HeartItem {
    constructor(game) {
        this.game = game;
        this.scale = 6;
        this.width = 19;
        this.height = 19;
        
        this.x = 1200; 
        this.y = 950;

        this.spritesheet = ASSET_MANAGER.getAsset("./Assets/Items/Hearts.png");


        this.animation = new AnimatorFromOneImage(
            this.spritesheet, 
            102, 0, 
            this.width, this.height, 
            5,     
            .2,    
            5
        );
        
        this.animation.scale = this.scale;
    }

    update() {
        this.y += Math.sin(this.game.timer.gameTime * 3) * 0.7;
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
    }
} 