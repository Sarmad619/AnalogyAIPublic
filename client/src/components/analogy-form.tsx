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
                <FormLabel className="flex items-center text-base font-semibold text-gray-200 mb-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mr-2">
                    <Lightbulb className="text-primary-foreground" size={14} />
                  </div>
                  What concept would you like to understand?
                </FormLabel>
                <FormControl>
                  <div className="glassmorphism-strong border-2 border-glass-border rounded-xl p-1 focus-within:border-primary transition-all">
                    <Input
                      {...field}
                      placeholder="e.g., Quantum physics, Machine learning, Economic inflation..."
                      className="bg-transparent border-none text-white text-lg placeholder-gray-400 focus:ring-0 focus:outline-none p-4 w-full"
                      disabled={isLoading}
                    />
                  </div>
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
                <FormLabel className="flex items-center text-base font-semibold text-gray-200 mb-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-2">
                    <GraduationCap className="text-white" size={14} />
                  </div>
                  Additional context (optional)
                </FormLabel>
                <FormControl>
                  <div className="glassmorphism-strong border-2 border-glass-border rounded-xl p-1 focus-within:border-green-500 transition-all">
                    <Textarea
                      {...field}
                      placeholder="Provide any specific context about how you'll use this knowledge..."
                      rows={3}
                      className="bg-transparent border-none text-white text-lg placeholder-gray-400 focus:ring-0 focus:outline-none p-4 resize-none w-full"
                      disabled={isLoading}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Personalization Section */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center text-base font-semibold text-gray-200 mb-3">
                <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center mr-2">
                  <Heart className="text-white" size={14} />
                </div>
                Your interests
              </label>
              <div className="glassmorphism-strong border-2 border-glass-border rounded-xl p-1 focus-within:border-pink-500 transition-all">
                <Input
                  value={interestsInput}
                  onChange={(e) => setInterestsInput(e.target.value)}
                  placeholder="e.g., cooking, sports, music, movies..."
                  className="bg-transparent border-none text-white text-lg placeholder-gray-400 focus:ring-0 focus:outline-none p-4 w-full"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="personalization.knowledgeLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center text-base font-semibold text-gray-200 mb-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                      <GraduationCap className="text-white" size={14} />
                    </div>
                    Knowledge level
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                    <FormControl>
                      <div className="glassmorphism-strong border-2 border-glass-border rounded-xl p-1 focus-within:border-blue-500 transition-all">
                        <SelectTrigger className="bg-transparent border-none text-white text-lg focus:ring-0 focus:outline-none p-4 w-full">
                          <SelectValue placeholder="Select your knowledge level" />
                        </SelectTrigger>
                      </div>
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
