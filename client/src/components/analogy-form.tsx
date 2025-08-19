import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Brain, Users, GraduationCap, Wand2, Plus, X } from "lucide-react";

const formSchema = z.object({
  concept: z.string().min(1, "Please enter a concept to understand"),
  context: z.string().optional(),
  personalization: z.object({
    knowledgeLevel: z.enum(["beginner", "intermediate", "advanced"]),
    analogyStyle: z.enum(["conversational", "technical", "creative"]).optional(),
  }),
});

type FormData = z.infer<typeof formSchema>;

interface AnalogyFormProps {
  onAnalogy: (analogy: any) => void;
}

export function AnalogyForm({ onAnalogy }: AnalogyFormProps) {
  const { toast } = useToast();
  const [interestsInput, setInterestsInput] = useState("");
  const [interests, setInterests] = useState<string[]>([]);

  // Fetch user profile to auto-populate preferences
  const { data: profile } = useQuery({
    queryKey: ['/api/profile'],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      concept: "",
      context: "",
      personalization: {
        knowledgeLevel: "intermediate",
      },
    },
  });

  // Auto-populate form with user preferences
  useEffect(() => {
    if (profile) {
      const userProfile = profile as any;
      
      // Set default knowledge level from profile
      if (userProfile.defaultKnowledgeLevel) {
        form.setValue('personalization.knowledgeLevel', userProfile.defaultKnowledgeLevel);
      }
      
      // Set default analogy style from profile
      if (userProfile.analogyStyle) {
        form.setValue('personalization.analogyStyle', userProfile.analogyStyle);
      }
      
      // Set interests from profile
      if (userProfile.personalizationInterests?.length > 0) {
        setInterests(userProfile.personalizationInterests);
      }
    }
  }, [profile, form]);

  const generateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return await apiRequest("/api/analogy", "POST", {
        topic: data.concept,
        context: data.context,
        personalization: {
          ...data.personalization,
          interests,
        },
      });
    },
    onSuccess: (analogy) => {
      onAnalogy(analogy);
      toast({
        title: "Analogy generated",
        description: "Your personalized analogy has been created!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate analogy. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    generateMutation.mutate(data);
  };

  const addInterest = () => {
    if (interestsInput.trim() && !interests.includes(interestsInput.trim())) {
      setInterests([...interests, interestsInput.trim()]);
      setInterestsInput("");
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest));
  };

  const isLoading = generateMutation.isPending;

  return (
    <div className="card-minimal p-6">
      <div className="section-header">
        <h2 className="text-xl font-bold text-white mb-2">Generate Analogy</h2>
        <p className="text-muted-foreground">
          Transform complex concepts into simple, relatable analogies
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Concept Input */}
          <FormField
            control={form.control}
            name="concept"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center text-base font-medium text-white mb-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mr-3">
                    <Brain className="text-primary-foreground" size={14} />
                  </div>
                  What concept would you like to understand?
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g., Quantum physics, Machine learning, Economic inflation..."
                    className="input-minimal text-lg"
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
                <FormLabel className="flex items-center text-base font-medium text-white mb-3">
                  <div className="w-6 h-6 bg-secondary border border-border rounded-full flex items-center justify-center mr-3">
                    <Users className="text-foreground" size={14} />
                  </div>
                  Additional context (optional)
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Provide any specific context about how you'll use this knowledge..."
                    rows={3}
                    className="input-minimal resize-none"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Interests Section */}
          <div>
            <label className="flex items-center text-base font-medium text-white mb-3">
              <div className="w-6 h-6 bg-primary/80 rounded-full flex items-center justify-center mr-3">
                <Plus className="text-primary-foreground" size={14} />
              </div>
              Your interests
            </label>
            
            <div className="flex space-x-2 mb-3">
              <Input
                value={interestsInput}
                onChange={(e) => setInterestsInput(e.target.value)}
                placeholder="e.g., cooking, sports, music, movies..."
                className="input-minimal flex-1"
                disabled={isLoading}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addInterest())}
              />
              <Button
                type="button"
                onClick={addInterest}
                className="btn-secondary"
                disabled={!interestsInput.trim() || isLoading}
              >
                Add
              </Button>
            </div>

            {/* Interest Tags */}
            {interests.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <div
                    key={interest}
                    className="flex items-center bg-primary/20 text-primary px-3 py-1 rounded-full text-sm"
                  >
                    {interest}
                    <button
                      type="button"
                      onClick={() => removeInterest(interest)}
                      className="ml-2 text-primary hover:text-primary/80"
                      disabled={isLoading}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Knowledge Level */}
          <FormField
            control={form.control}
            name="personalization.knowledgeLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center text-base font-medium text-white mb-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <GraduationCap className="text-white" size={14} />
                  </div>
                  Knowledge level
                </FormLabel>
                <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger className="input-minimal">
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

          {/* Generate Button */}
          <Button 
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary text-lg py-3 flex items-center justify-center space-x-2"
          >
            <Wand2 size={20} />
            <span>{isLoading ? "Generating..." : "Generate Personalized Analogy"}</span>
          </Button>
        </form>
      </Form>
    </div>
  );
}