class Frog {
    constructor(game, x, y) {
        this.game = game;
        this.scale = 6;
        this.width = 20;
        this.height = 15;
        
        this.x = x; 
        this.y = y;



        this.agro = false;
        this.detected = false;
        this.attackSequenceState = 0; // 0 = idle, 1 = attack anim, 2 = tongue extending
        this.tongueLength = 0; // Current tongue extension
        this.maxTongueLength = 300; // Max pixels the tongue can extend
        this.tongueAngle = 0; // Angle towards player


        
        // Good: x, 2000, y 1040 TESTING
        // this.x = x || 2000; 
        // this.y = y || 1040;

        this.maxHealth = 100;
        this.health = 100; 
        
        this.damageCooldown = 0; 

        this.detectionRadius = 1500;
        this.detectionZone = new CircularDetectionZone(this.x, this.y, this.detectionRadius);

        this.attackRadius = 400;
        this.attackZone = new CircularDetectionZone(this.x, this.y, this.attackRadius);



        this.Idle = ASSET_MANAGER.getAsset("./Assets/Mobs/Frogs/BlueBlue/ToxicFrogBlueBlue_Idle.png");

        this.Hurt = ASSET_MANAGER.getAsset("./Assets/Mobs/Frogs/BlueBlue/ToxicFrogBlueBlue_Hurt.png");

        this.Hop = ASSET_MANAGER.getAsset("./Assets/Mobs/Frogs/BlueBlue/ToxicFrogBlueBlue_Hop.png");

        this.Explosion = ASSET_MANAGER.getAsset("./Assets/Mobs/Frogs/BlueBlue/ToxicFrogBlueBlue_Explosion.png");

        this.Attack = ASSET_MANAGER.getAsset("./Assets/Mobs/Frogs/BlueBlue/ToxicFrogBlueBlue_Attack.png");
        
        this.Tongue = ASSET_MANAGER.getAsset("./Assets/Mobs/Frogs/BlueBlue/Frog Tongue.png");

        this.AttackNoTongueFrame = ASSET_MANAGER.getAsset("./Assets/Mobs/Frogs/BlueBlue/ToxicFrogBlueBlue_AttackNoTongue.png");



        // DELETE THIS 
        this.spritesheet = ASSET_MANAGER.getAsset("./Assets/Mobs/Frogs/Green-Frog.png");
        this.animation = new AnimatorFromOneImage(
            this.spritesheet, 35, 5, this.width, this.height, 4, .3, 1 
        );


        this.AttackTongue1 = new AnimatorFromOneImage(
            this.Tongue,
            22, 8,
            20, 15,
            1, 
            1,
            1,
            false
        )

        this.AttackTongue2 = new AnimatorFromOneImage(
            this.Tongue,
            61, 7,
            20, 15,
            1, 
            1,
            1,
            false
        )

        
        this.AttackTongue3 = new AnimatorFromOneImage(
            this.Tongue,
            105, 7,
            20, 15,
            1, 
            1,
            1,
            false
        )



        this.AttackNoTongue = new AnimatorFromOneImage(
            this.AttackNoTongueFrame,
            11, 16,
            47.5, 48,
            4, 
            4,
            4, 
            false
        )

        
        this.IdleAnimation = new AnimatorFromOneImage(
            this.Idle,
            11, 16,
            48, 48,
            8, 
            .1,
            8, 
            true
        )

        this.HurtAnimation = new AnimatorFromOneImage(
            this.Hurt,
            11, 16,
            48, 48,
            4, 
            .1,
            4, 
            true
        )

        
        this.HopAnimation = new AnimatorFromOneImage(
            this.Hop,
            11, 16,
            47.6, 15,
            7, 
            .1,
            7, 
            true
        )

        
        this.ExplosionAnimation = new AnimatorFromOneImage(
            this.Explosion,
            11, 16,
            47, 48,
            9, 
            .1,
            9, 
            true
        )

                
        this.AttackAnimation = new AnimatorFromOneImage(
            this.Attack,
            11, 16,
            47.5, 48,
            6, 
            .1,
            6, 
            true
        )





        this.animation.scale = this.scale;
        this.AttackNoTongue.scale = this.scale;
        this.IdleAnimation.scale = this.scale;
        this.HurtAnimation.scale = this.scale;
        this.HopAnimation.scale = this.scale;
        this.ExplosionAnimation.scale = this.scale;
        this.AttackAnimation.scale = this.scale;
        this.AttackTongue1.scale = this.scale;
        this.AttackTongue2.scale = this.scale;
        this.AttackTongue3.scale = this.scale; 


        this.updateBB();
    }

   update() {
    if (this.damageCooldown > 0) {
        this.damageCooldown -= this.game.clockTick;
    }

    const centerX = this.x + (this.width * this.scale) / 2;
    const centerY = this.y + (this.height * this.scale) / 2;
    this.detectionZone.x = centerX;
    this.detectionZone.y = centerY;
    this.attackZone.x = centerX;
    this.attackZone.y = centerY;

    const player = this.game.camera.otter;

    // Detection logic
    if (!this.agro && player && player.BB) {
        // Checking if the player enters the detection zone
        if (this.detectionZone.collide(player.BB)) {
            this.agro = true;
            this.detected = true;
            console.log("PLAYER IS DETECTED")
        }
    } else if (this.agro && player && player.BB) {
        // Checking player is in attack zone
        if (this.attackZone.collide(player.BB)) {
            if (this.attackSequenceState === 0) {
                this.attackSequenceState = 1;
                this.AttackNoTongue.elapsedTime = 0; // Reset animation
            
                const playerCenterX = player.BB.x + (player.BB.width / 2);
                const playerCenterY = player.BB.y + (player.BB.height / 2);
                const frogMouthX = this.x + (this.width * this.scale) / 2 + 55;
                const frogMouthY = this.y + (this.height * this.scale) / 2;
                
                this.tongueAngle = Math.atan2(playerCenterY - frogMouthY, playerCenterX - frogMouthX);
                const dx = playerCenterX - frogMouthX;
                const dy = playerCenterY - frogMouthY;
                const distanceToPlayer = Math.hypot(dx, dy);
                this.maxTongueLength = Math.min(distanceToPlayer, 400); // Cap at 400
                
                console.log("Distance to player:", distanceToPlayer, "Capped at:", this.maxTongueLength);
            }

            console.log("ATTACK MODE")
        } else {
            if (this.attackSequenceState === 0) {
                this.attackSequenceState = 0; // Stay idle
            }
        }
        
       if (this.attackSequenceState === 1) {
        if (!this.attackStartTime) {
            this.attackStartTime = this.game.timer.gameTime;
        }
        
        const timeSinceAttackStart = this.game.timer.gameTime - this.attackStartTime;
        
        if (timeSinceAttackStart >= 0.6) {
            this.attackSequenceState = 2; // Move to Tongue1 animation
            this.tongueAnimPhase = 1; // Start with tongue1
            this.tonguePhaseTimer = 0;
            this.attackStartTime = null;
            console.log("Tongue1 phase starting");
        }
    }

    // Tongue animation phases
    if (this.attackSequenceState === 2) {
        this.tonguePhaseTimer += this.game.clockTick;
        
        // Phase 1 - Show Tongue1 for 0.2 seconds
        if (this.tongueAnimPhase === 1 && this.tonguePhaseTimer >= 0.2) {
            this.tongueAnimPhase = 2;
            this.tonguePhaseTimer = 0;
            this.tongueLength = 0;
            console.log("Tongue2 stretch phase");
        }
        
        // Phase 2 - Tongue2 stretches out
        if (this.tongueAnimPhase === 2) {
            this.tongueLength += 600 * this.game.clockTick;
            if (this.tongueLength >= this.maxTongueLength) {
                this.tongueLength = this.maxTongueLength;
                
                if (!this.tongueHoldTimer) {
                    this.tongueHoldTimer = 0.3;
                }
                this.tongueHoldTimer -= this.game.clockTick;
                
                if (this.tongueHoldTimer <= 0) {
                    this.tongueAnimPhase = 3; 
                    this.tongueHoldTimer = null;
                    this.tonguePhaseTimer = 0;
                    console.log("Tongue3 retract phase");
                }
            }
        }
        
        // Phase 3 - Show Tongue3 and retract
        if (this.tongueAnimPhase === 3) {
            this.tongueLength -= 800 * this.game.clockTick;
            if (this.tongueLength <= 0) {
                this.tongueLength = 0;
                this.attackSequenceState = 0; // Back to idle
                this.tongueAnimPhase = 0;
                this.AttackNoTongue.elapsedTime = 0;
            }
        }
    }

        this.updateBB();
        }
   }

    draw(ctx) {
        if (this.Hop) {
            if (this.damageCooldown > 0) {
                ctx.globalAlpha = 0.5; 
            }
            
            // Choose animation based on state
            if (this.attackSequenceState === 1) {
                this.AttackNoTongue.drawFrame(this.game.clockTick, ctx, this.x, this.y);
            } else if (this.attackSequenceState === 2) {
                const lastFrame = this.AttackNoTongue.frameCount - 1; // Last frame index
                
                ctx.drawImage(
                    this.AttackNoTongue.spritesheet,
                    this.AttackNoTongue.xStart + (lastFrame * this.AttackNoTongue.width),
                    this.AttackNoTongue.yStart,
                    this.AttackNoTongue.width,
                    this.AttackNoTongue.height,
                    this.x,
                    this.y,
                    this.AttackNoTongue.width * this.AttackNoTongue.scale,
                    this.AttackNoTongue.height * this.AttackNoTongue.scale
                );
            } else {
                this.IdleAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
            }

            // Draw tongue during phase 2
            if (this.attackSequenceState === 2) {
                this.drawTongue(ctx);
            }
            
            ctx.globalAlpha = 1.0; 
        }

            this.drawHealthBar(ctx);


        if (this.game.options.debugging) {
            // --- Draw Bounding Box (Existing) ---
            ctx.strokeStyle = "Red";
            ctx.lineWidth = 5;
            ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);

            // --- Draw Detection Zone (Large Circle) ---
            ctx.beginPath();
            ctx.setLineDash([5, 15]); // Optional: makes the line dashed
            ctx.strokeStyle = "Yellow";
            ctx.lineWidth = 2;
            // Assuming your CircularDetectionZone has x, y, and radius properties
            ctx.arc(this.x, this.y, this.detectionRadius, 0, Math.PI * 2);
            ctx.stroke();

            // --- Draw Attack Zone (Smaller Circle) ---
            ctx.beginPath();
            ctx.setLineDash([]); // Reset to solid line
            ctx.strokeStyle = "Orange";
            ctx.arc(this.x, this.y, this.attackRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }


    updateBB() {
        this.lastBB = this.BB;
        this.BB = new BoundingBox(this.x, this.y, 125, 100); 
    }

    drawHealthBar(ctx) {
        const ratio = this.health / this.maxHealth;
        const width = this.BB.width; 
        const height = 25;
        
        const xPos = this.BB.x;
        const yPos = this.BB.y - 86; 

        ctx.fillStyle = "black";
        ctx.fillRect(xPos - 3, yPos - 3, width + 3, height + 3); 

        if (ratio > 0.5) {
            ctx.fillStyle = "green";
        } else if (ratio > 0.25) {
            ctx.fillStyle = "orange";
        } else {
            ctx.fillStyle = "red";
        }
        
        ctx.fillRect(xPos, yPos, Math.max(0, width * ratio), height);
    }

    takeDamage(amount) {
        if (this.damageCooldown <= 0) {
            this.health -= amount;
            this.damageCooldown = 0.5; 
            this.x += 50; 
        }
    }

    drawTongue(ctx) {
        const frogMouthX = this.x + (this.width * this.scale) / 2 + 55;
        const frogMouthY = this.y + (this.height * this.scale) / 2;
        
        const segmentWidth = 20 * this.scale;  
        const segmentHeight = 25 * this.scale;
        
        // Calculate tongue dimensions
        const targetX = frogMouthX + Math.cos(this.tongueAngle) * this.tongueLength;
        const targetY = frogMouthY + Math.sin(this.tongueAngle) * this.tongueLength;
        
        ctx.save();
        ctx.translate(frogMouthX, frogMouthY);
        ctx.rotate(this.tongueAngle);
        
        // PHASE 1 - Show Tongue1 (preparing)
        if (this.tongueAnimPhase === 1) {
            ctx.drawImage(
                this.AttackTongue1.spritesheet,
                this.AttackTongue1.xStart, this.AttackTongue1.yStart - 4,
                this.AttackTongue1.width, this.AttackTongue1.height,
                0, -segmentHeight / 2,
                segmentWidth, segmentHeight
            );
        }
        
        // PHASE 2 - Show Tongue2 (stretching)
        if (this.tongueAnimPhase === 2 && this.tongueLength > 0) {
            ctx.drawImage(
                this.AttackTongue2.spritesheet,
                this.AttackTongue2.xStart, this.AttackTongue2.yStart - 4,
                this.AttackTongue2.width, this.AttackTongue2.height,
                0, -segmentHeight / 2,
                this.tongueLength, segmentHeight  // Stretch based on length
            );
        }
        
        // PHASE 3 - Show Tongue3 (retracting)
        if (this.tongueAnimPhase === 3) {
            ctx.drawImage(
                this.AttackTongue3.spritesheet,
                this.AttackTongue3.xStart, this.AttackTongue3.yStart - 3,
                this.AttackTongue3.width, this.AttackTongue3.height,
                0, -segmentHeight / 2,
                this.tongueLength, segmentHeight  // Shrinks as it retracts
            );
        }
        
        ctx.restore();
        
        if (this.game.options.debugging) {
            ctx.strokeStyle = "lime";
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(frogMouthX, frogMouthY);
            ctx.lineTo(targetX, targetY);
            ctx.stroke();
        }
    }
}