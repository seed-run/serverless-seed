const { promisify } = require("util");
const { exec } = require("child_process");

const execPromise = promisify(exec);
const TIMEOUT = 30000;

async function clearNpmCache(cwd, dir = ".serverless") {
  await execPromise(`rm -rf ${dir}/`, {
    cwd,
    TIMEOUT,
  });
}

module.exports = clearNpmCache;
