const {
  errorRegex,
  successRegex,
  clearSlsCache,
  runSlsCommand,
} = require("../helpers");

beforeEach(async () => {
  await clearSlsCache(__dirname);
});

afterAll(async () => {
  await clearSlsCache(__dirname);
});

test("empty-config", async () => {
  const result = await runSlsCommand(__dirname);

  expect(result).not.toMatch(errorRegex);
  expect(result).not.toMatch(successRegex);
});
