# Contributing

Pull requests are welcome!

## Setup

Clone the repo and install the dependencies:

```bash
npm install
```

The source code is written in TypeScript. Spin up the compiler to watch for source changes:

```bash
npm run watch
```

Run the tests and the linter before submitting a pull request:

```bash
npm test
npm run lint
```

## Commit messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/). The commit messages are used to generate the changelog and to determine the next version number.

Examples:

```
feat: add support for notification icons
fix(android): generate adaptive icon layers at the correct size
chore: update dependencies
```

## Releases

Releases are automated with [release-please](https://github.com/googleapis/release-please). Every push to `main` updates a release pull request. Merging that pull request creates a GitHub release and publishes the package to npm.
