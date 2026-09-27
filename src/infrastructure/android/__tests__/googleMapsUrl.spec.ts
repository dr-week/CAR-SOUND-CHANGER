import { describe, expect, it } from "vitest";
import { googleMapsUrl } from "../googleMapsUrl";

describe("Google Maps handoff", () => {
  it("opens Maps without inventing a destination", () => {
    expect(googleMapsUrl("  ")).toBe("https://www.google.com/maps/");
  });
  it("encodes destinations as data, not extra URL parameters", () => {
    const url = new URL(googleMapsUrl(" Café & Park #1 "));
    expect(url.hostname).toBe("www.google.com");
    expect(url.searchParams.get("destination")).toBe("Café & Park #1");
    expect(url.searchParams.get("travelmode")).toBe("driving");
  });
});
