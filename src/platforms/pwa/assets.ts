import type { PwaOutputAssetTemplate } from '../../definitions';
import { AssetKind, Format, Platform } from '../../definitions';

export const PWA_48_PX_ICON: PwaOutputAssetTemplate = {
  platform: Platform.Pwa,
  kind: AssetKind.Icon,
  name: 'icon-48.png',
  format: Format.Png,
  width: 48,
  height: 48,
};
export const PWA_72_PX_ICON: PwaOutputAssetTemplate = {
  platform: Platform.Pwa,
  kind: AssetKind.Icon,
  name: 'icon-72.png',
  format: Format.Png,
  width: 72,
  height: 72,
};
export const PWA_96_PX_ICON: PwaOutputAssetTemplate = {
  platform: Platform.Pwa,
  kind: AssetKind.Icon,
  name: 'icon-96.png',
  format: Format.Png,
  width: 96,
  height: 96,
};
export const PWA_128_PX_ICON: PwaOutputAssetTemplate = {
  platform: Platform.Pwa,
  kind: AssetKind.Icon,
  name: 'icon-128.png',
  format: Format.Png,
  width: 128,
  height: 128,
};
export const PWA_192_PX_ICON: PwaOutputAssetTemplate = {
  platform: Platform.Pwa,
  kind: AssetKind.Icon,
  name: 'icon-192.png',
  format: Format.Png,
  width: 192,
  height: 192,
};
export const PWA_256_PX_ICON: PwaOutputAssetTemplate = {
  platform: Platform.Pwa,
  kind: AssetKind.Icon,
  name: 'icon-256.png',
  format: Format.Png,
  width: 256,
  height: 256,
};
export const PWA_512_PX_ICON: PwaOutputAssetTemplate = {
  platform: Platform.Pwa,
  kind: AssetKind.Icon,
  name: 'icon-512.png',
  format: Format.Png,
  width: 512,
  height: 512,
};
export const PWA_48_PX_MASKABLE_ICON: PwaOutputAssetTemplate = {
  platform: Platform.Pwa,
  kind: AssetKind.Icon,
  name: 'icon-maskable-48.png',
  format: Format.Png,
  width: 48,
  height: 48,
  maskable: true,
};
export const PWA_72_PX_MASKABLE_ICON: PwaOutputAssetTemplate = {
  platform: Platform.Pwa,
  kind: AssetKind.Icon,
  name: 'icon-maskable-72.png',
  format: Format.Png,
  width: 72,
  height: 72,
  maskable: true,
};
export const PWA_96_PX_MASKABLE_ICON: PwaOutputAssetTemplate = {
  platform: Platform.Pwa,
  kind: AssetKind.Icon,
  name: 'icon-maskable-96.png',
  format: Format.Png,
  width: 96,
  height: 96,
  maskable: true,
};
export const PWA_128_PX_MASKABLE_ICON: PwaOutputAssetTemplate = {
  platform: Platform.Pwa,
  kind: AssetKind.Icon,
  name: 'icon-maskable-128.png',
  format: Format.Png,
  width: 128,
  height: 128,
  maskable: true,
};
export const PWA_192_PX_MASKABLE_ICON: PwaOutputAssetTemplate = {
  platform: Platform.Pwa,
  kind: AssetKind.Icon,
  name: 'icon-maskable-192.png',
  format: Format.Png,
  width: 192,
  height: 192,
  maskable: true,
};
export const PWA_256_PX_MASKABLE_ICON: PwaOutputAssetTemplate = {
  platform: Platform.Pwa,
  kind: AssetKind.Icon,
  name: 'icon-maskable-256.png',
  format: Format.Png,
  width: 256,
  height: 256,
  maskable: true,
};
export const PWA_512_PX_MASKABLE_ICON: PwaOutputAssetTemplate = {
  platform: Platform.Pwa,
  kind: AssetKind.Icon,
  name: 'icon-maskable-512.png',
  format: Format.Png,
  width: 512,
  height: 512,
  maskable: true,
};

export const PWA_SPLASH: PwaOutputAssetTemplate = {
  platform: Platform.Pwa,
  kind: AssetKind.Splash,
  name: 'apple-splash.webp',
  format: Format.WebP,
  width: 2048,
  height: 2048,
};

export const ASSETS = {
  PWA_48_PX_ICON,
  PWA_72_PX_ICON,
  PWA_96_PX_ICON,
  PWA_128_PX_ICON,
  PWA_192_PX_ICON,
  PWA_256_PX_ICON,
  PWA_512_PX_ICON,
  PWA_48_PX_MASKABLE_ICON,
  PWA_72_PX_MASKABLE_ICON,
  PWA_96_PX_MASKABLE_ICON,
  PWA_128_PX_MASKABLE_ICON,
  PWA_192_PX_MASKABLE_ICON,
  PWA_256_PX_MASKABLE_ICON,
  PWA_512_PX_MASKABLE_ICON,
  PWA_SPLASH,
};

// Screen sizes in pixels and scale factor of iPhone, iPad and iPod touch models,
// taken from the "Device screen dimensions" table of the Apple Human Interface
// Guidelines (Layout). Apple removed that table from the live page in 2026,
// so this list is maintained by hand.
export const PWA_IOS_DEVICE_SIZES = [
  '2064x2752@2x', // iPad Pro 13-inch (M4, M5)
  '2048x2732@2x', // iPad Pro 12.9-inch, iPad Air 13-inch
  '1668x2420@2x', // iPad Pro 11-inch (M4, M5)
  '1668x2388@2x', // iPad Pro 11-inch (1st-4th generation)
  '1668x2224@2x', // iPad Pro 10.5-inch, iPad Air 10.5-inch
  '1640x2360@2x', // iPad Air 11-inch, iPad Air 10.9-inch, iPad 11-inch
  '1620x2160@2x', // iPad 10.2-inch
  '1536x2048@2x', // iPad Pro 9.7-inch, iPad Air 9.7-inch, iPad 9.7-inch, iPad mini 7.9-inch
  '1488x2266@2x', // iPad mini 8.3-inch
  '1320x2868@3x', // iPhone 18 Pro Max, iPhone 17 Pro Max, iPhone 16 Pro Max
  '1290x2796@3x', // iPhone 16 Plus, iPhone 15 Pro Max, iPhone 15 Plus, iPhone 14 Pro Max
  '1284x2778@3x', // iPhone 14 Plus, iPhone 13 Pro Max, iPhone 12 Pro Max
  '1260x2736@3x', // iPhone Air
  '1242x2688@3x', // iPhone 11 Pro Max, iPhone XS Max
  '1206x2622@3x', // iPhone 18 Pro, iPhone 17 Pro, iPhone 17, iPhone 16 Pro
  '1179x2556@3x', // iPhone 16, iPhone 15 Pro, iPhone 15, iPhone 14 Pro
  '1170x2532@3x', // iPhone 17e, iPhone 16e, iPhone 14, iPhone 13 Pro, iPhone 13, iPhone 12 Pro, iPhone 12
  '1125x2436@3x', // iPhone 11 Pro, iPhone XS, iPhone X
  '1080x2340@3x', // iPhone 13 mini, iPhone 12 mini
  '1080x1920@3x', // iPhone 8 Plus, iPhone 7 Plus, iPhone 6s Plus, iPhone 6 Plus
  '828x1792@2x', // iPhone 11, iPhone XR
  '750x1334@2x', // iPhone 8, iPhone 7, iPhone 6s, iPhone 6, iPhone SE 4.7-inch
  '640x1136@2x', // iPhone SE 4-inch, iPod touch (5th generation and later)
];
