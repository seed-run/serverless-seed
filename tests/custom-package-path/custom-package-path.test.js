const {
  getSeedState,
  successRegex,
  clearSlsCache,
  runSlsCommand,
} = require("../helpers");

beforeEach(async () => {
  await clearSlsCache(__dirname, ".package");
});

afterAll(async () => {
  await clearSlsCache(__dirname, ".package");
});

test("custom-package-path", async () => {
  const result = await runSlsCommand(__dirname, "package --package=.package");

  expect(result).toMatch(successRegex);

  const state = await getSeedState(__dirname, ".package");
  expect(state).toMatchObject({ status: "success" });
});
