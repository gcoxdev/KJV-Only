import { useCallback, useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

export function computePwaInstalled(
  displayModeStandalone: boolean,
  navigatorStandalone: boolean | undefined,
) {
  return displayModeStandalone || navigatorStandalone === true;
}

export function usePwaInstallation() {
  const [deferredInstallPrompt, setDeferredInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(display-mode: standalone)")
        : null;

    const computeInstalled = () =>
      computePwaInstalled(
        mediaQuery?.matches === true,
        (
          window.navigator as Navigator & {
            standalone?: boolean;
          }
        ).standalone,
      );

    const handleInstalledStateChange = () => {
      setIsPwaInstalled(computeInstalled());
    };

    const handleBeforeInstallPrompt = (event: Event) => {
      setDeferredInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredInstallPrompt(null);
      setIsPwaInstalled(true);
    };

    handleInstalledStateChange();
    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt as EventListener,
    );
    window.addEventListener("appinstalled", handleAppInstalled);
    mediaQuery?.addEventListener?.("change", handleInstalledStateChange);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt as EventListener,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
      mediaQuery?.removeEventListener?.("change", handleInstalledStateChange);
    };
  }, []);

  const installPwa = useCallback(async () => {
    if (!deferredInstallPrompt) {
      return;
    }

    const promptEvent = deferredInstallPrompt;
    setDeferredInstallPrompt(null);
    await promptEvent.prompt();
    const userChoice = await promptEvent.userChoice;
    if (userChoice.outcome === "accepted") {
      setIsPwaInstalled(true);
    }
  }, [deferredInstallPrompt]);

  return {
    canInstallPwa: deferredInstallPrompt !== null,
    isPwaInstalled,
    installPwa,
  };
}
