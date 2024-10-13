"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ViewSelect() {
  const router = useRouter();
  const [selectedRoute, setSelectedRoute] = useState("");

  const handleRouteChange = (value: string) => {
    setSelectedRoute(value);
    router.push(`/api/${value}`);
  };

  return (
    <Select
      value={selectedRoute}
      onValueChange={(value) => {
        handleRouteChange(value);
      }}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a route" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ndbi">Tempe, AZ NDBI</SelectItem>
        <SelectItem value="ndvi">Tempe, AZ NDVI</SelectItem>
        <SelectItem value="ndwi">Tempe, AZ NDWI</SelectItem>
      </SelectContent>
    </Select>
  );
}
