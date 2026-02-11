/**
 * Animaotr base on sprite that is only one image. 
 */
class AnimatorFromOneImage {
    constructor(spritesheet, xStart, yStart, width, height, frameCount, frameDuration, framesPerRow) {
        Object.assign(this, { 
            spritesheet, xStart, yStart, width, height, 
            frameCount, frameDuration, 
            framesPerRow: framesPerRow || frameCount 
        });

        this.elapsedTime = 0;
        this.totalTime = frameCount * frameDuration;
        this.scale = 3;
    };

    drawFrame(tick, ctx, x, y) {
        this.elapsedTime += tick;
        if (this.elapsedTime > this.totalTime) this.elapsedTime -= this.totalTime;

        const frame = this.currentFrame();

        const col = frame % this.framesPerRow;
        const row = Math.floor(frame / this.framesPerRow);

        ctx.drawImage(this.spritesheet,
            this.xStart + this.width * col, 
            this.yStart + this.height * row, 
            this.width, this.height,
            x, y,
            this.width * this.scale, this.height * this.scale);
    };

    currentFrame() {
        return Math.floor(this.elapsedTime / this.frameDuration);
    };

    isDone() {
        return (this.elapsedTime >= this.totalTime);
    };
};