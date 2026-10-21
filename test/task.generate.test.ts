import { copy, readJSON, rmSync as rm } from '@ionic/utils-fs';
import { dirname, join, relative } from 'path';
import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';

import { Context, loadContext } from '../src/ctx';
import { Format } from '../src/definitions';
import { OutputAsset } from '../src/output-asset';

describe('Task: Generate test', () => {
  let ctx: Context;
  const fixtureDir = mkdtempSync(join(tmpdir(), 'capacitor-assets-'));

  beforeAll(async () => {
    await copy('test/fixtures/app', fixtureDir);
  });

  beforeEach(async () => {
    ctx = await loadContext(fixtureDir);
    ctx.args.silent = true;
  });

  afterAll(async () => {
    await rm(fixtureDir, { force: true, recursive: true });
  });

  function log(target: string, generated: OutputAsset[]) {
    console.log('-'.repeat(10), target.toUpperCase(), '-'.repeat(10));
    console.log(
      generated
        .filter((g) => {
          return Object.values(g.destFilenames)[0].includes(target);
        })
        .map((g) => Object.values(g.destFilenames).map((f) => f.replace(fixtureDir, '')))
        .flat()
        .sort(),
    );
  }

  it('Should generate all project assets', async () => {
    const { run } = await import('../src/tasks/generate');

    const generated = await run(ctx);

    // log('ios', generated);
    // log('android', generated);
    // log('public', generated);

    // TODO: Make this more specific instead of "it generated a lot of assets"
    expect(generated.length).toBeGreaterThanOrEqual(77);
  });

  it('Should support custom pwa manifest dir', async () => {
    const { run } = await import('../src/tasks/generate');

    ctx.args.pwaManifestPath = 'public/custom.manifest';
    ctx.args.splashBackgroundColor = '#abcdef';

    const generated = await run(ctx);

    const manifestPath = join(fixtureDir, 'public', 'custom.manifest');
    const manifest = await readJSON(manifestPath);
    expect(manifest['background_color']).toBe('#abcdef');

    // TODO: Make this more specific instead of "it generated a lot of assets"
    expect(generated.length).toBeGreaterThanOrEqual(77);
  });
});

describe('Task: Generate with both Easy and Custom Mode files', () => {
  let ctx: Context;
  const fixtureDir = mkdtempSync(join(tmpdir(), 'capacitor-assets-'));

  beforeAll(async () => {
    await copy('test/fixtures/app', fixtureDir);
    await copy('test/fixtures/app-logo-only/assets', join(fixtureDir, 'assets'));
  });

  beforeEach(async () => {
    ctx = await loadContext(fixtureDir);
    ctx.args.silent = true;
  });

  afterAll(async () => {
    await rm(fixtureDir, { force: true, recursive: true });
  });

  async function sourceKinds() {
    const { run } = await import('../src/tasks/generate');
    const generated = await run(ctx);
    const assetDir = join(fixtureDir, 'assets');
    return [...new Set(generated.filter((g) => dirname(g.asset.path) === assetDir).map((g) => g.asset.kind))].sort();
  }

  it('Should use the custom files without Easy Mode options', async () => {
    expect(await sourceKinds()).toEqual([
      'icon',
      'icon-background',
      'icon-foreground',
      'icon-monochrome',
      'splash',
      'splash-dark',
    ]);
  });

  it('Should use the logo with an Easy Mode option', async () => {
    ctx.args.iconBackgroundColor = '#ffffff';

    expect(await sourceKinds()).toEqual(['icon-monochrome', 'logo', 'logo-dark']);
  });

  it('Should leave out the custom files in the platform folders with an Easy Mode option', async () => {
    ctx.args.iconBackgroundColor = '#ffffff';

    const { run } = await import('../src/tasks/generate');
    const generated = await run(ctx);
    const sources = generated.map((g) => relative(join(fixtureDir, 'assets'), g.asset.path));
    expect(sources).not.toContain(join('ios', 'icon.png'));
    expect(sources).not.toContain(join('android', 'icon.png'));
    expect(sources).toContain(join('ios', 'icon-dark.png'));
    expect(sources).toContain(join('android', 'notification-icon.png'));
  });
});
