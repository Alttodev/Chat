import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gem } from "lucide-react";
import { useNavigate } from "react-router-dom";

function PremiumFeatureDialog({
  open,
  onOpenChange,
  title = "Premium Feature",
  description = "Get access to exclusive features, enhanced insights, and a better experience.",
}) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
  w-[calc(100%-2rem)] 
  max-w-[550px] 
  rounded-lg 
  p-4
  sm:rounded-xl
  [&_button]:cursor-pointer
"
      >
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <div className="rounded-full bg-emerald-100 p-3">
              <Gem className="h-6 w-6 text-emerald-600" />
            </div>
          </div>

          <DialogTitle className="text-center">{title}</DialogTitle>

          <DialogDescription className="text-center">
            {description}
          </DialogDescription>
        </DialogHeader>

        <Button
          className="w-full cursor-pointer bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:from-emerald-600 hover:to-teal-600 hover:shadow-xl"
          onClick={() => {
            onOpenChange(false);
            navigate("/subscription");
          }}
        >
          Upgrade
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default PremiumFeatureDialog;
