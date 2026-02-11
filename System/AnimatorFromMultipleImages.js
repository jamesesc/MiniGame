/**
 * Animator when sprite is in multiple individual images. 
 */
class AnimatorFromMultipleImages {
    constructor(imageArray, frameDuration) {
        Object.assign(this, { imageArray, frameDuration });
        this.elapsedTime = 0;
        this.totalTime = imageArray.length * frameDuration;
        this.scale = 3; 
    };

    drawFrame(tick, ctx, x, y) {
        this.elapsedTime += tick;
        if (this.elapsedTime > this.totalTime) this.elapsedTime -= this.totalTime;

        const frameIndex = Math.floor(this.elapsedTime / this.frameDuration);
        const img = this.imageArray[frameIndex];

        if (img) {
            ctx.drawImage(img, 
                0, 0, img.width, img.height, 
                x, y, 
                img.width * this.scale, img.height * this.scale);
        }
    };
};