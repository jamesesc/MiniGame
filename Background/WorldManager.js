import { AreaNotification } from './AreaNotifcation.js';

export class WorldManager {
    constructor(game, worldGen) {
        this.game = game;
        this.worldGen = worldGen;
        this.player = null;

        this.notification = new AreaNotification(game);
        this.game.addEntity(this.notification);
    }

update() {

        const player = this.game.camera ? this.game.camera.otter : null;
        
        if (player) {

            const playerNose = player.x; 

            this.worldGen.updateAreaTransition(playerNose, (newName) => {
                console.log("Triggering Notification for: " + newName);
                this.notification.show(newName);
            });
        }
    }

    draw(ctx) {
          if (this.game.options.debugging) {
        let totalX = 0;
        ctx.strokeStyle = "red";
        ctx.lineWidth = 5;
        ctx.font = "20px Arial";
        ctx.fillStyle = "red";

        this.worldGen.areas.forEach(area => {
            totalX += area.length;
            

            let lineX = totalX;
            
            ctx.beginPath();
            ctx.moveTo(lineX, 0);
            ctx.lineTo(lineX, 1100);
            ctx.stroke();

            ctx.fillText("END OF " + area.name, lineX - 150, 50);
        });
    }

    }
}