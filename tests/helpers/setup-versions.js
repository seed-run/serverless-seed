const path = require("path");
const fs = require("fs-extra");

const versions = ["1.55.0", "1.77.1"];

const testsDir = path.join(process.cwd(), "tests");
const templateTestPath = path.join(testsDir, "serverless-versions");

// Remove node_modules from tempalte test
fs.removeSync(path.join(templateTestPath, "node_modules"));

// Create new versions
versions.forEach(copyVersion);

function copyVersion(version) {
  console.log(`Generating tests for ${version}...`);

  const newPath = path.join(
    testsDir,
    processString("serverless-versions-%version-string%", version)
  );

  fs.copySync(templateTestPath, newPath);

  // Remove old lockfile
  fs.removeSync(path.join(newPath, "package-lock.json"));

  // Setup files
  processFile(path.join(newPath, "package.json"), version);
  processFile(path.join(newPath, "serverless.yml"), version);
  processFile(
    path.join(newPath, "serverless-versions.test.template"),
    version,
    path.join(
      newPath,
      processString("serverless-%version-string%.test.js", version)
    )
  );
}

function processString(str, version) {
  const versionString = version.replace(/\./g, "");

  return str
    .replace(/%version%/g, version)
    .replace(/%version-string%/g, versionString);
}

function processFile(templatePath, version, toFile) {
  toFile = toFile || templatePath;

  const template = fs.readFileSync(templatePath, { encoding: "utf-8" });
  fs.writeFileSync(toFile, processString(template, version));

  // If moving the file, remove the template
  if (toFile !== templatePath) {
    fs.removeSync(templatePath);
  }
}
