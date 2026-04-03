import swaggerJSDoc from 'swagger-jsdoc';
import { config } from './index';

const servers = [
  ...(config.publicUrl
    ? [{ url: config.publicUrl, description: 'Production server' }]
    : []),
  { url: `http://localhost:${config.port}`, description: 'Local server' },
];

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: config.appName,
      version: '1.0.0',
      description: 'Production-grade Finance Dashboard API',
    },
    servers,
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        AuthRegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', example: 'StrongPass123' },
            role: { type: 'string', enum: ['VIEWER', 'ANALYST', 'ADMIN'] },
          },
        },
        AuthLoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
        AuthRefreshRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['VIEWER', 'ANALYST', 'ADMIN'] },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Transaction: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            amount: { type: 'number', example: 1250.5 },
            type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
            category: { type: 'string', example: 'Salary' },
            description: { type: 'string', nullable: true },
            date: { type: 'string', format: 'date-time' },
            userId: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateTransactionRequest: {
          type: 'object',
          required: ['amount', 'type', 'category', 'date'],
          properties: {
            amount: { type: 'number' },
            type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
            category: { type: 'string' },
            description: { type: 'string' },
            date: { type: 'string', format: 'date-time' },
          },
        },
        UpdateTransactionRequest: {
          type: 'object',
          properties: {
            amount: { type: 'number' },
            type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
            category: { type: 'string' },
            description: { type: 'string' },
            date: { type: 'string', format: 'date-time' },
          },
        },
        ImportTransactionsRequest: {
          type: 'object',
          required: ['transactions'],
          properties: {
            transactions: {
              type: 'array',
              items: {
                type: 'object',
                required: ['amount', 'type', 'category', 'date'],
                properties: {
                  amount: { type: 'number' },
                  type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
                  category: { type: 'string' },
                  description: { type: 'string' },
                  date: { type: 'string', format: 'date-time' },
                  userId: { type: 'string', format: 'uuid' },
                },
              },
            },
          },
        },
        ApiSuccess: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: {},
            pagination: { type: 'object' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    paths: {
      '/api/v1/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthRegisterRequest' },
              },
            },
          },
          responses: { '201': { description: 'User registered' } },
        },
      },
      '/api/v1/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthLoginRequest' },
              },
            },
          },
          responses: { '200': { description: 'Login successful' } },
        },
      },
      '/api/v1/auth/refresh': {
        post: {
          tags: ['Auth'],
          summary: 'Refresh tokens',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthRefreshRequest' },
              },
            },
          },
          responses: { '200': { description: 'Tokens refreshed' } },
        },
      },
      '/api/v1/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Logout',
          responses: { '200': { description: 'Logged out' } },
        },
      },
      '/api/v1/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Current user',
          responses: { '200': { description: 'Current user details' } },
        },
      },
      '/api/v1/transactions': {
        get: {
          tags: ['Transactions'],
          summary: 'List Txn',
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
            { in: 'query', name: 'type', schema: { type: 'string', enum: ['INCOME', 'EXPENSE'] } },
            { in: 'query', name: 'category', schema: { type: 'string' } },
            { in: 'query', name: 'search', schema: { type: 'string' } },
            { in: 'query', name: 'startDate', schema: { type: 'string', format: 'date-time' } },
            { in: 'query', name: 'endDate', schema: { type: 'string', format: 'date-time' } },
            { in: 'query', name: 'sortBy', schema: { type: 'string', enum: ['date', 'amount', 'createdAt'], default: 'date' } },
            { in: 'query', name: 'order', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
          ],
          responses: { '200': { description: 'Transactions fetched' } },
        },
        post: {
          tags: ['Transactions'],
          summary: 'Create Txn',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateTransactionRequest' },
              },
            },
          },
          responses: { '201': { description: 'Transaction created' } },
        },
      },
      '/api/v1/transactions/export': {
        get: {
          tags: ['Transactions'],
          summary: 'Export Transactions',
          responses: {
            '200': {
              description: 'CSV export',
              content: {
                'text/csv': {
                  schema: { type: 'string' },
                },
              },
            },
          },
        },
      },
      '/api/v1/transactions/import': {
        post: {
          tags: ['Transactions'],
          summary: 'Import Transactions',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ImportTransactionsRequest' },
              },
            },
          },
          responses: { '201': { description: 'Transactions imported' } },
        },
      },
      '/api/v1/transactions/{id}': {
        get: {
          tags: ['Transactions'],
          summary: 'Get Txn',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'Transaction found' }, '404': { description: 'Transaction not found' } },
        },
        put: {
          tags: ['Transactions'],
          summary: 'Update Txn',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateTransactionRequest' },
              },
            },
          },
          responses: { '200': { description: 'Transaction updated' } },
        },
        patch: {
          tags: ['Transactions'],
          summary: 'Update Txn (partial)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateTransactionRequest' },
              },
            },
          },
          responses: { '200': { description: 'Transaction updated' } },
        },
        delete: {
          tags: ['Transactions'],
          summary: 'Delete Txn',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'Transaction deleted' } },
        },
      },
      '/api/v1/summary/overview': {
        get: { tags: ['Summary'], summary: 'Overview', responses: { '200': { description: 'Overview summary' } } },
      },
      '/api/v1/summary/category': {
        get: { tags: ['Summary'], summary: 'Category', responses: { '200': { description: 'Category breakdown' } } },
      },
      '/api/v1/summary/monthly': {
        get: {
          tags: ['Summary'],
          summary: 'Monthly',
          parameters: [{ in: 'query', name: 'months', schema: { type: 'integer', default: 6 } }],
          responses: { '200': { description: 'Monthly trend' } },
        },
      },
      '/api/v1/summary/recent': {
        get: {
          tags: ['Summary'],
          summary: 'Recent',
          parameters: [{ in: 'query', name: 'limit', schema: { type: 'integer', default: 5 } }],
          responses: { '200': { description: 'Recent transactions' } },
        },
      },
      '/api/v1/users': {
        get: {
          tags: ['Users'],
          summary: 'List users (admin)',
          responses: { '200': { description: 'User list' } },
        },
      },
      '/api/v1/users/{id}': {
        patch: {
          tags: ['Users'],
          summary: 'Update user (admin)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'User updated' } },
        },
        delete: {
          tags: ['Users'],
          summary: 'Delete user (admin)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'User deleted' } },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
