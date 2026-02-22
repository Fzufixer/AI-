import express from "express";
import { createServer as createViteServer } from "vite";
import yahooFinance from 'yahoo-finance2';
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API 路由：获取市场概况
  app.get("/api/market-overview", async (req, res) => {
    try {
      const symbols = [
        '^GSPC', // S&P 500
        '^N225', // Nikkei 225
        '000001.SS', // SSE Composite
        '399001.SZ', // SZSE Component
        '^HSI', // Hang Seng
        'GC=F', // Gold
        'BZ=F', // Brent Crude
        '^VIX'  // VIX
      ];

      const results = await Promise.all(
        symbols.map(async (symbol) => {
          try {
            return await yahooFinance.quote(symbol);
          } catch (err) {
            console.error(`Error fetching ${symbol}:`, err);
            return null;
          }
        })
      );

      res.json(results.filter(r => r !== null));
    } catch (error) {
      console.error("API Error:", error);
      res.status(500).json({ error: "Failed to fetch market data" });
    }
  });

  // API 路由：获取特定股票列表的行情
  app.post("/api/quotes", async (req, res) => {
    try {
      const { symbols } = req.body;
      if (!Array.isArray(symbols)) {
        return res.status(400).json({ error: "Symbols must be an array" });
      }

      const results = await Promise.all(
        symbols.map(async (symbol) => {
          try {
            return await yahooFinance.quote(symbol);
          } catch (err) {
            console.error(`Error fetching ${symbol}:`, err);
            return { symbol, error: true };
          }
        })
      );

      res.json(results);
    } catch (error) {
      console.error("API Error:", error);
      res.status(500).json({ error: "Failed to fetch quotes" });
    }
  });

  // Vite 中间件用于开发环境
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // 生产环境服务静态文件
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
