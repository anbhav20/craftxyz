import { Settings } from '../models/Settings.js';

let cached = null;

/**
 * There's exactly one Settings document. We cache it in memory since
 * it's read on every cart/checkout calculation and changes rarely —
 * updateSettings() (admin controller) resets the cache so changes
 * take effect on the next read without a restart.
 */
export async function getSettings() {
  if (cached) return cached;
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  cached = settings;
  return settings;
}

export function clearSettingsCache() {
  cached = null;
}
