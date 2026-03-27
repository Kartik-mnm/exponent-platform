// ============================================================
// EXPONENT PLATFORM - Central config
// ============================================================

// Strip any trailing slash from the API URL to prevent
// double-slash or path-overlap bugs like /atform/auth/login
const raw = process.env.REACT_APP_API_URL || "https://acadfee.onrender.com";

const config = {
  apiUrl: raw.replace(/\/+$/, ""), // remove trailing slashes
};

export default config;
