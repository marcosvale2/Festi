# 🛍️ Sistema de Cadastro de Produtos e Vendas — FESTI

Sistema completo em **React + Tailwind (frontend)** e **Express + SQLite (backend)**, agora com **toast global**, **interceptador de sessão JWT** e **loader elegante**.  
Permite **cadastrar produtos**, **realizar pedidos**, **gerar relatórios** e **gerenciar usuários com papéis de acesso**.

---

## ✨ Novidades desta versão

- ✅ **Interceptador global de autenticação (401)**  
  - Logout automático quando o token expira.  
  - Toast informando ao usuário que a sessão foi encerrada.
  
- 🧭 **Loader global elegante**  
  - Exibido automaticamente em qualquer requisição API.  
  - Interface fluida e moderna.

- 🔔 **Mensagens toast em toda a aplicação**  
  - Substituição dos `alert()` nativos por `react-hot-toast`.

- 🧾 Atualização de páginas:
  - `Carrinho.jsx` e `PedidosCliente.jsx` com UX aprimorada.
  - Melhor tratamento de erros e feedback visual ao usuário.

---

## 🚀 Funcionalidades Principais

- 🔐 Autenticação com JWT e papéis:
  - `admin` ➜ gerencia tudo
  - `editor` ➜ gerencia produtos e relatórios
  - `cliente` ➜ realiza pedidos
- 📦 Cadastro de produtos por seção
- 🧾 Relatórios de vendas em PDF e Excel
- 🛒 Carrinho de compras
- 🧍‍♂️ Gerenciamento de usuários
- 💳 Controle de status de pagamento
- 📅 Registro completo com data e hora
- 📊 Exportação de relatórios
- 🪄 Toasts e Loader global

---

## 🧭 Estrutura do Projeto

```
📂 frontend/
 ├── src/
 │   ├── components/
 │   │   ├── CartContext.jsx
 │   │   ├── GlobalLoader.jsx        🆕
 │   │   ├── ProductForm.jsx
 │   │   ├── ProductTable.jsx
 │   │   ├── PdfReport.js
 │   │   └── PdfReportPedidos.js
 │   ├── context/
 │   │   └── LoaderContext.jsx       🆕
 │   ├── pages/
 │   │   ├── Login.jsx
 │   │   ├── LoginCliente.jsx
 │   │   ├── Dashboard.jsx
 │   │   ├── Catalogo.jsx
 │   │   ├── Carrinho.jsx            🆕 UX
 │   │   ├── AdminDashboard.jsx
 │   │   └── PedidosCliente.jsx      🆕 UX
 │   ├── services/
 │   │   └── api.js                  🆕 interceptador + loader
 │   ├── App.jsx                     🆕 inicialização loader
 │   ├── main.jsx
 │   └── index.css
 └── package.json

📂 backend/
 ├── server.js
 ├── auth.js
 ├── db.js
 ├── .env
 └── database.sqlite
```

---

## ⚡ Como rodar

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

Acesse 👉 [http://localhost:5173](http://localhost:5173)

---

## 👑 Usuários Padrão

| Usuário | Senha       | Papel   |
|---------|-------------|---------|
| admin   | admin123    | admin   |
| editor  | editor123   | editor  |
| cliente | cliente123  | cliente |

---

## 🧾 Relatórios FESTI

- Cabeçalho com logo e identidade visual FESTI  
- Colunas: Pedido, Cliente, Endereço, Pagamento, Total, Status, Data  
- Badge de status “PAGO” ou “PENDENTE”  
- Paginação automática no PDF  
- Exportação para Excel disponível

---

## 🧰 Tecnologias

- ⚡ **Frontend:** React, Tailwind CSS, jsPDF, react-hot-toast  
- 🛡️ **Backend:** Express.js, SQLite, JWT, Bcrypt  
- 🧭 **Infra:** Loader global + Interceptador de sessão  
- 🧾 **Relatórios:** jsPDF e Excel

---

## 📝 Licença
Projeto desenvolvido para uso interno da **FESTI Distribuidora**.  
Distribuição ou uso comercial requer autorização prévia.

---

## 🧠 Autor
Desenvolvido por **Marcos Vinícius Soares do Vale** 🚀
