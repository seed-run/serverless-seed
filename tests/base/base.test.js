const { successRegex, getSeedState, clearSlsCache, runSlsCommand } = require("../helpers");

beforeEach(async () => {
  await clearSlsCache(__dirname);
});

afterAll(async () => {
  await clearSlsCache(__dirname);
});

test("base", async () => {
  const result = await runSlsCommand(__dirname);

  expect(result).toMatch(successRegex);

  const state = await getSeedState(__dirname);
  expect(state).toMatchObject({ status: "success" });
});
