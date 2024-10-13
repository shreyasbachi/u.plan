"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import Link from "next/link";
import ShinyText from "@/components/ui/shiny-text";
import ReactMarkdown from "react-markdown";

export default function ChatPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", content: "Hello! How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const loadingMessages = ["Thinking", "Analyzing", "Generating", "Processing"];

  const handleSend = async () => {
    if (input.trim()) {
      const userMessage = { role: "user", content: input };
      setMessages((prev) => [...prev, userMessage]);

      setInput("");
      setIsLoading(true);
      setIsStreaming(true);

      try {
        const response = await fetch(
          `http://localhost:8787/?text=${encodeURIComponent(input)}`,
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
    <div>
      <Button
        className="fixed bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center  text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
      {isOpen && (
        <Card className="fixed bottom-20 right-4 w-[450px] h-[600px] flex flex-col">
          <CardHeader className="flex items-end py-1 flex-row justify-between">
            <h1 className="font-bold font-primary text-xl">U-Plan</h1>
            <Link href={"/chat"}>
              <Button variant={"link"} className="pr-0">
                Chat with my data{" "}
                <ArrowUpRight className="stroke-1 inline ml-1 size-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col justify-between h-full overflow-hidden py-4">
            <ScrollArea className="h-full w-full" ref={scrollAreaRef}>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  } mb-4`}
                >
                  <div
                    className={`flex items-start ${
                      message.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <Avatar className="w-8 h-8 m-2">
                      {message.role === "bot" ? (
                        <AvatarImage src="/logo.png" alt="Bot" />
                      ) : (
                        <AvatarImage
                          src="https://randomuser.me/api/portraits/men/18.jpg"
                          alt="User"
                        />
                      )}
                    </Avatar>
                    <div
                      className={`rounded-lg p-2 text-sm break-words ${
                        message.role === "user"
                          ? "bg-gray-400 text-white"
                          : "bg-gray-200"
                      }`}
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
          </CardContent>
          <CardFooter className="">
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
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
