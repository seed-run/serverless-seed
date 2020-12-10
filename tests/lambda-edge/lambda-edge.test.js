const path = require("path");
const fs = require("fs").promises;
const { getSeedState, clearSlsCache, runSlsCommand } = require("../helpers");

beforeEach(async () => {
  await clearSlsCache(__dirname);
});

afterAll(async () => {
  await clearSlsCache(__dirname);
});

test("lambda-edge", async () => {
  const file = path.join(__dirname, "handler.js");

  const content = await fs.readFile(file);

  await fs.writeFile(file, content + " /**hi**/");
  await runSlsCommand(__dirname);

  const state1 = await getSeedState(__dirname);

  await fs.writeFile(file, content);
  await runSlsCommand(__dirname);

  const state2 = await getSeedState(__dirname);

  expect(state1.data.cloudFormationTemplateHash).not.toEqual(
    state2.data.cloudFormationTemplateHash
  );
  expect(state1.data.serverlessConfigHash).toEqual(
    state2.data.serverlessConfigHash
  );
});
