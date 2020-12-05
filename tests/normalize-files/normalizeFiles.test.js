const normalizeFiles = require("../../src/normalizeFiles");

test("normalize-files", async () => {
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
    normalizedTemplate.Outputs.GetLambdaFunctionQualifiedArn
  ).toBeUndefined();
});
