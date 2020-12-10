const path = require("path");
const { clearSlsCache, runIncrementalSlsCmds } = require("../helpers");

beforeEach(async () => {
  await clearSlsCache(__dirname);
});

afterAll(async () => {
  await clearSlsCache(__dirname);
});

test("serverless-1771", async () => {
  const [state1, state2] = await runIncrementalSlsCmds(__dirname, [
    path.join(__dirname, "handler.js"),
    path.join(__dirname, "edge.js"),
    path.join(__dirname, "layer", "layer.txt"),
  ]);

  expect(state1.data.cloudFormationTemplateHash).not.toEqual(
    state2.data.cloudFormationTemplateHash
  );
  expect(state1.data.serverlessConfigHash).toEqual(
    state2.data.serverlessConfigHash
  );
});
