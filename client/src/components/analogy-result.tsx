import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Bookmark, ThumbsUp, TrendingDown, TrendingUp, Quote, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api, type AnalogyResponse } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface AnalogyResultProps {
  result: AnalogyResponse;
  onRegenerate?: (newResult: AnalogyResponse) => void;
}

export function AnalogyResult({ result, onRegenerate }: AnalogyResultProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFavorited, setIsFavorited] = useState(false);

  const regenerateMutation = useMutation({
    mutationFn: async (feedback: string) => {
      if (!result.id) {
        throw new Error("Cannot regenerate analogy without ID");
      }
      return api.regenerateAnalogy({
        previousAnalogyId: result.id,
        feedback,
      });
    },
    onSuccess: (data) => {
      onRegenerate?.(data);
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
      toast({
        title: "Analogy Regenerated!",
        description: "A new perspective has been generated for you.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Regeneration Failed",
        description: error.message || "Failed to regenerate analogy. Please try again.",
        variant: "destructive",
      });
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (!result.id) {
        throw new Error("Cannot favorite analogy without ID");
      }
      return api.toggleFavorite(result.id, !isFavorited);
    },
    onSuccess: (data) => {
      setIsFavorited(data.isFavorite);
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
      toast({
        title: data.isFavorite ? "Added to Favorites" : "Removed from Favorites",
        description: data.isFavorite ? "This analogy has been saved to your favorites." : "This analogy has been removed from your favorites.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Update",
        description: error.message || "Failed to update favorite status.",
        variant: "destructive",
      });
    },
  });

  // Feedback mutation for "Helpful" button
  const feedbackMutation = useMutation({
    mutationFn: async (helpful: boolean) => {
      if (!result.id) {
        throw new Error("Cannot submit feedback without analogy ID");
      }
      return api.submitFeedback(result.id, helpful);
    },
    onSuccess: (data) => {
      toast({
        title: "Feedback Submitted",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Feedback Failed",
        description: error.message || "Failed to submit feedback.",
        variant: "destructive",
      });
    },
  });

  const handleRegenerate = (feedbackType: string) => {
    regenerateMutation.mutate(feedbackType);
  };

  const handleFeedback = (helpful: boolean) => {
    feedbackMutation.mutate(helpful);
  };

  const handleFavorite = () => {
    if (result.id) {
      favoriteMutation.mutate();
    } else {
      toast({
        title: "Cannot Save",
        description: "This analogy cannot be saved because it wasn't stored.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="glassmorphism-strong rounded-2xl p-8 shadow-2xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-2xl font-semibold text-white mb-2">Your Personalized Analogy</h3>
          <p className="text-sm text-gray-400">Topic: <span className="text-gray-300">{result.topic}</span></p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => handleRegenerate("different-angle")}
            disabled={regenerateMutation.isPending}
            variant="outline"
            size="sm"
            className="glassmorphism border-glass-border text-gray-300 hover:text-white hover:border-cyan-400 transition-all"
          >
            <RefreshCw className={`mr-1 ${regenerateMutation.isPending ? 'animate-spin' : ''}`} size={14} />
            Regenerate
          </Button>
          <Button
            onClick={handleFavorite}
            disabled={favoriteMutation.isPending || !result.id}
            variant="outline"
            size="sm"
            className={`glassmorphism border-glass-border transition-all ${
              isFavorited 
                ? 'text-yellow-400 border-yellow-400 hover:text-yellow-300' 
                : 'text-gray-300 hover:text-white hover:border-green-400'
            }`}
          >
            <Bookmark className="mr-1" size={14} />
            {isFavorited ? 'Saved' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Analogy Content */}
        <div className="glassmorphism-strong border-2 border-cyan-400/30 rounded-xl p-8 shadow-lg">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mr-3">
              <Quote className="text-white" size={20} />
            </div>
            <h4 className="text-xl font-bold text-cyan-300">The Analogy</h4>
          </div>
          <div className="bg-black/20 rounded-lg p-6 border border-cyan-400/20">
            <p className="text-gray-100 text-lg leading-loose font-medium">
              {result.analogy}
            </p>
          </div>
        </div>

        {/* Practical Example */}
        <div className="glassmorphism-strong border-2 border-purple-400/30 rounded-xl p-8 shadow-lg">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mr-3">
              <Lightbulb className="text-white" size={20} />
            </div>
            <h4 className="text-xl font-bold text-purple-300">Real-World Example</h4>
          </div>
          <div className="bg-black/20 rounded-lg p-6 border border-purple-400/20">
            <p className="text-gray-100 text-lg leading-loose font-medium">
              {result.example}
            </p>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="border-t border-glass-border pt-6">
          <p className="text-sm text-gray-400 mb-3">Was this analogy helpful?</p>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => handleFeedback(true)}
              disabled={feedbackMutation.isPending}
              variant="outline"
              size="sm"
              className="bg-green-500/20 text-green-300 border-green-400/30 hover:bg-green-500/30 transition-all"
            >
              <ThumbsUp className="mr-1" size={14} />
              Helpful
            </Button>
            <Button
              onClick={() => handleRegenerate("too-simple")}
              disabled={regenerateMutation.isPending}
              variant="outline"
              size="sm"
              className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30 hover:bg-yellow-500/30 transition-all"
            >
              <TrendingDown className="mr-1" size={14} />
              Too Simple
            </Button>
            <Button
              onClick={() => handleRegenerate("too-complex")}
              disabled={regenerateMutation.isPending}
              variant="outline"
              size="sm"
              className="bg-red-500/20 text-red-300 border-red-400/30 hover:bg-red-500/30 transition-all"
            >
              <TrendingUp className="mr-1" size={14} />
              Too Complex
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
