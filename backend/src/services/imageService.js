const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');

const UPLOADS_ROOT = path.join(__dirname, '..', '..', 'uploads');

const SIZES = {
  thumbnail: { width: 320, height: 320, quality: 75, fit: 'cover' },
  medium: { width: 800, quality: 80, fit: 'inside' },
  original: { width: 1600, quality: 85, fit: 'inside' },
};

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

/**
 * Procesa una imagen subida y genera thumbnail/medium/original comprimidos,
 * guardados en uploads/<namespace>/<entityId>/. Devuelve las URLs públicas relativas.
 */
async function processImage(buffer, namespace, entityId) {
  const dir = path.join(UPLOADS_ROOT, namespace, String(entityId));
  await ensureDir(dir);

  const baseName = crypto.randomUUID();
  const urls = {};

  for (const [variant, opts] of Object.entries(SIZES)) {
    const fileName = `${baseName}-${variant}.jpg`;
    const filePath = path.join(dir, fileName);

    let pipeline = sharp(buffer).rotate();
    pipeline = opts.fit === 'cover'
      ? pipeline.resize(opts.width, opts.height, { fit: 'cover' })
      : pipeline.resize({ width: opts.width, withoutEnlargement: true });

    await pipeline.jpeg({ quality: opts.quality }).toFile(filePath);
    urls[variant] = `/uploads/${namespace}/${entityId}/${fileName}`;
  }

  return urls;
}

async function deleteEntityImages(namespace, entityId) {
  const dir = path.join(UPLOADS_ROOT, namespace, String(entityId));
  await fs.rm(dir, { recursive: true, force: true });
}

module.exports = { processImage, deleteEntityImages };
