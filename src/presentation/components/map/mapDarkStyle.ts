export const mapDarkStyle: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#111613" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#89918b" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0b0f0d" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1c241f" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#2a362e" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#080c0a" }] },
];
