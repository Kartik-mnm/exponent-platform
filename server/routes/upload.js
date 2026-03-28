// ============================================================
// Upload Route — Cloudinary photo upload via unsigned preset
// POST /api/upload/photo
// ============================================================
const router  = require('express').Router();
const { authenticate } = require('../middleware');
const https   = require('https');
const http    = require('http');
const { URL } = require('url');

// Helper: make an HTTPS POST request (no extra dependencies)
function httpsPost(urlStr, data) {
  return new Promise((resolve, reject) => {
    const parsed  = new URL(urlStr);
    const payload = typeof data === 'string' ? data : JSON.stringify(data);
    const options = {
      hostname: parsed.hostname,
      path:     parsed.pathname + parsed.search,
      method:   'POST',
      headers:  {
        'Content-Type':   'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(payload),
      },
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch (e) { resolve(body); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// POST /api/upload/photo
// Accepts base64 image, uploads to Cloudinary, returns URL
router.post('/photo', authenticate, async (req, res) => {
  const { image } = req.body;
  if (!image) return res.status(400).json({ error: 'No image provided' });

  const cloudName    = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    return res.status(500).json({ error: 'Cloudinary not configured. Add CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET to Render env vars.' });
  }

  // Validate it's an image (base64 data URL)
  if (!image.startsWith('data:image/')) {
    return res.status(400).json({ error: 'Only image files are allowed' });
  }

  // Check file size (base64 is ~33% larger than binary — 5MB binary = ~6.7MB base64)
  if (image.length > 7 * 1024 * 1024) {
    return res.status(400).json({ error: 'Image too large. Maximum size is 5MB.' });
  }

  try {
    const params = new URLSearchParams();
    params.append('file', image);
    params.append('upload_preset', uploadPreset);
    params.append('folder', 'nishchay_students');
    params.append('transformation', 'w_400,h_400,c_fill,g_face,q_auto,f_auto');

    const data = await httpsPost(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      params.toString()
    );

    if (data.error) {
      console.error('[upload] Cloudinary error:', data.error.message);
      return res.status(400).json({ error: data.error.message });
    }

    res.json({ url: data.secure_url, public_id: data.public_id });
  } catch (e) {
    console.error('[upload] Upload failed:', e.message);
    res.status(500).json({ error: 'Upload failed. Please try again.' });
  }
});

module.exports = router;
