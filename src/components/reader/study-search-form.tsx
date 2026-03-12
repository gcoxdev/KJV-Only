import { LoaderCircleIcon, SearchIcon } from "lucide-react";
import { type Ref } from "react";

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
  inputRef?: Ref<HTMLInputElement>;
  onSearch: (value: string) => void;
};

export function StudySearchForm({
  name,
  placeholder,
  ariaLabel,
  loading,
  inputRef,
  onSearch,
}: StudySearchFormProps) {
  return (
    <form
      className="w-full"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const value = formData.get(name);
        onSearch(typeof value === "string" ? value : "");
      }}
    >
      <InputGroup className="bg-workspace-panel-elevated">
        <InputGroupInput
          ref={inputRef}
          name={name}
          placeholder={placeholder}
          className="bg-transparent"
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
