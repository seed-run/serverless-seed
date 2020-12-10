const { clearSlsCache, runIncrementalSlsCmds } = require("../helpers");

beforeEach(async () => {
  await clearSlsCache(__dirname);
});

afterAll(async () => {
  await clearSlsCache(__dirname);
});

test("base", async () => {
  const [state1, state2] = await runIncrementalSlsCmds(__dirname, "handler.js");

  expect(state1.data.cloudFormationTemplateHash).toEqual(
    state2.data.cloudFormationTemplateHash
  );
  expect(state1.data.serverlessConfigHash).toEqual(
    state2.data.serverlessConfigHash
  );
});
