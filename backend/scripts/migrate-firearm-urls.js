const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Firearm = require('../models/Firearm');

function normalizeUrl(rawUrl) {
  if (typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const baseUrl = (process.env.PUBLIC_BASE_URL || process.env.APP_PUBLIC_URL || 'http://localhost:5000').replace(/\/$/, '');
  const normalized = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${baseUrl}${normalized}`;
}

async function migrateFirearmUrls() {
  await connectDB();

  const firearms = await Firearm.find({});
  let updated = 0;

  for (const firearm of firearms) {
    const incoming = Array.isArray(firearm.photos) ? firearm.photos : [];
    const normalized = incoming
      .map((url) => normalizeUrl(url))
      .filter(Boolean)
      .filter((url, index, arr) => arr.indexOf(url) === index);

    const changed = JSON.stringify(firearm.photos || []) !== JSON.stringify(normalized);

    if (changed) {
      firearm.photos = normalized;
      await firearm.save();
      updated += 1;
      console.log(`Updated firearm ${firearm._id}: ${incoming.length} -> ${normalized.length} photo URLs`);
    }
  }

  console.log(`Migration complete. Updated ${updated} firearms.`);
  return updated;
}

if (require.main === module) {
  migrateFirearmUrls()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Firearm URL migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateFirearmUrls, normalizeUrl };
