import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FN_DIR = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.resolve(FN_DIR, '../../data/hubs-ni.json');
const POSTCODES_IO_BASE = 'https://api.postcodes.io';
const MAX_RESULTS = 67;

/** @type {Array<{name:string,address:string,postcode:string,region?:string,latitude?:number|null,longitude?:number|null}> | null} */
let cachedStations = null;
let coordsCache = new Map();

function normalizePostcode(value = '') {
  return value.replace(/\s+/g, '').toUpperCase();
}

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const payload = await response.json();
  if (!response.ok || payload.status >= 400) {
    const message = payload?.error || payload?.message || response.statusText;
    throw new Error(message || 'Request failed');
  }
  return payload;
}

async function lookupPostcode(postcode) {
  const trimmed = postcode.trim();
  if (!trimmed) throw new Error('Postcode is required');

  const normalized = normalizePostcode(trimmed);
  const directUrl = `${POSTCODES_IO_BASE}/postcodes/${encodeURIComponent(normalized)}`;

  try {
    const payload = await fetchJson(directUrl);
    const result = payload.result;
    return {
      postcode: result.postcode,
      latitude: result.latitude,
      longitude: result.longitude
    };
  } catch (error) {
    // fall back to fuzzy search
    const searchUrl = `${POSTCODES_IO_BASE}/postcodes?q=${encodeURIComponent(trimmed)}&limit=1`;
    const payload = await fetchJson(searchUrl);
    const [result] = Array.isArray(payload.result) ? payload.result : [];
    if (!result) {
      throw new Error('未找到对应邮编');
    }
    return {
      postcode: result.postcode,
      latitude: result.latitude,
      longitude: result.longitude
    };
  }
}

async function loadStations() {
  if (cachedStations) return cachedStations;
  const contents = await readFile(DATA_PATH, 'utf8');
  cachedStations = JSON.parse(contents).map((station) => ({
    name: station.name,
    address: station.address,
    postcode: station.postcode,
    region: station.region,
    latitude: isFiniteNumber(station.latitude) ? station.latitude : null,
    longitude: isFiniteNumber(station.longitude) ? station.longitude : null
  }));
  return cachedStations;
}

async function hydrateCoordinates(stations) {
  const missing = stations.filter(
    (station) => !isFiniteNumber(station.latitude) || !isFiniteNumber(station.longitude)
  );

  if (!missing.length) return stations;

  const uniquePostcodes = [...new Set(missing.map((station) => normalizePostcode(station.postcode)).filter(Boolean))]
    .filter((code) => !coordsCache.has(code));

  const chunkSize = 90; // API limit is 100 per request
  for (let i = 0; i < uniquePostcodes.length; i += chunkSize) {
    const chunk = uniquePostcodes.slice(i, i + chunkSize);
    if (!chunk.length) continue;

    try {
      const payload = await fetchJson(`${POSTCODES_IO_BASE}/postcodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postcodes: chunk })
      });

      payload.result.forEach((item) => {
        if (item && item.result) {
          const key = normalizePostcode(item.result.postcode);
          coordsCache.set(key, {
            latitude: item.result.latitude,
            longitude: item.result.longitude
          });
        }
      });
    } catch (error) {
      console.warn('[stations] bulk postcode lookup failed', error);
    }
  }

  return stations.map((station) => {
    const key = normalizePostcode(station.postcode);
    const cached = coordsCache.get(key);
    if (cached && !isFiniteNumber(station.latitude)) {
      station.latitude = cached.latitude;
    }
    if (cached && !isFiniteNumber(station.longitude)) {
      station.longitude = cached.longitude;
    }
    return station;
  });
}

async function getStationsWithCoords() {
  const stations = await loadStations();
  return hydrateCoordinates(stations);
}

async function findNearestStations(postcode) {
  if (!postcode) {
    throw new Error('请输入邮编');
  }

  const [userLocation, stations] = await Promise.all([
    lookupPostcode(postcode),
    getStationsWithCoords()
  ]);

  const enriched = stations
    .filter((station) => isFiniteNumber(station.latitude) && isFiniteNumber(station.longitude))
    .map((station) => ({
      ...station,
      distanceKm: haversineDistance(
        userLocation.latitude,
        userLocation.longitude,
        station.latitude,
        station.longitude
      )
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, MAX_RESULTS);

  return {
    user: userLocation,
    stations: enriched
  };
}

export async function handler(event) {
  try {
    const postcode = event.queryStringParameters?.postcode || '';
    const result = await findNearestStations(postcode);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      },
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('[stations] error', error);
    const message = error.message || '服务暂不可用';
    const statusCode = /邮编|postcode/i.test(message) ? 400 : 500;
    return {
      statusCode,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: message })
    };
  }
}
