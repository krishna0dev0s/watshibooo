"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";

export function LearningSearch({ onSearch, isLoading }) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-3xl mx-auto mb-8">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder="What do you want to learn? (e.g., React, Python, Web Design...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-border/50 bg-background/70 text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none transition-colors"
            disabled={isLoading}
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading || !searchQuery.trim()}
          className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Search Videos
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
