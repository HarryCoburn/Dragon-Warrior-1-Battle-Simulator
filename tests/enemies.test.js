import * as R from "ramda";
import changeEnemy from "../src/Enemies";

const msg = {
  type: "CHANGE_ENEMY",
  enemy: "Slime"
};

describe("Enemies.js", () => {
  test("should return a slime", () => {
    expect(changeEnemy(msg)).toEqual({
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
    });
  });
});

describe("ramda test", () => {
  test("Checking fro Ramda", () => {
    const blah = R.T;

    expect(blah).toEqual(R.T);
    expect(blah).toBe(R.T);
  });
});
