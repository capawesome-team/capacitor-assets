# @capawesome/capacitor-assets

## [4.1.0](https://github.com/capawesome-team/capacitor-assets/compare/v4.0.0...v4.1.0) (2026-10-16)


### Features

* **android:** generate notification icons ([#5](https://github.com/capawesome-team/capacitor-assets/issues/5)) ([f4624a4](https://github.com/capawesome-team/capacitor-assets/commit/f4624a438c25efb81a054f14ac8a05e6cc6150a5))
* **android:** support themed (monochrome) app icons ([#7](https://github.com/capawesome-team/capacitor-assets/issues/7)) ([ad17452](https://github.com/capawesome-team/capacitor-assets/commit/ad1745236d3c43b61955f7df7c1f74b85397bcdd))
* **ios:** support dark and tinted app icons ([#6](https://github.com/capawesome-team/capacitor-assets/issues/6)) ([52a9625](https://github.com/capawesome-team/capacitor-assets/commit/52a962553dd25b4969bceb91209336de5eb6c157))


### Bug Fixes

* **android:** generate adaptive icon layers at adaptive icon sizes ([#4](https://github.com/capawesome-team/capacitor-assets/issues/4)) ([884ccca](https://github.com/capawesome-team/capacitor-assets/commit/884cccab0f1d9aa4abdb48de72588e83baaa30f1))
* **pwa:** stop fetching iOS splash sizes from Apple and refresh the built-in list ([#8](https://github.com/capawesome-team/capacitor-assets/issues/8)) ([d5ca82f](https://github.com/capawesome-team/capacitor-assets/commit/d5ca82f3f3daeca9b59bb59ff819976501dfbc14))
* show the real option list for --help ([#3](https://github.com/capawesome-team/capacitor-assets/issues/3)) ([aec12a1](https://github.com/capawesome-team/capacitor-assets/commit/aec12a1a675e8719ba97c5f4db3b07ae640aed92))

## [4.0.0](https://github.com/capawesome-team/capacitor-assets/compare/v3.0.5...v4.0.0) (2026-10-16)


### ⚠ BREAKING CHANGES

* rebrand to @capawesome/capacitor-assets and modernize tooling ([#1](https://github.com/capawesome-team/capacitor-assets/issues/1))

### Features

* allow functions accessed by cli tool to be used in library ([#619](https://github.com/capawesome-team/capacitor-assets/issues/619)) ([5555191](https://github.com/capawesome-team/capacitor-assets/commit/5555191dcb08e8ef0b84458e5c0e9507f5ad47ab))
* rebrand to @capawesome/capacitor-assets and modernize tooling ([#1](https://github.com/capawesome-team/capacitor-assets/issues/1)) ([7a0f5bf](https://github.com/capawesome-team/capacitor-assets/commit/7a0f5bf17ae923c344a95b9b19855fdf484688d9))


### Bug Fixes

* **generate.ts:** wrong error message ([#601](https://github.com/capawesome-team/capacitor-assets/issues/601)) ([b60ec8d](https://github.com/capawesome-team/capacitor-assets/commit/b60ec8dc09a4682c2b65e3d26838436e047fc30a))

## 3.0.4

### Patch Changes

- 5f42c57: fix sharp vulnerability by bumping patch version

## 3.0.3

### Patch Changes

- 3c5ecbe: Fix the path discovered for Angular and Vue project when --pwa option used

## 3.0.1

### Patch Changes

- 2c19107: fix: properly configure the single 1024x1024 iOS icon

## 3.0.0

### Major Changes

- 99a87f4: Only generate 1024x1024 for iOS icons for xcode 14 compatibility

### Patch Changes

- c5138af: Fix critical dependency issues and update Cap Cli dependency

## 2.0.4

### Patch Changes

- Fix Android drawable issue

## 2.0.3

### Patch Changes

- General all iOS sub-icons from main icon

## 2.0.2

### Patch Changes

- Android non-density asset generation

## 2.0.1

### Patch Changes

- Android launcher padding #424

## 2.0.0

### Major Changes

- Fixed icon generation issue on iOS and normalized argument format"

## 1.0.14

### Patch Changes

- Fixed android legacy icon sizes

## 1.0.13

### Patch Changes

- Added logoSplashScale and logoTargetWidth to Android

## 1.0.12

### Patch Changes

- Fixed PWA icon source path

## 1.0.11

### Patch Changes

- Added flags to support custom iOS and Android folders

## 1.0.10

### Patch Changes

- Support loading icon.png for easy mode

## 1.0.9

### Patch Changes

- Fixed iOS and Android logo generation

## 1.0.8

### Patch Changes

- Add --logoSplashTargetWidth and --logoSplashScale

## 1.0.7

### Patch Changes

- Fixed icon backgrounds for iOS

## 1.0.6

### Patch Changes

- Fixed Contents.json for iOS icons

## 1.0.5

### Patch Changes

- Fixed iOS Assets

## 1.0.4

### Patch Changes

- Fixed iOS asset generation #325

## 1.0.3

### Patch Changes

- Fixed iOS image sizes

## 1.0.2

### Patch Changes

- Updated Trapeze library and better project root handling

## 1.0.1

### Patch Changes

- Moved to Trapeze
