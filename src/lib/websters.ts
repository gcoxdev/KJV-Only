const WEBSTER_LINE_BREAK = /<br\s*\/?\s*>/gi;

export function splitWebsterDefinitionLines(definition: string) {
  return definition.split(WEBSTER_LINE_BREAK);
}
