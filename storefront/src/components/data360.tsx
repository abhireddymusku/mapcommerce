"use client"

import Script from "next/script"

export default function Data360() {
  return (
    <Script
      src="https://cdn.c360a.salesforce.com/beacon/c360a/705e3cec-ac4f-4cc9-81ff-06bd6d14335b/scripts/c360a.min.js"
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
