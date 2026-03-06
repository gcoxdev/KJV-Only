import * as React from "react"
import {
  PanelRightCloseIcon,
  PanelRightOpenIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type SidebarContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider")
  }
  return context
}

type SidebarProviderProps = React.ComponentProps<"div"> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange,
  className,
  children,
  ...props
}: SidebarProviderProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const open = openProp ?? uncontrolledOpen

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (openProp === undefined) {
        setUncontrolledOpen(nextOpen)
      }
      onOpenChange?.(nextOpen)
    },
    [onOpenChange, openProp]
  )

  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      <div
        data-slot="sidebar-provider"
        data-state={open ? "expanded" : "collapsed"}
        className={cn("flex min-h-screen w-full", className)}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

function SidebarInset({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-inset"
      className={cn("min-w-0 flex-1", className)}
      {...props}
    />
  )
}

type SidebarProps = React.ComponentProps<"aside"> & {
  side?: "left" | "right"
}

function Sidebar({
  side = "left",
  className,
  children,
  ...props
}: SidebarProps) {
  const { open } = useSidebar()

  return (
    <aside
      data-slot="sidebar"
      data-side={side}
      data-state={open ? "expanded" : "collapsed"}
      className={cn(
        "h-full shrink-0 overflow-hidden bg-sidebar text-sidebar-foreground transition-[width,border-color] duration-200 ease-linear",
        "data-[state=expanded]:w-80 data-[state=collapsed]:w-0",
        side === "right"
          ? "border-l data-[state=collapsed]:border-l-transparent"
          : "border-r data-[state=collapsed]:border-r-transparent",
        className
      )}
      {...props}
    >
      {children}
    </aside>
  )
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  const { open } = useSidebar()

  return (
    <div
      data-slot="sidebar-header"
      data-state={open ? "expanded" : "collapsed"}
      className={cn(
        "border-b p-4 transition-opacity",
        "data-[state=collapsed]:pointer-events-none data-[state=collapsed]:opacity-0",
        className
      )}
      {...props}
    />
  )
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  const { open } = useSidebar()

  return (
    <div
      data-slot="sidebar-content"
      data-state={open ? "expanded" : "collapsed"}
      className={cn(
        "p-4 text-sm transition-opacity",
        "data-[state=collapsed]:pointer-events-none data-[state=collapsed]:opacity-0",
        className
      )}
      {...props}
    />
  )
}

type SidebarTriggerProps = Omit<React.ComponentProps<typeof Button>, "onClick"> & {
  side?: "left" | "right"
}

function SidebarTrigger({
  side = "left",
  className,
  ...props
}: SidebarTriggerProps) {
  const { open, setOpen } = useSidebar()

  const Icon =
    side === "right"
      ? open
        ? PanelRightCloseIcon
        : PanelRightOpenIcon
      : open
        ? PanelLeftCloseIcon
        : PanelLeftOpenIcon

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
      onClick={() => setOpen(!open)}
      className={cn(className)}
      {...props}
    >
      <Icon />
    </Button>
  )
}

function SidebarRail({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-rail"
      className={cn("hidden", className)}
      {...props}
    />
  )
}

export {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
}
