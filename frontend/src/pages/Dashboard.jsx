import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ProductForm from '../components/ProductForm'
import ProductTable from '../components/ProductTable'
import gerarPDF from "../components/PdfReport";

export default function Dashboard() {
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [produtos, setProdutos] = React.useState([]);
  const [secaoSelecionada, setSecaoSelecionada] = React.useState("");
  const navigate = useNavigate();

  const secoes = [
    "Bomboniere",
    "Confeitaria",
    "Descartáveis",
    "Papelaria",
    "Bebidas",
    "Limpeza"
  ];

  function reload() {
    setRefreshKey(k => k + 1);
  }

  // 🔐 Verificação de login ao montar a página
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // Se não estiver logado ou não for admin/editor → volta pro login
    if (!token || (role !== "admin" && role !== "editor")) {
      navigate("/login", { replace: true });
      return;
    }
  }, [navigate]);

  // 📡 Buscar produtos no backend
  React.useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://192.168.1.101:4000/produtos", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Erro ao carregar produtos");
        return res.json();
      })
      .then(data => {
        setProdutos(data);
      })
      .catch(err => console.error("❌ Erro ao buscar produtos:", err));
  }, [refreshKey]);

  // 🧾 Gerar PDF filtrado
  const handleGerarPDF = () => {
    const filtrados = secaoSelecionada
      ? produtos.filter(p => p.secao === secaoSelecionada)
      : produtos;
    if (filtrados.length === 0) {
      alert("Nenhum produto encontrado para gerar PDF!");
      return;
    }
    gerarPDF(filtrados);
  };

  // 📊 Gerar Excel filtrado
  const handleGerarExcel = () => {
    const token = localStorage.getItem("token");
    const url = secaoSelecionada
      ? `http://192.168.1.101:4000/produtos/export/excel?secao=${encodeURIComponent(secaoSelecionada)}`
      : `http://192.168.1.101:4000/produtos/export/excel`;

    fetch(url, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.blob())
      .then(blob => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `relatorio_festi_${new Date().toLocaleDateString("pt-BR")}.xlsx`;
        link.click();
      })
      .catch(err => console.error("Erro ao gerar Excel:", err));
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="container mx-auto">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sistema de Produtos</h1>
        <div className="flex gap-2 items-center">
          <select style={{ color: "gray" }}
            value={secaoSelecionada}
            onChange={(e) => setSecaoSelecionada(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="">Todas as Seções</option>
            {secoes.map(sec => (
              <option key={sec} value={sec}>{sec}</option>
            ))}
          </select>

          <button
            onClick={handleGerarPDF}
            className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded font-semibold"
          >
            📄 PDF
          </button>

          <button
            onClick={handleGerarExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold"
          >
            📊 Excel
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-2 border rounded hover:bg-gray-100"
          >
            Sair
          </button>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1">
          <ProductForm onAdd={reload} />
        </div>
        <div className="col-span-2">
          <ProductTable refreshKey={refreshKey} onChange={reload} />
        </div>
      </div>
    </div>
  );
}
