import * as R from "ramda";
// import { changeStats } from "../src/Stats";
// import update from "../src/Update"
import update, {
  healmoreMsg,
  startBattleMsg,
  herbMsg,
  levelMsg,
  enemyMsg
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
