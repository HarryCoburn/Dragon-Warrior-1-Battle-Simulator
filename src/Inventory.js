import * as R from "ramda";

const WEAPONS = {
  Unarmed: {
    name: "Unarmed",
    mod: 0
  },
  "Bamboo Pole": {
    name: "Bamboo Pole",
    mod: 2
  },
  Club: {
    name: "Club",
    mod: 4
  },
  "Copper Sword": {
    name: "Copper Sword",
    mod: 10
  },
  "Hand Axe": {
    name: "Hand Axe",
    mod: 15
  },
  "Broad Sword": {
    name: "Broad Sword",
    mod: 20
  },
  "Flame Sword": {
    name: "Flame Sword",
    mod: 28
  },
  "Erdrick's Sword": {
    name: "Erdrick's Sword",
    mod: 40
  }
};

const ARMORS = {
  Naked: { name: "Naked", mod: 0 },
  Clothes: { name: "Clothes", mod: 2 },
  "Leather Armor": { name: "Leather Armor", mod: 4 },
  "Chain Mail": { name: "Chain Mail", mod: 10 },
  "Half Plate": { name: "Half Plate", mod: 16 },
  "Full Plate": { name: "Full Plate", mod: 24 },
  "Magic Armor": { name: "Magic Armor", mod: 24, magDef: R.T },
  "Erdrick's Armor": {
    name: "Erdrick's Armor",
    mod: 28,
    magDef: R.T,
    fireDef: R.T
  }
};

const SHIELDS = {
  Naked: { name: "Naked", mod: 0 },
  "Small Shield": { name: "Small Shield", mod: 4 },
  "Large Shield": { name: "Large Shield", mod: 10 },
  "Silver Shield": { name: "Silver Shield", mod: 25 }
};

/**
 * [changeWeapon description]
 * @param  {[type]} msg   [description]
 * @param  {[type]} model [description]
 * @return {[type]}       [description]
 */
export function changeWeapon(msg, model) {
  const { weapon } = msg;
  return { ...model.player, weapon: WEAPONS[weapon] };
}

/**
 * [changeArmor description]
 * @param  {[type]} msg   [description]
 * @param  {[type]} model [description]
 * @return {[type]}       [description]
 */
export function changeArmor(msg, model) {
  const { armor } = msg;
  return { ...model.player, armor: ARMORS[armor] };
}

/**
 * [changeShield description]
 * @param  {[type]} msg   [description]
 * @param  {[type]} model [description]
 * @return {[type]}       [description]
 */
export function changeShield(msg, model) {
  const { shield } = msg;
  return { ...model.player, shield: SHIELDS[shield] };
}
