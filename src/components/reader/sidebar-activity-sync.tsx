import { useEffect } from "react";

import { useSidebar } from "@/components/ui/sidebar";

export function SidebarActivitySync({ enabled, onDeactivate }: {
  enabled: boolean;
  onDeactivate: () => void;
}) {
  const { isMobile, open, openMobile } = useSidebar();
  const visible = enabled && (isMobile ? openMobile : open);

  // Closing by any route returns keyboard shortcuts to the workspace panel.
  useEffect(() => {
    if (!visible) onDeactivate();
  }, [visible, onDeactivate]);

  return null;
}
