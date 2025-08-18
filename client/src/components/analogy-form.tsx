import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Lightbulb, Heart, GraduationCap, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { generateAnalogySchema } from "@shared/schema";
import { api, type GenerateAnalogyRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface AnalogyFormProps {
  onSuccess: (result: any) => void;
  isLoading: boolean;
}

export function AnalogyForm({ onSuccess, isLoading }: AnalogyFormProps) {
  const { toast } = useToast();
  const [interestsInput, setInterestsInput] = useState("");

  // Get user profile for default values
  const { data: profile } = useQuery({
    queryKey: ["/api/profile"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const form = useForm<GenerateAnalogyRequest>({
    resolver: zodResolver(generateAnalogySchema),
    defaultValues: {
      topic: "",
      context: "",
      personalization: {
        interests: [],
        knowledgeLevel: "intermediate",
      },
    },
  });

  const generateMutation = useMutation({
    mutationFn: api.generateAnalogy,
    onSuccess: (data) => {
      onSuccess(data);
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
      toast({
        title: "Analogy Generated!",
        description: "Your personalized analogy is ready.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate analogy. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: GenerateAnalogyRequest) => {
    // Parse interests from comma-separated string if provided
    if (interestsInput.trim()) {
      data.personalization.interests = interestsInput
        .split(",")
        .map(i => i.trim())
        .filter(i => i.length > 0);
    }
    
    generateMutation.mutate(data);
  };

  // Set interests from profile when it loads
  useEffect(() => {
    if (profile && (profile as any).personalizationInterests) {
      const profileData = profile as any;
      setInterestsInput(profileData.personalizationInterests.join(", "));
      form.setValue("personalization.interests", profileData.personalizationInterests);
      form.setValue("personalization.knowledgeLevel", profileData.defaultKnowledgeLevel);
    }
  }, [profile, form]);

  return (
    <div className="glassmorphism-strong rounded-2xl p-8 shadow-2xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Topic Input */}
          <FormField
            control={form.control}
            name="topic"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center text-sm font-medium text-gray-200 mb-3">
                  <Lightbulb className="mr-2 text-yellow-400" size={16} />
                  What concept would you like to understand?
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g., Quantum physics, Machine learning, Economic inflation..."
                    className="w-full px-4 py-3 glassmorphism rounded-lg border-glass-border focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all text-white placeholder-gray-400"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Context Input */}
          <FormField
            control={form.control}
            name="context"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center text-sm font-medium text-gray-200 mb-3">
                  <div className="w-4 h-4 mr-2 text-green-400">🎯</div>
                  Additional context (optional)
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Provide any specific context about how you'll use this knowledge..."
                    rows={3}
                    className="w-full px-4 py-3 glassmorphism rounded-lg border-glass-border focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all text-white placeholder-gray-400 resize-none"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Personalization Section */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-200 mb-3">
                <Heart className="mr-2 text-pink-400" size={16} />
                Your interests
              </label>
              <Input
                value={interestsInput}
                onChange={(e) => setInterestsInput(e.target.value)}
                placeholder="e.g., cooking, sports, music, movies..."
                className="w-full px-4 py-3 glassmorphism rounded-lg border-glass-border focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all text-white placeholder-gray-400"
                disabled={isLoading}
              />
            </div>
            
            <FormField
              control={form.control}
              name="personalization.knowledgeLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center text-sm font-medium text-gray-200 mb-3">
                    <GraduationCap className="mr-2 text-blue-400" size={16} />
                    Knowledge level
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger className="w-full px-4 py-3 glassmorphism rounded-lg border-glass-border focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all text-white">
                        <SelectValue placeholder="Select your knowledge level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Generate Button */}
          <Button 
            type="submit"
            disabled={isLoading || generateMutation.isPending}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Wand2 className="mr-2" size={20} />
            {generateMutation.isPending ? "Generating..." : "Generate Personalized Analogy"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
