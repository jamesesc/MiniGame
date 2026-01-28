/**
 * A class that handles the camera on the character 
 */
class SceneManager {
    constructor(game) {
        this.game = game;
        this.game.camera = this; 

        this.x = 0;
        this.y = 0;

        // Creating our player (the otter)
        this.otter = new Otter(game);
        this.game.addEntity(this.otter);
    }

    update() {
        // Canvas dimesion setup
        let midpointX = 1024 / 2; 
        let midpointY = 768 / 2;  

        // Ensuring the camera is centering base on our player
        this.x = this.otter.x - midpointX;
        this.y = this.otter.y - midpointY;
    }

    draw(ctx) {
    
    }
}