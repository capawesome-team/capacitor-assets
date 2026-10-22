import { copy, pathExists, readJSON, rmSync as rm } from '@ionic/utils-fs';
import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';

import { Context, loadContext } from '../../src/ctx';
import { PwaAssetGenerator } from '../../src/platforms/pwa';
import { AssetKind, PwaOutputAssetTemplate } from '../../src/definitions';
import { ASSETS as PwaAssets, PWA_IOS_DEVICE_SIZES } from '../../src/platforms/pwa/assets';
import sharp from 'sharp';
import { isAbsolute, join, parse } from 'path';
import { OutputAsset } from '../../src/output-asset';

describe('PWA Asset Test', () => {
  let ctx: Context;
  const fixtureDir = mkdtempSync(join(tmpdir(), 'capacitor-assets-'));

  beforeAll(async () => {
    await copy('test/fixtures/app', fixtureDir);
  });

  beforeEach(async () => {
    ctx = await loadContext(fixtureDir);
  });

  afterAll(async () => {
    await rm(fixtureDir, { force: true, recursive: true });
  });

  it('Should generate PWA icons', async () => {
    const assets = await ctx.project.loadInputAssets();

    const exportedIcons = Object.values(PwaAssets).filter((a) => a.kind === AssetKind.Icon);

    const strategy = new PwaAssetGenerator();
    let generatedAssets = ((await assets.icon?.generate(strategy, ctx.project)) ??
      []) as OutputAsset<PwaOutputAssetTemplate>[];
    expect(generatedAssets.length).toBe(exportedIcons.length);

    const existSet = await Promise.all(
      generatedAssets.map((asset) => {
        const dest = asset.destFilenames[asset.template.name];
        return pathExists(dest);
      }),
    );
    expect(existSet.every((e) => !!e)).toBe(true);

    const sizedSet = await Promise.all(
      generatedAssets.map(async (asset) => {
        const dest = asset.destFilenames[asset.template.name];
        const pipe = sharp(dest);
        const metadata = await pipe.metadata();
        return metadata.width === asset.template.width && metadata.height === asset.template.height;
      }),
    );
    expect(sizedSet.every((e) => !!e)).toBe(true);

    const manifest = await strategy.getManifestJson(ctx.project);
    expect(manifest.icons.length).toBe(14);
    expect(manifest.icons.filter((icon: any) => icon.purpose === 'any').length).toBe(7);
    expect(manifest.icons.filter((icon: any) => icon.purpose === 'maskable').length).toBe(7);

    expect(
      manifest.icons
        .map((icon: any) => {
          const fname = parse(icon.src).name;
          const num = fname.split('-').pop();
          return icon.sizes === `${num}x${num}` && icon.type === 'image/png';
        })
        .every((i: any) => !!i),
    ).toBe(true);

    // Make sure the file extensions are correct and the paths are relative
    expect(
      manifest.icons
        .map((icon: any) => {
          const ext = parse(icon.src).ext;
          return ext === '.png' && !isAbsolute(icon.src);
        })
        .every((i: any) => !!i),
    ).toBe(true);
  });

  it('Should generate PWA splashes', async () => {
    const assets = await ctx.project.loadInputAssets();

    const strategy = new PwaAssetGenerator();
    const generatedAssets = ((await assets.splash?.generate(strategy, ctx.project)) ??
      []) as OutputAsset<PwaOutputAssetTemplate>[];

    expect(generatedAssets.length).toBe(PWA_IOS_DEVICE_SIZES.length);

    const generatedDarkAssets = ((await assets.splashDark?.generate(strategy, ctx.project)) ??
      []) as OutputAsset<PwaOutputAssetTemplate>[];

    expect(generatedDarkAssets.length).toBe(PWA_IOS_DEVICE_SIZES.length);
  });
});

describe('PWA Asset Test - logo only', () => {
  let ctx: Context;
  const fixtureDir = mkdtempSync(join(tmpdir(), 'capacitor-assets-'));

  async function verifySizes(generatedAssets: OutputAsset<PwaOutputAssetTemplate>[]) {
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

  beforeAll(async () => {
    await copy('test/fixtures/app-logo-only', fixtureDir);
  });

  beforeEach(async () => {
    ctx = await loadContext(fixtureDir);
  });

  afterAll(async () => {
    await rm(fixtureDir, { force: true, recursive: true });
  });

  it('Should place the logo on the icon background color', async () => {
    const assets = await ctx.project.loadInputAssets();

    const strategy = new PwaAssetGenerator({
      iconBackgroundColor: '#962646',
    });

    const generated = (await assets.logo!.generate(strategy, ctx.project)) as OutputAsset<PwaOutputAssetTemplate>[];

    const pixelAt = async (name: string, x: number, y: number) => {
      const icon = generated.find((asset) => asset.template.name === name)!;
      const { data, info } = await sharp(icon.destFilenames[name]).raw().toBuffer({ resolveWithObject: true });
      const offset = (y * info.width + x) * info.channels;
      return Array.from(data.subarray(offset, offset + info.channels));
    };

    // The maskable icon insets the logo, so the area outside the safe zone shows the background
    expect(await pixelAt('icon-maskable-512.png', 0, 0)).toEqual([0x96, 0x26, 0x46, 255]);
    expect(await pixelAt('icon-maskable-512.png', 30, 256)).toEqual([0x96, 0x26, 0x46, 255]);
    expect(await pixelAt('icon-maskable-512.png', 256, 256)).not.toEqual([0x96, 0x26, 0x46, 255]);
  });

  it('Should place the logo on the splash background colors', async () => {
    const assets = await ctx.project.loadInputAssets();

    const strategy = new PwaAssetGenerator({
      splashBackgroundColor: '#962646',
      splashBackgroundColorDark: '#122140',
    });

    const generated = (await assets.logo!.generate(strategy, ctx.project)) as OutputAsset<PwaOutputAssetTemplate>[];

    const cornerOf = async (kind: AssetKind) => {
      const splash = generated.find((asset) => asset.template.kind === kind)!;
      const { data, info } = await sharp(Object.values(splash.destFilenames)[0]).raw().toBuffer({ resolveWithObject: true });
      return Array.from(data.subarray(0, info.channels));
    };

    expect(await cornerOf(AssetKind.Splash)).toEqual([0x96, 0x26, 0x46, 255]);
    expect(await cornerOf(AssetKind.SplashDark)).toEqual([0x12, 0x21, 0x40, 255]);
  });

  it('Should update manifest with generated assets and colors from logo', async () => {
    const assets = await ctx.project.loadInputAssets();

    const exportedIcons = Object.values(PwaAssets).filter((a) => a.kind === AssetKind.Icon);

    const strategy = new PwaAssetGenerator({
      splashBackgroundColor: '#dedbef',
    });

    const generated = await assets.logo!.generate(strategy, ctx.project);

    const manifestPath = join(fixtureDir, 'public', 'manifest.webmanifest');
    const manifest = await readJSON(manifestPath);
    expect(manifest['background_color']).toBe('#dedbef');

    // Icons plus a light and a dark splash per device size
    expect(generated.length).toBe(exportedIcons.length + PWA_IOS_DEVICE_SIZES.length * 2);
    await verifySizes(generated as OutputAsset<PwaOutputAssetTemplate>[]);
  });
});
