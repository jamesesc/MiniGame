class CircularDetectionZone {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    draw(ctx) {
        ctx.strokeStyle = "rgba(255, 255, 0, 0.5)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
    }

    /**
     * Checks collision between this Circle and a Rectangle (BoundingBox)
     */
    collide(box) {
        let closestX = Math.max(box.x, Math.min(this.x, box.x + box.width));
        let closestY = Math.max(box.y, Math.min(this.y, box.y + box.height));
        let dx = this.x - closestX;
        let dy = this.y - closestY;
        return (dx * dx + dy * dy) < (this.radius * this.radius);
    }
}