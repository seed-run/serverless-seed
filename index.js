"use strict";

const _ = require("lodash");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs").promises;
const serverlessConfigUtils = require("serverless/lib/utils/getServerlessConfigFile");

const config = require("./src/config");
const normalizeFiles = require("./src/normalizeFiles");

function hash(str) {
  return crypto.createHash("sha256").update(str).digest("base64");
}

function applyDefaultConfig(userConfig, defaultConfig) {
  userConfig = userConfig || { seed: {} };

  return _.merge(defaultConfig, userConfig.seed);
}

class ServerlessSeedPlugin {
  constructor(serverless, options) {
    this.options = options;
    this.serverless = serverless;

    this.isLocal = process.env.__LOCAL__ === "true";

    this.provider = this.serverless.getProvider("aws");

    this.hooks = {
      "after:package:finalize": this.afterPackageFinalize.bind(this),
    };
  }

  async afterPackageFinalize() {
    const stage = this.provider.getStage();

    const pluginConfig = applyDefaultConfig(
      this.serverless.service.custom,
      config
    );
    const incrementalConfig = pluginConfig.incremental;

    if (
      incrementalConfig.enabled !== true ||
      incrementalConfig.disabledFor.indexOf(stage) !== -1
    ) {
      return;
    }

    this.serverless.cli.log("Seed: Generating incremental deploy state...");

    // Write to the state file to start with, so it can be used if there are any
    // unhandled exceptions
    await this.createStateFile();

    let state,
      s3Key,
      region,
      layers,
      s3Bucket,
      functions,
      serverlessConfigString,
      cloudFormationTemplateString;

    try {
      region = this.provider.getRegion();

      cloudFormationTemplateString = this.getCloudFormationString();

      serverlessConfigString = await this.getServerlessConfigString();

      s3Key = this.serverless.service.package.artifactDirectoryName;

      try {
        // This does a CloudFormation describeStackResource, hence the await
        s3Bucket = await this.provider.getServerlessDeploymentBucketName();
      } catch (e) {
        // Absorb the error so we can test locally
        if (this.isLocal) {
          s3Bucket = null;
        } else {
          throw e;
        }
      }

      layers = this.createLayersList();

      functions = this.createFunctionsList();

      state = {
        status: "success",
        data: {
          s3Key,
          region,
          layers,
          s3Bucket,
          functions,
          serverlessConfigString,
          cloudFormationTemplateString,
          serverlessConfigHash: hash(serverlessConfigString),
          cloudFormationTemplateHash: hash(cloudFormationTemplateString),
        },
      };
    } catch (e) {
      this.serverless.cli.log(
        "Seed: There was a problem generating the incremental deploy state"
      );
      this.serverless.cli.log(`    ${e.message}`);

      state = {
        status: "fail",
        error: {
          name: e.name,
          stack: e.stack,
          message: e.message,
        },
      };
    }

    await this.printToStateFile(state);
  }

  getCloudFormationString() {
    const cloudFormationTemplate = normalizeFiles.normalizeCloudFormationTemplate(
      this.serverless.service.provider.compiledCloudFormationTemplate
    );
    return JSON.stringify(cloudFormationTemplate);
  }

  async getServerlessConfigString() {
    const slsConfig = await serverlessConfigUtils.getServerlessConfigFile(
      this.serverless
    );
    return JSON.stringify(normalizeFiles.normalizeServerlessConfig(slsConfig));
  }

  async createStateFile() {
    await this.printToStateFile({ status: "processing" });
  }

  async printToStateFile(state) {
    const packagePath = this.realArtifactPath();

    try {
      await fs.writeFile(
        path.join(packagePath, "seed-state.json"),
        JSON.stringify(state, null, 2)
      );
    } catch (e) {
      this.serverless.cli.log(
        "Seed: There was a problem creating the incremental deploy state file"
      );
    }
  }

  realArtifactPath() {
    return (
      this.options.package ||
      this.serverless.service.package.path ||
      path.join(this.serverless.config.servicePath || ".", ".serverless")
    );
  }

  getRealArtifactPath(artifactPath) {
    // Case 1: "package.artifact" IS defined
    //    artifactPath = "user/defined/path/to/lambda.zip"
    // Case 2: "package.artifact" NOT defined + NO sls package --package
    //    artifactPath = "/path/to/.serverless/lambda.zip"
    // Case 3: "package.artifact" NOT defined + HAS sls package --package
    //    artifactPath = "/path/to/.serverless/lambda.zip" (wrong! need to correct)
    // Case 4: serverless-bundle is used
    //          + "package.artifact" NOT defined
    //          + HAS sls package --package
    //    artifactPath = ".serverless/lambda.zip"

    // Note that we current don't have a test for Case 4, b/c with "serverless-bundle"
    // enabled, running `sls package` directly inside terminal works, but running
    // it through "runIncrementalSlsCmds()" inside jest test fails.

    // Handle case 1
    artifactPath = artifactPath || this.serverless.service.package.artifact;
    if (
      !path.isAbsolute(artifactPath) &&
      !artifactPath.startsWith(".serverless")
    ) {
      return artifactPath;
    }

    // Handle case 2, 3, 4
    const pathParts = artifactPath.split("/");
    const filename = pathParts[pathParts.length - 1];
    return path.join(this.realArtifactPath(), filename);
  }

  createLayersList() {
    const layers = this.serverless.service.layers;
    return Object.keys(layers).map((name) => ({
      name,
      artifact: this.getRealArtifactPath(layers[name].package.artifact),
    }));
  }

  createFunctionsList() {
    const functions = this.serverless.service.functions;
    return Object.keys(functions).map((name) => ({
      name: functions[name].name,
      artifact: this.getRealArtifactPath(functions[name].package.artifact),
    }));
  }
}

module.exports = ServerlessSeedPlugin;
