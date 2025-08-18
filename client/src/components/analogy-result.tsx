import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Heart, ThumbsUp, Copy, Check, RotateCcw, TrendingDown, TrendingUp } from "lucide-react";

interface AnalogyResultProps {
  analogy: any;
  onRegenerate?: (newAnalogy: any) => void;
}

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

export function AnalogyResult({ analogy, onRegenerate }: AnalogyResultProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  // Handle cases where analogy might be null or missing properties
  if (!analogy) {
    return (
      <div className="card-minimal p-6 text-center">
        <p className="text-muted-foreground">No analogy data available</p>
      </div>
    );
  }

  const feedbackMutation = useMutation({
    mutationFn: async ({ feedback }: { feedback: 'helpful' | 'not_helpful' }) => {
      return await apiRequest(`/api/analogy/${analogy.id}/feedback`, "POST", { feedback });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/history'] });
      toast({
        title: "Feedback recorded",
        description: "Thank you for your feedback!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record feedback",
        variant: "destructive",
      });
    },
  });

  const regenerateMutation = useMutation({
    mutationFn: async ({ feedback }: { feedback: string }) => {
      return await apiRequest("/api/analogy/regenerate", "POST", {
        previousAnalogyId: analogy.id,
        feedback: feedback,
      });
    },
    onSuccess: (newAnalogy) => {
      if (onRegenerate) {
        onRegenerate(newAnalogy);
      }
      queryClient.invalidateQueries({ queryKey: ['/api/history'] });
      toast({
        title: "Analogy regenerated",
        description: "A new version has been created based on your feedback!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to regenerate analogy. Please try again.",
        variant: "destructive",
      });
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/analogy/${analogy.id}/favorite`, "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/history'] });
      toast({
        title: analogy.isFavorite ? "Removed from favorites" : "Added to favorites",
        description: analogy.isFavorite ? "Analogy removed from your favorites" : "Analogy saved to your favorites",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    },
  });

  const handleCopy = async () => {
    try {
      const contentToCopy = `${analogy.analogy || ''}\n\n${analogy.example || ''}`;
      await navigator.clipboard.writeText(contentToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied to clipboard",
        description: "Analogy content copied successfully",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="card-minimal p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">{analogy.topic || 'Analogy'}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Generated on {new Date(analogy.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="text-muted-foreground hover:text-white"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => favoriteMutation.mutate()}
            disabled={favoriteMutation.isPending}
            className={`${
              analogy.isFavorite 
                ? 'text-primary hover:text-primary/80' 
                : 'text-muted-foreground hover:text-primary'
            }`}
          >
            <Heart size={16} fill={analogy.isFavorite ? 'currentColor' : 'none'} />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Analogy Section */}
        <div className="formatted-content text-foreground leading-relaxed">
          <h4 className="text-lg font-semibold text-primary mb-3">Analogy</h4>
          <div dangerouslySetInnerHTML={{ __html: formatTextContent(analogy.analogy) }} />
        </div>
        
        {/* Example Section */}
        {analogy.example && (
          <div className="formatted-content text-foreground leading-relaxed">
            <h4 className="text-lg font-semibold text-primary mb-3">Example</h4>
            <div dangerouslySetInnerHTML={{ __html: formatTextContent(analogy.example) }} />
          </div>
        )}
      </div>

      {/* Feedback */}
      <div className="pt-6 mt-6 border-t border-border space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Was this analogy helpful?
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => feedbackMutation.mutate({ feedback: 'helpful' })}
            disabled={feedbackMutation.isPending}
            className="text-muted-foreground hover:text-primary flex items-center space-x-1"
          >
            <ThumbsUp size={16} />
            <span>Helpful</span>
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Need a different difficulty level?
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => regenerateMutation.mutate({ feedback: 'too_advanced' })}
              disabled={regenerateMutation.isPending}
              className="text-muted-foreground hover:text-orange-400 flex items-center space-x-1"
            >
              <TrendingDown size={16} />
              <span>Too Advanced</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => regenerateMutation.mutate({ feedback: 'too_simple' })}
              disabled={regenerateMutation.isPending}
              className="text-muted-foreground hover:text-blue-400 flex items-center space-x-1"
            >
              <TrendingUp size={16} />
              <span>Too Simple</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => regenerateMutation.mutate({ feedback: 'different_style' })}
              disabled={regenerateMutation.isPending}
              className="text-muted-foreground hover:text-purple-400 flex items-center space-x-1"
            >
              <RotateCcw size={16} />
              <span>Different Style</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}