import { Card, CardHeader, CardTitle } from "@/components/ui/card";

type ReaderStatusScreenProps = {
  message: string;
};

export function ReaderStatusScreen({ message }: ReaderStatusScreenProps) {
  return (
    <main className="flex min-h-screen w-full items-center justify-center p-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-xl">KJV Only</CardTitle>
          <p className="text-sm text-muted-foreground">{message}</p>
        </CardHeader>
      </Card>
    </main>
  );
}
