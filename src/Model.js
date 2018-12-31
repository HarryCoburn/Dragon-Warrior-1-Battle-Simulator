import Enemies from './Enemies.js';

const initModel = {
  battleText: [],
  enemy: '',
  cleanBattleText: false,
  inBattle: false,
  player: {
    name: 'Rollo',
    nameSum: 0,
    progression: 0,
    level: 1,
    strength: 4,
    agility: 4,
    hp: 15,
    maxhp: 15,
    mp: 0,
    weapon: {name: 'Unarmed', mod: 0},
    armor: {name: 'Naked', mod: 0},
    shield: {name: 'Naked', mod: 0},
  },
  enemies: Enemies,
  weapons: {
    'Unarmed': {
      name: 'Unarmed',
      mod: 0,
    },
    'Bamboo Pole': {
      name: 'Bamboo Pole',
      mod: 2,
    },
    'Club': {
      name: 'Club',
      mod: 4,
    },
    'Copper Sword': {
      name: 'Copper Sword',
      mod: 10,
    },
    'Hand Axe': {
      name: 'Hand Axe',
      mod: 15,
    },
    'Broad Sword': {
      name: 'Broad Sword',
      mod: 20,
    },
    'Flame Sword': {
      name: 'Flame Sword',
      mod: 28,
    },
    'Erdrick\'s Sword': {
      name: 'Erdrick\'s Sword',
      mod: 40,
    },
  },
  armors: {
    'Naked': {name: 'Naked', mod: 0},
    'Clothes': {name: 'Clothes', mod: 2},
    'Leather Armor': {name: 'Leather Armor', mod: 4},
    'Chain Mail': {name: 'Chain Mail', mod: 10},
    'Half Plate': {name: 'Half Plate', mod: 16},
    'Full Plate': {name: 'Full Plate', mod: 24},
    'Magic Armor': {name: 'Magic Armor', mod: 24},
    'Erdrick\'s Armor': {name: 'Erdrick\'s Armor', mod: 28},
  },
  shields: {
    'Naked': {name: 'Naked', mod: 0},
    'Small Shield': {name: 'Small Shield', mod: 4},
    'Large Shield': {name: 'Large Shield', mod: 10},
    'Silver Shield': {name: 'Silver Shield', mod: 25},
  },
};

export default initModel;
