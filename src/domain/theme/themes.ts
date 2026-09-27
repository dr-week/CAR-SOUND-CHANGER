/**
 * Automotive Cockpit Typography & Color Themes
 * Research-backed font pairings and accent tokens for glanceable vehicle displays.
 */
export interface CockpitTheme {
  id: string;
  name: string;
  subtitle: string;
  sansFont: string;
  monoFont: string;
  accentColor: string;
  accentGlow: string;
}

export const COCKPIT_THEMES: CockpitTheme[] = [
  {
    id: "german-precision",
    name: "Precision GT",
    subtitle: "Inter + JetBrains Mono",
    sansFont: "'Inter', system-ui, -apple-system, sans-serif",
    monoFont: "'JetBrains Mono', monospace",
    accentColor: "#d9ff78",
    accentGlow: "rgba(217, 255, 120, 0.28)",
  },
  {
    id: "highway-heritage",
    name: "Highway DIN",
    subtitle: "Barlow + Share Tech",
    sansFont: "'Barlow', system-ui, sans-serif",
    monoFont: "'Share Tech Mono', monospace",
    accentColor: "#e7bf76",
    accentGlow: "rgba(231, 191, 118, 0.28)",
  },
  {
    id: "hypercar-cyber",
    name: "Cyber EV",
    subtitle: "Jakarta + Space Mono",
    sansFont: "'Plus Jakarta Sans', system-ui, sans-serif",
    monoFont: "'Space Mono', monospace",
    accentColor: "#00f2fe",
    accentGlow: "rgba(0, 242, 254, 0.28)",
  },
  {
    id: "industrial-tech",
    name: "Industrial Tech",
    subtitle: "Source Sans + IBM Plex",
    sansFont: "'Source Sans 3', system-ui, sans-serif",
    monoFont: "'IBM Plex Mono', monospace",
    accentColor: "#f39784",
    accentGlow: "rgba(243, 151, 132, 0.28)",
  },
  {
    id: "nordic-minimal",
    name: "Nordic Minimal",
    subtitle: "Outfit + Red Hat",
    sansFont: "'Outfit', system-ui, sans-serif",
    monoFont: "'Red Hat Mono', monospace",
    accentColor: "#a9c8ff",
    accentGlow: "rgba(169, 200, 255, 0.28)",
  },
];
