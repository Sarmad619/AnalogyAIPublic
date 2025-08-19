import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Filter, Heart, Calendar, ChevronRight, Star, Trash2 } from "lucide-react";

function formatTextContent(text: string | undefined | null): string {
  if (!text || typeof text !== 'string') {
    return '<p class="mb-4 text-muted-foreground">No content available</p>';
  }
  
  return text
    // Convert ### headers to styled headings
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-primary mb-4 mt-6 first:mt-0">$1</h3>')
    // Convert **bold** to styled bold text with highlight
    .replace(/\*\*(.+?)\*\*/g, '<span class="highlight-text">$1</span>')
    // Convert line breaks to paragraphs
    .replace(/\n\n/g, '</p><p class="mb-4">')
    // Wrap in paragraph tags
    .replace(/^(.+)$/, '<p class="mb-4">$1</p>')
    // Clean up empty paragraphs
    .replace(/<p class="mb-4"><\/p>/g, '');
}

// Compact history list item component
function HistoryListItem({ analogy, onToggleFavorite, onDelete, isToggling, isDeleting }: {
  analogy: any;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  isToggling: boolean;
  isDeleting: boolean;
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
        <div className="flex items-center gap-2 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleFavorite(analogy.id)}
            disabled={isToggling}
            className={`${
              analogy.isFavorite 
                ? 'text-primary hover:text-primary/80' 
                : 'text-muted-foreground hover:text-primary'
            }`}
          >
            <Heart size={16} fill={analogy.isFavorite ? 'currentColor' : 'none'} />
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                disabled={isDeleting}
                className="text-muted-foreground hover:text-red-400"
              >
                <Trash2 size={16} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Analogy</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this analogy about "{analogy.topic}"? 
                  This action cannot be undone and the analogy will be permanently removed from your history.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(analogy.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-border space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-primary mb-2">Analogy</h4>
            <div 
              className="text-foreground text-sm leading-relaxed formatted-content"
              dangerouslySetInnerHTML={{ 
                __html: formatTextContent(analogy.analogy) 
              }} 
            />
          </div>
          
          {analogy.example && (
            <div>
              <h4 className="text-sm font-semibold text-primary mb-2">Example</h4>
              <div 
                className="text-foreground text-sm leading-relaxed formatted-content"
                dangerouslySetInnerHTML={{ 
                  __html: formatTextContent(analogy.example) 
                }} 
              />
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

  const deleteAnalogy = useMutation({
    mutationFn: async (analogyId: string) => {
      return await apiRequest(`/api/analogy/${analogyId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/history'] });
      toast({
        title: "Analogy deleted",
        description: "The analogy has been permanently removed from your history",
      });
    },
    onError: (error) => {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: "Failed to delete analogy. Please try again.",
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
                onDelete={(id: string) => deleteAnalogy.mutate(id)}
                isToggling={toggleFavorite.isPending}
                isDeleting={deleteAnalogy.isPending}
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