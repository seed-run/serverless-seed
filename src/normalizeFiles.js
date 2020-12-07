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
