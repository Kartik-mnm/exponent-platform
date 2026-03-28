// EXPONENT PLATFORM — Central API config
// Strips trailing slashes to prevent URL bugs like /atform/auth/login

const raw = process.env.REACT_APP_API_URL || "https://acadfee.onrender.com";

const config = {
  apiUrl: raw.replace(/\/+$/, ""),  // remove any trailing slash
};

export default config;
