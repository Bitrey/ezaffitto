import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";

interface MarkerIconProps {
  title?: string;
  cost?: number;
}

export const MarkerIcon = ({ cost, title }: MarkerIconProps) =>
  L.divIcon({
    // insert markerIcon image in HTML
    html: `<div class="border-none">
      ${
        cost || title
          ? `<span class="absolute text-center w-max max-w-[12rem] overflow-hidden text-ellipsis left-1/2 transform -translate-x-1/2 -top-5 ${
              cost && cost > 1000
                ? "bg-red-500-transparent"
                : !cost || cost > 500
                ? "bg-blue-500-transparent" // se non c'è il costo, o 500 < costo < 1000
                : "bg-green-500-transparent"
            } p-[0.1rem] rounded text-white border-none">${
              // "€".repeat(
              //   Math.min(Math.max(Math.round(cost / 400), 1), 3)
              //   )}
              (title
                ? `<span style="font-size: 0.69rem;">${title}</span>${
                    cost ? "<br />" : ""
                  }`
                : "") + (cost ? "€" + cost : "")
            }
            </span>`
          : ""
      }
      <img src="${markerIcon}" alt="Marker icon" />
    </div>`,
    // iconUrl: markerIcon,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    className: "border-none"
  });
