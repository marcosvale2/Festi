// auth.js - middleware para proteção de rotas (JWT) e checagem de role
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "mude_isto_em_producao";

// middleware que verifica o token e coloca req.user
export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Sem token" });
  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET); // { username, role }
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido" });
  }
}

// middleware para checar role(s) permitidas
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Sem usuário" });
    if (!allowedRoles.includes(req.user.role))
      return res.status(403).json({ error: "Acesso negado" });
    next();
  };
}

// helper para criar token
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });
}
