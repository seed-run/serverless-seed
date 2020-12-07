const {
  successRegex,
  getSeedState,
  clearSlsCache,
  runSlsCommand,
} = require("../helpers");

beforeEach(async () => {
  await clearSlsCache(__dirname);
});

afterAll(async () => {
  await clearSlsCache(__dirname);
});

/**
 * Testing 1.77.1 because 1.78.0 made a change to the Serverless config parsing
 * to add validation to the config.
 * https://github.com/serverless/serverless/releases/tag/v1.78.0
 */
test("serverless-1771", async () => {
  const result = await runSlsCommand(__dirname);

  expect(result).toMatch(successRegex);

  const state = await getSeedState(__dirname);
  expect(state).toMatchObject({ status: "success" });
});
