import { createApp } from "./app";
import { env } from "./config/env";
import { connectDatabase } from "./database/connection";

async function bootstrap() {
  await connectDatabase();

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`[server] listening on http://localhost:${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error("[server] failed to start", error);
  process.exit(1);
});
