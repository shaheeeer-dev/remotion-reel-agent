import { app } from './app.js';
import { env } from './config/env.js';

app.listen(env.API_PORT, () => {
  console.log(`🚀 LearnOps Reel API listening at http://localhost:${env.API_PORT}`);
  console.log(`📁 Media assets served at http://localhost:${env.API_PORT}/media`);
  console.log(`🩺 Healthcheck: http://localhost:${env.API_PORT}/health`);
});
