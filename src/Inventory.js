export function changeWeapon(msg, model) {
  const {weapon} = msg;
  return {...model.player, weapon: model.weapons[weapon]};
}

export function changeArmor(msg, model) {
  const {armor} = msg;
  return {...model.player, armor: model.armors[armor]};
}

export function changeShield(msg, model) {
  const {shield} = msg;
  return {...model.player, shield: model.shields[shield]};
}
