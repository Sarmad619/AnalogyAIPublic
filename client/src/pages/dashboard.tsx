import { useState } from "react";
import { AnalogyForm } from "@/components/analogy-form";
import { AnalogyResult } from "@/components/analogy-result";
import { LoadingState } from "@/components/loading-state";
import { type AnalogyResponse } from "@/lib/api";

export default function Dashboard() {
  const [currentResult, setCurrentResult] = useState<AnalogyResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSuccess = (result: AnalogyResponse) => {
    setCurrentResult(result);
    setIsLoading(false);
  };

  const handleRegenerate = (newResult: AnalogyResponse) => {
    setCurrentResult(newResult);
  };

  return (
    <div className="min-h-screen pt-16">
      {/* Background Elements */}
      <div className="bg-animated" />

      <main className="relative">
        <section className="min-h-screen flex items-center justify-center px-4 py-12">
          <div className="max-w-4xl mx-auto w-full">
            {/* Welcome Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Transform Complex
                <span className="gradient-text"> Concepts</span>
                <br />
                into Simple
                <span className="gradient-text"> Analogies</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Leverage AI to create personalized analogies that make difficult subjects intuitive and engaging, tailored to your unique interests and knowledge level.
              </p>
            </div>

            {/* Main Form */}
            <div className="mb-8">
              <AnalogyForm onSuccess={handleFormSuccess} isLoading={isLoading} />
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="mb-8">
                <LoadingState />
              </div>
            )}

            {/* Results */}
            {currentResult && !isLoading && (
              <AnalogyResult 
                result={currentResult} 
                onRegenerate={handleRegenerate}
              />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
