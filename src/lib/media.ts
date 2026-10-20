import { mediaManifest, type MediaName } from "./media.generated";

export type { MediaName };

export const mediaInfo = (name: MediaName) => mediaManifest[name];

const base = (name: MediaName) => `/media/img/${name}`;

export const mediaSrc = (name: MediaName, width = 1440) => {
  const widths = mediaManifest[name].widths as readonly number[];
  const w = widths.find((x) => x >= width) ?? widths[widths.length - 1];
  return `${base(name)}/${w}.webp`;
};

export const mediaSrcSet = (name: MediaName) =>
  (mediaManifest[name].widths as readonly number[]).map((w) => `${base(name)}/${w}.webp ${w}w`).join(", ");

export const aspect = (name: MediaName) => {
  const m = mediaManifest[name];
  return m.w / m.h;
};
