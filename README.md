# @capawesome/capacitor-assets

[![npm version](https://img.shields.io/npm/v/@capawesome/capacitor-assets)](https://www.npmjs.com/package/@capawesome/capacitor-assets)
[![npm downloads](https://img.shields.io/npm/dm/@capawesome/capacitor-assets)](https://www.npmjs.com/package/@capawesome/capacitor-assets)
[![license](https://img.shields.io/npm/l/@capawesome/capacitor-assets)](https://github.com/capawesome-team/capacitor-assets/blob/main/LICENSE)

Generates the icons and splash screens of a [Capacitor](https://capacitorjs.com/) app for iOS, Android and Progressive Web Apps, from a single logo or from your own source images.

This is the maintained fork of [@capacitor/assets](https://github.com/ionic-team/capacitor-assets) by [Capawesome](https://capawesome.io/). It is a drop-in replacement: only the package name changed. See [Migrating from @capacitor/assets](#migrating-from-capacitorassets).

## Getting started

1. Install the package:

   ```shell
   npm install --save-dev @capawesome/capacitor-assets
   ```

2. Put a `logo.png` of at least 1024×1024px, ideally with a transparent background, into an `assets/` folder in the root of your project.

3. Generate the assets for every platform in your project:

   ```shell
   npx @capawesome/capacitor-assets generate
   ```

The icons and splash screens are written straight into your iOS, Android and web projects. Run the command again whenever the logo changes.

To set your brand colors, see [Easy Mode](#easy-mode). To use your own icons and splash screens instead of a logo, see [Custom Mode](#custom-mode).

## Source files

The tool reads its source files from the `assets/` folder in the root of your project, or from `resources/` if that exists instead. Use `--assetPath` to point at another folder. There are two ways to fill it.

### Easy Mode

Easy Mode generates everything from one logo. It is the recommended way: less work for you, and the result looks the same on every platform. It trades customizability for convenience.

```
assets/
├── logo.png
├── logo-dark.png
├── icon-monochrome.png
└── icon-maskable.png
```

| File                  | Minimum size | Notes                                                                                                |
| --------------------- | ------------ | ---------------------------------------------------------------------------------------------------- |
| `logo.(png\|svg)`     | 1024×1024px  | The logo. `icon.(png\|svg)` works as an alternative name.                                            |
| `logo-dark.png`       | 1024×1024px  | Optional. The logo for the dark mode splash screens.                                                 |
| `icon-monochrome.png` | 1024×1024px  | Optional. The monochrome layer for themed app icons on Android 13+, see [Custom Mode](#custom-mode). |
| `icon-maskable.png`   | 512×512px    | Optional. The maskable PWA icon, see [Custom Mode](#custom-mode).                                    |

The logo is placed on a background color for the icons and on another one for the splash screens. Pass your brand colors as options:

```shell
npx @capawesome/capacitor-assets generate --iconBackgroundColor '#eeeeee' --splashBackgroundColor '#eeeeee' --splashBackgroundColorDark '#111111'
```

On the splash screens, the logo is one fifth of the width by default. Change that with `--logoSplashScale` or `--logoSplashTargetWidth`, see [Options](#options).

### Custom Mode

Custom Mode gives you full control: you provide the icon layers and the splash screens yourself.

```
assets/
├── icon-only.png
├── icon-foreground.png
├── icon-background.png
├── icon-monochrome.png
├── icon-maskable.png
├── splash.png
└── splash-dark.png
```

| File                         | Minimum size | Notes                                                                                                                                                                                                                                                                                                                                                                       |
| ---------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `icon-only.(png\|jpg)`       | 1024×1024px  | The app icon on iOS and PWA, and the legacy launcher icon on Android.                                                                                                                                                                                                                                                                                                       |
| `icon-foreground.(png\|jpg)` | 1024×1024px  | The foreground layer of the Android adaptive icon.                                                                                                                                                                                                                                                                                                                          |
| `icon-background.(png\|jpg)` | 1024×1024px  | The background layer of the Android adaptive icon.                                                                                                                                                                                                                                                                                                                          |
| `icon-monochrome.(png\|jpg)` | 1024×1024px  | Optional. The monochrome layer for [themed app icons](https://developer.android.com/develop/ui/views/launch/icon_design_adaptive) on Android 13+: a single-color shape on a transparent background that the system tints. Keep the same safe zone as the foreground. Needs the foreground and background layers (or a logo), because the launcher XML references all three. |
| `icon-maskable.(png\|jpg)`   | 512×512px    | Optional. The PWA icon for the `maskable` manifest entries, used as is. Make it full-bleed with the artwork inside the central 80% circle, see [maskable icons](https://web.dev/articles/maskable-icon). Without it, the app icon is inset on `--iconBackgroundColor`.                                                                                                      |
| `splash.(png\|jpg)`          | 2732×2732px  | The splash screen. Keep the artwork in the middle, the edges are cropped on most screens.                                                                                                                                                                                                                                                                                   |
| `splash-dark.(png\|jpg)`     | 2732×2732px  | Optional. The splash screen for dark mode.                                                                                                                                                                                                                                                                                                                                  |

Custom files win over the logo. If the folder holds both, the custom files overwrite what the logo generated for the same output. `logo.png` plus `splash.png`, for example, gives icons from the logo and splash screens from `splash.png`.

### Platform-specific files

Files in `assets/ios/` and `assets/android/` apply to one platform only and take precedence over the file in `assets/` that produces the same output. The names match, with one exception: the app icon is `icon-only.png` in `assets/`, but `ios/icon.png` and `android/icon.png` in the platform folders (a root `icon.png` is an Easy Mode logo).

| File                                                           | Minimum size | Notes                                                                                                                                                     |
| -------------------------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ios/icon.(png\|jpg)`                                          | 1024×1024px  | The iOS app icon.                                                                                                                                         |
| `ios/icon-dark.(png\|jpg)`                                     | 1024×1024px  | The dark app icon on iOS 18+. Use a transparent background.                                                                                               |
| `ios/icon-tinted.(png\|jpg)`                                   | 1024×1024px  | The tinted app icon on iOS 18+. Use a grayscale image, see [Apple's guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons). |
| `ios/splash[-dark].(png\|jpg)`                                 | 2732×2732px  | The iOS splash screens.                                                                                                                                   |
| `android/icon.(png\|jpg)`                                      | 1024×1024px  | The Android legacy launcher icon.                                                                                                                         |
| `android/icon-(foreground\|background\|monochrome).(png\|jpg)` | 1024×1024px  | The Android adaptive icon layers.                                                                                                                         |
| `android/splash[-dark].(png\|jpg)`                             | 2732×2732px  | The Android splash screens.                                                                                                                               |
| `android/notification-icon.(png\|svg)`                         | 96×96px      | The Android notification icon, white on a transparent background. See [Notification icon](#notification-icon).                                            |

## Generated assets

Without a platform option, `generate` runs for every platform it finds in the project. Pass `--ios`, `--android` or `--pwa` to pick platforms:

```shell
npx @capawesome/capacitor-assets generate --ios --android
```

### iOS

Written to `ios/App/App/Assets.xcassets/` (change the project path with `--iosProject`):

- `AppIcon.appiconset/`: the 1024×1024px app icon, plus the dark and tinted variants when `ios/icon-dark` and `ios/icon-tinted` exist. The icon is placed on `--iconBackgroundColor`, because iOS needs an opaque icon.
- `Splash.imageset/`: the 2732×2732px universal splash screens at 1x, 2x and 3x, in light and dark mode. The `Contents.json` files are updated and the template images are removed.

### Android

Written to `android/app/src/main/res/` (change the project path with `--androidProject` and the flavor with `--androidFlavor`):

- `mipmap-<density>/ic_launcher_foreground.png`, `ic_launcher_background.png` and `ic_launcher_monochrome.png`, with `mipmap-anydpi-v26/ic_launcher.xml` and `ic_launcher_round.xml`: the adaptive icon. The monochrome layer is only referenced when a monochrome source file exists. The layers are full bleed, with the source at `--androidIconScale` of the layer (`1` for sources drawn to Android's 108dp template).
- `mipmap-<density>/ic_launcher.png` and `ic_launcher_round.png`: the legacy launcher icons for Android 7.1 and older. In Easy Mode the logo is placed on `--iconBackgroundColor`.
- `drawable-<orientation>[-night]-<density>/splash.png`: the splash screens shown by the [Splash Screen plugin](https://capacitorjs.com/docs/apis/splash-screen).
- `AndroidManifest.xml`: `android:icon` and `android:roundIcon` point at the generated icons.

#### Android 12+ launch screen

Android 12 and later draw the launch screen from the activity theme: one centered icon on a solid color, not a full-screen image. Until the theme points at an icon, the system shows the launcher icon, and `splash.png` only appears afterwards through the Splash Screen plugin. The tool therefore also:

- writes `drawable[-night]-<density>/ic_splash.png`: the middle 36% of the splash as a 288dp square. Android masks it to a 192dp circle, so keep the artwork inside the middle 24% of the splash. In Easy Mode, keep `--logoSplashScale` at or below `0.24`, or `--logoSplashTargetWidth` at or below `655`.
- writes the color `splash_background` to `values[-night]/colors.xml`: the color of the top-left pixel of the splash. Other colors in the file are kept.
- sets `windowSplashScreenBackground` and `windowSplashScreenAnimatedIcon` on the `AppTheme.NoActionBarLaunch` style in `values/styles.xml`, and removes its `android:background` item if it is `@drawable/splash`: below Android 12 it covers the icon with the full-screen splash. The style must extend `Theme.SplashScreen`, which it does since Capacitor 4. If it does not, the tool prints a warning and leaves `styles.xml` alone.

With the logo centered on a plain background, the launch screen then looks like the splash screen on iOS.

#### Notification icon

If `assets/android/notification-icon.png` exists, the tool writes `drawable-<density>/ic_notification.png` at 24, 36, 48, 72 and 96px. Android only renders the alpha channel of this icon, so use white pixels on a transparent background. Use `--androidNotificationIconName` to change the resource name.

Then point your notification plugin at it:

- [`@capacitor/push-notifications`](https://capacitorjs.com/docs/apis/push-notifications) and [`@capacitor-firebase/messaging`](https://capawesome.io/docs/sdks/capacitor/firebase/cloud-messaging/): add this to the `<application>` element of `android/app/src/main/AndroidManifest.xml`:

  ```xml
  <meta-data android:name="com.google.firebase.messaging.default_notification_icon" android:resource="@drawable/ic_notification" />
  ```

- [`@capacitor/local-notifications`](https://capacitorjs.com/docs/apis/local-notifications): set `smallIcon` to `ic_notification` in the plugin configuration.

- [`@onesignal/capacitor-plugin`](https://documentation.onesignal.com/docs/notification-icons#how-to-add-android-default-icons): OneSignal reads a fixed resource name, so generate the icon under that name:

  ```shell
  npx @capawesome/capacitor-assets generate --androidNotificationIconName ic_stat_onesignal_default
  ```

  To tint the icon on Android 12 and later, add this to the `<application>` element (ARGB hex without `#`):

  ```xml
  <meta-data android:name="com.onesignal.NotificationAccentColor.DEFAULT" android:value="FF00FF00" />
  ```

### PWA

The web directory is `public`, `src` or `www`, whichever exists first. The images are written to its `assets/icons/` folder if the web directory has an `assets/` folder, otherwise to its `icons/` folder. The tool writes:

- `icon-<size>.png` with `purpose: "any"` and `icon-maskable-<size>.png` with `purpose: "maskable"`, for the sizes 48, 72, 96, 128, 192, 256 and 512. In Easy Mode the logo is placed on `--iconBackgroundColor`, so the icons are opaque. A custom `icon-only.png` is used as is for the `any` icons. A custom `icon-maskable.png` is used as is for the `maskable` icons. Without it, the maskable icons inset the artwork to about three quarters of the icon on `--iconBackgroundColor`, so it survives the launcher masks; artwork that reaches the corners can still be clipped by round masks.
- `apple-splash-<width>-<height>@<density>.png`: the iOS splash screens (`apple-touch-startup-image`) for a built-in list of iPhone and iPad screen sizes, based on the [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/layout) and updated with new releases of this tool. In Easy Mode the logo is placed on `--splashBackgroundColor`, or on `--splashBackgroundColorDark` for dark mode.
- The manifest (`manifest.webmanifest`, or `manifest.json` if that is what exists) is created or updated with the icons and, when `--splashBackgroundColor` is given, with `background_color`. Use `--pwaManifestPath` to point at a specific file.

<details>
<summary>Why three quarters for the maskable icons?</summary>

Android browsers disagree on how a [maskable icon](https://web.dev/articles/maskable-icon) maps to an adaptive icon. Firefox pads it to align the safe zones, Chrome's WebAPK uses it as the adaptive layer directly, so the same icon renders about 1.3 times larger on Chrome than on Firefox. Three quarters is the geometric middle of both: the logo stays uncropped on Chrome and is only slightly small on Firefox.

</details>

## Options

| Option                                 | Default                           | Description                                                                    |
| -------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------ |
| `--ios`, `--android`, `--pwa`          | every platform found              | Generate for the given platforms only.                                         |
| `--assetPath <path>`                   | `assets`, then `resources`        | The folder with the source files.                                              |
| `--iosProject <dir>`                   | `ios/App`                         | The iOS project.                                                               |
| `--androidProject <dir>`               | `android`                         | The Android project.                                                           |
| `--androidFlavor <name>`               | `main`                            | The Android product flavor the assets are written to (`app/src/<flavor>/res`). |
| `--androidNotificationIconName <name>` | `ic_notification`                 | The resource name of the Android notification icon.                            |
| `--androidIconScale <scale>`           | `0.6667`                          | Android adaptive icon source scale, 0 to 1 of the layer.                       |
| `--pwaManifestPath <path>`             | found in `public`, `src` or `www` | The web app manifest file.                                                     |
| `--verbose`                            |                                   | Verbose output.                                                                |

Logo and colors:

| Option                                | Default   | Description                                                                                                                 |
| ------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------- |
| `--iconBackgroundColor <color>`       | `#ffffff` | The background color behind the logo on the icons, and behind custom icons where the platform needs an opaque icon.         |
| `--iconBackgroundColorDark <color>`   | `#111111` | The background color for dark mode icons. Not used by any platform yet.                                                     |
| `--splashBackgroundColor <color>`     | `#ffffff` | The background color of the splash screens generated from the logo. Also written to the PWA manifest as `background_color`. |
| `--splashBackgroundColorDark <color>` | `#111111` | The background color of the dark mode splash screens generated from the logo.                                               |
| `--logoSplashScale <scale>`           | `0.2`     | The width of the logo as a fraction of the 2732×2732px splash the splash screens are generated from.                        |
| `--logoSplashTargetWidth <width>`     |           | The width of the logo in pixels on that splash. Takes precedence over `--logoSplashScale`.                                  |

Colors are hex values. Quote them so your shell does not read `#` as a comment: `'#eeeeee'`.

See the full list on the command line:

```shell
npx @capawesome/capacitor-assets generate --help
```

## Migrating from @capacitor/assets

```shell
npm uninstall @capacitor/assets
npm install --save-dev @capawesome/capacitor-assets
```

Replace `@capacitor/assets` with `@capawesome/capacitor-assets` in your scripts. The source files and options are the same. What changed:

- PWA icons are written as `icon-<size>.png` and `icon-maskable-<size>.png`, with separate `any` and `maskable` entries in the manifest. Earlier versions wrote PNG data to `icon-<size>.webp` files with a combined purpose. The old files are removed from the manifest and deleted from `icons/` on the next run. Update references to them, for example `apple-touch-icon` links in your `index.html`.
- In Easy Mode, the logo is one fifth of the splash on every platform. Earlier versions scaled it by its own width on iOS and drew every Android density on its own.
- Android adaptive icon layers are full bleed, fixing a black line on the bottom and right edges at some launcher sizes. Regenerate the icons.
- `--pwaNoAppleFetch` has no effect. Apple removed the screen size table the tool used to fetch, so the sizes come from a built-in list.

See the [changelog](https://github.com/capawesome-team/capacitor-assets/blob/main/CHANGELOG.md) for everything else that was added since the fork.

## Contributing

See [CONTRIBUTING.md](https://github.com/capawesome-team/capacitor-assets/blob/main/CONTRIBUTING.md).

## License

See [LICENSE](https://github.com/capawesome-team/capacitor-assets/blob/main/LICENSE).
