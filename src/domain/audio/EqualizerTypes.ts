export type EqualizerBands = {
  sub60: number; // 60 Hz (-12dB to +12dB)
  bass250: number; // 250 Hz (-12dB to +12dB)
  mid1k: number; // 1000 Hz (-12dB to +12dB)
  presence4k: number; // 4000 Hz (-12dB to +12dB)
  treble16k: number; // 16000 Hz (-12dB to +12dB)
};

export type EqualizerPresetName =
  | "Flat"
  | "Rock"
  | "Pop"
  | "Jazz"
  | "Electronic"
  | "Bass Boost"
  | "Vocal";

export const EQUALIZER_PRESETS: Record<EqualizerPresetName, EqualizerBands> = {
  Flat: { sub60: 0, bass250: 0, mid1k: 0, presence4k: 0, treble16k: 0 },
  Rock: { sub60: 4, bass250: 2, mid1k: -1, presence4k: 3, treble16k: 5 },
  Pop: { sub60: -1, bass250: 2, mid1k: 5, presence4k: 2, treble16k: -1 },
  Jazz: { sub60: 3, bass250: 1, mid1k: -1, presence4k: 2, treble16k: 3 },
  Electronic: { sub60: 5, bass250: 3, mid1k: 0, presence4k: 2, treble16k: 4 },
  "Bass Boost": { sub60: 8, bass250: 5, mid1k: 1, presence4k: 0, treble16k: 0 },
  Vocal: { sub60: -2, bass250: 1, mid1k: 5, presence4k: 3, treble16k: -1 },
};
