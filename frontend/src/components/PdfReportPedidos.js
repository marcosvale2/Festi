import { jsPDF } from "jspdf";
import logo from "../assets/logo-festi.png";

export default function gerarPDFPedidos(pedidos) {
  const doc = new jsPDF("p", "mm", "a4");
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  // 🎨 Cores FESTI
  const azul = [0, 51, 153];
  const rosa = [233, 30, 99];
  const cinzaHeader = [235, 235, 235];
  const preto = [0, 0, 0];
  const branco = [255, 255, 255];
  const verde = [0, 160, 85];
  const vermelho = [210, 43, 43];

  // 🟦 Faixa azul do topo
  doc.setFillColor(...azul);
  doc.rect(0, 0, pageW, 30, "F");

  // 📸 Logo FESTI
  try { doc.addImage(logo, "PNG", 14, 5, 26, 20); } catch {}

  // 📝 Título
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...branco);
  doc.setFontSize(18);
  doc.text("Relatório de Vendas", pageW / 2, 17, { align: "center" });

  // 🕒 Data completa
  const agora = new Date();
  const dataHoraCompleta = agora.toLocaleString("pt-BR", { hour12: false });
  doc.setFontSize(10);
  doc.text(`Gerado em: ${dataHoraCompleta}`, pageW / 2, 26, { align: "center" });

  // 📊 Colunas
const cols = [
  { key: "id", label: "Pedido", w: 15, align: "center" },
  { key: "nome_cliente", label: "Cliente", w: 30, align: "left" },
  { key: "endereco", label: "Endereço", w: 40, align: "left" },
  { key: "pagamento", label: "Pagamento", w: 20, align: "center" },
  { key: "total", label: "Total (R$)", w: 25, align: "right" },
  { key: "status_pagamento", label: "Status", w: 25, align: "center" },
  { key: "data", label: "Data", w: 40, align: "center" },
];

  const startX = 14;
  const rowHeight = 10;
  let y = 42;

  // 🧾 Cabeçalho da tabela
 function drawHeader(yPos) {
  let x = startX;
  doc.setDrawColor(200, 200, 200);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...preto);
  doc.setFontSize(10);

  cols.forEach((c) => {
    // 👉 aplica fundo cinza
    doc.setFillColor(...cinzaHeader);
    doc.rect(x, yPos, c.w, rowHeight, "F");

    // 📝 escreve título centralizado SEM preenchimento
    doc.setTextColor(...preto);
    doc.text(c.label, x + c.w / 2, yPos + 6, { align: "center" });

    x += c.w;
  });

  return yPos + rowHeight;
}

  // 🦶 Rodapé (numeração de páginas)
  function drawFooter() {
    const footerY = pageH - 10;
    const current = doc.internal.getCurrentPageInfo().pageNumber;
    const total = doc.internal.getNumberOfPages();
    doc.setFontSize(9);
    doc.setTextColor(...rosa);
    doc.text(`FESTI • ${dataHoraCompleta}`, 14, footerY);
    doc.text(`Página ${current} de ${total}`, pageW - 40, footerY);
  }

  // ✨ Quebra de página automática
  function ensurePage(nextHeight = 10) {
    if (y + nextHeight > pageH - 20) {
      drawFooter();
      doc.addPage();
      y = 20;
      y = drawHeader(y);
    }
  }

  y = drawHeader(y);

  pedidos.forEach((p) => {
    ensurePage(rowHeight + 2);

    const row = {
      id: p.id ?? "-",
      nome_cliente: p.nome_cliente || "-",
      endereco: p.endereco || "-",
      pagamento: p.pagamento || "-",
      total: `R$ ${Number(p.total || 0).toFixed(2)}`,
      status_pagamento: p.status_pagamento || "PENDENTE",
      data: new Date(p.data).toLocaleString("pt-BR", { hour12: false }),
    };

    let x = startX;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...preto);
    doc.setDrawColor(220, 220, 220);

    cols.forEach((c) => {
      doc.rect(x, y, c.w, rowHeight);

      if (c.key === "status_pagamento") {
        const isPago = row.status_pagamento.toLowerCase() === "pago";
        doc.setFillColor(...(isPago ? verde : vermelho));
        doc.setTextColor(...branco);
        const badgeW = c.w - 6;
        const badgeH = 7;
        const badgeX = x + (c.w - badgeW) / 2;
        const badgeY = y + (rowHeight - badgeH) / 2;
        doc.rect(badgeX, badgeY, badgeW, badgeH, "F");
        doc.setFont("helvetica", "bold");
        doc.text(isPago ? "PAGO" : "PENDENTE", badgeX + badgeW / 2, badgeY + 4.5, { align: "center" });
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...preto);
      } else {
        let textX = x + 2;
        if (c.align === "right") textX = x + c.w - 2;
        if (c.align === "center") textX = x + c.w / 2;
        doc.text(String(row[c.key]), textX, y + 6, { align: c.align });
      }

      x += c.w;
    });

    y += rowHeight;
  });

  drawFooter();
  doc.save(`relatorio_vendas_festi_${agora.toISOString().replace(/[:T]/g, "-").split(".")[0]}.pdf`);
}
