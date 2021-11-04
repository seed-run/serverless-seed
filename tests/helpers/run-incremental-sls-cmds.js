const path = require("path");
const fs = require("fs").promises;

const npmInstall = require("./npm-install");
const getSeedState = require("./get-seed-state");
const runSlsCommand = require("./run-sls-command");

const contents = [];

async function changeFiles(files, cwd, change = null) {
  files.forEach(async (file, i) => {
    file = path.join(cwd, file);

    if (change !== null) {
      contents[i] = await fs.readFile(file);
    }
    await fs.writeFile(
      file,
      change !== null ? contents[i] + change : contents[i]
    );
  });
}

async function runIncrementalSlsCmds(cwd, filesToChange, packagePath) {
  const cmd = packagePath ? `package --package ${packagePath}` : "package";
  filesToChange = Array.isArray(filesToChange)
    ? filesToChange
    : [filesToChange];

  await npmInstall(cwd);

  await changeFiles(filesToChange, cwd, " /**hi**/");
  await runSlsCommand(cwd, cmd, false);

  const state1 = await getSeedState(cwd, packagePath);

  await changeFiles(filesToChange, cwd);
  await runSlsCommand(cwd, cmd, false);

  const state2 = await getSeedState(cwd, packagePath);

  return [state1, state2];
}

module.exports = runIncrementalSlsCmds;
