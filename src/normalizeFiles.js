const _ = require("lodash");
const normalizeFiles = require("serverless/lib/plugins/aws/lib/normalizeFiles");

module.exports = {
  normalizeCloudFormationTemplate: function (template) {
    // Apply Serverless' normalization
    const normalizedTemplate = normalizeFiles.normalizeCloudFormationTemplate(
      template
    );

    // Create list of all Lambda version refs
    const lambdaVersions = {};

    Object.entries(normalizedTemplate.Resources).forEach(([key, value]) => {
      if (value.Type && value.Type === "AWS::Lambda::Version") {
        lambdaVersions[key] = true;
        delete normalizedTemplate.Resources[key];
      }

      // Handle Lambda@Edge versions
      if (
        value.Type &&
        value.Type === "AWS::Lambda::Permission" &&
        value.Properties &&
        value.Properties.Principal &&
        value.Properties.Principal === "edgelambda.amazonaws.com" &&
        value.Properties.FunctionName &&
        value.Properties.FunctionName.Ref
      ) {
        value.Properties.FunctionName.Ref = null;
      }

      if (
        key === "CloudFrontDistribution" &&
        value.Properties &&
        value.Properties.DistributionConfig &&
        value.Properties.DistributionConfig.DefaultCacheBehavior
      ) {
        (
          value.Properties.DistributionConfig.DefaultCacheBehavior
            .LambdaFunctionAssociations || []
        ).forEach(function (lambdaAssoc) {
          if (
            lambdaAssoc.LambdaFunctionARN &&
            lambdaAssoc.LambdaFunctionARN.Ref
          ) {
            lambdaAssoc.LambdaFunctionARN.Ref = null;
          }
        });
      }
    });

    Object.entries(normalizedTemplate.Outputs).forEach(([key, value]) => {
      if (value.Value && value.Value.Ref && lambdaVersions[value.Value.Ref]) {
        delete normalizedTemplate.Outputs[key];
        return;
      }
    });

    return normalizedTemplate;
  },
  normalizeServerlessConfig: function (config) {
    const normalizedConfig = _.cloneDeep(config);

    if (
      normalizedConfig.provider &&
      normalizedConfig.provider.compiledCloudFormationTemplate
    ) {
      normalizedConfig.provider.compiledCloudFormationTemplate = null;
    }
    if (
      normalizedConfig.provider &&
      normalizedConfig.provider.coreCloudFormationTemplate
    ) {
      normalizedConfig.provider.coreCloudFormationTemplate = null;
    }

    // Remove versions from functions
    Object.entries(normalizedConfig.functions).forEach((entries) => {
      const value = entries[1];
      if (value.versionLogicalId) {
        value.versionLogicalId = null;
      }
    });

    return normalizedConfig;
  },
};
