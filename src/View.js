import hh from 'hyperscript-helpers';
import {h} from 'virtual-dom';
import * as R from 'ramda';
import {fightMsg,
  enemyMsg,
  levelMsg,
  nameMsg,
  weaponMsg,
  armorMsg,
  shieldMsg,
healMsg,} from './Update';

const {
  div,
  h1,
  p,
  pre,
  button,
  input,
  select,
  option,
} = hh(h);


const battleText = R.map((x) => p({}, x));
const numRange = (size, startAt = 0) =>
  [...Array(size).keys()].map((i) => i + startAt);
const ENEMIES = ['Choose an enemy', 'Slime', 'Red slime', 'Drakee', 'Ghost', 'Magician', 'Magidrakee', 'Scorpion'];
const LEVELS = numRange(30, 1);
const WEAPONS = ['Unarmed', 'Bamboo Pole', 'Club', 'Copper Sword', 'Hand Axe', 'Broad Sword', 'Flame Sword', 'Erdrick\'s Sword'];
const ARMORS = ['Naked', 'Clothes', 'Leather Armor', 'Chain Mail', 'Half Plate', 'Full Plate', 'Magic Armor', 'Erdrick\'s Armor'];
const SHIELDS = ['Naked', 'Small Shield', 'Large Shield', 'Silver Shield'];
const statLine = (className, label, value) =>
  div({className}, `${label}: ${value}`);
const statLineClasses = 'pv2 ph2 dib';

/**
 * [buttonBlock description]
 * @param  {[type]} dispatch [description]
 * @param  {[type]} player   [description]
 * @param  {[type]} model    [description]
 * @return {[type]}          [description]
 */
function buttonBlock(dispatch, player, model) {
  const {currentEnemy, inBattle} = model;
  if (!inBattle) {
    return button({className: '', onclick: (e) => dispatch(fightMsg(player, currentEnemy))}, 'Start Battle');
  }
  return [button({className: '', onclick: (e) => dispatch(fightMsg(player, currentEnemy))}, 'Attack'),
  button({className: '', onclick: (e) => dispatch(healMsg(player.hp, player.maxhp))}, 'Heal')];
}


/**
 * [shieldOptions description]
 * @param  {[type]} selectedShield [description]
 * @return {[type]}                [description]
 */
function shieldOptions(selectedShield) {
  return R.map(
      (shield) =>
        option({value: shield, selected: selectedShield === shield}, shield),
      SHIELDS
  );
}

/**
 * [armorOptions description]
 * @param  {[type]} selectedArmor [description]
 * @return {[type]}               [description]
 */
function armorOptions(selectedArmor) {
  return R.map(
      (armor) =>
        option({value: armor, selected: selectedArmor === armor}, armor),
      ARMORS
  );
}

/**
 * [weaponOptions description]
 * @param  {[type]} selectedWeapon [description]
 * @return {[type]}                [description]
 */
function weaponOptions(selectedWeapon) {
  return R.map(
      (weapon) =>
        option({value: weapon, selected: selectedWeapon === weapon}, weapon),
      WEAPONS
  );
}

/**
 * [enemyOptions description]
 * @param  {[type]} selectedEnemy [description]
 * @return {[type]}               [description]
 */
function enemyOptions(selectedEnemy) {
  return R.map(
      (enemy) =>
        option({value: enemy, selected: selectedEnemy === enemy}, enemy),
      ENEMIES
  );
}

/**
 * [levelOptions description]
 * @param  {[type]} selectedLevel [description]
 * @return {[type]}               [description]
 */
function levelOptions(selectedLevel) {
  return R.map(
      (level) =>
        option({value: level, selected: selectedLevel === level}, level),
      LEVELS
  );
}

/**
 * [playerBlock description]
 * @param  {[type]} dispatch [description]
 * @param  {[type]} player   [description]
 * @return {[type]}          [description]
 */
function playerBlock(dispatch, player) {
  return div({className: 'w-25 mh3'}, [
    div({className: ''}, 'Player Name:'),
    input({
      oninput: (e) => dispatch(nameMsg(e.target.value)),
    }, 'Player Name'),
    div({className: 'mv2'}, 'Player Level:'),
    select({
      className: 'db pa2 ba input-reset br1 bg-white ba b--black',
      onchange: (e) => dispatch(levelMsg(e.target.value)),
    },
    levelOptions(player.level),
    ),
    div({className: 'mv2'}, 'Player Weapon:'),
    select({
      className: 'db pa2 ba input-reset br1 bg-white ba b--black',
      onchange: (e) => dispatch(weaponMsg(e.target.value)),
    },
    weaponOptions(player.weapon),
    ),
    div({className: 'mv2'}, 'Player Armor:'),
    select({
      className: 'db pa2 ba input-reset br1 bg-white ba b--black',
      onchange: (e) => dispatch(armorMsg(e.target.value)),
    },
    armorOptions(player.armor),
    ),
    div({className: 'mv2'}, 'Player Shield:'),
    select({
      className: 'db pa2 ba input-reset br1 bg-white ba b--black',
      onchange: (e) => dispatch(shieldMsg(e.target.value)),
    },
    shieldOptions(player.shield),
    ),
  ]);
}

/**
 * [playerStatsBlock description]
 * @param  {[type]} dispatch [description]
 * @param  {[type]} player   [description]
 * @return {[type]}          [description]
 */
function playerStatsBlock(dispatch, player) {
  const {hp, maxhp, mp, weapon, armor, shield} = player;
  return div({className: 'w-25 mh3'}, [
    div({className: ''}, 'Player Stats:'),
    statLine(statLineClasses, 'Player Health', `${hp} / ${maxhp}`),
    statLine(statLineClasses, 'Player Magic', mp),
    statLine(statLineClasses, 'Player Weapon', weapon.name),
    statLine(statLineClasses, 'Player Armor', armor.name),
    statLine(statLineClasses, 'Player Shield', shield.name)]);
}

/**
 * [enemyBlock description]
 * @param  {[type]} dispatch     [description]
 * @param  {[type]} enemy        [description]
 * @param  {[type]} battleStatus [description]
 * @param  {[type]} currentEnemy [description]
 * @return {[type]}              [description]
 */
function enemyBlock(dispatch, enemy, battleStatus, currentEnemy) {
  if (!battleStatus) {
    return div({className: 'w-25 mh3'}, [
      div({}, 'Enemy:'),
      select({
        className: 'db pa2 ba input-reset br1 bg-white ba b--black',
        onchange: (e) => dispatch(enemyMsg(e.target.value)),
      },
      enemyOptions(enemy),
      )]
    );
  } else {
    const {hp} = currentEnemy;
    return div({className: 'w-25 mh3'}, [
      statLine(statLineClasses, 'Enemy Health', hp),
    ]);
  }
}

/**
 * [statsBlock description]
 * @param  {[type]} dispatch [description]
 * @param  {[type]} player   [description]
 * @param  {[type]} enemy    [description]
 * @param  {[type]} model    [description]
 * @return {[type]}          [description]
 */
function statsBlock(dispatch, player, enemy, model) {
  return div({className: 'flex'}, [
    playerBlock(dispatch, player),
    enemyBlock(dispatch, enemy, model.inBattle, model.currentEnemy),
    playerStatsBlock(dispatch, player),
  ]);
}

/**
 * [view Composites the final view for the DOM]
 * @param  {[function]} dispatch [Current message]
 * @param  {[object]} model    [Current model]
 * @return {[function]}          [The final view to be rendered to the DOM]
 */
function view(dispatch, model) {
  const {player, currentEnemy} = model;
  return div({className: 'mw8 center'}, [
    h1({className: 'f2 pv2 bb'}, 'Dragon Quest 1 Battle Simulator'),
    div('#scrollbox', {className: 'h5 overflow-y-scroll'},
        battleText(model.battleText),
    ),
    buttonBlock(dispatch, player, model),
    statsBlock(dispatch, player, currentEnemy, model),
    pre(JSON.stringify(model, null, 2)),
  ]);
}

export default view;
