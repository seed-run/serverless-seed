const normalizeFiles = require("../../src/normalizeFiles");

test("normalize-files-cf", async () => {
  const template = {
    Resources: {
      GetLambdaVersion1: {
        Type: "AWS::Lambda::Version",
        DeletionPolicy: "Retain",
        Properties: {
          FunctionName: {
            Ref: "GetLambdaFunction",
          },
          CodeSha256: "3DEObMEp7eCuwOdyFDgOS7yqQJ1p33uPjn280kqc7Hg=",
        },
      },
      CfLambda1LambdaFunctionInvokePermission: {
        Type: "AWS::Lambda::Permission",
        Properties: {
          Action: "lambda:InvokeFunction",
          Principal: "edgelambda.amazonaws.com",
          FunctionName: {
            Ref:
              "CfLambda1LambdaVersiongUHtkolzILhRJq3kn5H9mRT6Y5jTI4DBcz7YRmlc0",
          },
        },
      },
      CloudFrontDistribution: {
        Properties: {
          DistributionConfig: {
            DefaultCacheBehavior: {
              LambdaFunctionAssociations: [
                {
                  LambdaFunctionARN: {
                    Ref:
                      "CfLambda1LambdaVersiongUHtkolzILhRJq3kn5H9mRT6Y5jTI4DBcz7YRmlc0",
                  },
                },
              ],
            },
          },
        },
      },
    },
    Outputs: {
      GetLambdaFunctionQualifiedArn: {
        Description: "Current Lambda function version",
        Value: {
          Ref: "GetLambdaVersion1",
        },
      },
    },
  };
  const normalizedTemplate = normalizeFiles.normalizeCloudFormationTemplate(
    template
  );

  expect(normalizedTemplate.Resources.GetLambdaVersion1).toBeUndefined();
  expect(
    normalizedTemplate.Resources.CfLambda1LambdaFunctionInvokePermission
      .Properties.FunctionName.Ref
  ).toBeNull();
  normalizedTemplate.Resources.CloudFrontDistribution.Properties.DistributionConfig.DefaultCacheBehavior.LambdaFunctionAssociations.forEach(
    (lambda) => {
      expect(lambda.LambdaFunctionARN.Ref).toBeNull();
    }
  );

  expect(
    normalizedTemplate.Outputs.GetLambdaFunctionQualifiedArn
  ).toBeUndefined();
});

test("normalize-files-sls", async () => {
  const config = {
    service: {
      name: "sample-service",
    },
    provider: {
      name: "aws",
      compiledCloudFormationTemplate: {
        AWSTemplateFormatVersion: "2010-09-09",
      },
      coreCloudFormationTemplate: {
        AWSTemplateFormatVersion: "2010-09-09",
      },
    },
    functions: {
      cfLambda1: {
        handler: "handler.main",
        versionLogicalId:
          "CfLambda1LambdaVersionhy5E0G9fN2CvYUCt23oQzDwN5hPbzIugWoXSzbLo",
      },
    },
  };
  const normalizedConfig = normalizeFiles.normalizeServerlessConfig(config);

  expect(normalizedConfig.provider.compiledCloudFormationTemplate).toBeNull();
  expect(normalizedConfig.provider.coreCloudFormationTemplate).toBeNull();
  expect(normalizedConfig.functions.cfLambda1.versionLogicalId).toBeNull();
});
