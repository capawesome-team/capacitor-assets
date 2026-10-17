import { copy, pathExists, readdir, readFile, rmSync as rm, writeFile } from '@ionic/utils-fs';
import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';

import { Context, loadContext } from '../../src/ctx';
import { IosAssetGenerator, IOS_APP_ICON_SET_PATH, IOS_SPLASH_IMAGE_SET_PATH } from '../../src/platforms/ios';
import { AssetKind, Assets, Format, IosContents, IosOutputAssetTemplate } from '../../src/definitions';
import * as IosAssets from '../../src/platforms/ios/assets';
import sharp from 'sharp';
import { join } from 'path';
import { OutputAsset } from '../../src/output-asset';

describe('iOS Asset Test', () => {
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
    await rm(fixtureDir, { force: true, recursive: true });
  });

  async function verifyExists(generatedAssets: OutputAsset<IosOutputAssetTemplate>[]) {
    const existSet = await Promise.all(
      generatedAssets.map((asset) => {
        const dest = asset.destFilenames[asset.template.name];
        return pathExists(dest);
      }),
    );
    expect(existSet.every((e) => !!e)).toBe(true);
  }

  async function verifySizes(generatedAssets: OutputAsset<IosOutputAssetTemplate>[]) {
    const sizedSet = await Promise.all(
      generatedAssets.map(async (asset) => {
        const dest = asset.destFilenames[asset.template.name];
        const pipe = sharp(dest);
        const metadata = await pipe.metadata();
        return metadata.width === asset.template.width && metadata.height === asset.template.height;
      }),
    );
    expect(sizedSet.every((e) => !!e)).toBe(true);
  }

  it('Should generate ios splashes', async () => {
    const strategy = new IosAssetGenerator();
    let generatedAssets = ((await assets.splash?.generate(strategy, ctx.project)) ??
      []) as OutputAsset<IosOutputAssetTemplate>[];

    let dest = generatedAssets[0].getDestFilename(generatedAssets[0]?.template.name);
    expect(generatedAssets.length).toBe(3);
    expect(await pathExists(dest ?? '')).toBe(true);

    generatedAssets = ((await assets.splashDark?.generate(strategy, ctx.project)) ??
      []) as OutputAsset<IosOutputAssetTemplate>[];

    dest = generatedAssets[0].getDestFilename(generatedAssets[0]?.template.name);
    expect(generatedAssets.length).toBe(3);
    expect(await pathExists(dest ?? '')).toBe(true);

    const contentsJson = JSON.parse(
      await readFile(join(ctx.project.config.ios!.path!, IOS_SPLASH_IMAGE_SET_PATH, 'Contents.json'), {
        encoding: 'utf-8',
      }),
    ) as IosContents;
    expect(contentsJson.images.find((i) => i.filename === IosAssets.IOS_2X_UNIVERSAL_ANYANY_SPLASH_DARK.name));
  });

  it('Should remove the template splashes it replaces', async () => {
    const splashDir = join(ctx.project.config.ios!.path!, IOS_SPLASH_IMAGE_SET_PATH);
    const templateSplashes = ['splash-2732x2732-2.png', 'splash-2732x2732-1.png', 'splash-2732x2732.png'];

    // The image set as `npx cap add ios` creates it
    await writeFile(
      join(splashDir, 'Contents.json'),
      JSON.stringify({
        images: templateSplashes.map((filename, i) => ({ idiom: 'universal', filename, scale: `${i + 1}x` })),
        info: { version: 1, author: 'xcode' },
      }),
    );
    for (const filename of templateSplashes) {
      await sharp({ create: { width: 1, height: 1, channels: 4, background: '#ffffff' } })
        .png()
        .toFile(join(splashDir, filename));
    }

    const strategy = new IosAssetGenerator();
    await assets.splash?.generate(strategy, ctx.project);
    await assets.splashDark?.generate(strategy, ctx.project);

    const contentsJson = JSON.parse(
      await readFile(join(splashDir, 'Contents.json'), { encoding: 'utf-8' }),
    ) as IosContents;
    const referenced = contentsJson.images.map((i) => i.filename).sort();
    const onDisk = (await readdir(splashDir)).filter((f) => f !== 'Contents.json').sort();
    expect(onDisk).toEqual(referenced);
    expect(onDisk).toHaveLength(6);
  });

  it('Should generate ios icons', async () => {
    const exportedIcons = Object.values(IosAssets).filter(
      (a) =>
        [AssetKind.Icon].indexOf(a.kind) >=
        0,
    );

    const strategy = new IosAssetGenerator();
    let generatedAssets = ((await assets.icon?.generate(strategy, ctx.project)) ??
      []) as OutputAsset<IosOutputAssetTemplate>[];
    expect(generatedAssets.length).toBe(exportedIcons.length);

    await verifyExists(generatedAssets);
    await verifySizes(generatedAssets);
  });

  it('Should generate ios dark and tinted icons', async () => {
    const strategy = new IosAssetGenerator();
    const generatedAssets = [
      ...((await assets.iosIcon?.generate(strategy, ctx.project)) ?? []),
      ...((await assets.iosIconDark?.generate(strategy, ctx.project)) ?? []),
      ...((await assets.iosIconTinted?.generate(strategy, ctx.project)) ?? []),
    ] as OutputAsset<IosOutputAssetTemplate>[];
    expect(generatedAssets.length).toBe(3);

    await verifyExists(generatedAssets);
    await verifySizes(generatedAssets);

    const darkIcon = await sharp(generatedAssets[1].destFilenames[IosAssets.IOS_1024_ICON_DARK.name]).metadata();
    expect(darkIcon.hasAlpha).toBe(true);

    const contentsJson = JSON.parse(
      await readFile(join(ctx.project.config.ios!.path!, IOS_APP_ICON_SET_PATH, 'Contents.json'), {
        encoding: 'utf-8',
      }),
    ) as IosContents;
    expect(contentsJson.images).toEqual([
      { idiom: 'universal', size: '1024x1024', filename: IosAssets.IOS_1024_ICON.name, platform: 'ios' },
      {
        appearances: [{ appearance: 'luminosity', value: 'dark' }],
        idiom: 'universal',
        size: '1024x1024',
        filename: IosAssets.IOS_1024_ICON_DARK.name,
        platform: 'ios',
      },
      {
        appearances: [{ appearance: 'luminosity', value: 'tinted' }],
        idiom: 'universal',
        size: '1024x1024',
        filename: IosAssets.IOS_1024_ICON_TINTED.name,
        platform: 'ios',
      },
    ]);
  });
});

describe('iOS Asset Test - Logo Only', () => {
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

  afterAll(async () => {
    await rm(fixtureDir, { force: true, recursive: true });
  });

  async function verifySizes(generatedAssets: OutputAsset<IosOutputAssetTemplate>[]) {
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

  it('Should generate icons and splashes from logo', async () => {
    const strategy = new IosAssetGenerator({
      splashBackgroundColor: '#999999',
      splashBackgroundColorDark: '#122140',
    });
    let generatedAssets = ((await assets.logo?.generate(strategy, ctx.project)) ??
      []) as OutputAsset<IosOutputAssetTemplate>[];

    const assetTemplates = Object.values(IosAssets).filter(
      (a) =>
        [
          AssetKind.Icon,
          AssetKind.Splash,
          AssetKind.SplashDark,
        ].indexOf(a.kind) >= 0,
    );

    expect(generatedAssets.length).toBe(assetTemplates.length);

    const contentsJson = JSON.parse(
      await readFile(join(ctx.project.config.ios!.path!, IOS_SPLASH_IMAGE_SET_PATH, 'Contents.json'), {
        encoding: 'utf-8',
      }),
    ) as IosContents;
    expect(contentsJson.images.find((i) => i.filename === IosAssets.IOS_2X_UNIVERSAL_ANYANY_SPLASH_DARK.name));

    await verifySizes(generatedAssets);
  });

  it('Should generate icons and splashes from logo-dark', async () => {
    const strategy = new IosAssetGenerator({
      splashBackgroundColor: '#999999',
      splashBackgroundColorDark: '#122140',
    });
    let generatedAssets = ((await assets.logoDark?.generate(strategy, ctx.project)) ??
      []) as OutputAsset<IosOutputAssetTemplate>[];

    const assetTemplates = Object.values(IosAssets).filter(
      (a) =>
        [
          AssetKind.Icon,
          AssetKind.Splash,
          AssetKind.SplashDark,
        ].indexOf(a.kind) >= 0,
    );

    // Shouldn't generate standard splash
    expect(generatedAssets.find((f) => f.asset.kind === AssetKind.Splash)).toBeUndefined();
    expect(generatedAssets.length).toBeGreaterThan(0);
    // Should be just the dark splashes
    expect(generatedAssets.length).toBe(3);

    const contentsJson = JSON.parse(
      await readFile(join(ctx.project.config.ios!.path!, IOS_SPLASH_IMAGE_SET_PATH, 'Contents.json'), {
        encoding: 'utf-8',
      }),
    ) as IosContents;
    expect(contentsJson.images.find((i) => i.filename === IosAssets.IOS_2X_UNIVERSAL_ANYANY_SPLASH_DARK.name));

    await verifySizes(generatedAssets);
  });
});
