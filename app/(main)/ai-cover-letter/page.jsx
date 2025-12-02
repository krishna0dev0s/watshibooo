import { getCoverLetters } from "@/actions/cover-letter";
import Link from "next/link";
import { Plus, FileText, Send, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import CoverLetterList from "./_components/cover-letter-list";

export default async function CoverLetterPage() {
  const coverLetters = await getCoverLetters();

  return (
    <div className="w-full py-10 md:py-20 bg-muted/40 min-h-screen">
      {/* Background gradients */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 -top-24 w-[600px] h-[600px] bg-gradient-to-br from-[#7c3aed]/20 to-[#06b6d4]/20 opacity-30 rounded-full filter blur-3xl transform rotate-12" />
        <div className="absolute right-0 bottom-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#ff7ab6]/20 to-[#7c3aed]/20 opacity-30 rounded-full filter blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6">
        {/* Header Section */}
        <div className="space-y-6 text-center container mx-auto mb-12">
          <div className="space-y-6 hero-content">
            <div className="hero-title">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight metallic-text">
                AI Cover Letters
                <br />
                <span className="metallic-blue">
                  Stand Out From the Crowd
                </span>
              </h1>
              <p className="mt-6 text-lg md:text-xl lg:text-2xl font-medium max-w-3xl mx-auto text-gray-100">
                Create personalized, compelling cover letters with AI assistance in minutes.
              </p>
              <div className="mt-8">
                <Link href="/ai-cover-letter/new">
                  <Button className="bg-white/20 hover:bg-white/30 border-white/20 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-white/10 group">
                    <Plus className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:rotate-180" />
                    Create New Cover Letter
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Stats Section */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Quick Stats Cards */}
            <div className="bg-card/30 border border-white/10 rounded-xl p-6 flex items-center space-x-4">
              <div className="bg-white/10 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Letters</p>
                <h3 className="text-2xl font-semibold">{coverLetters.length}</h3>
              </div>
            </div>
            
            <div className="bg-card/30 border border-white/10 rounded-xl p-6 flex items-center space-x-4">
              <div className="bg-white/10 p-3 rounded-lg">
                <Send className="h-6 w-6 text-violet-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sent Applications</p>
                <h3 className="text-2xl font-semibold">{coverLetters.filter(l => l.sent).length}</h3>
              </div>
            </div>

            <div className="bg-card/30 border border-white/10 rounded-xl p-6 flex items-center space-x-4">
              <div className="bg-white/10 p-3 rounded-lg">
                <Star className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Favorites</p>
                <h3 className="text-2xl font-semibold">{coverLetters.filter(l => l.favorite).length}</h3>
              </div>
            </div>
          </section>

          {/* Cover Letters List Section */}
          <section className="bg-card/30 border border-white/10 rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-6 text-foreground/80">Your Cover Letters</h2>
            <CoverLetterList coverLetters={coverLetters} />
          </section>
        </div>
      </div>
    </div>
  );
}
