import Rand from 'rand-seed';
import { Biome } from './Biome.js';

export class WorldGenerator {
    constructor(seed) {
        this.rand = new Rand(seed || Date.now().toString());

        // // Shared decoration pools
        // const bushDecorations = [
        //     {
        //         type: 'Bush',
        //         spriteSheet: './Assets/Decorations/Grass_Details_Sprite1.png',
        //         sx: 1, sy: 14,
        //         sw: 32, sh: 22,
        //         yOffset: 40,
        //         scale: 10
        //     },
        //     {
        //         type: 'SmallBush',
        //         spriteSheet: './Assets/Decorations/Grass_Details_Sprite1.png',
        //         sx: 36, sy: 20,
        //         sw: 22, sh: 16,
        //         yOffset: 60,
        //         scale: 10
        //     },
        //     {
        //         type: 'WhiteFlower',
        //         spriteSheet: './Assets/Decorations/Grass_Details_Sprite1.png',
        //         sx: 68, sy: 14,
        //         sw: 22, sh: 17,
        //         yOffset: 45,
        //         scale: 10
        //     },
        //     {
        //         type: 'RedFlowers',
        //         spriteSheet: './Assets/Decorations/Grass_Details_Sprite1.png',
        //         sx: 100, sy: 14,
        //         sw: 22, sh: 17,
        //         yOffset: 45,
        //         scale: 10
        //     },
        //     {
        //         type: 'YellowFlowerSmall',
        //         spriteSheet: './Assets/Decorations/Grass_Details_Sprite1.png',
        //         sx: 9, sy: 55,
        //         sw: 13, sh: 8,
        //         yOffset: 135,
        //         scale: 10
        //     },
        //     {
        //         type: 'PurpleFlowerSmall',
        //         spriteSheet: './Assets/Decorations/Grass_Details_Sprite1.png',
        //         sx: 73, sy: 55,
        //         sw: 13, sh: 8,
        //         yOffset: 120,
        //         scale: 10
        //     },
        // ];

        this.areas = [

            // ── 1. DELIGHT FOREST (opening area, peaceful) ──────────────────
            new Biome('Delight Forest', 10000, [], []),

            // ── 2. Loot: Forest Edge ───────────────────────────────────
            new Biome('Loot', 3000, []),

            // ── 3. MUSHROOM GROVE (first combat biome) ───────────────────────
            new Biome('Mushroom Grove', 8000, ['mushroom'], [
                {
                    type: 'bigMushroom',
                    spriteSheet: './Assets/Decorations/Tiles.png',
                    sx: 290, sy: 240,
                    sw: 30, sh: 31,
                    yOffset: -96,
                    scale: 10
                },
                {
                    type: 'WideMushroom',
                    spriteSheet: './Assets/Decorations/Tiles.png',
                    sx: 257, sy: 247,
                    sw: 32, sh: 24,
                    yOffset: -15,
                    scale: 10
                },
                {
                    type: 'SkinnyMushroom',
                    spriteSheet: './Assets/Decorations/Tiles.png',
                    sx: 321, sy: 251,
                    sw: 16, sh: 20,
                    yOffset: 10,
                    scale: 10
                },
                {
                    type: 'PerfectMushroom',
                    spriteSheet: './Assets/Decorations/Tiles.png',
                    sx: 241, sy: 257,
                    sw: 13, sh: 14,
                    yOffset: 65,
                    scale: 10
                },
                {
                    type: 'EggMushroom',
                    spriteSheet: './Assets/Decorations/Tiles.png',
                    sx: 242, sy: 241,
                    sw: 10, sh: 13,
                    yOffset: 95,
                    scale: 10
                },
            ]),

            // ── 4. Loot: Damp Hollow ───────────────────────────────────
            new Biome('Loot', 3000, [], [
                {
                    type: 'Cattail',
                    spriteSheet: './Assets/Decorations/Tiles.png',
                    sx: 257, sy: 293,
                    sw: 17, sh: 26,
                    yOffset: -45,
                    scale: 10
                },
            ]),

            // ── 5. FROG POND (second combat biome) ───────────────────────────
            new Biome('Frog Pond', 12000, ['frog'], [
                {
                    type: 'Cattail',
                    spriteSheet: './Assets/Decorations/Tiles.png',
                    sx: 257, sy: 293,
                    sw: 17, sh: 26,
                    yOffset: -45,
                    scale: 10
                },
                {
                    type: 'DoubleCattail',
                    spriteSheet: './Assets/Decorations/Tiles.png',
                    sx: 257, sy: 326,
                    sw: 17, sh: 26,
                    yOffset: -35,
                    scale: 10
                },
                {
                    type: 'BigLeaf',
                    spriteSheet: './Assets/Decorations/Tiles.png',
                    sx: 320, sy: 360,
                    sw: 34, sh: 23,
                    yOffset: -25,
                    scale: 10
                },
                {
                    type: 'LilyPad',
                    spriteSheet: './Assets/Decorations/Tiles.png',
                    sx: 274, sy: 315,
                    sw: 31.5, sh: 37,
                    yOffset: -25,
                    scale: 10
                },
                {
                    type: 'LilyPadWithFlower',
                    spriteSheet: './Assets/Decorations/Tiles.png',
                    sx: 306, sy: 311,
                    sw: 29, sh: 37,
                    yOffset: -25,
                    scale: 10
                },
                {
                    type: 'TallBlueFlower',
                    spriteSheet: './Assets/Decorations/Tiles.png',
                    sx: 242, sy: 272,
                    sw: 11, sh: 31,
                    yOffset: -25,
                    scale: 10
                },
                {
                    type: 'ShortBlueFlower',
                    spriteSheet: './Assets/Decorations/Tiles.png',
                    sx: 259, sy: 272,
                    sw: 15, sh: 16,
                    yOffset: 50,
                    scale: 10
                },
            ]),

            // ── 6. Loot: Dry Meadow ─────────────────────────────────────
            new Biome('Loot', 3000, [], [
                
                {
                    type: 'YellowFlowerSmall',
                    spriteSheet: './Assets/Decorations/Grass_Details_Sprite1.png',
                    sx: 9, sy: 55,
                    sw: 13, sh: 8,
                    yOffset: 135,
                    scale: 10
                },
                {
                    type: 'Pinkflower',
                    spriteSheet: './Assets/Decorations/Grass_Details_Sprite1.png',
                    sx: 136, sy: 24,
                    sw: 22, sh: 17,
                    yOffset: 125,
                    scale: 10
                },
            ]),

            // ── 7. BEE HIVE (third combat biome) ─────────────────────────────
            new Biome('Bee Hive', 10000, ['bee'], [
                {
                    type: 'Hive',
                    spriteSheet: './Assets/Decorations/Hive.png',
                    sx: 113, sy: 96,
                    sw: 17, sh: 26,
                    yOffset: -150,
                    scale: 25
                },
                {
                    type: 'GoldPost',
                    spriteSheet: './Assets/Decorations/Hive.png',
                    sx: 162, sy: 127,
                    sw: 12, sh: 40,
                    yOffset: -390,
                    scale: 15
                },
                {
                    type: 'Gold',
                    spriteSheet: './Assets/Decorations/Hive.png',
                    sx: 100, sy: 129,
                    sw: 10, sh: 14,
                    yOffset: 0,
                    scale: 15
                },
                {
                    type: 'SmallHoneycomb',
                    spriteSheet: './Assets/Decorations/Hive.png',
                    sx: 196, sy: 165,
                    sw: 10, sh: 9,
                    yOffset: 140,
                    scale: 15
                },
                {
                    type: 'MediumHoneycomb',
                    spriteSheet: './Assets/Decorations/Hive.png',
                    sx: 209, sy: 159,
                    sw: 11, sh: 10,
                    yOffset: 100,
                    scale: 15
                },
                {
                    type: 'CombRock',
                    spriteSheet: './Assets/Decorations/Hive.png',
                    sx: 227, sy: 158,
                    sw: 11, sh: 10,
                    yOffset: -25,
                    scale: 25
                },
                {
                    type: 'HoneyRock',
                    spriteSheet: './Assets/Decorations/Hive.png',
                    sx: 249, sy: 168,
                    sw: 9, sh: 3,
                    yOffset: 140,
                    scale: 25
                },
                {
                    type: 'WhiteFlower',
                    spriteSheet: './Assets/Decorations/Grass_Details_Sprite1.png',
                    sx: 68, sy: 14,
                    sw: 22, sh: 17,
                    yOffset: 45,
                    scale: 10
                },
                {
                    type: 'RedFlowers',
                    spriteSheet: './Assets/Decorations/Grass_Details_Sprite1.png',
                    sx: 100, sy: 14,
                    sw: 22, sh: 17,
                    yOffset: 45,
                    scale: 10
                },
                {
                    type: 'Pinkflower',
                    spriteSheet: './Assets/Decorations/Grass_Details_Sprite1.png',
                    sx: 136, sy: 24,
                    sw: 22, sh: 17,
                    yOffset: 125,
                    scale: 10
                },
                {
                    type: 'BlueFlowerSmall',
                    spriteSheet: './Assets/Decorations/Grass_Details_Sprite1.png',
                    sx: 105, sy: 55,
                    sw: 13, sh: 8,
                    yOffset: 150,
                    scale: 10
                },
                {
                    type: 'WhiteFlowerSmall',
                    spriteSheet: './Assets/Decorations/Grass_Details_Sprite1.png',
                    sx: 137, sy: 55,
                    sw: 13, sh: 8,
                    yOffset: 135,
                    scale: 10
                },
            ]),

            // ── 8. Loot: Calm Path Home ────────────────────────────────
            new Biome('Loot', 3000, [], [
                {
                    type: 'WhiteFlowerSmall',
                    spriteSheet: './Assets/Decorations/Grass_Details_Sprite1.png',
                    sx: 137, sy: 55,
                    sw: 13, sh: 8,
                    yOffset: 135,
                    scale: 10
                },
                {
                    type: 'BlueFlowerSmall',
                    spriteSheet: './Assets/Decorations/Grass_Details_Sprite1.png',
                    sx: 105, sy: 55,
                    sw: 13, sh: 8,
                    yOffset: 150,
                    scale: 10
                },
            ]),

            // ── 9. HOME (ending biome) ────────────────────────────────────────
            new Biome('Home', 6000, [], [
                {
                    type: 'WhiteFlower',
                    spriteSheet: './Assets/Decorations/Grass_Details_Sprite1.png',
                    sx: 68, sy: 14,
                    sw: 22, sh: 17,
                    yOffset: 45,
                    scale: 10
                },
                {
                    type: 'Pinkflower',
                    spriteSheet: './Assets/Decorations/Grass_Details_Sprite1.png',
                    sx: 136, sy: 24,
                    sw: 22, sh: 17,
                    yOffset: 125,
                    scale: 10
                },
                {
                    type: 'WhiteFlowerSmall',
                    spriteSheet: './Assets/Decorations/Grass_Details_Sprite1.png',
                    sx: 137, sy: 55,
                    sw: 13, sh: 8,
                    yOffset: 135,
                    scale: 10
                },
                {
                    type: 'YellowFlowerSmall',
                    spriteSheet: './Assets/Decorations/Grass_Details_Sprite1.png',
                    sx: 9, sy: 55,
                    sw: 13, sh: 8,
                    yOffset: 135,
                    scale: 10
                },
            ]),
        ];

        this.currentAreaName = this.areas[0].name;
    }

    getAreaAtPosition(x) {
        let totalLength = 0;
        for (let i = 0; i < this.areas.length; i++) {
            const area = this.areas[i];
            const areaStart = totalLength;
            const areaEnd = totalLength + area.length;

            if (x >= areaStart && x < areaEnd) {
                return { ...area, start: areaStart, end: areaEnd };
            }
            totalLength += area.length;
        }
        const lastArea = this.areas[this.areas.length - 1];
        const lastStart = totalLength - lastArea.length;
        return { ...lastArea, start: lastStart, end: totalLength };
    }

    generateEnemiesInArea(area) {
        const enemies = [];
        if (!area.enemies || area.enemies.length === 0) return enemies;

        for (const enemyType of area.enemies) {
            const count = this.getEnemyCountForArea(enemyType);
            for (let i = 0; i < count; i++) {
                enemies.push({
                    type: enemyType,
                    x: area.start + this.rand.next() * (area.end - area.start)
                });
            }
        }
        return enemies;
    }

    generateDecorationsInArea(area) {
        const decorations = [];
        const decorList = Array.isArray(area.decorations) ? area.decorations : [];
        if (decorList.length === 0) return decorations;

        decorList.forEach(decor => {
            const areaWidth = area.end - area.start;
            const count = Math.floor(((areaWidth / 500) * decor.frequency) || 1);

            for (let i = 0; i < count; i++) {
                decorations.push({
                    ...decor,
                    x: area.start + this.rand.next() * areaWidth
                });
            }
        });
        return decorations;
    }

    getEnemyCountForArea(enemyType) {
        switch (enemyType) {
            case 'mushroom': return Math.floor(this.rand.next() * 3) + 2;
            case 'frog':     return Math.floor(this.rand.next() * 2) + 1;
            case 'bee':      return Math.floor(this.rand.next() * 3) + 1;
            default:         return 0;
        }
    }












    updateAreaTransition(playerX, onAreaChange) {
        const newArea = this.getAreaAtPosition(playerX);
        if (newArea.name !== this.currentAreaName) {
            this.currentAreaName = newArea.name;
            console.log("%c AREA CHANGE ", "background: #222; color: #bada55", "Now entering: " + this.currentAreaName);
            if (onAreaChange) onAreaChange(newArea);
        }
        return newArea;
    }
}