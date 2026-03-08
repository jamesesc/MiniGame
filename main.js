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

// Birds
ASSET_MANAGER.queueDownload("./Assets/Mobs/Bird/Bird.png");

// Decorations
for (let i = 1; i <= 10; i++) {
    ASSET_MANAGER.queueDownload(`./Assets/Decorations/${i}.png`);
}

const decorationFiles = [
    '2323', '3434', '22323', '2323232',
    'Buildings', 'Bush - 60F', 'ELR_FireFlies', 'Enviroment',
    'Foozle_2DT0008_GreenValley_Tileset_...',
    'Grass_Details_Sprite1', 'Hive', 'Interior-01',
    'Pine - 60F', 'Pine II - 60F', 'Props-Rocks', 'Tiles', 'Tree-Assets'
];

decorationFiles.forEach(f => ASSET_MANAGER.queueDownload(`./Assets/Decorations/${f}.png`));

// Items

// Hearts
ASSET_MANAGER.queueDownload("./Assets/Items/Hearts.png");

ASSET_MANAGER.queueDownload("./Assets/Items/Strawberrycake.png");


ASSET_MANAGER.queueDownload("./Assets/Items/TreasureChest.png");
// Player Health
ASSET_MANAGER.queueDownload("./Assets/Items/HealthBar.png");

const cakeFiles = [
    'blackforest','blueberrycheesecake','carrotcake','cherry',
    'Chocolatecake','funcake','honey','icecreamcake','kiwi','LemonCake',
    'pistachiocake','redvelvet','strawberrycake','cakeyy',
    'upsidedown','vanilacake'
];

cakeFiles.forEach(f => ASSET_MANAGER.queueDownload(`./Assets/Items/Cakes/${f}.png`));





// Mobs

// Bee
ASSET_MANAGER.queueDownload("./Assets/Mobs/Bee/Bee-Attack.png");
ASSET_MANAGER.queueDownload("./Assets/Mobs/Bee/Bee-Fly.png");
ASSET_MANAGER.queueDownload("./Assets/Mobs/Bee/Bee-Hit.png");

// Frog
ASSET_MANAGER.queueDownload("./Assets/Mobs/Frogs/Green-Frog.png");

// Frog Improve
ASSET_MANAGER.queueDownload("./Assets/Mobs/Frogs/BlueBlue/ToxicFrogBlueBlue_Attack.png");
ASSET_MANAGER.queueDownload("./Assets/Mobs/Frogs/BlueBlue/ToxicFrogBlueBlue_Explosion.png");
ASSET_MANAGER.queueDownload("./Assets/Mobs/Frogs/BlueBlue/ToxicFrogBlueBlue_Hop.png");
ASSET_MANAGER.queueDownload("./Assets/Mobs/Frogs/BlueBlue/ToxicFrogBlueBlue_Hurt.png");
ASSET_MANAGER.queueDownload("./Assets/Mobs/Frogs/BlueBlue/ToxicFrogBlueBlue_Idle.png");
ASSET_MANAGER.queueDownload("./Assets/Mobs/Frogs/BlueBlue/Frog Tongue.png");
ASSET_MANAGER.queueDownload("./Assets/Mobs/Frogs/BlueBlue/ToxicFrogBlueBlue_AttackNoTongue.png");





// Mushroom
ASSET_MANAGER.queueDownload("./Assets/Mobs/Mushroom/Mushroom-Attack.png");
ASSET_MANAGER.queueDownload("./Assets/Mobs/Mushroom/Mushroom-Die.png");
ASSET_MANAGER.queueDownload("./Assets/Mobs/Mushroom/Mushroom-hit.png");
ASSET_MANAGER.queueDownload("./Assets/Mobs/Mushroom/Mushroom-Idle.png");
ASSET_MANAGER.queueDownload("./Assets/Mobs/Mushroom/Mushroom-Run.png");
ASSET_MANAGER.queueDownload("./Assets/Mobs/Mushroom/Mushroom-Stun.png");


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

// Intro background
for (let i = 1; i <= 8; i++) {
    ASSET_MANAGER.queueDownload(`./Assets/IntroBackground/${i}.png`);
}

    ASSET_MANAGER.queueDownload(`./Assets/IntroBackground/Foreground.png`);




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