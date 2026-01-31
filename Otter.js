/**
 * The player class.
 */
class Otter {
    constructor(game) {
        this.game = game;
        this.x = 0;
        this.y = 680;
        this.w = 64; 
        this.h = 64;

        this.faceDirection = "Right";
        this.action = "idle"; 

        this.animations = {}; 
        this.createAnimations();
    }

    loadSequence(path, prefix, count) {
        let frames = [];
        for (let i = 1; i <= count; i++) {
            let fileName = `${path}${prefix}${i}.png`;
            let asset = ASSET_MANAGER.getAsset(fileName);
            
            if (!asset) {
                console.log("ERROR: Otter.js wanted to find: " + fileName);
            }
            frames.push(asset);
        }
        return frames;
    }

    createAnimations() {
        const basePath = "./Assets/Otter/";
        
        const states = [
            { name: "idle", count: 4 },
            { name: "run", count: 3 },
            { name: "sleep", count: 6},
            { name: "spin", count: 3}
        ];

        states.forEach(state => {
            let folder = state.name.charAt(0).toUpperCase() + state.name.slice(1);
            let prefix = `otter_${state.name}_`; 
            let path = `${basePath}${folder}/`;
            
            this.animations[state.name] = new AnimatorFromMultipleImages(this.loadSequence(path, prefix, state.count), 0.15);
        });
    }

   update() {
    this.action = "idle";
    const WALK_SPEED = 150;
    const RUN_SPEED = 600;
    
    if (this.game.keys["a"]) {
        this.faceDirection = "Left";
        let isRunning = this.game.keys["Shift"];
        this.action = "run"; 
        this.x -= (isRunning ? RUN_SPEED : WALK_SPEED) * this.game.clockTick;
    } 
    else if (this.game.keys["d"]) {
        this.faceDirection = "Right";
        let isRunning = this.game.keys["Shift"];
        this.action = "run"; 
        this.x += (isRunning ? RUN_SPEED : WALK_SPEED) * this.game.clockTick;
    } else if (this.game.keys["s"]) {
        this.faceDirection = "Right";
        this.action = "sleep";
    } else if (this.game.keys["e"]) {
        this.faceDirection = "Right";
        this.action = "spin"
    }

}

    draw(ctx) {
        let currentAnim = this.animations[this.action] || this.animations["idle"];
        
        if (this.faceDirection === "Right") {
            currentAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y);
        } else {
            ctx.save();
            ctx.translate(this.x + this.w, this.y); 
            ctx.scale(-1, 1);
            currentAnim.drawFrame(this.game.clockTick, ctx, 0, 0);
            ctx.restore();
        }
    }
}