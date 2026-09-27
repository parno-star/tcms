import React, { useState } from 'react';
import { generatePdfWithHtml2Pdf } from '../utils/pdfHelper';
import { ProjectOpportunity, CostItem, PurchaseOrder, AuditLog } from '../types';
import { COST_CATEGORIES } from '../data/initialData';
import { formatCurrency, formatPercent } from '../utils/calculator';
import { Lock, ShieldCheck, FileText, Building2, Calendar, Users, Award, Check, Printer } from 'lucide-react';
import { RapAuthenticationQr } from './RapAuthenticationQr';

interface RapSummaryPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectOpportunity;
  costItems: CostItem[];
  purchaseOrders: PurchaseOrder[];
}

export const RapSummaryPdfModal: React.FC<RapSummaryPdfModalProps> = ({
  isOpen,
  onClose,
  project,
  costItems,
  purchaseOrders,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    const element = document.getElementById('rap-summary-printable-doc');
    if (element) {
      setIsDownloading(true);
      try {
        await generatePdfWithHtml2Pdf(element, `Laporan-RAP-${project.code}.pdf`, {
          marginMm: 10,
          scale: 2.0,
        });
      } finally {
        setIsDownloading(false);
      }
    }
  };

  const rapVersion = project.rapVersion || 'v1.0';
  const pdfGeneratedTimestamp = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }) + ', ' + new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }) + ' WIB';

  const renderPrintableDoc = () => (
    <div id="rap-summary-printable-doc" className="printable-doc w-full flex flex-col gap-6 p-8 font-sans text-sm text-slate-900 border-separate print:p-4 print:overflow-visible bg-white">
      
      {/* Executive Official Kop Surat / Letterhead */}
      <div className="border-b-2 border-slate-900 pb-6 flex flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
            TCMS
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-black uppercase text-slate-900 tracking-tight leading-none">
                PT CIPTA PERDANA ENTERPRISE
              </span>
              <span className="inline-flex items-center justify-center py-0.5 px-2.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-black text-[9px] uppercase leading-none shrink-0 align-middle">
                RAP TERKUNCI {rapVersion}
              </span>
            </div>
            <p className="text-[10px] text-slate-600 font-medium leading-normal mt-1">
              Dokumen Resmi Rencana Anggaran Proyek (RAP) — COGS &amp; Project Profitability Engine
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end shrink-0">
          <div className="text-right bg-slate-100 py-2.5 px-4 rounded-xl border border-slate-300 shrink-0 leading-tight">
            <div className="text-[9.5px] text-slate-500 font-bold uppercase">
              ID: <strong className="text-blue-900 font-bold">RAP-{project.code}-{rapVersion}</strong>
            </div>
            <div className="text-[9.5px] text-slate-700 font-semibold flex items-center justify-end gap-2 mt-1">
              <span>Versi RAP: <strong className="text-emerald-900 font-bold">{rapVersion}</strong></span>
              <span className="inline-flex items-center justify-center py-0.5 px-2 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-black text-[9px] uppercase leading-none whitespace-nowrap shrink-0 align-middle">
                LOCKED
              </span>
            </div>
            <div className="text-[8.5px] text-slate-500 font-mono mt-1 border-t border-slate-200 pt-1">
              Waktu Cetak/PDF Stamp: <strong className="text-slate-800">{pdfGeneratedTimestamp}</strong>
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

      {/* Row 1: Project Specs & Governance 3 Pihak (Side-by-Side 2-Column Grid) */}
      <div className="grid grid-cols-12 gap-3 text-xs items-center">
        {/* Project Info - 4 Cols */}
        <div className="col-span-4 bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex flex-col justify-between">
          <div className="flex flex-col gap-3 w-full">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <span className="text-[9.5px] text-slate-800 font-black uppercase tracking-wide">Proyek & Klien</span>
              <span className="inline-flex items-center justify-center py-0.5 px-2.5 bg-blue-100 text-blue-900 border border-blue-300 rounded font-black text-[9px] uppercase leading-none whitespace-nowrap shrink-0 align-middle">
                Target: {project.targetGrossMarginPercent}%
              </span>
            </div>
            <div className="grid grid-cols-[1fr,2.6fr] gap-x-3 gap-y-2 w-full text-[9.5px] items-start">
              <div className="contents">
                <span className="text-slate-500 font-medium pt-0.5">Nama Proyek:</span>
                <span className="text-slate-900 font-bold leading-tight">{project.name}</span>
              </div>
              <div className="contents">
                <span className="text-slate-500 font-medium pt-0.5">Klien:</span>
                <span className="text-slate-900 font-bold leading-tight">{project.clientName}</span>
              </div>
              <div className="contents">
                <span className="text-slate-500 font-medium pt-0.5">Durasi / Pax:</span>
                <span className="text-slate-900 font-bold leading-tight">3 Hari ({project.headcount.totalHeadcount} Pax)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Governance 3 Pihak - 8 Cols */}
        <div className="col-span-8 bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex flex-col justify-between">
          <div className="flex flex-col items-start gap-y-1 border-b border-slate-200 pb-2.5 mb-2.5 w-full">
            <div className="w-full flex justify-between items-center">
              <span className="text-[9.5px] text-slate-900 font-black uppercase tracking-wide block">
                Otorisasi Governance 3 Pihak (Approval Metadata)
              </span>
              <span className="inline-flex items-center justify-center py-0.5 px-2.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded font-black text-[9px] uppercase leading-none whitespace-nowrap shrink-0 align-middle">
                STATUS: APPROVED & LOCKED
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2.5 items-stretch">
            <div className="p-3 bg-blue-50/90 rounded-lg border border-blue-200 flex flex-col justify-between shadow-xs">
              <div className="flex justify-between items-center font-bold text-blue-900 text-[9px] leading-none pb-2 border-b border-blue-200">
                <span>1. KONSEPTOR</span>
                <span className="inline-flex items-center justify-center py-0.5 px-2 bg-blue-200 text-blue-900 border border-blue-300 rounded font-black text-[8px] uppercase leading-none shrink-0 align-middle">Draf</span>
              </div>
              <div className="mt-2">
                <p className="font-black text-slate-900 text-[10px] leading-tight">Budi Raharjo</p>
                <p className="text-[8.5px] text-slate-600 font-semibold leading-tight mt-0.5">Sales Lead / Estimator</p>
              </div>
            </div>

            <div className="p-3 bg-amber-50/90 rounded-lg border border-amber-200 flex flex-col justify-between shadow-xs">
              <div className="flex justify-between items-center font-bold text-amber-900 text-[9px] leading-none pb-2 border-b border-amber-200">
                <span>2. PEMERIKSA</span>
                <span className="inline-flex items-center justify-center py-0.5 px-2 bg-amber-200 text-amber-900 border border-amber-300 rounded font-black text-[8px] uppercase leading-none shrink-0 align-middle">Verified</span>
              </div>
              <div className="mt-2">
                <p className="font-black text-slate-900 text-[10px] leading-tight">Siska Amanda</p>
                <p className="text-[8.5px] text-slate-600 font-semibold leading-tight mt-0.5">Finance & Cost Control</p>
              </div>
            </div>

            <div className="p-3 bg-emerald-50/90 rounded-lg border border-emerald-200 flex flex-col justify-between shadow-xs">
              <div className="flex justify-between items-center font-bold text-emerald-900 text-[9px] leading-none pb-2 border-b border-emerald-200">
                <span>3. PENYETUJU</span>
                <span className="inline-flex items-center justify-center py-0.5 px-2 bg-emerald-200 text-emerald-900 border border-emerald-300 rounded font-black text-[8px] uppercase leading-none shrink-0 align-middle">Approved</span>
              </div>
              <div className="mt-2">
                <p className="font-black text-slate-900 text-[10px] leading-tight">Drs. Hendra Wijaya, MM</p>
                <p className="text-[8.5px] text-slate-600 font-semibold leading-tight mt-0.5">VP Commercial & Director</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Financial Summary Banner (Strip Format) */}
      <div className="py-2 px-3 bg-slate-900 text-white rounded-lg grid grid-cols-4 gap-2 text-xs font-mono border border-slate-800 shadow-xs">
        <div>
          <span className="text-[8.5px] text-slate-400 font-bold block uppercase font-sans">Total Modal RAP</span>
          <span className="text-xs font-black text-white block">{formatCurrency(project.totalProjectCost)}</span>
          <span className="text-[8px] text-slate-400 font-sans block">Direct HPP + Presales</span>
        </div>

        <div>
          <span className="text-[8.5px] text-teal-400 font-bold block uppercase font-sans">Harga Penawaran Final</span>
          <span className="text-xs font-black text-teal-300 block">{formatCurrency(project.actualSellingPrice)}</span>
          <span className="text-[8px] text-slate-400 font-sans block">Diskon: {project.discountPercent}%</span>
        </div>

        <div>
          <span className="text-[8.5px] text-sky-400 font-bold block uppercase font-sans">Gross Margin %</span>
          <span className="text-xs font-black text-sky-300 block">{formatPercent(project.grossMarginPercent)}</span>
          <span className="text-[8px] text-slate-400 font-sans block">Profit: {formatCurrency(project.grossProfit)}</span>
        </div>

        <div>
          <span className="text-[8.5px] text-emerald-400 font-bold block uppercase font-sans">Net Project Margin %</span>
          <span className="text-xs font-black text-emerald-300 block">{formatPercent(project.netMarginPercent)}</span>
          <span className="text-[8px] text-slate-400 font-sans block">Net Profit: {formatCurrency(project.netProfit)}</span>
        </div>
      </div>

      {/* Row 3: Detailed POS Cost Table */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <h4 className="text-[10px] font-extrabold text-slate-800 uppercase tracking-wider">
            Struktur Biaya Anggaran RAP Terkunci (Kategori POS HPP)
          </h4>
          <span className="text-[9px] text-slate-500 font-mono font-medium">Mata Uang: IDR (Rupiah)</span>
        </div>

        <div className="rounded-md border border-slate-300 overflow-hidden">
          <table className="w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="bg-slate-800 text-white font-bold uppercase text-[9px] tracking-wider">
                <th className="py-1 px-2 w-12 text-center">POS</th>
                <th className="py-1 px-2">Kategori & Detail Komponen Biaya</th>
                <th className="py-1 px-2 text-right w-24">Tarif Unit</th>
                <th className="py-1 px-2 text-center w-24">Vol / Durasi</th>
                <th className="py-1 px-2 text-right w-28">Total Biaya (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {COST_CATEGORIES.map((cat) => {
                const catItems = costItems.filter((i) => i.category === cat.key);
                const subtotal = catItems.reduce((acc, curr) => acc + curr.totalCost, 0);

                return (
                  <React.Fragment key={cat.key}>
                    <tr className="bg-slate-100 font-bold text-slate-900 border-t border-slate-300">
                      <td className="py-1 px-2 text-center font-mono text-blue-900">{cat.posCode}</td>
                      <td colSpan={3} className="py-1 px-2 text-slate-900 font-extrabold">{cat.label}</td>
                      <td className="py-1 px-2 text-right font-mono font-extrabold text-blue-900">
                        {formatCurrency(subtotal)}
                      </td>
                    </tr>

                    {catItems.map((item) => (
                      <tr key={item.id} className="text-slate-700 text-[9.5px] hover:bg-slate-50">
                        <td></td>
                        <td className="py-1 px-2 pl-3">
                          <span className="font-semibold text-slate-900">{item.name}</span>
                          {item.notes && <span className="text-slate-500 text-[8.5px] block">{item.notes}</span>}
                        </td>
                        <td className="py-1 px-2 text-right font-mono">{formatCurrency(item.unitPrice)}</td>
                        <td className="py-1 px-2 text-center font-mono">
                          {item.quantity} {item.unit} {item.daysOrDuration ? `x ${item.daysOrDuration} H` : ''}
                        </td>
                        <td className="py-1 px-2 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(item.totalCost)}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 4: Auto-PO & Audit Trail Side-by-Side (2-Column Grid) */}
      <div className="grid grid-cols-12 gap-2 text-xs pt-0.5">
        {/* Auto-PO Summary - 5 Cols */}
        <div className="col-span-5 space-y-1">
          <h4 className="text-[10px] font-extrabold text-slate-800 uppercase tracking-wider">
            Komitmen Pemesanan Vendor (Auto-PO)
          </h4>
          <div className="space-y-1 text-[9.5px]">
            {purchaseOrders.map((po) => (
              <div key={po.id} className="p-1.5 bg-slate-50 rounded border border-slate-200 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[9px] font-bold text-blue-700">{po.poNumber}</span>
                    <span className="inline-flex items-center justify-center py-0.5 px-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-black text-[7.5px] uppercase leading-none shrink-0 align-middle">{po.status}</span>
                  </div>
                  <p className="font-bold text-slate-800 text-[9.5px] leading-tight">{po.vendorName}</p>
                </div>
                <span className="font-mono font-bold text-emerald-800 text-[10px]">
                  {formatCurrency(po.allocatedAmount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Trail Logs - 7 Cols */}
        <div className="col-span-7 space-y-1">
          <h4 className="text-[10px] font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Audit Trail & Histori Otorisasi</span>
          </h4>
          <div className="rounded border border-slate-300 bg-white overflow-hidden">
            <table className="w-full text-left border-collapse text-[9px]">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold uppercase text-[8.5px]">
                  <th className="py-1 px-1.5">Waktu</th>
                  <th className="py-1 px-1.5">Aktor / Role</th>
                  <th className="py-1 px-1.5">Tindakan Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {project.auditTrail && project.auditTrail.length > 0 ? (
                  project.auditTrail.slice(0, 4).map((log) => (
                    <tr key={log.id} className="text-slate-700 hover:bg-slate-50">
                      <td className="py-1 px-1.5 font-mono text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                      <td className="py-1 px-1.5 font-bold text-slate-900">{log.actorName}</td>
                      <td className="py-1 px-1.5 text-slate-800">{log.action}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-2 px-1.5 text-center text-slate-400 italic">
                      Belum ada catatan log audit.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row 5: Digital Signature Stamps Block */}
      <div className="pt-2 border-t border-slate-300 grid grid-cols-3 gap-3 text-center text-[9.5px]">
        <div className="space-y-0.5">
          <span className="text-[8.5px] font-bold text-slate-500 uppercase block">1. DRAFT DIBUAT (KONSEPTOR)</span>
          <div className="p-1.5 border border-dashed border-blue-300 rounded bg-blue-50/50 flex flex-col justify-center">
            <span className="font-bold text-blue-900 block text-[9.5px]">BUDI RAHARJO</span>
            <span className="text-[8px] text-blue-700 block">Sales Lead / Estimator</span>
            <span className="text-[7.5px] text-slate-400 font-mono block">18/09/2026 - Digital Stamp</span>
          </div>
        </div>

        <div className="space-y-0.5">
          <span className="text-[8.5px] font-bold text-slate-500 uppercase block">2. DIVERIFIKASI (PEMERIKSA)</span>
          <div className="p-1.5 border border-dashed border-amber-300 rounded bg-amber-50/50 flex flex-col justify-center">
            <span className="font-bold text-amber-900 block text-[9.5px]">SISKA AMANDA</span>
            <span className="text-[8px] text-amber-700 block">Finance & Cost Control</span>
            <span className="text-[7.5px] text-slate-400 font-mono block">18/09/2026 - Digital Stamp</span>
          </div>
        </div>

        <div className="space-y-0.5">
          <span className="text-[8.5px] font-bold text-slate-500 uppercase block">3. DISETUJUI (PENYETUJU)</span>
          <div className="p-1.5 border border-emerald-500 rounded bg-emerald-50 flex flex-col justify-center">
            <span className="font-bold text-emerald-900 block text-[9.5px]">DRS. HENDRA WIJAYA, MM</span>
            <span className="text-[8px] text-emerald-700 block">VP Commercial & Director</span>
            <span className="text-[7.5px] text-emerald-600 font-mono block font-bold">18/09/2026 - RAP LOCKED</span>
          </div>
        </div>
      </div>

      {/* Footer Note & Audit Metadata */}
      <div className="text-[9px] text-slate-500 text-center pt-2 border-t border-slate-200 font-mono space-y-0.5">
        <div>
          <strong>METADATA PDF VERIFICATION:</strong> Versi RAP: <strong className="text-slate-800">{rapVersion}</strong> | Ditandai/Dicetak Pada: <strong className="text-slate-800">{pdfGeneratedTimestamp}</strong> | Ref ID: RAP-{project.code}-{rapVersion}
        </div>
        <div className="text-slate-400">
          Dokumen Rencana Anggaran Proyek (RAP) ini dihasilkan secara otomatis oleh TCMS System v2.5. Hak Akses &amp; Otorisasi Sah Berdasarkan Peraturan Bisnis Perusahaan.
        </div>
      </div>

    </div>
  );

  if (!isOpen) {
    return (
      <div className="hidden print:block">
        {renderPrintableDoc()}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto print:static print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden print:max-w-none print:max-h-none print:shadow-none print:border-none print:overflow-visible print:w-full">
        
        {/* Modal Top Bar (Non-printable) */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between gap-3 border-b border-slate-800 print:hidden">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="font-extrabold text-sm text-white">Laporan Resmi Rencana Anggaran Proyek (RAP v1.0)</h3>
              <p className="text-[10px] text-slate-400">Pratinjau Dokumen Resmi Rencana Anggaran Proyek (RAP)</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition shadow-md cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Printer className={`w-3.5 h-3.5 ${isDownloading ? 'animate-bounce' : ''}`} />
              <span>{isDownloading ? 'Menyiapkan PDF...' : 'Download PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer rounded-lg transition"
            >
              Tutup
            </button>
          </div>
        </div>

        {/* Printable Document Content Container */}
        <div className="flex-1 overflow-y-auto print:overflow-visible p-0">
          {renderPrintableDoc()}
        </div>

      </div>
    </div>
  );
};
