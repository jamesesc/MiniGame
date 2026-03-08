/**
 * Handles all collision detection logic for the game.
 * Separates entity-vs-entity checks from area boundary checks.
 */
class CollisionSystem {

    /**
     * Checks collisions between the Otter and all hostile entities.
     * 
     * @param {*} entities is the array of all game entities.
     */
    static checkCollisions(entities) {
        // Find the player (Otter) in the entity list
        const otter = entities.find(e => e instanceof Otter);
        if (!otter) return;

        // Loop backwards through entities to allow safe removal if needed
        for (let i = entities.length - 1; i >= 0; i--) {
            const entity = entities[i];

            // Check if the entity is a known enemy type
            if (entity instanceof Frog || entity instanceof Mushroom || entity instanceof Bee) {
                // Skip if the enemy is already dying/dead
                if (entity.dying) continue;

                // Perform AABB collision check
                if (otter.BB && entity.BB && otter.BB.collide(entity.BB)) {
                    // If Otter is spinning, deal damage to the enemy
                    if (otter.action === "spin") {
                        if (entity.takeDamage) entity.takeDamage(25);
                    } 
                    // Otherwise, Otter takes damage from the enemy
                    else {
                        otter.takeDamage(5);
                    }
                }
            }
        }
    }

    /**
     * Checks if the Otter has crossed a specific vertical boundary line.
     * Used for area transitions or screen scrolling limits.
     * 
     * @param {*} otter is the player entity.
     * @param {*} areaBoundaryX is the X coordinate of the boundary line.
     * @param {*} direction is the expected direction of travel (unused in current logic but kept for extensibility).
     * @returns {boolean} true if colliding with the boundary, false otherwise.
     */
    static checkAreaCollision(otter, areaBoundaryX, direction) {
        if (!otter.BB) return false;

        // Cache the boundary BoundingBox to avoid creating new objects every frame
        // Only rebuild if the X position has changed
        if (!CollisionSystem._areaBoundaryCache ||
            CollisionSystem._areaBoundaryCache.x !== areaBoundaryX) {
            
            // Create a thin vertical box (10px wide) spanning the screen height
            CollisionSystem._areaBoundaryCache = new BoundingBox(areaBoundaryX, 0, 10, 1100);
        }

        // Return collision result between Otter and the cached boundary
        return otter.BB.collide(CollisionSystem._areaBoundaryCache);
    }
}