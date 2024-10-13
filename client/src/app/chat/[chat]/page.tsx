"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import ShinyText from "@/components/ui/shiny-text";
import ReactMarkdown from "react-markdown";
import { useSearchParams } from "next/navigation";

export default function Chat() {
  const loadingMessages = ["Thinking", "Analyzing", "Generating", "Processing"];

  const [isLoading, setIsLoading] = useState(false);

  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<
    Array<{ role: string; content: string }>
  >([]);

  useEffect(() => {
    const initialMessage = searchParams.get("initialMessage");
    if (initialMessage && messages.length === 0) {
      setMessages([
        { role: "bot", content: "Hello! How can I assist you today?" },
        { role: "user", content: initialMessage },
      ]);
      handleSend(initialMessage, true);
    }
  }, [searchParams, messages]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (message = input, isInitial = false) => {
    if (message.trim()) {
      if (!isInitial) {
        setMessages((prev) => [...prev, { role: "user", content: message }]);
      }

      setInput("");
      setIsLoading(true);
      setIsStreaming(true);

      try {
        const response = await fetch(
          `http://localhost:8787/?text=${encodeURIComponent(message)}`,
          {
            method: "GET",
          }
        );
        if (!response.body) throw new Error("ReadableStream not supported");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = "";

        setMessages((prev) => [...prev, { role: "bot", content: "" }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          fullResponse += chunk;
          setMessages((prev) => [
            ...prev.slice(0, -1),
            { role: "bot", content: fullResponse },
          ]);
        }
      } catch (error) {
        console.error("Error fetching response:", error);
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            content: "Sorry, I encountered an error. Please try again.",
          },
        ]);
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
      }
    }
  };

  return (
    <>
      <header className="flex justify-between items-center p-4 w-full">
        <div className="flex items-center">
          <Link href={"/"}>
            <Image src="/logo.png" alt="U-Plan Logo" width={40} height={40} />
          </Link>
        </div>
        <Link href={"/chat"}>
          <h1 className="text-3xl font-bold tracking-tight">u-plan</h1>
        </Link>
        <nav>
          <ul className="flex">
            <Link href="/">
              <Button variant={"link"}>Home</Button>
            </Link>{" "}
            <Link href="/demo/85281">
              <Button variant={"link"}>Demo</Button>
            </Link>{" "}
          </ul>
        </nav>
      </header>
      <main className="flex-grow h-[80vh]">
        <ScrollArea className="h-full w-full p-4" ref={scrollAreaRef}>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              } mb-4`}
            >
              <div
                className={`flex items-center ${
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <Avatar className="w-8 h-8 m-2">
                  {message.role === "bot" ? (
                    <AvatarImage src="/logo.png" alt="Bot" />
                  ) : (
                    <AvatarImage
                      src="https://randomuser.me/api/portraits/men/1.jpg"
                      alt="User"
                    />
                  )}
                </Avatar>
                <div
                  className={`rounded-full px-4 py-2 text-sm break-words ${
                    message.role === "user"
                      ? "bg-gray-700 text-white"
                      : "bg-gray-100"
                  }`}
                  style={{ width: "auto", maxWidth: "90%" }}
                >
                  {message.role === "user" ? (
                    message.content
                  ) : (
                    <ReactMarkdown className="gap-1">
                      {message.content}
                    </ReactMarkdown>
                  )}
                  {isStreaming &&
                    index === messages.length - 1 &&
                    message.content === "" && (
                      <ShinyText
                        className="text-sm px-0"
                        sentences={loadingMessages}
                      />
                    )}
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      </main>
      <footer className="p-4 px-12">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex w-full space-x-2"
        >
          <Input
            placeholder="Help me smartly plan this city."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "..." : "Send"}
          </Button>
        </form>
      </footer>
    </>
  );
}
