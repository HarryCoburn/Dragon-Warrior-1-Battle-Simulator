const initModel = {
  battleText: [],
  enemy: '',
  cleanBattleText: false,
  inBattle: false,
  enemySleep: 0,
  enemyStop: false,
  playerSleep: false,
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
};

export default initModel;
