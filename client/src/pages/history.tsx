import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { History, Filter, ExternalLink, Star, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { LoadingState } from "@/components/loading-state";

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const { data: historyData, isLoading, error } = useQuery({
    queryKey: ["/api/history", 50, 0],
    refetchOnWindowFocus: false,
  });

  const filteredAnalogies = (historyData as any)?.analogies?.filter((analogy: any) => {
    const matchesSearch = analogy.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         analogy.analogy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFavorites = !showFavoritesOnly || analogy.isFavorite;
    return matchesSearch && matchesFavorites;
  }) || [];

  const getCategoryColor = (topic: string) => {
    const lowerTopic = topic.toLowerCase();
    if (lowerTopic.includes('ai') || lowerTopic.includes('machine') || lowerTopic.includes('neural')) {
      return 'bg-blue-500/20 text-blue-300';
    } else if (lowerTopic.includes('block') || lowerTopic.includes('crypto') || lowerTopic.includes('tech')) {
      return 'bg-purple-500/20 text-purple-300';
    } else if (lowerTopic.includes('economic') || lowerTopic.includes('finance') || lowerTopic.includes('market')) {
      return 'bg-green-500/20 text-green-300';
    } else if (lowerTopic.includes('quantum') || lowerTopic.includes('physics')) {
      return 'bg-cyan-500/20 text-cyan-300';
    }
    return 'bg-gray-500/20 text-gray-300';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    if (diffDays <= 30) return `${Math.ceil((diffDays - 1) / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  if (error) {
    return (
      <div className="min-h-screen pt-16">
        <div className="bg-animated" />
        <div className="relative max-w-4xl mx-auto px-4 py-12">
          <div className="glassmorphism-strong rounded-2xl p-8 text-center">
            <p className="text-red-400 mb-4">Failed to load history</p>
            <p className="text-gray-400">{error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="bg-animated" />
      
      <div className="relative max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold text-white flex items-center">
            <History className="mr-3 text-cyan-400" size={32} />
            Your Learning Journey
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Search analogies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glassmorphism border-glass-border focus:border-cyan-400 focus:ring-cyan-400/20 text-white placeholder-gray-400"
            />
            <Button
              variant="outline"
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`glassmorphism border-glass-border transition-all ${
                showFavoritesOnly 
                  ? 'text-yellow-400 border-yellow-400' 
                  : 'text-gray-300 hover:text-white hover:border-cyan-400'
              }`}
            >
              <Filter className="mr-2" size={16} />
              {showFavoritesOnly ? 'Show All' : 'Favorites Only'}
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <LoadingState message="Loading your learning history..." submessage="Gathering your analogies..." />
        )}

        {/* History Grid */}
        {!isLoading && (
          <>
            {filteredAnalogies.length === 0 ? (
              <div className="glassmorphism-strong rounded-2xl p-12 text-center">
                <History className="mx-auto mb-4 text-gray-500" size={48} />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                  {searchQuery || showFavoritesOnly ? 'No analogies found' : 'No analogies yet'}
                </h3>
                <p className="text-gray-500">
                  {searchQuery || showFavoritesOnly 
                    ? 'Try adjusting your search or filters' 
                    : 'Create your first analogy to start building your learning history'
                  }
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAnalogies.map((analogy: any) => (
                  <div
                    key={analogy.id}
                    className="glassmorphism rounded-xl p-6 hover:glassmorphism-strong transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate flex items-center">
                          {analogy.topic}
                          {analogy.isFavorite && (
                            <Star className="ml-2 text-yellow-400 flex-shrink-0" size={14} fill="currentColor" />
                          )}
                        </h3>
                        <p className="text-xs text-gray-400 flex items-center mt-1">
                          <Calendar className="mr-1" size={12} />
                          {formatDate(analogy.createdAt)}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-300 line-clamp-3 mb-4 leading-relaxed">
                      {analogy.analogy.length > 120 
                        ? `${analogy.analogy.substring(0, 120)}...` 
                        : analogy.analogy
                      }
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(analogy.topic)}`}>
                        {analogy.topic.includes('AI') || analogy.topic.includes('Machine') ? 'AI/ML' :
                         analogy.topic.includes('Quantum') ? 'Physics' :
                         analogy.topic.includes('Economic') || analogy.topic.includes('Supply') ? 'Economics' :
                         analogy.topic.includes('Block') ? 'Technology' : 'General'
                        }
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-cyan-400 hover:text-cyan-300 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <ExternalLink size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Load More Button */}
            {!isLoading && (historyData as any)?.hasMore && (
              <div className="text-center mt-8">
                <Button
                  variant="outline"
                  className="glassmorphism border-glass-border text-gray-300 hover:text-white hover:border-cyan-400 transition-all"
                >
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
