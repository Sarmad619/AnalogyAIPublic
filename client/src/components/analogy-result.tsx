import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Heart, ThumbsUp, Copy, Check } from "lucide-react";

interface AnalogyResultProps {
  analogy: any;
}

function formatTextContent(text: string): string {
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

export function AnalogyResult({ analogy }: AnalogyResultProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

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
      await navigator.clipboard.writeText(analogy.content);
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
          <h3 className="text-xl font-bold text-white">{analogy.concept}</h3>
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
      <div 
        className="formatted-content text-foreground leading-relaxed"
        dangerouslySetInnerHTML={{ __html: formatTextContent(analogy.content) }}
      />

      {/* Feedback */}
      <div className="flex items-center justify-between pt-6 mt-6 border-t border-border">
        <p className="text-sm text-muted-foreground">
          Was this analogy helpful?
        </p>
        <div className="flex items-center space-x-2">
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
      </div>
    </div>
  );
}