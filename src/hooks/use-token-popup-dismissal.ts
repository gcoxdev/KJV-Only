import { useEffect, type Dispatch, type SetStateAction } from "react";

import type { TokenPopupState } from "@/types/reader";

export function useTokenPopupDismissal(
  isOpen: boolean,
  setTokenPopup: Dispatch<SetStateAction<TokenPopupState | null>>,
) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function onPointerDown(event: PointerEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-token-popup]")) {
        return;
      }
      setTokenPopup(null);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setTokenPopup(null);
      }
    }

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, setTokenPopup]);
}
