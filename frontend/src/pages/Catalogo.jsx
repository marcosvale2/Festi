import React, { useEffect, useState } from "react";
import { useCart } from "../components/CartContext";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api";

export default function Catalogo() {
  const [produtos, setProdutos] = useState([]);
  const [secaoFiltro, setSecaoFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const [quantidades, setQuantidades] = useState({});
  const { addItem } = useCart();
  const navigate = useNavigate();

  // 🔐 Verificação de login ao montar
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "cliente") {
      navigate("/login-cliente", { replace: true });
      return;
    }

    async function carregarProdutos() {
      try {
        const data = await apiFetch("/produtos");
        setProdutos(data);
        // inicializa as quantidades
        const inicial = {};
        data.forEach((p) => (inicial[p.id] = 1));
        setQuantidades(inicial);
      } catch (err) {
        console.error("❌ Erro ao carregar produtos:", err);
        alert("Erro ao carregar catálogo: " + err.message);
      } finally {
        setLoading(false);
      }
    }

    carregarProdutos();
  }, [navigate]);

  function handleAdd(p) {
    const qtd = quantidades[p.id] || 1;
    addItem({
      produto_id: p.id,
      nome: p.nome,
      quantidade: qtd,
      preco_unitario: p.preco,
    });
    alert(`${qtd} unidade(s) de "${p.nome}" adicionada(s) ao carrinho!`);
  }

  function aumentarQtd(id) {
    setQuantidades((prev) => ({ ...prev, [id]: (prev[id] || 1) + 1 }));
  }

  function diminuirQtd(id) {
    setQuantidades((prev) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) - 1),
    }));
  }

  const filtrados = secaoFiltro
    ? produtos.filter((p) => p.secao === secaoFiltro)
    : produtos;

  const secoes = Array.from(new Set(produtos.map((p) => p.secao)));

  if (loading) return <div className="p-6">Carregando...</div>;

  return (
    <div className="container mx-auto p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Catálogo</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/carrinho")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold"
          >
            🛒 Ver Carrinho
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/login-cliente");
            }}
            className="px-4 py-2 border rounded"
          >
            Sair
          </button>
        </div>
      </header>

      <div className="mb-4">
        <select
          value={secaoFiltro}
          onChange={(e) => setSecaoFiltro(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">Todas as seções</option>
          {secoes.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {filtrados.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded shadow p-4 flex flex-col justify-between"
          >
            <div>
              <h3 className="font-semibold text-lg">{p.nome}</h3>
              <p className="text-sm text-gray-600">ID: {p.id}</p>
              <p className="text-sm text-gray-600">Seção: {p.secao}</p>
              <p className="mt-2 font-semibold text-pink-600 text-lg">
                R$ {Number(p.preco).toFixed(2)}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                onClick={() => diminuirQtd(p.id)}
                className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-lg font-bold"
              >
                -
              </button>
              <span className="font-semibold">{quantidades[p.id] || 1}</span>
              <button
                onClick={() => aumentarQtd(p.id)}
                className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-lg font-bold"
              >
                +
              </button>
            </div>

            <button
              onClick={() => handleAdd(p)}
              className="mt-4 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded font-semibold"
            >
              Adicionar ao carrinho
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
