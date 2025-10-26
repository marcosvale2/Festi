import React, { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import toast from "react-hot-toast";

export default function ProductTable({ refreshKey, onChange }) {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarProdutos() {
      setLoading(true);
      try {
        const data = await apiFetch("/produtos");
        setProdutos(data);
      } catch (err) {
        console.error(err);
        toast.error("❌ Erro ao carregar produtos");
      } finally {
        setLoading(false);
      }
    }
    carregarProdutos();
  }, [refreshKey]);

  async function handleDelete(id) {
    if (!window.confirm("Tem certeza que deseja excluir este produto?")) return;

    const loadingToast = toast.loading("Excluindo produto...");
    try {
      await apiFetch(`/produtos/${id}`, { method: "DELETE" });
      setProdutos((prev) => prev.filter((p) => p.id !== id));
      toast.success("🗑️ Produto excluído com sucesso!");
      if (onChange) onChange();
    } catch (err) {
      console.error(err);
      toast.error("❌ Erro ao excluir produto");
    } finally {
      toast.dismiss(loadingToast);
    }
  }

  async function togglePrecoCorreto(produto) {
    const loadingToast = toast.loading("Atualizando...");
    try {
      await apiFetch(`/produtos/${produto.id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...produto,
          precoCorreto: !produto.precoCorreto,
        }),
      });
      setProdutos((prev) =>
        prev.map((p) =>
          p.id === produto.id
            ? { ...p, precoCorreto: !produto.precoCorreto }
            : p
        )
      );
      toast.success("✅ Produto atualizado!");
    } catch (err) {
      console.error(err);
      toast.error("❌ Erro ao atualizar produto");
    } finally {
      toast.dismiss(loadingToast);
    }
  }

  if (loading) return <div>Carregando produtos...</div>;

  if (produtos.length === 0)
    return (
      <div className="bg-white p-4 rounded shadow text-center text-gray-500">
        Nenhum produto cadastrado.
      </div>
    );

  return (
    <div className="bg-white p-4 rounded shadow">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Seção</th>
            <th>Preço</th>
            <th>Preço Correto</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.nome}</td>
              <td>{p.secao}</td>
              <td>R$ {Number(p.preco).toFixed(2)}</td>
              <td>
                <input
                  type="checkbox"
                  checked={p.precoCorreto}
                  onChange={() => togglePrecoCorreto(p)}
                />
              </td>
              <td>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
