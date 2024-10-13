import React from "react";
import { Dock, DockIcon } from "./dock";
import {
  Building,
  Home,
  Map,
  MessageCircle,
  TreePine,
  Waves,
} from "lucide-react";
import Link from "next/link";

export type IconProps = React.HTMLAttributes<SVGElement>;

export function ViewDock() {
  return (
    <Dock direction="bottom" className="mb-8">
      <DockIcon className="bg-gray-700">
        <Link href="/api/ndbi">
          <Building className="size-5 text-white" />
        </Link>
      </DockIcon>
      <DockIcon className="bg-gray-700">
        <Link href="/api/ndvi">
          <TreePine className="size-5 text-green-500" />
        </Link>
      </DockIcon>
      <DockIcon className="bg-gray-700">
        <Link href="/api/ndwi">
          <Waves className="size-5 text-blue-500" />
        </Link>
      </DockIcon>
    </Dock>
  );
}
