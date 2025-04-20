import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, loginSchema, registerSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "warehouse-tracking-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 86400000, // 24 hours
      secure: process.env.NODE_ENV === "production"
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy({
      usernameField: 'fiscalCode',
      passwordField: 'password'
    }, async (fiscalCode, password, done) => {
      try {
        const user = await storage.getUserByFiscalCode(fiscalCode);
        
        if (!user) {
          return done(null, false, { message: "Codice fiscale non trovato" });
        }
        
        // Handle special case for warehouse credentials
        if (fiscalCode === "MAGAZZINO1234567") {
          // Implement direct success for warehouse credentials
          return done(null, user);
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const userData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByFiscalCode(userData.fiscalCode);
      if (existingUser) {
        return res.status(400).json({ message: "Utente già registrato" });
      }
      
      // Create user without password for now
      const user = await storage.createUser({
        name: userData.name,
        surname: userData.surname,
        fiscalCode: userData.fiscalCode,
        isAdmin: false,
        isWarehouseManager: false
      });
      
      // Log in the user
      req.login(user, (loginErr: Error) => {
        if (loginErr) return next(loginErr);
        res.status(201).json(user);
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    try {
      // Validate login data
      loginSchema.parse(req.body);
      
      passport.authenticate("local", (err: Error | null, user: SelectUser | false, info: any) => {
        if (err) return next(err);
        
        if (!user) {
          return res.status(401).json({ message: info?.message || "Credenziali non valide" });
        }
        
        req.login(user, (loginErr: Error) => {
          if (loginErr) return next(loginErr);
          res.status(200).json(user);
        });
      })(req, res, next);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err: Error) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    res.json(req.user);
  });
}