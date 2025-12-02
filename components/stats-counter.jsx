"use client";

import { useEffect, useRef, useState } from "react";

export function StatsCounter({ stat, label }) {
  const [displayValue, setDisplayValue] = useState("0");
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => {
      if (counterRef.current) {
        observer.unobserve(counterRef.current);
      }
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    // Extract number and suffix from stat (e.g., "50+" -> 50, "+")
    const match = stat.match(/(\d+)(.*)/);
    if (!match) {
      setDisplayValue(stat);
      return;
    }

    const targetNumber = parseInt(match[1], 10);
    const suffix = match[2];

    let currentNumber = 0;
    const duration = 2000; // 2 seconds
    const increment = targetNumber / (duration / 50);
    const startTime = Date.now();

    const animateCounter = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      currentNumber = Math.floor(progress * targetNumber);
      setDisplayValue(currentNumber + suffix);

      if (progress < 1) {
        requestAnimationFrame(animateCounter);
      } else {
        setDisplayValue(stat);
      }
    };

    animateCounter();
  }, [isVisible, stat]);

  return (
    <div
      ref={counterRef}
      className="flex flex-col items-center justify-center text-center space-y-4 bg-background/70 backdrop-blur rounded-2xl p-8 border border-muted/50 hover:border-primary/30 hover:bg-background hover:shadow-lg transition-all duration-300 ease-out group"
    >
      <h3 className="text-4xl md:text-5xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors">
        {displayValue}
      </h3>
      <p className="text-muted-foreground text-base leading-snug font-medium">
        {label}
      </p>
    </div>
  );
}
