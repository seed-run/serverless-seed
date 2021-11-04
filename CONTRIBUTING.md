# Contributing to serverless-seed

## Releases

To cut a release, start by merging the PRs that are going into this release.

1. Update version

   ```bash
   $ npm version patch
   ```
   
2. Publish a release to npm

   ```bash
   $ npm publish
   ```

3. Push git tag

   ```bash
   $ git push origin v0.3.14
   ```
   
4. Publish GitHub release

   In the **Tag version** of the release draft, select the version that was just published to npm.
