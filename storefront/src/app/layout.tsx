import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <body>
        <main className="relative">{props.children}</main>
      </body>
      {/* Data360 beacon CDN — copy this URL from Data360 Setup → Integration Guide */}
        import Script from "next/script"

// your existing layout code...

<Script
  src="https://cdn.c360a.salesforce.com/beacon/c360a/dccaf7d4-a0e1-4395-9e2b-0a1d89135d34/scripts/c360a.min.js"
  strategy="afterInteractive"
  onLoad={() => {
    const script = document.createElement("script")
    script.src = "/sitemap.js"
    document.body.appendChild(script)
  }}
/>
    </html>
  )
}
