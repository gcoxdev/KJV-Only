import { Card, CardHeader, CardTitle } from "@/components/ui/card";

type ReaderStatusScreenProps = {
  message: string;
};

export function ReaderStatusScreen({ message }: ReaderStatusScreenProps) {
  return (
    <main className="flex min-h-screen w-full items-center justify-center p-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <img
              src="/icons/app-icon.svg"
              alt="KJV Only app icon"
              className="h-16 w-16 object-contain"
            />
            <div className="space-y-1">
              <CardTitle className="text-xl">KJV Only</CardTitle>
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
          </div>
        </CardHeader>
      </Card>
    </main>
  );
}
