import { SceneManager } from "./System/SceneManager.js"; // Added { } and .js

window.gameEngine = new GameEngine({ debugging: true });
window.ASSET_MANAGER = new AssetManager();

// Ground Tiles
ASSET_MANAGER.queueDownload("./Assets/Ground/Ground-1.png");
ASSET_MANAGER.queueDownload("./Assets/Ground/Ground-1.png");

// Parallax Background
ASSET_MANAGER.queueDownload("./Assets/Background/1-Trees.png");
ASSET_MANAGER.queueDownload("./Assets/Background/2-Trees.png");
ASSET_MANAGER.queueDownload("./Assets/Background/3-Trees.png");
ASSET_MANAGER.queueDownload("./Assets/Background/4-TreesBackground.png");
ASSET_MANAGER.queueDownload("./Assets/Background/5-SkyBackground.png");

// Items

// Hearts
ASSET_MANAGER.queueDownload("./Assets/Items/Hearts.png");

ASSET_MANAGER.queueDownload("./Assets/Items/Strawberrycake.png");

// Player Health
ASSET_MANAGER.queueDownload("./Assets/Items/HealthBar.png");


// Mobs

// Bee
ASSET_MANAGER.queueDownload("./Assets/Mobs/Bee/Bee-Attack.png");
ASSET_MANAGER.queueDownload("./Assets/Mobs/Bee/Bee-Fly.png");
ASSET_MANAGER.queueDownload("./Assets/Mobs/Bee/Bee-Hit.png");

// Frog
ASSET_MANAGER.queueDownload("./Assets/Mobs/Frogs/Green-Frog.png");


// Mushroom
ASSET_MANAGER.queueDownload("./Assets/Mobs/Mushroom/Mushroom-Idle.png");
ASSET_MANAGER.queueDownload("./Assets/Mobs/Mushroom/Mushroom-Attack.png");


// Otter Animation

// Otter Idle 
for (let i = 1; i <= 4; i++) {
    ASSET_MANAGER.queueDownload(`./Assets/Otter/Idle/otter_idle_${i}.png`);
}

// Otter Run 
for (let i = 1; i <= 3; i++) {
    ASSET_MANAGER.queueDownload(`./Assets/Otter/Run/otter_run_${i}.png`);
}

// Otter Jump
for (let i = 1; i <= 4; i++) {
    ASSET_MANAGER.queueDownload(`./Assets/Otter/Jump/otter_jump_${i}.png`);
}

// Otter Land
for (let i = 1; i <= 3; i++) {
    ASSET_MANAGER.queueDownload(`./Assets/Otter/Land/otter_land_${i}.png`);
}

// Otter Spin
for (let i = 1; i <= 3; i++) {
    ASSET_MANAGER.queueDownload(`./Assets/Otter/Spin/otter_spin_${i}.png`);
}

// Otter Sleep
for (let i = 1; i <= 6; i++) {
    ASSET_MANAGER.queueDownload(`./Assets/Otter/Sleep/otter_sleep_${i}.png`);
}

/**
 * Method to handle every entity in the game.
 */
ASSET_MANAGER.downloadAll(() => {
    const canvas = document.getElementById("gameWorld");
    const ctx = canvas.getContext("2d");
    gameEngine.init(ctx);
    gameEngine.addEntity(new SceneManager(gameEngine));
    ctx.imageSmoothingEnabled = false;
    gameEngine.start();
});