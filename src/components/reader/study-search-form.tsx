import { LoaderCircleIcon, SearchIcon } from "lucide-react";
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
  onSearch: (value: string) => void;
};

export function StudySearchForm({
  name,
  placeholder,
  ariaLabel,
  loading,
  value,
  inputRef,
  onSearch,
}: StudySearchFormProps) {
  const [draftValue, setDraftValue] = useState(value);

  useEffect(() => {
    setDraftValue(value);
  }, [value]);

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
          onChange={(event) => setDraftValue(event.target.value)}
        />
        <InputGroupAddon align="inline-end">
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
