import React, { useState, useEffect } from "react";

export default function ShinyText({
  sentences,
  className = "",
}: {
  sentences: string[];
  className?: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  // const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    const sentenceInterval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % sentences.length);
    }, 4000); // Change sentence every 4 seconds

    const dotInterval = setInterval(() => {
      // setDotCount((prevCount) => (prevCount + 1) % 4);
    }, 1000); // Change dot count every 1 second

    return () => {
      clearInterval(sentenceInterval);
      clearInterval(dotInterval);
    };
  }, [sentences]);

  return (
    <div
      className={`shiny-text-container bg-white rounded-lg px-4 py-2 text-sm ${className}`}
    >
      <p
        key={currentIndex}
        className="bg-shine-gradient text-sm bg-shine-size animate-shine bg-clip-text text-transparent"
      >
        {sentences[currentIndex]}
        {/* <span className="dots-animation">{".".repeat(dotCount)}</span> */}
      </p>
    </div>
  );
}
