class ChestDrop {
    constructor(game, x, y, type) {
        this.game = game;
        this.type = type;

        this.x = x;
        this.y = y;

        this.velX = (type === "heart" ? 1 : -1) * (200 + Math.random() * 100);
        this.velY = -(600 + Math.random() * 150);
        this.gravity = 800;

        this.travelTime = 0;
        this.lifetime = 6;

        this.collected = false;
        this.landed = false;
        this.landedY = 0;

        if (this.type === "heart") {
            this.scale = 6;
            this.width = 19;
            this.height = 19;
            this.spritesheet = ASSET_MANAGER.getAsset("./Assets/Items/Hearts.png");
            this.animation = new AnimatorFromOneImage(
                this.spritesheet,
                102, 0,
                this.width, this.height,
                5, .2, 5, true
            );
        } else {
            this.scale = 2;
            this.width = 100;
            this.height = 100;
            this.spritesheet = ASSET_MANAGER.getAsset("./Assets/Items/Strawberrycake.png");
            this.animation = new AnimatorFromOneImage(
                this.spritesheet,
                0, 0,
                this.width, this.height,
                1, .5, 0, true
            );
        }

        this.animation.scale = this.scale;
        this.updateBB();
    }

    update() {
        if (this.collected) { this.removeFromWorld = true; return; }

        if (this.landed) {
            this.y = this.landedY;
            this.updateBB();
            const otter = this.game.camera?.otter;
            if (otter && otter.BB && this.BB && otter.BB.collide(this.BB)) {
                this.collected = true;
                this.applyEffects(otter);
            }
            return;
        }

        const dt = this.game.clockTick;
        this.travelTime += dt;
        if (this.travelTime >= this.lifetime) { this.removeFromWorld = true; return; }

        this.velY += this.gravity * dt;

        this.x += this.velX * dt;
        this.y += this.velY * dt;

        this.velX *= 0.995;

        this.updateBB();

        const ground = this.game.entities.find(e => e instanceof Ground);
        if (ground && ground.BB && this.BB && this.BB.collide(ground.BB)) {
            this.landed = true;
            this.landedY = ground.BB.y - this.height * this.scale;
            this.y = this.landedY;
            this.updateBB();
            return;
        }

        const otter = this.game.camera?.otter;
        if (otter && otter.BB && this.BB && otter.BB.collide(this.BB)) {
            this.collected = true;
            this.applyEffects(otter);
        }
    }

    applyEffects(otter) {
        if (this.type === "heart") {
            otter.health = Math.min(120, otter.health + 20);
            otter.healFlash = 0.7;
            for (let j = 0; j < 5; j++) {
                this.game.addEntity(new HeartParticle(
                    this.game,
                    otter.BB.x + otter.BB.width / 2,
                    otter.BB.y
                ));
            }
        } else {
            if (typeof otter.activateCakePower === 'function') otter.activateCakePower();
        }
    }

    draw(ctx) {
        if (!this.spritesheet || this.collected) return;
        this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }

    updateBB() {
        this.lastBB = this.BB;
        this.BB = new BoundingBox(this.x + 4, this.y + 4, this.width * this.scale - 8, this.height * this.scale - 8);
    }
}

class ChestItem {
    constructor(game, x, y) {
        this.game = game;
        this.scale = 15;
        this.width = 32;
        this.height = 32;

        this.x = x !== undefined ? x : 1200;
        this.y = y !== undefined ? y : 950;

        this.isOpen = false;
        this.bobOffset = 0;

        this.spritesheet = ASSET_MANAGER.getAsset("./Assets/Items/TreasureChest.png");

        this.animationClosed = new AnimatorFromOneImage(
            this.spritesheet,
            1, 5, 36, 18, 4, .3, 0, true
        );

        this.animationOpen = new AnimatorFromOneImage(
            this.spritesheet,
            145, 2, 36, 21, 4, .09, 0, false
        );

        this.animationClosed.scale = this.scale;
        this.animationOpen.scale = this.scale;

        this.updateBB();
    }

    open() {
        if (!this.isOpen) {
            this.isOpen = true;
            this.animationOpen.elapsedTime = 0;

            const cx = this.BB.x + this.BB.width / 2;
            const cy = this.BB.y;

            const types = ["heart", "cake"];
            const type = types[Math.floor(Math.random() * types.length)];

            this.game.addEntity(new ChestDrop(this.game, cx, cy, type));
        }
    }

    update() {
        if (!this.isOpen) {
            this.bobOffset = Math.sin(this.game.timer.gameTime * 2.5) * 3;
        }
        this.updateBB();
    }

    draw(ctx) {
        if (this.spritesheet) {
            const drawY = this.y + this.bobOffset;
            const anim = this.isOpen ? this.animationOpen : this.animationClosed;
            anim.drawFrame(this.game.clockTick, ctx, this.x, drawY);
        }

        if (this.BB) {
            ctx.strokeStyle = this.isOpen ? "#00ff88" : "Orange";
            ctx.lineWidth = 4;
            ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);
        }
    }

    updateBB() {
        this.lastBB = this.BB;
        this.BB = new BoundingBox(
            this.x + 65,
            this.y,
            this.width * this.scale - 180,
            this.height * this.scale - 10
        );
    }
}

class ChestSpawner {
    constructor(game) {
        this.game = game;
        this.spawnPoints = [
            { x: 800,  y: 950 },
            { x: 1600, y: 950 },
            { x: 2400, y: 950 },
            { x: 3200, y: 950 },
        ];
        this.spawned = false;
    }

    update() {
        if (!this.spawned) {
            this.spawnPoints.forEach(point => {
                this.game.addEntity(new ChestItem(this.game, point.x, point.y));
            });
            this.spawned = true;
        }
        this.removeFromWorld = true;
    }

    draw() {}
}