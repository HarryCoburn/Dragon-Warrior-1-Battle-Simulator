import * as R from "ramda";
// import { changeStats } from "../src/Stats";
// import update from "../src/Update"
import update, {
  herbMsg,
  levelMsg,
  enemyMsg,
  shieldMsg,
  armorMsg,
  weaponMsg,
  nameMsg
} from "../src/Update";

describe("Bad Message", () => {
  const badModel = { bad: true };
  const badMsg = { type: "This doesn't exist" };
  test("Bad message should spit back same model", () => {
    expect(update(badMsg, badModel)).toEqual(badModel);
  });
});

describe("Herb Count Test", () => {
  const herbModel = { player: { herbCount: 0 } };
  test("Set Herb Count Correctly", () => {
    const msg = herbMsg(4);

    expect(update(msg, herbModel)).toEqual({
      player: {
        herbCount: 4
      }
    });
  });
});

describe("Change Stats Test", () => {
  const msg = { type: "CHANGE_STATS" };
  const model = {
    player: {
      name: "Rollo",
      nameSum: 0,
      progression: 0,
      level: 2,
      strength: 4,
      agility: 4,
      hp: 15,
      maxhp: 15,
      mp: 0
    }
  };

  test("Change stats correctly from update.js", () => {
    expect(update(msg, model)).toEqual({
      player: {
        name: "Rollo",
        nameSum: 0,
        progression: 0,
        level: 2,
        strength: 4,
        agility: 3,
        hp: 22,
        maxhp: 22,
        mp: 0
      }
    });
  });
});

describe("Change Level Test", () => {
  const msg = levelMsg(2);
  const model = {
    player: {
      name: "Rollo",
      nameSum: 0,
      progression: 0,
      level: 1,
      strength: 4,
      agility: 4,
      hp: 15,
      maxhp: 15,
      mp: 0
    }
  };

  test("Level changes correctly from update.js", () => {
    expect(update(msg, model)).toEqual({
      player: {
        name: "Rollo",
        nameSum: 0,
        progression: 0,
        level: 2,
        strength: 4,
        agility: 3,
        hp: 22,
        maxhp: 22,
        mp: 0
      }
    });
  });
});

describe("Change Enemy Test", () => {
  const msg = enemyMsg("Red Slime");
  const model = {
    enemy: {
      name: "Slime",
      strength: 5,
      agility: 3,
      hp: 3,
      sleepR: 0,
      stopR: 15,
      hurtR: 0,
      dodge: 1,
      pattern: [{ id: "ATTACK", weight: 100 }],
      run: 0
    }
  };

  test("Enemy changes correctly from update.js", () => {
    expect(update(msg, model)).toEqual({
      enemy: {
        name: "Red Slime",
        strength: 7,
        agility: 3,
        hp: 3,
        sleepR: 0,
        stopR: 15,
        hurtR: 0,
        dodge: 1,
        pattern: [{ id: "ATTACK", weight: 100 }],
        run: 0
      }
    });
  });
});

describe("Change Shield Test", () => {
  const msg = shieldMsg("Small Shield");
  const model = {
    player: {
      shield: { name: "Naked", mod: 0 }
    }
  };
  test("Shield changes correctly from update.js", () => {
    expect(update(msg, model)).toEqual({
      player: {
        shield: { name: "Small Shield", mod: 4 }
      }
    });
  });
});

describe("Change Armor Test", () => {
  const msg = armorMsg("Clothes");
  const model = {
    player: {
      armor: { name: "Naked", mod: 0 }
    }
  };
  test("Armor updates correctly from update.js", () => {
    expect(update(msg, model)).toEqual({
      player: {
        armor: { name: "Clothes", mod: 2 }
      }
    });
  });
});

describe("Change Weapon Test", () => {
  const msg = weaponMsg("Club");
  const model = {
    player: {
      weapon: { name: "Unarmed", mod: 0 }
    }
  };
  test("Weapon updates correctly from update.js", () => {
    expect(update(msg, model)).toEqual({
      player: {
        weapon: { name: "Club", mod: 4 }
      }
    });
  });
});

describe("Change Name Test", () => {
  const msg = nameMsg("Harr");
  const model = {
    player: {
      name: "Rollo",
      nameSum: 0,
      progression: 0,
      level: 1,
      strength: 4,
      agility: 4,
      hp: 15,
      maxhp: 15,
      mp: 0
    }
  };
  test("Name change from update.js", () => {
    expect(update(msg, model)).toEqual({
      player: {
        name: "Harr",
        nameSum: 43,
        progression: 3,
        level: 1,
        strength: 4,
        agility: 4,
        hp: 15,
        maxhp: 15,
        mp: 2
      }
    });
  });
});

describe("Battle Cleanup Test", () => {
  const msg = { type: "FIGHT_CLEANUP" };
  const model = {
    battleText: ["Obliterated a Slime"],
    enemy: {
      name: "Slime",
      strength: 5,
      agility: 3,
      hp: 0,
      sleepR: 0,
      stopR: 15,
      hurtR: 0,
      dodge: 1,
      pattern: [{ id: "ATTACK", weight: 100 }],
      run: 0
    },
    cleanBattleText: R.F,
    inBattle: R.F,
    initiative: R.T,
    enemySleep: 3,
    enemyStop: R.T,
    playerSleep: R.T,
    playerStop: R.T,
    sleepCount: 5,
    critHit: R.T,
    player: {
      name: "Rollo",
      nameSum: 23,
      progression: 3,
      level: 5,
      strength: 12,
      agility: 10,
      hp: 22,
      maxhp: 32,
      mp: 17
    }
  };
  test("Battle Cleans Up Correctly", () => {
    expect(update(msg, model)).toEqual({
      battleText: ["Obliterated a Slime"],
      enemy: {
        name: "Slime",
        strength: 5,
        agility: 3,
        hp: 3,
        sleepR: 0,
        stopR: 15,
        hurtR: 0,
        dodge: 1,
        pattern: [{ id: "ATTACK", weight: 100 }],
        run: 0
      },
      cleanBattleText: R.T,
      inBattle: R.F,
      initiative: R.F,
      enemySleep: 0,
      enemyStop: R.F,
      playerSleep: R.F,
      playerStop: R.F,
      sleepCount: 6,
      critHit: R.F,
      player: {
        name: "Rollo",
        nameSum: 23,
        progression: 3,
        level: 5,
        strength: 12,
        agility: 10,
        hp: 32,
        maxhp: 32,
        mp: 19
      }
    });
  });
});
