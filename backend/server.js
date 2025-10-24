/*
  server.js - API REST com Express para CRUD de produtos, autenticação e painel admin
  - Produtos: tabela 'produtos'
  - Usuários: tabela 'users'
  - Logs: tabela 'logs' (ações de geração de relatório)
  - Autenticação: JWT
  - Proteção: rotas protegidas via requireAuth e requireRole
*/

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

import { openDb } from "./db.js";
import { requireAuth, requireRole, signToken } from "./auth.js";

dotenv.config();

const PORT = process.env.PORT || 4000;
const app = express();
app.use(cors());
app.use(bodyParser.json());

let db;
(async () => {
  db = await openDb();

  // 📊 Tabelas
  await db.exec(`
    CREATE TABLE IF NOT EXISTS produtos (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      secao TEXT NOT NULL,
      precoCorreto INTEGER NOT NULL
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      username TEXT PRIMARY KEY,
      passwordHash TEXT NOT NULL,
      role TEXT NOT NULL
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      data TEXT NOT NULL
    );
  `);

  // 👤 Criar usuários padrões se não existirem
  const admin = await db.get("SELECT * FROM users WHERE username = ?", ["admin"]);
  if (!admin) {
    const passHash = await bcrypt.hash("adminpass", 10);
    await db.run(
      "INSERT INTO users (username, passwordHash, role) VALUES (?, ?, ?)",
      ["admin", passHash, "admin"]
    );
    console.log("✅ Usuário 'admin' criado com senha 'adminpass'");
  }

  const editor = await db.get("SELECT * FROM users WHERE username = ?", ["editor"]);
  if (!editor) {
    const passHash = await bcrypt.hash("editorpass", 10);
    await db.run(
      "INSERT INTO users (username, passwordHash, role) VALUES (?, ?, ?)",
      ["editor", passHash, "editor"]
    );
    console.log("✅ Usuário 'editor' criado com senha 'editorpass'");
  }
})();

/* --------------------------- AUTENTICAÇÃO --------------------------- */
app.post("/auth/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "username e password são obrigatórios" });

  const user = await db.get("SELECT * FROM users WHERE username = ?", [username]);
  if (!user) return res.status(401).json({ error: "Usuário não encontrado" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Senha incorreta" });

  const token = signToken({ username: user.username, role: user.role });
  res.json({ token, username: user.username, role: user.role });
});

/* --------------------------- GESTÃO DE USUÁRIOS (ADMIN) --------------------------- */

// Criar usuário
app.post("/users", requireAuth, requireRole("admin"), async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) return res.status(400).json({ error: "Campos faltando" });

  const exists = await db.get("SELECT 1 FROM users WHERE username = ?", [username]);
  if (exists) return res.status(400).json({ error: "Usuário já existe" });

  const passHash = await bcrypt.hash(password, 10);
  await db.run(
    "INSERT INTO users (username, passwordHash, role) VALUES (?, ?, ?)",
    [username, passHash, role]
  );
  res.json({ username, role });
});

// Listar usuários
app.get("/users", requireAuth, requireRole("admin"), async (req, res) => {
  const users = await db.all("SELECT username, role FROM users");
  res.json(users);
});

// Deletar usuário
app.delete("/users/:username", requireAuth, requireRole("admin"), async (req, res) => {
  const { username } = req.params;
  if (username === "admin") {
    return res.status(403).json({ error: "Não é possível deletar o admin principal." });
  }
  await db.run("DELETE FROM users WHERE username = ?", [username]);
  res.json({ success: true });
});

/* --------------------------- PRODUTOS --------------------------- */

// Cadastrar produto - editor/admin
app.post("/produtos", requireAuth, requireRole("editor", "admin"), async (req, res) => {
  const { id, nome, secao, precoCorreto } = req.body;
  if (!id || !nome || !secao) return res.status(400).json({ error: "Campos obrigatórios" });
  try {
    await db.run(
      "INSERT INTO produtos (id, nome, secao, precoCorreto) VALUES (?, ?, ?, ?)",
      [id, nome, secao, precoCorreto ? 1 : 0]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar produtos
app.get("/produtos", requireAuth, async (req, res) => {
  const produtos = await db.all("SELECT * FROM produtos ORDER BY secao, nome");
  res.json(produtos.map(p => ({ ...p, precoCorreto: !!p.precoCorreto })));
});

// Editar produto
app.put("/produtos/:id", requireAuth, requireRole("editor", "admin"), async (req, res) => {
  const { id } = req.params;
  const { nome, secao, precoCorreto } = req.body;
  await db.run(
    "UPDATE produtos SET nome=?, secao=?, precoCorreto=? WHERE id=?",
    [nome, secao, precoCorreto ? 1 : 0, id]
  );
  res.json({ success: true });
});

// Deletar produto
app.delete("/produtos/:id", requireAuth, requireRole("editor", "admin"), async (req, res) => {
  const { id } = req.params;
  await db.run("DELETE FROM produtos WHERE id=?", [id]);
  res.json({ success: true });
});

// Resetar DB produtos (admin)
app.post("/produtos/reset", requireAuth, requireRole("admin"), async (req, res) => {
  await db.exec("DELETE FROM produtos");
  res.json({ success: true });
});

// Exportar CSV
app.get("/produtos/export/csv", requireAuth, requireRole("admin", "editor"), async (req, res) => {
  const produtos = await db.all("SELECT * FROM produtos");
  const csv = [
    "id,nome,secao,precoCorreto",
    ...produtos.map(p => `${p.id},"${p.nome.replace(/"/g, '""')}",${p.secao},${p.precoCorreto}`)
  ].join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="produtos.csv"');
  res.send(csv);
});

/* --------------------------- LOGS DE RELATÓRIOS --------------------------- */

// Registrar log
app.post("/logs", requireAuth, async (req, res) => {
  const username = req.user.username;
  await db.run("INSERT INTO logs (username, data) VALUES (?, ?)", [
    username,
    new Date().toISOString(),
  ]);
  res.json({ success: true });
});

// Listar logs (apenas admin)
app.get("/logs", requireAuth, requireRole("admin"), async (req, res) => {
  const logs = await db.all("SELECT username, data FROM logs ORDER BY data DESC");
  res.json(logs);
});

/* --------------------------- SERVER --------------------------- */
app.listen(PORT, () => console.log(`🚀 Servidor rodando em http://localhost:${PORT}`));
