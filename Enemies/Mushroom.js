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
    }

    update() {
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