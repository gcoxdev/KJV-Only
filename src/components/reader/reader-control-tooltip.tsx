import { useState, type ReactElement } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ReaderControlTooltip({
  children,
  label,
  side = "top",
  disabled = false,
}: {
  children: ReactElement;
  label: string;
  side?: "top" | "bottom";
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const hoverProps = {
    onPointerEnter: (event: React.PointerEvent) => {
      if (event.pointerType === "mouse") setOpen(true);
    },
    onPointerLeave: () => setOpen(false),
  };

  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      {disabled ? (
        <TooltipTrigger {...hoverProps} render={<span className="inline-flex" />}>
          {children}
        </TooltipTrigger>
      ) : (
        <TooltipTrigger {...hoverProps} render={children} />
      )}
      <TooltipContent side={side}>{label}</TooltipContent>
    </Tooltip>
  );
}
