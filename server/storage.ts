import session from "express-session";
import createMemoryStore from "memorystore";
import { User, Transaction, InsertUser, InsertTransaction } from "@shared/schema";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBanStatus(userId: number, isBanned: boolean): Promise<void>;
  updateLastLogin(userId: number, ip: string): Promise<void>;
  getTransactions(userId: number): Promise<Transaction[]>;
  createTransaction(userId: number, transaction: InsertTransaction): Promise<Transaction>;
  updateBalance(userId: number, amount: number): Promise<void>;
  detectMultipleAccounts(ip: string): Promise<User[]>;
  createAdminUser(user: InsertUser): Promise<User>; // Added function signature to interface
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactions: Map<number, Transaction>;
  private currentUserId: number;
  private currentTransactionId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.currentUserId = 1;
    this.currentTransactionId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      balance: 0,
      isAdmin: false,
      isBanned: false,
      lastLoginIp: null,
      lastLoginTime: null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserBanStatus(userId: number, isBanned: boolean): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    user.isBanned = isBanned;
    this.users.set(userId, user);
  }

  async updateLastLogin(userId: number, ip: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    user.lastLoginIp = ip;
    user.lastLoginTime = new Date();
    this.users.set(userId, user);
  }

  async detectMultipleAccounts(ip: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.lastLoginIp === ip
    );
  }

  async getTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter((t) => t.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createTransaction(userId: number, data: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const transaction: Transaction = {
      ...data,
      id,
      userId,
      createdAt: new Date(),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateBalance(userId: number, amount: number): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    user.balance += amount;
    this.users.set(userId, user);
  }

  async createAdminUser(insertUser: InsertUser): Promise<User> { // Added function
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      balance: 0,
      isAdmin: true,
      isBanned: false,
      lastLoginIp: null,
      lastLoginTime: null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();