import { app } from './app.js';
import { env } from './config/env.js';
import { schedulerService } from './services/scheduler.service.js';

app.listen(env.API_PORT, () => {
  console.log(`🚀 Social Media Manager API listening at http://localhost:${env.API_PORT}`);
  console.log(`📁 Media assets served at http://localhost:${env.API_PORT}/media`);
  console.log(`🩺 Healthcheck: http://localhost:${env.API_PORT}/health`);

  // Start daily queue scheduler
  schedulerService.start();
});

