import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { User, Settings, Save } from "lucide-react";

const profileSchema = z.object({
  personalizationInterests: z.array(z.string()).optional(),
  defaultKnowledgeLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  analogyStyle: z.enum(["conversational", "technical", "creative"]).optional(),
  saveHistory: z.boolean().optional(),
});

type ProfileData = z.infer<typeof profileSchema>;

export function Profile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['/api/profile'],
  });

  const { data: user } = useQuery({
    queryKey: ['/api/auth/user'],
  });

  const form = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      personalizationInterests: [],
      defaultKnowledgeLevel: "intermediate",
      analogyStyle: "conversational",
      saveHistory: true,
    },
  });

  // Update form when profile data loads
  useEffect(() => {
    if (profile && typeof profile === 'object') {
      form.reset({
        personalizationInterests: (profile as any).personalizationInterests || [],
        defaultKnowledgeLevel: (profile as any).defaultKnowledgeLevel || "intermediate",
        analogyStyle: (profile as any).analogyStyle || "conversational",
        saveHistory: (profile as any).saveHistory !== undefined ? (profile as any).saveHistory : true,
      });
    }
  }, [profile, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: ProfileData) => {
      return await apiRequest("/api/profile", "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      toast({
        title: "Profile updated",
        description: "Your preferences have been saved successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileData) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="section-container">
          <div className="card-minimal p-6 animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-20 bg-muted rounded"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="section-container">
        <div className="section-header">
          <h1 className="section-title">Profile Settings</h1>
          <p className="section-subtitle">
            Customize your learning preferences for better personalized analogies
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* User Info Card */}
          <div className="card-minimal p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <User className="text-primary-foreground" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{(user as any)?.firstName || 'User'}</h3>
                <p className="text-muted-foreground">{(user as any)?.email}</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Member since:</span>
                <span className="text-white">
                  {(user as any)?.createdAt ? new Date((user as any).createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Knowledge Level:</span>
                <span className="text-white capitalize">{(profile as any)?.defaultKnowledgeLevel || 'intermediate'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Analogy Style:</span>
                <span className="text-white capitalize">{(profile as any)?.analogyStyle || 'conversational'}</span>
              </div>
            </div>
          </div>

          {/* Settings Form */}
          <div className="lg:col-span-2">
            <div className="card-minimal p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Settings className="text-primary" size={20} />
                <h3 className="text-xl font-bold text-white">Learning Preferences</h3>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="personalizationInterests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium text-white">
                          Your Interests
                        </FormLabel>
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {field.value?.map((interest, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm flex items-center gap-2"
                              >
                                {interest}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newInterests = [...(field.value || [])];
                                    newInterests.splice(index, 1);
                                    field.onChange(newInterests);
                                  }}
                                  className="hover:text-primary/70"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Add an interest..."
                              className="input-minimal flex-1"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const input = e.target as HTMLInputElement;
                                  const newInterest = input.value.trim();
                                  if (newInterest && !field.value?.includes(newInterest)) {
                                    field.onChange([...(field.value || []), newInterest]);
                                    input.value = '';
                                  }
                                }
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                                const newInterest = input.value.trim();
                                if (newInterest && !field.value?.includes(newInterest)) {
                                  field.onChange([...(field.value || []), newInterest]);
                                  input.value = '';
                                }
                              }}
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Add interests that will be auto-populated in your Dashboard preferences. 
                          These will be automatically loaded when generating analogies.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="defaultKnowledgeLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium text-white">
                          Default Knowledge Level
                        </FormLabel>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {[
                            { value: "beginner", label: "Beginner", desc: "Simple explanations" },
                            { value: "intermediate", label: "Intermediate", desc: "Balanced detail level" },
                            { value: "advanced", label: "Advanced", desc: "Technical depth" }
                          ].map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => field.onChange(option.value)}
                              className={`p-3 rounded-lg border text-left transition-colors ${
                                field.value === option.value
                                  ? 'border-primary bg-primary/20 text-primary'
                                  : 'border-border bg-card hover:bg-card-hover text-foreground'
                              }`}
                            >
                              <div className="font-medium">{option.label}</div>
                              <div className="text-sm opacity-70">{option.desc}</div>
                            </button>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          This will be your default complexity level for all new analogies
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="analogyStyle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium text-white">
                          Analogy Style
                        </FormLabel>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {[
                            { value: "conversational", label: "Conversational", desc: "Friendly and relatable" },
                            { value: "technical", label: "Technical", desc: "Precise and detailed" },
                            { value: "creative", label: "Creative", desc: "Imaginative and fun" }
                          ].map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => field.onChange(option.value)}
                              className={`p-3 rounded-lg border text-left transition-colors ${
                                field.value === option.value
                                  ? 'border-primary bg-primary/20 text-primary'
                                  : 'border-border bg-card hover:bg-card-hover text-foreground'
                              }`}
                            >
                              <div className="font-medium">{option.label}</div>
                              <div className="text-sm opacity-70">{option.desc}</div>
                            </button>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          This will be your default style for all analogies generated
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Save size={16} />
                    <span>{updateMutation.isPending ? "Saving..." : "Save Preferences"}</span>
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}