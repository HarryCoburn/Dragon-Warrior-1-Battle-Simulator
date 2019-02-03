import * as R from "ramda";
import { coinFlip, capitalize, randomFromRange, heal } from "./Utils";

// Test for excellent (critical) attack
const excellentLimit = 32;
const excellentCheck = R.equals(randomFromRange([1, excellentLimit]), 1);

// Test if an enemy dodged an attack
const dodgeLimit = 64;
const dodgeSuccess = dodgeChance =>
  randomFromRange([1, dodgeLimit]) <= dodgeChance;

// Test to see if an enemy resisted a spell
const resistLimit = 16;
const resistCheck = resistValue =>
  randomFromRange([1, resistLimit]) <= resistValue;

// Test if you still sleeping at the start of a round.
const checkSleepCount = model => model.sleepCount > 0;
const stillSleeping = model => R.both(coinFlip, checkSleepCount(model));

// Define normal damage range
const minDamage = (x, y) => (x - y / 2) / 4;
const maxDamage = (x, y) => (x - y / 2) / 2;
const normalDamageRange = (x, y) => [minDamage(x, y), maxDamage(x, y)];

// Define critical damage range
const minCriticalDamage = x => x / 2;
const maxCriticalDamage = x => x;
const criticalDamageRange = x => [minCriticalDamage(x), maxCriticalDamage(x)];

// Modifiers for adjusting difficulty to run away.
const runModifiers = [0.25, 0.375, 0.75, 1];

// Tests sleep checks and waking up
const stayAsleep = R.evolve({
  battleText: R.append("You are still asleep!"),
  sleepCount: R.dec()
});

const wakeUp = R.evolve({
  battleText: R.append("You wake up!"),
  playerSleep: false
});

const checkWakeUp = R.ifElse(stillSleeping, stayAsleep, wakeUp);

/**
 * [startPlayerRound description]
 * @param  {[type]} model [description]
 * @param  {[type]} msg   [description]
 * @return {[type]}       [description]
 */
export function startPlayerRound(model, msg) {
  const sleepChecked = R.when(R.propEq("playerSleep", true), checkWakeUp)(
    model
  );
  console.log("Checking sleep");
  console.log(sleepChecked);
  if (R.equals(sleepChecked.playerSleep, true)) return sleepChecked;
  switch (msg.type) {
    case "CAST_HEAL":
    case "CAST_HEALMORE":
    case "CAST_HURT":
    case "CAST_HURTMORE":
    case "CAST_SLEEP":
    case "CAST_STOPSPELL": {
      return playerSpell(msg, sleepChecked);
    }
    case "FIGHT": {
      return playerFight(sleepChecked);
    }
    case "USE_HERB": {
      return useHerb(sleepChecked);
    }
    case "RUN_AWAY": {
      return runAway(sleepChecked);
    }
    default: {
      return model;
    }
  }
}

/**
 * [useHerb description]
 * @param  {[type]} model [description]
 * @return {[type]}       [description]
 */
function useHerb(model) {
  const herbRange = [23, 30];
  const { player } = model;
  const finalHeal = heal(player, herbRange);
  const updatedText = R.equals(finalHeal, 0)
    ? R.append(
        `Player eats a healing herb. But their hit points were already at maximum!`,
        model.battleText
      )
    : R.append(
        `Player eats a healing herb. Player is healed ${finalHeal} hit points`,
        model.battleText
      );
  const updatedPlayer = {
    ...player,
    hp: player.hp + finalHeal,
    herbCount: R.dec(player.herbCount)
  };
  return { ...model, player: updatedPlayer, battleText: updatedText };
}

/**
 * [runAway description]
 * @param  {[type]} model [description]
 * @return {[type]}       [description]
 */
function runAway(model) {
  const { player, enemy } = model;
  const pAgility = player.agility;
  const eAgility = enemy.agility;
  const pMod = randomFromRange([0, 255]);
  const eMod = randomFromRange([0, 255]);
  const eRunMod = runModifiers[enemy.run];
  const updatedText = [...model.battleText];
  updatedText.push(`You try to run away...`);
  const successfulRun = R.gt(pAgility * pMod, eAgility * eMod * eRunMod);
  if (R.or(successfulRun, R.equals(model.enemySleep, true))) {
    updatedText.push(`You succeed in fleeing!`);
    return { ...model, inBattle: false, battleText: updatedText };
  }
  updatedText.push(`...but the enemy blocks you from running away!`);
  return { ...model, battleText: updatedText };
}

/**
 * [playerFight description]
 * @param  {[type]} model [description]
 * @param  {[type]} dodged [description]
 * @return {[type]}       [description]
 */
export function playerFight(model) {
  const { player, enemy } = model;
  const dodged = dodgeSuccess(enemy.dodge);
  const critHit = excellentCheck;
  const damageToEnemy = playerDamage(player, enemy, critHit, dodged);
  const enemyAfterRound = { ...enemy, hp: enemy.hp - damageToEnemy };
  const afterPlayerRoundModel = { ...model, enemy: enemyAfterRound };
  return playerBattleMessages(
    afterPlayerRoundModel,
    damageToEnemy,
    critHit,
    dodged
  );
}

/**
 * [playerDamage description]
 * @param  {[type]} player [description]
 * @param  {[type]} enemy  [description]
 * @param  {[type]} critHit  [description]
 * @param  {[type]} dodged  [description]
 * @return {[type]}        [description]
 */
function playerDamage(player, enemy, critHit, dodged) {
  if (dodged) return 0;
  const heroAttack = player.strength + player.weapon.mod;
  const enemyDefense = enemy.agility;
  if (critHit) {
    const criticalDamage = randomFromRange(criticalDamageRange(heroAttack));
    return isPlayerDamageLow(criticalDamage);
  }
  const normalDamage = randomFromRange(
    normalDamageRange(heroAttack, enemyDefense)
  );
  return isPlayerDamageLow(normalDamage);
}

/**
 * [isPlayerDamageLow description]
 * @param  {[type]}  playerDamage [description]
 * @return {Boolean}              [description]
 */
function isPlayerDamageLow(damage) {
  if (damage < 1) {
    const zeroDamage = coinFlip();
    const finalPlayerDamage = R.equals(zeroDamage, true) ? 0 : 1;
    return finalPlayerDamage;
  }
  return damage;
}

/**
 * [playerBattleMessages description]
 * @param  {[type]} model  [description]
 * @param  {[type]} damage [description]
 * @param  {[type]} critHit [description]
 * @param  {[type]} dodged [description]
 * @return {[type]}        [description]
 */
function playerBattleMessages(model, damage, critHit, dodged) {
  const { enemy, battleText } = model;
  if (R.and(critHit, R.not(enemy.voidCrit))) {
    battleText.push(`Player attacks with an excellent attack!!`);
  } else {
    battleText.push(`Player attacks!`);
  }
  if (dodged) {
    battleText.push(`But the ${enemy.name} dodged your attack!`);
    return { ...model, battleText };
  }
  battleText.push(`Player hits ${enemy.name} for ${damage} points of damage.`);
  if (enemy.hp <= 0) {
    battleText.push(`You have defeated the ${enemy.name}!`);
    return { ...model, battleText, inBattle: false };
  }
  return { ...model, battleText };
}

/**
 * [playerSpell description]
 * @param  {[type]} msg   [description]
 * @param  {[type]} model [description]
 * @return {[type]}       [description]
 */
export function playerSpell(msg, model) {
  console.log(msg);
  switch (msg.type) {
    case "CAST_HEAL": {
      return playerHeal(model, false);
    }
    case "CAST_HEALMORE": {
      return playerHeal(model, true);
    }
    case "CAST_HURT": {
      return playerHurt(model, false);
    }
    case "CAST_HURTMORE": {
      return playerHurt(model, true);
    }
    case "CAST_SLEEP": {
      return playerSleep(model);
    }
    case "CAST_STOPSPELL": {
      return playerStop(model);
    }
    default:
      console.log("Spell fell through switchblock!");
      return model;
  }
}

/**
 * [playerHeal description]
 * @param  {[type]}  model      [description]
 * @param  {Boolean} isHealmore [description]
 * @return {[type]}             [description]
 */
function playerHeal(model, isHealmore) {
  const healCost = 4;
  const healmoreCost = 10;
  const playerHealRange = [10, 17];
  const playerHealmoreRange = [85, 100];
  const updatedText = [...model.battleText];
  const { player, playerStop: stopped } = model;
  const { mp, hp } = player;
  const spellName = isHealmore ? "Healmore" : "Heal";
  if (
    (R.or(R.and(R.lt(mp, healCost), R.not(isHealmore))),
    R.and(R.lt(mp, healmoreCost), isHealmore))
  ) {
    return {
      ...model,
      battleText: R.append(
        `Player tries to cast ${spellName}, but doesn't have enough MP!`,
        updatedText
      )
    };
  }
  const newMP = isHealmore ? mp - healmoreCost : mp - healCost;
  if (stopped) {
    updatedText.push(
      `Player casts ${spellName}! But their magic has been sealed!`
    );
    const updatedPlayer = { ...model.player, mp: newMP };
    return { ...model, player: updatedPlayer, battleText: updatedText };
  }
  const finalHeal = isHealmore
    ? heal(player, playerHealmoreRange)
    : heal(player, playerHealRange);
  const newPlayerHP = hp + finalHeal;
  if (R.equals(finalHeal, 0)) {
    updatedText.push(
      `Player casts ${spellName}! But their hit points were already at maximum!`
    );
  } else {
    updatedText.push(
      `Player casts ${spellName}! Player is healed ${finalHeal} hit points`
    );
  }
  const updatedPlayer = { ...model.player, hp: newPlayerHP, mp: newMP };
  return { ...model, player: updatedPlayer, battleText: updatedText };
}

/**
 * [playerHurt description]
 * @param  {[type]}  model      [description]
 * @param  {Boolean} isHurtmore [description]
 * @return {[type]}             [description]
 */
function playerHurt(model, isHurtmore) {
  const hurtCost = 2;
  const hurtmoreCost = 5;
  const playerHurtRange = [5, 12];
  const playerHurtmoreRange = [58, 65];
  const { enemy, player, playerStop: stopped } = model;
  console.log("Stopped is...");
  console.log(stopped);
  const { hp, hurtR } = enemy;
  const { mp } = player;
  const spellName = isHurtmore ? "Hurtmore" : "Hurt";
  if (
    (R.or(R.and(R.lt(mp, hurtCost), R.not(isHurtmore))),
    R.and(R.lt(mp, hurtmoreCost), isHurtmore))
  ) {
    const updatedText = [
      ...model.battleText,
      `Player tries to cast ${spellName}, but doesn't have enough MP!`
    ];
    return { ...model, battleText: updatedText };
  }
  const newMP = isHurtmore ? mp - hurtmoreCost : mp - hurtCost;
  const newPlayer = { ...player, mp: newMP };
  if (R.equals(stopped, true) === true) {
    return {
      ...model,
      player: newPlayer,
      battleText: R.append(
        `Player casts ${spellName}! But their magic has been sealed!`,
        model.battleText
      )
    };
  }
  const hurtDamage = isHurtmore
    ? randomFromRange(playerHurtmoreRange)
    : randomFromRange(playerHurtRange);
  const newHP = hp - hurtDamage;
  const updatedText = [...model.battleText];
  updatedText.push(`Player casts Hurt!`);
  const hurtResisted = resistCheck(hurtR);
  if (R.equals(hurtResisted, true)) {
    updatedText.push(`But the ${enemy.name} resisted!`);
    return { ...model, player: newPlayer, battleText: updatedText };
  }
  updatedText.push(
    ` ${capitalize(enemy.name)} is hurt by ${hurtDamage} hit points`
  );
  const battleState = newHP <= 0;
  // Handle wins
  const newEnemy = { ...enemy, hp: newHP };
  if (newHP <= 0) {
    updatedText.push(`You have defeated the ${capitalize(enemy.name)}`);
  }
  return {
    ...model,
    enemy: newEnemy,
    player: newPlayer,
    battleText: updatedText,
    inBattle: battleState
  };
}

/**
 * [playerSleep description]
 * @param  {[type]} model [description]
 * @return {[type]}       [description]
 */
function playerSleep(model) {
  const { enemy, player, playerStop: stopped } = model;
  const { mp } = player;
  const { sleepR } = enemy;
  const updatedText = [...model.battleText];
  const sleepCost = 2;
  if (mp < sleepCost) {
    updatedText.push(`Player tries to cast Sleep, but doesn't have enough MP!`);
    return { ...model, battleText: updatedText };
  }
  const newMP = mp - sleepCost;
  const newPlayer = { ...player, mp: newMP };
  if (stopped) {
    updatedText.push(`Player casts Sleep! But their magic has been sealed!`);
    return { ...model, player: newPlayer, battleText: updatedText };
  }
  updatedText.push(`Player casts Sleep!`);
  if (model.enemySleep) {
    updatedText.push(`But the ${enemy.name} is already asleep!`);
    return { ...model, player: newPlayer, battleText: updatedText };
  }
  const sleepResisted = resistCheck(sleepR);
  if (R.equals(sleepResisted, true)) {
    updatedText.push(`But the ${enemy.name} resisted!`);
    return { ...model, player: newPlayer, battleText: updatedText };
  }
  updatedText.push(` ${capitalize(enemy.name)} is now asleep!`);
  const enemySleep = R.or(model.enemySleep, 2);
  return {
    ...model,
    player: newPlayer,
    battleText: updatedText,
    enemySleep
  };
}

/**
 * [playerStop description]
 * @param  {[type]} model [description]
 * @return {[type]}       [description]
 */
function playerStop(model) {
  const { enemy, player, enemyStop, playerStop: stopped } = model;
  const { mp } = player;
  const { stopR } = enemy;
  const updatedText = [...model.battleText];
  const stopCost = 2;
  if (mp < stopCost) {
    updatedText.push(
      `Player tries to cast Stopspell, but doesn't have enough MP!`
    );
    return { ...model, battleText: updatedText };
  }
  const newMP = mp - stopCost;
  const newPlayer = { ...player, mp: newMP };
  if (stopped) {
    updatedText.push(
      `Player casts Stopspell! But their magic has been sealed!`
    );
    return { ...model, player: newPlayer, battleText: updatedText };
  }
  updatedText.push(`Player casts Stopspell!`);
  if (enemyStop) {
    updatedText.push(`But the ${enemy.name}'s magic is already blocked!`);
    return { ...model, player: newPlayer, battleText: updatedText };
  }
  const stopResisted = resistCheck(stopR);
  if (R.equals(stopResisted, true)) {
    updatedText.push(`But the ${enemy.name} resisted!`);
    return { ...model, player: newPlayer, battleText: updatedText };
  }
  updatedText.push(` ${capitalize(enemy.name)}'s magic is now blocked!`);
  const enemyStopState = true;
  return {
    ...model,
    player: newPlayer,
    battleText: updatedText,
    enemyStop: enemyStopState
  };
}
