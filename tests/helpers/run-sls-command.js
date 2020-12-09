const { promisify } = require("util");
const { exec } = require("child_process");
const npmInstall = require("./npm-install");

const execPromise = promisify(exec);
const TIMEOUT = 30000;
const PKG_CMD = "package";

async function runSlsCommand(cwd, cmd = PKG_CMD) {
  await npmInstall(cwd);

  try {
    const { stdout } = await execPromise(`__LOCAL__=true serverless ${cmd}`, {
      cwd,
      TIMEOUT,
    });

    return stdout.toString("utf8");
  } catch (e) {
    console.log(e);
    return "";
  }
}

module.exports = runSlsCommand;
