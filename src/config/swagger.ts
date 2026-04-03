import swaggerJSDoc from 'swagger-jsdoc';
import { config } from './index';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: config.appName,
      version: '1.0.0',
      description: 'Production-grade Finance Dashboard API',
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Local server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJSDoc(options);
