"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import PixelBlast from "./PixelBlast";

const HeroSection = () => {
  const imageRef = useRef(null);
  useEffect(() => {
    const imageElement = imageRef.current;
    if (!imageElement) return;
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 100;
        if (scrollPosition > scrollThreshold) {
          imageElement.classList.add("scrolled");
        } else {
          imageElement.classList.remove("scrolled");
        }
    };
    // Always start with tilt (remove scrolled class on mount)
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <section className="w-full pt-8 pb-8 text-white relative overflow-hidden -mt-16">
      {/* PixelBlast Background */}
      <div className="absolute inset-0 -z-10" style={{ width: '100%', height: '250px', position: 'relative' }}>
        <PixelBlast
          variant="circle"
          pixelSize={6}
          color="#B19EEF"
          patternScale={3}
          patternDensity={1.2}
          pixelSizeJitter={0.5}
          enableRipples
          rippleSpeed={0.4}
          rippleThickness={0.12}
          rippleIntensityScale={1.5}
          liquid
          liquidStrength={0.12}
          liquidRadius={1.2}
          liquidWobbleSpeed={5}
          speed={0.6}
          edgeFade={0.25}
          transparent
        />
      </div>

      <div className="space-y-3 md:space-y-4 text-center container mx-auto px-4 relative z-10">
        {/* Headline */}
        <div className="space-y-3 md:space-y-4 hero-content">
          <div className="hero-title">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight metallic-text">
              Welcome to WatshiBo
              <br />
              <span className="metallic-blue">
                Your Ultimate AI-Powered Study Companion
              </span>
            </h1>
          </div>
          <div className="hero-subtitle">
            <p className="mt-2 md:mt-3 text-lg md:text-xl lg:text-2xl font-medium max-w-3xl mx-auto text-gray-100">
              Master interviews, craft standout resumes, and tailor cover letters.
              all powered by intelligent automation.
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2 md:pt-3 hero-buttons">
          <Button 
            asChild 
            size="lg" 
            className="px-8 transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <Link href="/dashboard">Get Started</Link>
          </Button>
          <Button 
            asChild 
            size="lg" 
            className="px-8 transition-all duration-300 hover:scale-105 hover:shadow-lg" 
            variant="outline"
          >
            <Link href="/dashboard">Learn More</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
