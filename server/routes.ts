import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertTransactionSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.get("/api/transactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const transactions = await storage.getTransactions(req.user.id);
    res.json(transactions);
  });

  app.post("/api/transactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const data = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(req.user.id, data);
      await storage.updateBalance(req.user.id, data.amount);
      res.json(transaction);
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json(err.errors);
      } else {
        throw err;
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
