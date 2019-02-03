import * as R from "ramda";
import { capitalize, coinFlip, randomFromRange } from "./Utils";

// Define low damage range
const minDamageHighDefense = 0;
const maxDamageHighDefense = x => (x + 4) / 6;
const lowDamageRange = x => [minDamageHighDefense, maxDamageHighDefense(x)];

// Define normal damage range
const minDamage = (x, y) => (x - y / 2) / 4;
const maxDamage = (x, y) => (x - y / 2) / 2;
const normalDamageRange = (x, y) => [minDamage(x, y), maxDamage(x, y)];

// Takes an AI pattern and sums the weights up.
const sumOfWeights = enemyAI =>
  enemyAI.reduce((memo, entry) => memo + entry.weight, 0);

/**
 * [getAttack Gets an attack from the enemy's AI pattern based on weight.
 * CURRENTLY IMPURE.]
 * @param  {[type]} sumOfWeights [description]
 * @return {[type]}              [description]
 */
function getAttack(weightSum) {
  let random = Math.floor(Math.random() * (weightSum + 1));
  return function attackPick(attack) {
    random -= attack.weight;
    return random <= 0;
  };
}

/* The Enemy's Round */

/**
 * [startEnemyRound description]
 * @param  {[type]} model [description]
 * @return {[type]}       [description]
 */
export default function startEnemyRound(model) {
  return R.cond([
    [sleepCheck, enemyStillAsleep],
    [runCheck, enemyFlees],
    [R.always(true), enemyRound]
  ])(model);
}

function sleepCheck(model) {
  return R.compose(
    R.lt(0),
    R.prop("enemySleep")
  )(model);
}

function runCheck(model) {
  return R.and(
    R.gte(model.player.strength, model.enemy.strength * 2),
    R.equals(randomFromRange([1, 4]), 4)
  );
}

function enemyFlees(model) {
  console.log("Running!");
  return {
    ...model,
    battleText: R.append(
      `The enemy flees from your superior strength!`,
      model.battleText
    ),
    enemySleep: 0,
    inBattle: false
  };
}

function enemyStillAsleep(model) {
  return R.cond([
    [
      R.compose(
        R.equals(2),
        R.prop("enemySleep")
      ),
      firstRoundSleep
    ],
    [wakeUpCheck, enemyWakesUp],
    [true, enemyStaysAsleep]
  ])(model);
}

function firstRoundSleep(model) {
  return {
    ...model,
    battleText: R.append(
      `The ${model.enemy.name} is asleep.`,
      model.battleText
    ),
    enemySleep: 1
  };
}

function wakeUpCheck() {
  const wakeChance = 3;
  return R.equals(randomFromRange([1, wakeChance]), wakeChance);
}

function enemyWakesUp(model) {
  return enemyRound({
    ...model,
    battleText: R.append(`The ${model.enemy.name} woke up!`, model.battleText),
    enemySleep: 0
  });
}

function enemyStaysAsleep(model) {
  return {
    ...model,
    battleText: R.append(
      `The ${model.enemy.name} is still asleep...`,
      model.battleText
    )
  };
}

const attackMatch = R.equals;

const willSleep = R.propEq("playerSleep", false);
const willStop = R.propEq("playerStop", false);

/**
 * [enemyRound description]
 * @param  {[type]} model     [description]
 * @param  {[type]} aiPattern [description]
 * @return {[type]}           [description]
 */
function enemyRound(model, ai) {
  const { enemy } = model;
  const aiPattern = R.or(ai, enemy.pattern);
  const chosenAttack = aiPattern.find(getAttack(sumOfWeights(aiPattern))).id;
  console.log("Chosen attack is...");
  console.log(chosenAttack);
  return R.cond([
    [attackMatch("ATTACK"), () => enemyAttack(model)],
    [attackMatch("HURT"), () => enemyHurt(model, false)],
    [attackMatch("HURTMORE"), () => enemyHurt(model, true)],
    [
      attackMatch("HEAL"),
      () =>
        willHeal(model)
          ? enemyHeal(model, false)
          : removeHeal([model, aiPattern])
    ], // TODO, reactivate these when conditions are different?
    [
      attackMatch("HEALMORE"),
      () =>
        willHeal(model)
          ? enemyHeal(model, true)
          : removeHeal([model, aiPattern])
    ],
    [
      attackMatch("SLEEP"),
      () =>
        willSleep(model) ? enemySleep(model) : removeSleep([model, aiPattern])
    ],
    [
      attackMatch("STOPSPELL"),
      () =>
        willStop(model) ? enemyStop(model) : removeStop([model, aiPattern])
    ],
    [attackMatch("FIRE"), () => enemyFire(model, false)],
    [attackMatch("STRONGFIRE"), () => enemyFire(model, true)],
    [true, () => console.log("Enemy Round Went Wrong!")]
  ])(chosenAttack);
}

const enemyHPRatio = model => model.enemy.hp / model.enemy.maxhp;

function willHeal(model) {
  return R.compose(
    R.gt(0.25),
    enemyHPRatio
  )(model);
}

function removeHeal(aiPattern, model) {
  const newAIPattern = aiPattern.filter(
    item => item.id !== "HEAL" && item.id !== "HEALMORE"
  );
  return enemyRound(model, newAIPattern);
}

function removeSleep(model, aiPattern) {
  const newAIPattern = aiPattern.filter(item => item.id !== "SLEEP");
  return enemyRound(model, newAIPattern);
}

function removeStop(bundle) {
  console.log("Trying to remove stop");
  const [model, aiPattern] = bundle;
  const newAIPattern = aiPattern.filter(item => item.id !== "STOPSPELL");
  return enemyRound(model, newAIPattern);
}

/**
 * [enemyAttack description]
 * @param  {[type]} model [description]
 * @return {[type]}       [description]
 */
function enemyAttack(model) {
  const { player, enemy } = model;
  const damageToPlayer = enemyDamage(player, enemy);
  const playerAfterRound = { ...player, hp: player.hp - damageToPlayer };
  const afterEnemyRoundModel = { ...model, player: playerAfterRound };
  return enemyBattleMessages(afterEnemyRoundModel, damageToPlayer);
}

/**
 * [enemyDamage description]
 * @param  {[type]} player [description]
 * @param  {[type]} enemy  [description]
 * @return {[type]}        [description]
 */
function enemyDamage(player, enemy) {
  // Basic enemy attack calculations
  const attack = enemy.strength;
  const heroDefense = Math.floor(
    (player.agility + player.armor.mod + player.shield.mod) / 2
  );
  const heroHighDefense = R.gte(heroDefense, attack);
  // Enemy attack range calculation
  if (heroHighDefense) {
    return randomFromRange(lowDamageRange(attack));
  }
  return randomFromRange(normalDamageRange(attack, heroDefense));
}

/**
 * [enemyBattleMessages description]
 * @param  {[type]} model  [description]
 * @param  {[type]} damage [description]
 * @return {[type]}        [description]
 */
function enemyBattleMessages(model, damage) {
  const { player, enemy, battleText } = model;
  battleText.push(
    `${capitalize(enemy.name)} attacks! ${capitalize(
      enemy.name
    )} hits you for ${damage} points of damage`
  );
  if (player.hp <= 0) {
    battleText.push(`You have been defeated by the ${enemy.name}!`);
    return { ...model, battleText, inBattle: false };
  }
  return { ...model, battleText };
}

/**
 * [enemyHurt description]
 * @param  {[type]}  model      [description]
 * @param  {Boolean} isHurtmore [description]
 * @return {[type]}             [description]
 */
function enemyHurt(model, isHurtmore) {
  const eHurtRange = [3, 10];
  const eHurtmoreRange = [30, 45];
  const eHurtRangeLow = [2, 6];
  const eHurtmoreRangeLow = [20, 30];
  const spellName = isHurtmore ? "Hurtmore" : "Hurt";
  const { enemy, player, enemyStop: stopped } = model;
  console.log("Stopped is");
  console.log(stopped);
  const { hp, armor } = player;
  const magicDefense = armor.magDef;
  const hurtDamage = isHurtmore
    ? magicDefense
      ? randomFromRange(eHurtmoreRangeLow)
      : randomFromRange(eHurtmoreRange)
    : magicDefense
    ? randomFromRange(eHurtRangeLow)
    : randomFromRange(eHurtRange);
  const newHP = hp - hurtDamage;
  const updatedText = [...model.battleText];
  updatedText.push(`${capitalize(enemy.name)} casts ${spellName}!`);
  if (R.equals(stopped, true)) {
    updatedText.push(`However, ${capitalize(enemy.name)}'s magic is blocked!`);
    return { ...model, battleText: updatedText };
  }
  updatedText.push(` Player is hurt by ${hurtDamage} hit points.`);
  const battleState = newHP <= 0;
  const newPlayer = { ...player, hp: newHP };
  if (newHP <= 0) {
    updatedText.push(
      `You have been defeated by the ${capitalize(enemy.name)}.`
    );
  }
  return {
    ...model,
    player: newPlayer,
    battleText: updatedText,
    inBattle: battleState
  };
}

/**
 * [enemyHeal description]
 * @param  {[type]}  model      [description]
 * @param  {Boolean} isHealmore [description]
 * @return {[type]}             [description]
 */
function enemyHeal(isHealmore, model) {
  const eHealRange = [20, 27];
  const eHealmoreRange = [85, 100];
  const { enemy, enemyStop: stopped } = model;
  const { hp, maxhp } = enemy;
  const spellName = isHealmore ? "Healmore" : "Heal";
  const healMax = maxhp - hp;
  const healAmt = isHealmore
    ? randomFromRange(eHealmoreRange)
    : randomFromRange(eHealRange);
  const finalHeal = healMax < healAmt ? healMax : healAmt;
  const updatedText = [...model.battleText];
  updatedText.push(`${capitalize(enemy.name)} casts ${spellName}!`);
  if (R.equals(stopped, true)) {
    updatedText.push(`However, ${capitalize(enemy.name)}'s magic is blocked!`);
    return { ...model, battleText: updatedText };
  }
  const newEnemyHP = hp + finalHeal;
  updatedText.push(
    `${capitalize(enemy.name)} is healed ${finalHeal} hit points`
  );
  const updatedEnemy = { ...model.enemy, hp: newEnemyHP };
  return { ...model, enemy: updatedEnemy, battleText: updatedText };
}

/**
 * [enemySleep description]
 * @param  {[type]} model [description]
 * @return {[type]}       [description]
 */
function enemySleep(model) {
  const { enemy, enemyStop: stopped } = model;
  const updatedText = [...model.battleText];
  updatedText.push(`The ${enemy.name} casts Sleep!`);
  if (stopped) {
    updatedText.push(`However, ${capitalize(enemy.name)}'s magic is blocked!`);
    return { ...model, battleText: updatedText };
  }
  updatedText.push(`You fall asleep!`);
  return { ...model, battleText: updatedText, playerSleep: true };
}

/**
 * [enemyStop description]
 * @param  {[type]} model [description]
 * @return {[type]}       [description]
 */
function enemyStop(model) {
  const { enemy, enemyStop: stopped } = model;
  const updatedText = [...model.battleText];
  updatedText.push(`The ${enemy.name} casts Stopspell!`);
  if (R.equals(stopped, true) === true) {
    updatedText.push(`However, ${capitalize(enemy.name)}'s magic is blocked!`);
    return { ...model, battleText: updatedText };
  }
  if (coinFlip()) {
    updatedText.push(`Your magic has been blocked!`);
    return { ...model, battleText: updatedText, playerStop: true };
  }
  updatedText.push(`But the spell fails!`);
  return { ...model, battleText: updatedText };
}

/**
 * [enemyFire description]
 * @param  {[type]}  model        [description]
 * @param  {Boolean} isStrongfire [description]
 * @return {[type]}               [description]
 */
function enemyFire(model, isStrongfire) {
  const eFireRange = [16, 23];
  const eStrongfireRange = [65, 72];
  const eFireRangeLow = [10, 14];
  const eStrongfireRangeLow = [42, 48];
  const { enemy, player } = model;
  const { hp, armor } = player;
  const spellName = isStrongfire ? "strong flames at you!" : "fire";
  const fireDefense = armor.fireDef;
  const fireDamage = isStrongfire
    ? fireDefense
      ? randomFromRange(eStrongfireRangeLow)
      : randomFromRange(eStrongfireRange)
    : fireDefense
    ? randomFromRange(eFireRangeLow)
    : randomFromRange(eFireRange);
  const newHP = hp - fireDamage;
  const updatedText = [...model.battleText];
  updatedText.push(`${capitalize(enemy.name)} breathes ${spellName}!`);
  updatedText.push(` Player is hurt by ${fireDamage} hit points.`);
  const battleState = newHP <= 0;
  const newPlayer = { ...player, hp: newHP };
  if (newHP <= 0) {
    updatedText.push(
      `You have been defeated by the ${capitalize(enemy.name)}.`
    );
  }
  return {
    ...model,
    player: newPlayer,
    battleText: updatedText,
    inBattle: battleState
  };
}
