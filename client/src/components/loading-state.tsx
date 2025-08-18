import { Brain } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  submessage?: string;
}

export function LoadingState({ 
  message = "AI is crafting your personalized analogy...", 
  submessage = "This usually takes 10-15 seconds" 
}: LoadingStateProps) {
  return (
    <div className="glassmorphism-strong rounded-2xl p-8 shadow-2xl">
      <div className="flex items-center justify-center space-x-4">
        <div className="loading-pulse">
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
            <Brain className="text-white" size={16} />
          </div>
        </div>
        <div>
          <p className="text-lg font-medium text-white">{message}</p>
          <p className="text-sm text-gray-400">{submessage}</p>
        </div>
      </div>
      <div className="mt-4 w-full glassmorphism rounded-full h-2">
        <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
      </div>
    </div>
  );
}
