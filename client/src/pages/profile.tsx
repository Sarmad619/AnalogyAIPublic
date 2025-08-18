import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserCog, Heart, Settings, Save, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { updateProfileSchema } from "@shared/schema";
import { api, type UserProfile } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { LoadingState } from "@/components/loading-state";

type ProfileFormData = {
  displayName?: string;
  defaultKnowledgeLevel?: "beginner" | "intermediate" | "advanced";
  analogyStyle?: "conversational" | "technical" | "creative";
  saveHistory?: boolean;
};

export default function ProfilePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newInterest, setNewInterest] = useState("");

  // Get user profile
  const { data: profile, isLoading, error } = useQuery<UserProfile>({
    queryKey: ["/api/profile"],
    refetchOnWindowFocus: false,
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(updateProfileSchema.omit({ personalizationInterests: true })),
    defaultValues: {
      displayName: profile?.displayName || "",
      defaultKnowledgeLevel: profile?.defaultKnowledgeLevel || "intermediate",
      analogyStyle: profile?.analogyStyle || "conversational",
      saveHistory: profile?.saveHistory ?? true,
    },
  });

  // Update form when profile loads
  useState(() => {
    if (profile) {
      form.reset({
        displayName: profile.displayName,
        defaultKnowledgeLevel: profile.defaultKnowledgeLevel,
        analogyStyle: profile.analogyStyle,
        saveHistory: profile.saveHistory,
      });
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: api.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Profile Updated",
        description: "Your preferences have been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addInterestMutation = useMutation({
    mutationFn: async (interest: string) => {
      if (!profile) throw new Error("Profile not loaded");
      const updatedInterests = [...profile.personalizationInterests, interest.trim()];
      return api.updateProfile({ personalizationInterests: updatedInterests });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      setNewInterest("");
      toast({
        title: "Interest Added",
        description: "Your new interest has been added to your profile.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Add Interest",
        description: error.message || "Could not add interest. Please try again.",
        variant: "destructive",
      });
    },
  });

  const removeInterestMutation = useMutation({
    mutationFn: async (interestToRemove: string) => {
      if (!profile) throw new Error("Profile not loaded");
      const updatedInterests = profile.personalizationInterests.filter(
        interest => interest !== interestToRemove
      );
      return api.updateProfile({ personalizationInterests: updatedInterests });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Interest Removed",
        description: "The interest has been removed from your profile.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Remove Interest",
        description: error.message || "Could not remove interest. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !profile?.personalizationInterests.includes(newInterest.trim())) {
      addInterestMutation.mutate(newInterest);
    }
  };

  const handleRemoveInterest = (interest: string) => {
    removeInterestMutation.mutate(interest);
  };

  if (error) {
    return (
      <div className="min-h-screen pt-16">
        <div className="bg-animated" />
        <div className="relative max-w-4xl mx-auto px-4 py-12">
          <div className="glassmorphism-strong rounded-2xl p-8 text-center">
            <p className="text-red-400 mb-4">Failed to load profile</p>
            <p className="text-gray-400">{error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16">
        <div className="bg-animated" />
        <div className="relative max-w-4xl mx-auto px-4 py-12">
          <LoadingState message="Loading your profile..." submessage="Getting your personalization settings..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="bg-animated" />
      
      <div className="relative max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-8 text-center flex items-center justify-center">
          <UserCog className="mr-3 text-cyan-400" size={32} />
          Personalization Settings
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Interests Management */}
          <div className="glassmorphism-strong rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Heart className="mr-2 text-pink-400" size={20} />
              Your Interests
            </h3>
            <p className="text-gray-400 text-sm mb-6">Add interests to get more personalized analogies</p>
            
            {/* Current Interests */}
            <div className="flex flex-wrap gap-2 mb-4">
              {profile?.personalizationInterests.map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 rounded-full text-sm flex items-center"
                >
                  {interest}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveInterest(interest)}
                    disabled={removeInterestMutation.isPending}
                    className="ml-2 p-0 h-auto text-cyan-400 hover:text-red-400 transition-colors"
                  >
                    <X size={12} />
                  </Button>
                </span>
              ))}
              {(!profile?.personalizationInterests || profile.personalizationInterests.length === 0) && (
                <p className="text-gray-500 text-sm italic">No interests added yet</p>
              )}
            </div>

            {/* Add New Interest */}
            <div className="flex gap-2">
              <Input
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="Add new interest..."
                className="flex-1 glassmorphism border-glass-border focus:border-cyan-400 focus:ring-cyan-400/20 text-white placeholder-gray-400 text-sm"
                disabled={addInterestMutation.isPending}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddInterest();
                  }
                }}
              />
              <Button
                onClick={handleAddInterest}
                disabled={!newInterest.trim() || addInterestMutation.isPending}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>

          {/* Learning Preferences */}
          <div className="glassmorphism-strong rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Settings className="mr-2 text-blue-400" size={20} />
              Learning Preferences
            </h3>
            <p className="text-gray-400 text-sm mb-6">Customize how analogies are generated for you</p>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-300">Display Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="glassmorphism border-glass-border focus:border-cyan-400 focus:ring-cyan-400/20 text-white placeholder-gray-400 text-sm"
                          placeholder="Enter your display name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="defaultKnowledgeLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-300">Default Knowledge Level</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="glassmorphism border-glass-border focus:border-cyan-400 focus:ring-cyan-400/20 text-white text-sm">
                            <SelectValue placeholder="Select knowledge level" />
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
                
                <FormField
                  control={form.control}
                  name="analogyStyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-300">Analogy Style</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="glassmorphism border-glass-border focus:border-cyan-400 focus:ring-cyan-400/20 text-white text-sm">
                            <SelectValue placeholder="Select analogy style" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="conversational">Conversational</SelectItem>
                          <SelectItem value="technical">Technical</SelectItem>
                          <SelectItem value="creative">Creative</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="saveHistory"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel className="text-sm font-medium text-gray-300">Save analogy history</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium py-3 transition-all mt-6"
                >
                  <Save className="mr-2" size={16} />
                  {updateProfileMutation.isPending ? "Saving..." : "Save Preferences"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
