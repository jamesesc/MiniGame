class CollisionSystem {
    static checkCollisions(entities) {
        const otter = entities.find(e => e instanceof Otter);
        if (!otter) return;

        for (let i = entities.length - 1; i >= 0; i--) {
            const entity = entities[i];
            
            if (entity instanceof CakeItem && otter.BB && entity.BB && 
                otter.BB.collide(entity.BB)) {
                otter.activateCakePower(); 
                entities.splice(i, 1); 
            }

            if (entity instanceof HeartItem && otter.BB && entity.BB && 
                otter.BB.collide(entity.BB)) {
                if (otter.health < 120) otter.health = Math.min(120, otter.health + 20);
                    for (let j = 0; j < 5; j++) {
                        let spawnX = otter.BB.x + 400;
                        let spawnY = otter.BB.y + 300;
                        
                        otter.game.addEntity(new HeartParticle(otter.game, spawnX, spawnY));
                    }

                    otter.healFlash = 0.7; 

                    entities.splice(i, 1); 
            }
        
            if (entity instanceof Frog || entity instanceof Mushroom || entity instanceof Bee) { 
                // Skip if entity is already dying - let it finish its death animation
                if (entity.dying) continue;

                if (otter.BB && entity.BB && otter.BB.collide(entity.BB)) {
                    if (otter.action === "spin") {
                        if (entity.takeDamage) {
                            entity.takeDamage(25);
                        }
                        // Don't splice here - the entity sets removeFromWorld itself
                        // when its death animation finishes
                    } else {
                        // Player walks into enemy and isn't spinning - take damage
                        otter.takeDamage(5); 
                    }
                }
            }
        }
    }

    static checkAreaCollision(otter, areaBoundaryX, direction) {
        if (!otter.BB) return false;
        
        const boundaryBox = new BoundingBox(
            areaBoundaryX,  
            0,
            10,                 // thickness
            1100                // full height
        );
        
        return otter.BB.collide(boundaryBox);
    }
}