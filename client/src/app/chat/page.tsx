"use client";

import { useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { HandHelping, InspectionPanel, Waves } from "lucide-react";
import { LinkDialog } from "@/components/ui/link-dialog";
import { useRouter } from "next/navigation";
import { v4 as uuid } from "uuid";

export default function Home() {
  const [input, setInput] = useState("");
  const router = useRouter();

  const handleFaqClick = (question: string) => {
    setInput(question);
  };
  const handleSend = () => {
    if (input.trim()) {
      const id = uuid();
      router.push(`/chat/${id}?initialMessage=${encodeURIComponent(input)}`);
    }
  };

  return (
    <>
      <header className="flex justify-center items-center p-4">
        <div className="flex items-center">
          <Link href={"/"}>
            <Image src="/logo.png" alt="U-Plan Logo" width={40} height={40} />
          </Link>
        </div>
        <div className="flex items-center justify-between w-full">
          <Link href={"/chat"}>
            <h1 className="text-3xl font-bold tracking-tight">u-plan</h1>
          </Link>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link href="/">
                  <Button variant="link">Home</Button>
                </Link>
              </li>
              <li>
                <Link href="/demo/85281">
                  <Button variant="link">Demo</Button>
                </Link>
              </li>
            </ul>
          </nav>
        </div>

      </header>
      <main className="flex-grow h-[80vh]">
        <div className="flex flex-col items-center justify-center mt-44">
          <h1 className="font-bold text-7xl tracking-tight mb-8">u-plan</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex w-full max-w-2xl space-x-2 mb-8"
          >
            <Input
              placeholder="Help me smartly plan this city."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-grow w-full"
            />
            <Button type="submit">Send</Button>
            <LinkDialog />
          </form>
          <div className="flex flex-row space-x-2 my-4">
            <div
              className="rounded-full bg-gray-100 p-4 py-2 text-sm text-black font-light cursor-pointer hover:bg-gray-200"
              onClick={() =>
                handleFaqClick(
                  "Can you show me high-risk zones for heat in Tempe - 85281?"
                )
              }
            >
              <HandHelping className="inline mr-1 stroke-1 scale-x-[-1]" />
              Can you show me high-risk zones for heat in Tempe - 85281?
            </div>
            <div
              className="rounded-full bg-gray-100 p-4 py-2 text-sm text-black font-light cursor-pointer hover:bg-gray-200"
              onClick={() =>
                handleFaqClick(
                  "What materials should I use in areas with low NDWI to mitigate water stress?"
                )
              }
            >
              <Waves className="inline mr-1 stroke-1 scale-x-[-1] size-4" />
              What materials should I use in areas with low NDWI to mitigate
              water stress?
            </div>
          </div>
          <div
            className="rounded-full bg-gray-100 p-4 py-2 text-sm text-black font-light cursor-pointer hover:bg-gray-200"
            onClick={() =>
              handleFaqClick(
                "Can you recommend a material based on the UHI index and albedo data?"
              )
            }
          >
            <InspectionPanel className="inline mr-1 stroke-1 scale-x-[-1] size-4" />
            Can you recommend a material based on the UHI index and albedo data?
          </div>
        </div>
      </main>
    </>
  );
}
