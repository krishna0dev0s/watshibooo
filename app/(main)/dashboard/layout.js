import { PacmanLoader } from "react-spinners";
import { Suspense } from "react";

export default function Layout({ children }) {
  return (
    <div className="px-5">
      {/* Header removed to avoid duplicate title — dashboard view provides its own heading */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center fixed inset-0" 
            style={{ 
              background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.03), rgba(255, 255, 255, 0.05), rgba(6, 182, 212, 0.03))',
              backdropFilter: 'blur(4px)'
            }}>
            <PacmanLoader color="#7c3aed" size={20} />
          </div>
        }
      >
        {children}
      </Suspense>
    </div>
  );
}
