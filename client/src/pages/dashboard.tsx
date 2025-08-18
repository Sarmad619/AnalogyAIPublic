import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { AnalogyForm } from "@/components/analogy-form";
import { AnalogyResult } from "@/components/analogy-result";

export function Dashboard() {
  const [currentAnalogy, setCurrentAnalogy] = useState(null);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="section-container">
        <div className="section-header">
          <h1 className="section-title text-[#ffba1b]">AnalogiAI</h1>
          <p className="section-subtitle">
            Generate personalized analogies to understand complex concepts
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div>
            <AnalogyForm onAnalogy={setCurrentAnalogy} />
          </div>

          {/* Result Section */}
          <div>
            {currentAnalogy ? (
              <AnalogyResult 
                analogy={currentAnalogy} 
                onRegenerate={setCurrentAnalogy}
              />
            ) : (
              <div className="card-minimal p-8 text-center">
                <div className="text-muted-foreground text-4xl mb-4">💭</div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Ready to Learn
                </h3>
                <p className="text-muted-foreground">
                  Generate your first analogy to see it displayed here with formatted content, 
                  headers, and highlighted key concepts.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}