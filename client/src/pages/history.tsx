import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Filter, Heart, Calendar, ChevronRight, Star } from "lucide-react";

// Compact history list item component
function HistoryListItem({ analogy, onToggleFavorite, isToggling }: {
  analogy: any;
  onToggleFavorite: (id: string) => void;
  isToggling: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card-minimal p-4 hover:bg-card-hover transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-white hover:text-primary transition-colors text-left flex-1 min-w-0"
            >
              <h3 className="font-semibold truncate">{analogy.topic}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Calendar size={14} />
                <span>{new Date(analogy.createdAt).toLocaleDateString()}</span>
                {analogy.isFavorite && (
                  <>
                    <Star size={14} className="text-primary" />
                    <span className="text-primary">Favorite</span>
                  </>
                )}
              </div>
            </button>
            <ChevronRight 
              size={16} 
              className={`text-muted-foreground transform transition-transform ${
                expanded ? 'rotate-90' : ''
              }`}
            />
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleFavorite(analogy.id)}
          disabled={isToggling}
          className={`ml-4 ${
            analogy.isFavorite 
              ? 'text-primary hover:text-primary/80' 
              : 'text-muted-foreground hover:text-primary'
          }`}
        >
          <Heart size={16} fill={analogy.isFavorite ? 'currentColor' : 'none'} />
        </Button>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-border space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-primary mb-2">Analogy</h4>
            <p className="text-foreground text-sm leading-relaxed">
              {analogy.analogy}
            </p>
          </div>
          
          {analogy.example && (
            <div>
              <h4 className="text-sm font-semibold text-primary mb-2">Example</h4>
              <p className="text-foreground text-sm leading-relaxed">
                {analogy.example}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function History() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFavorites, setFilterFavorites] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: historyData, isLoading } = useQuery({
    queryKey: ['/api/history'],
  });

  const toggleFavorite = useMutation({
    mutationFn: async (analogyId: string) => {
      const analogy = analogies.find((a: any) => a.id === analogyId);
      return await apiRequest(`/api/analogy/${analogyId}/favorite`, "PUT", {
        isFavorite: !analogy?.isFavorite
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/history'] });
      toast({
        title: "Favorite updated",
        description: "Analogy favorite status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive",
      });
    },
  });

  const analogies = (historyData as any)?.analogies || [];
  const filteredAnalogies = Array.isArray(analogies) ? analogies.filter((analogy: any) => {
    const matchesSearch = analogy.topic.toLowerCase().includes(searchTerm.toLowerCase());
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
            <div className="flex-1">
              <Input
                placeholder="Search analogies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-minimal"
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
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card-minimal p-4 animate-pulse">
                <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : filteredAnalogies.length > 0 ? (
          <div className="space-y-3">
            {filteredAnalogies.map((analogy: any) => (
              <HistoryListItem 
                key={analogy.id} 
                analogy={analogy} 
                onToggleFavorite={(id: string) => toggleFavorite.mutate(id)}
                isToggling={toggleFavorite.isPending}
              />
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