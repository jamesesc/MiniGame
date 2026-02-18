class Mushroom {
    constructor(game, x, y) {
        this.game = game;
        this.scale = 6;
        this.width = 80;
        this.height = 40;

        this.x = x;
        this.y = y;
        this.groundY = y;

        this.facingRight = true;

        // Health
        this.maxHealth = 100;
        this.health = 100;

        this.damageCooldown = 0;
        this.stunned = false;
        this.dying = false;
        this.deathTimer = 0;

        // Detection / Attack zones 
        this.detectionRadius = 1200;
        this.attackRadius    = 800;

        this.detectionZone = new CircularDetectionZone(this.x, this.y, this.detectionRadius);
        this.attackZone    = new CircularDetectionZone(this.x, this.y, this.attackRadius);

        this.agro     = false;
        this.detected = false;

        // States: 'idle' | 'run' | 'attack-windup' | 'attack-dive' | 'attack-bounce' | 'attack-recover'
        this.state          = 'idle';
        this.stateTimer     = 0;
        this.attackCooldown = 0;
        this.jumpVelocity   = 0;
        this.targetX        = 0;

        // Assets
        this.Attack = ASSET_MANAGER.getAsset("./Assets/Mobs/Mushroom/Mushroom-Attack.png");
        this.Die    = ASSET_MANAGER.getAsset("./Assets/Mobs/Mushroom/Mushroom-Die.png");
        this.Hit    = ASSET_MANAGER.getAsset("./Assets/Mobs/Mushroom/Mushroom-Hit.png");
        this.Idle   = ASSET_MANAGER.getAsset("./Assets/Mobs/Mushroom/Mushroom-Idle.png");
        this.Run    = ASSET_MANAGER.getAsset("./Assets/Mobs/Mushroom/Mushroom-Run.png");
        this.Stun   = ASSET_MANAGER.getAsset("./Assets/Mobs/Mushroom/Mushroom-Stun.png");

        // Animations
        this.idleAnimation = new AnimatorFromOneImage(
            this.Idle, 25, 30, this.width, this.height, 3, 0.2, 3, true
        );

        this.runAnimation = new AnimatorFromOneImage(
            this.Run, 20, 28, 80, this.height, 8, .15, 8, true
        );

        // Phase 1 — wind-up: frames 0–4
        this.attackWindup = new AnimatorFromOneImage(
            this.Attack, 2, 32, 50, 32, 5, 0.1, 5, false
        );

        // Phase 2 — dive: frames 5–7 
        this.attackDive = new AnimatorFromOneImage(
            this.Attack, 252, 32, 50, 32, 3, 0.08, 3, false
        );

        // Phase 3 — recover: frames 8–9 
        this.attackRecover = new AnimatorFromOneImage(
            this.Attack, 402, 32, 50, 32, 2, 0.12, 2, false
        );

        this.hitAnimation = new AnimatorFromOneImage(
            this.Hit, 1, 32, 36, this.height, 4, 0.1, 4, false
        );

        this.stunAnimation = new AnimatorFromOneImage(
            this.Stun, 23, 22, 80, 80, 5, .1, 5, true
        );

        this.dieAnimation = new AnimatorFromOneImage(
            this.Die, 25, 32, 81, this.height, 9, .1, 9, false
        );

        [
            this.idleAnimation,
            this.runAnimation,
            this.attackWindup,
            this.attackDive,
            this.attackRecover,
            this.hitAnimation,
            this.stunAnimation,
            this.dieAnimation
        ].forEach(anim => anim.scale = this.scale);

        this.updateBB();
    }

    //  Helpers

    renderedWidth() {
        const anim = this.currentAnimation();
        return anim ? anim.width * anim.scale : this.width * this.scale;
    }

    centerX() { return this.x + this.renderedWidth() / 2; }
    centerY() { return this.y + (this.height * this.scale) / 2; }

    playerIsRight(player) {
        if (!player || !player.BB) return this.facingRight;
        const playerCenterX = player.BB.x + player.BB.width / 2;
        return playerCenterX > this.centerX();
    }

    // Update                      
    update() {
        // Death sequence                 
        if (this.dying) {
            const deathDuration = this.dieAnimation.frameCount * this.dieAnimation.frameDuration;
            this.deathTimer += this.game.clockTick;
            if (this.deathTimer >= deathDuration) {
                this.removeFromWorld = true;
            }
            return;
        }

        // Check for death                  
        if (this.health <= 0) {
            this.dying      = true;
            this.deathTimer = 0;
            this.dieAnimation.elapsedTime = 0;
            this.state = 'idle';
            this.BB    = null;
            return;
        }

        // Cooldown ticks                 
        if (this.damageCooldown > 0) {
            this.damageCooldown -= this.game.clockTick;
            if (this.damageCooldown <= 0) this.stunned = false;
        }

        if (this.attackCooldown > 0) {
            this.attackCooldown -= this.game.clockTick;
        }

        // Keep detection zone centres in sync           
        this.detectionZone.x = this.centerX();
        this.detectionZone.y = this.centerY();
        this.attackZone.x    = this.centerX();
        this.attackZone.y    = this.centerY();

        const player = this.game.camera?.otter;

        // Detection                    
        if (!this.agro && player && player.BB) {
            if (this.detectionZone.collide(player.BB)) {
                this.agro        = true;
                this.detected    = true;
                this.facingRight = this.playerIsRight(player);
                console.log("Mushroom detected player! Facing right:", this.facingRight);
            }
        }

        // Track player direction every frame except during the airborne dive
        // (freezing mid-air prevents the sprite flipping if player runs past)
        if (this.agro && player && player.BB && this.state !== 'attack-dive' && this.state !== 'attack-bounce') {
            this.facingRight = this.playerIsRight(player);
        }

        // Lose agro only when idle and player leaves detection zone
        if (this.agro && player && player.BB) {
            if (!this.detectionZone.collide(player.BB) && this.state === 'idle') {
                this.agro = false;
            }
        }

        //  State machine                  
        switch (this.state) {

            case 'idle':
                if (this.agro && !this.stunned && player && player.BB) {
                    if (this.attackZone.collide(player.BB) && this.attackCooldown <= 0) {
                        this.startWindup(player);
                    } else if (!this.attackZone.collide(player.BB)) {
                        this.state = 'run';
                    }
                }
                break;

            case 'run':
                if (this.stunned) { this.state = 'idle'; break; }
                if (player) {
                    const dx = player.x - this.x;
                    this.x += Math.sign(dx) * 300 * this.game.clockTick;

                    if (player.BB && this.attackZone.collide(player.BB) && this.attackCooldown <= 0) {
                        this.startWindup(player);
                    }
                    if (player.BB && !this.detectionZone.collide(player.BB)) {
                        this.agro  = false;
                        this.state = 'idle';
                    }
                }
                break;

            //    Phase 1: wind-up — plays frames 0-4, then launches     
            case 'attack-windup':
                this.stateTimer += this.game.clockTick;
                if (this.stateTimer >= this.attackWindup.frameCount * this.attackWindup.frameDuration) {
                    this.state      = 'attack-dive';
                    this.stateTimer = 0;

                    if (player && player.BB) {
                        // Target the otter's centre point
                        const otterCenterX = player.BB.x + player.BB.width / 2;

                        // Random ±10px offset
                        const randomOffset = (Math.random() * 20) - 10;
                        this.targetX = otterCenterX + randomOffset;

                        // Pre-calculate horizontal velocity at launch so the mushroom
                        // flies in a straight direction and can overshoot the player
                        const distX = this.targetX - this.centerX();
                        this.launchDirX = Math.sign(distX) * 12;

                        // Distance from mushroom centre to otter centre
                        const dist = Math.abs(otterCenterX - this.centerX());

                        // Closer = higher launch. Map distance onto velocity:
                        // Clamping the dist so it never exceeds attackRadius
                        const clampedDist = Math.min(dist, this.attackRadius);
                        const t = clampedDist / this.attackRadius; // 0=close, 1=far edge
                        this.jumpVelocity = -32 + (t * 18); // lerp from -32 to -14
                    } else {
                        this.jumpVelocity = -22; // fallback if no player data
                        this.targetX      = this.x + (this.facingRight ? 200 : -200);
                        this.launchDirX   = this.facingRight ? 12 : -12;
                    }

                    this.attackDive.elapsedTime = 0;
                }
                break;

            // Phase 2: dive — mushroom flies through the air     
            case 'attack-dive': {
                this.stateTimer   += this.game.clockTick;
                this.y            += this.jumpVelocity;
                this.jumpVelocity += .4; // gravity

                this.x += (this.launchDirX || 12);

                // Only check for hits on the way DOWN
                if (this.jumpVelocity > 0 && this.BB && player && player.BB) {
                    if (this.BB.collide(player.BB)) {
                        // Hit the player — deal damage and bounce off
                        if (typeof player.takeDamage === 'function') {
                            player.takeDamage(20);
                        }
                        // Bounce back up at half velocity, reverse horizontal direction
                        this.jumpVelocity = -10;
                        this.launchDirX   = -(this.launchDirX || 12);
                        this.state        = 'attack-bounce';
                        this.stateTimer   = 0;
                        break;
                    }
                }

                // Missed — land normally
                if (this.y >= this.groundY) {
                    this.y            = this.groundY;
                    this.jumpVelocity = 0;
                    this.state        = 'attack-recover';
                    this.stateTimer   = 0;
                    this.attackRecover.elapsedTime = 0;
                    if (player && player.BB) this.facingRight = this.playerIsRight(player);
                }
                break;
            }

            // Bounce — ricocheted off the player, still airborne     
            case 'attack-bounce': {
                this.y            += this.jumpVelocity;
                this.jumpVelocity += 1.2;
                this.x            += this.launchDirX;

                if (this.y >= this.groundY) {
                    this.y            = this.groundY;
                    this.jumpVelocity = 0;
                    this.state        = 'attack-recover';
                    this.stateTimer   = 0;
                    this.attackRecover.elapsedTime = 0;
                    if (player && player.BB) this.facingRight = this.playerIsRight(player);
                }
                break;
            }

            // Phase 3: recover — plays frames 8-9, then back to idle   
            case 'attack-recover':
                this.stateTimer += this.game.clockTick;
                if (this.stateTimer >= this.attackRecover.frameCount * this.attackRecover.frameDuration + 0.4) {
                    this.state          = 'idle';
                    this.attackCooldown = 3;
                }
                break;
        }

        this.updateBB();
    }

    // Starting a new attack cycle from either idle or run
    startWindup(player) {
        this.state      = 'attack-windup';
        this.stateTimer = 0;
        this.targetX    = player.x;
        this.attackWindup.elapsedTime = 0;
    }

    //    Draw                        
    draw(ctx) {
        if (this.health <= 0 && !this.dying) return;

        if (this.dying) {
            ctx.save();
            this.applyFlip(ctx, this.dieAnimation);
            this.dieAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y + 10);
            ctx.restore();
            return;
        }

        ctx.save();

        if (this.damageCooldown > 0) ctx.globalAlpha = 0.5;

        const anim = this.currentAnimation();
        if (anim) {
            this.applyFlip(ctx, anim);
            const yOffset = (this.damageCooldown > 0) ? -40 : 0;
            anim.drawFrame(this.game.clockTick, ctx, this.x, this.y + yOffset);
        }

        ctx.restore();

        this.drawHealthBar(ctx);

        if (this.game.options.debugging && this.BB) {
            ctx.strokeStyle = "Red";
            ctx.lineWidth   = 5;
            ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);

            ctx.save();
            ctx.beginPath();
            ctx.setLineDash([5, 15]);
            ctx.strokeStyle = "Yellow";
            ctx.lineWidth   = 2;
            ctx.arc(this.centerX(), this.centerY(), this.detectionRadius, 0, Math.PI * 2);
            ctx.stroke();

            ctx.beginPath();
            ctx.setLineDash([]);
            ctx.strokeStyle = "Orange";
            ctx.lineWidth   = 2;
            ctx.arc(this.centerX(), this.centerY(), this.attackRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    }

    // Sprite angle
    applyFlip(ctx, anim) {
        if (this.facingRight) {
            const pivotX = this.BB ? this.BB.x + this.BB.width / 2 : this.x + 82;
            ctx.translate(pivotX, 0);
            ctx.scale(-1, 1);
            ctx.translate(-pivotX, 0);
        }
    }

    // Animation selector                   
    currentAnimation() {
        if (this.damageCooldown > 0) return this.stunAnimation;

        switch (this.state) {
            case 'run':            return this.runAnimation;
            case 'attack-windup':  return this.attackWindup;
            case 'attack-dive':
            case 'attack-bounce':  return this.attackDive;
            case 'attack-recover': return this.attackRecover;
            case 'idle':
            default:               return this.idleAnimation;
        }
    }

    // Bounding box                     
    updateBB() {
        this.lastBB = this.BB;
        this.BB     = new BoundingBox(this.x + 35, this.y + 85, 95, 90);
    }

    // Health bar                     
    drawHealthBar(ctx) {
        if (!this.BB) return;
        const ratio  = this.health / this.maxHealth;
        const width  = this.BB.width;
        const height = 25;
        const xPos   = this.BB.x + 10;
        const yPos   = this.BB.y - 125;

        ctx.fillStyle = "black";
        ctx.fillRect(xPos - 3, yPos - 3, width + 3, height + 3);

        ctx.fillStyle = ratio > 0.5 ? "green" : ratio > 0.25 ? "orange" : "red";
        ctx.fillRect(xPos, yPos, Math.max(0, width * ratio), height);
    }

    // Take damage                      
    takeDamage(amount) {
        if (this.damageCooldown > 0) return;

        this.health -= amount;

        if (this.health <= 0) {
            this.health     = 0;
            this.dying      = true;
            this.deathTimer = 0;
            this.dieAnimation.elapsedTime = 0;
            this.state = 'idle';
            this.BB    = null;
            return;
        }

        this.damageCooldown = 1.0;
        this.stunned        = true;

        // Interrupt any ongoing attack
        this.state      = 'idle';
        this.stateTimer = 0;
        this.hitAnimation.elapsedTime  = 0;
        this.stunAnimation.elapsedTime = 0;

        const player = this.game.camera?.otter;
        if (player) {
            this.x += (this.x > player.x ? 1 : -1) * 50;
        } else {
            this.x += 50;
        }
    }

    // Manual attack trigger                  
    triggerAttackManually() {
        if (this.state === 'idle' && this.attackCooldown <= 0) {
            const player = this.game.camera?.otter;
            if (player) this.startWindup(player);
            this.attackCooldown = 3;
            console.log("Mushroom: manual attack triggered!");
        }
    }
}