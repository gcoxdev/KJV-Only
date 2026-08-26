import { Component, type ReactNode } from "react"

import { KJVReader } from "@/components/reader/kjv-reader"
import { ReaderStatusScreen } from "@/components/reader/reader-status-screen"

type AppErrorBoundaryState = {
  hasError: boolean
}

class AppErrorBoundary extends Component<
  { children: ReactNode },
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      const isOffline =
        typeof navigator !== "undefined" && navigator.onLine === false
      return (
        <ReaderStatusScreen
          message={
            isOffline
              ? "Some application files are unavailable offline. Reconnect and reload once to refresh the offline copy."
              : "The application could not finish loading. Reload to try again."
          }
        />
      )
    }

    return this.props.children
  }
}

export function App() {
  return (
    <AppErrorBoundary>
      <KJVReader />
    </AppErrorBoundary>
  )
}

export default App
