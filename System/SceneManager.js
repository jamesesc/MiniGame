class SceneManager {
    constructor(game) {
        this.game = game;
        this.game.camera = this; 

        this.x = 0;
        this.y = 0;

        // Intro State
        this.title = true; 

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
            }
            return;
        }

        
        // Canvas dimension setup
        let midpointX = 1024 / 2; 
        let midpointY = 768 / 2;  

        // Ensuring the camera is centering base on our player
        this.x = this.otter.x - midpointX;
        this.y = this.otter.y - midpointY;
        
        // Handle manual mushroom attack trigger
        if (this.game.keys[' '] && !this.spacePressed) {
            this.spacePressed = true;
            
            // Find the first mushroom entity and trigger attack
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