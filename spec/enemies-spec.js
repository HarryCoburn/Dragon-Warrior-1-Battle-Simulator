import changeEnemy from "../src/Enemies";

describe("Enemy Object Test", () => {
  const msg = {
    type: "CHANGE_ENEMY",
    enemy: "Slime"
  };

  it("should return slime object", () => {
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
