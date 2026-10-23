import Fastify from "fastify";

export function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env["NODE_ENV"] === "production" ? "info" : "debug",
      redact: ["req.headers.authorization", "req.headers.cookie"],
    },
    trustProxy: true,
  });

  app.get("/health", async () => ({
    status: "ok",
    service: "link-api",
  }));

  return app;
}
