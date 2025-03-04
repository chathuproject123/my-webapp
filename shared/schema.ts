import { pgTable, text, serial, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  balance: integer("balance").notNull().default(0),
  isAdmin: boolean("is_admin").notNull().default(false),
  isBanned: boolean("is_banned").notNull().default(false),
  lastLoginIp: text("last_login_ip"),
  lastLoginTime: timestamp("last_login_time"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  experiencePoints: integer("experience_points").notNull().default(0),
  level: integer("level").notNull().default(1),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: integer("amount").notNull(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), 
  difficulty: text("difficulty").notNull(), 
  points: integer("points").notNull(),
  content: jsonb("content").notNull(), 
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  challengeId: integer("challenge_id").notNull(),
  completed: boolean("completed").notNull().default(false),
  score: integer("score"),
  completedAt: timestamp("completed_at"),
  attempts: integer("attempts").notNull().default(0),
});

export const insertChallengeSchema = createInsertSchema(challenges).extend({
  content: z.object({
    questions: z.array(z.object({
      question: z.string(),
      options: z.array(z.string()),
      correctAnswer: z.number(),
      explanation: z.string(),
    })).optional(),
    tasks: z.array(z.object({
      description: z.string(),
      requirement: z.string(),
      verificationMethod: z.string(),
    })).optional(),
  }),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
}).extend({
  email: z.string().email("Invalid email format"),
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  amount: true,
  type: true,
  description: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Challenge = typeof challenges.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;