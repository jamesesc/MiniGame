/**
 * Health class to manage player's health status, damage, and healing.
 */
class Health {
    /**
     * Initializes a new instance of the Health class.
     * 
     * @param {number} max - The maximum health value.
     */
    constructor(max = 100) {
        this.current = max;
        this.max = max;
    }

    /**
     * Getters for health status
     */
    get isDead() { 
        return this.current <= 0;
    }
    
    /**
     * Checks if health is at maximum.
     */
    get isFull() {
        return this.current >= this.max;
    }
    
    /**
     * Returns the current health as a percentage of the maximum health.
     */
    get percentage() {
        return (this.current / this.max) * 100;
    }
    
    /**
     * Reduces the current health by a specified amount.
     * @param {number} amount - The amount of damage to take.
     * @return {boolean} - Returns true if the health drops to 0 or below, indicating death.
     */
    takeDamage(amount) {
        this.current = Math.max(0, this.current - amount);
        return this.current <= 0;
    }
    
    /**
     * Increases the current health by a specified amount, without exceeding the maximum health.
     * @param {number} amount - The amount of healing to apply.
     */
    heal(amount) {
        this.current = Math.min(this.max, this.current + amount);
    }
    
    /**
     * Resets the current health to the maximum health.
     */
    reset() {
        this.current = this.max;
    }
}