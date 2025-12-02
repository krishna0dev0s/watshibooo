"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useFetch from "@/hooks/use-fetch";
import { z } from "zod";
import { updateUser } from "@/actions/user";

const onboardingSchema = z.object({
  industry: z.string({
    required_error: "Please select an industry",
  }),
  subIndustry: z.string({
    required_error: "Please select a specialization",
  }),
  experience: z
    .string()
    .transform((val) => {
      const num = parseInt(val, 10);
      if (isNaN(num)) throw new Error("Experience must be a number");
      return num;
    })
    .pipe(
      z
        .number()
        .int("Experience must be a whole number")
        .min(0, "Experience must be 0 or greater")
        .max(50, "Experience must be 50 years or less")
    ),
  skills: z
    .string()
    .min(1, "Please enter at least one skill")
    .transform((str) => 
      str.split(",")
        .map(s => s.trim())
        .filter(s => s.length > 0)
    )
    .refine((arr) => arr.length > 0, "At least one skill is required"),
  bio: z
    .string()
    .min(1, "Bio cannot be empty")
    .max(500, "Bio should not exceed 500 characters")
    .transform(str => str.trim()),
});

const OnboardingForm = ({ industries }) => {
  const router = useRouter();
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    loading: updateLoading,
    fn: updateUserFn,
    data: updateResult,
  } = useFetch(updateUser);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(onboardingSchema),
  });

  const onSubmit = async (values) => {
    try {
      const formattedIndustry = `${values.industry}-${values.subIndustry
        .toLowerCase()
        .replace(/ /g, "-")}`;

      const formattedData = {
        industry: formattedIndustry,
        experience: values.experience,
        bio: values.bio,
        skills: values.skills,
      };

      const result = await updateUserFn(formattedData);

      if (!result) {
        throw new Error("Profile update failed. Please try again.");
      }

      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white dark:bg-black/60 shadow-lg rounded-lg pointer-events-auto backdrop-blur-lg border border-white/10`}>
          <div className="p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-foreground">
                      Profile Updated Successfully!
                    </h3>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Your professional profile has been updated. Redirecting you to your personalized dashboard...
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex space-x-4">
                  <button
                    onClick={() => {
                      router.push("/dashboard");
                      toast.dismiss(t.id);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    View Dashboard
                  </button>
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ), {
        duration: 5000,
      });

      // Add a small delay before redirect to show the toast
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 2000);

    } catch (error) {
      console.error("Onboarding error:", error);
      toast.error(error.message || "Failed to update profile. Please try again.");
    }
  };

  // Remove the useEffect since we're handling success in onSubmit

  const watchIndustry = watch("industry");

  // Don't render until client-side hydration is complete
  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-start justify-center py-12" suppressHydrationWarning>
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 -top-24 w-[600px] h-[600px] bg-gradient-to-br from-[#7c3aed]/20 to-[#06b6d4]/20 opacity-30 rounded-full filter blur-3xl transform rotate-12" />
        <div className="absolute right-0 bottom-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#ff7ab6]/20 to-[#7c3aed]/20 opacity-30 rounded-full filter blur-3xl" />
      </div>

      <Card className="w-full max-w-lg mt-10 mx-4 bg-card/30 border border-white/10 backdrop-blur-xl shadow-2xl hero-content">
        <CardHeader>
          <CardTitle className="metallic-text text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            Complete Your Profile
          </CardTitle>
          <CardDescription className="text-muted-foreground/80 text-base">
            Select your industry to get personalized career insights and recommendations.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" suppressHydrationWarning>
            <div className="space-y-2">
              <Label htmlFor="industry" className="text-sm font-medium text-foreground/90">Industry</Label>
              <Select
                onValueChange={(value) => {
                  setValue("industry", value);
                  setSelectedIndustry(industries.find((ind) => ind.id === value));
                  setValue("subIndustry", "");
                }}
              >
                <SelectTrigger id="industry" suppressHydrationWarning>
                  <SelectValue placeholder="Select an industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Industries</SelectLabel>
                    {industries.map((ind) => (
                      <SelectItem key={ind.id} value={ind.id}>
                        {ind.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.industry && <p className="text-sm text-red-500">{errors.industry.message}</p>}
            </div>

            {watchIndustry && (
              <div className="space-y-2">
                <Label htmlFor="subIndustry" className="text-sm font-medium text-foreground/90">Specialization</Label>
                <Select onValueChange={(value) => setValue("subIndustry", value)}>
                  <SelectTrigger id="subIndustry" suppressHydrationWarning>
                    <SelectValue placeholder="Select your specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Specializations</SelectLabel>
                      {selectedIndustry?.subIndustries?.map((sub) => (
                        <SelectItem key={sub} value={sub}>
                          {sub}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.subIndustry && <p className="text-sm text-red-500">{errors.subIndustry.message}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="experience" className="text-sm font-medium text-foreground/90">Years of Experience</Label>
              <Input
                id="experience"
                type="number"
                min="0"
                max="50"
                placeholder="Enter years of experience"
                {...register("experience")}
                className="bg-black/20 border-white/10 focus:border-white/20 focus:ring-white/20 transition-colors"
              />
              {errors.experience && <p className="text-sm text-red-500">{errors.experience.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills" className="text-sm font-medium text-foreground/90">Skills</Label>
              <Input
                id="skills"
                placeholder="e.g., Python, JavaScript, Project Management"
                {...register("skills")}
                className="bg-black/20 border-white/10 focus:border-white/20 focus:ring-white/20 transition-colors"
              />
              <p className="text-sm text-muted-foreground">Separate multiple skills with commas</p>
              {errors.skills && <p className="text-sm text-red-500">{errors.skills.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-sm font-medium text-foreground/90">Professional Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about your professional background..."
                className="h-32 bg-black/20 border-white/10 focus:border-white/20 focus:ring-white/20 transition-colors"
                {...register("bio")}
              />
              {errors.bio && <p className="text-sm text-red-500">{errors.bio.message}</p>}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-white/10 hover:bg-white/15 text-white border border-white/10 hover:border-white/20 transition-all" 
              disabled={updateLoading}
            >
              {updateLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Complete Profile"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingForm;