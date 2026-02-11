import Rand from 'rand-seed';

export class WorldGenerator {
    constructor(seed) {
        this.rand = new Rand(seed || Date.now().toString());

         this.areas = [
            { name: 'Delight Forest', length: 10000, enemies: [] },
            { name: 'Mushroom Grove', length: 8000, enemies: ['mushroom'] },
            { name: 'Frog Pond', length: 12000, enemies: ['frog'] },
            { name: 'Bee Hive', length: 10000, enemies: ['bee'] },
            { name: 'Peaceful Meadow', length: 6000, enemies: [] }
        ];
        this.currentAreaIndex = 0;
        this.currentAreaStart = 0;
        this.currentAreaEnd = this.areas[0].length;
        this.currentAreaName = this.areas[0].name;
    }

    getAreaAtPosition(x) {
        let totalLength = 0;
        for (let i = 0; i < this.areas.length; i++) {
            const area = this.areas[i];
            const areaStart = totalLength;
            const areaEnd = totalLength + area.length;
            
            if (x >= areaStart && x < areaEnd) {
                return {
                    name: area.name,
                    start: areaStart,
                    end: areaEnd,
                    enemies: area.enemies
                };
            }
            totalLength += area.length;
        }
        return this.areas[0];
    }
     generateEnemiesInArea(area, areaX, areaWidth) {
        const enemies = [];
        if (!area.enemies || area.enemies.length === 0) {
            return enemies; 
        }
        
        for (const enemyType of area.enemies) {
            const count = this.getEnemyCountForArea(enemyType);
            for (let i = 0; i < count; i++) {
                enemies.push({
                    type: enemyType,
                    x: areaX + this.rand.next() * areaWidth,
                    y: 680 + (this.rand.next() * 200) - 100 
                });
            }
        }
        return enemies;
    }
    
    getEnemyCountForArea(enemyType) {
        switch(enemyType) {
            case 'mushroom': return Math.floor(this.rand.next() * 3) + 2; 
            case 'frog': return Math.floor(this.rand.next() * 2) + 1;    
            case 'bee': return Math.floor(this.rand.next() * 3) + 1;      
            default: return 0;
        }
    }
    
    updateAreaTransition(playerX, onAreaChange) {
        const newArea = this.getAreaAtPosition(playerX);
        
        if (newArea.name !== this.currentAreaName) {
            this.currentAreaName = newArea.name;

            // ADD THIS LOG HERE:
        console.log("%c AREA CHANGE ", "background: #222; color: #bada55", "Now entering: " + this.currentAreaName);

            if (onAreaChange) {
                onAreaChange(newArea.name); 
            }
        }
        
        return newArea;
    }
    
}