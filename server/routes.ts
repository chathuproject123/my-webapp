import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertTransactionSchema } from "@shared/schema";
import { ZodError } from "zod";

// Middleware to check if user is admin
function isAdmin(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  if (!req.user.isAdmin) return res.sendStatus(403);
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  const { hashPassword } = await import("./auth");

  setupAuth(app);

  // Create initial admin user if none exists
  const adminUser = await storage.getUserByUsername("admin");
  if (!adminUser) {
    await storage.createAdminUser({
      username: "admin",
      email: "admin@wallet.com",
      password: await hashPassword("admin123")  // Hash the password before storing
    });
  }

  // Admin routes
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.post("/api/admin/users/:id/ban", isAdmin, async (req, res) => {
    const userId = parseInt(req.params.id);
    const { isBanned } = req.body;
    await storage.updateUserBanStatus(userId, isBanned);
    res.json({ success: true });
  });

  // Existing routes
  app.get("/api/transactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.isBanned) return res.status(403).json({ message: "Account is banned" });
    const transactions = await storage.getTransactions(req.user.id);
    res.json(transactions);
  });

  app.post("/api/transactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.isBanned) return res.status(403).json({ message: "Account is banned" });
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