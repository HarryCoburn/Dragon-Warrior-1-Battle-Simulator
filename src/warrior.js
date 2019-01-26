class Warrior {
  constructor(name, health, weapon) {
    this.name = name;
    this.health = health;
    this.weapon = weapon;
  }

  getWeapon() {
    return this.weapon;
  }

  takeDamage(damage) {
    return this.health - damage;
  }
}

export default Warrior;
