import { useState } from "react";
import Link from "next/link";
import { Button } from "./button";
import { ArrowUpRight, Info } from "lucide-react";

export default function MapInfoCards() {
  const [activeCard, setActiveCard] = useState<string | null>(null);

  const cards = [
    {
      id: "uhi",
      title: "UHI (Urban Heat Island)",
      content:
        "UHI refers to urban areas being significantly warmer than surrounding rural areas due to human activities and urban infrastructure. It's calculated by comparing temperatures from nearby weather stations to determine the heat difference in a specific area.",
    },
    {
      id: "ndvi",
      title: "NDVI (Normalized Difference Vegetation Index)",
      content:
        "NDVI is a remote sensing index that measures vegetation health and density. It uses the difference between near-infrared (which vegetation strongly reflects) and red light (which vegetation absorbs) to quantify vegetation cover and vigor in an area.",
    },
    {
      id: "ndwi",
      title: "NDWI (Normalized Difference Water Index)",
      content:
        "NDWI is a satellite-derived index used to delineate open water features and enhance their presence in remotely-sensed digital imagery. It's calculated using near-infrared and green wavelengths and is particularly useful for monitoring changes in water content of leaves and water bodies.",
    },
  ];

  return (
    <div className="flex justify-between w-full">
      <div className="flex flex-col space-y-2 absolute left-4 top-4">
        {cards.map((card) => (
          <Button
            key={card.id}
            variant="outline"
            size="sm"
            onClick={() =>
              setActiveCard(activeCard === card.id ? null : card.id)
            }
          >
            <Info className="mr-2 h-4 w-4" />
            {card.title.split(" ")[0]}
          </Button>
        ))}
      </div>
      {activeCard && (
        <div className="max-w-sm p-4 bg-black border border-gray-200 rounded-lg shadow-sm absolute right-4 top-4">
          <h5 className="mb-2 text-lg font-semibold tracking-tight text-white dark:text-white">
            {cards.find((card) => card.id === activeCard)?.title}
          </h5>
          <p className="mb-3 font-normal text-sm text-gray-500 dark:text-gray-400">
            {cards.find((card) => card.id === activeCard)?.content}
          </p>
          <Link href="#">
            <Button variant="link" className=" bottom-4 left-4">
              Learn More
              <ArrowUpRight className="stroke-1 ml-1 size-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
