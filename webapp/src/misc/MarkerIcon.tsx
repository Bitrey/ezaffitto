import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";

export const MarkerIcon = L.icon({
  iconUrl: markerIcon,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
