# @capawesome/capacitor-assets

## [5.0.0](https://github.com/capawesome-team/capacitor-assets/compare/v4.1.1...v5.0.0) (2026-10-22)


### ⚠ BREAKING CHANGES

* Easy Mode splash screens change size. On iOS the logo is now 20% of the splash instead of 20% of its own width. On Android every splash is cut from the same 2732x2732px image as on iOS, so the logo is no longer 20% of each splash's own width, and --logoSplashTargetWidth is the width on that image, not on every density. Transparent logos now get legacy launcher icons on --iconBackgroundColor.
* **pwa:** PWA icons are now named `icon-<size>.png` instead of `icon-<size>.webp`. The old files are deleted on the next run; update any references to them, e.g. `apple-touch-icon` links in `index.html`.

### Features

* **android:** add an option to name the notification icon ([#16](https://github.com/capawesome-team/capacitor-assets/issues/16)) ([61d66a9](https://github.com/capawesome-team/capacitor-assets/commit/61d66a913591bdc90d78a3e7d7483caa3f5f5549))
* **android:** generate the Android 12+ splash icon and background colour ([#18](https://github.com/capawesome-team/capacitor-assets/issues/18)) ([fb2e4ec](https://github.com/capawesome-team/capacitor-assets/commit/fb2e4ec6204abf443e84e02743e7d9c5d1098f05))
* draw Easy Mode splashes like iOS and scale the logo to the splash ([#19](https://github.com/capawesome-team/capacitor-assets/issues/19)) ([9c0044d](https://github.com/capawesome-team/capacitor-assets/commit/9c0044d3f2e962d47c4777a013c59582e256350f))
* **pwa:** support a custom maskable icon ([#24](https://github.com/capawesome-team/capacitor-assets/issues/24)) ([343feb1](https://github.com/capawesome-team/capacitor-assets/commit/343feb1de71a01561bbc63968a45c1c9a4641407))


### Bug Fixes

* **android:** read android/ icon layers as adaptive icon layers ([#17](https://github.com/capawesome-team/capacitor-assets/issues/17)) ([dc9ba9c](https://github.com/capawesome-team/capacitor-assets/commit/dc9ba9cee949ec7e55512d749622a9e6c2ab16d0))
* **pwa:** generate opaque png icons with separate maskable variants ([#13](https://github.com/capawesome-team/capacitor-assets/issues/13)) ([961338d](https://github.com/capawesome-team/capacitor-assets/commit/961338d1fc5a9782033cc80debabbfef6b25745a))
* **pwa:** use the splash background colors for the splash screens generated from the logo ([#23](https://github.com/capawesome-team/capacitor-assets/issues/23)) ([f2049f2](https://github.com/capawesome-team/capacitor-assets/commit/f2049f280eeb4d233fc0314c69d74d0a39b3bf09))
* **pwa:** write the images into the web directory when it has no assets folder ([#22](https://github.com/capawesome-team/capacitor-assets/issues/22)) ([497a32e](https://github.com/capawesome-team/capacitor-assets/commit/497a32e91d077278d430d1301b30b775e9c13261))

## [4.1.1](https://github.com/capawesome-team/capacitor-assets/compare/v4.1.0...v4.1.1) (2026-10-17)


### Bug Fixes

* **ios:** remove the template splash images the generated ones replace ([#11](https://github.com/capawesome-team/capacitor-assets/issues/11)) ([7c41f3c](https://github.com/capawesome-team/capacitor-assets/commit/7c41f3ce79c8784914ccf9872dc9ce458a99c806))

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
