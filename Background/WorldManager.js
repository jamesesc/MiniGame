import { AreaNotification } from './AreaNotifcation.js';
import { House } from './House.js';
import { EndingSequence } from './EndingSequence.js';
import { Decoration } from './Decoration.js';


const GROUND_Y = 950; 

export class WorldManager {
    constructor(game, worldGen) {
        this.game = game;
        this.worldGen = worldGen;
        this.player = null;

        this.spawnedAreas = new Set();
        this.gameEndTriggered = false;
        this._nearDoor = false;

        this.notification = new AreaNotification(game);
        this.game.addEntity(this.notification);

        let homeStart = 0;
        for (const area of this.worldGen.areas) {
            if (area.name === 'Home') break;
            homeStart += area.length;
        }
        this.houseX = homeStart + 1500;  // 1500 units into Home biome
        this.doorX = this.houseX - 500;  // door trigger just before the house
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
this.spawnDecorationsForArea(firstArea);
this.spawnEnemiesForArea(firstArea);
this.spawnedAreas.add(firstArea.start);

        
    }

    update() {
        const player = this.game.camera ? this.game.camera.otter : null;

        if (player) {
            // Clean up off-screen enemies
            this.game.entities.forEach(entity => {
                if ((entity instanceof Bee || entity instanceof Frog || entity instanceof Mushroom) &&
                    entity.x < player.x - 2000) {
                    entity.removeFromWorld = true;
                }
            });

            // Pre-spawn area enemies + decorations
            const spawnLookAhead = 6000;
            const areaAhead = this.worldGen.getAreaAtPosition(player.x + spawnLookAhead);

if (!this.spawnedAreas.has(areaAhead.start)) {
    console.log("Pre-spawning area: " + areaAhead.name);
    this.spawnDecorationsForArea(areaAhead);
    this.spawnEnemiesForArea(areaAhead);

    if (areaAhead.name === 'Loot') {
        const chestX = areaAhead.start + (areaAhead.end - areaAhead.start) / 2;
        this.game.addEntity(new ChestItem(this.game, chestX, 950));
    }

    this.spawnedAreas.add(areaAhead.start);
}

            // Area notifications
            if (!this.gameEndTriggered) {
                this.worldGen.updateAreaTransition(player.x, (newArea) => {
                    this.notification.show(newArea.name);
                });
            }

            // Door proximity check (only triggers once)
            const house = this.game.entities.find(e => e instanceof House);

           // Inside WorldManager.js update() method
if (house && house.BB && player.BB && !this.gameEndTriggered) {
    if (house.BB.collide(player.BB)) {
        if (!this._nearDoor) {
            this.notification.show("Press X to enter...");
            this._nearDoor = true;
        }
        
        // Check for both 'x' and 'KeyX' to be safe
        if (this.game.keys['x'] || this.game.keys['X'] || this.game.keys['KeyX']) {
            this.gameEndTriggered = true;
    // Clear the key so it doesn't keep firing
    this.game.keys['x'] = false;
    this.game.keys['X'] = false;
    this.game.keys['KeyX'] = false;
    this.triggerEnding();
        }
    } else {
        this._nearDoor = false; 
    }
}
        }
    }

    triggerEnding() {
    const player = this.game.camera ? this.game.camera.otter : null;
    if (player) {
        player.velocity = { x: 0, y: 0 };
        player.frozen = true;
        // player.visible = false; // REMOVE OR COMMENT THIS OUT
    }

    const ending = new EndingSequence(this.game, () => {
        this.game.camera.resetGame();
    });
    this.game.addEntity(ending);
}

    spawnEnemiesForArea(area) {
        const enemyDataList = this.worldGen.generateEnemiesInArea(area);
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

    spawnDecorationsForArea(area) {
        const decorList = this.worldGen.generateDecorationsInArea(area);
        decorList.forEach(decor => {
            this.game.addEntity(new Decoration(
                this.game,
                decor.spriteSheet,
                decor.sx, decor.sy,
                decor.sw, decor.sh,
                decor.x,
                GROUND_Y + decor.yOffset,
                decor.scale
            ));
        });
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
                ctx.beginPath();
                ctx.moveTo(totalX, 0);
                ctx.lineTo(totalX, 1100);
                ctx.stroke();
                ctx.fillText("END OF " + area.name, totalX - 150, 50);
            });
        }
    }
}