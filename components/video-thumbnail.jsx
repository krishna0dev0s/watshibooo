"use client";

import { useState } from "react";
import { PlayCircle, Clock, User } from "lucide-react";

export function VideoThumbnail({ video, onClick, isSelected }) {
  return (
    <div
      onClick={() => onClick(video)}
      className={`cursor-pointer group relative overflow-hidden rounded-xl transition-all duration-300 ${
        isSelected
          ? "ring-2 ring-primary shadow-lg shadow-primary/50"
          : "hover:shadow-lg hover:scale-[1.02]"
      }`}
    >
      {/* Thumbnail Image */}
      <div className="relative w-full aspect-video bg-muted overflow-hidden">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />

        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <PlayCircle className="w-16 h-16 text-white drop-shadow-lg" />
        </div>

        {/* Duration Badge */}
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-semibold px-2 py-1 rounded">
            {video.duration}
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="p-3 bg-background/70 backdrop-blur border border-border/50">
        <h3 className="font-semibold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {video.title}
        </h3>

        <div className="mt-2 space-y-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <User className="w-3 h-3" />
            <span className="line-clamp-1">{video.channel}</span>
          </div>

          {video.views && (
            <div className="text-xs text-muted-foreground">
              {video.views} views
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
