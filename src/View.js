import hh from 'hyperscript-helpers';
import {h} from 'virtual-dom';
import * as R from 'ramda';
import {startBattleMsg,
  fightMsg,
  enemyMsg,
  levelMsg,
  nameMsg,
  weaponMsg,
  armorMsg,
  shieldMsg,
  healMsg,
  healmoreMsg,
  hurtMsg,
  hurtmoreMsg,
  sleepMsg} from './Update';

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
const ENEMIES = ['Choose an enemy', 'Slime', 'Red Slime', 'Drakee', 'Ghost', 'Magician', 'Magidrakee', 'Scorpion', 'Druin',
  'Poltergeist', 'Droll', 'Drakeema', 'Skeleton', 'Warlock', 'Metal Scorpion', 'Wolf', 'Wraith', 'Metal Slime', 'Specter', 'Wolflord',
  'Druinlord', 'Drollmagi', 'Wyvern', 'Rogue Scorpion', 'Wraith Knight', 'Golem', 'Goldman', 'Knight', 'Magiwyvern',
  'Demon Knight', 'Werewolf', 'Green Dragon', 'Starwyvern', 'Wizard', 'Axe Knight', 'Blue Dragon', 'Stoneman', 'Armored Knight',
  'Red Dragon', 'Dragonlord (first form)', 'Dragonlord (second form)'];
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
  const {enemy, inBattle} = model;
  if (!inBattle) {
    return button({className: '', onclick: (e) => dispatch(startBattleMsg)}, 'Start Battle');
  }
  const buttons = [button({className: '', onclick: (e) => dispatch(fightMsg(player, enemy))}, 'Attack')];
  if (player.level >= 3) {
    buttons.push(button({className: '', onclick: (e) => dispatch(healMsg(player.hp, player.maxhp))}, 'Heal'));
  }
  if (player.level >= 4) {
    buttons.push(button({className: '', onclick: (e) => dispatch(hurtMsg)}, 'Hurt'));
  }
  if (player.level >= 7) {
    buttons.push(button({className: '', onclick: (e) => dispatch(sleepMsg)}, 'Sleep'));
  }
  if (player.level >= 17) {
    buttons.push(button({className: '', onclick: (e) => dispatch(healmoreMsg(player.hp, player.maxhp))}, 'Healmore'));
  }
  if (player.level >= 19) {
    buttons.push(button({className: '', onclick: (e) => dispatch(hurtmoreMsg)}, 'Hurtmore'));
  }
  return buttons;
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
  if (selectedEnemy === undefined) {
    selectedEnemy = '';
  }
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
      onchange: (e) => dispatch(levelMsg(parseInt(e.target.value))), // parsing needed to avoid view bug
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
  const {hp, maxhp, mp, weapon, armor, shield, level} = player;
  return div({className: 'w-25 mh3'}, [
    div({className: ''}, 'Player Stats:'),
    statLine(statLineClasses, 'Player Level', `${level}`),
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
 * @param  {[type]} inBattle [description]
 * @param  {[type]} currentEnemy [description]
 * @return {[type]}              [description]
 */
function enemyBlock(dispatch, enemy, inBattle) {
  if (!inBattle) {
    return div({className: 'w-25 mh3'}, [
      div({}, 'Enemy:'),
      select({
        className: 'db pa2 ba input-reset br1 bg-white ba b--black',
        onchange: (e) => dispatch(enemyMsg(e.target.value)),
      },
      enemyOptions(enemy.name),
      )]
    );
  } else {
    const {hp} = enemy;
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
    enemyBlock(dispatch, enemy, model.inBattle),
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
  const {player, enemy} = model;
  return div({className: 'mw8 center'}, [
    h1({className: 'f2 pv2 bb'}, 'Dragon Quest 1 Battle Simulator'),
    div('#scrollbox', {className: 'h5 overflow-y-scroll'},
        battleText(model.battleText),
    ),
    buttonBlock(dispatch, player, model),
    statsBlock(dispatch, player, enemy, model),
    pre(JSON.stringify(model, null, 2)),
  ]);
}

export default view;
