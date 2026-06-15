# GeoCopy 🗺️

GeoCopy is a high-performance, responsive Single Page Application (SPA) designed for rapid geographic place discovery and click-to-copy coordinate operations. Built using modern React, Tailwind CSS, Leaflet, and the OpenStreetMap (OSM) Nominatim API, it delivers a precise and seamless mapping utility.

## 🚀 Key Features

- **Leaflet Map Integration**: Load and toggle multiple high-quality satellite, topographic, and street map layers.
- **Dynamic Reverse Geocoding**: Click any point on the map to place a pin, instantly centering the viewport and querying the Nominatim API to fetch structured address data.
- **Click-to-Copy Latitude & Longitude**: Effortlessly copy latitude-only, longitude-only, or latitude/longitude coordinate pairs to your clipboard with custom popups and toasts.
- **Coordinate History List**: Access an automated local history feed that stores previously resolved points in browser storage (`localStorage`) for quick navigation.
- **Manual Coordinate Input**: Move the map camera and place pins directly via manual input boxes for accurate precision.
- **Geolocate User (GPS)**: Quick geolocation tool to pan and center the map on your exact GPS location.
- **Custom-Made Vector Brand Asset**: Styled with a professional logo icon detailing overlapped copies and a map pin.
- **High Contrast Dark/Light Mode**: Full theme customization matching operating system preferences or toggle switches.

---

## 🛠️ Tech Stack & Libraries

- **Framework**: [React 19](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
- **Build System**: [Vite](https://vite.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Maps**: [Leaflet API](https://leafletjs.com/) with lightweight react custom mounts
- **Animations**: [Framer Motion](https://www.framer.com/motion/) (`motion/react`)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 💻 Getting Started Locally

### Prerequisites

Make sure you have [Node.js (v20+)](https://nodejs.org/) installed along with `npm` (or `yarn`).

### Installation & Run

1. Clone or download the project files.
2. In the root directory, install all required dependencies:
   ```bash
   npm install
   ```

3. Start the development server locally:
   ```bash
   npm run dev
   ```
4. Open the development application in your browser by visiting `http://localhost:3000`.

---

## 🐳 Docker Deployment

The application has been fully dockerized with a production-ready, multi-stage layout using **Nginx Alpine** to serve secure and highly optimized assets.

### Using Docker Compose (Recommended)

To build and launch the container automatically, run:

```bash
docker-compose up -d --build
```

This will run the container in the background and expose it directly on host port `3000` (i.e. `http://localhost:3000`).

---

## 📄 License & Author

This utility is officially licensed under the **MIT License**. Created by **Marcos Oliveira** (2026).
