const fs = require("fs").promises;

const npmInstall = require("./npm-install");
const getSeedState = require("./get-seed-state");
const runSlsCommand = require("./run-sls-command");

const contents = [];

async function changeFiles(files, change = null) {
  files.forEach(async (file, i) => {
    if (change !== null) {
      contents[i] = await fs.readFile(file);
    }
    await fs.writeFile(
      file,
      change !== null ? contents[i] + change : contents[i]
    );
  });
}

async function runIncrementalSlsCmds(cwd, filesToChange) {
  filesToChange = Array.isArray(filesToChange)
    ? filesToChange
    : [filesToChange];

  await npmInstall(cwd);

  await changeFiles(filesToChange, " /**hi**/");
  await runSlsCommand(cwd, "package", false);

  const state1 = await getSeedState(cwd);

  await changeFiles(filesToChange);
  await runSlsCommand(cwd, "package", false);

  const state2 = await getSeedState(cwd);

  return [state1, state2];
}

module.exports = runIncrementalSlsCmds;
