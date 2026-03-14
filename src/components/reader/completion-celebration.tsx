import { type CSSProperties, useMemo } from "react";
import { PartyPopperIcon, SparklesIcon } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type CompletionCelebrationProps = {
  open: boolean;
  showConfetti: boolean;
  verse: {
    reference: string;
    text: string;
  };
  onOpenChange: (open: boolean) => void;
};

const CONFETTI_COLORS = [
  "bg-amber-400",
  "bg-rose-400",
  "bg-sky-400",
  "bg-emerald-400",
  "bg-orange-400",
  "bg-violet-400",
];

export function CompletionCelebration({
  open,
  showConfetti,
  verse,
  onOpenChange,
}: CompletionCelebrationProps) {
  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 64 }, (_, index) => ({
        id: index,
        left: `${Math.random() * 100}%`,
        delay: `${Math.round(Math.random() * 700)}ms`,
        duration: `${2200 + Math.round(Math.random() * 1800)}ms`,
        rotateFrom: `${Math.round((Math.random() * 720) - 360)}deg`,
        rotateTo: `${Math.round((Math.random() * 1440) - 720)}deg`,
        driftX: `${Math.round((Math.random() * 120) - 60)}px`,
        width: `${8 + Math.round(Math.random() * 10)}px`,
        height: `${10 + Math.round(Math.random() * 16)}px`,
        radius: `${2 + Math.round(Math.random() * 10)}px`,
        color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
      })),
    [],
  );

  return (
    <>
      {showConfetti ? (
        <div className="pointer-events-none fixed inset-0 z-60 overflow-hidden" aria-hidden="true">
          {confettiPieces.map((piece) => (
            <span
              key={piece.id}
              className={`confetti-piece ${piece.color}`}
              style={{
                left: piece.left,
                animationDelay: piece.delay,
                animationDuration: piece.duration,
                "--confetti-rotate-from": piece.rotateFrom,
                "--confetti-rotate-to": piece.rotateTo,
                "--confetti-drift-x": piece.driftX,
                "--confetti-width": piece.width,
                "--confetti-height": piece.height,
                "--confetti-radius": piece.radius,
              } as CSSProperties}
            />
          ))}
        </div>
      ) : null}
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-primary/15 text-primary">
              <PartyPopperIcon />
            </AlertDialogMedia>
            <AlertDialogTitle>Congratulations!</AlertDialogTitle>
            <AlertDialogDescription>
              You reached 100% reading progress across the whole Bible.
            </AlertDialogDescription>
            <AlertDialogDescription>
              <span className="inline-flex items-center gap-1 font-medium text-foreground">
                <SparklesIcon className="size-4" />
                Finishing the full reading plan is no small thing.
              </span>
            </AlertDialogDescription>
            <div className="rounded-lg border border-subtle-divider bg-muted/40 p-3 text-left">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {verse.reference}
              </p>
              <p className="text-sm text-foreground">{verse.text}</p>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="group-data-[size=sm]/alert-dialog-content:flex group-data-[size=sm]/alert-dialog-content:grid-cols-none justify-end sm:justify-end">
            <AlertDialogAction className="w-auto self-auto" onClick={() => onOpenChange(false)}>
              Amen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
