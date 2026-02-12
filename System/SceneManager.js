import { WorldGenerator } from '../Background/WorldGenerator.js';
import { WorldManager } from '../Background/WorldManager.js';

export class SceneManager {
    constructor(game) {
        this.game = game;
        this.game.camera = this; 

        this.x = 0;
        this.y = 0;

        this.title = true; 
        this.introCamera = false;
        this.gameOver = false; 
        this.fadeAlpha = 0;    
        this.spacePressed = false;

        this.loadLevel();

        const index = this.game.entities.indexOf(this);
        if (index > -1) {
            this.game.entities.splice(index, 1);
            this.game.entities.push(this);
        }
    }

    loadLevel() {
        this.game.addEntity(new ParallaxLayer(this.game, "./Assets/Background/5-SkyBackground.png", .1, -1500, 11));
        this.game.addEntity(new ParallaxLayer(this.game, "./Assets/Background/4-TreesBackground.png", 0.1, 100, 4));
        this.game.addEntity(new ParallaxLayer(this.game, "./Assets/Background/3-Trees.png", 0.3, 0, 5));
        this.game.addEntity(new ParallaxLayer(this.game, "./Assets/Background/2-Trees.png", 0.5, 400, 2));
        this.game.addEntity(new ParallaxLayer(this.game, "./Assets/Background/1-Trees.png", 0.7, -25 , 4));

        this.game.addEntity(new HeartItem(this.game));
        this.game.addEntity(new CakeItem(this.game));

        const playerHealth = new Health(100);  
        this.game.addEntity(new HealthBar(this.game, playerHealth));
    

        this.game.addEntity(new Ground(this.game));

        const worldGen = new WorldGenerator('SomeLevel');
        const worldManager = new WorldManager(this.game, worldGen); 
        this.game.addEntity(worldManager);

        this.otter = new Otter(this.game);
        this.game.addEntity(this.otter);
    }

    resetGame() {
        this.title = true;
        this.gameOver = false;
        this.fadeAlpha = 0;
        this.introCamera = false;
        this.x = 0;
        this.y = 0;

        this.game.click = null;
        this.game.keys[' '] = false;

        this.game.entities.forEach(entity => {
            if (entity !== this) {
                entity.removeFromWorld = true;
            }
        });

        this.loadLevel();

        const index = this.game.entities.indexOf(this);
        if (index > -1) {
            this.game.entities.splice(index, 1);
            this.game.entities.push(this);
        }
    }

    draw(ctx) {
    
        if (this.title) {
            ctx.fillStyle = "pink";
            ctx.fillRect(this.x, this.y, ctx.canvas.width, ctx.canvas.height);

            ctx.fillStyle = "Black";
            ctx.textAlign = "center";
            ctx.font = "60px Arial";
            ctx.fillText("THE WACKY TACKY OTTER", this.x + ctx.canvas.width / 2, this.y + ctx.canvas.height / 2 - 50);
            
            ctx.font = "30px Arial";
            ctx.fillText("Press Space or Click to Start", this.x + ctx.canvas.width / 2, this.y + ctx.canvas.height / 2 + 50);
        }

        if (this.fadeAlpha > 0) {
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0); 
            
            ctx.globalAlpha = this.fadeAlpha;
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); 
            
            ctx.restore();
        }

        if (this.gameOver) {
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.font = "80px Arial";
            ctx.fillText("GAME OVER", this.x + ctx.canvas.width / 2, this.y + ctx.canvas.height / 2);
            
            ctx.font = "30px Arial";
            ctx.fillText("Click to Play Again", this.x + ctx.canvas.width / 2, this.y + ctx.canvas.height / 2 + 80);
        }
    }
    update() {
         const foregroundClasses = [Ground, Otter, HealthBar, this]; 

         

        foregroundClasses.forEach(Cls => {
        const entity = Cls === this ? this : this.game.entities.find(e => e instanceof Cls);
        
        if (entity) {
            const index = this.game.entities.indexOf(entity);
            if (index > -1) {
                this.game.entities.splice(index, 1);
                this.game.entities.push(entity);
            }
        }
    });
    

        if (this.gameOver) {
            if (this.game.click || this.game.keys[' ']) {
                this.game.click = null;
                this.resetGame();
            }
            return; 
        }

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

        if (this.otter.dead && this.otter.fragments.length === 0) {
            this.fadeAlpha += this.game.clockTick * 0.5; 
            if (this.fadeAlpha >= 1) {
                this.fadeAlpha = 1;
                this.gameOver = true;
            }
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
        } else {
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

}