
// Best practice: Use an environment variable for the API URL
// On Vercel, we will set VITE_API_URL to the Render server address.
// Locally, it falls back to localhost:3000.
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
