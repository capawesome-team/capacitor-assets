# @capawesome/capacitor-assets

[![npm version](https://img.shields.io/npm/v/@capawesome/capacitor-assets)](https://www.npmjs.com/package/@capawesome/capacitor-assets)
[![npm downloads](https://img.shields.io/npm/dm/@capawesome/capacitor-assets)](https://www.npmjs.com/package/@capawesome/capacitor-assets)
[![license](https://img.shields.io/npm/l/@capawesome/capacitor-assets)](https://github.com/capawesome-team/capacitor-assets/blob/main/LICENSE)

This tool will crop and resize JPEG and PNG source images to generate icons and splash screens for iOS, Android, and Progressive Web Apps using [Capacitor](https://capacitorjs.com/).

This is the maintained fork of [@capacitor/assets](https://github.com/ionic-team/capacitor-assets) by [Capawesome](https://capawesome.io/). It is a drop-in replacement: only the package name changed.

## Install

```shell
npm install --save-dev @capawesome/capacitor-assets
```

## Usage

The tool expects a `assets` or `resources` folder to exist in the root of the project.

There are two modes this tool can be used in: Easy Mode, and Full Control mode.

### Usage - Easy Mode (recommended)

With Easy Mode, the tool supports generating all the icon and splash assets you need for iOS, Android, and PWA from a single logo file along with an optional dark mode logo, and background colors. This is the easiest way to generate all your assets, but it trades customizability for convenience.

To use this mode, create a single `logo.png` or `icon.png` with an optional `logo-dark.png` in `assets/` (the tool also supports using SVG files as source images, substitute `.svg` as needed):

```
assets/
├── logo.png
└── logo-dark.png
```

To support themed app icons on Android 13+, you can also add an optional `icon-monochrome.png` (see Custom Mode).

Then, generate the assets and provide the background colors that will be used to generate background layers for icons:

```shell
npx @capawesome/capacitor-assets generate --iconBackgroundColor '#eeeeee' --iconBackgroundColorDark '#222222' --splashBackgroundColor '#eeeeee' --splashBackgroundColorDark '#111111'
```

Where the provided flags are:

- `--iosProject` - the path to the iOS project (default `ios/App`)
- `--androidProject` - the path to the Android project (default `android`)
- `--androidNotificationIconName` - the resource name of the generated Android notification icon (default `ic_notification`, see [Android notification icon](#android-notification-icon))
- `--assetPath <path>` - Path to the assets directory for your project. By default will check `"assets"` and `"resources"` directories, in that order.
- `--iconBackgroundColor` - the background color (hex value) used when generating icon layers for light mode (default `#ffffff`)
- `--iconBackgroundColorDark` - the background color (hex value) used when generating icon layers for dark mode (where supported) (default `#111111`)
- `--splashBackgroundColor` - the background color (hex value) used when generating splash screens (default `#ffffff`)
- `--splashBackgroundColorDark` - the background color (hex value) used when generating splash screens for dark mode (where supported) (default `#111111`)
- `--logoSplashTargetWidth` - the width of the logo in pixels on the 2732×2732px splash the splash screens are generated from (not used by default, see `--logoSplashScale`)
- `--logoSplashScale` - the width of the logo as a fraction of the 2732×2732px splash the splash screens are generated from (default: `0.2`)
- `--ios` - explicitly run iOS asset generation. Using a platform flag makes the platform list exclusive.
- `--android` - explicitly run Android asset generation. Using a platform flag makes the platform list exclusive.
- `--pwa` - explicitly run PWA asset generation. Using a platform flag makes the platform list exclusive.
- `--pwaNoAppleFetch` - deprecated and has no effect. Apple device screen sizes are always taken from a built-in list (see [Splash screens](#splash-screens)).

### Usage - Custom Mode

This mode provides full control over the assets used to generate icons and splash screens, but requires more source files. To use this mode, provide custom icons and splash screen source images as shown below:

```
assets/
├── icon-only.png
├── icon-foreground.png
├── icon-background.png
├── icon-monochrome.png
├── splash.png
├── splash-dark.png
├── android/
│   └── notification-icon.png
└── ios/
    ├── icon-dark.png
    └── icon-tinted.png
```

- `assets/icon-only.(png|jpg)` must be at least 1024×1024px
- `assets/icon-(foreground|background).(png|jpg)` must be at least 1024×1024px
- `assets/icon-monochrome.png` is optional and must be at least 1024×1024px. It is the monochrome layer for [themed app icons](https://developer.android.com/develop/ui/views/launch/icon_design_adaptive) on Android 13+: a single-color shape on a transparent background that the system tints. Keep the same safe zone as the foreground. It requires `icon-foreground.png` and `icon-background.png` (or a logo in Easy Mode), because the generated launcher XML references all three layers.
- `assets/splash[-dark].(png|jpg)` must be at least 2732×2732px
- `assets/ios/icon-(dark|tinted).(png|jpg)` are optional and must be at least 1024×1024px. They are used for the dark and tinted app icon appearances on iOS 18 and later. The dark icon should have a transparent background, the tinted icon should be a grayscale image (see [Apple's guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)).
- `assets/android/icon-(foreground|background|monochrome).(png|jpg)` are optional and must be at least 1024×1024px. They replace `icon-foreground`, `icon-background` and `icon-monochrome` as the adaptive icon layers on Android only.
- `assets/android/notification-icon.(png|svg)` (optional) must be at least 96×96px, white on a transparent background

To generate resources with all the default options, just run:

```shell
npx @capawesome/capacitor-assets generate
```

`@capawesome/capacitor-assets` accepts a platform for the first argument (`ios`, `android`, or `pwa` currently). If specified, resources are generated only for that platform:

```shell
npx @capawesome/capacitor-assets generate --ios
```

Otherwise `@capawesome/capacitor-assets` will use all detected Capacitor platforms.

#### Android notification icon

If `assets/android/notification-icon.png` exists, the tool generates `ic_notification.png` in each `res/drawable-<density>/` folder of your Android project, at 24, 36, 48, 72 and 96px. Use `--androidNotificationIconName` to give it another name. Android only renders the alpha channel of this icon, so use white pixels on a transparent background.

To use it with [`@capacitor/push-notifications`](https://capacitorjs.com/docs/apis/push-notifications) or [`@capacitor-firebase/messaging`](https://capawesome.io/docs/sdks/capacitor/firebase/cloud-messaging/), add the following to the `<application>` element of `android/app/src/main/AndroidManifest.xml`:

```xml
<meta-data android:name="com.google.firebase.messaging.default_notification_icon" android:resource="@drawable/ic_notification" />
```

To use it with [`@capacitor/local-notifications`](https://capacitorjs.com/docs/apis/local-notifications), set `smallIcon` to `ic_notification` in the plugin configuration.

To use it with [`@onesignal/capacitor-plugin`](https://documentation.onesignal.com/docs/notification-icons#how-to-add-android-default-icons), no manifest entry or plugin option points to the icon: OneSignal looks for a drawable named `ic_stat_onesignal_default`. Generate the icon under that name:

```shell
npx @capawesome/capacitor-assets generate --androidNotificationIconName ic_stat_onesignal_default
```

To tint the icon on Android 12 and later, optionally add the following to the `<application>` element of `android/app/src/main/AndroidManifest.xml` (ARGB hex without `#`):

```xml
<meta-data android:name="com.onesignal.NotificationAccentColor.DEFAULT" android:value="FF00FF00" />
```

#### Android 12+ splash screen

Android 12 and later draw the launch screen from the activity theme: one centred icon on a solid colour, not a full-screen image as on iOS. Until the theme points at an icon, the system shows the app's launcher icon, and `splash.png` only appears afterwards through the [Splash Screen plugin](https://capacitorjs.com/docs/apis/splash-screen). From `splash.png` and `splash-dark.png` (or `android/splash.png` and `android/splash-dark.png`), or from the logo in Easy Mode, the tool therefore also:

- writes `ic_splash.png` to `res/drawable[-night]-<density>/`: the middle 36% of the splash, 288dp square. Android masks it to a 192dp circle, so keep the logo inside the middle 24% of the splash.
- writes `splash_background` to `res/values[-night]/colors.xml`: the colour of the splash's top-left pixel. Other colours in the file are kept.
- sets `windowSplashScreenBackground` and `windowSplashScreenAnimatedIcon` on the `AppTheme.NoActionBarLaunch` style in `res/values/styles.xml`.

With the logo centred on a plain background, the launch screen then looks like the splash on iOS. The style must extend `Theme.SplashScreen`, which it does since Capacitor 4. If it does not, the tool prints a warning and leaves `styles.xml` alone. In Easy Mode, keep `--logoSplashScale` at or below `0.24`, or `--logoSplashTargetWidth` at or below `655`, so the logo fits the circle.

## PWA Notes

### Manifest

This tool will create and/or update the web app manifest used in your project, and supports both the older `manifest.json` file and the newer `manifest.webmanifest` files, preferring `manifest.webmanifest` when no existing manifest is found.

By default, the tool will look for the manifest file in `public`, `src`, and `www` in that order. Use the flag `--pwaManifestPath` to specify the exact path to your web app manifest.

### Icons

Icons are written to `icons/` in your assets directory as `icon-<size>.png` and `icon-maskable-<size>.png` for the sizes 48, 72, 96, 128, 192, 256 and 512. The manifest lists the `icon-<size>.png` files with `purpose: "any"` and the `icon-maskable-<size>.png` files with `purpose: "maskable"`.

When generating from a logo, the logo is placed on the `--iconBackgroundColor` (default `#ffffff`), so the icons are opaque. The maskable icons scale the logo down to about three quarters of the icon size. Android browsers disagree on how a [maskable icon](https://web.dev/articles/maskable-icon) maps to an adaptive icon: Firefox pads it to align the safe zones, Chrome's WebAPK uses it as the adaptive layer directly, so the same icon renders about 1.3 times larger on Chrome than on Firefox. The scale is the geometric middle of both, which keeps the logo uncropped on Chrome and only slightly small on Firefox. Artwork that reaches the corners of the logo can still be clipped by round masks. A user-supplied `icon-only.png` is used as-is for the `any` icons and is inset on the `--iconBackgroundColor` for the maskable icons.

Earlier versions wrote PNG data to `icon-<size>.webp` files. These files are removed from the manifest and deleted on the next run; files outside the `icons/` directory are never deleted. Update any references to them, for example `apple-touch-icon` links in your `index.html`.

### Splash screens

iOS splash screens (`apple-touch-startup-image`) are generated for a built-in list of iPhone and iPad screen sizes. The list is based on the device screen dimensions table of the [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/layout) and is updated with new releases of this tool. Earlier versions fetched the sizes from the Apple website at runtime; this no longer works because Apple removed the table, so the fetch and the `--pwaNoAppleFetch` flag have no effect anymore.

### Help

See the help instructions on the command line with the `--help` flag.

```shell
npx @capawesome/capacitor-assets generate --help
```
