const path = require("path");
const fs = require("fs").promises;

async function getSeedState(cwd, packagePath = ".serverless") {
  let contents = null;

  try {
    contents = JSON.parse(
      await fs.readFile(path.join(cwd, packagePath, "seed-state.json"), "utf8")
    );
  } catch (e) {
    console.log(e);
  }

  return contents;
}

module.exports = getSeedState;
