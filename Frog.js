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
    }

    update() {
        this.scale += Math.sin(this.game.timer.gameTime * 3) * 0.7;
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