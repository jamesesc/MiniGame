class CollisionSystem {
    static checkCollisions(entities) {
        const otter = entities.find(e => e instanceof Otter);
        if (!otter) return;

        for (let i = entities.length - 1; i >= 0; i--) {
            const entity = entities[i];
            
            if (entity instanceof CakeItem && otter.BB && entity.BB && 
                otter.BB.collide(entity.BB)) {
                entities.splice(i, 1); 
            }

            if (entity instanceof HeartItem && otter.BB && entity.BB && 
                otter.BB.collide(entity.BB)) {
                entities.splice(i, 1); 
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