"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Paperclip } from "lucide-react";
import Link from "next/link";
import ShinyText from "@/components/ui/shiny-text";
import ReactMarkdown from "react-markdown";
import { useSearchParams } from "next/navigation";
import { UploadButton } from "@/utils/uploadthing";
import { toast } from "sonner";

const Blobs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
    <div className="absolute -left-1/4 -top-1/4 w-1/2 h-1/2 rounded-full bg-orange-300 opacity-30 blur-3xl" />
    <div className="absolute -right-1/4 -bottom-1/4 w-1/2 h-1/2 rounded-full bg-orange-300 opacity-30 blur-3xl" />
  </div>
);

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

        setMessages((prev) => [
          ...prev,
          { role: "bot", content: "Loading..." },
        ]);

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
        <Blobs />
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
                  className={`rounded-lg px-4 py-2 text-sm break-words ${
                    message.role === "user" ? "bg-black text-white" : "bg-white"
                  }`}
                  style={{ width: "80%", overflowWrap: "break-word" }}
                >
                  {isLoading &&
                  message.role === "bot" &&
                  index === messages.length - 1 ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  ) : message.role === "user" ? (
                    message.content
                  ) : (
                    <ReactMarkdown className="gap-1 prose prose-sm max-w-none">
                      {message.content}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      </main>
      <footer className="p-4 flex space-x-1">
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
        <UploadButton
          content={{
            button: ({ state }: any) => (
              <div
                className="rounded-full bg-transparent hover:bg-accent hover:text-accent-foreground w-10 h-10 flex items-center justify-center"
                data-state={state}
              >
                <label
                  data-ut-element="button"
                  data-state={state}
                  className="cursor-pointer"
                >
                  <input className="hidden" />
                  {state === "readying" ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Paperclip className="h-5 w-5 stroke-1 text-black" />
                  )}
                </label>
                <div
                  data-ut-element="allowed-content"
                  data-state={state}
                  className="hidden"
                >
                  Allowed content text
                </div>
              </div>
            ),
          }}
          className="ut-button:bg-transparent ut-button:hover:bg-accent ut-button:hover:text-accent-foreground ut-button:w-full ut-button:mx-0 ut-button:h-10 ut-button:rounded-full ut-button:text-sm ut-allowed-content:hidden ut-button:px-3 ut-button:py-2 ut-button:focus:outline-none ut-button:focus:ring-0"
          endpoint="pdfUploader"
          onClientUploadComplete={(res) => {
            fetch("/api/content/pdf", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ url: res[0].appUrl }),
            })
              .then((response) => response.json())
              .then((data) => {
                console.log("PDF processing result:", data);
                toast.success("Upload Completed");
              })
              .catch((error) => {
                console.error("Error processing PDF:", error);
                toast.error("Error processing PDF");
              });
          }}
          onUploadError={(error: Error) => {
            toast.error(`ERROR! ${error.message}`);
          }}
        />
      </footer>
    </>
  );
}
