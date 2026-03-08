/**
 * HealthBar.js
 * Displays the player's health and stamina in a stylized bar format.
 * Shows the player's profile image, current health, and stamina.
 * Changes color based on health state (healthy, hurt, critical) and stamina effects.
 */
class HealthBar {
    // A list of colors used for different health states and stamina
    static COLORS = {
        border:   "white",
        back:     "rgba(0, 0, 0, 0.7)",
        healthy:  "#4CAF50",
        hurt:     "#FF9800",
        critical: "#F44336",
        stamina:  "#32a1e3",
        cake:     "#FF69B4",
    };

    // Crop values for the otter profile image in the health bar
    static PROFILE_CROP = { sourceX: 106, sourceY: 74, sourceW: 26, sourceH: 20 };

    /**
     * Initializes a new instance of the HealthBar class..
     * 
     * @param {*} game Represents the game engine instance, used to access game state and resources.
     */
    constructor(game) {
        this.game  = game;

        // Layout
        this.x = 40;
        this.y = 40;
        this.boxSize = 120;
        this.barWidth = 400;
        this.barHeight = 80;

        // Getting the profile image for the health bar
        this.profileImage = ASSET_MANAGER.getAsset("./Assets/Otter/Idle/otter_idle_1.png");
    }

    update() {
        // Nothing to update for the health bar itself, it will read the player's health and stamina directly when drawing
    }

    draw(ctx) {
        // Safety check to ensure we have a player and that the ending sequence isn't active
        if (this.game.endingActive) {
            return;
        }

        // Get the player (otter) from the camera to access health and stamina
        const otter = this.game.camera.otter;
        if (!otter) {
            return;
        }

        // Save the current context state and reset transformations to draw the health bar in screen space
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Draw the profile box, health bar, and stamina bar
        this.drawProfile(ctx);
        this.drawHealthBar(ctx, otter);
        this.drawStaminaBar(ctx, otter);

        ctx.restore();
    }


    // Private Methods


    /**
     * Draws the profile box for the health bar.
     * @param {*} ctx The canvas 2D rendering context.
     */
    drawProfile(ctx) {
        // Destructure crop values for easier access
        const { sourceX: sx, sourceY: sy, sourceW: sw, sourceH: sh } = HealthBar.PROFILE_CROP;

        // Draw the background box for the profile image
        ctx.fillStyle = HealthBar.COLORS.back;
        ctx.fillRect(this.x, this.y, this.boxSize, this.boxSize);

        // Draw the otter profile image if it's loaded, using the specified crop from the sprite sheet
        if (this.profileImage) {
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(
                this.profileImage,
                sx, sy, sw, sh,
                this.x + 5, this.y + 5,
                this.boxSize - 10, this.boxSize - 10
            );
        }

        // Draw the border around the profile box
        ctx.strokeStyle = HealthBar.COLORS.border;
        ctx.lineWidth = 8;
        ctx.strokeRect(this.x, this.y, this.boxSize, this.boxSize);
    }

    /**
     * Draws the health bar.
     * @param {*} ctx The canvas 2D rendering context.
     * @param {*} otter The player instance.
     */
    drawHealthBar(ctx, otter) {
        const barX = this.x + this.boxSize;
        const barY = this.y + (this.boxSize - this.barHeight) / 2;

        // Calculate the health ratio and determine the fill width and color based on the player's current health
        const ratio = (otter.health || 0) / (otter.maxHealth || 100);
        const fillWidth = Math.max(0, (this.barWidth - 8) * Math.min(1, ratio));
        const fillColor = ratio > 0.6 ? HealthBar.COLORS.healthy: ratio > 0.3 ? HealthBar.COLORS.hurt : HealthBar.COLORS.critical;

        // Background
        ctx.fillStyle = HealthBar.COLORS.back;
        ctx.fillRect(barX, barY, this.barWidth, this.barHeight);

        // Fill
        ctx.fillStyle = fillColor;
        ctx.fillRect(barX + 4, barY + 4, fillWidth, this.barHeight - 8);

        // Border
        ctx.strokeStyle = HealthBar.COLORS.border;
        ctx.lineWidth = 8;
        ctx.strokeRect(barX, barY, this.barWidth, this.barHeight);

        // Text
        ctx.fillStyle  = "white";
        ctx.font       = "bold 30px Arial";
        ctx.textAlign  = "center";
        ctx.fillText(
            `${Math.floor(otter.health)} / ${otter.maxHealth}`,
            barX + this.barWidth / 2,
            barY + this.barHeight / 2 + 10
        );
    }

    /**
     * Draws the stamina bar.
     * @param {*} ctx The canvas 2D rendering context.
     * @param {*} otter The player instance.
     */
    drawStaminaBar(ctx, otter) {
        // Position the stamina bar below the health bar with some spacing
        const barX = this.x + this.boxSize;
        const barY = this.y + (this.boxSize - this.barHeight) / 2;

        // Calculate the stamina ratio and determine the fill color based on the player's current stamina and effects
        const staminaBarX = barX + 20;
        const staminaBarY = barY + this.barHeight + 10;
        const staminaBarW = this.barWidth * 0.9;
        const staminaBarH = this.barHeight * 0.4;

        // Stamina ratio and color logic
        const staminaRatio = (otter.stamina || 0) / (otter.maxStamina || 100);
        const fillColor = otter.cakeTimer > 0 ? HealthBar.COLORS.cake : otter.stamina <= 0 ? "black" : HealthBar.COLORS.stamina;

        // Background
        ctx.fillStyle = HealthBar.COLORS.back;
        ctx.fillRect(staminaBarX, staminaBarY, staminaBarW, staminaBarH);

        // Fill
        ctx.fillStyle = fillColor;
        ctx.fillRect(staminaBarX + 4, staminaBarY + 4, Math.max(0, (staminaBarW - 8) * staminaRatio), staminaBarH - 8);

        // Border
        ctx.strokeStyle = HealthBar.COLORS.border;
        ctx.lineWidth = 6;
        ctx.strokeRect(staminaBarX, staminaBarY, staminaBarW, staminaBarH);
    }
}