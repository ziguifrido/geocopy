# GeoCopy Agent Instructions & Guidelines

This document outlines the codebase development standards, scoping rules, and design philosophy of the GeoCopy mapping and geocoding application.

## Core Directives

1. **Strict Usability Scope**:
   - GeoCopy must remain a fast, optimized, client-side single-view SPA.
   - Do NOT introduce unrequested secondary sidebars, navigation tabs, or complex routing systems.
   - Do NOT include any backend databases or cloud persistent layers unless explicitly requested.

2. **Technical Architecture**:
   - **Frontend Stack**: React 19, TypeScript, Vite, Tailwind CSS, Leaflet Maps, Framer Motion (`motion/react`) for transition styles.
   - **Styling**: Strictly utilize Tailwind utility classes directly. Ensure excellent accessibility contrast ratio.
   - **State Engine**: Clean React hook setups combined with safe persistent synchronization to browser `localStorage` (via keys like `geocopy_dark_mode` or `gmaps_coord_history`).
   - **Icons**: Always extract icons directly from `lucide-react`.

3. **External Services**:
   - Geocoding and reverse-geocoding requests must connect directly to the standard public and free **OpenStreetMap (OSM) Nominatim API**.
   - No paid tokens or secret API credentials should be implemented unless specified by the user.

4. **Design Quality (Premium Aesthetics)**:
   - Make all borders crisp and clean (`border-slate-200/80` or `dark:border-slate-800/80`).
   - Apply gorgeous gradients only where structurally relevant (e.g., header or primary button accent borders) and emphasize premium dark/light toggles.
   - Utilize `/src/assets/images/geocopy_logo_1781560704194.jpg` as the primary logo.
