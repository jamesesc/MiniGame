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
                otter.health += 20;
                entities.splice(i, 1); 
            }
        
    



    if (entity instanceof Frog || entity instanceof Mushroom || entity instanceof Bee) { 
                if (otter.BB && entity.BB && otter.BB.collide(entity.BB)) {
                
                    if (otter.action === "spin") {
                        if (entity.takeDamage) {
                            entity.takeDamage(25); // Deal 25 damage
                            if (entity.health <= 0) {
                                entities.splice(i, 1);
                            } else {
                                otter.takeDamage(5); 
                            }
                        }

                        if (entity.health <= 0) {
                            entities.splice(i, 1); // Remove from game
                            console.log("Enemy Defeated!");
                        }
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