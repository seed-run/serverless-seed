const {
  getSeedState,
  successRegex,
  clearSlsCache,
  runSlsCommand,
} = require("../helpers");

beforeEach(async () => {
  await clearSlsCache(__dirname, "new");
});

afterAll(async () => {
  await clearSlsCache(__dirname, "new");
});

test("custom-package-path", async () => {
  const result = await runSlsCommand(__dirname, "package --package=new");

  expect(result).toMatch(successRegex);

  const state = await getSeedState(__dirname, "new");
  expect(state).toMatchObject({ status: "success" });
});
