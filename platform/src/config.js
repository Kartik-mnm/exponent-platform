// ============================================================
// EXPONENT PLATFORM - Central config
//
// API URL is read from environment variable at build time.
// For local dev:  create platform/.env.local with REACT_APP_API_URL
// For Netlify:    set REACT_APP_API_URL in Netlify environment variables
// ============================================================

const config = {
  // Falls back to the live Render URL if no env var is set
  apiUrl: process.env.REACT_APP_API_URL || "https://acadfee.onrender.com",
};

export default config;
