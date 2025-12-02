import React from "react";

export default function ResumeLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-muted/50">
      <div className="flex-1">{children}</div>
    </div>
  );
}