// Vercel API Route Wrapper
// This file re-exports the main Express app for Vercel's serverless environment.
const app = require('../index.js');

module.exports = app;
