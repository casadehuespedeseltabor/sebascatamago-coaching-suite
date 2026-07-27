"use client";

import { useState } from "react";

export default function ExportarPDFBoton({
  targetId,
  nombreArchivo,
}: {
  targetId: string;
  nombreArchivo: string;
}) {
  const [loading, setLoading] = useState(false);

  async function exportar() {
    setLoading(true);
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ]);

    const el = document.getElementById(targetId);
    if (!el) {
      setLoading(false);
      return;
    }

    const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#f6f5ef" });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pageWidth - 48;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 24, 24, imgWidth, imgHeight);
    pdf.save(`${nombreArchivo}.pdf`);
    setLoading(false);
  }

  return (
    <button
      onClick={exportar}
      disabled={loading}
      className="rounded-organico border border-guadua-400 px-5 py-2 text-sm font-medium text-guadua-700 transition hover:bg-guadua-50 disabled:opacity-50"
    >
      {loading ? "Generando PDF…" : "Exportar como PDF"}
    </button>
  );
}
