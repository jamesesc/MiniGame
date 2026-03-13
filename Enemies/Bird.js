class Bird {
    // Sprite config
    frameW = 160;
    frameH = 160;
    scale  = 1.5;

    // Spritesheet rows
    IDLE_ROW  = 0;
    FLY_ROW   = 160;
    EAT_ROW   = 320;

    // Detection
    fleeRadius = 500;

    // Animation Debug
    // Set to 'idle', 'fly', or 'eat' to lock that animation forever.
    // Bird won't move, flee, or change state while this is set.
    // Set to null to run normally.
    debugAnim = null; 

    constructor(game, x, groundY) {
        this.game    = game;
        this.x       = x;
        this.groundY = groundY;

        this.state = 'idle';

        this.velX      = 0;
        this.velY      = 0;
        this.gravity   = 1800;
        this.onGround  = true;
        this.targetFlyHeight = 0; 


        this.idleTimer    = 1.0 + Math.random() * 1.5;
        this.eatTimer     = 0;
        this.flyTimer     = 0;
        this.flyDirection = 1;

        this.spritesheet = ASSET_MANAGER.getAsset("./Assets/Mobs/Bird/Bird.png");

        this.animIdle = new AnimatorFromOneImage(
            this.spritesheet,
            0, 3,
            16, 15,
            2, 0.4, 2, true
        );
        this.animFly = new AnimatorFromOneImage(
            this.spritesheet,
            0, 16,
            16, 16,
            8, .08, 0, true
        );
        this.animEat = new AnimatorFromOneImage(
            this.spritesheet,
            0, 38,
            16, 16,
            3, .2, 0, true
        );

        this.animIdle.scale = 6;
        this.animFly.scale  = 6;
        this.animEat.scale  = 7;

        this.snapToGround(groundY);

        this.detectionZone = new CircularDetectionZone(
            this.x + (17 * 6) / 2,
            this.y + (15 * 6) / 2,
            this.fleeRadius
        );

        this.updateBB();
    }

    snapToGround(groundSurfaceY) {
        this.y = groundSurfaceY - (15 * 6);
    }

    update() {
        if (this.debugAnim !== null) {
            this.updateBB();
            return;
        }

        const dt    = this.game.clockTick;
        const otter = this.game.camera?.otter;

        const ground       = this.game.entities.find(e => e instanceof Ground);
        const liveGroundY  = ground ? 1180 : this.groundY;
        const sitY         = liveGroundY - (15 * 6);

        if (this.state === 'idle') {
            this.y = sitY;
        } else if (this.state === 'eating') {
            this.y = sitY + 11;
        }

        this.detectionZone.x = this.x + (17 * 6) / 2;
        this.detectionZone.y = this.y + (15 * 6) / 2;

        if (this.state !== 'fleeing' && this.state !== 'flying') {
            if (otter && otter.BB && this.detectionZone.collide(otter.BB)) {
                this.startFlee(otter);
            }
        }

        switch (this.state) {
            case 'idle':
                this.idleTimer -= dt;
                if (this.idleTimer <= 0) this.pickNextAction();
                break;

            case 'hopping':
                this.velY += this.gravity * dt;
                this.x   += this.velX * dt;
                this.y   += this.velY * dt;

                if (this.y >= sitY) {
                    this.y        = sitY;
                    this.velY     = 0;
                    this.velX     = 0;
                    this.onGround = true;
                    this.state    = 'idle';
                    this.idleTimer = 0.3 + Math.random() * 0.5;
                }
                break;

            case 'eating':
                this.eatTimer -= dt;
                if (this.eatTimer <= 0) {
                    this.state     = 'idle';
                    this.idleTimer = 1.0 + Math.random() * 1.5;
                }
                break;

            case 'fleeing':
                this.x += this.velX * dt;
                this.y += this.velY * dt;
                if (this.y <= this.targetFlyHeight) {
                    this.y = this.targetFlyHeight;
                    this.state = 'flying';
                    this.velY = 0; 
                    this.velX = this.flyDirection * 600; 
                }
                break;

            case 'flying':

                this.velY += this.gravity * 0.05 * dt; 
                this.x += this.velX * dt;
                this.y += this.velY * dt;

                if (this.y >= sitY) {
                    this.y = sitY;
                    this.velY = 0;
                    this.velX = 0;
                    this.state = 'idle';
                    this.idleTimer = 0.5 + Math.random() * 1.0;
                }

                const camX = this.game.camera?.x ?? 0;
                const canvasW = this.game.ctx.canvas.width;
                if (this.x > camX + canvasW + 400 || this.x < camX - 400) {
                    this.removeFromWorld = true;
                }
                break;
        }

        this.updateBB();
    }
    

    pickNextAction() {
        if (Math.random() < 0.45) {
            this.state    = 'hopping';
            this.onGround = false;
            this.velX     = (Math.random() < 0.5 ? -1 : 1) * (80 + Math.random() * 120);
            this.velY     = -(300 + Math.random() * 150);
        } else {
            this.state    = 'eating';
            this.eatTimer = 1.0 + Math.random() * 1.5;
        }
    }

    startFlee(otter) {
        this.state        = 'fleeing';
        this.flyDirection = this.x > otter.x ? 1 : -1;
        this.velX = this.flyDirection * 300;
        this.targetFlyHeight = this.y - (400 + Math.random() * 150);
        this.velX         = this.flyDirection * 500;
        this.velY = -180; 
        this.flyTimer     = 0.4;
    }

    draw(ctx) {
        if (!this.spritesheet || !(this.spritesheet instanceof HTMLImageElement)) return;

        const facingRight = this.velX > 0 ||
            (this.state === 'flying' && this.flyDirection === 1) ||
            (this.state === 'fleeing' && this.flyDirection === 1);

        ctx.save();

        let drawX = this.x;
        let drawY = this.y;

        if (facingRight) {
            ctx.translate(this.x + 17 * 6, this.y);
            ctx.scale(-1, 1);
            drawX = 0;
            drawY = 0;
        }

        if (this.debugAnim !== null) {
            const debugMap = {
                'idle': this.animIdle,
                'fly':  this.animFly,
                'eat':  this.animEat,
            };
            const anim = debugMap[this.debugAnim] ?? this.animIdle;
            anim.drawFrame(this.game.clockTick, ctx, drawX, drawY);
            ctx.restore();

            ctx.strokeStyle = 'yellow';
            ctx.lineWidth   = 3;
            ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);
            ctx.fillStyle = 'yellow';
            ctx.font = 'bold 20px monospace';
            ctx.fillText(
                `debugAnim:"${this.debugAnim}"  state:${this.state}  y:${Math.round(this.y)}`,
                this.BB.x, this.BB.y - 8
            );
            return;
        }

        switch (this.state) {
            case 'idle':
                this.animIdle.drawFrame(this.game.clockTick, ctx, drawX, drawY);
                break;
            case 'hopping':
            case 'fleeing':
            case 'flying':
                this.animFly.drawFrame(this.game.clockTick, ctx, drawX, drawY);
                break;
            case 'eating':
                this.animEat.drawFrame(this.game.clockTick, ctx, drawX, drawY);
                break;
        }

        ctx.restore();

        if (this.game.options.debugging) {
            ctx.strokeStyle = 'lime';
            ctx.lineWidth   = 2;
            ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);
            this.detectionZone.draw(ctx);
        }
    }

    updateBB() {
        this.lastBB = this.BB;
        this.BB = new BoundingBox(
            this.x + 5,
            this.y + 5,
            17 * 6 - 10,
            15 * 6 - 5
        );
    }
}

// Bird Spawner

class BirdSpawner {
    constructor(game) {
        this.game    = game;
        this.spawned = false;
    }

    update() {
        if (!this.spawned) {
            this.spawned = true;

            const ground  = this.game.entities.find(e => e instanceof Ground);
            const groundY = ground?.BB?.y ?? 1050;

            [2000].forEach(x => {
                this.game.addEntity(new Bird(this.game, x, 1320));
            });
        }
        this.removeFromWorld = true;
    }

    draw() {}
}