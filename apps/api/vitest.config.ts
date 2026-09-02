import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    env: {
      MONGODB_URI: "mongodb://localhost:27017/gym-app-test",
      JWT_SECRET: "test-secret",
      JWT_EXPIRES_IN: "1h",
      CORS_ORIGIN: "http://localhost:3000",
    },
  },
});
