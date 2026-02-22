import { AreaNotification } from './AreaNotifcation.js';
import { House } from './House.js';
import { EndingSequence } from './EndingSequence.js';


export class WorldManager {
    constructor(game, worldGen) {
        this.game = game;
        this.worldGen = worldGen;
        this.player = null;

        this.spawnedAreas = new Set();
        this.gameEndTriggered = false;

        this.notification = new AreaNotification(game);
        this.game.addEntity(this.notification);

        // Where the house and notifications spawns
        this.houseX = 50000; 
        this.doorX = 46000;  
        this.houseReachDistance = 200; 

        const house = new House(
            this.game,
            this.houseX,
            -357,
            './Assets/House/house.png',
            9
        );
        this.game.addEntity(house);

        const firstArea = this.worldGen.getAreaAtPosition(0);
        this.spawnEnemiesForArea(firstArea);
        this.spawnedAreas.add(firstArea.name);
    }

    update() {

        const player = this.game.camera ? this.game.camera.otter : null;

        if (player) {
            // Cleaning up teh game
             this.game.entities.forEach(entity => {
            if ((entity instanceof Bee || entity instanceof Frog || entity instanceof Mushroom) && 
                    entity.x < player.x - 2000) {
                    entity.removeFromWorld = true;
                }
            });

            // Pre-spawn area enemies
            const spawnLookAhead = 6000; 
            const areaAhead = this.worldGen.getAreaAtPosition(player.x + spawnLookAhead);

            if (!this.spawnedAreas.has(areaAhead.name)) {
                console.log("Pre-spawning enemies for: " + areaAhead.name);
                this.spawnEnemiesForArea(areaAhead);
                this.spawnedAreas.add(areaAhead.name);
            }

            // Area notifications to trigger
            if (!this.gameEndTriggered) {
                this.worldGen.updateAreaTransition(player.x, (newArea) => {
                    this.notification.show(newArea.name);
                });
            }

            // Checking if the player reached the house
            if (!this.gameEndTriggered && Math.abs(player.x - this.doorX) < this.houseReachDistance) {
                // Showing a prompt to press x to end the game
                this.notification.show("Press X to enter...");
                this._nearDoor = true;
            }

            if (this._nearDoor && !this.gameEndTriggered && this.game.keys['x']) {
                this.gameEndTriggered = true;
                this.triggerEnding();
            }
        }
    }

    triggerEnding() {
        const player = this.game.camera ? this.game.camera.otter : null;
        if (player) {
            player.velocity = { x: 0, y: 0 };
            player.frozen = true;
        }

        const ending = new EndingSequence(this.game, () => {
            this.game.camera.resetGame();
        });
        this.game.addEntity(ending);
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