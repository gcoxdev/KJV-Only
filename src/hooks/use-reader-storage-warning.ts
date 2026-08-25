import { useEffect } from "react";
import { toast } from "sonner";

import {
  consumeLocalStorageIssueKeys,
  LOCAL_STORAGE_ISSUE_EVENT,
} from "@/lib/local-storage";

export function useReaderStorageWarning() {
  useEffect(() => {
    let lastNotifiedAt = 0;
    const notify = () => {
      const issueKeys = consumeLocalStorageIssueKeys();
      if (issueKeys.length === 0 || Date.now() - lastNotifiedAt < 1_000) {
        return;
      }
      lastNotifiedAt = Date.now();
      toast.warning("Some saved reader data could not be used.", {
        description:
          "The reader recovered safely. Export important notes/bookmarks before clearing site data if the warning continues.",
      });
    };

    notify();
    window.addEventListener(LOCAL_STORAGE_ISSUE_EVENT, notify);
    return () => window.removeEventListener(LOCAL_STORAGE_ISSUE_EVENT, notify);
  }, []);
}
