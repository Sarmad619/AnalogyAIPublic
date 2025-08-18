import { useState } from "react";
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
  interests: z.string().optional(),
  learningGoals: z.string().optional(),
  preferredComplexity: z.enum(["simple", "moderate", "detailed"]).optional(),
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
      interests: profile?.interests || "",
      learningGoals: profile?.learningGoals || "",
      preferredComplexity: profile?.preferredComplexity || "moderate",
    },
  });

  // Update form when profile data loads
  if (profile) {
    form.reset({
      interests: profile.interests || "",
      learningGoals: profile.learningGoals || "",
      preferredComplexity: profile.preferredComplexity || "moderate",
    });
  }

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
                <h3 className="text-lg font-semibold text-white">{user?.firstName || 'User'}</h3>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Member since:</span>
                <span className="text-white">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total analogies:</span>
                <span className="text-white">{profile?.totalAnalogies || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Favorites:</span>
                <span className="text-white">{profile?.favoriteCount || 0}</span>
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
                    name="interests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium text-white">
                          Your Interests
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="e.g., cooking, sports, technology, music, travel..."
                            rows={3}
                            className="input-minimal resize-none"
                          />
                        </FormControl>
                        <p className="text-sm text-muted-foreground">
                          Help us create analogies using topics you're familiar with
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="learningGoals"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium text-white">
                          Learning Goals
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="What do you hope to achieve with analogies? What subjects interest you most?"
                            rows={3}
                            className="input-minimal resize-none"
                          />
                        </FormControl>
                        <p className="text-sm text-muted-foreground">
                          Tell us about your learning objectives to get more relevant analogies
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preferredComplexity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium text-white">
                          Preferred Explanation Style
                        </FormLabel>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {[
                            { value: "simple", label: "Simple", desc: "Brief and straightforward" },
                            { value: "moderate", label: "Moderate", desc: "Balanced detail level" },
                            { value: "detailed", label: "Detailed", desc: "Comprehensive explanations" }
                          ].map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => form.setValue('preferredComplexity', option.value as any)}
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