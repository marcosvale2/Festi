import React, { useState } from "react";
import { apiFetch } from "../services/api";
import toast from "react-hot-toast";

export default function ProductForm({ onAdd }) {
  const [nome, setNome] = useState("");
  const [secao, setSecao] = useState("");
  const [preco, setPreco] = useState("");
  const [precoCorreto, setPrecoCorreto] = useState(false);
  const [loading, setLoading] = useState(false);

  const secoes = [
    "Bomboniere",
    "Confeitaria",
    "Descartáveis",
    "Papelaria",
    "Bebidas",
    "Limpeza",
  ];

  async function handleSubmit(e) {
    e.preventDefault();

    if (!nome.trim() || !secao || !preco) {
      toast.error("⚠️ Preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Salvando produto...");

    try {
      await apiFetch("/produtos", {
        method: "POST",
        body: JSON.stringify({
          nome,
          secao,
          preco: parseFloat(preco),
          precoCorreto,
        }),
      });

      toast.success("✅ Produto cadastrado com sucesso!");
      setNome("");
      setSecao("");
      setPreco("");
      setPrecoCorreto(false);
      if (onAdd) onAdd();
    } catch (err) {
      console.error(err);
      toast.error("❌ Erro ao cadastrar produto");
    } finally {
      toast.dismiss(loadingToast);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2>Cadastro de Produto</h2>
      <div>
        <label className="block font-semibold mb-1">Nome</label>
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome do produto"
          required
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Seção</label>
        <select
          value={secao}
          onChange={(e) => setSecao(e.target.value)}
          required
        >
          <option value="">Selecione...</option>
          {secoes.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block font-semibold mb-1">Preço (R$)</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          placeholder="0,00"
          required
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={precoCorreto}
          onChange={(e) => setPrecoCorreto(e.target.checked)}
        />
        <label>Preço correto</label>
      </div>
      <button type="submit" disabled={loading}>
        {loading ? "Salvando..." : "Cadastrar Produto"}
      </button>
    </form>
  );
}
