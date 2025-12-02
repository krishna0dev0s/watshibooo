'use client';

import { useSearchParams } from 'next/navigation';
import { InterviewLearningRoadmap } from '@/components/interview-learning-roadmap';
import { useState } from 'react';

export default function InterviewLearningPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'Software Engineer';
  const company = searchParams.get('company') || '';
  const level = searchParams.get('level') || 'intermediate';

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <InterviewLearningRoadmap
          role={role}
          company={company}
          level={level}
        />
      </div>
    </div>
  );
}
