// ============================================================
// Data360 / Salesforce Interactions SDK — Sitemap
// Site   : Medusa Demo Store
// URL    : https://storefront-production-fe70.up.railway.app
// Locale : /dk
// Schema events used: catalog (Engagement)
//                     contactPointEmail (Profile)
//                     identity (Profile)
// ============================================================

console.log("[Data360] sitemap.js loaded")

const SI = getSalesforceInteractions()

console.log("[Data360] getSalesforceInteractions()", SI)

SI.init({
  cookieDomain: "storefront-production-fe70.up.railway.app",
  // For demo purposes: all users are opted in by default immediately
  consents: new Promise((resolve) => {
    resolve([
      {
        provider: "Demo",
        purpose: SI.ConsentPurpose.Tracking,
        status: SI.ConsentStatus.OptIn,
      },
    ])
  }),
}).then(() => {

  console.log("[Data360] ✅ init complete")
  console.log("[Data360] anonymousId:", SI.getAnonymousId())
  console.log("[Data360] consents:", SI.getConsents())
  console.log("[Data360] current page:", window.location.pathname)

  // Helper: wait for price to appear in DOM (MedusaJS renders client-side)
  const waitForPrice = () =>
    new Promise((resolve) => {
      const read = () => {
        const el = Array.from(document.querySelectorAll("span, p, div")).find(
          (n) => n.children.length === 0 && /€\s*[\d.,]+/.test(n.textContent)
        )
        if (el) {
          const numeric = parseFloat(el.textContent.replace(/[^0-9.]/g, ""))
          console.log("[Data360] 💰 price found:", numeric)
          resolve(isNaN(numeric) ? null : numeric)
        } else {
          setTimeout(read, 300)
        }
      }
      read()
    })

  const sitemapConfig = {

    // ----------------------------------------------------------
    // GLOBAL
    // ----------------------------------------------------------
    global: {
      onActionEvent: (actionEvent) => {
        console.group("[Data360] 📡 EVENT FIRED")
        console.log("  type       :", actionEvent.action)
        console.log("  eventType  :", actionEvent.event?.eventType)
        console.log("  page       :", actionEvent.event?.sourceUrl || window.location.pathname)
        console.log("  full event :", actionEvent)
        console.groupEnd()
        return actionEvent
      },
    },

    // ----------------------------------------------------------
    // PAGE TYPES
    // ----------------------------------------------------------
    pageTypes: [

      // ── 1. PRODUCT DETAIL PAGE ──────────────────────────────
      {
        name: "productDetail",
        isMatch: () => {
          const match = /\/dk\/products\/[^/]+$/.test(window.location.pathname)
          if (match) console.log("[Data360] 📄 matched page: productDetail —", window.location.pathname)
          return match
        },
        interaction: {
          name: SI.CatalogObjectInteractionName.ViewCatalogObject,
          catalogObject: {
            type: "Product",
            id: () => window.location.pathname.split("/").pop(),
            attributes: {
              productName: () => {
                const el = document.querySelector("h2")
                const name = el ? el.textContent.trim() : null
                console.log("[Data360] 🏷️  productName:", name)
                return name
              },
              productPrice: () => waitForPrice(),
            },
          },
        },
      },

      // ── 2. CATEGORY PAGE ────────────────────────────────────
      {
        name: "categoryPage",
        isMatch: () => {
          const match = /\/dk\/categories\/[^/]+$/.test(window.location.pathname)
          if (match) console.log("[Data360] 📄 matched page: categoryPage —", window.location.pathname)
          return match
        },
        interaction: {
          name: SI.CatalogObjectInteractionName.ViewCatalogObject,
          catalogObject: {
            type: "Category",
            id: () => window.location.pathname.split("/").pop(),
          },
        },
      },

      // ── 3. STORE LISTING ────────────────────────────────────
      {
        name: "storeListing",
        isMatch: () => {
          const match = /\/dk\/store$/.test(window.location.pathname)
          if (match) console.log("[Data360] 📄 matched page: storeListing —", window.location.pathname)
          return match
        },
        interaction: {
          name: SI.CatalogObjectInteractionName.ViewCatalogObject,
          catalogObject: {
            type: "Category",
            id: "store",
          },
        },
      },

      // ── 4. ACCOUNT / LOGIN / REGISTER ───────────────────────
      {
        name: "account",
        isMatch: () => {
          const match = /\/dk\/account/.test(window.location.pathname)
          if (match) console.log("[Data360] 📄 matched page: account —", window.location.pathname)
          return match
        },
        interaction: {
          name: "View Account",
        },
        listeners: [
          SI.listener("submit", "form", async (event) => {
            const form = event.target
            const emailInput = form.querySelector(
              'input[type="email"], input[name="email"]'
            )
            if (!emailInput || !emailInput.value.trim()) return

            const email = emailInput.value.trim()
            const firstNameInput = form.querySelector(
              'input[name="first_name"], input[name="firstName"]'
            )
            const isRegister = !!firstNameInput

            console.group("[Data360] 📝 form submit detected")
            console.log("  isRegister:", isRegister)
            console.log("  email     :", email)
            console.groupEnd()

            if (isRegister) {
              const lastNameInput = form.querySelector(
                'input[name="last_name"], input[name="lastName"]'
              )
              const payload = {
                interaction: { name: "identity" },
                user: {
                  attributes: {
                    eventType: "identity",
                    email: email,
                    firstName: firstNameInput.value.trim() || null,
                    lastName: lastNameInput ? lastNameInput.value.trim() : null,
                    isAnonymous: "0",
                  },
                },
              }
              console.log("[Data360] 👤 sending identity event:", payload)
              await SI.sendEvent(payload)
              console.log("[Data360] ✅ identity event sent")
            } else {
              const payload = {
                interaction: { name: "contactPointEmail" },
                user: {
                  attributes: {
                    eventType: "contactPointEmail",
                    email: email,
                  },
                },
              }
              console.log("[Data360] 📧 sending contactPointEmail event:", payload)
              await SI.sendEvent(payload)
              console.log("[Data360] ✅ contactPointEmail event sent")
            }
          }),
        ],
      },

      // ── 5. CART ─────────────────────────────────────────────
      {
        name: "cart",
        isMatch: () => {
          const match = /\/dk\/cart$/.test(window.location.pathname)
          if (match) console.log("[Data360] 📄 matched page: cart —", window.location.pathname)
          return match
        },
        interaction: {
          name: "View Cart",
        },
      },

      // ── 6. DEFAULT FALLBACK ──────────────────────────────────
      {
        name: "default",
        isMatch: () => /\/dk/.test(window.location.pathname),
        interaction: {
          name: "View Page",
        },
      },

    ],
  }

  SI.initSitemap(sitemapConfig)
  console.log("[Data360] ✅ initSitemap complete — watching for page events")

})
