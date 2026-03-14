import { WorldGenerator } from '../Background/WorldGenerator.js';
import { WorldManager } from '../Background/WorldManager.js';
import { PauseMenu } from './PauseMenu.js';
import { IntroScreen } from './Introscreen.js'; 
import { BiomeAtmosphere } from '../Background/BiomeAtmosphere.js';




export class SceneManager {
    constructor(game) {
        this.game = game;
        this.game.camera = this;

        this.x = 0;
        this.y = 0;

        // Title screen handle entirely by IntroScreen 
        // SceneManager starts with title (So it never draw on its own) 
        this.title = false;
        this.introCamera = false;
        this.gameOver = false;
        this.fadeAlpha = 0;
        this.spacePressed = false;

        // Pause state
        this.paused = false;
        this.pauseMenu = null;
        this.pauseKeyHeld = false;

        // SceneManager must always update (handles pause key, game-over click)
        this.updateWhilePaused = true;

        this.showIntroScreen();

        // Keepign SceneManager at the end of the entity list so it draws on top
        this.bringToFront();
    }

    bringToFront() {
        const index = this.game.entities.indexOf(this);
        if (index > -1) {
            this.game.entities.splice(index, 1);
            this.game.entities.push(this);
        }
    }

    showIntroScreen() {
        //Setup to skip the intro
        // this.loadLevel();
        // this.introCamera = false;
        // this.x = this.otter.x - 1024 / 2;
        // this.y = this.otter.y - 768 / 2;
        // this.bringToFront();

        const intro = new IntroScreen(
            this.game,
            () => {
                this.loadLevel();
                this.introCamera = true;
                this.x = this.otter.x - 1024 / 2;
                this.y = this.otter.y - 12000;
                this.bringToFront();
            },
            () => {},
            () => {}
        );
        this.game.addEntity(intro);
    }

    togglePause() {
        if (this.paused) {
            //  Resume 
            this.paused = false;
            this.game.paused = false;           
            if (this.pauseMenu) {
                this.pauseMenu.removeFromWorld = true;
                this.pauseMenu = null;
            }
        } else {
            //  Pause 
            this.paused = true;
            this.game.paused = true;           

            this.pauseMenu = new PauseMenu(
                this.game,
                () => {                         // onContinue
                    this.paused = false;
                    this.game.paused = false;
                    this.pauseMenu = null;
                },
                () => {                         // onRestart
                    this.paused = false;
                    this.game.paused = false;
                    this.pauseMenu = null;
                    this.resetGame();
                }
            );
            this.game.addEntity(this.pauseMenu);
            this.bringToFront();
        }
    }

    //  Level loading 
    loadLevel() {
        this.game.addEntity(new ParallaxLayer(this.game, "./Assets/Background/5-SkyBackground.png", .1, -3700, 13));
        this.game.addEntity(new ParallaxLayer(this.game, "./Assets/IntroBackground/4.png", 0.1, -1510, 12));
        this.game.addEntity(new ParallaxLayer(this.game, "./Assets/IntroBackground/5.png", 0.1, -1505, 12));
        this.game.addEntity(new ParallaxLayer(this.game, "./Assets/IntroBackground/6.png", 0.1, -1500, 12));
        this.game.addEntity(new ParallaxLayer(this.game, "./Assets/IntroBackground/7.png", 0.1, -1600, 12));

        this.game.addEntity(new ParallaxLayer(this.game, "./Assets/Background/4-TreesBackground.png", 0.1, 115, 4));
        this.game.addEntity(new ParallaxLayer(this.game, "./Assets/Background/3-Trees.png", 0.3, 0,    5));
        this.game.addEntity(new ParallaxLayer(this.game, "./Assets/Background/2-Trees.png", 0.5, -700, 6));
        this.game.addEntity(new ParallaxLayer(this.game, "./Assets/Background/1-Trees.png", 0.7, -25,  4));

        // this.game.addEntity(new HeartItem(this.game));
        // this.game.addEntity(new CakeItem(this.game));
        // this.game.addEntity(new ChestItem(this.game, 1050, 925));
        this.game.addEntity(new BirdSpawner(this.game));

        this.game.addEntity(new BiomeAtmosphere(this.game));





        const playerHealth = new Health(100);
        this.game.addEntity(new HealthBar(this.game, playerHealth));

        this.game.addEntity(new Ground(this.game));

        const worldGen = new WorldGenerator('SomeLevel');
        const worldManager = new WorldManager(this.game, worldGen);
        this.game.addEntity(worldManager);

        this.otter = new Otter(this.game);
        this.game.addEntity(this.otter);

        this.otter.x = 0; 

        if (this.activeEffect?.rain) {
    console.log("rain active, drops:", this.rainDrops.length);
        }
    }

    //  Reset (Game Over t o Play Again) 
    resetGame() {
        this.gameOver = false;
        this.fadeAlpha = 0;
        this.introCamera = false;
        this.paused = false;
        this.game.paused = false;
        this.game.endingActive = false; 
        this.otter = null;  
        this.x = 0;
        this.y = 0;

        this.game.click = null;
        this.game.keys[' '] = false;

        // Remove all entities except this SceneManager
        this.game.entities.forEach(entity => {
            if (entity !== this) entity.removeFromWorld = true;
        });

        // Show the intro screen again for a clean restart
        this.showIntroScreen();
        this.bringToFront();
    }

    //  Draw 
    draw(ctx) {
        // Fade-to-black overlay (plays when otter dies)
        if (this.fadeAlpha > 0) {
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.globalAlpha = this.fadeAlpha;
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.restore();
        }

        // Game-over screen
        if (this.gameOver) {
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.font = '80px Arial';
            ctx.fillText('GAME OVER', this.x + ctx.canvas.width / 2, this.y + ctx.canvas.height / 2);

            ctx.font = '30px Arial';
            ctx.fillText('Click to Play Again', this.x + ctx.canvas.width / 2, this.y + ctx.canvas.height / 2 + 80);
        }
    }


update() {
    if (this.game.pandaActive) return;

    // 1. Debugging coordinates
    if (this.game.keys['c'] && !this.coordKeyHeld) {
        this.coordKeyHeld = true;
        console.log(`Player X: ${Math.round(this.otter.x)}, Y: ${Math.round(this.otter.y)}`);
    }
    if (!this.game.keys['c']) this.coordKeyHeld = false;


    if (this.game.endingActive) {
    // Still handle pause key and keep SceneManager on top, but don't touch camera
    const pauseKey = this.game.keys['Escape'] || this.game.keys['p'];
    if (pauseKey && !this.pauseKeyHeld) {
        this.pauseKeyHeld = true;
    }
    if (!pauseKey) this.pauseKeyHeld = false;
    this.bringToFront();
    return; // Let EndingSequence fully own the camera
}

    // =========================================================
    //               LAYER ORDERING SYSTEM
    // =========================================================
    
    // ONLY sort these layers if the ending has NOT started.
    // This prevents the Otter and Ground from jumping in front of the Ending panel.
    if (!this.game.endingActive) {
        // LAYER 1: THE CHEST
        const chests = this.game.entities.filter(e => e.constructor.name === "ChestItem");
        chests.forEach(chest => {
            const index = this.game.entities.indexOf(chest);
            if (index > -1) {
                this.game.entities.splice(index, 1);
                this.game.entities.push(chest);
            }
        });

        // LAYER 2: GROUND
        const ground = this.game.entities.find(e => e.constructor.name === "Ground");
        if (ground) {
            this.game.entities.splice(this.game.entities.indexOf(ground), 1);
            this.game.entities.push(ground);
        }

        // LAYER 3: OTTER
        if (this.otter) {
            this.game.entities.splice(this.game.entities.indexOf(this.otter), 1);
            this.game.entities.push(this.otter);
        }

        // LAYER 4: DROPS & ITEMS
        const foregroundClasses = ["ChestDrop", "HeartItem", "CakeItem", "HeartParticle"];
        const foregroundEntities = this.game.entities.filter(e => foregroundClasses.includes(e.constructor.name));
        foregroundEntities.forEach(entity => {
            const index = this.game.entities.indexOf(entity);
            if (index > -1) {
                this.game.entities.splice(index, 1);
                this.game.entities.push(entity);
            }
        });

        // LAYER 5: UI
        const healthBar = this.game.entities.find(e => e.constructor.name === "HealthBar");
        if (healthBar) {
            this.game.entities.splice(this.game.entities.indexOf(healthBar), 1);
            this.game.entities.push(healthBar);
        }

        // LAYER 6: AREA NOTIFICATION — ADD THIS
const notification = this.game.entities.find(e => e.constructor.name === "AreaNotification");
if (notification) {
    this.game.entities.splice(this.game.entities.indexOf(notification), 1);
    this.game.entities.push(notification);
}

// LAYER 7: PANDA
const panda = this.game.entities.find(e => e.constructor.name === "PandaGreeting");
if (panda) {
    this.game.entities.splice(this.game.entities.indexOf(panda), 1);
    this.game.entities.push(panda);
}



    } else {
        // IF THE ENDING IS ACTIVE: 
        // Force the EndingSequence to be the absolute last thing in the array (the top layer)
        const ending = this.game.entities.find(e => e instanceof EndingSequence);
        if (ending) {
            const index = this.game.entities.indexOf(ending);
            if (index > -1 && index !== this.game.entities.length - 1) {
                this.game.entities.splice(index, 1);
                this.game.entities.push(ending);
            }
        }
    }

    // SceneManager (Overlay/Fade) - Always stay near top
    const selfIndex = this.game.entities.indexOf(this);
    if (selfIndex > -1) {
        this.game.entities.splice(selfIndex, 1);
        this.game.entities.push(this);
    }

    // =========================================================
    // Pause toggle
    const pauseKey = this.game.keys['Escape'] || this.game.keys['p'];
    if (pauseKey && !this.pauseKeyHeld) {
        this.pauseKeyHeld = true;
        if (!this.gameOver && this.otter) this.togglePause();
    }
    if (!pauseKey) this.pauseKeyHeld = false;

    if (this.paused) return;

    if (this.gameOver) {
        if (this.game.click || this.game.keys[' ']) {
            this.game.click = null;
            this.resetGame();
        }
        return;
    }

    if (!this.otter) return;

    if (this.otter.dead && this.otter.fragments.length === 0) {
        this.fadeAlpha += this.game.clockTick * 0.5;
        if (this.fadeAlpha >= 1) {
            this.fadeAlpha = 1;
            this.gameOver = true;
        }
    }

    if (this.introCamera) {
        const targetX = this.otter.x - 1024 / 2;
        const targetY = this.otter.y - 768 / 2;
        this.x = targetX;
        this.y += (targetY - this.y) * 0.01;

        if (Math.abs(this.y - targetY) < 5) {
            this.introCamera = false;
            this.y = targetY;
        }
        return;
    }

    this.x = this.otter.x - 1024 / 2;
this.y = this.otter.y - 768 / 2;

}
}