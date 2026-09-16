import type { VehicleProfile } from "./types";

export const CAR_PROFILES = {
  brezza: {
    id: "brezza",
    name: "Suzuki Brezza 2021",
    cylinders: 4,
    gears: 5,
    idleRpm: 800,
    redlineRpm: 6500,
    shiftRpm: 1500,
    baseTone: 58,
    topSpeedKph: 180,
  },
  mustang: {
    id: "mustang",
    name: "Ford Mustang V8",
    cylinders: 8,
    gears: 6,
    idleRpm: 750,
    redlineRpm: 7000,
    shiftRpm: 2800,
    baseTone: 42,
    topSpeedKph: 240,
  },
  porsche: {
    id: "porsche",
    name: "Porsche Flat-6",
    cylinders: 6,
    gears: 7,
    idleRpm: 850,
    redlineRpm: 7800,
    shiftRpm: 3000,
    baseTone: 65,
    topSpeedKph: 280,
  },
  f1: {
    id: "f1",
    name: "Formula V12",
    cylinders: 12,
    gears: 8,
    idleRpm: 2500,
    redlineRpm: 12000,
    shiftRpm: 7000,
    baseTone: 95,
    topSpeedKph: 360,
  },
} satisfies Record<string, VehicleProfile>;

export type ProfileId = keyof typeof CAR_PROFILES;
export function isProfileId(value: string): value is ProfileId {
  return Object.hasOwn(CAR_PROFILES, value);
}
