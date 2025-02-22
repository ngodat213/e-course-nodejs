const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-Course API Documentation",
      version: "1.0.0",
      description: "API documentation for E-Course platform",
      contact: {
        name: "API Support",
        email: "ecourse.noreply@gmail.com",
      },
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === "production"
            ? "https://e-course-nodejs-ngodat213s-projects.vercel.app"
            : `http://localhost:${process.env.PORT || 3000}`,
        description:
          process.env.NODE_ENV === "production"
            ? "Production server"
            : "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: process.env.NODE_ENV === "production" 
    ? ["./src/routes/*.js", "./src/models/*.js", "./src/swagger/*.js"]
    : [
        path.join(__dirname, "../routes/*.js"),
        path.join(__dirname, "../models/*.js"),
        path.join(__dirname, "../swagger/*.js"),
      ],
};

module.exports = swaggerJsdoc(options);
