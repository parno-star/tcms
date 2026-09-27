import React, { useState } from 'react';
import { generatePdfFromElement } from '../utils/pdfHelper';
import { ProjectOpportunity, PurchaseOrder, UserRole, CostItem, AuditLog } from '../types';
import { formatCurrency } from '../utils/calculator';
import { FileCheck2, Printer, Lock, ShoppingBag, History, ShieldCheck, CheckCircle2, Clock, FileText, Loader2, ChevronDown, FileSpreadsheet, Copy, Sparkles } from 'lucide-react';
import { RapSummaryPdfModal } from './RapSummaryPdfModal';
import { exportRapToCsv } from '../utils/exportHelper';

interface RapAndPoGeneratorProps {
  project: ProjectOpportunity;
  activeRole: UserRole;
  purchaseOrders: PurchaseOrder[];
  costItems: CostItem[];
  onIssuePo: (poId: string) => void;
}

export const RapAndPoGenerator: React.FC<RapAndPoGeneratorProps> = ({
  project,
  activeRole,
  purchaseOrders,
  costItems,
  onIssuePo,
}) => {
  const [selectedPo, setSelectedPo] = useState<PurchaseOrder | null>(null);
  const [isRapPdfOpen, setIsRapPdfOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isLocked = project.status === 'Approved & Locked' || project.rapVersion;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddAuditLog = (action: string) => {
    const newLog: AuditLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleString('id-ID'),
      role: activeRole,
      actorName: 'User',
      action: action,
    };
    if (project.auditTrail) {
      project.auditTrail.unshift(newLog);
    } else {
      project.auditTrail = [newLog];
    }
  };

  const handleExportPoPdf = async (po: PurchaseOrder) => {
    const element = document.getElementById(`po-printable-${po.id}`);
    if (element) {
      handleAddAuditLog(`PO PDF Exported: ${po.poNumber}`);
      await generatePdfFromElement(element, `PO-${po.poNumber}.pdf`);
    }
  };

  const handleExportExcel = () => {
    setIsMenuOpen(false);
    try {
      exportRapToCsv(project, costItems);
      showToast('📊 File Excel/CSV RAP & Biaya HPP Berhasil Diunduh!');
    } catch (e) {
      console.error('Failed to export CSV:', e);
    }
  };

  const handleCopyHash = () => {
    setIsMenuOpen(false);
    const hash = `RAP-VERIFY-HASH-2026-${project.code}-${project.rapVersion || 'v1.0'}-SHA256`;
    navigator.clipboard.writeText(hash);
    showToast('🔑 Hash Verifikasi & Kode Otorisasi Dokumen Berhasil Disalin!');
  };

  return (

    <div className="bg-white rounded-xl shadow-xs border border-slate-300 overflow-hidden relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-teal-800 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-xl border border-teal-700 flex items-center space-x-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 bg-teal-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-teal-700 rounded-lg text-teal-100">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white">
              Penguncian RAP &amp; Pemesanan Vendor (PO)
            </h2>
            <p className="text-xs text-teal-100/80 font-medium">
              Dokumen Rencana Anggaran Resmi &amp; Otomatisasi PO Vendor Mitra
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 relative">
          
          {/* Executive Action Hub Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-600 text-white font-bold rounded-lg text-xs flex items-center space-x-2 shadow-2xs transition cursor-pointer border border-teal-600"
              title="Pusat Ekspor & Otorisasi Laporan RAP"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Ekspor &amp; Otorisasi</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 block">Pilihan Ekspor</span>
                </div>

                <button
                  onClick={handleExportExcel}
                  className="w-full text-left px-3.5 py-2 text-xs text-slate-800 hover:bg-slate-50 font-bold flex items-center space-x-2.5 transition cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="font-bold">Ekspor Excel / CSV</div>
                    <div className="text-[10px] font-medium text-slate-500">Kertas Kerja Audit Finance</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsRapPdfOpen(true);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-slate-800 hover:bg-slate-50 font-bold flex items-center space-x-2.5 transition cursor-pointer border-t border-slate-100"
                >
                  <FileText className="w-4 h-4 text-teal-700" />
                  <div>
                    <div className="font-bold">Pratinjau PDF Resmi</div>
                    <div className="text-[10px] font-medium text-slate-500">Format Resmi PT CPE</div>
                  </div>
                </button>

                <button
                  onClick={handleCopyHash}
                  className="w-full text-left px-3.5 py-2 text-xs text-slate-800 hover:bg-slate-50 font-bold flex items-center space-x-2.5 transition cursor-pointer border-t border-slate-100"
                >
                  <Copy className="w-4 h-4 text-purple-600" />
                  <div>
                    <div className="font-bold">Salin Hash Otorisasi</div>
                    <div className="text-[10px] font-medium text-slate-500">Kode Hash Otentikasi RAP</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          <span className={`inline-flex items-center justify-center text-xs font-bold px-2.5 py-1 rounded border leading-none ${
            isLocked
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            {isLocked ? `RAP Locked ${project.rapVersion || 'v1.0'}` : 'RAP Pending'}
          </span>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Col: Auto PO List (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
              <ShoppingBag className="w-4 h-4 text-teal-700" />
              <span>Surat Pemesanan Otomatis (Auto-PO)</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">3 Vendor</span>
          </div>

          <div className="space-y-2.5">
            {purchaseOrders.map((po) => {
              return (
                <div
                  key={po.id}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold font-mono text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {po.poNumber}
                      </span>
                      <span className="text-xs font-bold text-slate-800">{po.vendorCategory}</span>
                      <span className="text-[10px] font-mono text-slate-600 px-2 py-0.5 bg-slate-200 rounded font-medium">
                        {po.posCode}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-700">{po.vendorName}</p>
                    
                    <ul className="text-[11px] text-slate-500 list-disc list-inside font-medium">
                      {po.items.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Alokasi Anggaran</span>
                      <span className="text-xs sm:text-sm font-bold font-mono text-teal-800">
                        {formatCurrency(po.allocatedAmount)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedPo(po)}
                        className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-medium transition cursor-pointer flex items-center space-x-1"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        <span>Detail PO</span>
                      </button>

                      {po.status === 'Draft' && (
                        <button
                          onClick={() => onIssuePo(po.id)}
                          disabled={!isLocked}
                          className="px-2.5 py-1 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer disabled:opacity-40"
                          title={!isLocked ? 'Kunci RAP terlebih dahulu untuk menerbitkan PO' : ''}
                        >
                          Terbit PO
                        </button>
                      )}

                      {po.status === 'Issued' && (
                        <span className="inline-flex items-center justify-center text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-200 leading-none">
                          PO Terbit
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Jejak Audit Governance (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="flex items-center space-x-2 pb-2.5 border-b border-slate-200 mb-3">
            <History className="w-4 h-4 text-teal-700" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Audit Trail Governance
            </h3>
          </div>

          <div className="space-y-3">
            {project.auditTrail.map((log) => (
              <div key={log.id} className="relative pl-5 pb-2 border-l-2 border-slate-200 last:border-0">
                <div className="absolute -left-[7px] top-0 w-3.5 h-3.5 rounded-full bg-teal-700 ring-2 ring-slate-100 flex items-center justify-center text-white text-[7px] font-bold">
                  ✓
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-0.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-slate-700">{log.actorName}</span>
                    <span className="text-slate-400 font-mono">{log.timestamp}</span>
                  </div>

                  <p className="text-xs text-slate-700">{log.action}</p>

                  {log.statusBadge && (
                    <span className="inline-block text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {log.statusBadge}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* PO Print Modal */}
      {selectedPo && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden">
            <div className="bg-teal-800 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Printer className="w-4 h-4 text-teal-200" />
                <h3 className="font-bold text-sm">Dokumen Purchase Order (PO) Resmi</h3>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleExportPoPdf(selectedPo)}
                  className="px-3 py-1.5 bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs rounded-lg transition shadow-2xs cursor-pointer flex items-center space-x-1.5 border border-teal-600"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => setSelectedPo(null)}
                  className="text-teal-200 hover:text-white text-lg font-bold cursor-pointer"
                >
                  ×
                </button>
              </div>
            </div>

            <div id={`po-printable-${selectedPo.id}`} className="p-6 space-y-4 font-sans">
              <div className="border-b border-slate-200 pb-4 flex justify-between items-start">
                <div>
                  <h4 className="text-base font-bold text-slate-900">PURCHASE ORDER (PO)</h4>
                  <p className="text-xs font-mono text-teal-800 font-bold">{selectedPo.poNumber}</p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Tanggal: 18 September 2026</p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-700 block">Diterbitkan Untuk:</span>
                  <p className="text-sm font-bold text-slate-900">{selectedPo.vendorName}</p>
                  <span className="text-xs text-slate-500 font-medium">{selectedPo.vendorCategory}</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800">Rincian Item:</span>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <ul className="text-xs text-slate-700 space-y-1 font-medium">
                    {selectedPo.items.map((it, idx) => (
                      <li key={idx} className="flex justify-between border-b border-slate-200/60 pb-1 last:border-0">
                        <span>{it}</span>
                        <span className="font-bold font-mono text-slate-800">{formatCurrency(selectedPo.allocatedAmount / selectedPo.items.length)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-teal-50/50 p-4 rounded-lg border border-teal-200 flex justify-between items-center">
                <span className="text-xs font-bold text-teal-900 uppercase">Total Komitmen PO:</span>
                <span className="text-base font-bold font-mono text-teal-900">
                  {formatCurrency(selectedPo.allocatedAmount)}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 font-medium">
                <span>PT CIPTA PERDANA ENTERPRISE — Dokumen Sah Terkunci</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RAP Summary PDF Report Modal */}
      <RapSummaryPdfModal
        isOpen={isRapPdfOpen}
        onClose={() => setIsRapPdfOpen(false)}
        project={project}
        costItems={costItems}
        purchaseOrders={purchaseOrders}
      />

    </div>
  );
};
