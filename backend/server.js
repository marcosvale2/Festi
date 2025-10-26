import XLSX from "xlsx";
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

/* ---------------------- FUNÇÃO PARA CRIAR USUÁRIOS PADRÃO ---------------------- */
/* Para ambientes de desenvolvimento, você pode deixar ALLOW_DEFAULT_USERS=true no .env
   Em produção, mantenha desativado para não criar usuários com senha previsível. */
const criarUsuariosPadrao = async () => {
  if (process.env.ALLOW_DEFAULT_USERS !== "true") {
    console.log("ℹ️ Criação de usuários padrão desabilitada (ALLOW_DEFAULT_USERS != true).");
    return;
  }

  const usuariosPadrao = [
    { username: "admin", senha: "admin123", role: "admin" },
    { username: "editor", senha: "editor123", role: "editor" },
    { username: "cliente", senha: "cliente123", role: "cliente" },
  ];

  for (const u of usuariosPadrao) {
    const existe = await db.get("SELECT * FROM users WHERE username = ?", [u.username]);
    if (!existe) {
      const passHash = await bcrypt.hash(u.senha, 10);
      await db.run(
        "INSERT INTO users (username, passwordHash, role) VALUES (?, ?, ?)",
        [u.username, passHash, u.role]
      );
      console.log(`✅ Usuário padrão criado: ${u.username} (${u.role})`);
    } else {
      console.log(`ℹ️ Usuário ${u.username} já existe`);
    }
  }
};

/* ---------------------- BANCO DE DADOS E TABELAS ---------------------- */
(async () => {
  db = await openDb();

  // Garantir integridade referencial no SQLite
  await db.exec("PRAGMA foreign_keys = ON;");

  // 📦 Produtos
  await db.exec(`
    CREATE TABLE IF NOT EXISTS produtos (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      secao TEXT NOT NULL,
      preco REAL NOT NULL,
      precoCorreto INTEGER NOT NULL
    );
  `);

  // 👤 Usuários
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      username TEXT PRIMARY KEY,
      passwordHash TEXT NOT NULL,
      role TEXT NOT NULL
    );
  `);

  // 📝 Logs
  await db.exec(`
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      data TEXT NOT NULL
    );
  `);

  // 🛍️ Pedidos com endereço e pagamento
  await db.exec(`
    CREATE TABLE IF NOT EXISTS pedidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      total REAL NOT NULL,
      status TEXT NOT NULL,
      data TEXT NOT NULL,
      nome_cliente TEXT,
      endereco TEXT,
      pagamento TEXT,
      status_pagamento TEXT,
      FOREIGN KEY (username) REFERENCES users(username)
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS pedido_itens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pedido_id INTEGER NOT NULL,
      produto_id TEXT NOT NULL,
      quantidade INTEGER NOT NULL,
      preco_unitario REAL NOT NULL,
      FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
      FOREIGN KEY (produto_id) REFERENCES produtos(id)
    );
  `);

  // 👑 Cria usuários padrão (apenas se habilitado)
  await criarUsuariosPadrao();
})();

/* ---------------------- AUTH ---------------------- */
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

/* ---------------------- USUÁRIOS ---------------------- */

// 📜 Listar usuários
app.get("/users", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const users = await db.all("SELECT username, role FROM users ORDER BY username ASC");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Erro ao carregar usuários" });
  }
});

// ➕ Criar usuário
app.post("/users", requireAuth, requireRole("admin"), async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ error: "Campos obrigatórios faltando" });
  }

  const existe = await db.get("SELECT * FROM users WHERE username = ?", [username]);
  if (existe) return res.status(400).json({ error: "Usuário já existe" });

  const passHash = await bcrypt.hash(password, 10);
  await db.run(
    "INSERT INTO users (username, passwordHash, role) VALUES (?, ?, ?)",
    [username, passHash, role]
  );
  res.json({ username, role });
});

// 🗑️ Deletar usuário
app.delete("/users/:username", requireAuth, requireRole("admin"), async (req, res) => {
  const { username } = req.params;
  if (username === "admin") {
    return res.status(403).json({ error: "Não é possível deletar o admin principal" });
  }
  await db.run("DELETE FROM users WHERE username = ?", [username]);
  res.json({ success: true });
});

/* ---------------------- PRODUTOS ---------------------- */
// ➕ Criar
app.post("/produtos", requireAuth, requireRole("editor", "admin"), async (req, res) => {
  const { id, nome, secao, preco, precoCorreto } = req.body;
  if (!id || !nome || !secao || preco == null)
    return res.status(400).json({ error: "Campos obrigatórios faltando" });

  try {
    await db.run(
      "INSERT INTO produtos (id, nome, secao, preco, precoCorreto) VALUES (?, ?, ?, ?, ?)",
      [id, nome, secao, preco, precoCorreto ? 1 : 0]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📄 Listar
app.get("/produtos", requireAuth, async (req, res) => {
  const produtos = await db.all("SELECT * FROM produtos ORDER BY secao, nome");
  res.json(produtos.map((p) => ({ ...p, precoCorreto: !!p.precoCorreto })));
});

// ✏️ Atualizar
app.put("/produtos/:id", requireAuth, requireRole("editor", "admin"), async (req, res) => {
  const { id } = req.params;
  const { nome, secao, preco, precoCorreto } = req.body;

  const existe = await db.get("SELECT id FROM produtos WHERE id = ?", [id]);
  if (!existe) return res.status(404).json({ error: "Produto não encontrado" });

  if (preco != null && Number.isNaN(Number(preco))) {
    return res.status(400).json({ error: "Preço inválido" });
  }

  await db.run(
    `UPDATE produtos 
       SET nome = COALESCE(?, nome),
           secao = COALESCE(?, secao),
           preco = COALESCE(?, preco),
           precoCorreto = COALESCE(?, precoCorreto)
     WHERE id = ?`,
    [
      nome ?? null,
      secao ?? null,
      preco != null ? Number(preco) : null,
      typeof precoCorreto === "boolean" ? (precoCorreto ? 1 : 0) : null,
      id,
    ]
  );

  res.json({ success: true });
});

// 🗑️ Deletar
app.delete("/produtos/:id", requireAuth, requireRole("editor", "admin"), async (req, res) => {
  const { id } = req.params;
  const existe = await db.get("SELECT id FROM produtos WHERE id = ?", [id]);
  if (!existe) return res.status(404).json({ error: "Produto não encontrado" });

  // Impede apagar produto vinculado a pedido (integridade)
  const vinculos = await db.get(
    "SELECT COUNT(*) as c FROM pedido_itens WHERE produto_id = ?",
    [id]
  );
  if (vinculos?.c > 0) {
    return res.status(400).json({ error: "Produto já utilizado em pedidos" });
  }

  await db.run("DELETE FROM produtos WHERE id = ?", [id]);
  res.json({ success: true });
});

/* ---------------------- EXPORTAÇÃO EXCEL ---------------------- */
app.get(
  "/produtos/export/excel",
  requireAuth,
  requireRole("editor", "admin"),
  async (req, res) => {
    const { secao } = req.query;
    const rows = secao
      ? await db.all(
          "SELECT id, nome, secao, preco, precoCorreto FROM produtos WHERE secao = ? ORDER BY secao, nome",
          [secao]
        )
      : await db.all(
          "SELECT id, nome, secao, preco, precoCorreto FROM produtos ORDER BY secao, nome"
        );

    const prepared = rows.map((p) => ({
      ID: p.id,
      Nome: p.nome,
      Seção: p.secao,
      Preço: Number(p.preco),
      "Preço correto": p.precoCorreto ? "Sim" : "Não",
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(prepared);
    XLSX.utils.book_append_sheet(wb, ws, "Produtos");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="relatorio_festi_${new Date()
        .toISOString()
        .replace(/[:T]/g, "-")
        .split(".")[0]}.xlsx"`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buf);
  }
);

/* ---------------------- PEDIDOS ---------------------- */
app.post("/pedidos", requireAuth, async (req, res) => {
  const username = req.user.username;
  const { itens, nome_cliente, endereco, pagamento } = req.body;

  if (!itens || !Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ error: "Itens do pedido são obrigatórios" });
  }
  if (!nome_cliente || !endereco || !pagamento) {
    return res.status(400).json({ error: "Nome, endereço e forma de pagamento são obrigatórios" });
  }

  let total = 0;
  const itensComPreco = [];

  for (const item of itens) {
    const produto = await db.get("SELECT preco FROM produtos WHERE id = ?", [item.produto_id]);
    if (!produto)
      return res.status(400).json({ error: `Produto ${item.produto_id} não encontrado` });
    total += produto.preco * item.quantidade;
    itensComPreco.push({ ...item, preco_unitario: produto.preco });
  }

  const now = new Date().toISOString();
  const result = await db.run(
    `INSERT INTO pedidos (username, total, status, data, nome_cliente, endereco, pagamento, status_pagamento) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [username, total, "Pendente", now, nome_cliente, endereco, pagamento, "Pendente"]
  );

  const pedidoId = result.lastID;

  for (const item of itensComPreco) {
    await db.run(
      "INSERT INTO pedido_itens (pedido_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)",
      [pedidoId, item.produto_id, item.quantidade, item.preco_unitario]
    );
  }

  res.json({ success: true, pedidoId });
});

// 🟢 Atualizar status de pagamento
app.put("/pedidos/:id/pagamento", requireAuth, requireRole("admin"), async (req, res) => {
  const { id } = req.params;
  const { status_pagamento } = req.body;
  await db.run("UPDATE pedidos SET status_pagamento = ? WHERE id = ?", [status_pagamento, id]);
  res.json({ success: true });
});

// 📜 Listar pedidos
app.get("/pedidos", requireAuth, async (req, res) => {
  const { role, username } = req.user;
  let pedidos;

  if (role === "admin") {
    pedidos = await db.all("SELECT * FROM pedidos ORDER BY data DESC");
  } else {
    pedidos = await db.all(
      "SELECT * FROM pedidos WHERE username = ? ORDER BY data DESC",
      [username]
    );
  }

  for (const p of pedidos) {
    p.itens = await db.all("SELECT * FROM pedido_itens WHERE pedido_id = ?", [p.id]);
  }

  res.json(pedidos);
});

/* ---------------------- LOGS ---------------------- */
app.post("/logs", requireAuth, async (req, res) => {
  const username = req.user.username;
  await db.run("INSERT INTO logs (username, data) VALUES (?, ?)", [
    username,
    new Date().toISOString(),
  ]);
  res.json({ success: true });
});

app.get("/logs", requireAuth, requireRole("admin"), async (req, res) => {
  const logs = await db.all("SELECT username, data FROM logs ORDER BY data DESC");
  res.json(logs);
});

// 🧹 Reset de logs (usado no AdminDashboard.jsx)
app.post("/logs/reset", requireAuth, requireRole("admin"), async (req, res) => {
  await db.run("DELETE FROM logs");
  res.json({ success: true });
});

/* ---------------------- HEALTHCHECK ---------------------- */
app.get("/health", (req, res) => res.json({ ok: true }));

/* ---------------------- SERVER ---------------------- */
app.listen(PORT, () => console.log(`🚀 Servidor rodando em http://localhost:${PORT}`));
