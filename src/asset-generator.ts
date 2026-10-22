import type { InputAsset } from './input-asset';
import type { OutputAsset } from './output-asset';
import type { Project } from './project';

export abstract class AssetGenerator {
  constructor(public options: AssetGeneratorOptions) {}

  abstract generate(asset: InputAsset, project: Project): Promise<OutputAsset[]>;

  // The width of the logo on an Easy Mode splash of the given width
  protected logoSplashWidth(splashWidth: number): number {
    return this.options.logoSplashTargetWidth ?? Math.floor(splashWidth * (this.options.logoSplashScale ?? 0.2));
  }
}

export interface AssetGeneratorOptions {
  // Background color for icon generation
  iconBackgroundColor?: string;
  // Background color for icon generation for use in dark mode scenarios
  iconBackgroundColorDark?: string;
  // Background color for light mode splash generation
  splashBackgroundColor?: string;
  // Background color for dark mode splash generation
  splashBackgroundColorDark?: string;
  // Path to the web app manifest
  pwaManifestPath?: string;
  /** @deprecated Has no effect. Apple device screen sizes are always taken from a built-in list. */
  pwaNoAppleFetch?: boolean;
  // Width of the logo as a fraction of the splash when generating splashes from a logo. Default: 0.2
  logoSplashScale?: number;
  // Width of the logo in pixels on the splash when generating splashes from a logo (not used by default)
  logoSplashTargetWidth?: number;
  // Android product flavor name where generated assets will be created. Default: main
  androidFlavor?: string;
  // Resource name of the generated Android notification icon. Default: ic_notification
  androidNotificationIconName?: string;
}
