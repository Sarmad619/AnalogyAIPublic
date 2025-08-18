import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { AnalogyResult } from "@/components/analogy-result";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Heart, Calendar } from "lucide-react";

export function History() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFavorites, setFilterFavorites] = useState(false);

  const { data: analogies = [], isLoading } = useQuery({
    queryKey: ['/api/history'],
  });

  const filteredAnalogies = Array.isArray(analogies) ? analogies.filter((analogy: any) => {
    const matchesSearch = analogy.concept.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFavorite = !filterFavorites || analogy.isFavorite;
    return matchesSearch && matchesFavorite;
  }) : [];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="section-container text-[#ffffff]">
        <div className="section-header">
          <h1 className="section-title">Learning History</h1>
          <p className="section-subtitle">
            View and manage your saved analogies and learning progress
          </p>
        </div>

        {/* Controls */}
        <div className="card-minimal p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground z-10 pointer-events-none" size={16} />
              <Input
                placeholder="Search analogies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-minimal pl-10 relative z-0"
              />
            </div>
            <Button
              onClick={() => setFilterFavorites(!filterFavorites)}
              variant={filterFavorites ? "default" : "outline"}
              className={filterFavorites ? "btn-primary" : "btn-secondary"}
            >
              <Heart className="mr-2" size={16} fill={filterFavorites ? "currentColor" : "none"} />
              Favorites Only
            </Button>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card-minimal p-6 animate-pulse">
                <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
                <div className="h-3 bg-muted rounded w-full mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : filteredAnalogies.length > 0 ? (
          <div className="grid gap-6">
            {filteredAnalogies.map((analogy: any) => (
              <AnalogyResult key={analogy.id} analogy={analogy} />
            ))}
          </div>
        ) : (
          <div className="card-minimal p-8 text-center">
            <div className="text-muted-foreground text-4xl mb-4">
              {searchTerm || filterFavorites ? "🔍" : "📚"}
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {searchTerm || filterFavorites 
                ? "No analogies found"
                : "No analogies yet"
              }
            </h3>
            <p className="text-muted-foreground">
              {searchTerm || filterFavorites 
                ? "Try adjusting your search or filter criteria"
                : "Generate your first analogy to start building your learning history"
              }
            </p>
          </div>
        )}
      </main>
    </div>
  );
}