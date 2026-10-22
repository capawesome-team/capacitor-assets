import { copy, move, pathExists, readdirp, readFile, rmSync as rm, statSync, writeFile } from '@ionic/utils-fs';
import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import sharp from 'sharp';
import { join } from 'path';

import { Context, loadContext } from '../../src/ctx';
import {
  AndroidOutputAssetTemplate,
  AndroidOutputAssetTemplateAdaptiveIcon,
  AssetKind,
  Assets,
  Platform,
} from '../../src/definitions';
import { InputAsset } from '../../src/input-asset';
import { OutputAsset } from '../../src/output-asset';
import { AndroidAssetGenerator } from '../../src/platforms/android';
import * as AndroidAssets from '../../src/platforms/android/assets';

describe('Android asset test', () => {
  let ctx: Context;
  let assets: Assets;
  const fixtureDir = mkdtempSync(join(tmpdir(), 'capacitor-assets-'));

  beforeAll(async () => {
    await copy('test/fixtures/app', fixtureDir);
  });

  beforeEach(async () => {
    ctx = await loadContext(fixtureDir);
    assets = await ctx.project.loadInputAssets();
  });

  afterAll(async () => {
    /*
    console.log(
      'Using text/fixtures/app Wrote to',
      join(fixtureDir, 'android', 'app', 'src', 'main', 'res'),
    );
    const files = await readdirp(
      join(fixtureDir, 'android', 'app', 'src', 'main', 'res'),
    );
    console.log(
      files
        .filter(f => !statSync(f).isDirectory())
        .map(f =>
          f.replace(
            join(fixtureDir, 'android', 'app', 'src', 'main', 'res'),
            '',
          ),
        ),
    );
    // console.log(await readFile(join(fixtureDir, 'android', 'app', 'src', 'main', 'AndroidManifest.xml'), { encoding: 'utf-8' }));
    */
    await rm(fixtureDir, { force: true, recursive: true });
  });

  async function verifySizes(generatedAssets: OutputAsset<AndroidOutputAssetTemplate>[]) {
    const sizedSet = await Promise.all(
      generatedAssets.map(async (asset) => {
        const dest = Object.values(asset.destFilenames)[0];
        const pipe = sharp(dest);
        const metadata = await pipe.metadata();
        return metadata.width === asset.template.width && metadata.height === asset.template.height;
      }),
    );
    expect(sizedSet.every((e) => !!e)).toBe(true);
  }

  it('Should generate android legacy icons', async () => {
    const assets = await ctx.project.loadInputAssets();

    const strategy = new AndroidAssetGenerator();
    let generatedAssets = ((await assets.icon?.generate(strategy, ctx.project)) ??
      []) as OutputAsset<AndroidOutputAssetTemplateAdaptiveIcon>[];

    // Expect legacy main icons and rounded to be generated
    expect(generatedAssets.length).toBe(12);

    const template = generatedAssets[0].template;

    Object.values(generatedAssets[0].destFilenames).map(async (f) => expect(await pathExists(f)).toBe(true));

    await verifySizes(generatedAssets);
  });

  it('Should generate android adaptive icons', async () => {
    const assets = await ctx.project.loadInputAssets();

    const strategy = new AndroidAssetGenerator();
    let generatedAssets = ((await assets.iconForeground?.generate(strategy, ctx.project)) ??
      []) as OutputAsset<AndroidOutputAssetTemplateAdaptiveIcon>[];

    expect(generatedAssets.length).toBe(6);

    Object.values(generatedAssets[0].destFilenames).map(async (f) => expect(await pathExists(f)).toBe(true));

    const { ANDROID_XXXHDPI_ADAPTIVE_ICON } = AndroidAssets;
    const xxxhdpiForeground = generatedAssets.find((a) => a.template.density === ANDROID_XXXHDPI_ADAPTIVE_ICON.density)!;
    const metadata = await sharp(Object.values(xxxhdpiForeground.destFilenames)[0]).metadata();
    expect([metadata.width, metadata.height]).toEqual([
      ANDROID_XXXHDPI_ADAPTIVE_ICON.width,
      ANDROID_XXXHDPI_ADAPTIVE_ICON.height,
    ]);

    generatedAssets = ((await assets.iconBackground?.generate(strategy, ctx.project)) ??
      []) as OutputAsset<AndroidOutputAssetTemplateAdaptiveIcon>[];

    expect(generatedAssets.length).toBe(6);

    Object.values(generatedAssets[0].destFilenames).map(async (f) => expect(await pathExists(f)).toBe(true));

    await verifySizes(generatedAssets);
  });

  it('Should load android adaptive icon layers from the android folder', async () => {
    const assetDir = join(fixtureDir, 'assets');
    const layers = ['foreground', 'background', 'monochrome'];
    for (const layer of layers) {
      await copy(join(assetDir, `icon-${layer}.png`), join(assetDir, 'android', `icon-${layer}.png`));
    }

    try {
      const assets = await ctx.project.loadInputAssets();

      expect(assets.androidIconForeground?.kind).toBe(AssetKind.IconForeground);
      expect(assets.androidIconBackground?.kind).toBe(AssetKind.IconBackground);
      expect(assets.androidIconMonochrome?.kind).toBe(AssetKind.IconMonochrome);
    } finally {
      for (const layer of layers) {
        await rm(join(assetDir, 'android', `icon-${layer}.png`), { force: true });
      }
    }
  });

  it('Should reference the monochrome layer from the android folder', async () => {
    const assetDir = join(fixtureDir, 'assets');
    await move(join(assetDir, 'icon-monochrome.png'), join(assetDir, 'android', 'icon-monochrome.png'));

    try {
      const assets = await ctx.project.loadInputAssets();
      const strategy = new AndroidAssetGenerator();
      await assets.androidIconMonochrome?.generate(strategy, ctx.project);

      const icLauncherXml = await readFile(
        join(fixtureDir, 'android', 'app', 'src', 'main', 'res', 'mipmap-anydpi-v26', 'ic_launcher.xml'),
        { encoding: 'utf-8' },
      );
      expect(icLauncherXml).toContain('<monochrome>');
    } finally {
      await move(join(assetDir, 'android', 'icon-monochrome.png'), join(assetDir, 'icon-monochrome.png'));
    }
  });

  it('Should generate android adaptive icon monochrome layer', async () => {
    const strategy = new AndroidAssetGenerator();
    const generatedAssets = ((await assets.iconMonochrome?.generate(strategy, ctx.project)) ??
      []) as OutputAsset<AndroidOutputAssetTemplateAdaptiveIcon>[];

    expect(generatedAssets.length).toBe(6);
    await verifySizes(generatedAssets);

    const icLauncherXml = await readFile(
      join(fixtureDir, 'android', 'app', 'src', 'main', 'res', 'mipmap-anydpi-v26', 'ic_launcher.xml'),
      { encoding: 'utf-8' },
    );
    expect(icLauncherXml).toContain('<monochrome>');
    expect(icLauncherXml).toContain('@mipmap/ic_launcher_monochrome');
  });

  it('Should generate android splashes', async () => {
    const assets = await ctx.project.loadInputAssets();

    const strategy = new AndroidAssetGenerator();
    let generatedAssets = (await assets.splash?.generate(strategy, ctx.project)) ?? [];

    // 13 splashes plus 5 Android 12+ splash icons
    expect(generatedAssets.length).toBe(18);

    generatedAssets = (await assets.splashDark?.generate(strategy, ctx.project)) ?? [];

    expect(generatedAssets.length).toBe(18);
    await verifySizes(generatedAssets as OutputAsset<AndroidOutputAssetTemplate>[]);
  });

  it('Should generate the Android 12+ splash icon and colour and set the launch theme', async () => {
    const strategy = new AndroidAssetGenerator();
    const res = join(fixtureDir, 'android', 'app', 'src', 'main', 'res');
    // The dark pass runs once android:background is gone, and must not warn about it.
    const warn = jest.spyOn(console, 'warn');

    for (const [splash, night] of [
      [assets.splash, ''],
      [assets.splashDark, '-night'],
    ] as const) {
      await splash?.generate(strategy, ctx.project);

      const icon = await sharp(join(res, `drawable${night}-xxxhdpi`, 'ic_splash.png')).metadata();
      expect([icon.width, icon.height]).toEqual([1152, 1152]);

      const pixel = await sharp(splash!.path).extract({ left: 0, top: 0, width: 1, height: 1 }).removeAlpha().raw().toBuffer();
      const colors = await readFile(join(res, `values${night}`, 'colors.xml'), { encoding: 'utf-8' });
      expect(colors.match(/splash_background/g)).toHaveLength(1);
      expect(colors).toContain(`<color name="splash_background">#${pixel.toString('hex').toUpperCase()}</color>`);

      const styles = await readFile(join(res, 'values', 'styles.xml'), { encoding: 'utf-8' });
      expect(styles.match(/windowSplashScreenAnimatedIcon/g)).toHaveLength(1);
      expect(styles).toContain('<item name="windowSplashScreenBackground">@color/splash_background</item>');
      expect(styles).toContain('<item name="windowSplashScreenAnimatedIcon">@drawable/ic_splash</item>');
      expect(styles).not.toContain('@drawable/splash<');
      expect(styles).toContain('<item name="android:background">@null</item>');
    }

    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('Should leave a launch theme that does not extend Theme.SplashScreen alone', async () => {
    const stylesPath = join(fixtureDir, 'android', 'app', 'src', 'main', 'res', 'values', 'styles.xml');
    const styles = await readFile(stylesPath, { encoding: 'utf-8' });
    await writeFile(
      stylesPath,
      `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme.NoActionBarLaunch" parent="AppTheme.NoActionBar">
        <item name="android:background">@drawable/splash</item>
    </style>
</resources>
`,
    );

    try {
      await assets.splash?.generate(new AndroidAssetGenerator(), ctx.project);

      expect(await readFile(stylesPath, { encoding: 'utf-8' })).not.toContain('windowSplashScreen');
    } finally {
      await writeFile(stylesPath, styles);
    }
  });

  it('Should generate android notification icons', async () => {
    const strategy = new AndroidAssetGenerator();
    const generatedAssets = ((await assets.androidNotificationIcon?.generate(strategy, ctx.project)) ??
      []) as OutputAsset<AndroidOutputAssetTemplate>[];

    expect(generatedAssets.length).toBe(5);

    for (const asset of generatedAssets) {
      const dest = asset.getDestFilename(join(`drawable-${asset.template.density}`, 'ic_notification.png'));
      expect(await pathExists(dest)).toBe(true);
      expect((await sharp(dest).metadata()).hasAlpha).toBe(true);
    }

    await verifySizes(generatedAssets);
  });

  it('Should generate android notification icons with the given name', async () => {
    const strategy = new AndroidAssetGenerator({
      androidNotificationIconName: 'ic_stat_onesignal_default',
    });
    const generatedAssets = ((await assets.androidNotificationIcon?.generate(strategy, ctx.project)) ??
      []) as OutputAsset<AndroidOutputAssetTemplate>[];

    expect(generatedAssets.length).toBe(5);

    for (const asset of generatedAssets) {
      const dest = asset.getDestFilename(
        join(`drawable-${asset.template.density}`, 'ic_stat_onesignal_default.png'),
      );
      expect(await pathExists(dest)).toBe(true);
    }

    await verifySizes(generatedAssets);
  });
});

describe('Android Asset Test - Logo Only', () => {
  let ctx: Context;
  let assets: Assets;
  const fixtureDir = mkdtempSync(join(tmpdir(), 'capacitor-assets-'));

  beforeAll(async () => {
    await copy('test/fixtures/app-logo-only', fixtureDir);
  });

  beforeEach(async () => {
    ctx = await loadContext(fixtureDir);
    assets = await ctx.project.loadInputAssets();
  });

  async function verifySizes(generatedAssets: OutputAsset<AndroidOutputAssetTemplate>[]) {
    const sizedSet = await Promise.all(
      generatedAssets.map(async (asset) => {
        const dest = Object.values(asset.destFilenames)[0];
        const pipe = sharp(dest);
        const metadata = await pipe.metadata();
        return metadata.width === asset.template.width && metadata.height === asset.template.height;
      }),
    );
    expect(sizedSet.every((e) => !!e)).toBe(true);
  }

  afterAll(async () => {
    /*
    console.log(
      'Wrote to',
      join(fixtureDir, 'android', 'app', 'src', 'main', 'res'),
    );
    const files = await readdirp(
      join(fixtureDir, 'android', 'app', 'src', 'main', 'res'),
    );
    console.log(
      files
        .filter(f => !statSync(f).isDirectory())
        .map(f =>
          f.replace(
            join(fixtureDir, 'android', 'app', 'src', 'main', 'res'),
            '',
          ),
        ),
    );
    */
    // console.log(await readFile(join(fixtureDir, 'android', 'app', 'src', 'main', 'AndroidManifest.xml'), { encoding: 'utf-8' }));
    await rm(fixtureDir, { force: true, recursive: true });
  });

  it('Should generate icons and splashes from logo', async () => {
    const strategy = new AndroidAssetGenerator({
      splashBackgroundColor: '#999999',
      splashBackgroundColorDark: '#122140',
    });
    let generatedAssets = ((await assets.logo?.generate(strategy, ctx.project)) ??
      []) as OutputAsset<AndroidOutputAssetTemplate>[];

    expect(generatedAssets.length).toBe(60);
    await verifySizes(generatedAssets);

    const icLauncherXml = await readFile(
      join(fixtureDir, 'android', 'app', 'src', 'main', 'res', 'mipmap-anydpi-v26', 'ic_launcher.xml'),
      { encoding: 'utf-8' },
    );
    expect(icLauncherXml).not.toContain('<monochrome>');
  });

  it('Should generate icons and splashes from logo-dark', async () => {
    const strategy = new AndroidAssetGenerator({
      splashBackgroundColor: '#999999',
      splashBackgroundColorDark: '#122140',
    });
    let generatedAssets = ((await assets.logoDark?.generate(strategy, ctx.project)) ??
      []) as OutputAsset<AndroidOutputAssetTemplate>[];

    expect(generatedAssets.length).toBe(18);
    await verifySizes(generatedAssets);
  });

  it('Should cut the splashes from the logo drawn on a square splash', async () => {
    const strategy = new AndroidAssetGenerator({ splashBackgroundColorDark: '#122140', logoSplashTargetWidth: 600 });
    await assets.logoDark?.generate(strategy, ctx.project);

    const splash = join(fixtureDir, 'android', 'app', 'src', 'main', 'res', 'drawable-port-night-xxxhdpi', 'splash.png');
    const pixel = await sharp(splash).extract({ left: 0, top: 0, width: 1, height: 1 }).removeAlpha().raw().toBuffer();
    expect(pixel.toString('hex')).toBe('122140');

    // The 1280x1920 portrait splash covers its height with the 2732px square,
    // so the logo is drawn at 1920 / 2732 of its 600px.
    const logo = await sharp(assets.logoDark!.path).resize(600).trim().toBuffer({ resolveWithObject: true });
    const drawn = await sharp(splash).trim().toBuffer({ resolveWithObject: true });
    expect(Math.abs(drawn.info.width - (logo.info.width * 1920) / 2732)).toBeLessThan(2);
  });

  it('Should draw the logo at a fifth of the splash by default', async () => {
    await assets.logo?.generate(new AndroidAssetGenerator(), ctx.project);

    // The 1280x1920 portrait splash covers its height with the 2732px square the logo takes a fifth of
    const splash = join(fixtureDir, 'android', 'app', 'src', 'main', 'res', 'drawable-port-night-xxxhdpi', 'splash.png');
    const drawn = await sharp(splash).trim().toBuffer({ resolveWithObject: true });
    expect(Math.abs(drawn.info.width - 0.2 * 1920)).toBeLessThan(2);
  });

  it('Should draw the legacy icons on the icon background colour', async () => {
    // The fixture logo is opaque, so draw it on a transparent square
    const path = join(fixtureDir, 'assets', 'logo-transparent.png');
    await sharp({ create: { width: 1024, height: 1024, channels: 4, background: '#00000000' } })
      .composite([{ input: assets.logo!.path }])
      .png()
      .toFile(path);
    const logo = new InputAsset(path, AssetKind.Logo, Platform.Any);
    await logo.load();

    await logo.generate(new AndroidAssetGenerator({ iconBackgroundColor: '#abcdef' }), ctx.project);

    // Inside the 8px padding, in the corner the logo leaves transparent
    const icon = join(fixtureDir, 'android', 'app', 'src', 'main', 'res', 'mipmap-xxxhdpi', 'ic_launcher.png');
    const pixel = await sharp(icon).extract({ left: 180, top: 180, width: 1, height: 1 }).raw().toBuffer();
    expect(pixel.toString('hex')).toBe('abcdefff');
  });

  it('Should generate icons in the given flavor folder', async () => {
    const strategy = new AndroidAssetGenerator({
      androidFlavor: 'demo',
    });
    let generatedAssets = ((await assets.logo?.generate(strategy, ctx.project)) ??
      []) as OutputAsset<AndroidOutputAssetTemplate>[];

    generatedAssets.forEach((asset) => {
      Object.keys(asset.destFilenames).forEach(async (name) => {
        let filename = asset.getDestFilename(name);

        expect(filename).toEqual(expect.stringContaining(join('app', 'src', 'demo', 'res')));
        expect(await pathExists(filename)).toBe(true);
      });
    });
  });
});
