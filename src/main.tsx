import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App.tsx"
import { registerServiceWorker } from "@/lib/register-sw"

registerServiceWorker()

const app = <App />

createRoot(document.getElementById("root")!).render(
  import.meta.env.DEV ? app : <StrictMode>{app}</StrictMode>
)
