import Script from "next/script"
import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"
import Data360 from "@/components/data360"

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

<Data360 />
    </html>
  )
}
