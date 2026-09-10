export interface VehicleProfile { id: string; name: string; cylinders: number; gears: number; idleRpm: number; redlineRpm: number; shiftRpm: number; baseTone: number; }
export interface VehicleState { profile: VehicleProfile; rpm: number; gear: number; throttle: number; brake: number; speedKph: number; gpsSpeedKph: number | null; }
