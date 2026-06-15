/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Interface representing an item in the user's saved coordinates history.
 */
export interface HistoryItem {
  /** Unique identifier for the item (usually timestamp as a string) */
  id: string;
  /** Geographical latitude */
  lat: number;
  /** Geographical longitude */
  lng: number;
  /** Resolved address string from reverse geocoding */
  address: string;
  /** Timestamp in milliseconds of when the item was saved */
  timestamp: number;
}

/**
 * Interface representing the structure of a place returned by the OpenStreetMap Nominatim API.
 */
export interface SearchPlace {
  /** OpenStreetMap place ID */
  place_id: number;
  /** Full address / display name */
  display_name: string;
  /** Geographical latitude as a string */
  lat: string;
  /** Geographical longitude as a string */
  lon: string;
}

/**
 * Definitions and URLs of map layer providers supported by the application.
 */
export const MAP_LAYERS = {
  streets: {
    id: 'streets',
    name: 'Default (OpenStreetMap)',
    description: 'Complete with points of interest (POIs), streets, and establishments',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    subdomains: 'abc'
  },
  voyager: {
    id: 'voyager',
    name: 'Clear City (CartoDB)',
    description: 'Minimalist and modern style with clean pathways',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20,
    subdomains: 'abcd'
  },
  satellite: {
    id: 'satellite',
    name: 'Satellite',
    description: 'High-precision aerial imagery of the terrain',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 19,
    subdomains: ''
  },
  topo: {
    id: 'topo',
    name: 'Elevation / Topo',
    description: 'Contour lines and topographic relief',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Data: &copy; OSM contributors, SRTM | Style: &copy; OpenTopoMap (CC-BY-SA)',
    maxZoom: 17,
    subdomains: 'abc'
  },
  dark: {
    id: 'dark',
    name: 'Night Vision',
    description: 'Dark layer with excellent contrast at night',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20,
    subdomains: 'abcd'
  }
} as const;

/**
 * Type representing valid map layer IDs.
 */
export type LayerId = keyof typeof MAP_LAYERS;
