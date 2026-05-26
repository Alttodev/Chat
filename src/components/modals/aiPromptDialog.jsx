import { Sparkles, WandSparkles, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { useAIPromptStore } from "@/lib/zustand";

const SUGGESTIONS = [
  "Write a catchy social media caption",
  "Make it short and attractive",
  "Add a professional tone",
  "Write something friendly and engaging",
  "Create a bio-style post",
];

export default function AIPromptDialog({ onGenerate }) {
  const { isOpen, prompt, isGenerating, setPrompt, closeDialog } =
    useAIPromptStore();

  const handleGenerate = async () => {
    await onGenerate(prompt);
    setPrompt("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="w-[95vw] max-w-xl overflow-hidden rounded-2xl border border-border bg-background p-0 shadow-2xl [&_button]:cursor-pointer">
        <div className="border-b border-border px-5 py-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-semibold sm:text-lg">
              <Sparkles className="h-5 w-5 text-sky-500" />
              Generate with AI
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Enter a prompt and let AI generate text for you.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Prompt
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: Write a catchy caption about coffee and coding..."
              className="min-h-[140px] resize-none rounded-2xl border-border bg-background text-sm leading-relaxed focus-visible:ring-2 focus-visible:ring-offset-0"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              Quick suggestions
            </p>

            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((item) => (
                <Badge
                  key={item}
                  variant="secondary"
                  onClick={() => setPrompt(item)}
                  className="cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition hover:bg-muted hover:text-foreground"
                >
                  {item}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex  gap-2 flex-row justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={closeDialog}
              className="rounded-full px-5"
              disabled={isGenerating}
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="rounded-full bg-emerald-600 px-5 text-white hover:bg-emerald-700 disabled:opacity-70"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <WandSparkles className="mr-2 h-4 w-4" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
