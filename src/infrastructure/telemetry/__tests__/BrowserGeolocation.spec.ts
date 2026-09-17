import { afterEach, describe, expect, it, vi } from "vitest";
import { BrowserGeolocation, calculateHaversineDistanceMeters } from "../BrowserGeolocation";
import type { TelemetryStatus } from "../../../application/ports/TelemetryStatus";

describe("BrowserGeolocation", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("reports unavailable if navigator.geolocation is not supported", () => {
    vi.stubGlobal("navigator", {});
    const onSpeed = vi.fn();
    const onStatus = vi.fn();
    const geo = new BrowserGeolocation(onSpeed, onStatus);

    geo.start();

    expect(onStatus).toHaveBeenCalledWith("unavailable");
    expect(onSpeed).not.toHaveBeenCalled();
  });

  it("reports denied if user denies geolocation permission", () => {
    const mockWatch = vi.fn((_success, error) => {
      error({ code: 1, PERMISSION_DENIED: 1 });
      return 101;
    });
    vi.stubGlobal("navigator", {
      geolocation: {
        watchPosition: mockWatch,
        clearWatch: vi.fn(),
      },
    });

    const statuses: TelemetryStatus[] = [];
    const geo = new BrowserGeolocation(vi.fn(), (s) => statuses.push(s));
    geo.start();

    expect(statuses).toContain("denied");
  });

  it("extracts speed in km/h and transitions to active on valid position fix", () => {
    let watchSuccessCallback: (pos: any) => void = () => {};
    const mockWatch = vi.fn((success) => {
      watchSuccessCallback = success;
      return 42;
    });
    const mockClear = vi.fn();

    vi.stubGlobal("navigator", {
      geolocation: {
        watchPosition: mockWatch,
        clearWatch: mockClear,
      },
    });

    const speeds: number[] = [];
    const statuses: TelemetryStatus[] = [];
    const geo = new BrowserGeolocation(
      (speed) => speeds.push(speed),
      (status) => statuses.push(status),
    );

    geo.start();

    // 15 m/s = 54 km/h
    watchSuccessCallback({
      coords: { latitude: 12.9716, longitude: 77.5946, speed: 15 },
      timestamp: Date.now(),
    });

    expect(statuses).toContain("active");
    expect(speeds).toEqual([54]);

    geo.stop();
    expect(mockClear).toHaveBeenCalledWith(42);
    expect(statuses[statuses.length - 1]).toBe("inactive");
  });

  it("computes speed from Haversine distance when coords.speed is null", () => {
    let watchSuccessCallback: (pos: any) => void = () => {};
    vi.stubGlobal("navigator", {
      geolocation: {
        watchPosition: vi.fn((success) => {
          watchSuccessCallback = success;
          return 99;
        }),
        clearWatch: vi.fn(),
      },
    });

    const speeds: number[] = [];
    const geo = new BrowserGeolocation((speed) => speeds.push(speed), vi.fn());
    geo.start();

    const t0 = 1000000;
    // Fix 1
    watchSuccessCallback({
      coords: { latitude: 12.9716, longitude: 77.5946, speed: null },
      timestamp: t0,
    });
    expect(speeds.length).toBe(0);

    // Fix 2, 2 seconds later at roughly 55 meters distance (~100 km/h)
    watchSuccessCallback({
      coords: { latitude: 12.9721, longitude: 77.5946, speed: null },
      timestamp: t0 + 2000,
    });

    expect(speeds.length).toBe(1);
    expect(speeds[0]).toBeGreaterThan(80);
    expect(speeds[0]).toBeLessThan(120);

    geo.stop();
  });

  it("correctly calculates Haversine distance in meters", () => {
    // Distance between London (51.5074, -0.1278) and Paris (48.8566, 2.3522) ~ 343 km
    const dist = calculateHaversineDistanceMeters(51.5074, -0.1278, 48.8566, 2.3522);
    expect(dist).toBeGreaterThan(340000);
    expect(dist).toBeLessThan(346000);
  });
});
