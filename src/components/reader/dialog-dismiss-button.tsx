import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function DialogDismissButton({ onClose }: { onClose: () => void }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<Button variant="outline" size="icon" className="absolute right-2 top-2 rounded-full" aria-label="Close" onClick={onClose} />}>
        <XIcon />
      </TooltipTrigger>
      <TooltipContent>Close</TooltipContent>
    </Tooltip>
  );
}
