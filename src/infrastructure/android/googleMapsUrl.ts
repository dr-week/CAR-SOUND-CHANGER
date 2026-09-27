/** Google owns route planning and guidance; this launcher only supplies a destination. */
export function googleMapsUrl(destination = ""): string {
  if (!destination.trim()) return "https://www.google.com/maps/";
  const url = new URL("https://www.google.com/maps/dir/");
  url.searchParams.set("api", "1");
  url.searchParams.set("destination", destination.trim());
  url.searchParams.set("travelmode", "driving");
  return url.toString();
}
