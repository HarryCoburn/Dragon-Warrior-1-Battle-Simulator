import * as R from "ramda";
import { randomFromRange } from "./Utils";

// Reset battleText
const clearText = R.assoc("battleText", []);
const clearTextCheck = R.assoc("cleanBattleText", R.F);
const needToClean = R.propEq("cleanBattleText", R.T);
const cleanTextPipe = R.pipe(
  clearText,
  clearTextCheck
);
const checkClean = R.when(needToClean, cleanTextPipe);

// Confirm that 'enemy' in the model object contains an enemy object.
const checkEnemyObject = R.propIs(Object, "enemy");

// Warn we haven't selected an enemy
const chooseWarning = R.evolve({
  battleText: R.append(`Please choose an enemy!`),
  cleanBattleText: R.T,
  initiative: R.F
});

// Generate initiative number. x = agility, y = modifier
const initiative = (x, y = 1) => x * randomFromRange([0, 255]) * y;

/**
 * [checkInit Does an initiative check]
 * @param  {[type]} model [description]
 * @return {[type]}       [description]
 */
function checkInit(model) {
  const { player, enemy } = model;
  return R.gt(initiative(player.agility), initiative(enemy.agility, 0.25));
}

// Checks if  enemy object has an array for HP.
// If so, get a random number in that range.
// Otherwise, just return the number given.
const calculateEnemyHP = R.when(R.is(Array), randomFromRange);

/**
 * [fightSetup Set up hit points for both player and enemy,
 * checks initiative, then returns to Update]
 * @param  {[type]} model [description]
 * @return {[type]}       [description]
 */
function fightSetup(model) {
  const { enemy, player } = model;
  const { hp } = enemy;
  const enemyHP = calculateEnemyHP(hp);
  const finalModel = R.evolve(
    {
      player: R.assoc("hp", player.maxhp),
      enemy: R.pipe(
        R.assoc("hp", enemyHP),
        R.assoc("maxhp", enemyHP)
      ),
      inBattle: R.T,
      battleText: R.append(`You are fighting the ${model.enemy.name}`),
      initiative: checkInit(model)
    },
    model
  );
  return finalModel;
}

// Prepare selected enemy or warn that it hasn't been selected
const prepareEnemy = R.ifElse(checkEnemyObject, fightSetup, chooseWarning);

// Starting battle...
const startBattle = R.pipe(
  checkClean,
  prepareEnemy
);

export default startBattle;
