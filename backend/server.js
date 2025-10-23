/*
  server.js - API REST com Express para CRUD de produtos e autenticação simples
  - Produtos: tabela 'produtos' (id TEXT primary key, nome, secao, precoCorreto INTEGER)
  - Usuários: tabela 'users' (username primary key, passwordHash, role)
  - Autenticação: /auth/login -> retorna JWT
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

  // criar tabelas se não existirem
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

  // criar usuários padrões (só se não existirem)
  const admin = await db.get("SELECT * FROM users WHERE username = ?", ["admin"]);
  if (!admin) {
    const passHash = await bcrypt.hash("adminpass", 10); // troque em produção
    await db.run(
      "INSERT INTO users (username, passwordHash, role) VALUES (?, ?, ?)",
      ["admin", passHash, "admin"]
    );
    console.log("Usuário 'admin' criado com senha 'adminpass' (troque em .env)");
  }

  const editor = await db.get("SELECT * FROM users WHERE username = ?", ["editor"]);
  if (!editor) {
    const passHash = await bcrypt.hash("editorpass", 10);
    await db.run(
      "INSERT INTO users (username, passwordHash, role) VALUES (?, ?, ?)",
      ["editor", passHash, "editor"]
    );
    console.log("Usuário 'editor' criado com senha 'editorpass' (troque em .env)");
  }
})();

// Rota de login - retorna token JWT
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

// Rota para criar usuário (apenas admin)
app.post("/users", requireAuth, requireRole("admin"), async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) return res.status(400).json({ error: "Campos faltando" });
  const exists = await db.get("SELECT 1 FROM users WHERE username = ?", [username]);
  if (exists) return res.status(400).json({ error: "Usuário já existe" });
  const passHash = await bcrypt.hash(password, 10);
  await db.run("INSERT INTO users (username, passwordHash, role) VALUES (?, ?, ?)",
    [username, passHash, role]);
  res.json({ success: true });
});

// CRUD Produtos
// Cadastrar produto - permitido para role 'editor' e 'admin'
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

// Listar produtos - qualquer usuário autenticado pode listar
app.get("/produtos", requireAuth, async (req, res) => {
  const produtos = await db.all("SELECT * FROM produtos ORDER BY secao, nome");
  res.json(produtos.map(p => ({ ...p, precoCorreto: !!p.precoCorreto })));
});

// Editar produto - editor/admin
app.put("/produtos/:id", requireAuth, requireRole("editor", "admin"), async (req, res) => {
  const { id } = req.params;
  const { nome, secao, precoCorreto } = req.body;
  await db.run(
    "UPDATE produtos SET nome=?, secao=?, precoCorreto=? WHERE id=?",
    [nome, secao, precoCorreto ? 1 : 0, id]
  );
  res.json({ success: true });
});

// Deletar produto - editor/admin
app.delete("/produtos/:id", requireAuth, requireRole("editor", "admin"), async (req, res) => {
  const { id } = req.params;
  await db.run("DELETE FROM produtos WHERE id=?", [id]);
  res.json({ success: true });
});

// Resetar DB (APENAS admin)
app.post("/produtos/reset", requireAuth, requireRole("admin"), async (req, res) => {
  await db.exec("DELETE FROM produtos");
  res.json({ success: true });
});

// Export CSV (admin/editor)
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

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
