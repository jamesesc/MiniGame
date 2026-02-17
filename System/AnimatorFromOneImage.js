class AnimatorFromOneImage {
    constructor(spritesheet, xStart, yStart, width, height, frameCount, frameDuration, framesPerRow, loop = true) {
        Object.assign(this, { 
            spritesheet, xStart, yStart, width, height, 
            frameCount, frameDuration, 
            framesPerRow: framesPerRow || frameCount,
            loop 
        });

        this.elapsedTime = 0;
        this.totalTime = frameCount * frameDuration;
        this.scale = 3;
    };

    drawFrame(tick, ctx, x, y) {
        this.elapsedTime += tick;

        // Only reset time if looping is enabled
        if (this.loop) {
            if (this.elapsedTime > this.totalTime) {
                this.elapsedTime -= this.totalTime;
            }
        } else {
            // If not looping, clamp the time to the very end of the animation
            if (this.elapsedTime > this.totalTime) {
                this.elapsedTime = this.totalTime;
            }
        }

        let frame = this.currentFrame();
        
        // Safety Check - If not looping, make sure we don't try to draw a frame that doesnt exit 
        if (frame >= this.frameCount) frame = this.frameCount - 1;

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