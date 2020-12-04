const npmInstall = require("./npm-install");
const getSeedState = require("./get-seed-state");
const clearSlsCache = require("./clear-sls-cache");
const runSlsCommand = require("./run-sls-command");
const removeNodeModules = require("./remove-node-modules");

const errorRegex = /(Error|Exception) ---/;
const successRegex = /Seed: Generating incremental deploy state.../;

module.exports = {
  errorRegex,
  npmInstall,
  getSeedState,
  successRegex,
  clearSlsCache,
  runSlsCommand,
  removeNodeModules,
};
