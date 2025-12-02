"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateCoverLetter } from "@/actions/cover-letter";
import useFetch from "@/hooks/use-fetch";
import { coverLetterSchema } from "@/app/lib/schema";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CoverLetterGenerator() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(coverLetterSchema),
  });

  const {
    loading: generating,
    fn: generateLetterFn,
    data: generatedLetter,
  } = useFetch(generateCoverLetter);

  // Update content when letter is generated
  useEffect(() => {
    if (generatedLetter) {
      toast.success("Cover letter generated successfully!");
      router.push(`/ai-cover-letter/${generatedLetter.id}`);
      reset();
    }
  }, [generatedLetter]);

  const onSubmit = async (data) => {
    try {
      await generateLetterFn(data);
    } catch (error) {
      toast.error(error.message || "Failed to generate cover letter");
    }
  };

  return (
    <div className="w-full py-10 md:py-20 bg-muted/40 min-h-screen">
      {/* Background gradients */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 -top-24 w-[600px] h-[600px] bg-gradient-to-br from-[#7c3aed]/20 to-[#06b6d4]/20 opacity-30 rounded-full filter blur-3xl transform rotate-12" />
        <div className="absolute right-0 bottom-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#ff7ab6]/20 to-[#7c3aed]/20 opacity-30 rounded-full filter blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6">
        {/* Hero Section */}
        <div className="space-y-6 text-center container mx-auto mb-12">
          <div className="space-y-6 hero-content">
            <div className="hero-title">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight metallic-text">
                Create Cover Letter 
                AI-Powered Writer
              </h1>
              <p className="mt-6 text-lg md:text-xl lg:text-2xl font-medium max-w-3xl mx-auto text-gray-100">
                Let AI craft a personalized cover letter that highlights your unique qualifications.
              </p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="max-w-3xl mx-auto">
          <Card className="bg-card/30 border border-white/10 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">
                Job Details
              </CardTitle>
              <CardDescription className="text-gray-300">
                Provide information about the position you're applying for
              </CardDescription>
            </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Form fields remain the same */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="Enter company name"
                  {...register("companyName")}
                />
                {errors.companyName && (
                  <p className="text-sm text-red-500">
                    {errors.companyName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  placeholder="Enter job title"
                  {...register("jobTitle")}
                />
                {errors.jobTitle && (
                  <p className="text-sm text-red-500">
                    {errors.jobTitle.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobDescription">Job Description</Label>
              <Textarea
                id="jobDescription"
                placeholder="Paste the job description here"
                className="h-32"
                {...register("jobDescription")}
              />
              {errors.jobDescription && (
                <p className="text-sm text-red-500">
                  {errors.jobDescription.message}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={generating}>
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Cover Letter"
                )}
              </Button>
            </div>
          </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
