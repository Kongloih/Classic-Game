const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '经典游戏平台 API',
      version: '1.0.0',
      description: '经典游戏平台的 RESTful API 文档',
      contact: {
        name: '开发团队',
        email: 'dev@arcade-platform.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: '开发服务器'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/models/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec; 