class BoundingBox {
    constructor(x, y, width, height) {
        Object.assign(this, { x, y, width, height });
    }

    collide(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }
}