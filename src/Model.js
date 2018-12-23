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
  enemies: {
    'Slime': {
      name: 'slime',
      strength: 5,
      agility: 3,
      hp: 3,
    },
    'Red slime': {
      name: 'red slime',
      strength: 7,
      agility: 3,
      hp: 3,
    },
    'Drakee': {
      name: 'drakee',
      strength: 9,
      agility: 6,
      hp: [5, 6],
    },
    'Ghost': {
      name: 'ghost',
      strength: 11,
      agility: 8,
      hp: [6, 7],
    },
    'Magician': {
      name: 'magician',
      strength: 11,
      agility: 12,
      hp: [10, 13],
    },
    'Magidrakee': {
      name: 'magidrakee',
      strength: 14,
      agility: 14,
      hp: [12, 15],
    },
    'Scorpion': { // Incomplete
      name: 'scorpion',
      strength: 18,
      agility: 16,
      hp: [16, 20],
    },
    'Druin': {
      name: 'druin',
      strength: 20,
      agility: 18,
      hp: [17, 22],
    },
    'Poltergeist': {
      name: 'poltergeist',
      strength: 18,
      agility: 20,
      hp: [18, 23],
    },
    'Droll': {
      name: 'droll',
      strength: 24,
      agility: 24,
      hp: [19, 25],
    },
    'Drakeema': {
      name: 'drakeema',
      strength: 22,
      agility: 26,
      hp: [16, 20],
    },
    'Skeleton': {
      name: 'skeleton',
      strength: 28,
      agility: 22,
      hp: [16, 20],
    },
    'Warlock': {
      name: 'warlock',
      strength: 28,
      agility: 22,
      hp: [23, 30],
    },
    'Metal Scorpion': {
      name: 'metal scorpion',
      strength: 36,
      agility: 42,
      hp: [17, 22],
    },
    'Wolf': {
      name: 'wolf',
      strength: 40,
      agility: 30,
      hp: [26, 34],
    },
    'Wraith': {
      name: 'wraith',
      strength: 44,
      agility: 34,
      hp: [26, 34],
    },
    'Metal Slime': {
      name: 'metal slime',
      strength: 10,
      agility: 255,
      hp: 4,
    },
    'Specter': {
      name: 'specter',
      strength: 40,
      agility: 38,
      hp: [28, 36],
    },
    'Wolflord': {
      name: 'wolflord',
      strength: 50,
      agility: 36,
      hp: [29, 38],
    },
    'Druinlord': {
      name: 'druinlord',
      strength: 47,
      agility: 40,
      hp: [27, 35],
    },
    'Drollmagi': {
      name: 'drollmagi',
      strength: 52,
      agility: 50,
      hp: [29, 38],
    },
    'Wyvern': {
      name: 'wyvern',
      strength: 56,
      agility: 48,
      hp: [32, 42],
    },
    'Rogue Scorpion': {
      name: 'rogue scorpion',
      strength: 60,
      agility: 90,
      hp: [27, 35],
    },
    'Wraith Knight': {
      name: 'wraith knight',
      strength: 68,
      agility: 56,
      hp: [35, 46],
    },
    'Golem': {
      name: 'golem',
      strength: 120,
      agility: 60,
      hp: [53, 70],
    },
    'Goldman': {
      name: 'goldman',
      strength: 48,
      agility: 40,
      hp: [38, 50],
    },
    'Knight': {
      name: 'knight',
      strength: 76,
      agility: 78,
      hp: [42, 55],
    },
    'Magiwyvern': {
      name: 'magiwyvern',
      strength: 78,
      agility: 68,
      hp: [44, 58],
    },
    'Demon Knight': {
      name: 'demon knight',
      strength: 79,
      agility: 64,
      hp: [38, 50],
    },
    '': {
      name: 'Werewolf',
      strength: 86,
      agility: 70,
      hp: [46, 60],
    },
    'Green Dragon': {
      name: 'green dragon',
      strength: 88,
      agility: 74,
      hp: [49, 65],
    },
    'Starwyvern': {
      name: 'starwyvern',
      strength: 86,
      agility: 80,
      hp: [49, 65],
    },
    'Wizard': {
      name: 'wizard',
      strength: 80,
      agility: 70,
      hp: [49, 65],
    },
    'Axe Knight': {
      name: 'axe knight',
      strength: 94,
      agility: 82,
      hp: [53, 70],
    },
    'Blue Dragon': {
      name: 'blue dragon',
      strength: 98,
      agility: 84,
      hp: [53, 70],
    },
    'Stoneman': {
      name: 'stoneman',
      strength: 100,
      agility: 40,
      hp: [121, 160],
    },
    'Armored Knight': {
      name: 'armored knight',
      strength: 105,
      agility: 86,
      hp: [68, 90],
    },
    'Red Dragon': {
      name: 'red dragon',
      strength: 120,
      agility: 90,
      hp: [76, 100],
    },
    'Dragonlord (first form)': {
      name: 'dragonlord',
      strength: 90,
      agility: 75,
      hp: [76, 100],
    },
    'Dragonlord (second form)': {
      name: 'dragonlord',
      strength: 140,
      agility: 200,
      hp: 130,
    },
  },
  levels: {
    1: [4, 4, 15, 0],
    2: [5, 4, 22, 0],
    3: [7, 6, 24, 5],
    4: [7, 8, 31, 16],
    5: [12, 10, 35, 20],
    6: [16, 10, 38, 24],
    7: [18, 17, 40, 26],
    8: [22, 20, 46, 29],
    9: [30, 22, 50, 36],
    10: [35, 31, 54, 40],
    20: [92, 88, 138, 128],
  },
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
