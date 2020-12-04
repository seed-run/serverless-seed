const { exists } = require("fs");
const { promisify } = require("util");
const { exec } = require("child_process");

const removeNodeModules = require("./remove-node-modules");

const execPromise = promisify(exec);
const existsPromise = promisify(exists);
const TIMEOUT = 30000;

async function npmInstall(cwd) {
  const hasPackageJson = await existsPromise(`${cwd}/package.json`);

  if (hasPackageJson) {
    await removeNodeModules(cwd);

    await execPromise("npm install", {
      cwd,
      TIMEOUT,
    });
  }
}

module.exports = npmInstall;
