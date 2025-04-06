import { Sparkles as SparklesIcon } from "lucide-react";

export function ChatTitle() {
  return (
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center gap-2">
        <SparklesIcon className="w-6 h-6 text-orange-500" />
        <h1 className="text-4xl font-serif">What's on your mind tonight?</h1>
      </div>
    </div>
  );
}
