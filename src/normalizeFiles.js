const _ = require("lodash");

module.exports = {
  // From https://github.com/serverless/serverless/blob/master/lib/plugins/aws/lib/normalizeFiles.js
  normalizeCloudFormationTemplate: function (template) {
    const normalizedTemplate = _.cloneDeep(template);
    // Create list of all Lambda version refs
    const lambdaVersions = {};

    Object.entries(normalizedTemplate.Resources).forEach(([key, value]) => {
      if (key.startsWith("ApiGatewayDeployment")) {
        delete Object.assign(normalizedTemplate.Resources, {
          ApiGatewayDeployment: normalizedTemplate.Resources[key],
        })[key];
        return;
      }
      if (
        key.startsWith("WebsocketsDeployment") &&
        key !== "WebsocketsDeploymentStage"
      ) {
        delete Object.assign(normalizedTemplate.Resources, {
          WebsocketsDeployment: normalizedTemplate.Resources[key],
        })[key];
        return;
      }
      if (key === "WebsocketsDeploymentStage") {
        const newVal = value;
        newVal.Properties.DeploymentId.Ref = "WebsocketsDeployment";
        return;
      }
      if (value.Type && value.Type === "AWS::Lambda::Function") {
        const newVal = value;
        newVal.Properties.Code.S3Key = "";
        return;
      }
      if (value.Type && value.Type === "AWS::Lambda::LayerVersion") {
        const newVal = value;
        newVal.Properties.Content.S3Key = "";
        return;
      }
      if (value.Type && value.Type === "AWS::Lambda::Version") {
        lambdaVersions[key] = true;
        delete normalizedTemplate.Resources[key];
        return;
      }
    });

    Object.entries(normalizedTemplate.Outputs).forEach(([key, value]) => {
      if (value.Value && value.Value.Ref && lambdaVersions[value.Value.Ref]) {
        delete normalizedTemplate.Outputs[key];
      }
    });

    return normalizedTemplate;
  },
};
