const path = require("path");
const { clearSlsCache, runIncrementalSlsCmds } = require("../helpers");

beforeEach(async () => {
  await clearSlsCache(__dirname);
});

afterAll(async () => {
  await clearSlsCache(__dirname);
});

test("serverless-%version-string%", async () => {
  const [state1, state2] = await runIncrementalSlsCmds(__dirname, [
    "handler.js",
    "edge.js",
    path.join("layer", "layer.txt"),
  ]);

  expect(state1.data.layers[0]).toEqual({
    name: "layer",
    artifact: path.resolve(path.join(__dirname, ".serverless/layer.zip")),
  });
  expect(state1.data.functions[0]).toEqual({
    name: "serverless-seed-test-dev-hello",
    artifact: path.resolve(
      path.join(__dirname, ".serverless/serverless-seed-test.zip")
    ),
  });
  expect(state1.data.functions[1]).toEqual({
    name: "serverless-seed-test-dev-prebuilt",
    artifact: "functions/prebuilt.zip",
  });
  expect(state1.data.functions[2]).toEqual({
    name: "serverless-seed-test-dev-cfLambda",
    artifact: path.resolve(
      path.join(__dirname, ".serverless/serverless-seed-test.zip")
    ),
  });
  expect(state1.data.cloudFormationTemplateHash).not.toEqual(
    state2.data.cloudFormationTemplateHash
  );
  expect(state1.data.serverlessConfigHash).toEqual(
    state2.data.serverlessConfigHash
  );
});

test("serverless-custom-package-path-%version-string%", async () => {
  const [state1, state2] = await runIncrementalSlsCmds(
    __dirname,
    ["handler.js", "edge.js", path.join("layer", "layer.txt")],
    "sls-output"
  );

  expect(state1.data.layers[0]).toEqual({
    name: "layer",
    artifact: "sls-output/layer.zip",
  });
  expect(state1.data.functions[0]).toEqual({
    name: "serverless-seed-test-dev-hello",
    artifact: "sls-output/serverless-seed-test.zip",
  });
  expect(state1.data.functions[1]).toEqual({
    name: "serverless-seed-test-dev-prebuilt",
    artifact: "functions/prebuilt.zip",
  });
  expect(state1.data.functions[2]).toEqual({
    name: "serverless-seed-test-dev-cfLambda",
    artifact: "sls-output/serverless-seed-test.zip",
  });
  expect(state1.data.cloudFormationTemplateHash).not.toEqual(
    state2.data.cloudFormationTemplateHash
  );
  expect(state1.data.serverlessConfigHash).toEqual(
    state2.data.serverlessConfigHash
  );
});
