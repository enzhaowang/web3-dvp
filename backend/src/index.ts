import express from "express";
import cors from "cors";
import { connectDb } from "./db";
import { config } from "./config";
import dealsRouter from "./routes/deals";

async function main() {
  await connectDb();

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_, res) => res.json({ ok: true }));
  app.use("/api/deals", dealsRouter);

  app.listen(config.port, () => {
    console.log(`Backend listening on :${config.port}`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
