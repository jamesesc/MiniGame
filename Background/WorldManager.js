import { AreaNotification } from './AreaNotifcation.js';

export class WorldManager {
    constructor(game, worldGen) {
        this.game = game;
        this.worldGen = worldGen;
        this.player = null;

        this.spawnedAreas = new Set(); 


        this.notification = new AreaNotification(game);
        this.game.addEntity(this.notification);

        const firstArea = this.worldGen.getAreaAtPosition(0);
        this.spawnEnemiesForArea(firstArea);
        this.spawnedAreas.add(firstArea.name);
    }

    update() {

        const player = this.game.camera ? this.game.camera.otter : null;

        if (player) {
             this.game.entities.forEach(entity => {
            if ((entity instanceof Bee || entity instanceof Frog || entity instanceof Mushroom) && 
                    entity.x < player.x - 2000) {
                    entity.removeFromWorld = true;
                }
            });

            const spawnLookAhead = 6000; 
            const areaAhead = this.worldGen.getAreaAtPosition(player.x + spawnLookAhead);

            if (!this.spawnedAreas.has(areaAhead.name)) {
                console.log("Pre-spawning enemies for: " + areaAhead.name);
                this.spawnEnemiesForArea(areaAhead);
                this.spawnedAreas.add(areaAhead.name);
            }

            this.worldGen.updateAreaTransition(player.x, (newArea) => {
                this.notification.show(newArea.name);
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

    spawnEnemiesForArea(area) {
        const enemyDataList = this.worldGen.generateEnemiesInArea(area, area.start, area.end - area.start);

        enemyDataList.forEach(data => {
            let enemy;
            switch (data.type) {
                case 'mushroom':
                    enemy = new Mushroom(this.game, data.x, 950); 
                    break;
                case 'frog':
                    enemy = new Frog(this.game, data.x, 1040);
                    break;
                case 'bee':
                    let randomSkyY = 100 + (Math.random() * 400);
                    enemy = new Bee(this.game, data.x, randomSkyY);
                    break;
            }
            if (enemy) this.game.addEntity(enemy);
        });
    }
}