import React from "react";

const MainLayout = async ({ children }) => {
  return (
    <div className="relative min-h-screen w-full">
      {/* Fixed background with blur */}
      <div className="fixed inset-0 -z-10">
        {/* Very minimal blur layer */}
        <div className="absolute inset-0 bg-background/10 backdrop-blur-[2px]" />
        
        {/* Subtle depth layer */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/5" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen pt-16 pb-20">
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
