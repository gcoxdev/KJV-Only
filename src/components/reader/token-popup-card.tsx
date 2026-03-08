import type { VerseToken } from "@/types/bible";
import { formatDisplayTokenText } from "@/components/reader/chapter-text-content";
import { Card, CardContent } from "@/components/ui/card";

type TokenPopupCardProps = {
  token: VerseToken;
  x: number;
  y: number;
};

export function TokenPopupCard({ token, x, y }: TokenPopupCardProps) {
  return (
    <Card
      data-token-popup
      className="fixed z-50 w-[280px] shadow-lg"
      style={{ left: x, top: y }}
    >
      <CardContent className="space-y-2 p-3 text-sm">
        <p className="font-medium">{formatDisplayTokenText(token)}</p>
        {token.added ? (
          <p className="text-xs text-muted-foreground">
            Added word (italic in KJV typography)
          </p>
        ) : null}
        {token.strong ? (
          <p>
            <span className="text-muted-foreground">Strong&apos;s:</span>{" "}
            <span className="font-mono">{token.strong}</span>
          </p>
        ) : null}
        {token.lemma ? (
          <p>
            <span className="text-muted-foreground">Lemma:</span>{" "}
            <span className="font-mono">{token.lemma}</span>
          </p>
        ) : null}
        {token.morph ? (
          <p>
            <span className="text-muted-foreground">Morph:</span>{" "}
            <span className="font-mono">{token.morph}</span>
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
