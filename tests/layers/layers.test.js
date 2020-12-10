const path = require("path");
const fs = require("fs").promises;
const { getSeedState, clearSlsCache, runSlsCommand } = require("../helpers");

beforeEach(async () => {
  await clearSlsCache(__dirname);
});

afterAll(async () => {
  await clearSlsCache(__dirname);
});

test("layers", async () => {
  const layerFile = path.join(__dirname, "layer", "layer.txt");

  const content = await fs.readFile(layerFile);

  await fs.writeFile(layerFile, content + " hi");
  await runSlsCommand(__dirname);

  const state1 = await getSeedState(__dirname);

  await fs.writeFile(layerFile, content);
  await runSlsCommand(__dirname);

  const state2 = await getSeedState(__dirname);

  expect(state1.data.cloudFormationTemplateHash).toEqual(
    state2.data.cloudFormationTemplateHash
  );
  expect(state1.data.serverlessConfigHash).toEqual(
    state2.data.serverlessConfigHash
  );
});
