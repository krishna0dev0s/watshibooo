"use client";

import { useState } from "react";
import CompanySearch from "./_components/company-search";
import InterviewPrepWithCompany from "./_components/interview-prep-with-company";
import InterviewAnalytics from "./_components/interview-analytics";

export default function InterviewPrepPage() {
  const [selectedJob, setSelectedJob] = useState(null);

  if (selectedJob) {
    return (
      <div className="w-full py-10 md:py-20 min-h-screen">
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          {/* Removed background gradients and blur */}
        </div>

        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <InterviewPrepWithCompany
              company={selectedJob.company}
              job={selectedJob.job}
              onBack={() => setSelectedJob(null)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-10 md:py-20 min-h-screen">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header Section */}
        <div className="space-y-6 text-center container mx-auto mb-12">
          <div className="space-y-6 hero-content">
            <div className="hero-title">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight metallic-text">
                Interview Preparation
                <br />
                <span className="metallic-blue">
                  Your Path to Success
                </span>
              </h1>
              <p className="mt-6 text-lg md:text-xl lg:text-2xl font-medium max-w-3xl mx-auto text-gray-100">
                Search for companies, explore job openings, and practice with AI-powered interview questions tailored to your target role.
              </p>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Company Search Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-foreground/80">Find Opportunities</h2>
            <CompanySearch onJobSelect={setSelectedJob} />
          </div>

          {/* Interview Analytics Section */}
          <InterviewAnalytics />
        </div>
      </div>
    </div>
  );
}
