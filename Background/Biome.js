export class Biome {
    constructor(name, length, enemies, decorations = []) {
        this.name = name;
        this.length = length;
        this.enemies = Array.isArray(enemies) ? enemies : [];
        this.decorations = Array.isArray(decorations) ? decorations : []; // 👈
    }
}