import { useEffect, useRef } from "react";

import { useSidebar } from "@/components/ui/sidebar";

export function SidebarOpenRequestSync({
  requestKey,
  enabled,
}: {
  requestKey: number;
  enabled: boolean;
}) {
  const { isMobile, setOpen, setOpenMobile } = useSidebar();
  const previousRequestKeyRef = useRef(requestKey);

  useEffect(() => {
    if (!enabled) {
      previousRequestKeyRef.current = requestKey;
      return;
    }
    if (previousRequestKeyRef.current === requestKey) {
      return;
    }
    previousRequestKeyRef.current = requestKey;
    if (isMobile) {
      setOpenMobile(true);
    } else {
      setOpen(true);
    }
  }, [enabled, isMobile, requestKey, setOpen, setOpenMobile]);

  return null;
}
