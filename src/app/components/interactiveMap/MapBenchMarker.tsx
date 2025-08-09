import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";

const BenchMarkerComponent = () => (
  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-green-500 bg-white text-xl shadow-lg">
    <img
      src="/images/bench2.svg"
      color="white"
      alt="bench"
      className="h-6 w-6"
    />
  </div>
);

export const createReactIcon = (component?: React.ReactElement) => {
  const html = renderToStaticMarkup(component || <BenchMarkerComponent />);
  return L.divIcon({
    html,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    className: "custom-react-icon",
  });
};
