import Rand from 'rand-seed';

class WorldGenerator {
    constructor(seed) {
        this.rand = new Rand(seed || Date.now().toString());
    }
    
    generateChunkEnemies(chunkX, chunkY) {
        const chunkSeed = `${chunkX},${chunkY}:${this.rand.next()}`;
        const chunkRand = new Rand(chunkSeed);
        
        const enemyCount = Math.floor(chunkRand.next() * 3) + 1;
        const enemies = [];
        
        for (let i = 0; i < enemyCount; i++) {
            enemies.push({
                type: ['bee', 'frog', 'mushroom'][Math.floor(chunkRand.next() * 3)],
                x: chunkX * 1000 + chunkRand.next() * 1000,
                y: chunkY * 1000 + chunkRand.next() * 1000
            });
        }
        return enemies;
    }
}

const worldGen = new WorldGenerator('your-seed-value');