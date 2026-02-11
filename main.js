import { WorldGenerator } from './Background/WorldGenerator.js';
import { WorldManager } from './Background/WorldManager.js';


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



    // Background Entity 
    gameEngine.addEntity(new ParallaxLayer(gameEngine, "./Assets/Background/5-SkyBackground.png", .1, -1500, 11));
    gameEngine.addEntity(new ParallaxLayer(gameEngine, "./Assets/Background/4-TreesBackground.png", 0.1, 100, 4));
    gameEngine.addEntity(new ParallaxLayer(gameEngine, "./Assets/Background/3-Trees.png", 0.3, 0, 5));
    gameEngine.addEntity(new ParallaxLayer(gameEngine, "./Assets/Background/2-Trees.png", 0.5, 400, 2));
    gameEngine.addEntity(new ParallaxLayer(gameEngine, "./Assets/Background/1-Trees.png", 0.7, -25 , 4));



    // Items
    gameEngine.addEntity(new HeartItem(gameEngine));

    gameEngine.addEntity(new CakeItem(gameEngine));

    const playerHealth = new Health(100);  
    gameEngine.addEntity(new HealthBar(gameEngine, playerHealth));
    
    // Mobs  
    
    // Bee
    gameEngine.addEntity(new Bee(gameEngine));

    // Frog
    gameEngine.addEntity(new Frog(gameEngine));

    // Mushroom
    gameEngine.addEntity(new Mushroom(gameEngine))





    // Ground

    // Ground Type 1
    gameEngine.addEntity(new Ground(gameEngine));

    // Ground Type 2
    //gameEngine.addEntity(new Background(gameEngine));


    gameEngine.addEntity(new SceneManager(gameEngine));

	ctx.imageSmoothingEnabled = false;


    
    const worldGen = new WorldGenerator('SomeLevel');
    const worldManager = new WorldManager(gameEngine, worldGen); 
    gameEngine.addEntity(worldManager);



    gameEngine.start();
});