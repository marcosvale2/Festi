# 🛍️ Sistema de Cadastro de Produtos e Vendas — FESTI

Sistema completo em **React + Tailwind (frontend)** e **Express + SQLite (backend)**.  
Permite **cadastrar produtos**, **fazer pedidos como cliente**, **gerar relatórios em PDF**, além de **gerenciar usuários com papéis** e controlar pagamentos.

## ✨ Funcionalidades Principais

- 🧾 **Autenticação JWT** com papéis:
  - `admin` ➜ gerencia usuários, produtos, relatórios e pedidos.
  - `editor` ➜ gerencia produtos e relatórios.
  - `cliente` ➜ realiza pedidos no catálogo.
- 📦 Cadastro de produtos com nome, ID, seção, preço fixo e opção de marcar preço correto.
- 📊 **Relatórios de Vendas em PDF** estilizados com identidade FESTI.
- 🧾 Relatório de Produtos e Vendas (com status de pagamento, endereço, forma de pagamento e data).
- 🛒 **Carrinho de compras** com preço do produto vindo direto do banco.
- 🧍‍♂️ Cadastro de usuários via painel admin.
- 🏦 Pedidos com:
  - Nome do cliente
  - Endereço (Rua + número)
  - Forma de pagamento (Pix, cartão ou dinheiro)
  - Status de pagamento
- 📅 Data e hora completas dos pedidos registradas.
- 🧰 Exportação para Excel/CSV e reset da base de dados.
- 🔑 Painel do administrador com controle de usuários e logs de relatórios.

---

## 🧭 Estrutura do Projeto

```
📂 frontend/
 ├── src/
 │   ├── components/
 │   │   ├── CartContext.jsx
 │   │   ├── ProductForm.jsx
 │   │   ├── ProductTable.jsx
 │   │   ├── PdfReport.js
 │   │   ├── PdfReportPedidos.js   🆕
 │   ├── pages/
 │   │   ├── Login.jsx
 │   │   ├── LoginCliente.jsx
 │   │   ├── Dashboard.jsx
 │   │   ├── Catalogo.jsx
 │   │   ├── Carrinho.jsx
 │   │   ├── AdminDashboard.jsx
 │   │   ├── PedidosCliente.jsx
 │   ├── App.jsx
 │   ├── main.jsx
 │   └── index.css
 └── package.json

📂 backend/
 ├── server.js
 ├── auth.js
 ├── db.js
 └── database.sqlite
```

---

## 🚀 Como rodar o projeto

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Gere e edite JWT_SECRET no .env
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Acesse: 👉 `http://localhost:5173`

---

## 👑 Usuários Padrão

| Usuário | Senha       | Papel   |
|---------|------------|---------|
| admin   | adminpass  | admin   |
| editor  | editorpass | editor  |

Você pode criar novos usuários (inclusive clientes) pelo painel do administrador.

---

## 🧾 Relatórios de Vendas FESTI

- Cabeçalho com logo FESTI e cor institucional
- Colunas: Pedido, Cliente, Endereço, Pagamento, Total, Status, Data
- Badge de status “PENDENTE” ou “PAGO”
- Paginação e data no rodapé
- Compatível com impressão A4

📸 *Exemplo de relatório de vendas gerado em PDF:*

```
Pedido # | Cliente | Endereço | Pagamento | Total (R$) | Status     | Data
2        | João    | Rua X    | Pix       | 96,00      | PENDENTE   | 25/10/2025 21:18:29
1        | Maria   | Rua Y    | Cartão    | 72,00      | PENDENTE   | 25/10/2025 20:59:47
```

---

## 🧰 Tecnologias Utilizadas

- ⚡ **Frontend:** React, Tailwind CSS, jsPDF
- 🛡️ **Backend:** Express.js, SQLite, JWT, Bcrypt
- 🧾 **Relatórios:** jsPDF + estilização FESTI
- 🗂️ **Banco:** SQLite local

---

## 🧭 Rotas Principais

### Backend
- `POST /auth/login` → Login de usuário
- `POST /produtos` → Criar produto
- `GET /produtos` → Listar produtos
- `POST /pedidos` → Criar pedido com endereço e pagamento
- `GET /pedidos` → Listar pedidos
- `PUT /pedidos/:id/pagamento` → Atualizar status de pagamento
- `POST /users` → Criar usuário
- `GET /users` → Listar usuários
- `DELETE /users/:username` → Deletar usuário

---

## 📝 Licença
Este projeto foi desenvolvido para uso interno da **FESTI Distribuidora**.  
Distribuição ou uso comercial requer autorização prévia.
