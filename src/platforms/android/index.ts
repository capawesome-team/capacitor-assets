import { mkdirp, pathExists, writeFile } from '@ionic/utils-fs';
import { dirname, join, relative } from 'path';
import type { OutputInfo, Sharp } from 'sharp';
import sharp from 'sharp';

import type { AssetGeneratorOptions } from '../../asset-generator';
import { AssetGenerator } from '../../asset-generator';
import type {
  AndroidOutputAssetTemplate,
  AndroidOutputAssetTemplateAdaptiveIcon,
  AndroidOutputAssetTemplateSplash,
} from '../../definitions';
import { AssetKind, Platform } from '../../definitions';
import { BadPipelineError, BadProjectError } from '../../error';
import type { InputAsset } from '../../input-asset';
import { OutputAsset } from '../../output-asset';
import type { Project } from '../../project';
import { warn } from '../../util/log';

import * as AndroidAssetTemplates from './assets';

type AdaptiveIconLayer = 'foreground' | 'background' | 'monochrome';

export class AndroidAssetGenerator extends AssetGenerator {
  constructor(options: AssetGeneratorOptions = {}) {
    super(options);
  }

  async generate(asset: InputAsset, project: Project): Promise<OutputAsset[]> {
    const androidDir = project.config.android?.path;

    if (!androidDir) {
      throw new BadProjectError('No android project found');
    }

    if (asset.platform !== Platform.Any && asset.platform !== Platform.Android) {
      return [];
    }

    switch (asset.kind) {
      case AssetKind.Logo:
      case AssetKind.LogoDark:
        return this.generateFromLogo(asset, project);
      case AssetKind.Icon:
        return this.generateLegacyIcon(asset, project);
      case AssetKind.IconForeground:
        return this.generateAdaptiveIconLayer(asset, project, 'foreground');
      case AssetKind.IconBackground:
        return this.generateAdaptiveIconLayer(asset, project, 'background');
      case AssetKind.IconMonochrome:
        return this.generateAdaptiveIconLayer(asset, project, 'monochrome');
      case AssetKind.Splash:
      case AssetKind.SplashDark:
        return this.generateSplashes(asset, project);
      case AssetKind.NotificationIcon:
        return this.generateNotificationIcons(asset, project);
    }

    return [];
  }

  /**
   * Generate from logo combines all of the other operations into a single operation
   * from a single asset source file. In this mode, a logo along with a background color
   * is used to generate all icons and splash screens (with dark mode where possible).
   */
  private async generateFromLogo(asset: InputAsset, project: Project): Promise<OutputAsset[]> {
    const pipe = asset.pipeline();
    const generated: OutputAsset[] = [];

    if (!pipe) {
      throw new BadPipelineError('Sharp instance not created');
    }

    // Generate adaptive icons
    const generatedAdaptiveIcons = await this._generateAdaptiveIconsFromLogo(project, asset, pipe);
    generated.push(...generatedAdaptiveIcons);

    if (asset.kind === AssetKind.Logo) {
      // Generate legacy icons
      const generatedLegacyIcons = await this.generateLegacyIcon(asset, project);
      generated.push(...generatedLegacyIcons);

      const splashes = Object.values(AndroidAssetTemplates).filter((a) => a.kind === AssetKind.Splash);

      const generatedSplashes = await Promise.all(
        splashes.map(async (splash) => {
          return this._generateSplashesFromLogo(
            project,
            asset,
            splash,
            pipe,
            this.options.splashBackgroundColor ?? '#ffffff',
          );
        }),
      );

      generated.push(...generatedSplashes);
    }

    // Generate dark splashes
    const darkSplashes = Object.values(AndroidAssetTemplates).filter((a) => a.kind === AssetKind.SplashDark);
    const generatedSplashes = await Promise.all(
      darkSplashes.map(async (splash) => {
        return this._generateSplashesFromLogo(
          project,
          asset,
          splash,
          pipe,
          this.options.splashBackgroundColorDark ?? '#111111',
        );
      }),
    );

    generated.push(...generatedSplashes);

    return [...generated];
  }

  // Generate adaptive icons from the source logo
  private async _generateAdaptiveIconsFromLogo(
    project: Project,
    asset: InputAsset,
    pipe: Sharp,
  ): Promise<OutputAsset[]> {
    // Android has no night mode launcher icons. Themed icons (Android 13+) use the
    // monochrome layer instead, see generateAdaptiveIconLayer.
    if (asset.kind === AssetKind.LogoDark) {
      return [];
    }

    // Create the background pipeline for the generated icons
    const backgroundPipe = sharp({
      create: {
        width: asset.width!,
        height: asset.height!,
        channels: 4,
        background:
          asset.kind === AssetKind.Logo
            ? (this.options.iconBackgroundColor ?? '#ffffff')
            : (this.options.iconBackgroundColorDark ?? '#111111'),
      },
    });

    const icons = Object.values(AndroidAssetTemplates).filter(
      (a) => a.kind === AssetKind.AdaptiveIcon,
    ) as AndroidOutputAssetTemplateAdaptiveIcon[];

    const backgroundImages = await Promise.all(
      icons.map(async (icon) => {
        return await this._generateAdaptiveIconLayer(project, asset, icon, backgroundPipe, 'background');
      }),
    );

    const foregroundImages = await Promise.all(
      icons.map(async (icon) => {
        return await this._generateAdaptiveIconLayer(project, asset, icon, pipe, 'foreground');
      }),
    );

    return [...foregroundImages, ...backgroundImages];
  }

  private async _generateSplashesFromLogo(
    project: Project,
    asset: InputAsset,
    splash: AndroidOutputAssetTemplate,
    pipe: Sharp,
    backgroundColor: string,
  ): Promise<OutputAsset> {
    // Generate light splash
    const resPath = this.getResPath(project);

    let drawableDir = `drawable`;
    if (splash.density) {
      drawableDir = `drawable-${splash.density}`;
    }

    const parentDir = join(resPath, drawableDir);
    if (!(await pathExists(parentDir))) {
      await mkdirp(parentDir);
    }
    const dest = join(resPath, drawableDir, 'splash.png');

    const targetLogoWidthPercent = this.options.logoSplashScale ?? 0.2;
    let targetWidth = this.options.logoSplashTargetWidth ?? Math.floor((splash.width ?? 0) * targetLogoWidthPercent);

    if (targetWidth > splash.width || targetWidth > splash.height) {
      targetWidth = Math.floor((splash.width ?? 0) * targetLogoWidthPercent);
    }

    if (targetWidth > splash.width || targetWidth > splash.height) {
      warn(`Logo dimensions exceed dimensions of splash ${splash.width}x${splash.height}, using default logo size`);
      targetWidth = Math.floor((splash.width ?? 0) * 0.2);
    }

    const canvas = sharp({
      create: {
        width: splash.width ?? 0,
        height: splash.height ?? 0,
        channels: 4,
        background: backgroundColor,
      },
    });

    const resized = await sharp(asset.path).resize(targetWidth).toBuffer();

    const outputInfo = await canvas
      .composite([{ input: resized, gravity: sharp.gravity.center }])
      .png()
      .toFile(dest);

    const splashOutput = new OutputAsset(
      splash,
      asset,
      project,
      {
        [dest]: dest,
      },
      {
        [dest]: outputInfo,
      },
    );

    return splashOutput;
  }

  private async generateLegacyIcon(asset: InputAsset, project: Project): Promise<OutputAsset[]> {
    const icons = Object.values(AndroidAssetTemplates).filter(
      (a) => a.kind === AssetKind.Icon,
    ) as AndroidOutputAssetTemplate[];

    const pipe = asset.pipeline();

    if (!pipe) {
      throw new BadPipelineError('Sharp instance not created');
    }

    const collected = await Promise.all(
      icons.map(async (icon) => {
        const [dest, outputInfo] = await this.generateLegacyLauncherIcon(project, asset, icon);

        return new OutputAsset(
          icon,
          asset,
          project,
          { [`mipmap-${icon.density}/ic_launcher.png`]: dest },
          { [`mipmap-${icon.density}/ic_launcher.png`]: outputInfo },
        );
      }),
    );

    collected.push(
      ...(await Promise.all(
        icons.map(async (icon) => {
          const [dest, outputInfo] = await this.generateRoundLauncherIcon(project, asset, icon);

          return new OutputAsset(
            icon,
            asset,
            project,
            { [`mipmap-${icon.density}/ic_launcher_round.png`]: dest },
            { [`mipmap-${icon.density}/ic_launcher_round.png`]: outputInfo },
          );
        }),
      )),
    );

    await this.updateManifest(project);

    return collected;
  }

  private async generateLegacyLauncherIcon(
    project: Project,
    asset: InputAsset,
    template: AndroidOutputAssetTemplate,
  ): Promise<[string, OutputInfo]> {
    const resPath = this.getResPath(project);
    const parentDir = join(resPath, `mipmap-${template.density}`);
    if (!(await pathExists(parentDir))) {
      await mkdirp(parentDir);
    }
    const destRound = join(resPath, `mipmap-${template.density}`, 'ic_launcher.png');

    // This pipeline is trick, but we need two separate pipelines
    // per https://github.com/lovell/sharp/issues/2378#issuecomment-864132578
    const padding = 8;
    const resized = await sharp(asset.path)
      .resize(template.width, template.height)
      // .composite([{ input: Buffer.from(svg), blend: 'dest-in' }])
      .toBuffer();
    const composited = await sharp(resized)
      .resize(Math.max(0, template.width - padding * 2), Math.max(0, template.height - padding * 2))
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toBuffer();
    const outputInfo = await sharp(composited).png().toFile(destRound);

    return [destRound, outputInfo];
  }

  private async generateRoundLauncherIcon(
    project: Project,
    asset: InputAsset,
    template: AndroidOutputAssetTemplate,
  ): Promise<[string, OutputInfo]> {
    const svg = `<svg width="${template.width}" height="${template.height}"><circle cx="${template.width / 2}" cy="${
      template.height / 2
    }" r="${template.width / 2}" fill="#ffffff"/></svg>`;

    const resPath = this.getResPath(project);
    const destRound = join(resPath, `mipmap-${template.density}`, 'ic_launcher_round.png');

    // This pipeline is tricky, but we need two separate pipelines
    // per https://github.com/lovell/sharp/issues/2378#issuecomment-864132578
    const resized = await sharp(asset.path).resize(template.width, template.height).toBuffer();
    const composited = await sharp(resized)
      .composite([{ input: Buffer.from(svg), blend: 'dest-in' }])
      .toBuffer();
    const outputInfo = await sharp(composited).png().toFile(destRound);

    return [destRound, outputInfo];
  }

  private async generateAdaptiveIconLayer(
    asset: InputAsset,
    project: Project,
    layer: AdaptiveIconLayer,
  ): Promise<OutputAsset[]> {
    const icons = Object.values(AndroidAssetTemplates).filter(
      (a) => a.kind === AssetKind.AdaptiveIcon,
    ) as AndroidOutputAssetTemplateAdaptiveIcon[];

    const pipe = asset.pipeline();

    if (!pipe) {
      throw new BadPipelineError('Sharp instance not created');
    }

    return Promise.all(
      icons.map(async (icon) => {
        return await this._generateAdaptiveIconLayer(project, asset, icon, pipe, layer);
      }),
    );
  }

  private async _generateAdaptiveIconLayer(
    project: Project,
    asset: InputAsset,
    icon: AndroidOutputAssetTemplateAdaptiveIcon,
    pipe: Sharp,
    layer: AdaptiveIconLayer,
  ) {
    const resPath = this.getResPath(project);

    const relPath = `mipmap-${icon.density}/ic_launcher_${layer}.png`;
    const dest = join(resPath, relPath);
    const parentDir = dirname(dest);
    if (!(await pathExists(parentDir))) {
      await mkdirp(parentDir);
    }

    const outputInfo = await pipe.resize(icon.width, icon.height).png().toFile(dest);

    const xmlFiles = await this.writeAdaptiveIconXml(project);

    return new OutputAsset(icon, asset, project, { [relPath]: dest, ...xmlFiles }, { [relPath]: outputInfo });
  }

  /**
   * Writes ic_launcher.xml and ic_launcher_round.xml. The monochrome layer is only
   * referenced when a monochrome source asset exists, because Android fails to
   * build when a referenced drawable is missing.
   */
  private async writeAdaptiveIconXml(project: Project): Promise<{ [relPath: string]: string }> {
    const monochrome =
      project.assets?.iconMonochrome || project.assets?.androidIconMonochrome
        ? `
    <monochrome>
        <inset android:drawable="@mipmap/ic_launcher_monochrome" android:inset="16.7%" />
    </monochrome>`
        : '';

    const icLauncherXml = `
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background>
        <inset android:drawable="@mipmap/ic_launcher_background" android:inset="16.7%" />
    </background>
    <foreground>
        <inset android:drawable="@mipmap/ic_launcher_foreground" android:inset="16.7%" />
    </foreground>${monochrome}
</adaptive-icon>
    `.trim();

    const mipmapAnyPath = join(this.getResPath(project), `mipmap-anydpi-v26`);
    if (!(await pathExists(mipmapAnyPath))) {
      await mkdirp(mipmapAnyPath);
    }
    const destIcLauncher = join(mipmapAnyPath, `ic_launcher.xml`);
    const destIcLauncherRound = join(mipmapAnyPath, `ic_launcher_round.xml`);
    await writeFile(destIcLauncher, icLauncherXml);
    await writeFile(destIcLauncherRound, icLauncherXml);

    return {
      'mipmap-anydpi-v26/ic_launcher.xml': destIcLauncher,
      'mipmap-anydpi-v26/ic_launcher_round.xml': destIcLauncherRound,
    };
  }

  private async updateManifest(project: Project) {
    project.android?.getAndroidManifest()?.setAttrs('manifest/application', {
      'android:icon': '@mipmap/ic_launcher',
      'android:roundIcon': '@mipmap/ic_launcher_round',
    });

    await project.commit();
  }

  private async generateSplashes(asset: InputAsset, project: Project): Promise<OutputAsset[]> {
    const pipe = asset.pipeline();

    if (!pipe) {
      throw new BadPipelineError('Sharp instance not created');
    }

    const splashes = (
      asset.kind === AssetKind.Splash
        ? Object.values(AndroidAssetTemplates).filter((a) => a.kind === AssetKind.Splash)
        : Object.values(AndroidAssetTemplates).filter((a) => a.kind === AssetKind.SplashDark)
    ) as AndroidOutputAssetTemplateSplash[];

    const resPath = this.getResPath(project);

    const collected = await Promise.all(
      splashes.map(async (splash) => {
        const [dest, outputInfo] = await this.generateSplash(project, asset, splash, pipe);

        const relPath = relative(resPath, dest);
        return new OutputAsset(splash, asset, project, { [relPath]: dest }, { [relPath]: outputInfo });
      }),
    );

    return collected;
  }

  private async generateSplash(
    project: Project,
    asset: InputAsset,
    template: AndroidOutputAssetTemplateSplash,
    pipe: Sharp,
  ): Promise<[string, OutputInfo]> {
    const drawableDir = template.density ? `drawable-${template.density}` : 'drawable';

    const resPath = this.getResPath(project);
    const parentDir = join(resPath, drawableDir);
    if (!(await pathExists(parentDir))) {
      await mkdirp(parentDir);
    }
    const dest = join(resPath, drawableDir, 'splash.png');

    const outputInfo = await pipe.resize(template.width, template.height).png().toFile(dest);

    return [dest, outputInfo];
  }

  private async generateNotificationIcons(asset: InputAsset, project: Project): Promise<OutputAsset[]> {
    const pipe = asset.pipeline();

    if (!pipe) {
      throw new BadPipelineError('Sharp instance not created');
    }

    const icons = Object.values(AndroidAssetTemplates).filter(
      (a) => a.kind === AssetKind.NotificationIcon,
    ) as AndroidOutputAssetTemplate[];

    const resPath = this.getResPath(project);

    return Promise.all(
      icons.map(async (icon) => {
        const parentDir = join(resPath, `drawable-${icon.density}`);
        if (!(await pathExists(parentDir))) {
          await mkdirp(parentDir);
        }
        const dest = join(parentDir, 'ic_notification.png');

        const outputInfo = await pipe.resize(icon.width, icon.height).png().toFile(dest);

        const relPath = relative(resPath, dest);
        return new OutputAsset(icon, asset, project, { [relPath]: dest }, { [relPath]: outputInfo });
      }),
    );
  }

  private getResPath(project: Project): string {
    return join(project.config.android!.path!, 'app', 'src', this.options.androidFlavor ?? 'main', 'res');
  }
}
