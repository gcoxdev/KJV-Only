import { useSyncExternalStore } from "react"

import {
  activateWaitingServiceWorker,
  checkForServiceWorkerUpdate,
  dismissWaitingServiceWorker,
  getPwaLifecycleSnapshot,
  refreshPwaLifecycleStatus,
  resetPwaApplication,
  subscribePwaLifecycle,
} from "@/lib/register-sw"

export function usePwaLifecycle() {
  const status = useSyncExternalStore(
    subscribePwaLifecycle,
    getPwaLifecycleSnapshot,
    getPwaLifecycleSnapshot,
  )

  return {
    status,
    activateUpdate: activateWaitingServiceWorker,
    checkForUpdate: checkForServiceWorkerUpdate,
    dismissUpdate: dismissWaitingServiceWorker,
    refreshStatus: refreshPwaLifecycleStatus,
    resetApplication: resetPwaApplication,
  }
}
