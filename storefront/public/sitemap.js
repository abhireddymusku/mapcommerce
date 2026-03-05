// ============================================================
// Data360 / Salesforce Interactions SDK — Sitemap
// Site   : Medusa Demo Store
// URL    : https://storefront-production-fe70.up.railway.app
// Locale : /dk
// Schema events used: catalog (Engagement)
//                     contactPointEmail (Profile)
//                     identity (Profile)
// ============================================================

SalesforceInteractions.init({
  cookieDomain: "storefront-production-fe70.up.railway.app",
}).then(() => {

  // Helper: wait for a DOM element matching a price (€) to appear,
  // then return the numeric value. MedusaJS renders price client-side.
  const waitForPrice = () =>
    new Promise((resolve) => {
      const read = () => {
        const el = Array.from(document.querySelectorAll("span, p, div")).find(
          (n) => n.children.length === 0 && /€\s*[\d.,]+/.test(n.textContent)
        );
        if (el) {
          const numeric = parseFloat(el.textContent.replace(/[^0-9.]/g, ""));
          resolve(isNaN(numeric) ? null : numeric);
        } else {
          setTimeout(read, 300);
        }
      };
      read();
    });

  const sitemapConfig = {

    // ----------------------------------------------------------
    // GLOBAL
    // ----------------------------------------------------------
    global: {
      onActionEvent: (actionEvent) => actionEvent,
    },

    // ----------------------------------------------------------
    // PAGE TYPES
    // ----------------------------------------------------------
    pageTypes: [

      // ── 1. PRODUCT DETAIL PAGE ──────────────────────────────
      // Fires a "catalog" Engagement event with:
      //   id           = product slug (e.g. "sweatshirt")
      //   type         = "Product"
      //   productName  → mapped to schema field: productName (Text)
      //   productPrice → mapped to schema field: productPrice (Number)
      {
        name: "productDetail",
        isMatch: () => /\/dk\/products\/[^/]+$/.test(window.location.pathname),
        interaction: {
          name: SalesforceInteractions.CatalogObjectInteractionName.ViewCatalogObject,
          catalogObject: {
            type: "Product",
            id: () => window.location.pathname.split("/").pop(),
            attributes: {
              productName: () => {
                const el = document.querySelector("h2");
                return el ? el.textContent.trim() : null;
              },
              productPrice: () => waitForPrice(),
            },
          },
        },
      },

      // ── 2. CATEGORY PAGE ────────────────────────────────────
      // Fires a "catalog" Engagement event with:
      //   id   = category slug (e.g. "shirts")
      //   type = "Category"
      {
        name: "categoryPage",
        isMatch: () => /\/dk\/categories\/[^/]+$/.test(window.location.pathname),
        interaction: {
          name: SalesforceInteractions.CatalogObjectInteractionName.ViewCatalogObject,
          catalogObject: {
            type: "Category",
            id: () => window.location.pathname.split("/").pop(),
          },
        },
      },

      // ── 3. STORE LISTING ────────────────────────────────────
      {
        name: "storeListing",
        isMatch: () => /\/dk\/store$/.test(window.location.pathname),
        interaction: {
          name: SalesforceInteractions.CatalogObjectInteractionName.ViewCatalogObject,
          catalogObject: {
            type: "Category",
            id: "store",
          },
        },
      },

      // ── 4. ACCOUNT / LOGIN / REGISTER ───────────────────────
      // Login  → fires "contactPointEmail" Profile event (email only)
      // Register → fires "identity" Profile event (email + name)
      {
        name: "account",
        isMatch: () => /\/dk\/account/.test(window.location.pathname),
        interaction: {
          name: "View Account",
        },
        listeners: [
          SalesforceInteractions.listener("submit", "form", async (event) => {
            const form = event.target;
            const emailInput = form.querySelector(
              'input[type="email"], input[name="email"]'
            );
            if (!emailInput || !emailInput.value.trim()) return;

            const email = emailInput.value.trim();
            const firstNameInput = form.querySelector(
              'input[name="first_name"], input[name="firstName"]'
            );
            const isRegister = !!firstNameInput;

            if (isRegister) {
              // ── REGISTER: fire "identity" event ──────────────
              const lastNameInput = form.querySelector(
                'input[name="last_name"], input[name="lastName"]'
              );
              await SalesforceInteractions.sendEvent({
                interaction: {
                  name: "identity",
                },
                user: {
                  attributes: {
                    eventType: "identity",
                    email: email,
                    firstName: firstNameInput.value.trim() || null,
                    lastName: lastNameInput ? lastNameInput.value.trim() : null,
                    isAnonymous: "0",
                  },
                },
              });
            } else {
              // ── LOGIN: fire "contactPointEmail" event ─────────
              await SalesforceInteractions.sendEvent({
                interaction: {
                  name: "contactPointEmail",
                },
                user: {
                  attributes: {
                    eventType: "contactPointEmail",
                    email: email,
                  },
                },
              });
            }
          }),
        ],
      },

      // ── 5. CART ─────────────────────────────────────────────
      {
        name: "cart",
        isMatch: () => /\/dk\/cart$/.test(window.location.pathname),
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
  };

  SalesforceInteractions.initSitemap(sitemapConfig);
});
