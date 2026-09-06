import { useId } from "react";

import { Badge } from "@/components/ui/badge";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Combobox, ComboboxInput, ComboboxContent, ComboboxEmpty,
  ComboboxList, ComboboxItem, ComboboxGroup, ComboboxCollection,
} from "@/components/ui/combobox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { organizationError, type StudyOrganization } from "@/lib/study-organization";
import { cn } from "@/lib/utils";

export function OrganizationBadges({ item }: { item: StudyOrganization }) {
  if (!item.folder && !item.tags?.length) return null;
  return (
    <div className="flex flex-wrap gap-1 py-1">
      {item.folder && (
        <Badge variant="outline" className="max-w-full whitespace-normal break-words">
          Folder: {item.folder}
        </Badge>
      )}
      {item.tags?.map((tag) => (
        <Badge key={tag} variant="secondary" className="max-w-full whitespace-normal break-words">
          #{tag}
        </Badge>
      ))}
    </div>
  );
}

type OrganizationFieldsProps = {
  folder: string;
  tagsText: string;
  onFolderChange: (value: string) => void;
  onTagsChange: (value: string) => void;
  items: StudyOrganization[];
};

export function OrganizationFields({
  folder, tagsText, onFolderChange, onTagsChange, items,
}: OrganizationFieldsProps) {
  const id = useId();
  const error = organizationError(folder, tagsText);
  const folders = [...new Set(items.map((item) => item.folder).filter(Boolean))].sort();
  return (
    <FieldGroup className="gap-3">
      <Field>
        <FieldLabel htmlFor={`${id}-folder`}>Folder</FieldLabel>
        <Combobox
          items={folders}
          value={folder || null}
          inputValue={folder}
          onInputValueChange={(value) => onFolderChange(value)}
          onValueChange={(value) => onFolderChange(value ?? "")}
        >
          <ComboboxInput id={`${id}-folder`} className="w-full" maxLength={80} placeholder="Unfiled" />
          <ComboboxContent>
            <ComboboxEmpty>{folder.trim() ? "New folder — saved with this item." : "Type a name to create a folder."}</ComboboxEmpty>
            <ComboboxList>
              <ComboboxGroup>
                <ComboboxCollection>
                  {(name: string) => <ComboboxItem key={name} value={name}>{name}</ComboboxItem>}
                </ComboboxCollection>
              </ComboboxGroup>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </Field>
      <Field>
        <FieldLabel htmlFor={`${id}-tags`}>Tags</FieldLabel>
        <Input
          id={`${id}-tags`}
          value={tagsText}
          onChange={(event) => onTagsChange(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={`${id}-help`}
        />
        <p id={`${id}-help`} className="text-xs text-muted-foreground">
          {error ?? "Separate tags with commas. Leave the folder blank to keep this item unfiled."}
        </p>
      </Field>
    </FieldGroup>
  );
}

type OrganizationFiltersProps = {
  className?: string;
  items: StudyOrganization[];
  folder: string;
  tag: string;
  onFolderChange: (value: string) => void;
  onTagChange: (value: string) => void;
};

export function OrganizationFilters({
  className, items, folder, tag, onFolderChange, onTagChange,
}: OrganizationFiltersProps) {
  const folders = new Map<string, string>();
  const tags = new Map<string, string>();
  for (const item of items) {
    if (item.folder?.trim()) folders.set(`folder:${item.folder.toLowerCase()}`, item.folder);
    for (const value of item.tags ?? []) tags.set(`tag:${value.toLowerCase()}`, value);
  }
  const sortedOptions = (values: Map<string, string>) =>
    Array.from(values, ([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  const controls = [
    {
      label: "Filter by folder",
      value: folder,
      change: onFolderChange,
      options: [
        { value: "all", label: "All folders" },
        { value: "unfiled", label: "Unfiled" },
        ...sortedOptions(folders),
      ],
    },
    {
      label: "Filter by tag",
      value: tag,
      change: onTagChange,
      options: [
        { value: "all", label: "All tags" },
        { value: "untagged", label: "Untagged" },
        ...sortedOptions(tags),
      ],
    },
  ];
  return (
    <div className={cn("grid min-w-0 grid-cols-1 gap-2 p-2", className)}>
      {controls.map((control) => (
        <Select
          key={control.label}
          items={control.options}
          value={control.value}
          onValueChange={(value) => control.change(value ?? "all")}
        >
          <SelectTrigger aria-label={control.label} className="w-full min-w-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {control.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      ))}
    </div>
  );
}
