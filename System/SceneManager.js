import { WorldGenerator } from '../Background/WorldGenerator.js';
import { WorldManager } from '../Background/WorldManager.js';
import { IntroScreen } from './Introscreen.js';

export class SceneManager {
    constructor(game) {
        this.game = game;
        this.game.camera = this;

        this.x = 0;
        this.y = 0;

        // Title screen is now handled entirely by IntroScreen —
        // SceneManager starts with title = false so it never draws its own.
        this.title = false;
        this.introCamera = false;
        this.gameOver = false;
        this.fadeAlpha = 0;
        this.spacePressed = false;

        // Show the IntroScreen first; loadLevel() is called inside onPlay.
        this._showIntroScreen();

        // Keep SceneManager at the end of the entity list so it draws on top.
        this._bringToFront();
    }

    _bringToFront() {
        const index = this.game.entities.indexOf(this);
        if (index > -1) {
            this.game.entities.splice(index, 1);
            this.game.entities.push(this);
        }
    }

    _showIntroScreen() {
        const intro = new IntroScreen(
            this.game,
            () => {
                this.loadLevel();
                this.introCamera = true;
                this.x = this.otter.x - 1024 / 2;
                this.y = this.otter.y - 12000;
                this._bringToFront();
            },
            () => {},
            () => {}
        );
        this.game.addEntity(intro);
    }

    // ── Level loading ─────────────────────────────────────────────────────────

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

    //  Reset (Game Over → Play Again)

    resetGame() {
        this.gameOver = false;
        this.fadeAlpha = 0;
        this.introCamera = false;
        this.x = 0;
        this.y = 0;

        this.game.click = null;
        this.game.keys[' '] = false;

        // Remove all entities except this SceneManager
        this.game.entities.forEach(entity => {
            if (entity !== this) entity.removeFromWorld = true;
        });

        // Show the intro screen again for a clean restart
        this._showIntroScreen();
        this._bringToFront();
    }

    // ── Draw ──────────────────────────────────────────────────────────────────

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

    // ── Update ────────────────────────────────────────────────────────────────

    update() {
        // Always keep gameplay-critical entities drawn on top
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

        // ── Game Over ─────────────────────────────────────────────────────────
        if (this.gameOver) {
            if (this.game.click || this.game.keys[' ']) {
                this.game.click = null;
                this.resetGame();
            }
            return;
        }

        // ── Wait until the otter has been spawned (intro screen not yet done) ─
        if (!this.otter) return;

        // ── Death → fade → game over ──────────────────────────────────────────
        if (this.otter.dead && this.otter.fragments.length === 0) {
            this.fadeAlpha += this.game.clockTick * 0.5;
            if (this.fadeAlpha >= 1) {
                this.fadeAlpha = 1;
                this.gameOver = true;
            }
        }

        // ── Intro camera drop (fires right after onPlay) ───────────────────────
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

        // ── Normal camera follow ──────────────────────────────────────────────
        this.x = this.otter.x - 1024 / 2;
        this.y = this.otter.y - 768 / 2;

        // ── Space → mushroom attack ───────────────────────────────────────────
        if (this.game.keys[' '] && !this.spacePressed) {
            this.spacePressed = true;
            const mushroom = this.game.entities.find(e => e instanceof Mushroom);
            if (mushroom) mushroom.triggerAttackManually();
        }
        if (!this.game.keys[' ']) {
            this.spacePressed = false;
        }
    }
}