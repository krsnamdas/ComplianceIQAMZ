/**
 * Region-aware data loader.
 * ---------------------------------------------------------------------------
 * Loads regulation (and, in later phases, other feature) data from an external
 * per-region JSON folder — data/regions/<REGION>/ — instead of hardcoded TS
 * arrays. This makes the dataset:
 *   - Editable by admins at runtime (server writes back to the JSON file)
 *   - Portable: swap the region folder (menat -> apac) with no code changes
 *
 * REGION is chosen via the REGION env var (defaults to "menat").
 *
 * Safety: if the JSON file is missing or unreadable, the loader falls back to
 * the legacy in-code arrays so the app never breaks during/after migration.
 *
 * NOTE: This module is server-side only (uses fs). The browser bundle must not
 * import it. The Express server imports it; the Vite client continues to import
 * the legacy arrays until the client is migrated to fetch from the API.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Regulation } from '../types/regulatory';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ACTIVE_REGION = (process.env.REGION || 'menat').toLowerCase();

// data/regions/<region>/ resolved relative to project root (two levels up from src/data)
const REGIONS_ROOT = path.resolve(__dirname, '..', '..', 'data', 'regions');

export function regionDir(region: string = ACTIVE_REGION): string {
  return path.join(REGIONS_ROOT, region);
}

export function regionFilePath(fileName: string, region: string = ACTIVE_REGION): string {
  return path.join(regionDir(region), fileName);
}

/**
 * Generic JSON reader with graceful fallback.
 * Returns the parsed JSON array, or the provided fallback if the file is
 * missing / invalid.
 */
export function loadRegionJSON<T>(fileName: string, fallback: T[]): { data: T[]; source: 'file' | 'fallback'; path: string } {
  const filePath = regionFilePath(fileName);
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return { data: parsed as T[], source: 'file', path: filePath };
      }
      console.warn(`[regionLoader] ${filePath} is not a JSON array; using fallback.`);
    } else {
      console.info(`[regionLoader] ${filePath} not found; using in-code fallback.`);
    }
  } catch (err: any) {
    console.warn(`[regionLoader] Failed to read ${filePath}: ${err?.message}; using fallback.`);
  }
  return { data: fallback, source: 'fallback', path: filePath };
}

/**
 * Atomically persist a JSON array back to a region file.
 * Writes to a temp file then renames, so a crash mid-write can't corrupt the
 * live data file.
 */
export function saveRegionJSON<T>(fileName: string, data: T[]): { ok: boolean; path: string; error?: string } {
  const filePath = regionFilePath(fileName);
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const tmp = `${filePath}.tmp-${Date.now()}`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmp, filePath);
    return { ok: true, path: filePath };
  } catch (err: any) {
    return { ok: false, path: filePath, error: err?.message || String(err) };
  }
}

/**
 * Load the active region's regulations, falling back to the supplied legacy
 * array if the JSON file is not present.
 */
export function loadRegulations(fallback: Regulation[]): { data: Regulation[]; source: 'file' | 'fallback'; path: string } {
  return loadRegionJSON<Regulation>('regulations.json', fallback);
}

export function saveRegulations(data: Regulation[]) {
  return saveRegionJSON<Regulation>('regulations.json', data);
}
