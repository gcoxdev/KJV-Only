import { LoaderCircleIcon, SearchIcon, XIcon } from "lucide-react";
import { type Ref, useEffect, useState } from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

type StudySearchFormProps = {
  name: string;
  placeholder: string;
  ariaLabel: string;
  loading: boolean;
  value: string;
  inputRef?: Ref<HTMLInputElement>;
  liveSearch?: boolean;
  allowReset?: boolean;
  onSearch: (value: string) => void;
};

export function shouldShowStudySearchResetButton(
  allowReset: boolean,
  draftValue: string,
) {
  return allowReset && draftValue.trim().length > 0;
}

export function resetStudySearchDraft(
  setDraftValue: (value: string) => void,
  onSearch: (value: string) => void,
) {
  setDraftValue("");
  onSearch("");
}

export function StudySearchForm({
  name,
  placeholder,
  ariaLabel,
  loading,
  value,
  inputRef,
  liveSearch = false,
  allowReset = false,
  onSearch,
}: StudySearchFormProps) {
  const [draftValue, setDraftValue] = useState(value);

  useEffect(() => {
    setDraftValue(value);
  }, [value]);

  const showResetButton = shouldShowStudySearchResetButton(
    allowReset,
    draftValue,
  );

  return (
    <form
      className="w-full"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch(draftValue);
      }}
    >
      <InputGroup className="bg-workspace-panel-elevated">
        <InputGroupInput
          ref={inputRef}
          name={name}
          placeholder={placeholder}
          className="bg-transparent"
          value={draftValue}
          onChange={(event) => {
            const nextValue = event.target.value;
            setDraftValue(nextValue);
            if (liveSearch) {
              onSearch(nextValue);
            }
          }}
        />
        <InputGroupAddon align="inline-end" className="gap-0.5">
          {allowReset ? (
            <InputGroupButton
              type="button"
              size="icon-sm"
              variant="ghost"
              className={
                showResetButton
                  ? "justify-center"
                  : "pointer-events-none invisible justify-center"
              }
              aria-label="Reset search"
              disabled={!showResetButton}
              onClick={() => resetStudySearchDraft(setDraftValue, onSearch)}
            >
              <XIcon />
            </InputGroupButton>
          ) : null}
          <InputGroupButton
            type="submit"
            size="icon-sm"
            variant="ghost"
            className="justify-center"
            aria-label={ariaLabel}
            disabled={loading}
          >
            {loading ? (
              <LoaderCircleIcon className="animate-spin" />
            ) : (
              <SearchIcon />
            )}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}
