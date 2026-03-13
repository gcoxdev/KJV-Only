import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type RenameTabDialogProps = {
  open: boolean;
  value: string;
  error: string | null;
  onOpenChange: (open: boolean) => void;
  onValueChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
};

export function RenameTabDialog({
  open,
  value,
  error,
  onOpenChange,
  onValueChange,
  onCancel,
  onConfirm,
}: RenameTabDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
          onCancel();
        }
      }}
    >
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Relabel Tab</AlertDialogTitle>
          <AlertDialogDescription>
            Update the current tab label (minimum 1 character).
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Input
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          placeholder="Tab name"
          autoFocus
        />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <AlertDialogFooter className="group-data-[size=sm]/alert-dialog-content:flex group-data-[size=sm]/alert-dialog-content:flex-row group-data-[size=sm]/alert-dialog-content:justify-end justify-end sm:flex sm:justify-end">
          <AlertDialogCancel onClick={onCancel} className="w-auto">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={value.trim().length < 1}
            className="w-auto"
          >
            Save
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
