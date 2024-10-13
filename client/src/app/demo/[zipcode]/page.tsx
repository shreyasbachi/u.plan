"use client";
import React, { useState, useEffect, useRef } from "react";
import mapboxgl, { Popup } from "mapbox-gl";
import { Feature, Point } from "geojson";
import ReactDOM from "react-dom";
import { X, Search, ZoomIn, ZoomOut, LocateFixed } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { MapDock } from "@/components/ui/map-dock";
import ChatPopup from "@/components/ui/chat-popup";
import ShinyText from "@/components/ui/shiny-text";
import { useParams } from "next/navigation";
import jsonData from "./ndvi_85281.json";
import nwviData from "./ndwi_85281.json";
import jsonData2 from "./ndvi_85004.json";
import nwviData2 from "./ndwi_85004.json";
import jsonData3 from "./ndvi_85248.json";
import nwviData3 from "./ndwi_85248.json";
import { ViewDock } from "@/components/ui/view-dock";
import MapInfoCards from "@/components/ui/map-info-cards";

const Demo = () => {
  const loadingSentences = [
    "Thinking",
    "Analyzing heat zones",
    "Calculating temperature differences",
    "Preparing data visualization",
  ];
  const params = useParams();

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  useEffect(() => {
    // Check if there's a zipcode in the URL params
    const urlZipcode = params.zipcode;
    if (urlZipcode && typeof urlZipcode === "string") {
      setZipcode(urlZipcode);
    }
  }, [params.zipcode]);

  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [zipcode, setZipcode] = useState("");
  const [popupInfo, setPopupInfo] = useState<{
    coordinates: [number, number];
    temperature: number;
  } | null>(null);
  const [uhiIntensity, setUhiIntensity] = useState<string>("");

  const [focusedZipcode, setFocusedZipcode] = useState<string | null>(null);
  const [clickedPopupInfo, setClickedPopupInfo] = useState<{
    coordinates: [number, number];
    temperature: number;
    uhiIntensity: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    mapboxgl.accessToken =
      "pk.eyJ1IjoiZGhydXZiMjYiLCJhIjoiY20yNWgzMzc5MHFzdzJxcHB4NXJxOGhwbSJ9.CqsygG9VrHzcvjV3YGeVbg";

    if (mapContainerRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: initialCenter as [number, number],
        zoom: initialZoom,
        attributionControl: false,
        pitch: 55,
        bearing: -19.6,
        // container: "map",
        antialias: true,
      });

      mapRef.current.on("style.load", () => {
        const layers = mapRef.current?.getStyle()?.layers;
        const labelLayerId =
          layers?.find(
            (layer) => layer.type === "symbol" && layer.layout?.["text-field"]
          )?.id ?? undefined;

        mapRef.current?.addLayer(
          {
            id: "add-3d-buildings",
            source: "composite",
            "source-layer": "building",
            filter: ["==", "extrude", "true"],
            type: "fill-extrusion",
            minzoom: 15,
            paint: {
              "fill-extrusion-color": "#aaa",
              "fill-extrusion-height": [
                "interpolate",
                ["linear"],
                ["zoom"],
                15,
                0,
                15.05,
                ["get", "height"],
              ],
              "fill-extrusion-base": [
                "interpolate",
                ["linear"],
                ["zoom"],
                15,
                0,
                15.05,
                ["get", "min_height"],
              ],
              "heatmap-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],
                0,
                2,
                9,
                20,
                22,
                100,
              ],
              "heatmap-opacity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                7,
                1,
                9,
                0.5,
                22,
                0,
              ],
              "fill-extrusion-opacity": 0.6,
            },
          },
          labelLayerId
        );
      });

      mapRef.current.on("load", () => {
        setMapLoaded(true);
        setIsLoading(false);

        // mapRef.current?.addSource("urban-areas", {
        //   type: "geojson",
        //   data: "https://docs.mapbox.com/mapbox-gl-js/assets/ne_50m_urban_areas.geojson",
        // });

        // mapRef.current?.addLayer({
        //   id: "urban-areas-fill",
        //   type: "fill",
        //   slot: "middle",
        //   source: "urban-areas",
        //   layout: {},
        //   paint: {
        //     "fill-color": "#ffffff",
        //     "fill-opacity": 0.4,
        //   },
        // });
      });
      mapRef.current.on("zoom", () => {
        const zoom = mapRef.current?.getZoom();
        mapRef.current?.setPaintProperty("heatmap-layer", "heatmap-radius", [
          "interpolate",
          ["linear"],
          ["zoom"],
          0,
          2,
          9,
          20,
          22,
          100,
        ]);
        mapRef.current?.setPaintProperty("heatmap-layer", "heatmap-opacity", [
          "interpolate",
          ["linear"],
          ["zoom"],
          7,
          1,
          9,
          0.5,
          22,
          0,
        ]);
      });
    }

    return () => {
      mapRef.current?.remove();
    };
  }, []);

  const handleZipcodeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Fetch zipcode coordinates
      const geocodingResponse = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${zipcode}.json?access_token=${mapboxgl.accessToken}&types=postcode`
      );
      const geocodingData = await geocodingResponse.json();

      if (geocodingData.features && geocodingData.features.length > 0) {
        const [lng, lat] = geocodingData.features[0].center;
        mapRef.current?.flyTo({
          center: [lng, lat],
          zoom: 12,
        });

        // Fetch UHI data for the entered zipcode
        const uhiResponse = await fetch(
          `http://localhost:3001/uhi?zip_code=${zipcode}`
        );

        if (!uhiResponse.ok) {
          throw new Error(`HTTP error! status: ${uhiResponse.status}`);
        }

        const uhiData = await uhiResponse.json();

        if (!uhiData.uhi_values || !Array.isArray(uhiData.uhi_values)) {
          throw new Error("Invalid data format received from API");
        }

        const points: Feature<Point>[] = uhiData.uhi_values.map(
          ({ coordinates, temperature }: any) => ({
            type: "Feature",
            properties: {
              temperature,
              uhiIntensity: getUHIIntensity(temperature),
            },
            geometry: {
              type: "Point",
              coordinates,
            },
          })
        );

        // Add or update the heatmap source and layer
        if (mapRef.current) {
          const useAlternateData = zipcode === "85004" || zipcode === "85248";
          const ndviDataset = useAlternateData
            ? zipcode === "85248"
              ? jsonData3
              : jsonData2
            : jsonData;
          const ndwiDataset = useAlternateData
            ? zipcode === "85248"
              ? nwviData3
              : nwviData2
            : nwviData;

          const ndwiPoints: Feature<Point>[] = ndwiDataset
            .filter((point) => point.ndwi !== null)
            .map(({ coordinates, ndwi }) => ({
              type: "Feature",
              properties: {
                ndwi,
              },
              geometry: {
                type: "Point",
                coordinates: [coordinates[1], coordinates[0]],
              },
            }));
          // Process hardcoded NDVI data
          const ndviPoints: Feature<Point>[] = ndviDataset
            .filter((point) => point.ndvi !== null)
            .map(({ coordinates, ndvi }) => ({
              type: "Feature",
              properties: {
                ndvi,
              },
              geometry: {
                type: "Point",
                coordinates: [coordinates[1], coordinates[0]],
              },
            }));

          // Calculate overall green score
          const overallGreenScore = 30;

          console.log(overallGreenScore);

          if (mapRef.current) {
            if (mapRef.current.getSource("ndvi-points")) {
              (
                mapRef.current.getSource(
                  "ndvi-points"
                ) as mapboxgl.GeoJSONSource
              ).setData({
                type: "FeatureCollection",
                features: ndviPoints,
              });
            } else {
              mapRef.current.addSource("ndvi-points", {
                type: "geojson",
                data: {
                  type: "FeatureCollection",
                  features: ndviPoints,
                },
              });

              mapRef.current?.addLayer({
                id: "ndvi-layer",
                type: "heatmap",
                source: "ndvi-points",
                paint: {
                  // Adjust weight based on NDVI value
                  "heatmap-weight": [
                    "interpolate",
                    ["linear"],
                    ["get", "ndvi"],
                    -1,
                    0, // Minimum NDVI value
                    0,
                    0.5, // Neutral NDVI value
                    1,
                    1, // Maximum NDVI value
                  ],
                  // Increase intensity with zoom level
                  "heatmap-intensity": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    0,
                    1,
                    9,
                    3,
                  ],
                  // Use a color gradient representing vegetation health
                  "heatmap-color": [
                    "interpolate",
                    ["linear"],
                    ["heatmap-density"],
                    0,
                    "rgba(214, 247, 202, 0)", // Light green with transparency
                    0.2,
                    "rgba(14,255,0, 0.7)", // Lighter green
                    0.4,
                    "rgba(31,198,0, 0.8)", // Teal
                    0.6,
                    "rgba(8,144,0, 0.9)", // Light blue
                    0.8,
                    "rgba(10,93,0, 0.95)", // Dark blue
                    1,
                    "rgba(6,59,0, 1)", // Deep blue
                  ],
                  // Adjust radius based on zoom level
                  "heatmap-radius": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    0,
                    2,
                    9,
                    20,
                  ],
                  // Set a default opacity
                  "heatmap-opacity": 0.5,
                },
              });

              // Add click event listener for NDVI heatmap
              mapRef.current.on("click", "ndvi-layer", (e) => {
                if (e.features && e.features[0]) {
                  const ndvi = e.features[0].properties?.ndvi || 0;
                  const coordinates = e.lngLat;

                  new mapboxgl.Popup()
                    .setLngLat(coordinates)
                    .setHTML(`<strong>NDVI:</strong> ${ndvi.toFixed(2)}`)
                    .addTo(mapRef.current as mapboxgl.Map);
                }
              });

              if (mapRef.current.getSource("ndwi-points")) {
                (
                  mapRef.current.getSource(
                    "ndwi-points"
                  ) as mapboxgl.GeoJSONSource
                ).setData({
                  type: "FeatureCollection",
                  features: ndwiPoints,
                });
              } else {
                mapRef.current.addSource("ndwi-points", {
                  type: "geojson",
                  data: {
                    type: "FeatureCollection",
                    features: ndwiPoints,
                  },
                });

                mapRef.current?.addLayer({
                  id: "ndwi-layer",
                  type: "heatmap",
                  source: "ndwi-points",
                  paint: {
                    "heatmap-weight": [
                      "interpolate",
                      ["linear"],
                      ["get", "ndwi"],
                      -1,
                      0,
                      1,
                      1,
                    ],
                    "heatmap-intensity": [
                      "interpolate",
                      ["linear"],
                      ["zoom"],
                      0,
                      1,
                      9,
                      3,
                    ],
                    "heatmap-color": [
                      "interpolate",
                      ["linear"],
                      ["heatmap-density"],
                      0,
                      "rgba(0, 0, 0, 0)",
                      0.2,
                      "rgba(135, 206, 235, 0.5)",
                      0.4,
                      "rgba(135, 206, 235, 0.7)",
                      0.6,
                      "rgba(135, 206, 235, 0.8)",
                      0.8,
                      "rgba(135, 206, 235, 0.9)",
                      1,
                      "rgba(135, 206, 235, 1)",
                    ],
                    "heatmap-radius": [
                      "interpolate",
                      ["linear"],
                      ["zoom"],
                      0,
                      2,
                      9,
                      20,
                    ],
                    "heatmap-opacity": 0.8,
                  },
                });

                // Add click event listener for NDWI heatmap
                mapRef.current.on("click", "ndwi-layer", (e) => {
                  if (e.features && e.features[0]) {
                    const ndwi = e.features[0].properties?.ndwi || 0;
                    const coordinates = e.lngLat;

                    new mapboxgl.Popup()
                      .setLngLat(coordinates)
                      .setHTML(`<strong>NDWI:</strong> ${ndwi.toFixed(2)}`)
                      .addTo(mapRef.current as mapboxgl.Map);
                  }
                });

                // Change cursor on hover for NDWI layer
                mapRef.current.on("mouseenter", "ndwi-layer", () => {
                  if (mapRef.current) {
                    mapRef.current.getCanvas().style.cursor = "pointer";
                  }
                });

                mapRef.current.on("mouseleave", "ndwi-layer", () => {
                  if (mapRef.current) {
                    mapRef.current.getCanvas().style.cursor = "";
                  }
                });

                // Change cursor on hover for NDVI layer
                mapRef.current.on("mouseenter", "ndvi-layer", () => {
                  if (mapRef.current) {
                    mapRef.current.getCanvas().style.cursor = "pointer";
                  }
                });
              }

              if (mapRef.current.getSource("heatmap-points")) {
                (
                  mapRef.current.getSource(
                    "heatmap-points"
                  ) as mapboxgl.GeoJSONSource
                ).setData({
                  type: "FeatureCollection",
                  features: points,
                });
              } else {
                mapRef.current?.addSource("heatmap-points", {
                  type: "geojson",
                  data: {
                    type: "FeatureCollection",
                    features: points,
                  },
                });

                mapRef.current?.addLayer({
                  id: "heatmap-layer",
                  type: "heatmap",
                  source: "heatmap-points",
                  paint: {
                    "heatmap-weight": [
                      "interpolate",
                      ["linear"],
                      ["get", "temperature"],
                      0,
                      0,
                      1,
                      1,
                    ],
                    "heatmap-intensity": [
                      "interpolate",
                      ["linear"],
                      ["zoom"],
                      0,
                      1,
                      9,
                      3,
                    ],
                    "heatmap-color": [
                      "interpolate",
                      ["linear"],
                      ["heatmap-density"],
                      0,
                      "rgba(33,102,172,0)",
                      0.2,
                      "rgb(103,169,207)",
                      0.4,
                      "rgb(209,229,240)",
                      0.6,
                      "rgb(253,219,199)",
                      0.8,
                      "rgb(239,138,98)",
                      1,
                      "rgb(255,0,0)",
                    ],
                    "heatmap-radius": [
                      "interpolate",
                      ["linear"],
                      ["zoom"],
                      0,
                      2,
                      9,
                      20,
                    ],
                    "heatmap-opacity": 0.8,
                  },
                });

                // Update click event listener for points
                mapRef.current.on("click", "heatmap-layer", (e) => {
                  if (e.lngLat && e.features && e.features[0]) {
                    const coordinates = e.lngLat.toArray() as [number, number];
                    const temperature =
                      e.features[0].properties?.temperature || 0;
                    const uhiIntensity =
                      e.features[0].properties?.uhiIntensity || "";
                    setClickedPopupInfo({
                      coordinates,
                      temperature,
                      uhiIntensity,
                    });

                    // Add zooming functionality here
                    mapRef.current?.flyTo({
                      center: coordinates,
                      zoom: 17, // Adjust this value to set the desired zoom level
                      duration: 1000, // Animation duration in milliseconds
                    });
                  }
                });

                // Change the cursor to a pointer when the mouse is over the points layer.
                mapRef.current.on("mouseenter", "heatmap-layer", () => {
                  if (mapRef.current) {
                    mapRef.current.getCanvas().style.cursor = "pointer";
                  }
                });

                mapRef.current.on("mouseleave", "heatmap-layer", () => {
                  if (mapRef.current) {
                    mapRef.current.getCanvas().style.cursor = "";
                  }
                });
              }

              setFocusedZipcode(zipcode);
            }
          }
        }
      }
    } catch (error) {
      console.error(
        "An error occurred while handling the zipcode submit:",
        error
      );
      toast.error("Oops! Couldn't find weather stations for this location.");
    } finally {
      setIsLoading(false);
    }
  };

  const getUHIIntensity = (temp: number) => {
    if (temp < 0.5) return "Low";
    if (temp < 2) return "Moderate";
    return "High";
  };

  const initialCenter = [-71.1167, 42.377]; // Harvard coordinates
  const initialZoom = 11;

  const handleCenter = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: initialCenter as [number, number],
        zoom: initialZoom,
        essential: true,
      });
    }
  };

  return (
    <main className="absolute inset-0">
      <div
        id="map-container"
        ref={mapContainerRef}
        className="h-full w-full bg-gray-300"
      ></div>
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 z-50">
          <ShinyText sentences={loadingSentences} />
        </div>
      )}
      <div className="absolute space-x-4 left-0 top-0 h-fit flex flex-row items-center justify-center px-4">
        <MapDock />
        <Button
          className=" bg-gray-700 hover:bg-slate-600"
          onClick={handleZoomOut}
          size="icon"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          className=" bg-gray-700 hover:bg-slate-600"
          onClick={handleZoomIn}
          size="icon"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          className=" bg-gray-700 hover:bg-slate-600"
          onClick={handleCenter}
          size="icon"
        >
          <LocateFixed className="h-4 w-4" />
        </Button>
      </div>

      <div className="absolute mt-4  justify-center top-4 items-center right-4 z-10 p-4  flex flex-col space-x-2 space-y-2">
        <form
          onSubmit={handleZipcodeSubmit}
          className="flex flex-row space-x-2"
        >
          <Input
            type="text"
            className="rounded-full"
            value={zipcode}
            onChange={(e) => setZipcode(e.target.value)}
            placeholder="Enter zipcode"
          />
          <Button type="submit">
            <Search className="size-4 mr-1 text-white" />
            Search
          </Button>
        </form>
        <ViewDock />
      </div>

      {popupInfo && (
        <CustomPopup
          mapRef={mapRef}
          longitude={clickedPopupInfo?.coordinates[0] ?? 0}
          latitude={clickedPopupInfo?.coordinates[1] ?? 0}
          temperature={clickedPopupInfo?.temperature ?? 0}
          onClose={() => setPopupInfo(null)}
          uhiIntensity={uhiIntensity}
        />
      )}
      {clickedPopupInfo && (
        <CustomPopup
          mapRef={mapRef}
          longitude={clickedPopupInfo.coordinates[0]}
          latitude={clickedPopupInfo.coordinates[1]}
          onClose={() => setClickedPopupInfo(null)}
          temperature={clickedPopupInfo.temperature}
          uhiIntensity={clickedPopupInfo.uhiIntensity}
        />
      )}
      <MapInfoCards />
      <ChatPopup />
    </main>
  );
};
interface CustomPopupProps {
  mapRef: React.RefObject<mapboxgl.Map | null>;
  longitude: number;
  latitude: number;
  temperature: number;
  uhiIntensity: string;
  onClose: () => void;
}

const CustomPopup: React.FC<CustomPopupProps> = ({
  mapRef,
  longitude,
  latitude,
  temperature,
  uhiIntensity,
  onClose,
}) => {
  const popupRef = useRef<Popup | null>(null);
  const [nearbyLandmarks, setNearbyLandmarks] = useState<string[]>([]);

  useEffect(() => {
    const fetchNearbyLandmarks = async () => {
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxgl.accessToken}&types=poi&limit=3`
        );
        const data = await response.json();
        const landmarks = data.features.map((feature: any) => feature.text);
        setNearbyLandmarks(landmarks);
      } catch (error) {
        console.error("Error fetching nearby landmarks:", error);
      }
    };

    fetchNearbyLandmarks();
  }, [longitude, latitude]);
  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current;

      const popupContent = (
        <div className=" w-[200px]">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-base font-semibold tracking-tight">
              {nearbyLandmarks.length > 0 ? nearbyLandmarks[0] : "Tempe, AZ"}
            </h3>
            <button onClick={onClose} className="text-black">
              <X size={15} />
            </button>
          </div>

          <div className="space-y-4">
            <section>
              <hr className="w-full my-2 border-t border-orange-500" />
              <h4 className="text-sm font-semibold text-gray-700 mb-1">
                Urban Heat Island (UHI)
              </h4>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs">UHI Intensity:</span>
                  <span
                    className={`text-xs font-semibold ${
                      uhiIntensity === "Low"
                        ? "text-green-500"
                        : uhiIntensity === "Moderate"
                        ? "text-yellow-500"
                        : "text-red-500"
                    }`}
                  >
                    {uhiIntensity}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Temperature:</span>
                  <span className="text-xs font-semibold text-yellow-500">
                    {temperature}°C
                  </span>
                </div>
              </div>
            </section>
            <section>
              <h4 className="text-sm font-semibold text-gray-700 mb-1">
                Nearby Landmarks
              </h4>
              <ul className="text-xs space-y-1">
                {nearbyLandmarks.length > 0 ? (
                  nearbyLandmarks.map((landmark, index) => (
                    <li key={index}>{landmark}</li>
                  ))
                ) : (
                  <li>N/A</li>
                )}
              </ul>
            </section>
          </div>
        </div>
      );

      const popupNode = document.createElement("div");
      ReactDOM.render(popupContent, popupNode);
      ``;

      popupRef.current = new Popup({
        closeButton: false,
        closeOnClick: false,
        className: "custom-mapboxgl-popup",
      })
        .setLngLat([longitude, latitude])
        .setDOMContent(popupNode)
        .addTo(map);
    }

    return () => {
      if (popupRef.current) {
        popupRef.current.remove();
      }
    };
  }, [mapRef, longitude, latitude, temperature, onClose, uhiIntensity]);

  return null;
};

export default Demo;
