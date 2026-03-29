import { useCallback, useDeferredValue, useMemo, useState } from "react";
import {
  ArrowUpRightIcon,
  BookOpenIcon,
  Columns2Icon,
  SquareStackIcon,
} from "lucide-react";

import {
  buildReferenceCommandActions,
  parseReferenceCommandInput,
  type ReferenceCommandAction,
  type ReferenceCommandTarget,
} from "@/lib/reference-command";
import type { Book } from "@/types/bible";
import {
  Command,
  CommandDialog,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandInput,
} from "@/components/ui/command";

type ReferenceCommandDialogProps = {
  books: Book[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRunAction: (
    actionId: ReferenceCommandAction["id"],
    targets: ReferenceCommandTarget[],
  ) => void;
};

function actionIcon(actionId: ReferenceCommandAction["id"]) {
  switch (actionId) {
    case "single-new-tab":
    case "multiple-new-tabs":
      return ArrowUpRightIcon;
    case "single-new-panel":
      return Columns2Icon;
    case "multiple-single-tab":
    case "multiple-current-tab-panels":
      return SquareStackIcon;
  }
}

export function ReferenceCommandDialog({
  books,
  open,
  onOpenChange,
  onRunAction,
}: ReferenceCommandDialogProps) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const parsed = useMemo(
    () => parseReferenceCommandInput(deferredQuery, books),
    [books, deferredQuery],
  );
  const actions = useMemo(
    () => buildReferenceCommandActions(parsed.targets),
    [parsed.targets],
  );

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        setQuery("");
      }
      onOpenChange(nextOpen);
    },
    [onOpenChange],
  );

  const runAction = useCallback(
    (actionId: ReferenceCommandAction["id"]) => {
      if (parsed.targets.length === 0) {
        return;
      }
      onRunAction(actionId, parsed.targets);
      setQuery("");
      onOpenChange(false);
    },
    [onOpenChange, onRunAction, parsed.targets],
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Open References"
      description="Type one or more Bible references and choose how to open them."
      className="sm:max-w-2xl"
    >
      <Command shouldFilter={false}>
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder="Type references like John 3:16; Romans 8:1-2"
        />
        <CommandList className="max-h-[24rem] px-1 pb-1">
          {!query.trim() ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              Type a book, chapter, verse, or range to open it quickly.
            </div>
          ) : null}

          {query.trim() && actions.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              No recognizable references yet.
            </div>
          ) : null}

          {actions.length > 0 ? (
            <CommandGroup heading="Open">
              {actions.map((action: ReferenceCommandAction) => {
                const Icon = actionIcon(action.id);

                return (
                  <CommandItem
                    key={action.id}
                    value={action.label}
                    onSelect={() => runAction(action.id)}
                    className="items-start gap-3"
                  >
                    <Icon className="mt-0.5" aria-hidden="true" />
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="font-medium">{action.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {action.description}
                      </span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ) : null}

          {parsed.targets.length > 0 ? (
            <>
              <CommandSeparator />
              <CommandGroup heading={`References (${parsed.targets.length})`}>
                {parsed.targets.map((target) => (
                  <CommandItem
                    key={target.label}
                    value={target.label}
                    disabled
                    className="items-start gap-3 data-[disabled=true]:opacity-100"
                  >
                    <BookOpenIcon className="mt-0.5" aria-hidden="true" />
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="font-medium">{target.label}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          ) : null}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
