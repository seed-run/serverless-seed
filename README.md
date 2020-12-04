# Serverless Seed Plugin [![npm](https://img.shields.io/npm/v/serverless-seed.svg)](https://www.npmjs.com/package/serverless-seed) [![Build Status](https://github.com/seed-run/serverless-seed/workflows/CI/badge.svg)](https://github.com/seed-run/serverless-seed/actions)

A Serverless plugin for optimizing deploys in [Seed](https://seed.run). This plugin allows Seed to enable **Incremental Deploys** for your Serverless apps.

## Getting Started

Install the `serverless-seed` plugin using:

```bash
$ npm install --save-dev serverless-seed
```

Then add it to your `serverless.yml`.

```yaml
plugins:
  - serverless-seed
```

And enable **Incremental Deploys**.

```yaml
custom:
  seed:
    incremental:
      enabled: true
```

That's it! Now deploy to [Seed](https://seed.run) and enjoy Incremental Deploys!

To disable Incremental Deploys for certain stages.

```yaml
custom:
  seed:
    incremental:
      enabled: true
      disabledFor:
        - prod
        - staging
```

## Community

[Follow us on Twitter](https://twitter.com/SEED_run) or [sign up for our newsletter](https://emailoctopus.com/lists/14c85084-324e-11ea-be00-06b4694bee2a/forms/subscribe).
