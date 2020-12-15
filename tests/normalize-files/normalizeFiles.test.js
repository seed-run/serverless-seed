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
      Layer1LambdaLayerHash: {
        Description: "Current Lambda layer hash",
        Value: "33164e2a83a901b9e62b547ce001aa09c09deede",
      },
      Layer1LambdaLayerS3Key: {
        Description: "Current Lambda layer S3Key",
        Value:
          "serverless/serverless-seed-test/dev/1607575759130-2020-12-10T04:49:19.130Z/layer.zip",
      },
    },
  };
  const normalizedTemplate = normalizeFiles.normalizeCloudFormationTemplate(
    template
  );

  expect(normalizedTemplate.Resources.GetLambdaVersion1).toBeUndefined();

  //  Disabling Lambda@Edge test cases
  //  expect(
  //    normalizedTemplate.Resources.CfLambda1LambdaFunctionInvokePermission
  //      .Properties.FunctionName.Ref
  //  ).toBeNull();
  //  normalizedTemplate.Resources.CloudFrontDistribution.Properties.DistributionConfig.DefaultCacheBehavior.LambdaFunctionAssociations.forEach(
  //    (lambda) => {
  //      expect(lambda.LambdaFunctionARN.Ref).toBeNull();
  //    }
  //  );

  expect(
    normalizedTemplate.Outputs.GetLambdaFunctionQualifiedArn
  ).toBeUndefined();
  expect(normalizedTemplate.Outputs.Layer1LambdaLayerHash.Value).toBeNull();
  expect(normalizedTemplate.Outputs.Layer1LambdaLayerS3Key.Value).toBeNull();
});

test("normalize-files-sls", async () => {
  const config = {
    service: {
      name: "sample-service",
    },
    package: {
      individually: true,
      artifactDirectoryName:
        "serverless/serverless-seed-test/dev/1608056831725-2020-12-15T18:27:11.725Z",
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
  expect(normalizedConfig.package.artifactDirectoryName).toBeNull();
  expect(normalizedConfig.functions.cfLambda1.versionLogicalId).toBeNull();
});
