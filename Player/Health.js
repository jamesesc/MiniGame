class Health {
    constructor(maxHealth = 100) {
        this.current = maxHealth;
        this.max = maxHealth;
    }
    
    takeDamage(amount) {
        this.current = Math.max(0, this.current - amount);
        return this.current <= 0;
    }
    
    heal(amount) {
        this.current = Math.min(this.max, this.current + amount);
    }
    
    getPercentage() {
        return (this.current / this.max) * 100;
    }
}