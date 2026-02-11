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
}