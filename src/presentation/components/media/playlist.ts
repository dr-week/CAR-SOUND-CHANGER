export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  number: string;
  duration: number; // in seconds
}

export const PLAYLIST: Track[] = [
  { id: "1", title: "Midnight City", artist: "M83", album: "Hurry Up, We're Dreaming", number: "07", duration: 243 },
  { id: "2", title: "Nightcall", artist: "Kavinsky", album: "OutRun", number: "02", duration: 259 },
  { id: "3", title: "Genesis", artist: "Justice", album: "†", number: "01", duration: 234 },
  { id: "4", title: "Starboy", artist: "The Weeknd ft. Daft Punk", album: "Starboy", number: "03", duration: 230 },
  { id: "5", title: "Resonance", artist: "HOME", album: "Odyssey", number: "05", duration: 212 },
];
