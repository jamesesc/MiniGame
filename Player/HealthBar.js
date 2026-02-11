class HealthBar {
    constructor(game) {
        this.game = game;
        this.camera = game.camera;
        
        this.x = 40; 
        this.y = 40;
        this.barWidth = 400;  
        this.barHeight = 80;  
        this.boxSize = 120; 
        
        this.profileImage = ASSET_MANAGER.getAsset("./Assets/Otter/Idle/otter_idle_1.png"); 
        this.borderColor = "white"; 
        this.backColor = "rgba(0, 0, 0, 0.7)"; 
        this.healthyColor = "#4CAF50"; 
        this.hurtColor = "#FF9800";    
        this.criticalColor = "#F44336"; 
    }

    update() {

    }

    draw(ctx) {
        const otter = this.game.camera.otter;
        if (!otter) return;

        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0); 

        ctx.fillStyle = this.backColor;
        ctx.fillRect(this.x, this.y, this.boxSize, this.boxSize);

        if (this.profileImage) {
            const sx = 106;   
            const sy = 74; 
            const sWidth = 26; 
            const sHeight = 20;

            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(
                this.profileImage, 
                sx, sy, sWidth, sHeight,  
                this.x + 5, this.y + 5,  
                this.boxSize - 10, this.boxSize - 10 
            );
        }

        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = 8; 
        ctx.strokeRect(this.x, this.y, this.boxSize, this.boxSize);

        const barX = this.x + this.boxSize; 
        const barY = this.y + (this.boxSize - this.barHeight) / 2; 

        ctx.fillStyle = this.backColor;
        ctx.fillRect(barX, barY, this.barWidth, this.barHeight);

        const currentHealth = otter.health || 0;
        const maxHealth = otter.maxHealth || 100;
        const ratio = currentHealth / maxHealth;

        if (ratio > 0.6) ctx.fillStyle = this.healthyColor;
        else if (ratio > 0.3) ctx.fillStyle = this.hurtColor;
        else ctx.fillStyle = this.criticalColor;

        const fillWidth = Math.max(0, (this.barWidth - 8) * ratio);
        ctx.fillRect(barX + 4, barY + 4, fillWidth, this.barHeight - 8);

        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = 8;
        ctx.strokeRect(barX, barY, this.barWidth, this.barHeight);

        ctx.fillStyle = "white";
        ctx.font = "bold 30px Arial"; 
        ctx.textAlign = "center";
        ctx.fillText(Math.floor(currentHealth) + " / " + maxHealth, barX + this.barWidth / 2, barY + this.barHeight / 2 + 10);

        ctx.restore();
    }
}