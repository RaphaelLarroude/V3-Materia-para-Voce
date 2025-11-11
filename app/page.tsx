"use client"

import dynamic from "next/dynamic"

// Dynamically import App to avoid SSR issues
const App = dynamic(() => import("../App"), { ssr: false })

export default function Page() {
  return <App />
}
