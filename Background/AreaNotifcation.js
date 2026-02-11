export class AreaNotification {
    constructor(game) {
        this.game = game;
        this.name = "";
        this.x = 0;
        this.y = -150;     
        this.targetY = 100;
        this.status = "hidden";
        this.timer = 0;
        this.displayDuration = 2.5; 
        this.alpha = 0;   
    }

    show(areaName) {
        if (this.name !== areaName) {
            this.name = areaName;
            this.status = "sliding-down";
            this.y = -150; 
            this.alpha = 0; 
            this.timer = 0; 
        }
    }

    update() {
        const TICK = this.game.clockTick;

        if (this.status === "sliding-down") {
            if (this.alpha < 1) this.alpha += TICK * 3;
            this.y += 300 * TICK; 
            if (this.y >= this.targetY) {
                this.y = this.targetY;
                this.alpha = 1;
                this.status = "showing";
            }
        } else if (this.status === "showing") {
            this.timer += TICK;
            if (this.timer >= this.displayDuration) {
                this.status = "sliding-up";
            }
        } else if (this.status === "sliding-up") {
            if (this.alpha > 0) this.alpha -= TICK * 3;
            this.y -= 300 * TICK;
            if (this.y <= -150) {
                this.status = "hidden";
            }
        }
    }

    draw(ctx) {
        if (this.status === "hidden") return;

        ctx.save();
        
        ctx.globalAlpha = Math.max(0, Math.min(1, this.alpha));
        
        const drawX = this.game.camera.otter.x + 2000;
        const drawY = this.game.camera.y + this.y;

        const width = 500;
        const height = 100;

        ctx.fillStyle = "rgba(44, 62, 80, 0.9)"; 
        ctx.fillRect(drawX - width / 2, drawY - height / 2, width, height);

        ctx.strokeStyle = "#0a4d04"; 
        ctx.lineWidth = 5;
        ctx.strokeRect(drawX - width / 2, drawY - height / 2, width, height);

        ctx.fillStyle = "white";
        ctx.font = "bold 40px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        ctx.shadowColor = "black";
        ctx.shadowBlur = 4;
        ctx.fillText(this.name, drawX, drawY);

        ctx.restore();
    }
}