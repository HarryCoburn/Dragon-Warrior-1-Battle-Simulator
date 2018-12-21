import hh from 'hyperscript-helpers';
import {h} from 'virtual-dom';
import * as R from 'ramda';
import {fightMsg, enemyMsg, levelMsg, nameMsg, weaponMsg} from './Update';

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
const ENEMIES = ['Choose an enemy', 'slime', 'red slime', 'drakee', 'ghost', 'magician', 'magidrakee', 'scorpion'];
const LEVELS = numRange(30, 1);
const WEAPONS = ['Unarmed', 'Bamboo Pole', 'Club', 'Copper Sword', 'Hand Axe', 'Broad Sword', 'Flame Sword', "Erdrick's Sword"];
const statLine = (className, label, value) =>
  div({className}, `${label}: ${value}`);
const statLineClasses = 'pv2 ph2 dib';

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
  const {hp, weapon} = player;
  return div({className: 'w-25'}, [
    div({}, 'Player Name:'),
    input({
      oninput: (e) => dispatch(nameMsg(e.target.value)),
    }, 'Player Name'),
    div({}, 'Player Level:'),
    select({
      className: 'db pa2 ba input-reset br1 bg-white ba b--black',
      onchange: (e) => dispatch(levelMsg(e.target.value)),
    },
    levelOptions(player.level),
    ),
    div({}, 'Player Weapon:'),
    select({
      className: 'db pa2 ba input-reset br1 bg-white ba b--black',
      onchange: (e) => dispatch(weaponMsg(e.target.value)),
    },
    weaponOptions(player.weapon),
    ),
    statLine(statLineClasses, 'Player Health', hp),
    statLine(statLineClasses, 'Player Weapon', weapon.name),
  ]);
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
    return div({className: 'w-50'}, [
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
    return div({className: 'w-50'}, [
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
    statsBlock(dispatch, player, currentEnemy, model),
    button({className: '', onclick: (e) => dispatch(fightMsg(player, currentEnemy))}, 'Fight'),
    pre(JSON.stringify(model, null, 2)),
  ]);
}

export default view;
