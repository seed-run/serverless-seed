"use strict";

module.exports = {
  service: "serverless-seed-test",
  plugins: ["../../index"],
  custom: {
    seed: {
      incremental: {
        enabled: true,
      },
    },
  },
  provider: {
    name: "aws",
    runtime: "nodejs10.x",
    stage: "dev",
    region: "us-east-1",
  },
  functions: {
    hello: {
      handler: "handler.hello",
      events: [
        {
          http: {
            path: "hello",
            method: "get",
          },
        },
      ],
    },
  },
};
