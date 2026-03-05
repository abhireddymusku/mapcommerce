"use client"

import Script from "next/script"

export default function Data360() {
  return (
    <Script
      src="https://cdn.c360a.salesforce.com/beacon/c360a/dccaf7d4-a0e1-4395-9e2b-0a1d89135d34/scripts/c360a.min.js"
      strategy="afterInteractive"
      onLoad={() => {
        const s = document.createElement("script")
        s.src = "/sitemap.js"
        s.async = true
        document.body.appendChild(s)
      }}
    />
  )
}
