"use client";

import { useEffect, useState } from "react";
import { getUserOnboardingStatus } from "@/actions/user";
import { getIndustryInsights } from "@/actions/dashboard";
import DashboardView from "@/components/dashboard-view";

const IndustryInsightsPage = () => {
  const [insights, setInsights] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { isOnboarded, user } = await getUserOnboardingStatus();
        if (!isOnboarded) {
          window.location.href = "/onboarding";
          return;
        }
        setUserData(user);
        const data = await getIndustryInsights();
        setInsights(data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 rounded-full border-4 border-purple-600 border-t-pink-600 animate-spin mx-auto" />
          <p className="text-gray-300">Loading industry insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 max-w-md text-center">
          <p className="text-red-400 font-semibold">Error loading data</p>
          <p className="text-gray-300 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <DashboardView insights={insights} userData={userData} />
    </div>
  );
};

export default IndustryInsightsPage;
