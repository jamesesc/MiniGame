class SceneManager {
    constructor(game) {
        this.game = game;
        this.game.camera = this; 

        this.x = 0;
        this.y = 0;

        // Intro State: Start true so we see the menu
        this.title = true; 

        // Camera state
        this.introCamera = false; // Start false, trigger it when title ends
        
        // Creating our player (the otter)
        this.otter = new Otter(game);
        this.game.addEntity(this.otter);
        
        // Track spacebar state
        this.spacePressed = false;
    }

    update() {
        if (this.title) {
            if (this.game.click || this.game.keys[' ']) {
                this.title = false;
                this.game.click = null; 
                this.spacePressed = true; 
                

                this.introCamera = true;
                this.x = this.otter.x - (1024 / 2);
                this.y = this.otter.y - 11000; 
            }
            return;
        }

        if (this.introCamera) {
            let targetX = this.otter.x - (1024 / 2);
            let targetY = this.otter.y - (768 / 2);

            this.x = targetX; 
            this.y += (targetY - this.y) * 0.01;

            if (Math.abs(this.y - targetY) < 5) {
                this.introCamera = false; 
                this.y = targetY;         
            }
        } 
    
        else {
            this.x = this.otter.x - (1024 / 2);
            this.y = this.otter.y - (768 / 2);
        }

        if (this.game.keys[' '] && !this.spacePressed) {
            this.spacePressed = true;
            const mushroom = this.game.entities.find(e => e instanceof Mushroom);
            if (mushroom) {
                mushroom.triggerAttackManually();
            }
        }
        if (!this.game.keys[' ']) {
            this.spacePressed = false;
        }
    }

    draw(ctx) {
        if (this.title) {
            ctx.fillStyle = "pink";
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            ctx.fillStyle = "Black";
            ctx.textAlign = "center";
            
            ctx.font = "60px Arial";
            ctx.fillText("THE WACKY TACKY OTTER", ctx.canvas.width / 2, ctx.canvas.height / 2 - 50);
            
            ctx.font = "30px Arial";
            ctx.fillText("Press Space or Click to Start", ctx.canvas.width / 2, ctx.canvas.height / 2 + 50);
        }
    }
}