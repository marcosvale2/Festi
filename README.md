# Sistema de Cadastro de Produtos

Sistema completo em **React + Tailwind (frontend)** e **Express + SQLite (backend)**.  
Permite cadastrar produtos por seção, marcar se o preço está correto, **gerar relatório em PDF**, e possui **autenticação com papéis**:

- `editor` ➜ pode cadastrar/editar/deletar produtos e gerar relatórios
- `admin` ➜ pode tudo (inclui gerenciamento de usuários e reset da base)

## ✨ Features
- Autenticação com JWT (login)
- Dois papéis de usuário: `editor` e `admin`
- Banco **SQLite** local (`backend/database.sqlite`)
- CRUD de produtos (Nome, ID, Seção, Preço correto)
- Geração de PDF (jsPDF) direto no front
- Export CSV via API
- Reset da base (apenas admin)

## 🚀 Como rodar

### Backend
```bash
cd backend
npm install
cp .env.example .env
# edite .env e TROQUE JWT_SECRET
npm start
