"use client";

import { useState } from "react";
import { Search, Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CompanySearch({ onJobSelect }) {
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [jobPosts, setJobPosts] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  const handleCompanyInputChange = async (e) => {
    const value = e.target.value;
    setCompanyName(value);

    if (value.trim().length > 0) {
      setSuggestionsLoading(true);
      try {
        const res = await fetch("/api/company-suggestions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: value }),
        });

        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error("Failed to fetch suggestions:", err);
      } finally {
        setSuggestionsLoading(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (company) => {
    setCompanyName(company);
    setShowSuggestions(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    setLoading(true);
    setError("");
    setJobPosts([]);
    setShowSuggestions(false);

    try {
      const res = await fetch("/api/company-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName }),
      });

      if (!res.ok) throw new Error("Failed to search company");

      const data = await res.json();
      setSelectedCompany(data.company.name);
      setJobPosts(data.company.jobPosts || []);
    } catch (err) {
      setError(err.message || "Failed to search company. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case "junior":
        return "bg-blue-500/20 text-blue-300";
      case "mid":
        return "bg-purple-500/20 text-purple-300";
      case "senior":
        return "bg-green-500/20 text-green-300";
      default:
        return "bg-gray-500/20 text-gray-300";
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Search Section */}
      <Card className="border border-border bg-card/80 backdrop-blur-md shadow-md hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find Companies & Job Openings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-2 relative">
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder="Enter company name (e.g., Google, Microsoft, Amazon)..."
                  value={companyName}
                  onChange={handleCompanyInputChange}
                  onFocus={() => companyName.trim().length > 0 && setShowSuggestions(true)}
                  className="bg-background/50 border-border focus:border-primary"
                  disabled={loading}
                  autoComplete="off"
                />

                {/* Suggestions Dropdown */}
                {showSuggestions && (suggestions.length > 0 || suggestionsLoading) && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                    {suggestionsLoading ? (
                      <div className="px-4 py-3 flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Finding companies...</span>
                      </div>
                    ) : (
                      suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full text-left px-4 py-2 hover:bg-primary/20 transition-colors flex items-center gap-2 border-b border-border/50 last:border-b-0"
                        >
                          <Search className="h-4 w-4 text-muted-foreground" />
                          <span>{suggestion}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading || !companyName.trim()}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </form>
        </CardContent>
      </Card>

      {/* Results Section */}
      {selectedCompany && jobPosts.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">{selectedCompany}</h2>
            <p className="text-muted-foreground">Found {jobPosts.length} job openings</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobPosts.map((job, index) => (
              <Card
                key={index}
                className="border border-border bg-card/80 backdrop-blur-md shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-primary group"
                onClick={() => onJobSelect({ company: selectedCompany, job })}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{job.title}</CardTitle>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="secondary" className={`${getLevelColor(job.level)}`}>
                          {job.level}
                        </Badge>
                        <Badge variant="outline">{job.type}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Key Requirements:</p>
                    <div className="flex flex-wrap gap-1">
                      {job.requirements?.slice(0, 3).map((req, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {req}
                        </Badge>
                      ))}
                      {job.requirements?.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{job.requirements.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Skills Needed:</p>
                    <div className="flex flex-wrap gap-1">
                      {job.skills?.slice(0, 2).map((skill, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {job.skills?.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{job.skills.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Button
                    className="w-full gap-2 mt-4 bg-primary hover:bg-primary/90 group-hover:translate-x-1 transition-transform"
                    onClick={() => onJobSelect({ company: selectedCompany, job })}
                  >
                    Start Interview Prep
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {jobPosts.length === 0 && selectedCompany && !loading && (
        <Card className="border border-border bg-card/80 backdrop-blur-md shadow-md">
          <CardContent className="pt-6 text-center text-muted-foreground">
            <p>No job postings found for {selectedCompany}. Try another company.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
