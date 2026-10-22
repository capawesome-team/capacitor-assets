import { copy, move, pathExists, readdirp, readFile, rmSync as rm, statSync } from '@ionic/utils-fs';
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
} from '../../src/definitions';
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

    expect(generatedAssets.length).toBe(13);

    generatedAssets = (await assets.splashDark?.generate(strategy, ctx.project)) ?? [];

    expect(generatedAssets.length).toBe(13);
    await verifySizes(generatedAssets as OutputAsset<AndroidOutputAssetTemplate>[]);
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

    expect(generatedAssets.length).toBe(50);
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

    expect(generatedAssets.length).toBe(13);
    await verifySizes(generatedAssets);
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
