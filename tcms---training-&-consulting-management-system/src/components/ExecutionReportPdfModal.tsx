import React, { useState } from 'react';
import { ProjectOpportunity, PurchaseOrder } from '../types';
import { formatCurrency, formatPercent } from '../utils/calculator';
import { generatePdfWithHtml2Pdf } from '../utils/pdfHelper';
import { RapAuthenticationQr } from './RapAuthenticationQr';
import {
  Download,
  Printer,
  X,
  FileText,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Calendar,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';

interface ExecutionReportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectOpportunity;
  purchaseOrders: PurchaseOrder[];
}

export const ExecutionReportPdfModal: React.FC<ExecutionReportPdfModalProps> = ({
  isOpen,
  onClose,
  project,
  purchaseOrders,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const totalAllocated = purchaseOrders.reduce((sum, po) => sum + po.allocatedAmount, 0);
  const totalSpent = purchaseOrders.reduce((sum, po) => sum + po.actualSpentAmount, 0);
  const remainingBudget = totalAllocated - totalSpent;
  const overallPercentUsed = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;
  const isOverbudgetTotal = remainingBudget < 0;

  const rapVersion = project.rapVersion || 'v1.0';
  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const pdfGeneratedTimestamp = todayStr + ', ' + new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }) + ' WIB';

  const handleDownloadPdf = async () => {
    const element = document.getElementById('execution-report-printable-doc');
    if (!element) return;

    setIsDownloading(true);
    try {
      const cleanCode = (project.code || 'PROJ').replace(/[\/\\]/g, '-');
      const filename = `Laporan-Realisasi-Anggaran-${cleanCode}.pdf`;

      await generatePdfWithHtml2Pdf(element, filename, {
        marginMm: 10,
        scale: 2.0,
      });
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 overflow-y-auto">
      <div className="bg-slate-100 rounded-2xl shadow-2xl border border-slate-300 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Action Top Bar */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-teal-800 rounded-lg text-teal-200">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white leading-snug">
                Laporan Realisasi Anggaran (LRA) — {project.code}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Preview Cetak / Export PDF Resmi Realisasi Belanja &amp; Varians Proyek
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer border border-slate-700"
              title="Cetak langsung menggunakan dialog cetak browser"
            >
              <Printer className="w-3.5 h-3.5 text-teal-400" />
              <span>Cetak</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-sm disabled:opacity-50"
              title="Unduh laporan dalam format PDF resmi"
            >
              <Download className={`w-3.5 h-3.5 text-amber-300 ${isDownloading ? 'animate-bounce' : ''}`} />
              <span>{isDownloading ? 'Menyiapkan PDF...' : 'Unduh PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Preview Scroll Area */}
        <div className="p-4 sm:p-8 overflow-y-auto flex justify-center bg-slate-200/80">
          
          <div
            id="execution-report-printable-doc"
            className="printable-doc w-full max-w-[850px] bg-white p-8 sm:p-10 rounded-xl shadow-md font-sans text-slate-900 space-y-6 border border-slate-200"
          >
            {/* Header Letterhead / Kop Surat Resmi */}
            <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-xl bg-teal-900 text-white flex items-center justify-center font-black text-base shrink-0 shadow-xs border border-teal-800">
                  TCMS
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-base font-black uppercase tracking-tight text-slate-900">
                      PT CIPTA PERDANA ENTERPRISE
                    </h1>
                    <span className="px-2 py-0.5 bg-teal-100 text-teal-900 border border-teal-300 rounded font-extrabold text-[9px] uppercase tracking-wider">
                      LRA RESMI
                    </span>
                  </div>
                  <p className="text-xs font-bold text-teal-800 mt-0.5">
                    STAR OFFICE — Training &amp; Consulting Management System
                  </p>
                  <p className="text-[10.5px] text-slate-500">
                    Gedung Menara Mandiri Lt. 18, Jl. Jend. Sudirman Kav. 54-55, Jakarta Selatan
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0">
                <div className="text-right bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="inline-block px-2.5 py-0.5 bg-slate-900 text-white rounded font-extrabold text-[9.5px] uppercase tracking-wider mb-1">
                    LAPORAN REALISASI ANGGARAN
                  </span>
                  <div className="text-xs font-mono text-slate-900 font-bold">
                    Ref: LRA-{project.code}-2026
                  </div>
                  <div className="text-[10.5px] text-slate-600 font-medium mt-0.5">
                    Tanggal Laporan: <strong>{todayStr}</strong>
                  </div>
                </div>
                <RapAuthenticationQr 
                  projectCode={project.code} 
                  rapVersion={rapVersion} 
                  size={48} 
                  className="mt-2"
                />
              </div>
            </div>

            {/* Project Specifications Banner */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-teal-700" />
                  Identitas Proyek &amp; Klien
                </span>
                <span className="inline-flex items-center justify-center text-center leading-none text-xs font-bold text-teal-900 bg-teal-100/90 px-2.5 py-1 rounded-md border border-teal-300">
                  RAP Baseline {rapVersion} Terkunci
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
                <div>
                  <span className="text-slate-500 font-medium block">Nama Proyek:</span>
                  <strong className="text-slate-900 font-bold block">{project.name}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Klien / Instansi:</span>
                  <strong className="text-slate-900 font-bold block">{project.clientName} ({project.clientType})</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Kode Proyek / Deal:</span>
                  <span className="font-mono font-bold text-slate-800">{project.code}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Nilai Kontrak Penawaran (Revenue):</span>
                  <span className="font-mono font-extrabold text-teal-900">
                    {formatCurrency(project.actualSellingPrice || project.normalSellingPrice || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Financial Overview KPI Box */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-teal-700" />
                Ringkasan Penyerapan &amp; Varians Anggaran (KPI Keuangan)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Plafon RAP */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Plafon RAP Terkunci
                  </span>
                  <span className="text-base font-black font-mono text-slate-900 mt-1 block">
                    {formatCurrency(totalAllocated)}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
                    Batas Maksimal Belanja Proyek
                  </span>
                </div>

                {/* Realisasi Belanja */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Total Realisasi Belanja
                  </span>
                  <span className="text-base font-black font-mono text-slate-900 mt-1 block">
                    {formatCurrency(totalSpent)}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
                    Aktual Terpakai ({overallPercentUsed.toFixed(1)}%)
                  </span>
                </div>

                {/* Sisa Anggaran */}
                <div className={`p-3.5 rounded-xl border ${
                  isOverbudgetTotal ? 'bg-red-50/80 border-red-300' : 'bg-emerald-50/80 border-emerald-300'
                }`}>
                  <span className="text-[10px] uppercase font-bold text-slate-700 block">
                    Sisa / Defisit Anggaran
                  </span>
                  <span className={`text-base font-black font-mono mt-1 block ${
                    isOverbudgetTotal ? 'text-red-700' : 'text-emerald-800'
                  }`}>
                    {formatCurrency(remainingBudget)}
                  </span>
                  <span className={`text-[10px] font-bold mt-0.5 block ${
                    isOverbudgetTotal ? 'text-red-700' : 'text-emerald-800'
                  }`}>
                    {isOverbudgetTotal ? '⚠️ Peringatan Overbudget' : '✓ Anggaran Aman (Sisa)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Detailed Budget vs Actual Expense Breakdown Table */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
                <span>Rincian Realisasi per Pos Belanja Vendor / Subkontraktor</span>
                <span className="text-[10px] font-normal text-slate-500">Jumlah Pos PO: {purchaseOrders.length} Pos</span>
              </h3>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100 text-slate-800 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-2.5 w-10 text-center">No</th>
                      <th className="p-2.5">Pos &amp; Kategori Vendor</th>
                      <th className="p-2.5 text-right w-32">Budget RAP</th>
                      <th className="p-2.5 text-right w-32">Realisasi</th>
                      <th className="p-2.5 text-right w-32">Sisa Anggaran</th>
                      <th className="p-2.5 text-center w-24">% Pakai</th>
                      <th className="p-2.5 text-center w-24">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium bg-white">
                    {purchaseOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-4 text-center text-slate-500 italic">
                          Belum ada pos anggaran atau Purchase Order yang dikunci untuk proyek ini.
                        </td>
                      </tr>
                    ) : (
                      purchaseOrders.map((po, idx) => {
                        const percentUsed = po.allocatedAmount > 0 ? (po.actualSpentAmount / po.allocatedAmount) * 100 : 0;
                        const isOver = po.actualSpentAmount > po.allocatedAmount;
                        const posRemaining = po.allocatedAmount - po.actualSpentAmount;

                        return (
                          <tr key={po.id} className="hover:bg-slate-50">
                            <td className="p-2.5 text-center text-slate-500 font-bold">{idx + 1}</td>
                            <td className="p-2.5">
                              <span className="font-bold text-slate-900 block">{po.vendorCategory}</span>
                              <span className="text-[10.5px] text-slate-500 font-mono">
                                {po.vendorName} ({po.posCode})
                              </span>
                            </td>

                            <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                              {formatCurrency(po.allocatedAmount)}
                            </td>

                            <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                              {formatCurrency(po.actualSpentAmount)}
                            </td>

                            <td className={`p-2.5 text-right font-mono font-bold ${
                              isOver ? 'text-red-600' : 'text-emerald-700'
                            }`}>
                              {formatCurrency(posRemaining)}
                            </td>

                            <td className="p-2.5 text-center font-mono font-bold text-slate-800">
                              {percentUsed.toFixed(1)}%
                            </td>

                            <td className="p-2.5 text-center">
                              {isOver ? (
                                <span className="inline-block px-2 py-0.5 bg-red-100 text-red-800 rounded font-bold text-[9px] uppercase border border-red-300">
                                  Overbudget
                                </span>
                              ) : (
                                <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[9px] uppercase border border-emerald-300">
                                  Aman
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                  <tfoot className="bg-slate-100 font-extrabold text-slate-900 border-t-2 border-slate-300">
                    <tr>
                      <td colSpan={2} className="p-2.5 text-right uppercase tracking-wider text-xs">
                        TOTAL KESELURUHAN:
                      </td>
                      <td className="p-2.5 text-right font-mono text-xs">{formatCurrency(totalAllocated)}</td>
                      <td className="p-2.5 text-right font-mono text-xs">{formatCurrency(totalSpent)}</td>
                      <td className={`p-2.5 text-right font-mono text-xs ${
                        remainingBudget < 0 ? 'text-red-700' : 'text-emerald-800'
                      }`}>
                        {formatCurrency(remainingBudget)}
                      </td>
                      <td className="p-2.5 text-center font-mono text-xs">{overallPercentUsed.toFixed(1)}%</td>
                      <td className="p-2.5 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded font-black text-[9px] uppercase ${
                          isOverbudgetTotal ? 'bg-red-200 text-red-900' : 'bg-emerald-200 text-emerald-900'
                        }`}>
                          {isOverbudgetTotal ? 'OVER' : 'LANCAR'}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Management Notes & Governance Notice */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 text-slate-700">
              <div className="font-extrabold text-slate-900 flex items-center gap-1.5 uppercase text-[10.5px] tracking-wide">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-800" />
                Catatan Pengawasan Realisasi &amp; Governance
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600">
                1. Setiap pengeluaran realisasi belanja wajib diverifikasi kuitansi/nota sah dan dicatat ke dalam pos PO vendor yang sesuai.
                <br />
                2. Apabila terjadi varians pembengkakan biaya (overbudget), tim proyek wajib mengajukan revisi addendum RAP sebelum menerbitkan komitmen biaya tambahan.
              </p>
            </div>

            {/* Signatory Block */}
            <div className="pt-4 border-t-2 border-slate-900 space-y-3 pdf-avoid-break">
              <div className="text-center font-black text-xs uppercase tracking-wider text-slate-900">
                LEMBAR OTORISASI &amp; PENGESAHAN LAPORAN REALISASI
              </div>

              <div className="grid grid-cols-2 gap-8 text-xs pt-2">
                {/* Project Manager */}
                <div className="text-center space-y-1">
                  <div className="text-slate-500 text-[11px]">Disiapkan Oleh (Project Manager):</div>
                  <div className="font-bold text-slate-900 text-xs">TIM MANAJEMEN PROYEK (TCMS)</div>
                  <div className="h-16 flex items-center justify-center">
                    <div className="border border-dashed border-teal-400 bg-teal-50/70 rounded-xl px-3 py-1 text-[10px] text-teal-900 font-mono font-bold">
                      [Tanda Tangan PM Proyek]
                    </div>
                  </div>
                  <div className="font-bold text-slate-900 underline text-xs">Project Manager In-Charge</div>
                  <div className="text-slate-500 text-[10.5px]">Divisi Eksekusi &amp; Operasional</div>
                </div>

                {/* Finance & Operations Director */}
                <div className="text-center space-y-1">
                  <div className="text-slate-500 text-[11px]">Disetujui Oleh (Direktur Keuangan):</div>
                  <div className="font-bold text-slate-900 text-xs">PT CIPTA PERDANA ENTERPRISE</div>
                  <div className="h-16 flex items-center justify-center">
                    <div className="border border-dashed border-slate-300 rounded-xl px-3 py-1 text-[10px] text-slate-500 font-mono">
                      [Verifikasi Keuangan &amp; Cap]
                    </div>
                  </div>
                  <div className="font-bold text-slate-900 underline text-xs">Head of Finance &amp; Controller</div>
                  <div className="text-slate-500 text-[10.5px]">Direktorat Keuangan &amp; Akuntansi</div>
                </div>
              </div>

              <div className="text-center text-[10px] text-slate-400 pt-3 border-t border-slate-100">
                Dokumen ini digenerate secara otomatis oleh TCMS System • Validasi Integritas Keuangan Star Office
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
