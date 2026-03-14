import { useEffect, useRef } from "react";

import { useSidebar } from "@/components/ui/sidebar";

export function SidebarCloseRequestSync({
  requestKey,
  enabled,
}: {
  requestKey: number;
  enabled: boolean;
}) {
  const { isMobile, setOpenMobile } = useSidebar();
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
      setOpenMobile(false);
    }
  }, [enabled, isMobile, requestKey, setOpenMobile]);

  return null;
}
