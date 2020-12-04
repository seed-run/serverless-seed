"use strict";

const path = require("path");
const crypto = require("crypto");
const fs = require("fs").promises;
const normalizeFiles = require("serverless/lib/plugins/aws/lib/normalizeFiles");

const config = require("./config");

function hash(str) {
  return crypto.createHash("sha256").update(str).digest("base64");
}

function applyDefaultConfig(userConfig, defaultConfig) {
  if (userConfig.incremental) {
    userConfig.incremental = Object.assign(
      {},
      defaultConfig.incremental,
      userConfig.incremental
    );
  }

  return Object.assign(defaultConfig, userConfig);
}

function createFunctionsList(functionsObject) {
  return Object.keys(functionsObject).map((name) => ({
    name,
    handler: functionsObject[name].handler,
    artifact: functionsObject[name].package.artifact,
  }));
}

class ServerlessSeedPlugin {
  constructor(serverless, options) {
    this.options = options;
    this.serverless = serverless;

    this.isLocal = process.env.__LOCAL__ === "true";

    this.stage = this.serverless.service.provider.stage;

    this.pluginConfig = applyDefaultConfig(
      this.serverless.service.custom.seed,
      config
    );

    this.provider = this.serverless.getProvider("aws");
    this.region = this.provider.getRegion();

    // Get it early before the artifact info or s3 paths are added
    this.serverlessConfigHash = hash(
      JSON.stringify(this.serverless.service.initialServerlessConfig)
    );

    this.hooks = {
      "after:package:finalize": this.onPackage.bind(this),
    };
  }

  async onPackage() {
    const incrementalConfig = this.pluginConfig.incremental;

    if (
      incrementalConfig.enabled !== true ||
      incrementalConfig.disabledFor.indexOf(this.stage) !== -1
    ) {
      return;
    }

    this.serverless.cli.log("Seed: Generating incremental deploy state...");

    const region = this.region;
    const serverlessConfigHash = this.serverlessConfigHash;

    let state, s3Bucket, s3Key, cloudFormationTemplateHash, functions;

    try {
      const cloudFormationTemplate = normalizeFiles.normalizeCloudFormationTemplate(
        this.serverless.service.provider.compiledCloudFormationTemplate
      );
      cloudFormationTemplateHash = hash(JSON.stringify(cloudFormationTemplate));

      s3Key = this.serverless.service.package.artifactDirectoryName;

      try {
        // Needs to get this by doing a CloudFormation describeStackResource
        // hence the await
        s3Bucket = await this.provider.getServerlessDeploymentBucketName();
      } catch (e) {
        // Absorb the error so we can test locally
        if (this.isLocal) {
          s3Bucket = null;
        } else {
          throw e;
        }
      }

      functions = createFunctionsList(this.serverless.service.functions);

      state = {
        status: "success",
        data: {
          s3Key,
          region,
          s3Bucket,
          functions,
          serverlessConfigHash,
          cloudFormationTemplateHash,
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

  async printToStateFile(state) {
    try {
      await fs.writeFile(
        path.join(".serverless", "seed-state.json"),
        JSON.stringify(state, null, 2)
      );
    } catch (e) {
      this.serverless.cli.log(
        "Seed: There was a problem creating the incremental deploy state file"
      );
    }
  }
}

module.exports = ServerlessSeedPlugin;
