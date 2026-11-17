import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { env } from './env.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TaskFlow API',
      version: '1.0.0',
      description: 'Job Application Tracker + Task Manager REST API',
      contact: { name: 'TaskFlow Team', email: 'support@taskflow.com' },
    },
    servers: [
      { url: `http://localhost:${env.port}/api/v1`, description: 'Development' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
  },
  apis: ['./src/routes/*.js', './src/models/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
export const swaggerUiSetup = swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { background: linear-gradient(135deg, #667eea, #764ba2); }',
  customSiteTitle: 'TaskFlow API Docs',
});
export { swaggerUi };
